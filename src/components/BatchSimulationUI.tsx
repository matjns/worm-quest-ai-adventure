import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { SweepVisualization } from "@/components/SweepVisualization";
import { 
  Play, 
  Layers, 
  TrendingUp,
  Loader2,
  Plus,
  Trash2,
  FlaskConical,
  Zap,
  Brain,
  Settings2,
  BarChart3,
  Grid3X3,
  Scissors
} from "lucide-react";
import { toast } from "sonner";

interface SweepConfig {
  id: string;
  type: "stimulus_intensity" | "stimulus_type" | "neuron_ablation" | "duration" | "multi_param";
  enabled: boolean;
  steps: number;
  minValue?: number;
  maxValue?: number;
  stimulusTypes?: string[];
  ablationNeurons?: string[];
}

interface BatchJob {
  id: string;
  neurons: string[];
  stimulusType: string;
  stimulusValue: number;
  duration: number;
}

const AVAILABLE_NEURONS = [
  "ASEL", "ASER", "AWC", "ASH", "AIY", "AIZ", "RIA", "AVA", "AVB", "DA01", "DB01", "VB01"
];

const STIMULUS_TYPES = ["chemical", "mechanical", "thermal", "light"];

export function BatchSimulationUI() {
  const [mode, setMode] = useState<"batch" | "sweep">("sweep");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  
  // Sweep configuration
  const [sweepType, setSweepType] = useState<string>("stimulus_intensity");
  const [baseNeurons, setBaseNeurons] = useState<string[]>(["ASEL", "AIY", "AVA"]);
  const [sweepSteps, setSweepSteps] = useState(10);
  const [intensityRange, setIntensityRange] = useState([0.1, 1.0]);
  const [durationRange, setDurationRange] = useState([100, 2000]);
  const [ablationNeurons, setAblationNeurons] = useState<string[]>(["AIY", "AVA", "AIZ"]);
  
  // Batch configuration
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([
    { id: "1", neurons: ["ASEL", "AIY"], stimulusType: "chemical", stimulusValue: 0.5, duration: 1000 },
    { id: "2", neurons: ["ASH", "AVA"], stimulusType: "mechanical", stimulusValue: 0.8, duration: 1000 }
  ]);

  const toggleNeuron = (neuronId: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(neuronId)) {
      setter(list.filter(n => n !== neuronId));
    } else {
      setter([...list, neuronId]);
    }
  };

  const addBatchJob = () => {
    setBatchJobs([...batchJobs, {
      id: Date.now().toString(),
      neurons: ["ASEL"],
      stimulusType: "chemical",
      stimulusValue: 0.5,
      duration: 1000
    }]);
  };

  const removeBatchJob = (id: string) => {
    setBatchJobs(batchJobs.filter(j => j.id !== id));
  };

  const updateBatchJob = (id: string, updates: Partial<BatchJob>) => {
    setBatchJobs(batchJobs.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const runBatchSimulation = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      const simulations = batchJobs.map(job => ({
        neurons: job.neurons,
        stimulus: { type: job.stimulusType, value: job.stimulusValue },
        duration_ms: job.duration,
        include_physics: true
      }));

      const { data, error } = await supabase.functions.invoke('openworm-simulate', {
        body: {
          batch: true,
          simulations
        }
      });

      if (error) throw new Error(error.message);

      setResults(data);
      toast.success("Batch simulation complete!", {
        description: `Processed ${batchJobs.length} simulations`
      });
    } catch (error) {
      toast.error("Batch simulation failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  const runParameterSweep = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    try {
      const sweepConfig: any = {
        sweep: true,
        sweep_type: sweepType,
        base_neurons: baseNeurons,
        steps: sweepSteps,
        include_physics: true
      };

      if (sweepType === "stimulus_intensity") {
        sweepConfig.min_value = intensityRange[0];
        sweepConfig.max_value = intensityRange[1];
      } else if (sweepType === "duration") {
        sweepConfig.min_duration = durationRange[0];
        sweepConfig.max_duration = durationRange[1];
      } else if (sweepType === "neuron_ablation") {
        sweepConfig.ablation_targets = ablationNeurons;
      } else if (sweepType === "stimulus_type") {
        sweepConfig.stimulus_types = STIMULUS_TYPES;
      }

      const { data, error } = await supabase.functions.invoke('openworm-simulate', {
        body: sweepConfig
      });

      if (error) throw new Error(error.message);

      setResults(data);
      toast.success("Parameter sweep complete!", {
        description: `Analyzed ${sweepSteps} parameter configurations`
      });
    } catch (error) {
      toast.error("Parameter sweep failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  };

  return (
    <Card className="border-3 border-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              Advanced Analysis
            </CardTitle>
            <CardDescription>
              Run batch simulations and systematic parameter sweeps
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Zap className="w-3 h-3" />
            Research Mode
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "batch" | "sweep")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sweep" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Parameter Sweep
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Layers className="w-4 h-4" />
              Batch Simulation
            </TabsTrigger>
          </TabsList>

          {/* Parameter Sweep Tab */}
          <TabsContent value="sweep" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Sweep Type Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Sweep Type
                </Label>
                <Select value={sweepType} onValueChange={setSweepType}>
                  <SelectTrigger className="border-2 border-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stimulus_intensity">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Stimulus Intensity (Dose-Response)
                      </div>
                    </SelectItem>
                    <SelectItem value="stimulus_type">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4 text-purple-500" />
                        Stimulus Type Comparison
                      </div>
                    </SelectItem>
                    <SelectItem value="neuron_ablation">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-red-500" />
                        Neuron Ablation Study
                      </div>
                    </SelectItem>
                    <SelectItem value="duration">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-green-500" />
                        Duration Sweep
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Steps Configuration */}
              <div className="space-y-2">
                <Label className="text-sm font-bold">
                  Steps: {sweepSteps}
                </Label>
                <Slider
                  value={[sweepSteps]}
                  onValueChange={([v]) => setSweepSteps(v)}
                  min={3}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  {sweepType === "neuron_ablation" 
                    ? `Will test ${ablationNeurons.length} ablation configurations`
                    : `Will run ${sweepSteps} simulations across parameter range`
                  }
                </p>
              </div>
            </div>

            {/* Base Circuit Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Base Circuit
              </Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_NEURONS.map(neuron => (
                  <Button
                    key={neuron}
                    variant={baseNeurons.includes(neuron) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNeuron(neuron, baseNeurons, setBaseNeurons)}
                    className="text-xs"
                  >
                    {neuron}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sweep-specific parameters */}
            {sweepType === "stimulus_intensity" && (
              <div className="space-y-2 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Label className="text-sm font-bold">
                  Intensity Range: {intensityRange[0].toFixed(1)} → {intensityRange[1].toFixed(1)}
                </Label>
                <Slider
                  value={intensityRange}
                  onValueChange={setIntensityRange}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Generates a dose-response curve showing how neural output changes with stimulus intensity
                </p>
              </div>
            )}

            {sweepType === "duration" && (
              <div className="space-y-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <Label className="text-sm font-bold">
                  Duration Range: {durationRange[0]}ms → {durationRange[1]}ms
                </Label>
                <Slider
                  value={durationRange}
                  onValueChange={setDurationRange}
                  min={50}
                  max={5000}
                  step={50}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Analyze how circuit dynamics evolve over different simulation durations
                </p>
              </div>
            )}

            {sweepType === "neuron_ablation" && (
              <div className="space-y-2 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Ablation Targets
                </Label>
                <div className="flex flex-wrap gap-2">
                  {baseNeurons.map(neuron => (
                    <Button
                      key={neuron}
                      variant={ablationNeurons.includes(neuron) ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => toggleNeuron(neuron, ablationNeurons, setAblationNeurons)}
                      className="text-xs"
                    >
                      <Scissors className="w-3 h-3 mr-1" />
                      {neuron}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Each selected neuron will be individually ablated to measure its impact on circuit function
                </p>
              </div>
            )}

            {sweepType === "stimulus_type" && (
              <div className="space-y-2 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Label className="text-sm font-bold">Stimulus Types to Compare</Label>
                <div className="flex flex-wrap gap-2">
                  {STIMULUS_TYPES.map(type => (
                    <Badge key={type} variant="secondary" className="capitalize">
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Compare circuit responses across all stimulus modalities
                </p>
              </div>
            )}
          </TabsContent>

          {/* Batch Simulation Tab */}
          <TabsContent value="batch" className="space-y-4">
            <div className="space-y-3">
              {batchJobs.map((job, index) => (
                <Card key={job.id} className="border-2 border-foreground/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">Simulation #{index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBatchJob(job.id)}
                        disabled={batchJobs.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Neurons</Label>
                        <Select 
                          value={job.neurons.join(",")}
                          onValueChange={(v) => updateBatchJob(job.id, { neurons: v.split(",") })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASEL,AIY">ASEL → AIY</SelectItem>
                            <SelectItem value="ASH,AVA">ASH → AVA</SelectItem>
                            <SelectItem value="AWC,AIZ">AWC → AIZ</SelectItem>
                            <SelectItem value="ASEL,AIY,AVA,DA01">Full Sensory-Motor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Stimulus</Label>
                        <Select 
                          value={job.stimulusType}
                          onValueChange={(v) => updateBatchJob(job.id, { stimulusType: v })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STIMULUS_TYPES.map(type => (
                              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Intensity: {job.stimulusValue}</Label>
                        <Slider
                          value={[job.stimulusValue]}
                          onValueChange={([v]) => updateBatchJob(job.id, { stimulusValue: v })}
                          min={0.1}
                          max={1}
                          step={0.1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Duration: {job.duration}ms</Label>
                        <Slider
                          value={[job.duration]}
                          onValueChange={([v]) => updateBatchJob(job.id, { duration: v })}
                          min={100}
                          max={3000}
                          step={100}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={addBatchJob}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Simulation
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Run Button */}
        <Button 
          className="w-full font-bold gap-2" 
          size="lg"
          onClick={mode === "batch" ? runBatchSimulation : runParameterSweep}
          disabled={isRunning || (mode === "batch" && batchJobs.length === 0) || (mode === "sweep" && baseNeurons.length === 0)}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === "batch" ? "Running Batch..." : "Running Sweep..."}
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {mode === "batch" ? `Run ${batchJobs.length} Simulations` : `Run ${sweepSteps}-Point Sweep`}
            </>
          )}
        </Button>

        {/* Results Visualization */}
        {results && (
          <SweepVisualization 
            results={results} 
            sweepType={sweepType}
            mode={mode}
          />
        )}
      </CardContent>
    </Card>
  );
}
