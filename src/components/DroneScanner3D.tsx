"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

type CropStatus = "healthy" | "stressed" | "moderate" | "nutrient-deficient" | "water-stress";

interface CropData {
    position: [number, number, number];
    status: CropStatus;
    scale: number;
    rotation: number;
}

const statusColors: Record<CropStatus, string> = {
    healthy: "#839a1c",
    stressed: "#ef4444",
    moderate: "#eab308",
    "nutrient-deficient": "#f97316",
    "water-stress": "#3b82f6",
};

const statusLabels: Record<CropStatus, string> = {
    healthy: "Healthy",
    stressed: "High stress",
    moderate: "Moderate",
    "nutrient-deficient": "Nutrient deficiency",
    "water-stress": "Water stress",
};

// Generate corn field data
const generateCornField = (): CropData[] => {
    const crops: CropData[] = [];
    const gridSize = 8; // Reduced from 12 for better performance
    const spacing = 0.8;

    for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
            const px = x * spacing + (Math.random() - 0.5) * 0.3;
            const pz = z * spacing + (Math.random() - 0.5) * 0.3;

            // Create varied status based on position for interesting patterns
            const distFromCenter = Math.sqrt(px * px + pz * pz);
            const statusRand = Math.random();
            let status: CropStatus;

            if (distFromCenter > 8) {
                status = statusRand < 0.3 ? "water-stress" : statusRand < 0.5 ? "stressed" : "moderate";
            } else if (distFromCenter > 5) {
                status = statusRand < 0.4 ? "moderate" : statusRand < 0.6 ? "nutrient-deficient" : "healthy";
            } else {
                status = statusRand < 0.7 ? "healthy" : "moderate";
            }

            crops.push({
                position: [px, 0, pz],
                status,
                scale: 0.8 + Math.random() * 0.4,
                rotation: Math.random() * Math.PI * 2,
            });
        }
    }
    return crops;
};

// Corn stalk component
const CornStalk = ({ position, status, scale, rotation }: CropData) => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    const color = statusColors[status];
    const stalkColor = status === "healthy" ? "#839a1c" :
        status === "stressed" ? "#8B4513" :
            status === "water-stress" ? "#6B8E23" : "#9ACD32";

    return (
        <group
            ref={meshRef}
            position={position}
            rotation={[0, rotation, 0]}
            scale={hovered ? scale * 1.2 : scale}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Stem - reduced segments from 8 to 6 */}
            <mesh position={[0, 0.4 * scale, 0]}>
                <cylinderGeometry args={[0.03, 0.05, 0.8 * scale, 6]} />
                <meshStandardMaterial color={stalkColor} />
            </mesh>

            {/* Corn cob - reduced segments from 8 to 6 */}
            <mesh position={[0.08, 0.5 * scale, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.06, 0.04, 0.2, 6]} />
                <meshStandardMaterial color="#FFD700" emissive={color} emissiveIntensity={0.2} />
            </mesh>

            {/* Leaves - reduced from 3 to 2 */}
            {[0, 1].map((i) => (
                <mesh key={i} position={[0, 0.2 + i * 0.3, 0]} rotation={[0.5, i * 2.1, 0]}>
                    <planeGeometry args={[0.4, 0.1]} />
                    <meshStandardMaterial color={stalkColor} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
};

// Ground plane with 3D terrain
const Ground = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(25, 25, 30, 30); // Reduced from 50x50 to 30x30
        const positions = geo.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = Math.sin(positions[i] * 0.5) * 0.1 + Math.cos(positions[i + 1] * 0.5) * 0.1;
        }

        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial
                color="#3d2817"
                roughness={0.9}
                metalness={0.1}
            />
        </mesh>
    );
};

// Drone component with coverage square
const Drone = ({
    crops,
    onScanUpdate,
    mouseControlEnabled
}: {
    crops: CropData[];
    onScanUpdate: (crops: CropData[]) => void;
    mouseControlEnabled: boolean;
}) => {
    const droneRef = useRef<THREE.Group>(null);
    const [mousePos, setMousePos] = useState({ x: 0, z: 0 });
    const { camera, gl } = useThree();

    const coverageSize = 3;
    const droneHeight = 4;

    useEffect(() => {
        if (!mouseControlEnabled) return;

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
                x: Math.max(-8, Math.min(8, pos.x)),
                z: Math.max(-8, Math.min(8, pos.z))
            });
        };

        gl.domElement.addEventListener("mousemove", handleMouseMove);
        return () => gl.domElement.removeEventListener("mousemove", handleMouseMove);
    }, [camera, gl, mouseControlEnabled]);

    useFrame((state) => {
        if (droneRef.current) {
            droneRef.current.position.x = THREE.MathUtils.lerp(droneRef.current.position.x, mousePos.x, 0.08);
            droneRef.current.position.z = THREE.MathUtils.lerp(droneRef.current.position.z, mousePos.z, 0.08);
            droneRef.current.position.y = droneHeight + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            droneRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;

            // Calculate scanned crops dynamically
            const droneX = droneRef.current.position.x;
            const droneZ = droneRef.current.position.z;
            const scanned = crops.filter(crop => {
                const dx = crop.position[0] - droneX;
                const dz = crop.position[2] - droneZ;
                return Math.abs(dx) <= coverageSize / 2 && Math.abs(dz) <= coverageSize / 2;
            });
            onScanUpdate(scanned);
        }
    });

    // Corner positions for the coverage square
    const corners: [number, number, number][] = [
        [-coverageSize / 2, 0, -coverageSize / 2],
        [coverageSize / 2, 0, -coverageSize / 2],
        [coverageSize / 2, 0, coverageSize / 2],
        [-coverageSize / 2, 0, coverageSize / 2],
    ];

    return (
        <group ref={droneRef} position={[0, droneHeight, 0]}>
            {/* Drone body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.35, 0.12, 0.35]} />
                <meshStandardMaterial color="#f5f5f5" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Top plate */}
            <mesh position={[0, 0.07, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Drone arms and rotors */}
            {[[-0.25, 0, -0.25], [0.25, 0, -0.25], [0.25, 0, 0.25], [-0.25, 0, 0.25]].map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh>
                        <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0, 0.05, 0]} rotation={[0, Date.now() * 0.01, 0]}>
                        <cylinderGeometry args={[0.12, 0.12, 0.01, 16]} />
                        <meshStandardMaterial color="#333333" transparent opacity={0.7} />
                    </mesh>
                </group>
            ))}

            {/* Camera gimbal */}
            <mesh position={[0, -0.08, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Lines from drone to coverage square corners */}
            {corners.map((corner, i) => (
                <Line
                    key={i}
                    points={[[0, -0.15, 0], [corner[0], -droneHeight + 0.1, corner[2]]]}
                    color="#ef4444"
                    lineWidth={1.5}
                    transparent
                    opacity={0.7}
                    dashed
                    dashSize={0.2}
                    dashScale={2}
                />
            ))}

            {/* Coverage square on ground */}
            <group position={[0, -droneHeight, 0]}>
                {/* Square border */}
                <Line
                    points={[
                        corners[0], corners[1], corners[2], corners[3], corners[0]
                    ]}
                    color="#ef4444"
                    lineWidth={3}
                />

                {/* Inner scanning lines */}
                <Line
                    points={[[-coverageSize / 2, 0.01, 0], [coverageSize / 2, 0.01, 0]]}
                    color="#ef4444"
                    lineWidth={1}
                    transparent
                    opacity={0.5}
                />
                <Line
                    points={[[0, 0.01, -coverageSize / 2], [0, 0.01, coverageSize / 2]]}
                    color="#ef4444"
                    lineWidth={1}
                    transparent
                    opacity={0.5}
                />

                {/* Corner markers */}
                {corners.map((corner, i) => (
                    <mesh key={i} position={[corner[0], 0.02, corner[2]]}>
                        <boxGeometry args={[0.15, 0.02, 0.15]} />
                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
                    </mesh>
                ))}

                {/* Scanning area fill */}
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[coverageSize, coverageSize]} />
                    <meshStandardMaterial color="#ef4444" transparent opacity={0.15} />
                </mesh>
            </group>
        </group>
    );
};

// Main scene component
const Scene = ({
    crops,
    onScanUpdate,
    mouseControlEnabled
}: {
    crops: CropData[];
    onScanUpdate: (crops: CropData[]) => void;
    mouseControlEnabled: boolean;
}) => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#87CEEB" />

            <Ground />

            {crops.map((crop, i) => (
                <CornStalk key={i} {...crop} />
            ))}

            <Drone crops={crops} onScanUpdate={onScanUpdate} mouseControlEnabled={mouseControlEnabled} />

            <OrbitControls
                enabled={mouseControlEnabled}
                enablePan={false}
                enableZoom={mouseControlEnabled}
                enableRotate={mouseControlEnabled}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.5}
                minDistance={8}
                maxDistance={20}
            />
        </>
    );
};

// Info panel component
const InfoPanel = ({ scannedCrops }: { scannedCrops: CropData[] }) => {
    const stats = useMemo(() => ({
        total: scannedCrops.length,
        healthy: scannedCrops.filter(c => c.status === "healthy").length,
        stressed: scannedCrops.filter(c => c.status === "stressed").length,
        moderate: scannedCrops.filter(c => c.status === "moderate").length,
        nutrientDeficient: scannedCrops.filter(c => c.status === "nutrient-deficient").length,
        waterStress: scannedCrops.filter(c => c.status === "water-stress").length,
    }), [scannedCrops]);

    const overallStatus: CropStatus =
        stats.stressed > 0 ? "stressed" :
            stats.waterStress > 0 ? "water-stress" :
                stats.nutrientDeficient > 0 ? "nutrient-deficient" :
                    stats.moderate > 0 ? "moderate" : "healthy";

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-24 left-0 right-0 mx-4 md:right-6 md:left-auto md:w-60 md:mx-0 rounded-lg z-30"
            style={{
                background: "rgba(248,245,238,0.86)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(27,28,23,0.12)",
                boxShadow: "0 1px 2px rgba(27,28,23,0.05)",
            }}
        >
            {/* Desktop Layout */}
            <div className="hidden md:block p-4">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[rgba(27,28,23,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7e951c] animate-pulse" />
                    <span className="text-xs text-[#5c5b51] tracking-wide">Drone scan</span>
                    <span className="ml-auto font-mono text-[10px] text-[#5c5b51]">live</span>
                </div>

                <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[#5c5b51]">Status</span>
                        <span className="font-medium" style={{ color: statusColors[overallStatus] }}>
                            {statusLabels[overallStatus]}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-[#5c5b51]">Coverage</span>
                        <span className="font-mono text-[13px] text-[#1b1c17]">3 × 3 m</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-[#5c5b51]">Crops</span>
                        <span className="font-mono text-[13px] text-[#1b1c17]">{stats.total}</span>
                    </div>

                    <div className="pt-3 border-t border-[rgba(27,28,23,0.1)]">
                        <div className="flex justify-between text-xs text-[#5c5b51] mb-1.5">
                            <span>Confidence</span>
                            <span className="font-mono">{stats.total > 0 ? `${85 + Math.min(stats.total, 14)}%` : "—"}</span>
                        </div>
                        <div className="h-1 bg-[rgba(27,28,23,0.1)] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#7e951c]"
                                initial={{ width: 0 }}
                                animate={{ width: stats.total > 0 ? `${85 + Math.min(stats.total, 14)}%` : "0%" }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Layout (Horizontal Bar) */}
            <div className="md:hidden flex items-center justify-between px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7e951c] animate-pulse" />
                    <span className="text-[#5c5b51]">Scanning</span>
                </div>
                <div className="font-medium" style={{ color: statusColors[overallStatus] }}>
                    {statusLabels[overallStatus]}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[#5c5b51]">Crops</span>
                    <span className="font-mono text-[#1b1c17]">{stats.total}</span>
                </div>
            </div>
        </motion.div>
    );
};

// Main component function: DroneScanner3D
export const DroneScanner3D = () => {
    const [crops, setCrops] = useState<CropData[]>([]);
    const [scannedCrops, setScannedCrops] = useState<CropData[]>([]);
    const [mouseControlEnabled, setMouseControlEnabled] = useState(true);

    useEffect(() => {
        setCrops(generateCornField());
    }, []);

    return (
        <div className="relative w-full h-full dotted-bg">
            {/* Sky / paper wash — warm, subtle, fades to the page background */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: "linear-gradient(180deg, rgba(170,194,150,0.18) 0%, rgba(243,239,230,0) 38%, rgba(243,239,230,0.0) 70%, rgba(243,239,230,0.85) 100%)",
                }}
            />

            {/* WebGL Canvas */}
            <Canvas
                camera={{ position: [12, 10, 12], fov: 50 }}
                shadows
                className="!absolute inset-0"
                style={{ background: "transparent" }}
            >
                <Suspense fallback={null}>
                    <Scene crops={crops} onScanUpdate={setScannedCrops} mouseControlEnabled={mouseControlEnabled} />
                </Suspense>
            </Canvas>

            {/* Info Panel */}
            <InfoPanel scannedCrops={scannedCrops} />

            {/* Hero headline — bottom-left, editorial */}
            <div className="absolute bottom-16 md:bottom-24 left-0 z-20 w-full px-6 md:px-10 pointer-events-none">
                <div className="max-w-6xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: [0.21, 0.5, 0.27, 1] }}
                        className="font-display text-[2.6rem] sm:text-6xl md:text-7xl leading-[0.98] tracking-[-0.03em] text-[#1b1c17] max-w-3xl"
                    >
                        Find crop stress<br />
                        <span className="italic text-[#5d6f14]">before the eye can.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="mt-5 text-sm text-[#5c5b51]"
                    >
                        Move your cursor to fly the drone.
                    </motion.p>
                </div>
            </div>

            {/* Drone control toggle — bottom right, quiet */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="absolute bottom-8 right-6 z-30"
            >
                <button
                    onClick={() => setMouseControlEnabled(!mouseControlEnabled)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs transition-colors"
                    style={{
                        background: "rgba(248,245,238,0.86)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(27,28,23,0.12)",
                        color: "#1b1c17",
                    }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: mouseControlEnabled ? "#7e951c" : "rgba(27,28,23,0.3)" }}
                    />
                    {mouseControlEnabled ? "Drone control on" : "Scroll mode"}
                </button>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:block"
            >
                <div className="bounce-down">
                    <svg className="w-5 h-5 mx-auto text-[#5c5b51]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </motion.div>
        </div>
    );
};
