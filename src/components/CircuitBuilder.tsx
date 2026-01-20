import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Activity, 
  Link2, 
  Trash2, 
  RotateCcw,
  Sparkles,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  NEURON_PALETTE, 
  NEURON_COLORS, 
  NeuronData,
  ConnectionData 
} from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  canvasX: number;
  canvasY: number;
}

interface CircuitBuilderProps {
  onCircuitChange: (neurons: PlacedNeuron[], connections: ConnectionData[]) => void;
  highlightedNeurons?: string[];
  activeNeurons?: string[];
  recommendedNeurons?: string[];
  className?: string;
}

export function CircuitBuilder({
  onCircuitChange,
  highlightedNeurons = [],
  activeNeurons = [],
  recommendedNeurons = [],
  className,
}: CircuitBuilderProps) {
  const [placedNeurons, setPlacedNeurons] = useState<PlacedNeuron[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectionType, setConnectionType] = useState<"chemical" | "electrical">("chemical");
  const [draggedNeuron, setDraggedNeuron] = useState<NeuronData | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDragStart = (neuron: NeuronData) => {
    setDraggedNeuron(neuron);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNeuron || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if neuron already placed
    if (placedNeurons.some(n => n.id === draggedNeuron.id)) {
      setDraggedNeuron(null);
      return;
    }

    const newNeuron: PlacedNeuron = {
      ...draggedNeuron,
      canvasX: Math.max(30, Math.min(x, rect.width - 30)),
      canvasY: Math.max(30, Math.min(y, rect.height - 30)),
    };

    setPlacedNeurons(prev => [...prev, newNeuron]);
    setDraggedNeuron(null);
  };

  const handleNeuronClick = (neuronId: string) => {
    if (connectMode && selectedNeuron && selectedNeuron !== neuronId) {
      // Create connection
      const newConnection: ConnectionData = {
        from: selectedNeuron,
        to: neuronId,
        type: connectionType,
        weight: 10,
      };
      
      // Check if connection already exists
      const exists = connections.some(
        c => c.from === selectedNeuron && c.to === neuronId
      );
      
      if (!exists) {
        setConnections(prev => [...prev, newConnection]);
      }
      setSelectedNeuron(null);
      setConnectMode(false);
    } else {
      setSelectedNeuron(neuronId);
    }
  };

  const removeNeuron = (neuronId: string) => {
    setPlacedNeurons(prev => prev.filter(n => n.id !== neuronId));
    setConnections(prev => prev.filter(c => c.from !== neuronId && c.to !== neuronId));
    if (selectedNeuron === neuronId) setSelectedNeuron(null);
  };

  const removeConnection = (from: string, to: string) => {
    setConnections(prev => prev.filter(c => !(c.from === from && c.to === to)));
  };

  const resetCircuit = () => {
    setPlacedNeurons([]);
    setConnections([]);
    setSelectedNeuron(null);
    setConnectMode(false);
  };

  // Notify parent of changes
  useEffect(() => {
    onCircuitChange(placedNeurons, connections);
  }, [placedNeurons, connections, onCircuitChange]);

  const getNeuronPosition = (id: string) => {
    return placedNeurons.find(n => n.id === id);
  };

  return (
    <div className={cn("flex flex-col lg:flex-row gap-4", className)}>
      {/* Neuron Palette */}
      <div className="lg:w-64 bg-card border-2 border-foreground rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-bold uppercase text-sm">Neuron Palette</h3>
        </div>
        
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {["sensory", "interneuron", "command", "motor"].map(type => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: NEURON_COLORS[type as keyof typeof NEURON_COLORS] }}
                />
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  {type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {NEURON_PALETTE.filter(n => n.type === type).map(neuron => {
                  const isPlaced = placedNeurons.some(n => n.id === neuron.id);
                  const isRecommended = recommendedNeurons.includes(neuron.id);
                  
                  return (
                    <div
                      key={neuron.id}
                      draggable={!isPlaced}
                      onDragStart={() => handleDragStart(neuron)}
                      className={cn(
                        "px-2 py-1 text-xs font-mono rounded-md border-2 cursor-grab transition-all",
                        isPlaced 
                          ? "opacity-40 cursor-not-allowed bg-muted border-muted-foreground/30" 
                          : "bg-background border-foreground hover:scale-105 hover:shadow-md",
                        isRecommended && !isPlaced && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ 
                        borderColor: isPlaced ? undefined : NEURON_COLORS[neuron.type],
                      }}
                      title={neuron.description}
                    >
                      <div className="flex items-center gap-1">
                        {!isPlaced && <GripVertical className="w-3 h-3 opacity-50" />}
                        {neuron.name}
                        {isRecommended && !isPlaced && <Sparkles className="w-3 h-3 text-primary" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Button
            variant={connectMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setConnectMode(!connectMode);
              if (!connectMode) setSelectedNeuron(null);
            }}
            className="rounded-lg"
          >
            <Link2 className="w-4 h-4 mr-1" />
            Connect
          </Button>
          
          {connectMode && (
            <div className="flex items-center gap-1 border-2 border-foreground rounded-lg p-1">
              <Button
                variant={connectionType === "chemical" ? "default" : "ghost"}
                size="sm"
                onClick={() => setConnectionType("chemical")}
                className="rounded-md text-xs"
              >
                Chemical
              </Button>
              <Button
                variant={connectionType === "electrical" ? "default" : "ghost"}
                size="sm"
                onClick={() => setConnectionType("electrical")}
                className="rounded-md text-xs"
              >
                Electrical
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetCircuit}
            className="rounded-lg ml-auto"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative w-full h-[350px] bg-gradient-to-br from-background to-muted/30",
            "border-2 border-foreground rounded-xl overflow-hidden shadow-lg",
            connectMode && "cursor-crosshair"
          )}
        >
          {/* SVG for connections */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(var(--foreground))"
                />
              </marker>
            </defs>
            
            {connections.map((conn, i) => {
              const from = getNeuronPosition(conn.from);
              const to = getNeuronPosition(conn.to);
              if (!from || !to) return null;

              const isActive = activeNeurons.includes(conn.from);
              
              return (
                <g key={i}>
                  <line
                    x1={from.canvasX}
                    y1={from.canvasY}
                    x2={to.canvasX}
                    y2={to.canvasY}
                    stroke={isActive ? NEURON_COLORS[from.type] : "hsl(var(--muted-foreground))"}
                    strokeWidth={conn.type === "chemical" ? 3 : 2}
                    strokeDasharray={conn.type === "electrical" ? "5,5" : "none"}
                    markerEnd="url(#arrowhead)"
                    className="transition-all duration-300"
                    style={{ opacity: isActive ? 1 : 0.5 }}
                  />
                  {/* Delete button on hover */}
                  <circle
                    cx={(from.canvasX + to.canvasX) / 2}
                    cy={(from.canvasY + to.canvasY) / 2}
                    r="10"
                    fill="hsl(var(--destructive))"
                    className="cursor-pointer opacity-0 hover:opacity-100 pointer-events-auto"
                    onClick={() => removeConnection(conn.from, conn.to)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Placed neurons */}
          {placedNeurons.map(neuron => {
            const isSelected = selectedNeuron === neuron.id;
            const isActive = activeNeurons.includes(neuron.id);
            const isHighlighted = highlightedNeurons.includes(neuron.id);
            
            return (
              <div
                key={neuron.id}
                className={cn(
                  "absolute flex flex-col items-center cursor-pointer transition-all duration-200",
                  "transform -translate-x-1/2 -translate-y-1/2",
                  isSelected && "scale-110 z-10"
                )}
                style={{ left: neuron.canvasX, top: neuron.canvasY }}
                onClick={() => handleNeuronClick(neuron.id)}
              >
                {/* Glow effect for active neurons */}
                {isActive && (
                  <div
                    className="absolute w-16 h-16 rounded-full animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${NEURON_COLORS[neuron.type]}40 0%, transparent 70%)`,
                    }}
                  />
                )}
                
                {/* Neuron circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-3 flex items-center justify-center",
                    "font-mono text-xs font-bold shadow-lg transition-all",
                    isSelected && "ring-4 ring-offset-2 ring-primary",
                    isHighlighted && "ring-2 ring-primary"
                  )}
                  style={{
                    backgroundColor: isActive ? NEURON_COLORS[neuron.type] : "hsl(var(--card))",
                    borderColor: NEURON_COLORS[neuron.type],
                    color: isActive ? "white" : NEURON_COLORS[neuron.type],
                  }}
                >
                  {neuron.type === "sensory" && <Zap className="w-4 h-4" />}
                  {neuron.type === "motor" && <Activity className="w-4 h-4" />}
                  {neuron.type === "interneuron" && <Brain className="w-4 h-4" />}
                  {neuron.type === "command" && <Sparkles className="w-4 h-4" />}
                </div>
                
                {/* Label */}
                <span 
                  className="mt-1 text-xs font-mono font-bold px-1 rounded"
                  style={{ backgroundColor: "hsl(var(--card))" }}
                >
                  {neuron.name}
                </span>
                
                {/* Delete button */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNeuron(neuron.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:scale-110"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {placedNeurons.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Drag neurons from the palette</p>
                <p className="text-xs opacity-70">to start building your circuit</p>
              </div>
            </div>
          )}

          {/* Connect mode indicator */}
          {connectMode && selectedNeuron && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Click another neuron to connect from {selectedNeuron}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>{placedNeurons.length} neurons</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            <span>{connections.length} connections</span>
          </div>
          {selectedNeuron && (
            <Badge variant="secondary" className="ml-auto">
              Selected: {selectedNeuron}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
