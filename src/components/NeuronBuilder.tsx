import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, ArrowRight, RotateCcw, CheckCircle, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GhostIcon } from "./ArcadeScreen";
import { TeacherScript, TEACHER_SCRIPTS } from "./TeacherScript";

type AgeGroup = "prek" | "k5" | "middle" | "high";

interface Neuron {
  id: string;
  name: string;
  type: "sensory" | "inter" | "motor";
  x: number;
  y: number;
  color: string;
  emoji: string;
}

interface Connection {
  from: string;
  to: string;
}

interface NeuronBuilderProps {
  ageGroup: AgeGroup;
  onCircuitComplete?: (connections: Connection[]) => void;
  className?: string;
}

// Age-appropriate neuron sets
const NEURON_SETS: Record<AgeGroup, Neuron[]> = {
  prek: [
    { id: "touch", name: "Touch", type: "sensory", x: 80, y: 120, color: "hsl(340 100% 60%)", emoji: "👆" },
    { id: "brain", name: "Brain", type: "inter", x: 200, y: 120, color: "hsl(280 100% 60%)", emoji: "🧠" },
    { id: "wiggle", name: "Wiggle", type: "motor", x: 320, y: 120, color: "hsl(175 100% 50%)", emoji: "🐛" },
  ],
  k5: [
    { id: "see", name: "See", type: "sensory", x: 70, y: 70, color: "hsl(340 100% 60%)", emoji: "👁️" },
    { id: "smell", name: "Smell", type: "sensory", x: 70, y: 170, color: "hsl(25 100% 55%)", emoji: "👃" },
    { id: "think1", name: "Think", type: "inter", x: 190, y: 120, color: "hsl(280 100% 60%)", emoji: "💭" },
    { id: "move", name: "Move", type: "motor", x: 310, y: 80, color: "hsl(175 100% 50%)", emoji: "➡️" },
    { id: "stop", name: "Stop", type: "motor", x: 310, y: 160, color: "hsl(0 100% 50%)", emoji: "🛑" },
  ],
  middle: [
    { id: "ASHL", name: "ASHL", type: "sensory", x: 50, y: 60, color: "hsl(340 100% 60%)", emoji: "S" },
    { id: "ASHR", name: "ASHR", type: "sensory", x: 50, y: 140, color: "hsl(340 100% 60%)", emoji: "S" },
    { id: "AWCL", name: "AWCL", type: "sensory", x: 50, y: 220, color: "hsl(25 100% 55%)", emoji: "S" },
    { id: "AVAL", name: "AVAL", type: "inter", x: 180, y: 100, color: "hsl(280 100% 60%)", emoji: "I" },
    { id: "AVAR", name: "AVAR", type: "inter", x: 180, y: 180, color: "hsl(280 100% 60%)", emoji: "I" },
    { id: "DA1", name: "DA1", type: "motor", x: 320, y: 80, color: "hsl(175 100% 50%)", emoji: "M" },
    { id: "VA1", name: "VA1", type: "motor", x: 320, y: 160, color: "hsl(175 100% 50%)", emoji: "M" },
    { id: "DB1", name: "DB1", type: "motor", x: 320, y: 240, color: "hsl(45 100% 50%)", emoji: "M" },
  ],
  high: [
    { id: "ASHL", name: "ASHL", type: "sensory", x: 40, y: 40, color: "hsl(340 100% 60%)", emoji: "" },
    { id: "ASHR", name: "ASHR", type: "sensory", x: 40, y: 100, color: "hsl(340 100% 60%)", emoji: "" },
    { id: "AWCL", name: "AWCL", type: "sensory", x: 40, y: 160, color: "hsl(25 100% 55%)", emoji: "" },
    { id: "AWCR", name: "AWCR", type: "sensory", x: 40, y: 220, color: "hsl(25 100% 55%)", emoji: "" },
    { id: "AVAL", name: "AVAL", type: "inter", x: 150, y: 70, color: "hsl(280 100% 60%)", emoji: "" },
    { id: "AVAR", name: "AVAR", type: "inter", x: 150, y: 130, color: "hsl(280 100% 60%)", emoji: "" },
    { id: "AVBL", name: "AVBL", type: "inter", x: 150, y: 190, color: "hsl(280 100% 60%)", emoji: "" },
    { id: "DA1", name: "DA1", type: "motor", x: 270, y: 50, color: "hsl(175 100% 50%)", emoji: "" },
    { id: "VA1", name: "VA1", type: "motor", x: 270, y: 110, color: "hsl(175 100% 50%)", emoji: "" },
    { id: "DB1", name: "DB1", type: "motor", x: 270, y: 170, color: "hsl(45 100% 50%)", emoji: "" },
    { id: "VB1", name: "VB1", type: "motor", x: 270, y: 230, color: "hsl(45 100% 50%)", emoji: "" },
  ],
};

// Target circuits for validation
const TARGET_CIRCUITS: Record<AgeGroup, Connection[]> = {
  prek: [{ from: "touch", to: "brain" }, { from: "brain", to: "wiggle" }],
  k5: [{ from: "see", to: "think1" }, { from: "think1", to: "move" }],
  middle: [{ from: "ASHL", to: "AVAL" }, { from: "AVAL", to: "DA1" }],
  high: [{ from: "ASHL", to: "AVAL" }, { from: "AVAL", to: "DA1" }, { from: "AWCL", to: "AVBL" }, { from: "AVBL", to: "DB1" }],
};

export function NeuronBuilder({ ageGroup, onCircuitComplete, className }: NeuronBuilderProps) {
  const neurons = NEURON_SETS[ageGroup];
  const targetCircuit = TARGET_CIRCUITS[ageGroup];
  const isSimpleMode = ageGroup === "prek" || ageGroup === "k5";
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [wireStart, setWireStart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [activeNeurons, setActiveNeurons] = useState<Set<string>>(new Set());
  
  const svgRef = useRef<SVGSVGElement>(null);

  const getNeuronById = (id: string) => neurons.find(n => n.id === id);

  // Simple tap-to-connect for younger kids
  const handleNeuronTap = (neuron: Neuron) => {
    if (!isSimpleMode) return;
    
    if (!selectedNeuron) {
      setSelectedNeuron(neuron.id);
      setActiveNeurons(new Set([neuron.id]));
    } else if (selectedNeuron !== neuron.id) {
      const existing = connections.find(c => c.from === selectedNeuron && c.to === neuron.id);
      if (!existing) {
        const newConnections = [...connections, { from: selectedNeuron, to: neuron.id }];
        setConnections(newConnections);
        checkCircuitComplete(newConnections);
      }
      setSelectedNeuron(null);
      setActiveNeurons(new Set());
    } else {
      setSelectedNeuron(null);
      setActiveNeurons(new Set());
    }
  };

  // Wire-based connections for older students
  const handleWireStart = (neuron: Neuron, e: React.MouseEvent | React.TouchEvent) => {
    if (isSimpleMode) return;
    e.preventDefault();
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setWireStart({ id: neuron.id, x: neuron.x, y: neuron.y });
    setActiveNeurons(new Set([neuron.id]));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wireStart || isSimpleMode) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!wireStart || isSimpleMode) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    setMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleWireEnd = (neuron: Neuron) => {
    if (!wireStart || wireStart.id === neuron.id || isSimpleMode) return;
    
    const existing = connections.find(c => c.from === wireStart.id && c.to === neuron.id);
    if (!existing) {
      const newConnections = [...connections, { from: wireStart.id, to: neuron.id }];
      setConnections(newConnections);
      checkCircuitComplete(newConnections);
    }
    
    setWireStart(null);
    setActiveNeurons(new Set());
  };

  const handleCanvasRelease = () => {
    setWireStart(null);
    setActiveNeurons(new Set());
  };

  const checkCircuitComplete = (currentConnections: Connection[]) => {
    const hasAllTargets = targetCircuit.every(target => 
      currentConnections.some(c => c.from === target.from && c.to === target.to)
    );
    
    if (hasAllTargets) {
      setIsComplete(true);
      // Animate signal flow
      animateSignal();
      onCircuitComplete?.(currentConnections);
    }
  };

  const animateSignal = () => {
    const sensoryNeurons = neurons.filter(n => n.type === "sensory").map(n => n.id);
    let step = 0;
    
    const animate = () => {
      if (step > 5) {
        setActiveNeurons(new Set());
        return;
      }
      
      const active = new Set<string>();
      connections.forEach(conn => {
        if (step === 0 && sensoryNeurons.includes(conn.from)) {
          active.add(conn.from);
        }
        if (step > 0) {
          connections.forEach(c => {
            if (active.has(c.from) || sensoryNeurons.includes(c.from)) {
              active.add(c.to);
            }
          });
        }
      });
      
      sensoryNeurons.forEach(id => active.add(id));
      setActiveNeurons(active);
      step++;
      setTimeout(animate, 300);
    };
    
    animate();
  };

  const resetCircuit = () => {
    setConnections([]);
    setSelectedNeuron(null);
    setWireStart(null);
    setIsComplete(false);
    setActiveNeurons(new Set());
  };

  const neuronSize = isSimpleMode ? 55 : 35;
  const canvasWidth = 400;
  const canvasHeight = isSimpleMode ? 240 : 280;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Instructions */}
      <TeacherScript
        script={isSimpleMode 
          ? "Tap one neuron, then tap another to connect them! Make the signal flow from left to right!"
          : "Drag a wire from one neuron to another. Connect sensory neurons through interneurons to motor neurons!"
        }
        ageGroup={ageGroup}
        className="mb-4"
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs font-arcade uppercase">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(340_100%_60%)]" />
          <span>Sensory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(280_100%_60%)]" />
          <span>Inter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(175_100%_50%)]" />
          <span>Motor</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-card/50 backdrop-blur border-2 border-foreground rounded-xl overflow-hidden shadow-[4px_4px_0px_hsl(var(--foreground))]">
        <svg
          ref={svgRef}
          width="100%"
          height={canvasHeight}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="touch-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={handleCanvasRelease}
          onTouchEnd={handleCanvasRelease}
          onMouseLeave={handleCanvasRelease}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="hsl(var(--muted-foreground) / 0.2)" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {connections.map((conn, i) => {
            const from = getNeuronById(conn.from);
            const to = getNeuronById(conn.to);
            if (!from || !to) return null;
            
            const isActive = activeNeurons.has(conn.from) || activeNeurons.has(conn.to);
            
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isActive ? "hsl(45 100% 50%)" : "hsl(var(--foreground) / 0.5)"}
                  strokeWidth={isSimpleMode ? 6 : 3}
                  strokeLinecap="round"
                  filter={isActive ? "url(#glow)" : undefined}
                  className="transition-all duration-300"
                />
                {/* Arrow */}
                <polygon
                  points={`0,-${isSimpleMode ? 8 : 5} ${isSimpleMode ? 12 : 8},0 0,${isSimpleMode ? 8 : 5}`}
                  fill={isActive ? "hsl(45 100% 50%)" : "hsl(var(--foreground))"}
                  transform={`translate(${to.x - (to.x - from.x) * 0.2}, ${to.y - (to.y - from.y) * 0.2}) rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI})`}
                />
              </g>
            );
          })}

          {/* Active wire being drawn */}
          {wireStart && (
            <line
              x1={wireStart.x}
              y1={wireStart.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="hsl(45 100% 50%)"
              strokeWidth={3}
              strokeDasharray="8 4"
              filter="url(#glow)"
            />
          )}

          {/* Neurons */}
          {neurons.map((neuron) => {
            const isSelected = selectedNeuron === neuron.id;
            const isActive = activeNeurons.has(neuron.id);
            const isWireSource = wireStart?.id === neuron.id;
            
            return (
              <g
                key={neuron.id}
                className="cursor-pointer"
                onClick={() => handleNeuronTap(neuron)}
                onMouseDown={(e) => handleWireStart(neuron, e)}
                onTouchStart={(e) => handleWireStart(neuron, e)}
                onMouseUp={() => handleWireEnd(neuron)}
                onTouchEnd={() => handleWireEnd(neuron)}
              >
                {/* Glow ring */}
                {(isSelected || isActive || isWireSource) && (
                  <circle
                    cx={neuron.x}
                    cy={neuron.y}
                    r={neuronSize / 2 + 8}
                    fill="none"
                    stroke="hsl(45 100% 50%)"
                    strokeWidth={3}
                    opacity={0.6}
                    className="animate-pulse"
                  />
                )}
                
                {/* Neuron body */}
                <circle
                  cx={neuron.x}
                  cy={neuron.y}
                  r={neuronSize / 2}
                  fill={neuron.color}
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  filter={isActive ? "url(#glow)" : undefined}
                  className="transition-all duration-200"
                />
                
                {/* Label */}
                {isSimpleMode ? (
                  <text
                    x={neuron.x}
                    y={neuron.y + 5}
                    textAnchor="middle"
                    fontSize={20}
                    className="pointer-events-none select-none"
                  >
                    {neuron.emoji}
                  </text>
                ) : (
                  <text
                    x={neuron.x}
                    y={neuron.y + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fontFamily="var(--font-arcade)"
                    fill="white"
                    className="pointer-events-none select-none"
                  >
                    {neuron.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Completion overlay */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-2">
                  <GhostIcon color="pinky" animated />
                  <GhostIcon color="blinky" animated />
                  <GhostIcon color="inky" animated />
                  <GhostIcon color="clyde" animated />
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                  <span className="font-arcade text-xl text-accent uppercase">Circuit Complete!</span>
                </div>
                <p className="font-speak text-lg text-muted-foreground">
                  {ageGroup === "prek" || ageGroup === "k5" 
                    ? "Your worm is wiggling! Great job! 🐛"
                    : "Signal successfully propagated through the neural pathway."
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={resetCircuit} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Try Again
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="text-xs font-mono text-muted-foreground">
          Connections: {connections.length} / {targetCircuit.length} needed
        </div>
        <Button 
          onClick={resetCircuit} 
          variant="outline" 
          size="sm"
          className="font-arcade text-xs"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Hint */}
      {!isComplete && connections.length > 0 && connections.length < targetCircuit.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          {isSimpleMode 
            ? "Keep connecting! Make the signal flow from Touch to Brain to Wiggle!"
            : "Connect sensory neurons → interneurons → motor neurons to complete the reflex arc."
          }
        </motion.div>
      )}
    </div>
  );
}
