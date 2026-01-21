import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crosshair,
  FlaskConical,
  Gauge,
  Lightbulb,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  Activity,
  Microscope,
  Network,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useHallucinationHunter, CircuitBuild, HallucinationResult } from '@/hooks/useHallucinationHunter';
import { useCritiqueLoop, PerturbationInput, SimulationState, CritiqueResult } from '@/hooks/useCritiqueLoop';
import { useGliaAnalysis, NeuronInput, GliaAnalysisResponse } from '@/hooks/useGliaAnalysis';
import { cn } from '@/lib/utils';

interface SimulationMasteryDashboardProps {
  initialCircuit?: CircuitBuild;
  onCircuitUpdate?: (circuit: CircuitBuild) => void;
  className?: string;
}

// Default test circuit
const DEFAULT_CIRCUIT: CircuitBuild = {
  neurons: [
    { id: 'ASEL', type: 'sensory', position: { x: 0, y: 0, z: 0 }, activity: 0.8 },
    { id: 'AIY', type: 'interneuron', position: { x: 1, y: 0, z: 0 }, activity: 0.6 },
    { id: 'AVA', type: 'interneuron', position: { x: 2, y: 0, z: 0 }, activity: 0.4 },
  ],
  connections: [
    { from: 'ASEL', to: 'AIY', weight: 0.7, type: 'chemical' },
    { from: 'AIY', to: 'AVA', weight: 0.5, type: 'chemical' },
  ],
  targetBehavior: 'chemotaxis',
};

const MASTERY_COLORS = {
  novice: 'bg-muted text-muted-foreground',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  expert: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const SEVERITY_COLORS = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function SimulationMasteryDashboard({ 
  initialCircuit = DEFAULT_CIRCUIT,
  onCircuitUpdate,
  className 
}: SimulationMasteryDashboardProps) {
  const [circuit, setCircuit] = useState<CircuitBuild>(initialCircuit);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hallucination Hunter state
  const hallucination = useHallucinationHunter();
  
  // Critique Loop state
  const critique = useCritiqueLoop();
  const [perturbation, setPerturbation] = useState<PerturbationInput>({
    type: 'neurotransmitter',
    target: 'GABA',
    value: 1.0,
  });
  const [hypothesis, setHypothesis] = useState('');
  
  // Glia Analysis state
  const glia = useGliaAnalysis();

  // Unified validation scores
  const [overallScore, setOverallScore] = useState<number | null>(null);

  const updateCircuit = useCallback((newCircuit: CircuitBuild) => {
    setCircuit(newCircuit);
    onCircuitUpdate?.(newCircuit);
  }, [onCircuitUpdate]);

  // Run all validations
  const runFullValidation = async () => {
    const results: { hallucination?: HallucinationResult; critique?: CritiqueResult; glia?: GliaAnalysisResponse } = {};
    
    // Run hallucination analysis
    const hallucinationResult = await hallucination.analyzeCircuit(circuit);
    if (hallucinationResult) results.hallucination = hallucinationResult;
    
    // Run glia analysis
    const gliaInput: NeuronInput[] = circuit.neurons.map(n => ({
      neuronId: n.id,
      type: n.type,
      connections: circuit.connections.filter(c => c.from === n.id || c.to === n.id).length,
      position: n.position,
    }));
    const gliaResult = await glia.analyzeNeurons(gliaInput);
    if (gliaResult) results.glia = gliaResult;
    
    // Calculate overall score
    let score = 0;
    let count = 0;
    if (results.hallucination) {
      score += results.hallucination.accuracy.overall;
      count++;
    }
    if (results.glia) {
      const gliaScore = 100 - Math.abs(results.glia.overallImpact.chemotaxisAccuracy);
      score += gliaScore;
      count++;
    }
    
    setOverallScore(count > 0 ? score / count : null);
  };

  // Run critique validation
  const runCritique = async () => {
    const simState: SimulationState = {
      neurons: circuit.neurons.map(n => ({
        id: n.id,
        activity: n.activity ?? Math.random(),
        membrane_potential: -65 + Math.random() * 20,
      })),
      connections: circuit.connections.map(c => ({
        from: c.from,
        to: c.to,
        weight: c.weight,
        type: c.type,
      })),
      timeStep: 100,
      entropy: 0.5,
    };
    
    await critique.validatePerturbation(perturbation, simState, hypothesis || undefined);
  };

  const getAccuracyColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-destructive';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  return (
    <Card className={cn("border-border/50 bg-card/95 backdrop-blur", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Simulation Mastery Hub</CardTitle>
              <CardDescription>Unified AI validation for C. elegans circuits</CardDescription>
            </div>
          </div>
          {overallScore !== null && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Overall Score</span>
              <div className={cn("text-3xl font-bold", getAccuracyColor(overallScore))}>
                {overallScore.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="hallucination" className="gap-2">
              <Crosshair className="w-4 h-4" />
              <span className="hidden sm:inline">Hunter</span>
            </TabsTrigger>
            <TabsTrigger value="critique" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              <span className="hidden sm:inline">Critique</span>
            </TabsTrigger>
            <TabsTrigger value="glia" className="gap-2">
              <Microscope className="w-4 h-4" />
              <span className="hidden sm:inline">Glia</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button 
                onClick={runFullValidation} 
                disabled={hallucination.isAnalyzing || glia.isAnalyzing}
                className="flex-1"
              >
                {(hallucination.isAnalyzing || glia.isAnalyzing) ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Run Full Validation</>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  hallucination.reset();
                  critique.reset();
                  glia.reset();
                  setOverallScore(null);
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <QuickStatCard
                title="Circuit Health"
                value={hallucination.result?.accuracy.overall}
                icon={Network}
                status={hallucination.result?.passesValidation ? 'success' : hallucination.result ? 'warning' : 'pending'}
              />
              <QuickStatCard
                title="Chaos Risk"
                value={critique.result ? (critique.result.redAlert ? 'HIGH' : 'LOW') : undefined}
                icon={Activity}
                status={critique.result?.redAlert ? 'error' : critique.result ? 'success' : 'pending'}
              />
              <QuickStatCard
                title="Glia Impact"
                value={glia.results ? `${Math.abs(glia.results.overallImpact.chemotaxisAccuracy).toFixed(0)}%` : undefined}
                icon={Microscope}
                status={glia.results ? (Math.abs(glia.results.overallImpact.chemotaxisAccuracy) > 10 ? 'warning' : 'success') : 'pending'}
              />
            </div>

            {/* Circuit Info */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Current Circuit</span>
                <Badge variant="outline">{circuit.targetBehavior}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Neurons:</span>
                  <span className="ml-2 font-medium">{circuit.neurons.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="ml-2 font-medium">{circuit.connections.length}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {circuit.neurons.map(n => (
                  <Badge key={n.id} variant="secondary" className="text-xs">
                    {n.id}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mastery Summary */}
            {hallucination.result?.mastery && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-medium">Mastery Level</span>
                  </div>
                  <Badge className={cn("capitalize", MASTERY_COLORS[hallucination.result.mastery.currentLevel])}>
                    {hallucination.result.mastery.currentLevel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Next: {hallucination.result.mastery.nextMilestone}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Hallucination Hunter Tab */}
          <TabsContent value="hallucination" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => hallucination.analyzeCircuit(circuit)}
                disabled={hallucination.isAnalyzing}
                className="flex-1"
              >
                {hallucination.isAnalyzing ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                ) : (
                  <><Crosshair className="w-4 h-4 mr-2" /> Detect Hallucinations</>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  const { finalBuild } = await hallucination.runAutoIteration(circuit);
                  updateCircuit(finalBuild);
                }}
                disabled={hallucination.isAnalyzing}
              >
                <Zap className="w-4 h-4 mr-1" /> Auto-Fix
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {hallucination.result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Accuracy Scores */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Ensemble Accuracy</span>
                      <span className={cn("text-2xl font-bold", getAccuracyColor(hallucination.result.accuracy.overall))}>
                        {hallucination.result.accuracy.overall}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(hallucination.result.accuracy.byDimension).filter(([k]) => k !== 'overall').map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize text-muted-foreground">{key}</span>
                            <span className={getAccuracyColor(value)}>{value}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              className={cn("h-full rounded-full", getProgressColor(value))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hallucination Flags */}
                  {hallucination.result.hallucinations.flags.length > 0 && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-medium text-destructive">Hallucination Flags</span>
                        <Badge variant="destructive" className="ml-auto">
                          {hallucination.result.hallucinations.flags.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {hallucination.result.hallucinations.flags.map((flag, idx) => (
                          <div key={idx} className={cn("p-2 rounded text-sm", SEVERITY_COLORS[flag.severity])}>
                            <span className="font-medium">{flag.type}</span>
                            <p className="text-xs opacity-80 mt-0.5">{flag.evidence || flag.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Iteration Plan */}
                  {hallucination.result.iteration.plan.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-medium">Iteration Plan</span>
                      </div>
                      <div className="space-y-2">
                        {hallucination.result.iteration.plan.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <p>{step.action}</p>
                              <span className="text-xs text-green-400">+{step.expectedImprovement}% expected</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insight */}
                  {hallucination.result.insight && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{hallucination.result.insight}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Critique Loop Tab */}
          <TabsContent value="critique" className="space-y-4 mt-4">
            {/* Perturbation Controls */}
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Perturbation Type</Label>
                  <Select 
                    value={perturbation.type} 
                    onValueChange={(v) => setPerturbation(p => ({ ...p, type: v as PerturbationInput['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neurotransmitter">Neurotransmitter</SelectItem>
                      <SelectItem value="synapse">Synapse</SelectItem>
                      <SelectItem value="neuron_ablation">Ablation</SelectItem>
                      <SelectItem value="connection_weight">Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Select 
                    value={perturbation.target}
                    onValueChange={(v) => setPerturbation(p => ({ ...p, target: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GABA">GABA</SelectItem>
                      <SelectItem value="acetylcholine">Acetylcholine</SelectItem>
                      <SelectItem value="dopamine">Dopamine</SelectItem>
                      <SelectItem value="serotonin">Serotonin</SelectItem>
                      <SelectItem value="glutamate">Glutamate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Strength</Label>
                  <span className="text-sm text-muted-foreground">{perturbation.value.toFixed(2)}x</span>
                </div>
                <Slider
                  value={[perturbation.value]}
                  onValueChange={([v]) => setPerturbation(p => ({ ...p, value: v }))}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Hypothesis (optional)</Label>
                <Input
                  placeholder="e.g., Increasing GABA will reduce locomotion"
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={runCritique}
              disabled={critique.isValidating}
              className="w-full"
            >
              {critique.isValidating ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Validating...</>
              ) : (
                <><FlaskConical className="w-4 h-4 mr-2" /> Validate Perturbation</>
              )}
            </Button>

            <AnimatePresence mode="wait">
              {critique.result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Red Alert */}
                  {critique.result.redAlert && (
                    <div className="p-4 rounded-lg bg-destructive/20 border border-destructive/40 animate-pulse">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <span className="font-bold text-destructive">CHAOS ATTRACTOR DETECTED</span>
                      </div>
                      <p className="text-sm text-destructive/80 mt-1">
                        Lyapunov: {critique.result.chaos.lyapunovExponent.toFixed(3)} | 
                        Entropy: {critique.result.chaos.entropy.toFixed(3)}
                      </p>
                    </div>
                  )}

                  {/* Validation Score */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Validation Score</span>
                      <span className={cn("text-2xl font-bold", getAccuracyColor(critique.result.validation.score))}>
                        {critique.result.validation.score}%
                      </span>
                    </div>
                    <Progress 
                      value={critique.result.validation.score} 
                      className="mt-2 h-2"
                    />
                    {critique.result.validation.warnings.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {critique.result.validation.warnings.map((w, i) => (
                          <p key={i} className="text-xs text-yellow-400">⚠️ {w}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chaos Analysis */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="font-medium">Chaos Analysis</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          critique.result.chaos.riskLevel === 'critical' && 'border-destructive text-destructive',
                          critique.result.chaos.riskLevel === 'high' && 'border-orange-500 text-orange-400',
                          critique.result.chaos.riskLevel === 'medium' && 'border-yellow-500 text-yellow-400',
                          critique.result.chaos.riskLevel === 'low' && 'border-green-500 text-green-400',
                        )}
                      >
                        {critique.result.chaos.riskLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Attractor</span>
                        <p className="font-medium capitalize">{critique.result.chaos.attractorType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence</span>
                        <p className="font-medium">{(critique.result.chaos.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    {critique.result.chaos.explanation && (
                      <p className="text-xs text-muted-foreground mt-3">{critique.result.chaos.explanation}</p>
                    )}
                  </div>

                  {/* Prediction */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="font-medium">Behavioral Prediction</span>
                    </div>
                    <p className="text-sm">{critique.result.prediction.expectedBehavior}</p>
                  </div>

                  {/* Recommendations */}
                  {critique.result.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Recommendations</span>
                      {critique.result.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/30">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p>{rec}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Educational Insight */}
                  {critique.result.educational.insight && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm">{critique.result.educational.insight}</p>
                          {critique.result.educational.citations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {critique.result.educational.citations.map((cite, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cite}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Glia Analysis Tab */}
          <TabsContent value="glia" className="space-y-4 mt-4">
            <Button 
              onClick={async () => {
                const gliaInput: NeuronInput[] = circuit.neurons.map(n => ({
                  neuronId: n.id,
                  type: n.type,
                  connections: circuit.connections.filter(c => c.from === n.id || c.to === n.id).length,
                  position: n.position,
                }));
                await glia.analyzeNeurons(gliaInput);
              }}
              disabled={glia.isAnalyzing}
              className="w-full"
            >
              {glia.isAnalyzing ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Microscope className="w-4 h-4 mr-2" /> Analyze Glia Omissions</>
              )}
            </Button>

            <AnimatePresence mode="wait">
              {glia.results && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Impact Summary */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <span className="font-medium">Accuracy Impact (without glia)</span>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <ImpactMeter 
                        label="Chemotaxis" 
                        value={glia.results.overallImpact.chemotaxisAccuracy} 
                      />
                      <ImpactMeter 
                        label="Mechanosensation" 
                        value={glia.results.overallImpact.mechanosensationAccuracy} 
                      />
                      <ImpactMeter 
                        label="Thermotaxis" 
                        value={glia.results.overallImpact.thermotaxisAccuracy} 
                      />
                    </div>
                  </div>

                  {/* Per-Neuron Analysis */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Neuron Analysis</span>
                    {glia.results.analysis.map((item, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border",
                          item.impact === 'high' && "bg-destructive/10 border-destructive/30",
                          item.impact === 'medium' && "bg-yellow-500/10 border-yellow-500/30",
                          item.impact === 'low' && "bg-muted/30 border-border/50",
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.neuronId}</Badge>
                            {item.hasGliaInVivo && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.gliaType}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {(item.confidence * 100).toFixed(0)}% conf
                            </span>
                            <Badge 
                              variant={item.impact === 'high' ? 'destructive' : 'outline'}
                              className="capitalize"
                            >
                              {item.impact}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.reasoning}</p>
                        <p className="text-xs text-primary mt-1">💡 {item.recommendation}</p>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{glia.results.summary}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper Components
function QuickStatCard({ 
  title, 
  value, 
  icon: Icon, 
  status 
}: { 
  title: string; 
  value?: number | string; 
  icon: React.ElementType; 
  status: 'success' | 'warning' | 'error' | 'pending';
}) {
  const statusColors = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-destructive/20 text-destructive border-destructive/30',
    pending: 'bg-muted text-muted-foreground border-border/50',
  };

  return (
    <div className={cn("p-3 rounded-lg border", statusColors[status])}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs">{title}</span>
      </div>
      <div className="text-lg font-bold">
        {value !== undefined ? (typeof value === 'number' ? `${value.toFixed(0)}%` : value) : '—'}
      </div>
    </div>
  );
}

function ImpactMeter({ label, value }: { label: string; value: number }) {
  const absValue = Math.abs(value);
  const color = absValue > 10 ? 'text-destructive' : absValue > 5 ? 'text-yellow-400' : 'text-green-400';
  
  return (
    <div className="text-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={cn("text-xl font-bold", color)}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </div>
    </div>
  );
}
