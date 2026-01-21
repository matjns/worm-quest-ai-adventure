import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Users, Brain, Sparkles, GitBranch, CheckCircle2, 
  AlertTriangle, BarChart3, Zap, Globe, Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { NEURONS } from '@/data/openworm/connectome';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, Cell
} from 'recharts';

interface Modification {
  node: string;
  perturbation: number;
  userId?: string;
  timestamp?: string;
}

interface MonteCarloResult {
  delta: number;
  confidence: number;
  behavior: string;
}

interface JamResult {
  validated: boolean;
  aggregatedMod: Record<string, number>;
  statistics: {
    mean: number;
    variance: number;
    stdDev: number;
    sampleCount: number;
    avgConfidence: number;
  };
  prediction: {
    dominantBehavior: string;
    behaviorDistribution: Record<string, number>;
    resonanceDelta: number;
  };
  recommendation: string;
  samples: MonteCarloResult[];
}

interface ResearchJamActivityProps {
  className?: string;
}

// Simulated crowd modifications (in real app, fetch from database)
const CROWD_MODS: Modification[] = [
  { node: 'AVL', perturbation: 0.3, userId: 'user1', timestamp: '2024-01-15' },
  { node: 'RIM', perturbation: 0.45, userId: 'user2', timestamp: '2024-01-14' },
  { node: 'AIY', perturbation: 0.25, userId: 'user3', timestamp: '2024-01-14' },
  { node: 'ASE', perturbation: 0.6, userId: 'user4', timestamp: '2024-01-13' },
  { node: 'AWC', perturbation: 0.35, userId: 'user5', timestamp: '2024-01-12' },
];

export function ResearchJamActivity({ className }: ResearchJamActivityProps) {
  const [selectedNode, setSelectedNode] = useState('AVA');
  const [perturbation, setPerturbation] = useState(0.5);
  const [mcSamples, setMcSamples] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<JamResult | null>(null);
  const [contributions, setContributions] = useState<Modification[]>(CROWD_MODS);

  // Get popular neuron options
  const neuronOptions = NEURONS.slice(0, 50).map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
  }));

  const runResearchJam = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('research-jam', {
        body: {
          userMod: { node: selectedNode, perturbation },
          crowdMods: contributions,
          mcSamples,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;
      
      setResult(data);
      
      if (data.validated) {
        toast.success('🎉 Research validated!', {
          description: 'Low variance achieved. Ready for OpenWorm contribution.',
        });
      } else {
        toast.info('Results analyzed', {
          description: 'Consider refining parameters for lower variance.',
        });
      }
    } catch (err) {
      console.error('Research jam failed:', err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsRunning(false);
    }
  }, [selectedNode, perturbation, mcSamples, contributions]);

  const contributeToOpenWorm = () => {
    if (!result?.validated) return;
    
    // In production, this would create a GitHub PR
    toast.success('🚀 Contribution submitted!', {
      description: 'Your validated modification has been submitted to OpenWorm.',
    });
    
    // Add to local contributions
    setContributions(prev => [
      { node: selectedNode, perturbation, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  };

  // Prepare chart data
  const sampleChartData = result?.samples.map((s, i) => ({
    sample: i + 1,
    delta: s.delta,
    confidence: s.confidence,
  })) || [];

  const behaviorChartData = result?.prediction.behaviorDistribution
    ? Object.entries(result.prediction.behaviorDistribution).map(([name, count]) => ({
        name: name.length > 15 ? name.slice(0, 15) + '...' : name,
        count,
      }))
    : [];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Research Jam
              </CardTitle>
              <CardDescription>
                Crowdsource simulation extensions with Monte Carlo validation
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                {contributions.length} contributions
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="contribute" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contribute">Contribute</TabsTrigger>
              <TabsTrigger value="crowd">Crowd Mods</TabsTrigger>
              <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
            </TabsList>

            <TabsContent value="contribute" className="space-y-4 mt-4">
              {/* Node selection */}
              <div className="space-y-2">
                <Label>Target Neuron</Label>
                <div className="flex flex-wrap gap-2">
                  {neuronOptions.slice(0, 12).map(n => (
                    <Button
                      key={n.id}
                      variant={selectedNode === n.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedNode(n.id)}
                      className="text-xs"
                    >
                      {n.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Perturbation slider */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Perturbation Strength</Label>
                  <span className="text-sm text-muted-foreground">{perturbation.toFixed(2)}</span>
                </div>
                <Slider
                  value={[perturbation]}
                  onValueChange={([v]) => setPerturbation(v)}
                  min={0}
                  max={1}
                  step={0.05}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values = stronger modification to synaptic weights
                </p>
              </div>

              {/* MC Samples */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Monte Carlo Samples</Label>
                  <span className="text-sm text-muted-foreground">{mcSamples}</span>
                </div>
                <Slider
                  value={[mcSamples]}
                  onValueChange={([v]) => setMcSamples(v)}
                  min={5}
                  max={50}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  More samples = higher confidence but longer runtime
                </p>
              </div>

              {/* Run button */}
              <div className="flex gap-3">
                <Button
                  onClick={runResearchJam}
                  disabled={isRunning}
                  className="flex-1"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running MC Validation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run Research Jam
                    </>
                  )}
                </Button>
              </div>

              {/* Progress */}
              {isRunning && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-center text-muted-foreground">
                    Sampling {mcSamples} stochastic scenarios...
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crowd" className="space-y-4 mt-4">
              <div className="space-y-3">
                {contributions.map((mod, i) => (
                  <motion.div
                    key={`${mod.node}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 bg-muted rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{mod.node}</p>
                        <p className="text-xs text-muted-foreground">
                          Perturbation: {mod.perturbation?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {mod.timestamp ? new Date(mod.timestamp).toLocaleDateString() : 'Recent'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4 mt-4">
              {result && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Validation status */}
                    <Card className={result.validated ? 'border-green-500/50 bg-green-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          {result.validated ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-8 h-8 text-yellow-500" />
                          )}
                          <div>
                            <h4 className="font-medium">
                              {result.validated ? 'Validated!' : 'High Variance'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {result.recommendation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold">{result.statistics.mean.toFixed(3)}</p>
                        <p className="text-xs text-muted-foreground">Mean Delta</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold">{result.statistics.variance.toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">Variance</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold">{(result.statistics.avgConfidence * 100).toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Avg Confidence</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-2xl font-bold">{result.statistics.sampleCount}</p>
                        <p className="text-xs text-muted-foreground">Samples</p>
                      </div>
                    </div>

                    {/* Delta distribution chart */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          Sample Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sampleChartData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="sample" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="delta"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Behavior distribution */}
                    {behaviorChartData.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Predicted Behaviors
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={behaviorChartData} layout="vertical">
                                <XAxis type="number" tick={{ fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Contribute button */}
                    {result.validated && (
                      <Button onClick={contributeToOpenWorm} className="w-full gap-2">
                        <GitBranch className="w-4 h-4" />
                        Contribute to OpenWorm
                      </Button>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
