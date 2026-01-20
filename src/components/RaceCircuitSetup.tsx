import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Zap, ArrowRight, ArrowLeft, 
  Sparkles, Play, Trophy, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircuitBuilder } from "./CircuitBuilder";
import { WormSimulator3D } from "./WormSimulator3D";
import { cn } from "@/lib/utils";
import type { ConnectionData, WormBehavior } from "@/data/neuronData";

interface PlacedNeuron {
  id: string;
  name: string;
  type: string;
  description: string;
  canvasX: number;
  canvasY: number;
}

interface RaceCircuitSetupProps {
  onComplete: (circuitData: Record<string, unknown>, wormName: string) => void;
  onCancel?: () => void;
  className?: string;
}

// Preset circuits for quick selection
const PRESET_CIRCUITS = [
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Optimized for forward speed with direct motor activation",
    neurons: [
      { id: "PLML", name: "PLML", type: "sensory", description: "Touch sensor", canvasX: 80, canvasY: 100 },
      { id: "AVB", name: "AVB", type: "command", description: "Forward command", canvasX: 200, canvasY: 100 },
      { id: "DA1", name: "DA1", type: "motor", description: "Forward motor", canvasX: 320, canvasY: 80 },
      { id: "VB1", name: "VB1", type: "motor", description: "Forward motor", canvasX: 320, canvasY: 120 },
    ],
    connections: [
      { from: "PLML", to: "AVB", type: "chemical" as const, weight: 15 },
      { from: "AVB", to: "DA1", type: "chemical" as const, weight: 20 },
      { from: "AVB", to: "VB1", type: "chemical" as const, weight: 20 },
    ],
    stats: { speed: 9, agility: 4, stamina: 6 },
  },
  {
    id: "balanced",
    name: "Balanced Runner",
    description: "Well-rounded circuit with good reflexes",
    neurons: [
      { id: "ASHL", name: "ASHL", type: "sensory", description: "Chemical sensor", canvasX: 80, canvasY: 80 },
      { id: "PLML", name: "PLML", type: "sensory", description: "Touch sensor", canvasX: 80, canvasY: 140 },
      { id: "AIB", name: "AIB", type: "interneuron", description: "Interneuron", canvasX: 180, canvasY: 110 },
      { id: "AVB", name: "AVB", type: "command", description: "Forward command", canvasX: 280, canvasY: 110 },
      { id: "DA1", name: "DA1", type: "motor", description: "Motor", canvasX: 380, canvasY: 110 },
    ],
    connections: [
      { from: "ASHL", to: "AIB", type: "chemical" as const, weight: 10 },
      { from: "PLML", to: "AIB", type: "chemical" as const, weight: 10 },
      { from: "AIB", to: "AVB", type: "chemical" as const, weight: 15 },
      { from: "AVB", to: "DA1", type: "chemical" as const, weight: 18 },
    ],
    stats: { speed: 7, agility: 7, stamina: 7 },
  },
  {
    id: "neural-net",
    name: "Neural Network",
    description: "Complex circuit with multiple pathways for adaptability",
    neurons: [
      { id: "ASHL", name: "ASHL", type: "sensory", description: "Chemical sensor", canvasX: 60, canvasY: 60 },
      { id: "PLML", name: "PLML", type: "sensory", description: "Touch sensor", canvasX: 60, canvasY: 120 },
      { id: "PVDL", name: "PVDL", type: "sensory", description: "Harsh touch", canvasX: 60, canvasY: 180 },
      { id: "AIB", name: "AIB", type: "interneuron", description: "Interneuron", canvasX: 160, canvasY: 90 },
      { id: "RIA", name: "RIA", type: "interneuron", description: "Interneuron", canvasX: 160, canvasY: 150 },
      { id: "AVB", name: "AVB", type: "command", description: "Forward", canvasX: 260, canvasY: 90 },
      { id: "AVA", name: "AVA", type: "command", description: "Backward", canvasX: 260, canvasY: 150 },
      { id: "DA1", name: "DA1", type: "motor", description: "Motor", canvasX: 360, canvasY: 90 },
      { id: "VA1", name: "VA1", type: "motor", description: "Motor", canvasX: 360, canvasY: 150 },
    ],
    connections: [
      { from: "ASHL", to: "AIB", type: "chemical" as const, weight: 10 },
      { from: "PLML", to: "AIB", type: "chemical" as const, weight: 12 },
      { from: "PVDL", to: "RIA", type: "chemical" as const, weight: 8 },
      { from: "AIB", to: "AVB", type: "chemical" as const, weight: 15 },
      { from: "RIA", to: "AVB", type: "electrical" as const, weight: 5 },
      { from: "RIA", to: "AVA", type: "chemical" as const, weight: 10 },
      { from: "AVB", to: "DA1", type: "chemical" as const, weight: 18 },
      { from: "AVA", to: "VA1", type: "chemical" as const, weight: 15 },
    ],
    stats: { speed: 6, agility: 9, stamina: 8 },
  },
];

const WORM_NAME_SUGGESTIONS = [
  "Speedy", "Flash", "Bolt", "Nitro", "Turbo", 
  "Ziggy", "Wiggler", "Slither", "Dash", "Zoom"
];

export function RaceCircuitSetup({ onComplete, onCancel, className }: RaceCircuitSetupProps) {
  const [step, setStep] = useState<"name" | "circuit" | "preview">("name");
  const [wormName, setWormName] = useState("");
  const [neurons, setNeurons] = useState<PlacedNeuron[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  const handleCircuitChange = useCallback((newNeurons: PlacedNeuron[], newConnections: ConnectionData[]) => {
    setNeurons(newNeurons);
    setConnections(newConnections);
    setSelectedPreset(null); // Clear preset when manually editing
  }, []);

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_CIRCUITS.find(p => p.id === presetId);
    if (preset) {
      setNeurons(preset.neurons as PlacedNeuron[]);
      setConnections(preset.connections);
      setSelectedPreset(presetId);
    }
  };

  const handleComplete = () => {
    const circuitData = {
      neurons: neurons.map(n => ({
        id: n.id,
        name: n.name,
        type: n.type,
        x: n.canvasX,
        y: n.canvasY,
      })),
      connections: connections.map(c => ({
        from: c.from,
        to: c.to,
        type: c.type,
        weight: c.weight,
      })),
    };
    onComplete(circuitData, wormName);
  };

  // Calculate circuit stats
  const circuitStats = {
    speed: Math.min(10, neurons.filter(n => n.type === "motor").length * 2 + 
                       connections.filter(c => c.type === "chemical").length),
    agility: Math.min(10, neurons.filter(n => n.type === "interneuron").length * 2 + 
                         connections.filter(c => c.type === "electrical").length * 2),
    stamina: Math.min(10, neurons.length + Math.floor(connections.length / 2)),
  };

  const canProceed = step === "name" ? wormName.trim().length > 0 : 
                     step === "circuit" ? neurons.length >= 2 && connections.length >= 1 : true;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {["name", "circuit", "preview"].map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
                step === s 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : idx < ["name", "circuit", "preview"].indexOf(step)
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {idx + 1}
            </div>
            {idx < 2 && (
              <div className={cn(
                "w-12 h-0.5",
                idx < ["name", "circuit", "preview"].indexOf(step) 
                  ? "bg-primary" 
                  : "bg-muted-foreground/30"
              )} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Name your worm */}
        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Name Your Worm
              </h2>
              <p className="text-muted-foreground mt-1">
                Choose a name for your racing worm
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="worm-name">Worm Name</Label>
                  <Input
                    id="worm-name"
                    placeholder="Enter a name..."
                    value={wormName}
                    onChange={(e) => setWormName(e.target.value)}
                    className="text-lg"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {WORM_NAME_SUGGESTIONS.map((name) => (
                      <Badge
                        key={name}
                        variant={wormName === name ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => setWormName(name)}
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Build your circuit */}
        {step === "circuit" && (
          <motion.div
            key="circuit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Build Your Neural Circuit
              </h2>
              <p className="text-muted-foreground mt-1">
                Design the brain that will power your worm's racing ability
              </p>
            </div>

            {/* Preset selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_CIRCUITS.map((preset) => (
                <Card
                  key={preset.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedPreset === preset.id 
                      ? "ring-2 ring-primary border-primary" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      {preset.name}
                      {selectedPreset === preset.id && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {preset.description}
                    </p>
                    <div className="flex gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {preset.stats.speed}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-blue-500" />
                        {preset.stats.agility}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-green-500" />
                        {preset.stats.stamina}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Or build your own circuit below
            </div>

            {/* Circuit Builder */}
            <CircuitBuilder
              onCircuitChange={handleCircuitChange}
            />

            {/* Circuit Stats */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Circuit Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                    <div className="text-lg font-bold">{circuitStats.speed}</div>
                    <div className="text-xs text-muted-foreground">Speed</div>
                  </div>
                  <div className="text-center">
                    <Activity className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-lg font-bold">{circuitStats.agility}</div>
                    <div className="text-xs text-muted-foreground">Agility</div>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-green-500" />
                    <div className="text-lg font-bold">{circuitStats.stamina}</div>
                    <div className="text-xs text-muted-foreground">Stamina</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Preview and confirm */}
        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Play className="w-6 h-6 text-primary" />
                Ready to Race!
              </h2>
              <p className="text-muted-foreground mt-1">
                Preview your worm and join the race
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Worm Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {wormName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Brain className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{neurons.length}</div>
                      <div className="text-xs text-muted-foreground">Neurons</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{connections.length}</div>
                      <div className="text-xs text-muted-foreground">Connections</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                      <div className="text-lg font-bold">{circuitStats.speed}</div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Neurons Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {neurons.map((n) => (
                        <Badge key={n.id} variant="outline" className="text-xs">
                          {n.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3D Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Worm Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] rounded-lg overflow-hidden border border-border bg-gradient-to-b from-background to-muted/30">
                    <WormSimulator3D
                      behavior={(neurons.some(n => n.type === "motor") ? "move_forward" : "no_movement") as WormBehavior}
                      activeNeurons={neurons.map(n => n.id)}
                      signalPath={connections.map(c => c.from)}
                      isSimulating={true}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Your worm will move based on its neural circuit!
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={() => {
            if (step === "name") {
              onCancel?.();
            } else if (step === "circuit") {
              setStep("name");
            } else {
              setStep("circuit");
            }
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === "name" ? "Cancel" : "Back"}
        </Button>

        <Button
          onClick={() => {
            if (step === "name") {
              setStep("circuit");
            } else if (step === "circuit") {
              setStep("preview");
            } else {
              handleComplete();
            }
          }}
          disabled={!canProceed}
        >
          {step === "preview" ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Join Race
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
