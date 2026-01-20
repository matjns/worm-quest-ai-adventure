import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  NEURON_PALETTE, 
  NEURON_COLORS, 
  simulateCircuit,
  type NeuronData, 
  type ConnectionData,
  type WormBehavior
} from "@/data/neuronData";
import { circuitTemplates, type CircuitTemplate } from "@/data/circuitTemplates";
import { WormSimulator3D } from "@/components/WormSimulator3D";
import { CircuitValidationPanel } from "@/components/CircuitValidationPanel";
import { AICircuitCoach } from "@/components/AICircuitCoach";
import { NeuroMLExportDialog } from "@/components/NeuroMLExportDialog";
import { ImportMergeDialog } from "@/components/ImportMergeDialog";
import { useCollaborativeCircuitDesigner } from "@/hooks/useCollaborativeCircuitDesigner";
import { 
  Brain, 
  Zap, 
  Play, 
  RotateCcw, 
  Trash2, 
  Download,
  Upload,
  MousePointer2,
  Link2,
  Activity,
  Eye,
  Circle,
  ArrowRight,
  Layers,
  FileCode,
  Users,
  UserPlus,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  FlaskConical
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

type DesignerMode = "select" | "connect" | "delete";
type StimulusType = "touch_head" | "touch_tail" | "smell_food" | "none";

export function VisualCircuitDesigner() {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Local state (used when not in collab mode)
  const [localNeurons, setLocalNeurons] = useState<PlacedNeuron[]>([]);
  const [localConnections, setLocalConnections] = useState<DesignerConnection[]>([]);
  
  // Collaboration
  const [collabRoomId, setCollabRoomId] = useState<string | null>(null);
  const [roomInputValue, setRoomInputValue] = useState("");
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const collab = useCollaborativeCircuitDesigner(collabRoomId);
  
  // Use collaborative state when connected, else local
  const placedNeurons = collabRoomId && collab.isConnected ? collab.neurons : localNeurons;
  const connections = collabRoomId && collab.isConnected ? collab.connections : localConnections;
  const setPlacedNeurons = collabRoomId && collab.isConnected ? collab.setNeurons : setLocalNeurons;
  const setConnections = collabRoomId && collab.isConnected ? collab.setConnections : setLocalConnections;
  
  // UI state
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mode, setMode] = useState<DesignerMode>("select");
  const [draggedNeuron, setDraggedNeuron] = useState<NeuronData | null>(null);
  const [stimulus, setStimulus] = useState<StimulusType>("none");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    behavior: WormBehavior;
    activeNeurons: string[];
    signalPath: string[];
  } | null>(null);
  const [connectionWeight, setConnectionWeight] = useState(8);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<string>("all");

  // Generate a new room ID
  const generateRoomId = () => {
    const id = `room_${Math.random().toString(36).substr(2, 8)}`;
    setCollabRoomId(id);
    setRoomInputValue(id);
  };

  // Join existing room
  const joinRoom = () => {
    if (roomInputValue.trim()) {
      setCollabRoomId(roomInputValue.trim());
    }
  };

  // Leave room
  const leaveRoom = () => {
    setCollabRoomId(null);
    setRoomInputValue("");
  };

  // Copy room ID
  const copyRoomId = () => {
    if (collabRoomId) {
      navigator.clipboard.writeText(collabRoomId);
      setCopiedRoomId(true);
      toast.success("Room ID copied!");
      setTimeout(() => setCopiedRoomId(false), 2000);
    }
  };

  // Handle drag start from palette
  const handleDragStart = (neuron: NeuronData, e: React.DragEvent) => {
    setDraggedNeuron(neuron);
    e.dataTransfer.effectAllowed = "copy";
  };

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNeuron || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (placedNeurons.find(n => n.id === draggedNeuron.id)) {
      toast.error(`${draggedNeuron.name} is already on the canvas`);
      return;
    }

    const newNeuron: PlacedNeuron = {
      ...draggedNeuron,
      x,
      y,
      isActive: false
    };

    if (collabRoomId && collab.isConnected) {
      collab.addNeuron(newNeuron);
    } else {
      setLocalNeurons(prev => [...prev, newNeuron]);
    }
    setDraggedNeuron(null);
    toast.success(`Added ${draggedNeuron.name}`);
  }, [draggedNeuron, placedNeurons, collabRoomId, collab]);

  // Handle neuron click based on mode
  const handleNeuronClick = (neuronId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === "delete") {
      if (collabRoomId && collab.isConnected) {
        collab.removeNeuron(neuronId);
      } else {
        setLocalNeurons(prev => prev.filter(n => n.id !== neuronId));
        setLocalConnections(prev => prev.filter(c => c.from !== neuronId && c.to !== neuronId));
      }
      toast.info("Neuron removed");
      return;
    }

    if (mode === "connect") {
      if (!connectingFrom) {
        setConnectingFrom(neuronId);
        toast.info(`Click another neuron to create synapse from ${neuronId}`);
      } else if (connectingFrom !== neuronId) {
        const exists = connections.find(
          c => c.from === connectingFrom && c.to === neuronId
        );
        if (exists) {
          toast.error("Connection already exists");
        } else {
          const newConnection: DesignerConnection = {
            id: `${connectingFrom}-${neuronId}`,
            from: connectingFrom,
            to: neuronId,
            type: "chemical",
            weight: connectionWeight
          };
          if (collabRoomId && collab.isConnected) {
            collab.addConnection(newConnection);
          } else {
            setLocalConnections(prev => [...prev, newConnection]);
          }
          toast.success(`Synapse created: ${connectingFrom} → ${neuronId}`);
        }
        setConnectingFrom(null);
      }
      return;
    }

    setSelectedNeuron(neuronId === selectedNeuron ? null : neuronId);
  };

  // Handle neuron drag on canvas
  const handleNeuronDrag = (neuronId: string, e: React.MouseEvent) => {
    if (mode !== "select" || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const neuron = placedNeurons.find(n => n.id === neuronId);
    if (!neuron) return;

    const offsetX = startX - neuron.x;
    const offsetY = startY - neuron.y;

    const handleMove = (moveE: MouseEvent) => {
      const newX = moveE.clientX - rect.left - offsetX;
      const newY = moveE.clientY - rect.top - offsetY;
      const clampedX = Math.max(20, Math.min(newX, rect.width - 20));
      const clampedY = Math.max(20, Math.min(newY, rect.height - 20));

      if (collabRoomId && collab.isConnected) {
        collab.moveNeuron(neuronId, clampedX, clampedY);
      } else {
        setLocalNeurons(prev =>
          prev.map(n => n.id === neuronId ? { ...n, x: clampedX, y: clampedY } : n)
        );
      }
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  // Track mouse position for connection line
  useEffect(() => {
    if (!connectingFrom || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [connectingFrom]);

  // Track cursor for collaboration
  useEffect(() => {
    if (!collabRoomId || !collab.isConnected || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        collab.updateCursor(e.clientX - rect.left, e.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [collabRoomId, collab]);

  // Load template
  const loadTemplate = (template: CircuitTemplate) => {
    const canvasWidth = canvasRef.current?.offsetWidth || 600;
    const canvasHeight = canvasRef.current?.offsetHeight || 400;
    
    // Convert template positions (percentages) to canvas coordinates
    const neurons: PlacedNeuron[] = template.neurons.map(n => {
      const neuronData = NEURON_PALETTE.find(np => np.id === n.id) || {
        id: n.id,
        name: n.id,
        type: (n.type as NeuronData["type"]) || "interneuron",
        function: "unknown",
        description: `Neuron ${n.id}`,
        position: { x: 0, y: 0 }
      };
      return {
        ...neuronData,
        x: (n.x / 100) * canvasWidth,
        y: (n.y / 100) * canvasHeight,
        isActive: false
      };
    });

    const conns: DesignerConnection[] = template.connections.map((c, i) => ({
      id: `${c.from}-${c.to}-${i}`,
      from: c.from,
      to: c.to,
      type: "chemical" as const,
      weight: 8
    }));

    if (collabRoomId && collab.isConnected) {
      collab.loadFromTemplate(neurons, conns);
    } else {
      setLocalNeurons(neurons);
      setLocalConnections(conns);
    }
    
    setShowTemplates(false);
    toast.success(`Loaded template: ${template.name}`);
  };

  // Run simulation
  const runSimulation = useCallback(() => {
    if (placedNeurons.length === 0) {
      toast.error("Add neurons to the canvas first");
      return;
    }

    setIsSimulating(true);
    
    const result = simulateCircuit(
      connections,
      stimulus,
      placedNeurons.map(n => n.id)
    );

    setTimeout(() => {
      setSimulationResult(result);
      setPlacedNeurons(prev =>
        prev.map(n => ({
          ...n,
          isActive: result.activeNeurons.includes(n.id)
        }))
      );
      setIsSimulating(false);
      toast.success(`Behavior: ${result.behavior.replace("_", " ")}`);
    }, 500);
  }, [placedNeurons, connections, stimulus, setPlacedNeurons]);

  // Reset simulation
  const resetSimulation = () => {
    setSimulationResult(null);
    setPlacedNeurons(prev => prev.map(n => ({ ...n, isActive: false })));
  };

  // Clear canvas
  const clearCanvas = () => {
    if (collabRoomId && collab.isConnected) {
      collab.clearAll();
    } else {
      setLocalNeurons([]);
      setLocalConnections([]);
    }
    setSimulationResult(null);
    setSelectedNeuron(null);
    setConnectingFrom(null);
    toast.info("Canvas cleared");
  };

  // Export circuit
  const exportCircuit = () => {
    const data = {
      neurons: placedNeurons,
      connections,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `circuit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Circuit exported");
  };

  const getNeuronColor = (type: NeuronData["type"]) => NEURON_COLORS[type];

  const renderConnection = (conn: DesignerConnection) => {
    const fromNeuron = placedNeurons.find(n => n.id === conn.from);
    const toNeuron = placedNeurons.find(n => n.id === conn.to);
    if (!fromNeuron || !toNeuron) return null;

    const isActive = simulationResult?.signalPath.includes(conn.from) && 
                     simulationResult?.signalPath.includes(conn.to);

    const dx = toNeuron.x - fromNeuron.x;
    const dy = toNeuron.y - fromNeuron.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return (
      <g key={conn.id}>
        <line
          x1={fromNeuron.x}
          y1={fromNeuron.y}
          x2={toNeuron.x}
          y2={toNeuron.y}
          stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
          strokeWidth={isActive ? 3 : 2}
          strokeOpacity={isActive ? 1 : 0.5}
          className={isActive ? "animate-pulse" : ""}
        />
        <polygon
          points="-8,-4 0,0 -8,4"
          fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
          transform={`translate(${toNeuron.x - 20 * Math.cos(angle * Math.PI / 180)}, ${toNeuron.y - 20 * Math.sin(angle * Math.PI / 180)}) rotate(${angle})`}
          fillOpacity={isActive ? 1 : 0.5}
        />
        <text
          x={(fromNeuron.x + toNeuron.x) / 2}
          y={(fromNeuron.y + toNeuron.y) / 2 - 8}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize="10"
          className="select-none"
        >
          w={conn.weight}
        </text>
      </g>
    );
  };

  const groupedNeurons = {
    sensory: NEURON_PALETTE.filter(n => n.type === "sensory"),
    interneuron: NEURON_PALETTE.filter(n => n.type === "interneuron"),
    command: NEURON_PALETTE.filter(n => n.type === "command"),
    motor: NEURON_PALETTE.filter(n => n.type === "motor"),
  };

  const filteredTemplates = templateFilter === "all" 
    ? circuitTemplates 
    : circuitTemplates.filter(t => t.category === templateFilter || t.difficulty === templateFilter);

  return (
    <Card className="border-3 border-foreground">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Visual Circuit Designer
                <Badge variant="outline" className="ml-2">Interactive</Badge>
                {collabRoomId && collab.isConnected && (
                  <Badge variant="secondary" className="gap-1">
                    <Wifi className="w-3 h-3" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag neurons, create synapses, preview worm behavior in real-time
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Collaboration Controls */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Users className="w-4 h-4" />
                  {collab.isConnected ? `${collab.collaborators.length + 1} Online` : "Collaborate"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Multiplayer Collaboration
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {!collabRoomId ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Create a new room or join an existing one to build circuits together in real-time.
                        </p>
                        <Button onClick={generateRoomId} className="w-full gap-2">
                          <UserPlus className="w-4 h-4" />
                          Create New Room
                        </Button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter room ID..."
                          value={roomInputValue}
                          onChange={(e) => setRoomInputValue(e.target.value)}
                        />
                        <Button onClick={joinRoom} disabled={!roomInputValue.trim()}>
                          Join
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        {collab.isConnected ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-mono text-sm flex-1">{collabRoomId}</span>
                        <Button variant="ghost" size="sm" onClick={copyRoomId}>
                          {copiedRoomId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      {collab.collaborators.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Collaborators</h4>
                          <div className="space-y-1">
                            {collab.collaborators.map(c => (
                              <div key={c.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: c.color }}
                                />
                                <span className="text-sm">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button variant="outline" onClick={leaveRoom} className="w-full">
                        Leave Room
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Template Button */}
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <FileCode className="w-4 h-4" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Circuit Templates
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Filter */}
                  <div className="flex gap-2 flex-wrap">
                    {["all", "beginner", "intermediate", "advanced", "sensory", "motor", "reflex"].map(f => (
                      <Button
                        key={f}
                        variant={templateFilter === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTemplateFilter(f)}
                        className="capitalize"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Template Grid */}
                  <ScrollArea className="h-[400px]">
                    <div className="grid md:grid-cols-2 gap-4 pr-4">
                      {filteredTemplates.map(template => (
                        <Card 
                          key={template.id} 
                          className="border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => loadTemplate(template)}
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-bold">{template.name}</h4>
                              <Badge variant="outline" className="capitalize text-xs">
                                {template.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {template.neurons.length} neurons
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {template.connections.length} synapses
                              </Badge>
                            </div>
                            <p className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">
                              {template.scientificNote.slice(0, 100)}...
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* NeuroML Import with Merge */}
            <ImportMergeDialog
              existingNeurons={placedNeurons}
              existingConnections={connections}
              canvasWidth={canvasRef.current?.offsetWidth || 600}
              canvasHeight={canvasRef.current?.offsetHeight || 400}
              onMerge={(neurons, conns) => {
                if (collabRoomId && collab.isConnected) {
                  collab.loadFromTemplate(neurons, conns);
                } else {
                  setLocalNeurons(neurons);
                  setLocalConnections(conns);
                }
              }}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
              }
            />
            
            {/* NeuroML Export */}
            <NeuroMLExportDialog
              neurons={placedNeurons.map(n => ({ id: n.id, type: n.type, x: n.x, y: n.y }))}
              connections={connections}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <FileCode className="w-4 h-4" />
                  Export
                </Button>
              }
            />
            
            <Button variant="outline" size="sm" onClick={exportCircuit}>
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid lg:grid-cols-[280px_1fr_300px] gap-4">
          {/* Neuron Palette */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Neuron Palette</h3>
              <Badge variant="secondary">{NEURON_PALETTE.length} neurons</Badge>
            </div>
            
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-4">
                {Object.entries(groupedNeurons).map(([type, neurons]) => (
                  <div key={type}>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                      <Circle className="w-3 h-3" style={{ fill: getNeuronColor(type as NeuronData["type"]) }} />
                      {type}
                    </h4>
                    <div className="grid grid-cols-2 gap-1">
                      {neurons.map(neuron => (
                        <div
                          key={neuron.id}
                          draggable
                          onDragStart={(e) => handleDragStart(neuron, e)}
                          className={cn(
                            "p-2 rounded-md cursor-grab active:cursor-grabbing transition-all",
                            "border border-border/50 hover:border-primary/50 hover:bg-accent/30",
                            "text-xs font-mono text-center select-none",
                            placedNeurons.find(n => n.id === neuron.id) && "opacity-40"
                          )}
                          style={{ 
                            borderLeftWidth: 3,
                            borderLeftColor: getNeuronColor(neuron.type)
                          }}
                          title={neuron.description}
                        >
                          {neuron.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Canvas Area */}
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg">
              <div className="flex gap-1">
                <Button
                  variant={mode === "select" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setMode("select"); setConnectingFrom(null); }}
                >
                  <MousePointer2 className="w-4 h-4 mr-1" />
                  Select
                </Button>
                <Button
                  variant={mode === "connect" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("connect")}
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  Connect
                </Button>
                <Button
                  variant={mode === "delete" ? "destructive" : "ghost"}
                  size="sm"
                  onClick={() => { setMode("delete"); setConnectingFrom(null); }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>

              {mode === "connect" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Weight:</span>
                  <Slider
                    value={[connectionWeight]}
                    onValueChange={([v]) => setConnectionWeight(v)}
                    min={1}
                    max={15}
                    step={1}
                    className="w-24"
                  />
                  <span className="text-xs font-mono w-4">{connectionWeight}</span>
                </div>
              )}
            </div>

            {/* Main Canvas */}
            <div
              ref={canvasRef}
              className={cn(
                "relative w-full h-[400px] rounded-xl border-2 border-dashed transition-colors",
                "bg-gradient-to-br from-background to-muted/20",
                mode === "connect" && "border-primary/50",
                mode === "delete" && "border-destructive/50"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => { setSelectedNeuron(null); setConnectingFrom(null); }}
            >
              {placedNeurons.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Drag neurons here or load a template</p>
                  </div>
                </div>
              )}

              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map(renderConnection)}
                
                {connectingFrom && (() => {
                  const fromNeuron = placedNeurons.find(n => n.id === connectingFrom);
                  if (!fromNeuron) return null;
                  return (
                    <line
                      x1={fromNeuron.x}
                      y1={fromNeuron.y}
                      x2={mousePos.x}
                      y2={mousePos.y}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="5,5"
                      strokeOpacity={0.7}
                    />
                  );
                })()}
              </svg>

              {/* Collaborator Cursors */}
              {collab.collaborators.map(c => c.cursor && (
                <div
                  key={c.id}
                  className="absolute pointer-events-none transition-all duration-75"
                  style={{
                    left: c.cursor.x,
                    top: c.cursor.y,
                    transform: "translate(-2px, -2px)"
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 3L19 12L12 13L9 20L5 3Z"
                      fill={c.color}
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span 
                    className="absolute left-4 top-4 text-xs px-1 py-0.5 rounded text-white whitespace-nowrap"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name}
                  </span>
                </div>
              ))}

              {/* Neurons */}
              {placedNeurons.map(neuron => (
                <div
                  key={neuron.id}
                  className={cn(
                    "absolute flex items-center justify-center rounded-full cursor-pointer transition-all",
                    "border-2 shadow-lg select-none",
                    selectedNeuron === neuron.id && "ring-2 ring-primary ring-offset-2",
                    connectingFrom === neuron.id && "ring-2 ring-accent ring-offset-2",
                    neuron.isActive && "animate-pulse scale-110"
                  )}
                  style={{
                    left: neuron.x - 24,
                    top: neuron.y - 24,
                    width: 48,
                    height: 48,
                    backgroundColor: getNeuronColor(neuron.type),
                    borderColor: neuron.isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                    boxShadow: neuron.isActive 
                      ? `0 0 20px ${getNeuronColor(neuron.type)}` 
                      : undefined
                  }}
                  onClick={(e) => handleNeuronClick(neuron.id, e)}
                  onMouseDown={(e) => handleNeuronDrag(neuron.id, e)}
                  title={neuron.description}
                >
                  <span className="text-[10px] font-bold text-white drop-shadow-md">
                    {neuron.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Stimulus & Simulation Controls */}
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Stimulus:</span>
                <div className="flex gap-1">
                  {[
                    { value: "none", label: "None" },
                    { value: "touch_head", label: "🖐 Head" },
                    { value: "touch_tail", label: "🖐 Tail" },
                    { value: "smell_food", label: "🍎 Food" },
                  ].map(s => (
                    <Button
                      key={s.value}
                      variant={stimulus === s.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStimulus(s.value as StimulusType)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetSimulation}
                  disabled={!simulationResult}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button 
                  size="sm" 
                  onClick={runSimulation}
                  disabled={isSimulating || placedNeurons.length === 0}
                  className="gap-2"
                >
                  {isSimulating ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 3D Preview, Validation, AI Coach & Results */}
          <div className="space-y-4">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview" className="text-xs gap-1">
                  <Eye className="w-3 h-3" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="validation" className="text-xs gap-1">
                  <FlaskConical className="w-3 h-3" />
                  Validate
                </TabsTrigger>
                <TabsTrigger value="coach" className="text-xs gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Coach
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4 mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Behavior Preview
                  </h3>
                  {simulationResult && (
                    <Badge variant="secondary" className="capitalize">
                      {simulationResult.behavior.replace("_", " ")}
                    </Badge>
                  )}
                </div>

                <div className="h-[200px] rounded-xl border-2 border-border bg-gradient-to-br from-muted/50 to-background overflow-hidden">
                  <WormSimulator3D 
                    behavior={simulationResult?.behavior || "no_movement"} 
                    activeNeurons={simulationResult?.activeNeurons || []}
                    signalPath={simulationResult?.signalPath || []}
                    isSimulating={isSimulating}
                    className="h-full"
                  />
                </div>

                {simulationResult && (
                  <Card className="border border-border/50">
                    <CardContent className="p-3 space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Signal Path
                      </h4>
                      <div className="flex flex-wrap items-center gap-1">
                        {simulationResult.signalPath.map((neuronId, i) => {
                          const neuron = placedNeurons.find(n => n.id === neuronId);
                          return (
                            <span key={i} className="flex items-center gap-1">
                              <Badge 
                                variant="outline" 
                                className="text-[10px] px-1.5"
                                style={{ 
                                  borderColor: neuron ? getNeuronColor(neuron.type) : undefined,
                                  color: neuron ? getNeuronColor(neuron.type) : undefined
                                }}
                              >
                                {neuronId}
                              </Badge>
                              {i < simulationResult.signalPath.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {simulationResult && (
                  <Card className="border border-border/50">
                    <CardContent className="p-3 space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Active Neurons ({simulationResult.activeNeurons.length})
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {simulationResult.activeNeurons.map(id => {
                          const neuron = placedNeurons.find(n => n.id === id);
                          return (
                            <Badge 
                              key={id}
                              variant="secondary"
                              className="text-[10px]"
                              style={{ 
                                backgroundColor: neuron ? `${getNeuronColor(neuron.type)}20` : undefined,
                                borderColor: neuron ? getNeuronColor(neuron.type) : undefined
                              }}
                            >
                              {id}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="validation" className="mt-3">
                <CircuitValidationPanel
                  neurons={placedNeurons.map(n => ({ id: n.id, type: n.type }))}
                  connections={connections.map(c => ({ from: c.from, to: c.to, weight: c.weight }))}
                  onAddConnection={(from, to, weight) => {
                    const newConnection: DesignerConnection = {
                      id: `${from}-${to}-${Date.now()}`,
                      from,
                      to,
                      type: "chemical",
                      weight
                    };
                    if (collabRoomId && collab.isConnected) {
                      collab.addConnection(newConnection);
                    } else {
                      setLocalConnections(prev => [...prev, newConnection]);
                    }
                    toast.success(`Added connection: ${from} → ${to}`);
                  }}
                />
              </TabsContent>

              <TabsContent value="coach" className="mt-3">
                <AICircuitCoach
                  neurons={placedNeurons.map(n => ({ id: n.id, type: n.type }))}
                  connections={connections.map(c => ({ from: c.from, to: c.to, weight: c.weight }))}
                />
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-2">
              <Card className="border border-border/50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-black text-primary">{placedNeurons.length}</div>
                  <div className="text-xs text-muted-foreground">Neurons</div>
                </CardContent>
              </Card>
              <Card className="border border-border/50">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-black text-accent">{connections.length}</div>
                  <div className="text-xs text-muted-foreground">Synapses</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
