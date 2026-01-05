"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Center, PerspectiveCamera, Environment } from "@react-three/drei"
import { Suspense } from "react"

interface SlicerSceneProps {
    volume?: { x: number; y: number; z: number }
}

function BuildPlate({ volume = { x: 256, y: 256, z: 256 } }: SlicerSceneProps) {
    const { x, y } = volume
    return (
        <group position={[0, 0, 0]}>
            {/* The physical bed mesh */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                <planeGeometry args={[x, y]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
            </mesh>
            
            {/* Grid Helper */}
            <Grid 
                position={[0, 0.01, 0]} 
                args={[x, y]}
                cellSize={10} 
                cellThickness={0.6}
                cellColor="#6f6f6f"
                sectionSize={50}
                sectionThickness={1.2}
                sectionColor="#a0a0a0"
                fadeDistance={500}
                infiniteGrid
            />
        </group>
    )
}

export default function SlicerScene({ volume = { x: 256, y: 256, z: 256 } }: SlicerSceneProps) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
        <Canvas>
            <Suspense fallback={null}>
                {/* Camera Setup */}
                <PerspectiveCamera makeDefault position={[300, 300, 300]} fov={45} />
                
                {/* Controls - Locked to defined center, prevented from going below bed */}
                <OrbitControls 
                    makeDefault 
                    target={[0, 0, 0]}
                    minPolarAngle={0} 
                    maxPolarAngle={Math.PI / 2 - 0.1} // Limit to not go below bed
                    minDistance={50}
                    maxDistance={800}
                    dampingFactor={0.1}
                />

                {/* Environment & Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
                <Environment preset="city" />

                {/* The Printer Simulation */}
                <BuildPlate volume={volume} />

                {/* Placeholder Object (The User's Model would go here) */}
                <Center top>
                     <mesh position={[0, 20, 0]}>
                        <boxGeometry args={[40, 40, 40]} />
                        <meshStandardMaterial color="#3b82f6" />
                     </mesh>
                </Center>
            </Suspense>
        </Canvas>
        
        {/* Overlay UI */}
        <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-xs backdrop-blur-sm">
            <div>Printer Volume: {volume.x} x {volume.y} x {volume.z} mm</div>
            <div className="text-gray-400">Left Click: Rotate | Right Click: Pan | Scroll: Zoom</div>
        </div>
    </div>
  )
}
