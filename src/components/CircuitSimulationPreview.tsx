import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Timer,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CircuitAnnotations } from "@/components/CircuitAnnotations";

interface Neuron {
  id: string;
  x: number;
  y: number;
  type?: string;
}

interface Connection {
  from: string;
  to: string;
  type: string;
}

interface CircuitData {
  neurons: Neuron[];
  connections: Connection[];
}

interface SignalParticle {
  id: string;
  connectionIndex: number;
  progress: number;
  type: string;
}

interface CircuitSimulationPreviewProps {
  circuit: CircuitData;
  circuitId?: string;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  showAnnotations?: boolean;
  height?: number;
}

const stimulusOptions = [
  { value: "sensory", label: "Sensory Input", description: "Start from sensory neurons" },
  { value: "all", label: "All Neurons", description: "Activate all neurons simultaneously" },
  { value: "random", label: "Random", description: "Random neuron activation" },
];

const neuronTypeColors: Record<string, { fill: string; stroke: string; glow: string }> = {
  sensory: { 
    fill: "hsl(var(--chart-1))", 
    stroke: "hsl(var(--foreground))",
    glow: "hsl(var(--chart-1) / 0.5)"
  },
  motor: { 
    fill: "hsl(var(--chart-2))", 
    stroke: "hsl(var(--foreground))",
    glow: "hsl(var(--chart-2) / 0.5)"
  },
  interneuron: { 
    fill: "hsl(var(--chart-3))", 
    stroke: "hsl(var(--foreground))",
    glow: "hsl(var(--chart-3) / 0.5)"
  },
  command: { 
    fill: "hsl(var(--chart-4))", 
    stroke: "hsl(var(--foreground))",
    glow: "hsl(var(--chart-4) / 0.5)"
  },
  muscle: { 
    fill: "hsl(var(--chart-5))", 
    stroke: "hsl(var(--foreground))",
    glow: "hsl(var(--chart-5) / 0.5)"
  },
  default: { 
    fill: "hsl(var(--primary))", 
    stroke: "hsl(var(--foreground))",
    glow: "hsl(var(--primary) / 0.5)"
  },
};

export function CircuitSimulationPreview({
  circuit,
  circuitId,
  className,
  autoPlay = false,
  showControls = true,
  showAnnotations = false,
  height = 300,
}: CircuitSimulationPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const [stimulus, setStimulus] = useState("sensory");
  const [activeNeurons, setActiveNeurons] = useState<Set<string>>(new Set());
  const [signals, setSignals] = useState<SignalParticle[]>([]);
  const [signalCounter, setSignalCounter] = useState(0);
  const [simulationTime, setSimulationTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Get starting neurons based on stimulus type
  const getStartingNeurons = useCallback(() => {
    switch (stimulus) {
      case "sensory":
        return circuit.neurons
          .filter((n) => n.type === "sensory")
          .map((n) => n.id);
      case "all":
        return circuit.neurons.map((n) => n.id);
      case "random":
        const shuffled = [...circuit.neurons].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.max(1, Math.floor(circuit.neurons.length / 3))).map((n) => n.id);
      default:
        return circuit.neurons.slice(0, 1).map((n) => n.id);
    }
  }, [circuit.neurons, stimulus]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setActiveNeurons(new Set());
    setSignals([]);
    setSignalCounter(0);
    setSimulationTime(0);
  }, []);

  // Start simulation
  const startSimulation = useCallback(() => {
    resetSimulation();
    const startNeurons = getStartingNeurons();
    setActiveNeurons(new Set(startNeurons));
    
    // Create initial signals from starting neurons
    const initialSignals: SignalParticle[] = [];
    startNeurons.forEach((neuronId) => {
      circuit.connections.forEach((conn, idx) => {
        if (conn.from === neuronId) {
          initialSignals.push({
            id: `signal-${signalCounter + initialSignals.length}`,
            connectionIndex: idx,
            progress: 0,
            type: conn.type,
          });
        }
      });
    });
    
    setSignals(initialSignals);
    setSignalCounter((prev) => prev + initialSignals.length);
    setIsPlaying(true);
  }, [circuit.connections, getStartingNeurons, resetSimulation, signalCounter]);

  // Simulation tick
  useEffect(() => {
    if (!isPlaying || signals.length === 0) return;

    const interval = setInterval(() => {
      setSimulationTime((prev) => prev + 16 * speed);
      
      setSignals((prevSignals) => {
        const updatedSignals: SignalParticle[] = [];
        const newSignals: SignalParticle[] = [];
        const newlyActivated = new Set<string>();

        prevSignals.forEach((signal) => {
          const newProgress = signal.progress + 0.02 * speed;

          if (newProgress >= 1) {
            // Signal reached destination
            const conn = circuit.connections[signal.connectionIndex];
            if (conn) {
              newlyActivated.add(conn.to);
              
              // Spawn new signals from the activated neuron
              circuit.connections.forEach((nextConn, idx) => {
                if (nextConn.from === conn.to) {
                  // Add some randomness to signal spawning for visual interest
                  if (Math.random() > 0.3) {
                    newSignals.push({
                      id: `signal-${signalCounter + newSignals.length}`,
                      connectionIndex: idx,
                      progress: 0,
                      type: nextConn.type,
                    });
                  }
                }
              });
            }
          } else {
            updatedSignals.push({ ...signal, progress: newProgress });
          }
        });

        if (newlyActivated.size > 0) {
          setActiveNeurons((prev) => new Set([...prev, ...newlyActivated]));
        }

        setSignalCounter((prev) => prev + newSignals.length);
        return [...updatedSignals, ...newSignals];
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, signals.length, speed, circuit.connections, signalCounter]);

  // Auto-restart when all signals complete
  useEffect(() => {
    if (isPlaying && signals.length === 0 && activeNeurons.size > 0) {
      const timeout = setTimeout(() => {
        startSimulation();
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, signals.length, activeNeurons.size, startSimulation]);

  // Calculate positions for SVG
  const viewBox = { width: 400, height: height };
  const padding = 30;

  const getNeuronPosition = useCallback((neuron: Neuron) => ({
    x: (neuron.x / 100) * (viewBox.width - padding * 2) + padding,
    y: (neuron.y / 100) * (viewBox.height - padding * 2) + padding,
  }), [viewBox.width, viewBox.height]);

  const getSignalPosition = useCallback((signal: SignalParticle) => {
    const conn = circuit.connections[signal.connectionIndex];
    if (!conn) return null;

    const fromNeuron = circuit.neurons.find((n) => n.id === conn.from);
    const toNeuron = circuit.neurons.find((n) => n.id === conn.to);
    if (!fromNeuron || !toNeuron) return null;

    const from = getNeuronPosition(fromNeuron);
    const to = getNeuronPosition(toNeuron);

    return {
      x: from.x + (to.x - from.x) * signal.progress,
      y: from.y + (to.y - from.y) * signal.progress,
    };
  }, [circuit.connections, circuit.neurons, getNeuronPosition]);

  const neuronColors = useMemo(() => {
    const colors: Record<string, typeof neuronTypeColors.default> = {};
    circuit.neurons.forEach((n) => {
      colors[n.id] = neuronTypeColors[n.type || "default"] || neuronTypeColors.default;
    });
    return colors;
  }, [circuit.neurons]);

  return (
    <div className={cn("bg-card border-2 border-foreground rounded-lg overflow-hidden relative", className)}>
      {/* Annotations overlay */}
      {showAnnotations && circuitId && (
        <CircuitAnnotations
          circuitId={circuitId}
          neurons={circuit.neurons}
          viewBox={viewBox}
          padding={padding}
        />
      )}
      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        className="w-full"
        style={{ height: `${height}px`, background: "hsl(var(--background))" }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="sim-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.3"
              strokeOpacity="0.2"
            />
          </pattern>

          {/* Glow filters */}
          <filter id="glow-active" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-signal" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Arrow markers */}
          <marker
            id="arrow-sim-exc"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="hsl(var(--primary))" />
          </marker>
          <marker
            id="arrow-sim-inh"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="hsl(var(--destructive))" />
          </marker>
        </defs>

        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#sim-grid)" />

        {/* Connections */}
        {circuit.connections.map((conn, i) => {
          const fromNeuron = circuit.neurons.find((n) => n.id === conn.from);
          const toNeuron = circuit.neurons.find((n) => n.id === conn.to);
          if (!fromNeuron || !toNeuron) return null;

          const from = getNeuronPosition(fromNeuron);
          const to = getNeuronPosition(toNeuron);
          const isExcitatory = conn.type === "excitatory";
          const hasActiveSignal = signals.some((s) => s.connectionIndex === i);

          return (
            <g key={`conn-${i}`}>
              {/* Connection line */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isExcitatory ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                strokeWidth={hasActiveSignal ? 3 : 2}
                strokeOpacity={hasActiveSignal ? 1 : 0.4}
                markerEnd={isExcitatory ? "url(#arrow-sim-exc)" : "url(#arrow-sim-inh)"}
                className="transition-all duration-150"
              />
              
              {/* Active signal glow on connection */}
              {hasActiveSignal && (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isExcitatory ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                  strokeWidth={6}
                  strokeOpacity={0.3}
                  filter="url(#glow-signal)"
                />
              )}
            </g>
          );
        })}

        {/* Neurons */}
        {circuit.neurons.map((neuron) => {
          const pos = getNeuronPosition(neuron);
          const isActive = activeNeurons.has(neuron.id);
          const colors = neuronColors[neuron.id];

          return (
            <g key={neuron.id}>
              {/* Outer glow for active neurons */}
              {isActive && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={22}
                  fill={colors.glow}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  filter="url(#glow-active)"
                />
              )}

              {/* Neuron circle */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={16}
                fill={colors.fill}
                stroke={isActive ? "hsl(var(--foreground))" : colors.stroke}
                strokeWidth={isActive ? 3 : 2}
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Neuron label */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--foreground))"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                className="select-none pointer-events-none"
              >
                {neuron.id}
              </text>

              {/* Type label below */}
              {neuron.type && (
                <text
                  x={pos.x}
                  y={pos.y + 24}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="7"
                  className="select-none pointer-events-none"
                >
                  {neuron.type}
                </text>
              )}
            </g>
          );
        })}

        {/* Signal particles */}
        <AnimatePresence>
          {signals.map((signal) => {
            const pos = getSignalPosition(signal);
            if (!pos) return null;

            const isExcitatory = signal.type === "excitatory";

            return (
              <motion.g key={signal.id}>
                {/* Signal glow */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  fill={isExcitatory ? "hsl(var(--primary) / 0.4)" : "hsl(var(--destructive) / 0.4)"}
                  filter="url(#glow-signal)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                
                {/* Signal core */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={6}
                  fill={isExcitatory ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Status overlay when paused */}
        {!isPlaying && signals.length === 0 && activeNeurons.size === 0 && (
          <g>
            <rect
              x={viewBox.width / 2 - 60}
              y={viewBox.height / 2 - 15}
              width={120}
              height={30}
              rx={4}
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
            />
            <text
              x={viewBox.width / 2}
              y={viewBox.height / 2 + 5}
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="12"
              fontFamily="sans-serif"
            >
              Press Play to simulate
            </text>
          </g>
        )}
      </svg>

      {/* Controls */}
      {showControls && (
        <div className="p-3 border-t border-border bg-muted/30 space-y-3">
          {/* Main controls */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isPlaying ? "secondary" : "default"}
                    onClick={() => {
                      if (!isPlaying && signals.length === 0) {
                        startSimulation();
                      } else {
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className="gap-1"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {signals.length > 0 ? "Resume" : "Simulate"}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPlaying ? "Pause simulation" : "Start signal propagation"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetSimulation}
                    disabled={activeNeurons.size === 0 && signals.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset simulation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex-1" />

            {/* Stats */}
            <Badge variant="outline" className="gap-1 text-xs">
              <Zap className="w-3 h-3" />
              {activeNeurons.size} / {circuit.neurons.length}
            </Badge>

            <Badge variant="secondary" className="gap-1 text-xs">
              <Activity className="w-3 h-3" />
              {signals.length}
            </Badge>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      Speed: {speed}x
                    </label>
                    <Slider
                      value={[speed]}
                      onValueChange={([v]) => setSpeed(v)}
                      min={0.25}
                      max={3}
                      step={0.25}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Stimulus
                    </label>
                    <Select value={stimulus} onValueChange={setStimulus}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stimulusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div>
                              <p className="text-xs font-medium">{opt.label}</p>
                              <p className="text-xs text-muted-foreground">{opt.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-1))" }} />
              <span className="text-muted-foreground">Sensory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-3))" }} />
              <span className="text-muted-foreground">Interneuron</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-2))" }} />
              <span className="text-muted-foreground">Motor</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Excitatory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-destructive" />
              <span className="text-muted-foreground">Inhibitory</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
