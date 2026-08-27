"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    ChevronDown,
    Leaf,
    RotateCcw,
    ShieldAlert,
    Sparkles,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    candidateLabel,
    checkHealth,
    diagnose,
    fetchInsight,
    DiagnosisError,
    type DiagnosisResult,
} from "@/lib/diagnosis";

const SAMPLES = [
    { src: "/samples/corn.jpg", label: "Corn leaf" },
    { src: "/samples/tomato.jpg", label: "Tomato leaf" },
    { src: "/samples/potato.jpg", label: "Potato leaf" },
    { src: "/samples/not-a-leaf.jpg", label: "Not a leaf" },
];

/** Copy for each honesty state. The engine decides which one it earned. */
const STATES = {
    diagnosed: {
        eyebrow: "Diagnosis",
        tone: "text-[var(--olive)]",
        rule: "bg-[var(--olive)]",
    },
    uncertain: {
        eyebrow: "Low confidence",
        tone: "text-amber-600",
        rule: "bg-amber-500",
    },
    unrecognised: {
        eyebrow: "Cannot read this image",
        tone: "text-[var(--ink-soft)]",
        rule: "bg-[var(--hairline-strong)]",
    },
} as const;

type Phase = "idle" | "analysing" | "done";

export default function DemoPage() {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [phase, setPhase] = useState<Phase>("idle");
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [backend, setBackend] = useState<"checking" | "online" | "offline">("checking");
    const [provider, setProvider] = useState<string | null>(null);
    const [isTouch, setIsTouch] = useState(false);

    const [insight, setInsight] = useState<string | null>(null);
    const [insightError, setInsightError] = useState<string | null>(null);
    const [insightLoading, setInsightLoading] = useState(false);
    const [insightOpen, setInsightOpen] = useState(false);
    const [showAllProbs, setShowAllProbs] = useState(false);

    const fileInput = useRef<HTMLInputElement>(null);
    const cameraInput = useRef<HTMLInputElement>(null);
    const objectUrl = useRef<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = new AbortController();
        checkHealth(controller.signal).then(({ online, provider }) => {
            setBackend(online ? "online" : "offline");
            setProvider(provider ?? null);
        });
        return () => controller.abort();
    }, []);

    // Only offer a camera button where a camera actually exists.
    useEffect(() => {
        setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }, []);

    useEffect(() => {
        return () => {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        };
    }, []);

    const reset = useCallback(() => {
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = null;
        setPreviewUrl(null);
        setFile(null);
        setResult(null);
        setPhase("idle");
        setInsight(null);
        setInsightError(null);
        setInsightOpen(false);
        setShowAllProbs(false);
    }, []);

    const run = useCallback(async (target: File) => {
        setPhase("analysing");
        setResult(null);
        setInsight(null);
        setInsightError(null);
        setInsightOpen(false);
        setShowAllProbs(false);

        try {
            const data = await diagnose(target);
            setResult(data);
            setPhase("done");
            setBackend("online");
            requestAnimationFrame(() =>
                resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
            );
        } catch (e) {
            setPhase("idle");
            if (e instanceof DiagnosisError) {
                if (e.kind === "network") setBackend("offline");
                toast.error(e.message);
            } else {
                toast.error("Analysis failed unexpectedly.");
            }
        }
    }, []);

    const accept = useCallback(
        (next: File) => {
            if (!next.type.startsWith("image/")) {
                toast.error("That file is not an image.");
                return;
            }
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            const url = URL.createObjectURL(next);
            objectUrl.current = url;

            setPreviewUrl(url);
            setFile(next);
            setResult(null);
            setInsight(null);
            setInsightError(null);
            void run(next); // One gesture, one answer. No second button to press.
        },
        [run]
    );

    const loadSample = useCallback(
        async (src: string, label: string) => {
            try {
                const res = await fetch(src);
                const blob = await res.blob();
                accept(new File([blob], `${label}.jpg`, { type: blob.type || "image/jpeg" }));
            } catch {
                toast.error("Could not load that sample.");
            }
        },
        [accept]
    );

    const loadInsight = useCallback(async () => {
        if (!result) return;
        setInsightOpen(true);
        if (insight || insightLoading) return;

        setInsightLoading(true);
        setInsightError(null);
        try {
            setInsight(await fetchInsight(result));
        } catch (e) {
            setInsightError((e as Error).message || "Could not generate guidance.");
        } finally {
            setInsightLoading(false);
        }
    }, [result, insight, insightLoading]);

    const openPicker = () => fileInput.current?.click();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ background: "rgba(250,250,250,0.85)" }}>
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                        <span>Back</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <Logo size={26} />
                        <span className="font-display text-lg font-medium tracking-[-0.02em]">Apollo</span>
                    </div>
                    <div className="w-[60px]" />
                </div>
            </nav>

            <main className="pt-28 pb-28 px-6 max-w-5xl mx-auto">
                <header className="max-w-2xl">
                    <h1 className="font-display text-5xl md:text-6xl tracking-[-0.02em] leading-[1.02]">
                        Read a leaf.
                    </h1>
                    <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                        Photograph a single leaf. Apollo returns the crop, the condition, and how far
                        it trusts its own answer. When the image is outside what it can read, it says so
                        rather than guessing.
                    </p>
                </header>

                {/* Hidden inputs: one for the picker, one that opens the rear camera. */}
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && accept(e.target.files[0])}
                />
                <input
                    ref={cameraInput}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && accept(e.target.files[0])}
                />

                <div className="mt-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-start">
                    {/* ---------------- Capture ---------------- */}
                    <section className="lg:sticky lg:top-28 space-y-4">
                        {previewUrl ? (
                            <figure className="space-y-3">
                                <div className="relative aspect-square w-full overflow-hidden border border-[var(--hairline)] bg-card">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="The crop image being analysed" className="w-full h-full object-cover" />
                                    {phase === "analysing" && <ScanOverlay />}
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs text-muted-foreground truncate">{file?.name}</p>
                                    <button
                                        type="button"
                                        onClick={reset}
                                        className="text-xs inline-flex items-center gap-1.5 text-muted-foreground hover:text-[var(--olive)] transition-colors shrink-0"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} /> Start over
                                    </button>
                                </div>
                            </figure>
                        ) : (
                            <div
                                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    const dropped = e.dataTransfer.files?.[0];
                                    if (dropped) accept(dropped);
                                }}
                            >
                                {/* A real button, so it is reachable by keyboard and announced correctly. */}
                                <button
                                    type="button"
                                    onClick={openPicker}
                                    className={cn(
                                        "w-full border border-dashed p-8 transition-colors text-center",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--olive)] focus-visible:ring-offset-2",
                                        dragActive
                                            ? "border-[var(--olive)] bg-[var(--secondary)]"
                                            : "border-[var(--hairline-strong)] hover:border-[var(--olive)]"
                                    )}
                                >
                                    <span className="flex flex-col items-center justify-center py-10">
                                        <span className="w-14 h-14 rounded-full border border-[var(--hairline)] flex items-center justify-center mb-4">
                                            <Upload className="w-6 h-6 text-[var(--olive)]" strokeWidth={1.5} />
                                        </span>
                                        <span className="font-medium text-foreground">Drop a photo, or choose a file</span>
                                        <span className="text-sm text-muted-foreground mt-1">JPG or PNG. Resized in your browser before upload.</span>
                                    </span>
                                </button>

                                {isTouch && (
                                    <Button
                                        size="lg"
                                        className="w-full mt-3 rounded-none py-6 text-base bg-[var(--ink)] hover:bg-[var(--olive)] text-[var(--bg)]"
                                        onClick={() => cameraInput.current?.click()}
                                    >
                                        <Camera className="mr-2 h-5 w-5" strokeWidth={1.5} /> Take a photo
                                    </Button>
                                )}

                                <div className="mt-6">
                                    <p className="font-label text-muted-foreground mb-3">Or try one</p>
                                    <ul className="grid grid-cols-4 gap-2">
                                        {SAMPLES.map((s) => (
                                            <li key={s.src}>
                                                <button
                                                    type="button"
                                                    onClick={() => loadSample(s.src, s.label)}
                                                    className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--olive)]"
                                                >
                                                    <span className="block relative aspect-square overflow-hidden border border-[var(--hairline)] group-hover:border-[var(--olive)] transition-colors">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={s.src} alt="" className="w-full h-full object-cover" />
                                                    </span>
                                                    <span className="block mt-1.5 text-[11px] leading-tight text-muted-foreground group-hover:text-[var(--olive)] transition-colors">
                                                        {s.label}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <ConnectionRow backend={backend} provider={provider} />
                    </section>

                    {/* ---------------- Result ---------------- */}
                    <section ref={resultRef} aria-live="polite" className="min-h-[22rem]">
                        {phase === "idle" && !result && <EmptyState />}
                        {phase === "analysing" && <Analysing />}
                        {phase === "done" && result && (
                            <ResultPanel
                                result={result}
                                showAllProbs={showAllProbs}
                                onToggleProbs={() => setShowAllProbs((v) => !v)}
                                insight={insight}
                                insightError={insightError}
                                insightLoading={insightLoading}
                                insightOpen={insightOpen}
                                onInsight={loadInsight}
                            />
                        )}
                    </section>
                </div>

                <GoodPhotoGuide />
                <BuildNotes />
            </main>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

function ScanOverlay() {
    return (
        <div className="absolute inset-0 bg-[var(--ink)]/10">
            <div className="absolute inset-x-0 h-px bg-[var(--olive)] shadow-[0_0_12px_var(--olive)] animate-[scanline_1.6s_ease-in-out_infinite]" />
        </div>
    );
}

function ConnectionRow({ backend, provider }: { backend: string; provider: string | null }) {
    return (
        <div className="flex items-center justify-between text-xs pt-1">
            {backend === "online" ? (
                <span className="text-[var(--olive)] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" /> Engine connected
                </span>
            ) : backend === "offline" ? (
                <span className="text-red-600 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Engine offline
                </span>
            ) : (
                <span className="text-muted-foreground">Checking engine…</span>
            )}
            {provider && <span className="font-label text-muted-foreground">{provider}</span>}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="h-full min-h-[22rem] flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-[var(--hairline)]">
            <Leaf className="w-10 h-10 mb-4 opacity-20" strokeWidth={1.5} />
            <p className="text-sm">The reading appears here.</p>
        </div>
    );
}

function Analysing() {
    // Inference takes about a second. Two lines at 700ms is the whole story;
    // the old six-message rotation at 4.5s only ever showed its first entry.
    const [line, setLine] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setLine((n) => (n + 1) % 2), 700);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="h-full min-h-[22rem] flex flex-col items-center justify-center p-8 text-center space-y-5">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border border-[var(--hairline)]" />
                <div className="absolute inset-0 border border-transparent border-t-[var(--olive)] rounded-full animate-spin" />
            </div>
            <p className="font-display text-xl tracking-[-0.01em]">
                {line === 0 ? "Reading the leaf…" : "Weighing the evidence…"}
            </p>
        </div>
    );
}

function ResultPanel({
    result,
    showAllProbs,
    onToggleProbs,
    insight,
    insightError,
    insightLoading,
    insightOpen,
    onInsight,
}: {
    result: DiagnosisResult;
    showAllProbs: boolean;
    onToggleProbs: () => void;
    insight: string | null;
    insightError: string | null;
    insightLoading: boolean;
    insightOpen: boolean;
    onInsight: () => void;
}) {
    const state = STATES[result.status];
    const unreadable = result.status === "unrecognised";
    const top = result.candidates[0];

    return (
        <div className="border border-[var(--hairline)] bg-card animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className={cn("h-0.5 w-full", state.rule)} />

            <div className="p-6 md:p-8 space-y-7">
                <div>
                    <p className={cn("font-label mb-2", state.tone)}>{state.eyebrow}</p>

                    {unreadable ? (
                        <>
                            <h2 className="font-display text-3xl tracking-[-0.02em] leading-tight">
                                This isn&apos;t a leaf Apollo can read.
                            </h2>
                            <p className="mt-3 text-muted-foreground leading-relaxed">
                                The model was trained on single detached leaves photographed against a plain
                                background. This image sits outside that, so any condition it named would be
                                invented. Try a close photo of one leaf filling the frame.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    {top?.crop && (
                                        <p className="text-sm text-muted-foreground mb-1">{top.crop}</p>
                                    )}
                                    <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] leading-tight flex items-center gap-2.5">
                                        {result.is_healthy && (
                                            <CheckCircle2 className="w-6 h-6 text-[var(--olive)] shrink-0" strokeWidth={1.5} />
                                        )}
                                        {top?.condition}
                                    </h2>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-label text-muted-foreground mb-1">Confidence</p>
                                    <p className="font-display text-3xl tracking-[-0.02em]">
                                        {(result.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {result.status === "uncertain" && (
                                <p className="mt-4 flex gap-2.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3.5 leading-relaxed">
                                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                                    <span>
                                        The evidence here is thin. Treat this as a hint worth checking, not a
                                        diagnosis worth spraying on.
                                    </span>
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Candidates. Hidden by default when the engine refused, so a
                    rejected answer is never the first thing anyone reads. */}
                {result.candidates.length > 0 && (
                    <div className="border-t border-[var(--hairline)] pt-6">
                        {unreadable ? (
                            <button
                                type="button"
                                onClick={onToggleProbs}
                                className="font-label text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                            >
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showAllProbs && "rotate-180")} strokeWidth={1.5} />
                                {showAllProbs ? "Hide" : "Show"} what it guessed anyway
                            </button>
                        ) : (
                            <p className="font-label text-muted-foreground">Also considered</p>
                        )}

                        {(!unreadable || showAllProbs) && (
                            <ul className="space-y-2.5 mt-4">
                                {result.candidates.map((c) => (
                                    <li key={c.raw_label} className="flex items-center justify-between gap-4 text-sm">
                                        <span className={cn(unreadable && "text-muted-foreground")}>
                                            {candidateLabel(c)}
                                        </span>
                                        <span className="flex items-center gap-3 shrink-0">
                                            <span className="w-20 md:w-28 h-1 bg-[var(--hairline)] overflow-hidden">
                                                <span
                                                    className={cn(
                                                        "block h-full",
                                                        unreadable ? "bg-[var(--hairline-strong)]" : c.is_healthy ? "bg-[var(--olive)]" : "bg-[var(--ink)]"
                                                    )}
                                                    style={{ width: `${Math.max(c.probability * 100, 1.5)}%` }}
                                                />
                                            </span>
                                            <span className="font-mono text-xs text-muted-foreground w-12 text-right">
                                                {(c.probability * 100).toFixed(1)}%
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Why the engine landed where it did. */}
                {typeof result.signals.energy === "number" && (
                    <p className="font-label text-muted-foreground border-t border-[var(--hairline)] pt-5 leading-relaxed">
                        Evidence score {result.signals.energy}
                        {result.signals.thresholds && ` · reads a leaf above ${result.signals.thresholds.confident}`}
                        {typeof result.signals.view_agreement === "number" &&
                            ` · agrees with itself on ${(result.signals.view_agreement * 100).toFixed(0)}% of views`}
                    </p>
                )}

                {!unreadable && (
                    <div className="border-t border-[var(--hairline)] pt-6">
                        {!insightOpen ? (
                            <Button
                                variant="outline"
                                className="w-full gap-2 rounded-none border-[var(--hairline-strong)] hover:border-[var(--olive)] hover:text-[var(--olive)]"
                                onClick={onInsight}
                            >
                                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                                What should I do about it?
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <p className="font-label text-[var(--olive)] inline-flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} /> Agronomic guidance
                                </p>
                                {insightLoading && (
                                    <p className="text-sm text-muted-foreground animate-pulse">Writing guidance…</p>
                                )}
                                {insightError && (
                                    <div className="text-sm space-y-2">
                                        <p className="text-red-600">{insightError}</p>
                                        <button type="button" onClick={onInsight} className="text-muted-foreground hover:text-[var(--olive)] underline underline-offset-4">
                                            Try again
                                        </button>
                                    </div>
                                )}
                                {insight && (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function GoodPhotoGuide() {
    const rules = [
        { title: "One leaf, not a field", body: "The model reads a single leaf. An aerial shot of rows gives it nothing to focus on." },
        { title: "Fill the frame", body: "Hold the leaf close enough that it covers most of the picture. Detail is what carries the diagnosis." },
        { title: "Plain background", body: "A hand, a sheet of paper, bare soil. Clutter behind the leaf pulls the prediction around." },
        { title: "Even daylight", body: "Open shade beats direct sun. Hard shadows read as lesions that are not there." },
    ];

    return (
        <section className="mt-28 border-t border-[var(--hairline)] pt-14">
            <h2 className="font-display text-3xl tracking-[-0.02em]">What makes a readable photo</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
                Accuracy in the field is mostly a photography problem. Four habits carry most of it.
            </p>
            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {rules.map((r, i) => (
                    <li key={r.title}>
                        <p className="font-mono text-xs text-[var(--olive)] mb-3">{String(i + 1).padStart(2, "0")}</p>
                        <h3 className="font-display text-lg tracking-[-0.01em] mb-2">{r.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}

function BuildNotes() {
    return (
        <section className="mt-28 border-t border-[var(--hairline)] pt-14 grid md:grid-cols-2 gap-10 items-start">
            <div className="relative aspect-video w-full overflow-hidden border border-[var(--hairline)] bg-black">
                <iframe
                    src="https://www.loom.com/embed/8413cd210cb64dd1837e6442341f00a6?sid=93b8273a-6859-4670-b74a-25d259521740"
                    title="Apollo walkthrough"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                />
            </div>
            <div className="space-y-5 leading-relaxed">
                <h2 className="font-display text-2xl tracking-[-0.01em]">How it&apos;s built</h2>
                <p className="text-muted-foreground">
                    A <span className="text-foreground">ResNet-18</span> classifier trained on{" "}
                    <span className="text-foreground">PlantVillage</span>, 70k+ images across 38 leaf
                    conditions, exported to ONNX.
                </p>
                <p className="text-muted-foreground">
                    That corpus is lab photography, so the network has never seen a tractor or a sky. Rather
                    than let it force those into one of 38 diseases, Apollo scores the strength of the
                    evidence behind each prediction and declines the ones it cannot support.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                    {["ResNet-18", "PlantVillage 70k+", "ONNX Runtime", "Energy-based rejection", "Telegram bot"].map((t) => (
                        <span key={t} className="px-2.5 py-1 border border-[var(--hairline)] text-xs text-muted-foreground">
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
