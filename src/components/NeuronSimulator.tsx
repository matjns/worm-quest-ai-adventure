import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Zap, Brain, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Neuron {
  id: number;
  name: string;
  x: number;
  y: number;
  type: "sensory" | "motor" | "interneuron";
  active: boolean;
}

interface Connection {
  from: number;
  to: number;
  weight: number;
}

const SAMPLE_NEURONS: Neuron[] = [
  { id: 0, name: "ASEL", x: 100, y: 100, type: "sensory", active: false },
  { id: 1, name: "ASER", x: 100, y: 200, type: "sensory", active: false },
  { id: 2, name: "AIYL", x: 200, y: 120, type: "interneuron", active: false },
  { id: 3, name: "AIYR", x: 200, y: 180, type: "interneuron", active: false },
  { id: 4, name: "AIZL", x: 300, y: 150, type: "interneuron", active: false },
  { id: 5, name: "SMBD", x: 400, y: 120, type: "motor", active: false },
  { id: 6, name: "SMBV", x: 400, y: 180, type: "motor", active: false },
];

const SAMPLE_CONNECTIONS: Connection[] = [
  { from: 0, to: 2, weight: 0.8 },
  { from: 1, to: 3, weight: 0.7 },
  { from: 2, to: 4, weight: 0.9 },
  { from: 3, to: 4, weight: 0.6 },
  { from: 4, to: 5, weight: 0.85 },
  { from: 4, to: 6, weight: 0.75 },
];

// Canvas requires actual color values, not CSS variables
const typeColors = {
  sensory: { h: 200, s: 98, l: 39 },    // primary blue
  motor: { h: 142, s: 76, l: 36 },       // accent green
  interneuron: { h: 280, s: 65, l: 50 }, // purple
};

const hslToString = (color: { h: number; s: number; l: number }, alpha: number = 1) => {
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
};

interface NeuronSimulatorProps {
  className?: string;
  onScoreChange?: (score: number) => void;
}

export function NeuronSimulator({ className, onScoreChange }: NeuronSimulatorProps) {
  const [neurons, setNeurons] = useState(SAMPLE_NEURONS);
  const [connections, setConnections] = useState(SAMPLE_CONNECTIONS);
  const [isRunning, setIsRunning] = useState(false);
  const [stimulusStrength, setStimulusStrength] = useState([50]);
  const [selectedNeuron, setSelectedNeuron] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activateSensory = () => {
    const threshold = stimulusStrength[0] / 100;
    setNeurons((prev) =>
      prev.map((n) =>
        n.type === "sensory" ? { ...n, active: Math.random() < threshold } : n
      )
    );
    setScore((s) => s + 10);
    onScoreChange?.(score + 10);
  };

  const propagateSignal = () => {
    setNeurons((prev) => {
      const newNeurons = [...prev];
      
      connections.forEach((conn) => {
        const fromNeuron = newNeurons[conn.from];
        const toNeuron = newNeurons[conn.to];
        
        if (fromNeuron.active && conn.weight > 0.5) {
          newNeurons[conn.to] = { ...toNeuron, active: true };
        }
      });
      
      return newNeurons;
    });
  };

  const reset = () => {
    setNeurons(SAMPLE_NEURONS);
    setIsRunning(false);
    setSelectedNeuron(null);
  };

  const updateConnectionWeight = (index: number, weight: number) => {
    setConnections((prev) =>
      prev.map((c, i) => (i === index ? { ...c, weight } : c))
    );
    setScore((s) => s + 5);
    onScoreChange?.(score + 5);
  };

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(propagateSignal, 500);
    return () => clearInterval(interval);
  }, [isRunning, connections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas-compatible colors for non-themed elements
    const borderColor = "hsla(240, 5%, 65%, 1)";
    const mutedColor = "hsla(240, 5%, 65%, 0.5)";
    const foregroundColor = "hsla(222, 47%, 11%, 1)";

    // Draw connections
    connections.forEach((conn) => {
      const from = neurons[conn.from];
      const to = neurons[conn.to];

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = from.active && to.active
        ? hslToString(typeColors[from.type])
        : borderColor;
      ctx.lineWidth = conn.weight * 4;
      ctx.stroke();

      // Pulse animation
      if (from.active) {
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        ctx.beginPath();
        ctx.arc(midX, midY, 4, 0, Math.PI * 2);
        ctx.fillStyle = hslToString(typeColors[from.type]);
        ctx.fill();
      }
    });

    // Draw neurons
    neurons.forEach((neuron) => {
      const isSelected = selectedNeuron === neuron.id;
      
      // Glow for active neurons
      if (neuron.active) {
        const gradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, 30
        );
        gradient.addColorStop(0, hslToString(typeColors[neuron.type], 0.5));
        gradient.addColorStop(1, "transparent");
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Neuron body
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, isSelected ? 18 : 15, 0, Math.PI * 2);
      ctx.fillStyle = neuron.active ? hslToString(typeColors[neuron.type]) : mutedColor;
      ctx.fill();
      ctx.strokeStyle = isSelected ? hslToString(typeColors[neuron.type]) : foregroundColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = "bold 10px 'Space Mono'";
      ctx.fillStyle = foregroundColor;
      ctx.textAlign = "center";
      ctx.fillText(neuron.name, neuron.x, neuron.y + 30);
    });
  }, [neurons, connections, selectedNeuron]);

  return (
    <div className={cn("bg-card border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]", className)}>
      {/* Header */}
      <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-bold uppercase tracking-tight">Neural Simulator</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">Score: {score}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-background">
        <canvas
          ref={canvasRef}
          width={500}
          height={300}
          className="w-full cursor-pointer"
          onClick={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = (e.clientX - rect.left) * (500 / rect.width);
            const y = (e.clientY - rect.top) * (300 / rect.height);
            
            const clicked = neurons.find(
              (n) => Math.abs(n.x - x) < 20 && Math.abs(n.y - y) < 20
            );
            setSelectedNeuron(clicked?.id ?? null);
          }}
        />

        {/* Legend */}
        <div className="absolute top-2 right-2 bg-card/90 border-2 border-foreground p-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: hslToString(typeColors.sensory) }} />
            <span>Sensory</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: hslToString(typeColors.interneuron) }} />
            <span>Interneuron</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: hslToString(typeColors.motor) }} />
            <span>Motor</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t-2 border-foreground space-y-4">
        {/* Stimulus control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold uppercase">Stimulus Strength</span>
            <span className="font-mono text-sm">{stimulusStrength[0]}%</span>
          </div>
          <Slider
            value={stimulusStrength}
            onValueChange={setStimulusStrength}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="brutal"
            onClick={activateSensory}
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-2" />
            Stimulate
          </Button>
          <Button
            variant={isRunning ? "destructive" : "default"}
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run
              </>
            )}
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection weights */}
        {selectedNeuron !== null && (
          <div className="p-3 border-2 border-foreground bg-muted/50">
            <h4 className="font-bold text-sm uppercase mb-2">
              <Activity className="w-4 h-4 inline mr-1" />
              {neurons[selectedNeuron]?.name} Connections
            </h4>
            {connections
              .map((c, i) => ({ ...c, index: i }))
              .filter((c) => c.from === selectedNeuron || c.to === selectedNeuron)
              .map((conn) => (
                <div key={conn.index} className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono w-24">
                    {neurons[conn.from]?.name} → {neurons[conn.to]?.name}
                  </span>
                  <Slider
                    value={[conn.weight * 100]}
                    onValueChange={([v]) => updateConnectionWeight(conn.index, v / 100)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-8">{(conn.weight * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}