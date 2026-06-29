"use client";

import { lazy, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const DroneScanner3D = lazy(() =>
    import("@/components/DroneScanner3D").then(mod => ({ default: mod.DroneScanner3D }))
);

export default function FieldPage() {
    return (
        <div className="fixed inset-0 bg-background overflow-hidden">
            <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b border-[var(--olive)]" />
                </div>
            }>
                <DroneScanner3D interactive showHud />
            </Suspense>

            {/* Exit */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-6 left-6 z-40"
            >
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors px-4 py-2 rounded-full"
                    style={{ background: "rgba(248,245,238,0.86)", backdropFilter: "blur(12px)", border: "1px solid rgba(27,28,23,0.1)" }}
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Exit
                </Link>
            </motion.div>

            {/* Title + controls hint */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute bottom-8 left-6 md:left-10 z-40 pointer-events-none"
            >
                <p className="font-display text-2xl md:text-3xl tracking-[-0.02em] text-foreground">The field</p>
                <p className="mt-1.5 text-sm text-muted-foreground">Move to fly the drone · drag to orbit · scroll to zoom</p>
            </motion.div>
        </div>
    );
}
