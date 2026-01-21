import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Brain, Activity,
  Target, Shield, RefreshCw, Loader2, ChevronDown, ChevronUp,
  AlertCircle, Info, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCritiqueLoop, type PerturbationInput, type SimulationState } from '@/hooks/useCritiqueLoop';
import { useGameStore } from '@/stores/gameStore';

// Demo simulation state generator
function generateSimulationState(perturbation: PerturbationInput): SimulationState {
  const baseNeurons = [
    { id: 'ASEL', activity: 0.6, membrane_potential: -45 },
    { id: 'ASER', activity: 0.55, membrane_potential: -48 },
    { id: 'AIY', activity: 0.4, membrane_potential: -52 },
    { id: 'AIZ', activity: 0.35, membrane_potential: -55 },
    { id: 'AVA', activity: 0.5, membrane_potential: -50 },
    { id: 'AVB', activity: 0.45, membrane_potential: -51 },
    { id: 'DA', activity: 0.3, membrane_potential: -58 },
    { id: 'DB', activity: 0.25, membrane_potential: -60 },
  ];

  // Apply perturbation effects
  const neurons = baseNeurons.map(n => {
    let activity = n.activity;
    
    if (perturbation.type === 'neurotransmitter') {
      if (perturbation.target === 'GABA') {
        activity *= (1 - perturbation.value * 0.5); // GABA inhibits
      } else if (perturbation.target === 'acetylcholine') {
        activity *= (1 + perturbation.value * 0.3);
      }
    }
    
    // Add some noise for realism
    activity += (Math.random() - 0.5) * 0.1;
    activity = Math.max(0, Math.min(1, activity));
    
    return { ...n, activity };
  });

  return {
    neurons,
    connections: [
      { from: 'ASEL', to: 'AIY', weight: 1.2, type: 'chemical' },
      { from: 'ASER', to: 'AIZ', weight: 1.1, type: 'chemical' },
      { from: 'AIY', to: 'AVA', weight: 0.8, type: 'chemical' },
      { from: 'AIZ', to: 'AVB', weight: 0.9, type: 'chemical' },
      { from: 'AVA', to: 'DA', weight: 1.5, type: 'chemical' },
      { from: 'AVB', to: 'DB', weight: 1.4, type: 'chemical' },
    ],
    timeStep: 100,
    entropy: 1.8 + (perturbation.value > 1.5 ? 0.8 : 0),
  };
}

export function ValidationCritiquePanel() {
  const { validatePerturbation, isValidating, result, reset } = useCritiqueLoop();
  const { addXp, addPoints } = useGameStore();
  
  const [perturbation, setPerturbation] = useState<PerturbationInput>({
    type: 'neurotransmitter',
    target: 'GABA',
    value: 0.5,
    originalValue: 0.5,
  });
  const [hypothesis, setHypothesis] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleValidate = async () => {
    const simState = generateSimulationState(perturbation);
    const result = await validatePerturbation(perturbation, simState, hypothesis || undefined);
    
    if (result) {
      addXp(25);
      addPoints(result.validation.score >= 80 ? 100 : 50);
    }
  };

  return (
    <Card className="border-2 border-amber-500/20">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-red-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Real-time Critique Loop
              <Badge variant="outline" className="ml-2">Ground Truth AI</Badge>
            </CardTitle>
            <CardDescription>
              Cross-validates perturbations against WormAtlas • Flags chaos attractors
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Perturbation Controls */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Perturbation Type</label>
            <Select 
              value={perturbation.type} 
              onValueChange={(v) => setPerturbation(p => ({ ...p, type: v as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neurotransmitter">Neurotransmitter</SelectItem>
                <SelectItem value="synapse">Synapse Modification</SelectItem>
                <SelectItem value="neuron_ablation">Neuron Ablation</SelectItem>
                <SelectItem value="connection_weight">Connection Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Target</label>
            <Select 
              value={perturbation.target} 
              onValueChange={(v) => setPerturbation(p => ({ ...p, target: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GABA">GABA (Inhibitory)</SelectItem>
                <SelectItem value="acetylcholine">Acetylcholine (Excitatory)</SelectItem>
                <SelectItem value="dopamine">Dopamine (Modulatory)</SelectItem>
                <SelectItem value="serotonin">Serotonin (Modulatory)</SelectItem>
                <SelectItem value="glutamate">Glutamate (Excitatory)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium">
              Perturbation Strength: {perturbation.value.toFixed(2)}
            </label>
            {perturbation.value > 1.5 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" /> Extreme
              </Badge>
            )}
          </div>
          <Slider
            value={[perturbation.value]}
            onValueChange={([v]) => setPerturbation(p => ({ ...p, value: v }))}
            min={0}
            max={2}
            step={0.05}
            className={perturbation.value > 1.5 ? 'accent-destructive' : ''}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Normal range: 0.2 - 0.8 • Extreme: {'>'} 1.5
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Your Hypothesis (optional)</label>
          <Input
            placeholder="e.g., GABA overdrive will cause complete motor inhibition"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handleValidate} 
          disabled={isValidating}
          className="w-full"
          size="lg"
        >
          {isValidating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating against WormAtlas...</>
          ) : (
            <><Target className="w-4 h-4 mr-2" /> Validate Perturbation</>
          )}
        </Button>
        
        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Red Alert Banner */}
              {result.redAlert && (
                <div className="bg-destructive/20 border-2 border-destructive rounded-lg p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    <div>
                      <h4 className="font-bold text-destructive">RED ALERT: Chaos Attractor Detected!</h4>
                      <p className="text-sm text-destructive/80">
                        {result.chaos.attractorType === 'strange_attractor' 
                          ? 'Strange attractor dynamics may cause unpredictable behavior'
                          : 'Simulation deviates significantly from biological reality'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card rounded-lg p-3 text-center border">
                  <p className={`text-2xl font-bold ${
                    result.validation.score >= 80 ? 'text-green-500' :
                    result.validation.score >= 50 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {result.validation.score.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Validation Score</p>
                </div>
                
                <div className="bg-card rounded-lg p-3 text-center border">
                  <p className="text-2xl font-bold">
                    {result.validation.biologicalAccuracy.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Bio Accuracy</p>
                </div>
                
                <div className="bg-card rounded-lg p-3 text-center border">
                  <p className={`text-2xl font-bold ${
                    result.chaos.riskLevel === 'critical' ? 'text-red-500' :
                    result.chaos.riskLevel === 'high' ? 'text-orange-500' :
                    result.chaos.riskLevel === 'medium' ? 'text-amber-500' : 'text-green-500'
                  }`}>
                    {result.chaos.riskLevel.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">Chaos Risk</p>
                </div>
                
                <div className="bg-card rounded-lg p-3 text-center border">
                  <p className="text-2xl font-bold">
                    {result.chaos.lyapunovExponent.toFixed(3)}
                  </p>
                  <p className="text-xs text-muted-foreground">Lyapunov λ</p>
                </div>
              </div>
              
              {/* Chaos Analysis */}
              <div className={`rounded-lg p-4 border ${
                result.chaos.isChaotic 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className={`w-5 h-5 ${result.chaos.isChaotic ? 'text-red-500' : 'text-green-500'}`} />
                  <h4 className="font-medium">
                    Attractor: {result.chaos.attractorType.replace('_', ' ')}
                  </h4>
                  <Badge variant="outline">
                    {(result.chaos.confidence * 100).toFixed(0)}% conf
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.chaos.explanation || 
                    `Entropy: ${result.chaos.entropy.toFixed(3)} bits • ` +
                    `${result.chaos.isChaotic ? 'Positive Lyapunov indicates sensitivity to initial conditions' : 'Stable dynamics within biological bounds'}`
                  }
                </p>
              </div>
              
              {/* Warnings */}
              {result.validation.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Ground Truth Warnings
                  </h4>
                  {result.validation.warnings.map((warning, i) => (
                    <div key={i} className="bg-amber-500/10 rounded p-2 text-sm border border-amber-500/20">
                      {warning}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Expandable Details */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                {showDetails ? 'Hide' : 'Show'} Detailed Analysis
              </Button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Prediction */}
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        Predicted Behavior
                      </h4>
                      <p className="text-sm">{result.prediction.expectedBehavior}</p>
                    </div>
                    
                    {/* Ground Truth Alignment */}
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        WormAtlas Alignment
                      </h4>
                      <p className="text-sm">{result.prediction.groundTruthAlignment}</p>
                      {result.validation.groundTruthReference && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reference: {result.validation.groundTruthReference}
                        </p>
                      )}
                    </div>
                    
                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          AI Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Educational Insight */}
                    {result.educational.insight && (
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          Dynamical Systems Insight
                        </h4>
                        <p className="text-sm">{result.educational.insight}</p>
                        {result.educational.citations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Citations:</p>
                            <ul className="text-xs text-muted-foreground">
                              {result.educational.citations.map((c, i) => (
                                <li key={i}>• {c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button variant="outline" onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" /> Reset & Try Another
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
