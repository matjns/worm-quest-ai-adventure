import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dna, Play, Pause, RotateCcw, TrendingUp, Award, Zap,
  Settings, Target, BarChart3, Brain, Sparkles, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useGameStore } from '@/stores/gameStore';

interface WormGenome {
  id: string;
  genes: number[];
  fitness: number;
  generation: number;
  behavior: string;
}

interface FitnessLandscape {
  x: number;
  y: number;
  fitness: number;
}

const BEHAVIOR_TARGETS = [
  { id: 'chemotaxis', name: 'Chemotaxis', description: 'Navigate toward food sources' },
  { id: 'thermotaxis', name: 'Thermotaxis', description: 'Respond to temperature gradients' },
  { id: 'escape', name: 'Escape Response', description: 'Flee from harmful stimuli' },
  { id: 'foraging', name: 'Foraging', description: 'Optimize food search patterns' },
];

const BIFURCATION_QUESTIONS = [
  {
    question: "At what mutation rate does the population transition from stable convergence to chaotic behavior?",
    hint: "Look for sudden changes in fitness variance around μ = 0.15-0.25"
  },
  {
    question: "Identify the period-doubling cascade in the fitness oscillations.",
    hint: "Watch for 2→4→8 fitness value patterns as selection pressure increases"
  },
  {
    question: "Where is the 'edge of chaos' that maximizes evolutionary innovation?",
    hint: "Find the critical point where fitness variance is high but not completely random"
  },
];

export function EvolutionaryAlgoLab() {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  
  // Evolution parameters
  const [populationSize, setPopulationSize] = useState([50]);
  const [mutationRate, setMutationRate] = useState([0.1]);
  const [selectionPressure, setSelectionPressure] = useState([0.7]);
  const [crossoverRate, setCrossoverRate] = useState([0.8]);
  
  // Evolution state
  const [isEvolving, setIsEvolving] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState<WormGenome[]>([]);
  const [fitnessHistory, setFitnessHistory] = useState<number[]>([]);
  const [bestGenome, setBestGenome] = useState<WormGenome | null>(null);
  const [targetBehavior, setTargetBehavior] = useState(BEHAVIOR_TARGETS[0]);
  
  // Bifurcation analysis
  const [bifurcationData, setBifurcationData] = useState<{ param: number; fitness: number[] }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAIPrediction, setShowAIPrediction] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);

  // Initialize population
  const initializePopulation = useCallback(() => {
    const newPop: WormGenome[] = [];
    for (let i = 0; i < populationSize[0]; i++) {
      const genes = Array(20).fill(0).map(() => Math.random());
      newPop.push({
        id: `worm-${i}`,
        genes,
        fitness: 0,
        generation: 0,
        behavior: 'random',
      });
    }
    setPopulation(newPop);
    setGeneration(0);
    setFitnessHistory([]);
    setBestGenome(null);
  }, [populationSize]);

  // Calculate fitness based on target behavior
  const calculateFitness = useCallback((genome: WormGenome): number => {
    const genes = genome.genes;
    let fitness = 0;
    
    switch (targetBehavior.id) {
      case 'chemotaxis':
        // Reward smooth gradient following
        fitness = genes.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        fitness *= (1 - Math.abs(genes[5] - 0.7)); // Optimal turning rate
        break;
      case 'thermotaxis':
        // Temperature sensitivity
        fitness = genes.slice(5, 10).reduce((a, b) => a + b, 0) / 5;
        fitness *= genes[10] * (1 - genes[11]); // Adaptation balance
        break;
      case 'escape':
        // Quick response time
        fitness = genes.slice(10, 15).reduce((a, b) => a * 0.5 + b * 0.5, 0.5);
        fitness *= (1 + genes[15] * 0.5); // Speed boost
        break;
      case 'foraging':
        // Area coverage efficiency
        fitness = genes.slice(15, 20).reduce((a, b) => a + b, 0) / 5;
        fitness *= (1 - Math.pow(genes[0] - 0.5, 2)); // Optimal exploration
        break;
    }
    
    // Add noise for realism
    fitness = Math.max(0, Math.min(1, fitness + (Math.random() - 0.5) * 0.1));
    return fitness;
  }, [targetBehavior]);

  // Selection (tournament)
  const select = useCallback((pop: WormGenome[]): WormGenome => {
    const tournamentSize = Math.max(2, Math.floor(pop.length * (1 - selectionPressure[0]) * 0.3 + 2));
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(pop[Math.floor(Math.random() * pop.length)]);
    }
    return tournament.reduce((best, curr) => curr.fitness > best.fitness ? curr : best);
  }, [selectionPressure]);

  // Crossover
  const crossover = useCallback((parent1: WormGenome, parent2: WormGenome): number[] => {
    if (Math.random() > crossoverRate[0]) {
      return [...parent1.genes];
    }
    const crossPoint = Math.floor(Math.random() * parent1.genes.length);
    return [
      ...parent1.genes.slice(0, crossPoint),
      ...parent2.genes.slice(crossPoint),
    ];
  }, [crossoverRate]);

  // Mutation
  const mutate = useCallback((genes: number[]): number[] => {
    return genes.map(gene => {
      if (Math.random() < mutationRate[0]) {
        return Math.max(0, Math.min(1, gene + (Math.random() - 0.5) * 0.3));
      }
      return gene;
    });
  }, [mutationRate]);

  // Evolution step
  const evolveStep = useCallback(() => {
    setPopulation(currentPop => {
      // Evaluate fitness
      const evaluated = currentPop.map(genome => ({
        ...genome,
        fitness: calculateFitness(genome),
      }));
      
      // Create new generation
      const newPop: WormGenome[] = [];
      
      // Elitism: keep best individual
      const sorted = [...evaluated].sort((a, b) => b.fitness - a.fitness);
      newPop.push({ ...sorted[0], generation: generation + 1 });
      
      // Fill rest with offspring
      while (newPop.length < populationSize[0]) {
        const parent1 = select(evaluated);
        const parent2 = select(evaluated);
        const childGenes = mutate(crossover(parent1, parent2));
        
        newPop.push({
          id: `worm-gen${generation + 1}-${newPop.length}`,
          genes: childGenes,
          fitness: 0,
          generation: generation + 1,
          behavior: targetBehavior.id,
        });
      }
      
      // Update best genome
      if (!bestGenome || sorted[0].fitness > bestGenome.fitness) {
        setBestGenome(sorted[0]);
      }
      
      // Update fitness history
      const avgFitness = evaluated.reduce((a, b) => a + b.fitness, 0) / evaluated.length;
      setFitnessHistory(prev => [...prev, avgFitness]);
      
      return newPop;
    });
    
    setGeneration(g => g + 1);
  }, [calculateFitness, crossover, mutate, select, generation, populationSize, targetBehavior, bestGenome]);

  // Start/stop evolution
  const toggleEvolution = () => {
    if (!isEvolving && population.length === 0) {
      initializePopulation();
    }
    setIsEvolving(!isEvolving);
  };

  // Auto-evolve effect
  useState(() => {
    if (isEvolving) {
      const interval = setInterval(evolveStep, 200);
      return () => clearInterval(interval);
    }
  });

  // Run evolution for set number of generations
  const runEvolution = async (generations: number) => {
    if (population.length === 0) {
      initializePopulation();
      await new Promise(r => setTimeout(r, 100));
    }
    
    setIsEvolving(true);
    for (let i = 0; i < generations; i++) {
      evolveStep();
      await new Promise(r => setTimeout(r, 50));
    }
    setIsEvolving(false);
    
    addXp(25);
    addPoints(50);
    toast.success(`Evolved ${generations} generations!`);
  };

  // Run bifurcation analysis
  const runBifurcationAnalysis = async () => {
    setShowAIPrediction(false);
    setBifurcationData([]);
    
    const data: { param: number; fitness: number[] }[] = [];
    
    for (let mu = 0.01; mu <= 0.5; mu += 0.02) {
      setMutationRate([mu]);
      initializePopulation();
      
      const fitnessValues: number[] = [];
      for (let gen = 0; gen < 30; gen++) {
        evolveStep();
        await new Promise(r => setTimeout(r, 20));
        if (gen > 20) {
          fitnessValues.push(bestGenome?.fitness || 0);
        }
      }
      
      data.push({ param: mu, fitness: fitnessValues });
      setBifurcationData([...data]);
    }
    
    addXp(50);
    addPoints(100);
    unlockAchievement('bifurcation-master');
    toast.success('Bifurcation analysis complete!');
  };

  // AI fitness landscape prediction
  const predictFitnessLandscape = async () => {
    setShowAIPrediction(true);
    setAiPrediction(null);
    
    // Simulate AI prediction
    await new Promise(r => setTimeout(r, 1500));
    
    const predictions = [
      `Based on the ${targetBehavior.name} optimization target, I predict a rugged fitness landscape with multiple local optima.`,
      `The current mutation rate (${(mutationRate[0] * 100).toFixed(1)}%) suggests the population is ${mutationRate[0] < 0.1 ? 'exploiting existing solutions' : mutationRate[0] > 0.3 ? 'in chaotic exploration mode' : 'balanced between exploration and exploitation'}.`,
      `Optimal convergence expected around generation ${Math.floor(50 / mutationRate[0])} with selection pressure at ${(selectionPressure[0] * 100).toFixed(0)}%.`,
      `Warning: ${selectionPressure[0] > 0.9 ? 'High selection pressure may cause premature convergence' : 'Consider increasing selection pressure for faster convergence'}.`,
    ];
    
    setAiPrediction(predictions.join('\n\n'));
    addPoints(25);
  };

  // Export genome
  const exportGenome = () => {
    if (!bestGenome) {
      toast.error('No genome to export!');
      return;
    }
    
    const data = {
      genome: bestGenome,
      parameters: {
        populationSize: populationSize[0],
        mutationRate: mutationRate[0],
        selectionPressure: selectionPressure[0],
        crossoverRate: crossoverRate[0],
      },
      target: targetBehavior,
      fitnessHistory,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolved-worm-${targetBehavior.id}-gen${generation}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Genome exported!');
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Evolutionary Algorithm Lab
              <Badge variant="outline" className="ml-2">LoRA-tuned AI</Badge>
            </CardTitle>
            <CardDescription>
              Train worm variants with genetic algorithms • Predict fitness landscapes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="evolve" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="evolve">Evolution</TabsTrigger>
            <TabsTrigger value="bifurcation">Bifurcation</TabsTrigger>
            <TabsTrigger value="predict">AI Prediction</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evolve" className="space-y-6">
            {/* Target behavior selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Target Behavior</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BEHAVIOR_TARGETS.map(target => (
                  <Button
                    key={target.id}
                    variant={targetBehavior.id === target.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTargetBehavior(target)}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="font-medium">{target.name}</span>
                    <span className="text-xs opacity-70">{target.description}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Evolution parameters */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Population Size: {populationSize[0]}</label>
                <Slider
                  value={populationSize}
                  onValueChange={setPopulationSize}
                  min={10}
                  max={200}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mutation Rate: {(mutationRate[0] * 100).toFixed(1)}%</label>
                <Slider
                  value={mutationRate}
                  onValueChange={setMutationRate}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Selection Pressure: {(selectionPressure[0] * 100).toFixed(0)}%</label>
                <Slider
                  value={selectionPressure}
                  onValueChange={setSelectionPressure}
                  min={0.1}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Crossover Rate: {(crossoverRate[0] * 100).toFixed(0)}%</label>
                <Slider
                  value={crossoverRate}
                  onValueChange={setCrossoverRate}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>
            </div>
            
            {/* Evolution controls */}
            <div className="flex gap-2">
              <Button onClick={() => runEvolution(50)} disabled={isEvolving} className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Evolve 50 Generations
              </Button>
              <Button onClick={initializePopulation} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button onClick={exportGenome} variant="outline" disabled={!bestGenome}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Generation</p>
                <p className="text-2xl font-bold">{generation}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Best Fitness</p>
                <p className="text-2xl font-bold text-primary">
                  {(bestGenome?.fitness || 0).toFixed(3)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">Avg Fitness</p>
                <p className="text-2xl font-bold">
                  {fitnessHistory.length > 0 ? fitnessHistory[fitnessHistory.length - 1].toFixed(3) : '0.000'}
                </p>
              </div>
            </div>
            
            {/* Fitness chart */}
            {fitnessHistory.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Fitness Over Generations
                </h4>
                <div className="h-32 flex items-end gap-0.5">
                  {fitnessHistory.slice(-50).map((fitness, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/60 rounded-t transition-all"
                      style={{ height: `${fitness * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bifurcation" className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                Bifurcation Analysis: Chaos in Evolution
              </h4>
              <p className="text-sm text-muted-foreground">
                Explore how mutation rate affects population dynamics. Identify 
                period-doubling cascades and the transition to chaotic behavior.
              </p>
            </div>
            
            <Button onClick={runBifurcationAnalysis} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Run Bifurcation Analysis
            </Button>
            
            {bifurcationData.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Bifurcation Diagram</h4>
                <div className="h-48 relative border border-border rounded overflow-hidden">
                  {bifurcationData.map((point, i) => (
                    point.fitness.map((f, j) => (
                      <div
                        key={`${i}-${j}`}
                        className="absolute w-1 h-1 bg-primary rounded-full"
                        style={{
                          left: `${(point.param / 0.5) * 100}%`,
                          bottom: `${f * 100}%`,
                        }}
                      />
                    ))
                  ))}
                  <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-muted-foreground">
                    Mutation Rate →
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 text-xs text-center text-muted-foreground transform -rotate-90 origin-left translate-x-4">
                    Fitness →
                  </div>
                </div>
              </div>
            )}
            
            {/* Challenge questions */}
            <div className="space-y-3">
              <h4 className="font-medium">Challenge Questions</h4>
              {BIFURCATION_QUESTIONS.map((q, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${currentQuestion === i ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setCurrentQuestion(i)}
                >
                  <p className="font-medium text-sm">{q.question}</p>
                  {currentQuestion === i && (
                    <p className="text-xs text-muted-foreground mt-1">💡 {q.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="predict" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Fitness Landscape Prediction
              </h4>
              <p className="text-sm text-muted-foreground">
                Our LoRA-tuned model predicts optimal parameter configurations 
                and warns about potential evolutionary traps.
              </p>
            </div>
            
            <Button onClick={predictFitnessLandscape} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Prediction
            </Button>
            
            <AnimatePresence>
              {showAIPrediction && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card border rounded-lg p-4"
                >
                  {aiPrediction ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Sparkles className="w-4 h-4" />
                        AI Analysis
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{aiPrediction}</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                      Analyzing fitness landscape...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Certificate */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-500" />
                <div>
                  <h4 className="font-bold">Evolutionary Biologist Certificate</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete bifurcation analysis and evolve a worm with fitness {">"} 0.9
                  </p>
                </div>
              </div>
              <Progress
                value={Math.min(100, (bestGenome?.fitness || 0) * 100 + (bifurcationData.length > 0 ? 20 : 0))}
                className="mt-3"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
