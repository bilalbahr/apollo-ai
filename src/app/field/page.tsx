"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const DroneScanner3D = lazy(() =>
    import("@/components/DroneScanner3D").then(mod => ({ default: mod.DroneScanner3D }))
);

export default function FieldPage() {
    /* Brief mono intro, then the simulation */
    const [entered, setEntered] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setEntered(true), 1400);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="fixed inset-0 bg-background overflow-hidden">
            {/* Entry veil */}
            <motion.div
                className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center gap-6"
                animate={{ opacity: entered ? 0 : 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ pointerEvents: entered ? "none" : "auto" }}
            >
                <Image src="/apollologo.png" alt="Apollo" width={64} height={64} className="w-16 h-16" />
                <p className="font-label text-muted-foreground">Initializing field simulation</p>
            </motion.div>

            <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <p className="font-label text-muted-foreground">Loading terrain</p>
                </div>
            }>
                <DroneScanner3D interactive showHud />
            </Suspense>

            {/* Top bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: entered ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-0 left-0 right-0 z-40 h-16 px-6 md:px-10 flex items-center justify-between text-sm"
            >
                <Link href="/" className="ulink text-muted-foreground hover:text-foreground">Back</Link>
                <p className="font-label text-muted-foreground hidden sm:block">Field simulation</p>
                <Link href="/demo" className="ulink">Demo</Link>
            </motion.div>

            {/* Bottom-left: title + instructions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : 10 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="absolute bottom-8 left-6 md:left-10 z-40 pointer-events-none"
            >
                <p className="font-display text-3xl md:text-4xl font-medium tracking-[-0.03em]">The field</p>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
                    Move the cursor to fly the drone. Drag to orbit, scroll to zoom.
                </p>
            </motion.div>
        </div>
    );
}
