import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RaceWormProps {
  position: number; // 0-100 progress
  laneIndex: number;
  wormName: string;
  color: string;
  circuitData: Record<string, unknown>;
  isPlayer?: boolean;
}

export function RaceWorm({ 
  position, 
  laneIndex, 
  color, 
  circuitData,
  isPlayer = false 
}: RaceWormProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);

  // Lane offset (spread worms vertically)
  const laneY = laneIndex * 2 - 3;
  
  // Calculate worm X position based on race progress (0-100 maps to -10 to 10)
  const xPosition = useMemo(() => {
    return -10 + (position / 100) * 20;
  }, [position]);

  // Extract neuron config to affect animation
  const neuronCount = useMemo(() => {
    const neurons = (circuitData?.neurons as unknown[]) || [];
    return Math.max(neurons.length, 3);
  }, [circuitData]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta * (2 + neuronCount * 0.2);

    // Wiggle animation - more neurons = faster wiggle
    const wiggleSpeed = 4 + neuronCount * 0.3;
    const wiggleAmount = 0.15;

    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const offset = Math.sin(timeRef.current * wiggleSpeed + i * 0.4) * wiggleAmount;
        child.position.z = offset;
      }
    });
  });

  // Create worm segments
  const segments = useMemo(() => {
    const segs = [];
    const numSegments = 12;
    
    for (let i = 0; i < numSegments; i++) {
      const t = i / (numSegments - 1);
      // Taper the worm body
      const radius = 0.2 * (1 - Math.abs(t - 0.3) * 0.6);
      
      segs.push(
        <mesh key={i} position={[t * 1.8 - 0.9, 0, 0]}>
          <sphereGeometry args={[radius, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isPlayer ? 0.3 : 0.1}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      );
    }
    return segs;
  }, [color, isPlayer]);

  return (
    <group ref={groupRef} position={[xPosition, laneY, 0]}>
      {segments}
      {/* Eyes */}
      <mesh position={[0.9, 0.12, 0.12]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.9, 0.12, -0.12]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Player indicator glow */}
      {isPlayer && (
        <pointLight position={[0, 0.5, 0]} color={color} intensity={2} distance={3} />
      )}
    </group>
  );
}
