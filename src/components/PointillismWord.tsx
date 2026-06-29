"use client";

import { useEffect, useRef } from "react";

// Renders a word as a field of tiny plants: the glyph silhouette is sampled
// and each filled point grows a small sprout (stem + leaves) in brand greens.
// The trailing period becomes a denser little bush with a few blossoms.
export default function PointillismWord({
    text = "Apollo",
    className = "",
}: {
    text?: string;
    className?: string;
}) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let raf = 0;
        let mounted = true;

        const family =
            getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() ||
            "ui-serif, Georgia, serif";

        // Warm field-green palette, biased toward readable mid/dark tones
        const leafGreens = ["#5d6f14", "#6f8a2c", "#7e951c", "#4d5f16", "#8aa033", "#566b1a", "#9bb33a"];
        const stemGreens = ["#48591a", "#3f5212", "#54671c"];
        const blossom = ["#e7c24a", "#eed98a", "#f0e3b0"];

        const pick = (a: string[]) => a[(Math.random() * a.length) | 0];

        // An almond leaf pointing along +x, rotated by `angle`
        const leaf = (x: number, y: number, len: number, angle: number, color: string) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(len * 0.45, -len * 0.32, len, 0);
            ctx.quadraticCurveTo(len * 0.45, len * 0.32, 0, 0);
            ctx.fill();
            ctx.restore();
        };

        // A small plant: short slightly-swaying stem with a few leaves and a tip
        const plant = (baseX: number, baseY: number, h: number, isPeriod: boolean) => {
            const tilt = (Math.random() - 0.5) * 0.5;
            const sway = (Math.random() - 0.5) * h * 0.22;
            const topX = baseX + sway + Math.sin(tilt) * h * 0.25;
            const topY = baseY - h;

            ctx.globalAlpha = 0.8 + Math.random() * 0.2;

            // stem
            ctx.strokeStyle = pick(stemGreens);
            ctx.lineWidth = Math.max(0.7, h * 0.07);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.quadraticCurveTo(baseX + sway * 1.4, baseY - h * 0.5, topX, topY);
            ctx.stroke();

            // leaves along the stem, alternating sides
            const leaves = 2 + (Math.random() < 0.55 ? 1 : 0);
            for (let i = 0; i < leaves; i++) {
                const t = 0.3 + (i / leaves) * 0.6;
                const lx = baseX + sway * 1.4 * t * (1 - t) * 4 + (topX - baseX) * t;
                const ly = baseY - h * t;
                const side = i % 2 === 0 ? 1 : -1;
                const angle = side * (0.5 + Math.random() * 0.5) - Math.PI / 2 * 0 + (side > 0 ? 0 : Math.PI);
                leaf(lx, ly, h * (0.4 + Math.random() * 0.18), angle, pick(leafGreens));
            }

            // tip
            leaf(topX, topY, h * 0.34, -Math.PI / 2 + tilt, pick(leafGreens));

            // occasional blossom on the period bush
            if (isPeriod && Math.random() < 0.25) {
                ctx.globalAlpha = 0.95;
                ctx.fillStyle = pick(blossom);
                ctx.beginPath();
                ctx.arc(topX, topY, Math.max(1, h * 0.12), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        };

        const render = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cw = wrap.clientWidth;
            if (!cw) return;

            const full = text + ".";

            let fontSize = Math.min(cw * 0.235, 280);
            ctx.font = `600 ${fontSize}px ${family}`;
            const fullW = ctx.measureText(full).width;
            if (fullW > cw * 0.98) fontSize = (fontSize * cw * 0.98) / fullW;

            const step = Math.max(5, Math.round(fontSize * 0.04));
            const topPad = Math.ceil(step * 2.4);
            const baseline = topPad + fontSize * 0.92;
            const ch = topPad + Math.ceil(fontSize * 1.2);

            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
            canvas.width = Math.floor(cw * dpr);
            canvas.height = Math.floor(ch * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cw, ch);

            // Sample the glyph silhouette
            ctx.font = `600 ${fontSize}px ${family}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            const wordW = ctx.measureText(text).width;
            ctx.fillStyle = "#000";
            ctx.fillText(full, 0, baseline);

            const W = canvas.width;
            const H = canvas.height;
            const img = ctx.getImageData(0, 0, W, H).data;

            ctx.clearRect(0, 0, cw, ch);
            ctx.lineJoin = "round";

            // Collect points first, then draw top→bottom for natural overlap/depth
            const pts: { x: number; y: number; period: boolean }[] = [];
            for (let y = 0; y < ch; y += step) {
                for (let x = 0; x < cw; x += step) {
                    const sx = x + (Math.random() - 0.5) * step;
                    const sy = y + (Math.random() - 0.5) * step;
                    const px = Math.floor(sx * dpr);
                    const py = Math.floor(sy * dpr);
                    if (px < 0 || py < 0 || px >= W || py >= H) continue;
                    if (img[(py * W + px) * 4 + 3] < 90) continue;
                    pts.push({ x: sx, y: sy, period: sx >= wordW + 2 });
                }
            }
            pts.sort((a, b) => a.y - b.y);

            for (const p of pts) {
                const h = step * (1.3 + Math.random() * 0.7);
                plant(p.x, p.y + h * 0.3, h, p.period);
            }
        };

        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => mounted && render());
        };

        render();
        if (document.fonts?.ready) document.fonts.ready.then(() => mounted && render());

        const ro = new ResizeObserver(schedule);
        ro.observe(wrap);

        return () => {
            mounted = false;
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [text]);

    return (
        <div ref={wrapRef} className={className} role="img" aria-label={text}>
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
