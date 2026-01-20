import { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface RaceTrackProps {
  laneCount: number;
  raceDistance: number;
}

export function RaceTrack({ laneCount, raceDistance }: RaceTrackProps) {
  const lanes = useMemo(() => {
    const laneElements = [];
    
    for (let i = 0; i < laneCount; i++) {
      const laneY = i * 2 - 3;
      
      laneElements.push(
        <group key={i}>
          {/* Lane ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, laneY - 0.3, 0]}>
            <planeGeometry args={[22, 1.5]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#2d2d3d" : "#252535"} 
              roughness={0.8}
            />
          </mesh>
          {/* Lane divider */}
          {i < laneCount - 1 && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, laneY + 0.7, 0]}>
              <planeGeometry args={[22, 0.05]} />
              <meshStandardMaterial color="#4a4a5a" />
            </mesh>
          )}
        </group>
      );
    }
    
    return laneElements;
  }, [laneCount]);

  // Distance markers
  const markers = useMemo(() => {
    const markerElements = [];
    const markerCount = 5;
    
    for (let i = 0; i <= markerCount; i++) {
      const x = -10 + (i / markerCount) * 20;
      const distance = Math.round((i / markerCount) * raceDistance);
      
      markerElements.push(
        <group key={i} position={[x, -4.5, 0]}>
          {/* Marker line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, laneCount * 2 + 1]} />
            <meshStandardMaterial 
              color={i === markerCount ? "#22c55e" : "#6b7280"} 
              emissive={i === markerCount ? "#22c55e" : "#000"}
              emissiveIntensity={i === markerCount ? 0.5 : 0}
            />
          </mesh>
          {/* Distance label */}
          <Text
            position={[0, 0, -1]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.4}
            color="#9ca3af"
            anchorX="center"
          >
            {distance}m
          </Text>
        </group>
      );
    }
    
    return markerElements;
  }, [laneCount, raceDistance]);

  return (
    <group>
      {lanes}
      {markers}
      {/* Start line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -1.5, 0.01]}>
        <planeGeometry args={[0.3, laneCount * 2 + 1]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      {/* Finish line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -1.5, 0.01]}>
        <planeGeometry args={[0.3, laneCount * 2 + 1]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
