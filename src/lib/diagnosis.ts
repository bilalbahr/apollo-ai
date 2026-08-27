/**
 * Client for the Apollo diagnosis API.
 *
 * The engine behind this is swappable server-side (local ONNX today, a hosted
 * crop-health API later), so everything here speaks the normalised shape and
 * never assumes which model answered.
 */

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ??
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

const endpoint = (path: string) => `${API_BASE}/api${path}`;

/** How much the engine trusts its own answer. */
export type DiagnosisStatus = "diagnosed" | "uncertain" | "unrecognised";

export interface Candidate {
    crop: string;
    condition: string;
    probability: number;
    raw_label: string;
    is_healthy: boolean;
}

export interface DiagnosisSignals {
    energy?: number;
    view_agreement?: number;
    thresholds?: { confident: number; uncertain: number };
    source?: string;
}

export interface DiagnosisResult {
    status: DiagnosisStatus;
    provider: string;
    crop: string | null;
    condition: string | null;
    is_healthy: boolean | null;
    confidence: number;
    candidates: Candidate[];
    signals: DiagnosisSignals;
    advice: string | null;
}

export interface HealthState {
    online: boolean;
    provider?: string | null;
}

export class DiagnosisError extends Error {
    constructor(message: string, readonly kind: "network" | "too-large" | "server") {
        super(message);
        this.name = "DiagnosisError";
    }
}

export async function checkHealth(signal?: AbortSignal): Promise<HealthState> {
    try {
        const res = await fetch(endpoint("/health"), { signal });
        // A 500 is a reachable server, not a working one. The old check
        // treated any response at all as "connected".
        if (!res.ok) return { online: false };
        const body = await res.json();
        return { online: body.status === "ok", provider: body.provider };
    } catch {
        return { online: false };
    }
}

/**
 * Shrink an image in the browser before uploading.
 *
 * Phone cameras produce 4-12MB frames. Vercel rejects request bodies over
 * 4.5MB, and on a rural connection the upload is the slowest part of the whole
 * diagnosis by an order of magnitude. Longest side 1024px at JPEG 0.85 lands
 * around 150-300KB, keeps enough detail for a hosted API that wants full
 * resolution, and is far above the 256px the local model reads.
 */
export async function prepareImage(file: File, maxEdge = 1024): Promise<Blob> {
    if (typeof createImageBitmap !== "function") return file;

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file; // Unsupported codec: let the server decide.
    }

    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_000_000) {
        bitmap.close();
        return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        bitmap.close();
        return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    return blob ?? file;
}

export async function diagnose(file: File, signal?: AbortSignal): Promise<DiagnosisResult> {
    const prepared = await prepareImage(file);

    const body = new FormData();
    body.append("file", prepared, "crop.jpg");

    let res: Response;
    try {
        res = await fetch(endpoint("/predict"), { method: "POST", body, signal });
    } catch (e) {
        if ((e as Error).name === "AbortError") throw e;
        throw new DiagnosisError("Could not reach the analysis server.", "network");
    }

    if (res.status === 413) {
        throw new DiagnosisError("That image is too large for the server.", "too-large");
    }
    if (!res.ok) {
        throw new DiagnosisError(`The server returned ${res.status}.`, "server");
    }

    return res.json();
}

export async function fetchInsight(
    result: DiagnosisResult,
    signal?: AbortSignal
): Promise<string> {
    const top = result.candidates.slice(0, 3).map(
        (c) => `${[c.crop, c.condition].filter(Boolean).join(" ")} (${(c.probability * 100).toFixed(1)}%)`
    );

    const res = await fetch(endpoint("/analyze-text"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            class_name: [result.crop, result.condition].filter(Boolean).join(" "),
            confidence: result.confidence,
            top_probs: top,
        }),
        signal,
    });

    if (!res.ok) throw new Error(`Insight request failed (${res.status}).`);
    const body = await res.json();
    if (!body.report) throw new Error("No insight returned.");
    return body.report;
}

/** Display name for a candidate: "Corn (maize) · Common rust". */
export function candidateLabel(c: Pick<Candidate, "crop" | "condition">): string {
    return [c.crop, c.condition].filter(Boolean).join(" · ");
}
