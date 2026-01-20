import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

interface WormSegment {
  position: [number, number, number];
  active: boolean;
}

interface WormMeshProps {
  segments: WormSegment[];
  signalPosition: number;
}

function WormMesh({ segments, signalPosition }: WormMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Create smooth curve through segments
  const curve = useMemo(() => {
    const points = segments.map(
      (s) => new THREE.Vector3(s.position[0], s.position[1], s.position[2])
    );
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  }, [segments]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;

    // Wiggle animation
    meshRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const wiggle = Math.sin(timeRef.current * 3 + i * 0.5) * 0.05;
        child.position.y += wiggle * delta * 10;
      }
    });
  });

  const segmentMeshes = useMemo(() => {
    const meshes = [];
    const numSegments = 20;

    for (let i = 0; i < numSegments; i++) {
      const t = i / (numSegments - 1);
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      
      // Taper the worm
      const radius = 0.15 * (1 - Math.abs(t - 0.5) * 0.8);
      
      // Check if signal is at this segment
      const isActive = Math.abs(t - signalPosition) < 0.1;

      meshes.push(
        <mesh key={i} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? "#22c55e" : "#f8a5c2"}
            emissive={isActive ? "#22c55e" : "#000000"}
            emissiveIntensity={isActive ? 0.5 : 0}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      );
    }
    return meshes;
  }, [curve, signalPosition]);

  return (
    <group ref={meshRef}>
      {segmentMeshes}
      {/* Eyes */}
      <mesh position={[segments[0]?.position[0] || 0, (segments[0]?.position[1] || 0) + 0.1, (segments[0]?.position[2] || 0) + 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[segments[0]?.position[0] || 0, (segments[0]?.position[1] || 0) + 0.1, (segments[0]?.position[2] || 0) - 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

interface Worm3DProps {
  className?: string;
  activeNeurons?: boolean[];
  signalStrength?: number;
}

export function Worm3D({ className, activeNeurons = [], signalStrength = 0 }: Worm3DProps) {
  // Create worm segments based on active neurons
  const segments: WormSegment[] = useMemo(() => {
    const segs: WormSegment[] = [];
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      segs.push({
        position: [
          -1.5 + t * 3,
          Math.sin(t * Math.PI) * 0.3,
          Math.sin(t * Math.PI * 2) * 0.2,
        ],
        active: activeNeurons[i] || false,
      });
    }
    return segs;
  }, [activeNeurons]);

  return (
    <div className={className} style={{ height: "300px" }}>
      <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0ea5e9" />
        
        <WormMesh segments={segments} signalPosition={signalStrength} />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#e2e8f0" opacity={0.5} transparent />
        </mesh>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minDistance={2}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
