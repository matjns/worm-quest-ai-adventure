import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Text } from "@react-three/drei";
import * as THREE from "three";
import { WormBehavior } from "@/data/neuronData";

interface WormMeshProps {
  behavior: WormBehavior;
  activeNeurons: string[];
  signalPath: string[];
  isSimulating: boolean;
}

function WormMesh({ behavior, activeNeurons, signalPath, isSimulating }: WormMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const segmentsRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const [signalPosition, setSignalPosition] = useState(0);

  // Create worm segments
  const segments = useMemo(() => {
    const segs = [];
    const numSegments = 20;
    
    for (let i = 0; i < numSegments; i++) {
      const t = i / (numSegments - 1);
      // Taper at both ends
      const taper = 1 - Math.abs(t - 0.5) * 1.5;
      const radius = 0.12 * Math.max(0.3, taper);
      
      segs.push({
        position: new THREE.Vector3(-1.5 + t * 3, 0, 0),
        radius,
        isHead: i < 3,
        isTail: i > numSegments - 3,
      });
    }
    return segs;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    
    // Animate segments based on behavior
    segmentsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      const t = i / (segments.length - 1);
      const baseY = segments[i].position.y;
      const baseZ = segments[i].position.z;
      
      let yOffset = 0;
      let zOffset = 0;
      
      switch (behavior) {
        case "move_forward":
          // Wave moves from head to tail
          yOffset = Math.sin(timeRef.current * 8 - t * Math.PI * 2) * 0.15;
          zOffset = Math.cos(timeRef.current * 8 - t * Math.PI * 2) * 0.08;
          break;
          
        case "move_backward":
          // Wave moves from tail to head
          yOffset = Math.sin(timeRef.current * 8 + t * Math.PI * 2) * 0.15;
          zOffset = Math.cos(timeRef.current * 8 + t * Math.PI * 2) * 0.08;
          break;
          
        case "curl":
          // Curl animation
          const curlAmount = Math.sin(timeRef.current * 2) * 0.5;
          yOffset = Math.sin(t * Math.PI) * curlAmount;
          zOffset = Math.cos(t * Math.PI) * curlAmount * 0.5;
          break;
          
        case "head_wiggle":
          // Only head moves
          if (t < 0.3) {
            yOffset = Math.sin(timeRef.current * 12) * 0.2 * (0.3 - t);
            zOffset = Math.cos(timeRef.current * 12) * 0.15 * (0.3 - t);
          }
          break;
          
        case "no_movement":
        default:
          // Subtle idle animation
          yOffset = Math.sin(timeRef.current * 1.5 + i * 0.3) * 0.02;
          break;
      }
      
      mesh.position.y = baseY + yOffset;
      mesh.position.z = baseZ + zOffset;
    });

    // Signal propagation animation
    if (isSimulating && activeNeurons.length > 0) {
      setSignalPosition(prev => (prev + delta * 2) % 1);
    }
  });

  const getSegmentColor = (index: number): string => {
    const t = index / (segments.length - 1);
    
    // Show signal pulse
    if (isSimulating && Math.abs(t - signalPosition) < 0.15) {
      return "#22c55e"; // Green for active signal
    }
    
    // Head has sensory neurons
    if (index < 3 && activeNeurons.some(n => n.startsWith("A"))) {
      return "#3b82f6"; // Blue for sensory
    }
    
    // Tail
    if (index > segments.length - 3 && activeNeurons.some(n => n.startsWith("P"))) {
      return "#3b82f6";
    }
    
    // Motor activity
    if (activeNeurons.some(n => n.startsWith("D") || n.startsWith("V"))) {
      const intensity = Math.sin(timeRef.current * 5 + index * 0.5);
      if (intensity > 0.5) return "#22c55e";
    }
    
    return "#fda4af"; // Default pink
  };

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      {segments.map((seg, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) segmentsRef.current[i] = el; }}
          position={[seg.position.x, seg.position.y, seg.position.z]}
        >
          <sphereGeometry args={[seg.radius, 16, 16]} />
          <meshStandardMaterial
            color={getSegmentColor(i)}
            emissive={isSimulating && activeNeurons.length > 0 ? getSegmentColor(i) : "#000000"}
            emissiveIntensity={isSimulating ? 0.3 : 0}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Eyes */}
      <mesh position={[-1.35, 0.08, 0.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-1.35, 0.08, -0.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Behavior label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
      >
        {behavior.replace("_", " ").toUpperCase()}
      </Text>
    </group>
  );
}

interface WormSimulator3DProps {
  behavior: WormBehavior;
  activeNeurons: string[];
  signalPath: string[];
  isSimulating: boolean;
  className?: string;
}

export function WormSimulator3D({
  behavior,
  activeNeurons,
  signalPath,
  isSimulating,
  className,
}: WormSimulator3DProps) {
  return (
    <div className={className} style={{ height: "280px" }}>
      <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#0ea5e9" />
        
        <WormMesh
          behavior={behavior}
          activeNeurons={activeNeurons}
          signalPath={signalPath}
          isSimulating={isSimulating}
        />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial 
            color="hsl(var(--muted))" 
            opacity={0.3} 
            transparent
          />
        </mesh>
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={6}
          autoRotate={!isSimulating}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.3}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
