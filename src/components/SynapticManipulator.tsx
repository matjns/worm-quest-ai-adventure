import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, RotateCcw, Play, Pause, Activity, TrendingUp, 
  TrendingDown, Minus, FlaskConical, Dna, BrainCircuit
} from "lucide-react";
import { toast } from "sonner";

interface SynapseConfig {
  from: string;
  to: string;
  baseWeight: number;
  currentWeight: number;
  type: "chemical" | "electrical";
}

interface IonChannelConfig {
  id: string;
  name: string;
  conductance: number;
  baseValue: number;
  unit: string;
}

interface SynapticManipulatorProps {
  onWeightsChange: (weights: Record<string, number>) => void;
  onChannelsChange: (channels: Record<string, number>) => void;
  onSimulate: () => void;
  isSimulating: boolean;
}

const SAMPLE_SYNAPSES: SynapseConfig[] = [
  { from: "ASEL", to: "AIY", baseWeight: 0.8, currentWeight: 0.8, type: "chemical" },
  { from: "ASER", to: "AIZ", baseWeight: 0.7, currentWeight: 0.7, type: "chemical" },
  { from: "AIY", to: "RIA", baseWeight: 0.6, currentWeight: 0.6, type: "chemical" },
  { from: "AIZ", to: "RIB", baseWeight: 0.5, currentWeight: 0.5, type: "chemical" },
  { from: "AVA", to: "DA1", baseWeight: 0.9, currentWeight: 0.9, type: "electrical" },
  { from: "AVB", to: "DB1", baseWeight: 0.85, currentWeight: 0.85, type: "electrical" },
];

const SAMPLE_ION_CHANNELS: IonChannelConfig[] = [
  { id: "na_fast", name: "Fast Na+", conductance: 120, baseValue: 120, unit: "mS/cm²" },
  { id: "k_delayed", name: "Delayed K+", conductance: 36, baseValue: 36, unit: "mS/cm²" },
  { id: "ca_l", name: "L-type Ca²+", conductance: 1.5, baseValue: 1.5, unit: "mS/cm²" },
  { id: "k_ca", name: "Ca²+-activated K+", conductance: 5, baseValue: 5, unit: "mS/cm²" },
];

const PHARMACOLOGICAL_PRESETS = [
  { name: "Control", description: "Baseline conditions", weights: {}, channels: {} },
  { name: "Ivermectin", description: "GluCl agonist - paralysis", weights: { "AVA-DA1": 0.1, "AVB-DB1": 0.1 }, channels: { "k_delayed": 72 } },
  { name: "Levamisole", description: "nAChR agonist - spastic paralysis", weights: {}, channels: { "na_fast": 180 } },
  { name: "Nembutal", description: "GABA potentiator - sedation", weights: { "ASEL-AIY": 0.3, "ASER-AIZ": 0.3 }, channels: { "k_ca": 15 } },
];

export function SynapticManipulator({
  onWeightsChange,
  onChannelsChange,
  onSimulate,
  isSimulating,
}: SynapticManipulatorProps) {
  const [synapses, setSynapses] = useState<SynapseConfig[]>(SAMPLE_SYNAPSES);
  const [channels, setChannels] = useState<IonChannelConfig[]>(SAMPLE_ION_CHANNELS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("Control");

  const updateSynapseWeight = useCallback((index: number, newWeight: number) => {
    setSynapses(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], currentWeight: newWeight };
      
      const weightMap: Record<string, number> = {};
      updated.forEach(s => {
        weightMap[`${s.from}-${s.to}`] = s.currentWeight;
      });
      onWeightsChange(weightMap);
      
      return updated;
    });
    setSelectedPreset(null);
  }, [onWeightsChange]);

  const updateChannelConductance = useCallback((index: number, newConductance: number) => {
    setChannels(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], conductance: newConductance };
      
      const channelMap: Record<string, number> = {};
      updated.forEach(c => {
        channelMap[c.id] = c.conductance;
      });
      onChannelsChange(channelMap);
      
      return updated;
    });
    setSelectedPreset(null);
  }, [onChannelsChange]);

  const applyPreset = useCallback((preset: typeof PHARMACOLOGICAL_PRESETS[0]) => {
    // Reset to baseline first
    setSynapses(SAMPLE_SYNAPSES.map(s => ({
      ...s,
      currentWeight: preset.weights[`${s.from}-${s.to}`] ?? s.baseWeight
    })));
    setChannels(SAMPLE_ION_CHANNELS.map(c => ({
      ...c,
      conductance: preset.channels[c.id] ?? c.baseValue
    })));
    setSelectedPreset(preset.name);
    toast.success(`Applied ${preset.name} preset`);
  }, []);

  const resetAll = useCallback(() => {
    setSynapses(SAMPLE_SYNAPSES);
    setChannels(SAMPLE_ION_CHANNELS);
    setSelectedPreset("Control");
    onWeightsChange({});
    onChannelsChange({});
    toast.info("Reset to baseline");
  }, [onWeightsChange, onChannelsChange]);

  const getWeightIndicator = (current: number, base: number) => {
    const diff = current - base;
    if (Math.abs(diff) < 0.05) return <Minus className="h-3 w-3 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Synaptic Manipulator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={onSimulate}
              variant={isSimulating ? "destructive" : "default"}
            >
              {isSimulating ? (
                <><Pause className="h-3 w-3 mr-1" />Stop</>
              ) : (
                <><Play className="h-3 w-3 mr-1" />Simulate</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="synapses">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="synapses">
              <Zap className="h-3 w-3 mr-1" />
              Synapses
            </TabsTrigger>
            <TabsTrigger value="channels">
              <Activity className="h-3 w-3 mr-1" />
              Ion Channels
            </TabsTrigger>
            <TabsTrigger value="drugs">
              <FlaskConical className="h-3 w-3 mr-1" />
              Pharmacology
            </TabsTrigger>
          </TabsList>

          <TabsContent value="synapses" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Adjust synaptic weights to modify signal transmission strength
            </p>
            {synapses.map((synapse, index) => (
              <motion.div
                key={`${synapse.from}-${synapse.to}`}
                className="p-3 rounded-lg border bg-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={synapse.type === "electrical" ? "outline" : "secondary"}>
                      {synapse.type === "electrical" ? "Gap" : "Chem"}
                    </Badge>
                    <span className="text-sm font-medium">
                      {synapse.from} → {synapse.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getWeightIndicator(synapse.currentWeight, synapse.baseWeight)}
                    <span className="text-sm font-mono w-12 text-right">
                      {synapse.currentWeight.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[synapse.currentWeight]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([v]) => updateSynapseWeight(index, v)}
                  className="cursor-pointer"
                />
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="channels" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Modify ion channel conductances to simulate electrophysiological changes
            </p>
            {channels.map((channel, index) => (
              <motion.div
                key={channel.id}
                className="p-3 rounded-lg border bg-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Dna className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getWeightIndicator(channel.conductance, channel.baseValue)}
                    <span className="text-sm font-mono">
                      {channel.conductance.toFixed(1)} {channel.unit}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[channel.conductance]}
                  min={0}
                  max={channel.baseValue * 2}
                  step={0.1}
                  onValueChange={([v]) => updateChannelConductance(index, v)}
                  className="cursor-pointer"
                />
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="drugs" className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground">
              Apply pharmacological presets to simulate drug effects on the nervous system
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PHARMACOLOGICAL_PRESETS.map((preset) => (
                <motion.div
                  key={preset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={selectedPreset === preset.name ? "default" : "outline"}
                    className="w-full h-auto py-3 flex flex-col items-start"
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs opacity-70 font-normal">
                      {preset.description}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Advanced Toggle */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Label htmlFor="advanced" className="text-sm">
            Show advanced parameters
          </Label>
          <Switch
            id="advanced"
            checked={showAdvanced}
            onCheckedChange={setShowAdvanced}
          />
        </div>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 p-3 rounded-lg bg-muted/50"
          >
            <p className="text-xs text-muted-foreground">
              Advanced: Time constants, reversal potentials, and membrane capacitance
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>τ_syn:</span>
                <span className="font-mono">5.0 ms</span>
              </div>
              <div className="flex justify-between">
                <span>E_syn:</span>
                <span className="font-mono">0 mV</span>
              </div>
              <div className="flex justify-between">
                <span>C_m:</span>
                <span className="font-mono">1.0 µF/cm²</span>
              </div>
              <div className="flex justify-between">
                <span>R_m:</span>
                <span className="font-mono">10 kΩ·cm²</span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
