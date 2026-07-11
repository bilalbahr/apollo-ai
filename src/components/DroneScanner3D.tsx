"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion, type MotionValue } from "framer-motion";

type CropStatus = "healthy" | "stressed" | "moderate" | "water-stress";

interface CropData {
    position: [number, number, number];
    status: CropStatus;
    scale: number;
    rotation: number;
}

const statusColors: Record<CropStatus, string> = {
    healthy: "#5b6529",
    stressed: "#c2683a",
    moderate: "#c9a93f",
    "water-stress": "#6b96a8",
};

// Soft, warm leaf tones, kept close together so the field reads calm
const leafColors: Record<CropStatus, string> = {
    healthy: "#8a9f3a",
    stressed: "#b27a45",
    moderate: "#c2b052",
    "water-stress": "#8aa7a0",
};

const statusLabels: Record<CropStatus, string> = {
    healthy: "Healthy",
    stressed: "Stress",
    moderate: "Moderate",
    "water-stress": "Water stress",
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// A sparse, mostly-healthy patch
const generateCornField = (): CropData[] => {
    const crops: CropData[] = [];
    const gridSize = 4;
    const spacing = 0.92;

    for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
            if (Math.random() < 0.32) continue; // thin it out for an organic, minimal look

            const px = x * spacing + (Math.random() - 0.5) * 0.35;
            const pz = z * spacing + (Math.random() - 0.5) * 0.35;

            const r = Math.random();
            const status: CropStatus =
                r < 0.72 ? "healthy" :
                    r < 0.86 ? "moderate" :
                        r < 0.95 ? "water-stress" : "stressed";

            crops.push({
                position: [px, 0, pz],
                status,
                scale: 0.85 + Math.random() * 0.35,
                rotation: Math.random() * Math.PI * 2,
            });
        }
    }
    return crops;
};

// Long blade leaf, attached at the stem and arching outward then drooping.
// A two-segment plane fakes the curve of a real corn leaf.
const Leaf = ({ y, yaw, len, width, droop, color }: { y: number; yaw: number; len: number; width: number; droop: number; color: string }) => (
    <group position={[0, y, 0]} rotation={[0, yaw, 0]}>
        {/* base half, rises slightly off the stem */}
        <group rotation={[0, 0, 0.25]}>
            <mesh position={[len * 0.25, 0, 0]} castShadow>
                <planeGeometry args={[len * 0.5, width]} />
                <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.72} />
            </mesh>
            {/* tip half, droops down */}
            <group position={[len * 0.5, 0, 0]} rotation={[0, 0, -droop]}>
                <mesh position={[len * 0.25, 0, 0]} castShadow>
                    <planeGeometry args={[len * 0.5, width * 0.7]} />
                    <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.72} />
                </mesh>
            </group>
        </group>
    </group>
);

// Corn-like crop: upright stem, broad arching leaves, slim tassel on top
const LEAF_LAYOUT = [
    { y: 0.30, yaw: 0.4, len: 0.62, width: 0.15, droop: 0.7 },
    { y: 0.44, yaw: 0.4 + Math.PI, len: 0.66, width: 0.16, droop: 0.8 },
    { y: 0.58, yaw: 0.4 + Math.PI * 0.5, len: 0.56, width: 0.14, droop: 0.9 },
    { y: 0.70, yaw: 0.4 + Math.PI * 1.5, len: 0.5, width: 0.12, droop: 1.0 },
];

const CornStalk = ({ position, status, scale, rotation, interactive }: CropData & { interactive: boolean }) => {
    const [hovered, setHovered] = useState(false);
    const leaf = leafColors[status];
    const stem = status === "healthy" ? "#6f8a2c" : status === "stressed" ? "#8a7b3a" : "#7c8a34";

    return (
        <group
            position={position}
            rotation={[0, rotation, 0]}
            scale={hovered ? scale * 1.12 : scale}
            onPointerOver={interactive ? () => setHovered(true) : undefined}
            onPointerOut={interactive ? () => setHovered(false) : undefined}
        >
            {/* stem */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.018, 0.045, 1.0, 6]} />
                <meshStandardMaterial color={stem} roughness={0.85} />
            </mesh>

            {/* leaves */}
            {LEAF_LAYOUT.map((l, i) => (
                <Leaf key={i} {...l} color={leaf} />
            ))}

            {/* tassel */}
            <mesh position={[0, 1.06, 0]} castShadow>
                <cylinderGeometry args={[0.002, 0.016, 0.22, 5]} />
                <meshStandardMaterial color={leaf} roughness={0.7} />
            </mesh>
        </group>
    );
};

// Drone, driven by cursor (interactive) or scroll progress (home hero)
const Drone = ({
    crops,
    onScanUpdate,
    interactive,
    scrollProgress,
}: {
    crops: CropData[];
    onScanUpdate: (crops: CropData[]) => void;
    interactive: boolean;
    scrollProgress?: MotionValue<number>;
}) => {
    const droneRef = useRef<THREE.Group>(null);
    const [mousePos, setMousePos] = useState({ x: 0, z: 0 });
    const { camera, gl } = useThree();

    const reach = 3.3;
    const coverageSize = 2.2;
    const droneHeight = 3.2;

    useEffect(() => {
        if (!interactive) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = gl.domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            const vector = new THREE.Vector3(x, y, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.y / dir.y;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            setMousePos({
                x: Math.max(-reach, Math.min(reach, pos.x)),
                z: Math.max(-reach, Math.min(reach, pos.z)),
            });
        };

        gl.domElement.addEventListener("mousemove", handleMouseMove);
        return () => gl.domElement.removeEventListener("mousemove", handleMouseMove);
    }, [camera, gl, interactive]);

    useFrame((state) => {
        if (!droneRef.current) return;

        let targetX = 0;
        let targetZ = 0;

        if (interactive) {
            targetX = mousePos.x;
            targetZ = mousePos.z;
        } else {
            const p = clamp01(scrollProgress?.get() ?? 0);
            const lanes = 3;
            const u = p * lanes;
            const lane = Math.min(Math.floor(u), lanes - 1);
            const f = u - lane;
            const dir = lane % 2 === 0 ? 1 : -1;
            targetX = dir * (f * 2 * reach - reach);
            targetZ = -reach + (lane / (lanes - 1)) * 2 * reach;
        }

        droneRef.current.position.x = THREE.MathUtils.lerp(droneRef.current.position.x, targetX, 0.1);
        droneRef.current.position.z = THREE.MathUtils.lerp(droneRef.current.position.z, targetZ, 0.1);
        droneRef.current.position.y = droneHeight + Math.sin(state.clock.elapsedTime * 2) * 0.08;
        droneRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;

        const droneX = droneRef.current.position.x;
        const droneZ = droneRef.current.position.z;
        const scanned = crops.filter(crop => {
            const dx = crop.position[0] - droneX;
            const dz = crop.position[2] - droneZ;
            return Math.abs(dx) <= coverageSize / 2 && Math.abs(dz) <= coverageSize / 2;
        });
        onScanUpdate(scanned);
    });

    const corners: [number, number, number][] = [
        [-coverageSize / 2, 0, -coverageSize / 2],
        [coverageSize / 2, 0, -coverageSize / 2],
        [coverageSize / 2, 0, coverageSize / 2],
        [-coverageSize / 2, 0, coverageSize / 2],
    ];

    return (
        <group ref={droneRef} position={[0, droneHeight, 0]}>
            <mesh castShadow>
                <boxGeometry args={[0.3, 0.1, 0.3]} />
                <meshStandardMaterial color="#2a2b23" metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
                <boxGeometry args={[0.16, 0.02, 0.16]} />
                <meshStandardMaterial color="#5b6529" />
            </mesh>

            {[[-0.22, 0, -0.22], [0.22, 0, -0.22], [0.22, 0, 0.22], [-0.22, 0, 0.22]].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh>
                        <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
                        <meshStandardMaterial color="#2a2b23" />
                    </mesh>
                    <mesh position={[0, 0.04, 0]} rotation={[0, Date.now() * 0.012, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 0.008, 16]} />
                        <meshStandardMaterial color="#2a2b23" transparent opacity={0.5} />
                    </mesh>
                </group>
            ))}

            {/* Coverage frame on the ground */}
            <group position={[0, -droneHeight, 0]}>
                <Line points={[corners[0], corners[1], corners[2], corners[3], corners[0]]} color="#5b6529" lineWidth={2} />
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[coverageSize, coverageSize]} />
                    <meshStandardMaterial color="#5b6529" transparent opacity={0.1} />
                </mesh>
            </group>
        </group>
    );
};

// Camera: scroll-orbits in hero mode; OrbitControls take over when interactive
const CameraRig = ({ interactive, scrollProgress }: { interactive: boolean; scrollProgress?: MotionValue<number> }) => {
    const { camera } = useThree();
    useFrame(() => {
        if (interactive) return;
        const p = clamp01(scrollProgress?.get() ?? 0);
        const angle = -Math.PI / 5 + p * Math.PI * 0.45;
        const radius = 12.5;
        const height = 8 - p * 2.2;
        camera.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        camera.lookAt(0, 0.7, 0);
    });
    return null;
};

const Scene = ({
    crops,
    onScanUpdate,
    interactive,
    scrollProgress,
}: {
    crops: CropData[];
    onScanUpdate: (crops: CropData[]) => void;
    interactive: boolean;
    scrollProgress?: MotionValue<number>;
}) => {
    return (
        <>
            <ambientLight intensity={0.95} />
            <directionalLight position={[6, 11, 4]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-6, 5, -5]} intensity={0.25} color="#ffffff" />

            {crops.map((crop, i) => (
                <CornStalk key={i} {...crop} interactive={interactive} />
            ))}

            <Drone crops={crops} onScanUpdate={onScanUpdate} interactive={interactive} scrollProgress={scrollProgress} />

            <ContactShadows position={[0, 0, 0]} opacity={0.32} scale={16} blur={2.6} far={6} color="#2c2f1c" />

            <CameraRig interactive={interactive} scrollProgress={scrollProgress} />

            {interactive && (
                <OrbitControls
                    enablePan={false}
                    enableZoom
                    enableRotate
                    target={[0, 0.7, 0]}
                    minPolarAngle={Math.PI / 7}
                    maxPolarAngle={Math.PI / 2.4}
                    minDistance={5}
                    maxDistance={16}
                />
            )}
        </>
    );
};

// Heads-up readout, shown only on the immersive page
const InfoPanel = ({ scannedCrops }: { scannedCrops: CropData[] }) => {
    const stats = useMemo(() => ({
        total: scannedCrops.length,
        healthy: scannedCrops.filter(c => c.status === "healthy").length,
        stressed: scannedCrops.filter(c => c.status === "stressed").length,
        moderate: scannedCrops.filter(c => c.status === "moderate").length,
    }), [scannedCrops]);

    const overallStatus: CropStatus =
        stats.stressed > 0 ? "stressed" :
            stats.moderate > 0 ? "moderate" : "healthy";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            className="absolute bottom-8 right-6 md:right-10 w-64 z-30 bg-[var(--bg)]"
            style={{ border: "1px solid var(--hairline)" }}
        >
            <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="font-label text-muted-foreground">Drone scan</span>
                    <span className="flex items-center gap-2 font-label text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] animate-pulse" /> live
                    </span>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium" style={{ color: statusColors[overallStatus] }}>
                            {statusLabels[overallStatus]}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Crops in view</span>
                        <span className="font-label text-foreground">{stats.total}</span>
                    </div>
                    <div className="pt-3 border-t border-[var(--hairline)]">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Confidence</span>
                            <span className="font-label">{stats.total > 0 ? `${85 + Math.min(stats.total, 14)}%` : "0%"}</span>
                        </div>
                        <div className="h-px bg-[var(--hairline)] overflow-hidden">
                            <motion.div
                                className="h-full bg-[var(--olive)]"
                                initial={{ width: 0 }}
                                animate={{ width: stats.total > 0 ? `${85 + Math.min(stats.total, 14)}%` : "0%" }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Pure scene on a transparent canvas, pages render their own overlays.
export const DroneScanner3D = ({
    interactive = false,
    scrollProgress,
    showHud = false,
}: {
    interactive?: boolean;
    scrollProgress?: MotionValue<number>;
    showHud?: boolean;
}) => {
    const [crops, setCrops] = useState<CropData[]>([]);
    const [scannedCrops, setScannedCrops] = useState<CropData[]>([]);

    useEffect(() => {
        setCrops(generateCornField());
    }, []);

    return (
        <div className="relative w-full h-full">
            <Canvas
                camera={{ position: [8.5, 7, 8.5], fov: 42 }}
                shadows
                className="!absolute inset-0"
                style={{ background: "transparent" }}
                gl={{ alpha: true, antialias: true }}
            >
                <Suspense fallback={null}>
                    <Scene crops={crops} onScanUpdate={setScannedCrops} interactive={interactive} scrollProgress={scrollProgress} />
                </Suspense>
            </Canvas>

            {showHud && <InfoPanel scannedCrops={scannedCrops} />}
        </div>
    );
};
