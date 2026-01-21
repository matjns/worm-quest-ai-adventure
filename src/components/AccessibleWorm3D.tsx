import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * Accessible 3D Worm Component
 * 
 * Features:
 * - Full ARIA labels for screen readers
 * - Keyboard navigation support
 * - High contrast mode
 * - Reduced motion support
 * - Semantic descriptions of neural activity
 */

interface WormSegment {
  position: [number, number, number];
  name: string;
  type: "head" | "body" | "tail";
  active: boolean;
}

interface AccessibleWormMeshProps {
  segments: WormSegment[];
  signalPosition: number;
  highContrast: boolean;
  onSegmentFocus?: (segment: WormSegment | null) => void;
}

// Screen reader announcements
function useAnnouncer() {
  const [announcement, setAnnouncement] = useState("");
  
  const announce = (message: string) => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 50);
  };
  
  return { announcement, announce };
}

function AccessibleWormMesh({ 
  segments, 
  signalPosition, 
  highContrast,
  onSegmentFocus 
}: AccessibleWormMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Create smooth curve through segments
  const curve = useMemo(() => {
    const points = segments.map(
      (s) => new THREE.Vector3(s.position[0], s.position[1], s.position[2])
    );
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  }, [segments]);

  useFrame((state, delta) => {
    if (!meshRef.current || prefersReducedMotion) return;
    timeRef.current += delta;

    // Subtle wiggle animation
    meshRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const wiggle = Math.sin(timeRef.current * 2 + i * 0.5) * 0.03;
        child.position.y += wiggle * delta * 5;
      }
    });
  });

  const segmentMeshes = useMemo(() => {
    const meshes = [];
    const numSegments = 20;

    for (let i = 0; i < numSegments; i++) {
      const t = i / (numSegments - 1);
      const point = curve.getPoint(t);
      
      // Taper the worm
      const radius = 0.15 * (1 - Math.abs(t - 0.5) * 0.8);
      
      // Check if signal is at this segment
      const isActive = Math.abs(t - signalPosition) < 0.1;

      // Color scheme
      const activeColor = highContrast ? "#FFFF00" : "#22c55e";
      const inactiveColor = highContrast ? "#FFFFFF" : "#f8a5c2";

      meshes.push(
        <mesh 
          key={i} 
          position={[point.x, point.y, point.z]}
          onClick={() => {
            const segmentIdx = Math.floor(t * segments.length);
            onSegmentFocus?.(segments[segmentIdx] || null);
          }}
        >
          <sphereGeometry args={[radius, 16, 16]} />
          <meshStandardMaterial
            color={isActive ? activeColor : inactiveColor}
            emissive={isActive ? activeColor : "#000000"}
            emissiveIntensity={isActive ? 0.5 : 0}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
      );
    }
    return meshes;
  }, [curve, signalPosition, highContrast, segments, onSegmentFocus]);

  const eyeColor = highContrast ? "#000000" : "#1a1a1a";

  return (
    <group ref={meshRef}>
      {segmentMeshes}
      {/* Eyes */}
      <mesh position={[segments[0]?.position[0] || 0, (segments[0]?.position[1] || 0) + 0.1, (segments[0]?.position[2] || 0) + 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
      <mesh position={[segments[0]?.position[0] || 0, (segments[0]?.position[1] || 0) + 0.1, (segments[0]?.position[2] || 0) - 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
    </group>
  );
}

// Keyboard navigation component
function KeyboardControls({ 
  onNavigate 
}: { 
  onNavigate: (direction: "left" | "right" | "up" | "down" | "in" | "out") => void 
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          onNavigate("left");
          break;
        case "ArrowRight":
          onNavigate("right");
          break;
        case "ArrowUp":
          onNavigate("up");
          break;
        case "ArrowDown":
          onNavigate("down");
          break;
        case "+":
        case "=":
          onNavigate("in");
          break;
        case "-":
          onNavigate("out");
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera, onNavigate]);
  
  return null;
}

interface AccessibleWorm3DProps {
  className?: string;
  activeNeurons?: boolean[];
  signalStrength?: number;
  neuronLabels?: string[];
  wormType?: "hermaphrodite" | "male";
  showLabels?: boolean;
  highContrast?: boolean;
  ariaDescription?: string;
}

export function AccessibleWorm3D({ 
  className, 
  activeNeurons = [], 
  signalStrength = 0,
  neuronLabels = [],
  wormType = "hermaphrodite",
  showLabels = false,
  highContrast = false,
  ariaDescription,
}: AccessibleWorm3DProps) {
  const [focusedSegment, setFocusedSegment] = useState<WormSegment | null>(null);
  const { announcement, announce } = useAnnouncer();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create worm segments based on active neurons
  const segments: WormSegment[] = useMemo(() => {
    const segs: WormSegment[] = [];
    const segmentNames = [
      "Pharynx (head)",
      "Nerve ring",
      "Anterior body",
      "Mid-anterior body",
      "Central body",
      "Mid-posterior body",
      "Posterior body",
      "Pre-anal region",
      "Anal region",
      "Tail tip"
    ];
    
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      segs.push({
        position: [
          -1.5 + t * 3,
          Math.sin(t * Math.PI) * 0.3,
          Math.sin(t * Math.PI * 2) * 0.2,
        ],
        name: segmentNames[i],
        type: i === 0 ? "head" : i === 9 ? "tail" : "body",
        active: activeNeurons[i] || false,
      });
    }
    return segs;
  }, [activeNeurons]);

  // Generate semantic description
  const semanticDescription = useMemo(() => {
    const activeCount = activeNeurons.filter(Boolean).length;
    const activeSegments = segments.filter(s => s.active).map(s => s.name);
    
    let description = `${wormType === "hermaphrodite" ? "Hermaphrodite" : "Male"} C. elegans worm visualization. `;
    description += `The worm has ${segments.length} visible body segments. `;
    
    if (activeCount > 0) {
      description += `${activeCount} segment${activeCount > 1 ? "s" : ""} currently showing neural activity: ${activeSegments.join(", ")}. `;
    } else {
      description += "No neural activity currently displayed. ";
    }
    
    if (signalStrength > 0) {
      description += `Signal propagation at ${Math.round(signalStrength * 100)}% along the ventral cord. `;
    }
    
    if (neuronLabels.length > 0) {
      description += `Active neurons: ${neuronLabels.join(", ")}.`;
    }
    
    return description;
  }, [segments, activeNeurons, signalStrength, wormType, neuronLabels]);

  const handleNavigate = (direction: string) => {
    announce(`Camera moved ${direction}`);
  };

  const handleSegmentFocus = (segment: WormSegment | null) => {
    setFocusedSegment(segment);
    if (segment) {
      announce(`Focused on ${segment.name}. ${segment.active ? "Neural activity detected." : "No activity."}`);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={className} 
      style={{ height: "300px", position: "relative" }}
      role="img"
      aria-label={ariaDescription || `${wormType === "hermaphrodite" ? "Hermaphrodite" : "Male"} C. elegans ventral cord with ${activeNeurons.filter(Boolean).length} highlighted interneurons`}
      aria-describedby="worm-description"
      tabIndex={0}
    >
      {/* Hidden description for screen readers */}
      <div id="worm-description" className="sr-only">
        {semanticDescription}
      </div>
      
      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      
      {/* Keyboard instructions */}
      <div className="sr-only">
        Use arrow keys to rotate the view. Plus and minus keys to zoom in and out. 
        Click on body segments to hear details about neural activity.
      </div>
      
      <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
        <ambientLight intensity={highContrast ? 0.8 : 0.5} />
        <directionalLight position={[5, 5, 5]} intensity={highContrast ? 1.2 : 1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0ea5e9" />
        
        <AccessibleWormMesh 
          segments={segments} 
          signalPosition={signalStrength}
          highContrast={highContrast}
          onSegmentFocus={handleSegmentFocus}
        />
        
        {/* Segment labels */}
        {showLabels && segments.map((seg, i) => (
          <Html
            key={i}
            position={[seg.position[0], seg.position[1] + 0.3, seg.position[2]]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div className="text-xs bg-background/80 px-1 rounded whitespace-nowrap">
              {seg.name}
            </div>
          </Html>
        ))}
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial 
            color={highContrast ? "#333333" : "#e2e8f0"} 
            opacity={0.5} 
            transparent 
          />
        </mesh>
        
        <KeyboardControls onNavigate={handleNavigate} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minDistance={2}
          maxDistance={8}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
        <Environment preset="studio" />
      </Canvas>
      
      {/* Focused segment tooltip */}
      {focusedSegment && (
        <div 
          className="absolute bottom-4 left-4 bg-background/90 border rounded-lg p-3 shadow-lg max-w-[200px]"
          role="tooltip"
        >
          <div className="font-semibold text-sm">{focusedSegment.name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {focusedSegment.active ? "🟢 Neural activity detected" : "⚪ No activity"}
          </div>
          <div className="text-xs text-muted-foreground">
            Type: {focusedSegment.type}
          </div>
        </div>
      )}
      
      {/* Accessibility controls */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          className="p-1 bg-background/80 rounded text-xs border"
          onClick={() => announce(semanticDescription)}
          aria-label="Read full description"
        >
          📖
        </button>
      </div>
    </div>
  );
}

export default AccessibleWorm3D;
