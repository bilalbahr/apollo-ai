"use client";

import { useEffect, useRef } from "react";

// Renders a word as pointillism: the glyph shapes are sampled and filled
// with many small dots. The letters are ink; the trailing period is a
// denser cluster of brand greens.
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

        const inkTones = ["#1b1c17", "#1b1c17", "#1b1c17", "#26271d", "#3a3f24"];
        const greenTones = ["#7e951c", "#8aa033", "#5d6f14", "#9bb33a", "#6f8a2c"];

        const render = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const cw = wrap.clientWidth;
            if (!cw) return;

            const full = text + ".";

            // Pick a font size that fits the container width
            let fontSize = Math.min(cw * 0.235, 280);
            ctx.font = `600 ${fontSize}px ${family}`;
            const fullW = ctx.measureText(full).width;
            if (fullW > cw * 0.98) fontSize = (fontSize * cw * 0.98) / fullW;

            const ch = Math.ceil(fontSize * 1.18);

            canvas.style.width = `${cw}px`;
            canvas.style.height = `${ch}px`;
            canvas.width = Math.floor(cw * dpr);
            canvas.height = Math.floor(ch * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, cw, ch);

            // Draw the text once so we can sample its silhouette
            ctx.font = `600 ${fontSize}px ${family}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
            const baseline = fontSize * 0.92;
            const wordW = ctx.measureText(text).width;

            ctx.fillStyle = "#000";
            ctx.fillText(full, 0, baseline);

            const W = canvas.width;
            const H = canvas.height;
            const img = ctx.getImageData(0, 0, W, H).data;

            ctx.clearRect(0, 0, cw, ch);

            const step = Math.max(4, Math.round(fontSize * 0.03));

            for (let y = 0; y < ch; y += step) {
                for (let x = 0; x < cw; x += step) {
                    const sx = x + (Math.random() - 0.5) * step;
                    const sy = y + (Math.random() - 0.5) * step;
                    const px = Math.floor(sx * dpr);
                    const py = Math.floor(sy * dpr);
                    if (px < 0 || py < 0 || px >= W || py >= H) continue;

                    const alpha = img[(py * W + px) * 4 + 3];
                    if (alpha < 90) continue;

                    const isPeriod = sx >= wordW + 2;

                    let color: string;
                    if (isPeriod) {
                        color = greenTones[(Math.random() * greenTones.length) | 0];
                    } else {
                        const r = Math.random();
                        color = r < 0.06 ? greenTones[(Math.random() * greenTones.length) | 0]
                            : inkTones[(Math.random() * inkTones.length) | 0];
                    }

                    const radius = step * 0.42 * (0.65 + Math.random() * 0.7);
                    ctx.beginPath();
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.72 + Math.random() * 0.28;
                    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        };

        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => mounted && render());
        };

        // Render now (fallback font) and again once the display font is ready
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
