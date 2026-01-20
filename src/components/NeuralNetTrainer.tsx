import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Play, Pause, RotateCcw, Download, Upload, 
  TrendingUp, AlertTriangle, CheckCircle, Layers,
  GitBranch, Cpu, Activity, Target, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShareCreationDialog } from './ShareCreationDialog';

interface Layer {
  id: string;
  neurons: number;
  activation: 'relu' | 'sigmoid' | 'tanh' | 'softmax';
  dropout: number;
}

interface TrainingConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
  regularization: number;
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

interface NeuralNetTrainerProps {
  onNetworkChange?: (layers: Layer[]) => void;
  onTrainingComplete?: (metrics: TrainingMetrics[]) => void;
}

const DEFAULT_LAYERS: Layer[] = [
  { id: 'input', neurons: 302, activation: 'relu', dropout: 0 },
  { id: 'hidden1', neurons: 128, activation: 'relu', dropout: 0.2 },
  { id: 'hidden2', neurons: 64, activation: 'relu', dropout: 0.2 },
  { id: 'output', neurons: 95, activation: 'softmax', dropout: 0 },
];

const DEFAULT_CONFIG: TrainingConfig = {
  learningRate: 0.001,
  batchSize: 32,
  epochs: 100,
  optimizer: 'adam',
  regularization: 0.01,
};

const ACTIVATION_DESCRIPTIONS = {
  relu: 'Fast, works well for hidden layers',
  sigmoid: 'Good for binary classification',
  tanh: 'Zero-centered, can be better than sigmoid',
  softmax: 'Used for multi-class output layer',
};

export function NeuralNetTrainer({ onNetworkChange, onTrainingComplete }: NeuralNetTrainerProps) {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [config, setConfig] = useState<TrainingConfig>(DEFAULT_CONFIG);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCreationData = () => ({
    type: 'network' as const,
    layers: layers.map(l => ({
      id: l.id,
      neurons: l.neurons,
      activation: l.activation,
    })),
  });

  // Validate network architecture
  useEffect(() => {
    const warnings: string[] = [];
    
    if (layers.length < 2) {
      warnings.push('Network needs at least input and output layers');
    }
    
    const totalParams = layers.reduce((sum, layer, i) => {
      if (i === 0) return sum;
      return sum + (layers[i - 1].neurons * layer.neurons);
    }, 0);
    
    if (totalParams > 100000) {
      warnings.push(`High parameter count (${totalParams.toLocaleString()}) - may be slow to train`);
    }
    
    const lastLayer = layers[layers.length - 1];
    if (lastLayer.activation !== 'softmax' && lastLayer.activation !== 'sigmoid') {
      warnings.push('Output layer typically uses softmax or sigmoid activation');
    }
    
    const highDropout = layers.some(l => l.dropout > 0.5);
    if (highDropout) {
      warnings.push('Dropout > 50% may cause underfitting');
    }
    
    setValidationWarnings(warnings);
    onNetworkChange?.(layers);
  }, [layers, onNetworkChange]);

  const addLayer = () => {
    const newLayer: Layer = {
      id: `hidden${layers.length}`,
      neurons: 64,
      activation: 'relu',
      dropout: 0.1,
    };
    // Insert before output layer
    const newLayers = [...layers];
    newLayers.splice(layers.length - 1, 0, newLayer);
    setLayers(newLayers);
  };

  const removeLayer = (index: number) => {
    if (index === 0 || index === layers.length - 1) {
      toast.error("Can't remove input or output layer");
      return;
    }
    setLayers(layers.filter((_, i) => i !== index));
  };

  const updateLayer = (index: number, updates: Partial<Layer>) => {
    setLayers(layers.map((layer, i) => 
      i === index ? { ...layer, ...updates } : layer
    ));
  };

  const simulateTraining = useCallback(() => {
    if (!isTraining) return;
    
    const epoch = currentEpoch + 1;
    
    // Simulate training metrics with some randomness
    const baseLoss = 2.5 * Math.exp(-epoch / 30);
    const baseAcc = 0.5 + 0.45 * (1 - Math.exp(-epoch / 25));
    
    const newMetric: TrainingMetrics = {
      epoch,
      loss: baseLoss + (Math.random() * 0.1 - 0.05),
      accuracy: Math.min(0.99, baseAcc + (Math.random() * 0.02 - 0.01)),
      valLoss: baseLoss * 1.1 + (Math.random() * 0.15 - 0.075),
      valAccuracy: Math.min(0.98, baseAcc * 0.95 + (Math.random() * 0.02 - 0.01)),
    };
    
    setMetrics(prev => [...prev, newMetric]);
    setCurrentEpoch(epoch);
    
    if (epoch >= config.epochs) {
      setIsTraining(false);
      toast.success('Training complete!');
      onTrainingComplete?.(metrics);
    }
  }, [isTraining, currentEpoch, config.epochs, metrics, onTrainingComplete]);

  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(simulateTraining, 100);
      return () => clearInterval(interval);
    }
  }, [isTraining, simulateTraining]);

  const startTraining = () => {
    if (validationWarnings.length > 0) {
      toast.warning('Training with warnings - results may not be optimal');
    }
    setMetrics([]);
    setCurrentEpoch(0);
    setIsTraining(true);
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  const resetNetwork = () => {
    setLayers(DEFAULT_LAYERS);
    setConfig(DEFAULT_CONFIG);
    setMetrics([]);
    setCurrentEpoch(0);
    toast.info('Network reset to defaults');
  };

  const exportModel = () => {
    const model = {
      architecture: layers,
      config,
      metrics,
    };
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neural-network-model.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Model exported!');
  };

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 rounded-xl border-2 border-border">
        <Button
          variant={isTraining ? 'destructive' : 'default'}
          onClick={isTraining ? stopTraining : startTraining}
          disabled={layers.length < 2}
          className="gap-2"
        >
          {isTraining ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isTraining ? 'Stop' : 'Train'}
        </Button>

        <Button variant="outline" size="icon" onClick={resetNetwork} disabled={isTraining}>
          <RotateCcw className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        {isTraining && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-mono">
              Epoch {currentEpoch}/{config.epochs}
            </span>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={exportModel} disabled={isTraining}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>

        <ShareCreationDialog creationData={getCreationData()} canvasRef={containerRef}>
          <Button variant="outline" size="sm" className="gap-1" disabled={isTraining}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </ShareCreationDialog>
      </div>

      <div ref={containerRef} className="space-y-4">
        {/* Warnings */}
        <AnimatePresence>
        {validationWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-warning/10 border border-warning/30 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
              <div className="space-y-1">
                {validationWarnings.map((warning, i) => (
                  <p key={i} className="text-sm text-warning">{warning}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Network Architecture */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="w-5 h-5" />
                Network Architecture
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addLayer} disabled={isTraining}>
                + Add Layer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {layers.map((layer, index) => (
                <motion.div
                  key={layer.id}
                  layout
                  className="p-3 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      {index === 0 ? (
                        <Badge variant="outline">Input</Badge>
                      ) : index === layers.length - 1 ? (
                        <Badge variant="outline">Output</Badge>
                      ) : (
                        <Badge variant="secondary">Hidden {index}</Badge>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-3 gap-4">
                      {/* Neurons */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Neurons</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[layer.neurons]}
                            onValueChange={([value]) => updateLayer(index, { neurons: value })}
                            min={1}
                            max={512}
                            step={1}
                            disabled={isTraining || index === 0}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-10">{layer.neurons}</span>
                        </div>
                      </div>

                      {/* Activation */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Activation</Label>
                        <Select
                          value={layer.activation}
                          onValueChange={(value) => updateLayer(index, { activation: value as Layer['activation'] })}
                          disabled={isTraining}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ACTIVATION_DESCRIPTIONS).map(([key, desc]) => (
                              <SelectItem key={key} value={key}>
                                <div>
                                  <span className="font-medium">{key}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{desc}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dropout */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Dropout</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[layer.dropout * 100]}
                            onValueChange={([value]) => updateLayer(index, { dropout: value / 100 })}
                            min={0}
                            max={80}
                            step={5}
                            disabled={isTraining || index === 0 || index === layers.length - 1}
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-10">{(layer.dropout * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    {index > 0 && index < layers.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLayer(index)}
                        disabled={isTraining}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Network Visualization */}
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center justify-between">
                {layers.map((layer, i) => (
                  <div key={layer.id} className="flex flex-col items-center">
                    <div 
                      className="flex flex-col gap-0.5"
                      style={{ maxHeight: '80px', overflow: 'hidden' }}
                    >
                      {Array.from({ length: Math.min(layer.neurons, 8) }).map((_, j) => (
                        <motion.div
                          key={j}
                          className="w-3 h-3 rounded-full bg-primary/60"
                          animate={isTraining ? { 
                            opacity: [0.4, 1, 0.4],
                            scale: [0.8, 1, 0.8],
                          } : {}}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1,
                            delay: (i * 0.1) + (j * 0.05),
                          }}
                        />
                      ))}
                      {layer.neurons > 8 && (
                        <span className="text-xs text-muted-foreground">+{layer.neurons - 8}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{layer.neurons}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Config & Metrics */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5" />
                Training Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Learning Rate</Label>
                <Select
                  value={config.learningRate.toString()}
                  onValueChange={(v) => setConfig(prev => ({ ...prev, learningRate: parseFloat(v) }))}
                  disabled={isTraining}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">0.1 (Fast)</SelectItem>
                    <SelectItem value="0.01">0.01 (Medium)</SelectItem>
                    <SelectItem value="0.001">0.001 (Standard)</SelectItem>
                    <SelectItem value="0.0001">0.0001 (Slow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Optimizer</Label>
                <Select
                  value={config.optimizer}
                  onValueChange={(v) => setConfig(prev => ({ ...prev, optimizer: v as TrainingConfig['optimizer'] }))}
                  disabled={isTraining}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adam">Adam (Recommended)</SelectItem>
                    <SelectItem value="sgd">SGD</SelectItem>
                    <SelectItem value="rmsprop">RMSprop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Epochs</Label>
                  <span className="text-sm text-muted-foreground font-mono">{config.epochs}</span>
                </div>
                <Slider
                  value={[config.epochs]}
                  onValueChange={([v]) => setConfig(prev => ({ ...prev, epochs: v }))}
                  min={10}
                  max={500}
                  step={10}
                  disabled={isTraining}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Batch Size</Label>
                  <span className="text-sm text-muted-foreground font-mono">{config.batchSize}</span>
                </div>
                <Slider
                  value={[config.batchSize]}
                  onValueChange={([v]) => setConfig(prev => ({ ...prev, batchSize: v }))}
                  min={8}
                  max={128}
                  step={8}
                  disabled={isTraining}
                />
              </div>
            </CardContent>
          </Card>

          {/* Training Metrics */}
          {metrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-primary/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Training Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Loss</div>
                      <div className="text-lg font-mono text-destructive">
                        {latestMetrics?.loss.toFixed(4)}
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                      <div className="text-lg font-mono text-primary">
                        {(latestMetrics?.accuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Val Loss</div>
                      <div className="text-lg font-mono text-warning">
                        {latestMetrics?.valLoss.toFixed(4)}
                      </div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg text-center">
                      <div className="text-xs text-muted-foreground">Val Acc</div>
                      <div className="text-lg font-mono text-primary">
                        {(latestMetrics?.valAccuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {isTraining && (
                    <Progress value={(currentEpoch / config.epochs) * 100} className="h-2" />
                  )}

                  {!isTraining && latestMetrics && latestMetrics.accuracy > 0.9 && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="w-4 h-4" />
                      High accuracy achieved!
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
