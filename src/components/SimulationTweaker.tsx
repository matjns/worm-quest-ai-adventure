import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Play, Pause, RotateCcw, Save, Download, Lightbulb, Zap, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShareCreationDialog } from './ShareCreationDialog';

interface SimulationParams {
  signalSpeed: number;
  synapticStrength: number;
  decayRate: number;
  threshold: number;
  refractoryPeriod: number;
  noiseLevel: number;
  temperature: number;
  chemicalGradient: number;
}

interface Preset {
  name: string;
  description: string;
  params: SimulationParams;
  icon: string;
}

const DEFAULT_PARAMS: SimulationParams = {
  signalSpeed: 50,
  synapticStrength: 70,
  decayRate: 30,
  threshold: 40,
  refractoryPeriod: 20,
  noiseLevel: 10,
  temperature: 50,
  chemicalGradient: 50,
};

const PRESETS: Preset[] = [
  {
    name: 'Normal Worm',
    description: 'Standard C. elegans behavior',
    icon: '🪱',
    params: DEFAULT_PARAMS,
  },
  {
    name: 'Hyperactive',
    description: 'Fast signals, high activity',
    icon: '⚡',
    params: {
      ...DEFAULT_PARAMS,
      signalSpeed: 90,
      synapticStrength: 90,
      threshold: 20,
      noiseLevel: 30,
    },
  },
  {
    name: 'Sluggish',
    description: 'Slow, dampened responses',
    icon: '🐌',
    params: {
      ...DEFAULT_PARAMS,
      signalSpeed: 20,
      synapticStrength: 40,
      decayRate: 60,
      threshold: 70,
    },
  },
  {
    name: 'Chemotaxis Mode',
    description: 'Strong chemical sensing',
    icon: '🧪',
    params: {
      ...DEFAULT_PARAMS,
      chemicalGradient: 90,
      synapticStrength: 80,
      threshold: 30,
    },
  },
  {
    name: 'Cold Shock',
    description: 'Low temperature response',
    icon: '❄️',
    params: {
      ...DEFAULT_PARAMS,
      temperature: 10,
      signalSpeed: 30,
      synapticStrength: 50,
    },
  },
  {
    name: 'Heat Stress',
    description: 'High temperature behavior',
    icon: '🔥',
    params: {
      ...DEFAULT_PARAMS,
      temperature: 90,
      signalSpeed: 80,
      noiseLevel: 40,
    },
  },
];

interface SimulationTweakerProps {
  onParamsChange?: (params: SimulationParams) => void;
  onSimulationToggle?: (running: boolean) => void;
}

export function SimulationTweaker({ onParamsChange, onSimulationToggle }: SimulationTweakerProps) {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [isRunning, setIsRunning] = useState(false);
  const [autoApply, setAutoApply] = useState(true);
  const [savedConfigs, setSavedConfigs] = useState<{ name: string; params: SimulationParams }[]>([]);
  const [simulationOutput, setSimulationOutput] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCreationData = () => ({
    type: 'simulation' as const,
    params: params as unknown as Record<string, number>,
  });

  useEffect(() => {
    if (autoApply) {
      onParamsChange?.(params);
    }
  }, [params, autoApply, onParamsChange]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        const outputs = [
          `Signal propagation: ${(params.signalSpeed / 10).toFixed(1)}ms`,
          `Active neurons: ${Math.floor(Math.random() * 50 + 20)}`,
          `Membrane potential: ${(Math.random() * 40 - 70).toFixed(1)}mV`,
          params.noiseLevel > 30 ? `⚠️ High noise detected` : null,
          params.temperature < 20 ? `❄️ Cold-induced slowdown` : null,
          params.temperature > 80 ? `🔥 Heat stress response` : null,
        ].filter(Boolean) as string[];
        
        setSimulationOutput(outputs);
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isRunning, params]);

  const updateParam = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: Preset) => {
    setParams(preset.params);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const toggleSimulation = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    onSimulationToggle?.(newState);
  };

  const resetToDefaults = () => {
    setParams(DEFAULT_PARAMS);
    toast.info('Reset to defaults');
  };

  const saveCurrentConfig = () => {
    const name = `Config ${savedConfigs.length + 1}`;
    setSavedConfigs(prev => [...prev, { name, params: { ...params } }]);
    toast.success(`Saved as "${name}"`);
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(params, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simulation-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported!');
  };

  const ParamSlider = ({ 
    label, 
    paramKey, 
    icon,
    unit = '%',
    min = 0,
    max = 100,
  }: { 
    label: string; 
    paramKey: keyof SimulationParams; 
    icon: string;
    unit?: string;
    min?: number;
    max?: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </Label>
        <span className="text-sm text-muted-foreground font-mono">
          {params[paramKey]}{unit}
        </span>
      </div>
      <Slider
        value={[params[paramKey]]}
        onValueChange={([value]) => updateParam(paramKey, value)}
        min={min}
        max={max}
        step={1}
        className="cursor-pointer"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 rounded-xl border-2 border-border">
        <Button
          variant={isRunning ? 'default' : 'outline'}
          onClick={toggleSimulation}
          className="gap-2"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pause' : 'Run'}
        </Button>

        <Button variant="outline" size="icon" onClick={resetToDefaults}>
          <RotateCcw className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Switch
            id="auto-apply"
            checked={autoApply}
            onCheckedChange={setAutoApply}
          />
          <Label htmlFor="auto-apply" className="text-sm">Auto-apply</Label>
        </div>

        <Button variant="outline" size="sm" onClick={saveCurrentConfig}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        <Button variant="outline" size="sm" onClick={exportConfig}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>

        <ShareCreationDialog creationData={getCreationData()} canvasRef={containerRef}>
          <Button variant="outline" size="sm" className="gap-1">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </ShareCreationDialog>
      </div>

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parameters */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sliders className="w-5 h-5" />
              Simulation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="neural">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="neural">Neural</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="neural" className="space-y-4 pt-4">
                <ParamSlider label="Signal Speed" paramKey="signalSpeed" icon="⚡" unit="%" />
                <ParamSlider label="Synaptic Strength" paramKey="synapticStrength" icon="🔗" unit="%" />
                <ParamSlider label="Activation Threshold" paramKey="threshold" icon="🎯" unit="%" />
                <ParamSlider label="Refractory Period" paramKey="refractoryPeriod" icon="⏱️" unit="ms" />
              </TabsContent>

              <TabsContent value="environment" className="space-y-4 pt-4">
                <ParamSlider label="Temperature" paramKey="temperature" icon="🌡️" unit="°" />
                <ParamSlider label="Chemical Gradient" paramKey="chemicalGradient" icon="🧪" unit="%" />
                <ParamSlider label="Noise Level" paramKey="noiseLevel" icon="📊" unit="%" />
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 pt-4">
                <ParamSlider label="Signal Decay Rate" paramKey="decayRate" icon="📉" unit="%" />
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 text-primary" />
                    Try extreme values to see how the worm's behavior changes! 
                    High noise can cause random movements, while low thresholds 
                    make the worm more sensitive.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Presets & Output */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PRESETS.map(preset => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-2"
                  onClick={() => applyPreset(preset)}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Live Output */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary animate-pulse" />
                    Live Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 font-mono text-xs">
                    {simulationOutput.map((line, i) => (
                      <div key={i} className="text-muted-foreground">
                        {line}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Saved Configs */}
          {savedConfigs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Saved Configs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {savedConfigs.map((config, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => {
                        setParams(config.params);
                        toast.success(`Loaded "${config.name}"`);
                      }}
                    >
                      {config.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
