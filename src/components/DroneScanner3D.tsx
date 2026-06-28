"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion, type MotionValue } from "framer-motion";

type CropStatus = "healthy" | "stressed" | "moderate" | "nutrient-deficient" | "water-stress";

interface CropData {
    position: [number, number, number];
    status: CropStatus;
    scale: number;
    rotation: number;
}

const statusColors: Record<CropStatus, string> = {
    healthy: "#7e951c",
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

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Generate corn field data
const generateCornField = (): CropData[] => {
    const crops: CropData[] = [];
    const gridSize = 8;
    const spacing = 0.8;

    for (let x = -gridSize; x <= gridSize; x++) {
        for (let z = -gridSize; z <= gridSize; z++) {
            const px = x * spacing + (Math.random() - 0.5) * 0.3;
            const pz = z * spacing + (Math.random() - 0.5) * 0.3;

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
const CornStalk = ({ position, status, scale, rotation, interactive }: CropData & { interactive: boolean }) => {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    const color = statusColors[status];
    const stalkColor = status === "healthy" ? "#7e951c" :
        status === "stressed" ? "#8B4513" :
            status === "water-stress" ? "#6B8E23" : "#9ACD32";

    return (
        <group
            ref={meshRef}
            position={position}
            rotation={[0, rotation, 0]}
            scale={hovered ? scale * 1.2 : scale}
            onPointerOver={interactive ? () => setHovered(true) : undefined}
            onPointerOut={interactive ? () => setHovered(false) : undefined}
        >
            <mesh position={[0, 0.4 * scale, 0]}>
                <cylinderGeometry args={[0.03, 0.05, 0.8 * scale, 6]} />
                <meshStandardMaterial color={stalkColor} />
            </mesh>

            <mesh position={[0.08, 0.5 * scale, 0]} rotation={[0, 0, 0.3]}>
                <cylinderGeometry args={[0.06, 0.04, 0.2, 6]} />
                <meshStandardMaterial color="#FFD700" emissive={color} emissiveIntensity={0.2} />
            </mesh>

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
    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(25, 25, 30, 30);
        const positions = geo.attributes.position.array as Float32Array;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = Math.sin(positions[i] * 0.5) * 0.1 + Math.cos(positions[i + 1] * 0.5) * 0.1;
        }

        geo.computeVertexNormals();
        return geo;
    }, []);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial color="#3d2817" roughness={0.9} metalness={0.1} />
        </mesh>
    );
};

// Drone — driven by cursor (interactive) or scroll progress (home hero)
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

    const coverageSize = 3;
    const droneHeight = 4;

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
                x: Math.max(-8, Math.min(8, pos.x)),
                z: Math.max(-8, Math.min(8, pos.z)),
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
            // Serpentine sweep across the field, driven entirely by scroll
            const p = clamp01(scrollProgress?.get() ?? 0);
            const lanes = 3;
            const u = p * lanes;
            const lane = Math.min(Math.floor(u), lanes - 1);
            const f = u - lane;
            const dir = lane % 2 === 0 ? 1 : -1;
            targetX = dir * (f * 14 - 7);
            targetZ = -7 + (lane / (lanes - 1)) * 14;
        }

        droneRef.current.position.x = THREE.MathUtils.lerp(droneRef.current.position.x, targetX, 0.1);
        droneRef.current.position.z = THREE.MathUtils.lerp(droneRef.current.position.z, targetZ, 0.1);
        droneRef.current.position.y = droneHeight + Math.sin(state.clock.elapsedTime * 2) * 0.1;
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
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.35, 0.12, 0.35]} />
                <meshStandardMaterial color="#f5f5f5" metalness={0.8} roughness={0.2} />
            </mesh>

            <mesh position={[0, 0.07, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.2]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </mesh>

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

            <mesh position={[0, -0.08, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
            </mesh>

            {corners.map((corner, i) => (
                <Line
                    key={i}
                    points={[[0, -0.15, 0], [corner[0], -droneHeight + 0.1, corner[2]]]}
                    color="#7e951c"
                    lineWidth={1.5}
                    transparent
                    opacity={0.6}
                    dashed
                    dashSize={0.2}
                    dashScale={2}
                />
            ))}

            <group position={[0, -droneHeight, 0]}>
                <Line points={[corners[0], corners[1], corners[2], corners[3], corners[0]]} color="#7e951c" lineWidth={3} />
                <Line points={[[-coverageSize / 2, 0.01, 0], [coverageSize / 2, 0.01, 0]]} color="#7e951c" lineWidth={1} transparent opacity={0.5} />
                <Line points={[[0, 0.01, -coverageSize / 2], [0, 0.01, coverageSize / 2]]} color="#7e951c" lineWidth={1} transparent opacity={0.5} />

                {corners.map((corner, i) => (
                    <mesh key={i} position={[corner[0], 0.02, corner[2]]}>
                        <boxGeometry args={[0.15, 0.02, 0.15]} />
                        <meshStandardMaterial color="#7e951c" emissive="#7e951c" emissiveIntensity={0.5} />
                    </mesh>
                ))}

                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[coverageSize, coverageSize]} />
                    <meshStandardMaterial color="#7e951c" transparent opacity={0.14} />
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
        const angle = -Math.PI / 4 + p * Math.PI * 0.5;
        const radius = 17;
        const height = 11 - p * 3.5;
        camera.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        camera.lookAt(0, 0, 0);
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
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#cfe0b0" />

            <Ground />

            {crops.map((crop, i) => (
                <CornStalk key={i} {...crop} interactive={interactive} />
            ))}

            <Drone crops={crops} onScanUpdate={onScanUpdate} interactive={interactive} scrollProgress={scrollProgress} />

            <CameraRig interactive={interactive} scrollProgress={scrollProgress} />

            {interactive && (
                <OrbitControls
                    enablePan={false}
                    enableZoom
                    enableRotate
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.5}
                    minDistance={8}
                    maxDistance={20}
                />
            )}
        </>
    );
};

// Heads-up readout — shown only on the immersive page
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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-24 right-6 w-60 rounded-xl z-30"
            style={{
                background: "rgba(248,245,238,0.86)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(27,28,23,0.1)",
            }}
        >
            <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#7e951c] animate-pulse" />
                    <span className="text-sm text-[#5c5b51]">Drone scan</span>
                    <span className="ml-auto font-mono text-xs text-[#5c5b51]">live</span>
                </div>

                <div className="space-y-3 text-[15px]">
                    <div className="flex justify-between items-baseline">
                        <span className="text-[#5c5b51]">Status</span>
                        <span className="font-medium" style={{ color: statusColors[overallStatus] }}>
                            {statusLabels[overallStatus]}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-[#5c5b51]">Crops in view</span>
                        <span className="font-mono text-[#1b1c17]">{stats.total}</span>
                    </div>
                    <div className="pt-3">
                        <div className="flex justify-between text-sm text-[#5c5b51] mb-2">
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
        </motion.div>
    );
};

// Pure scene: no headline / buttons — pages render their own overlays.
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
            {/* Warm wash that fades the scene into the page background */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(170,194,150,0.16) 0%, rgba(243,239,230,0) 36%, rgba(243,239,230,0) 72%, rgba(243,239,230,0.92) 100%)",
                }}
            />

            <Canvas
                camera={{ position: [12, 10, 12], fov: 50 }}
                shadows
                className="!absolute inset-0"
                style={{ background: "transparent" }}
            >
                <Suspense fallback={null}>
                    <Scene crops={crops} onScanUpdate={setScannedCrops} interactive={interactive} scrollProgress={scrollProgress} />
                </Suspense>
            </Canvas>

            {showHud && <InfoPanel scannedCrops={scannedCrops} />}
        </div>
    );
};
