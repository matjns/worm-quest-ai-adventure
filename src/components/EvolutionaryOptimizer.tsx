import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dna, Play, Pause, RotateCcw, TrendingUp, Trophy,
  Zap, Target, BarChart3, Sparkles, Brain
} from "lucide-react";
import { toast } from "sonner";

interface Individual {
  id: string;
  genome: number[]; // Synaptic weights
  fitness: number;
  generation: number;
}

interface EvolutionStats {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  diversity: number;
}

interface EvolutionaryOptimizerProps {
  targetBehavior: string;
  onBestIndividual: (weights: number[]) => void;
  className?: string;
}

const TARGET_BEHAVIORS = [
  { id: "chemotaxis", name: "Chemotaxis", description: "Navigate toward food sources" },
  { id: "avoidance", name: "Avoidance", description: "Escape from noxious stimuli" },
  { id: "foraging", name: "Foraging", description: "Efficient exploration pattern" },
  { id: "omega_turn", name: "Omega Turn", description: "Sharp directional reversal" },
];

const GENOME_SIZE = 12; // Number of synaptic weights to optimize

export function EvolutionaryOptimizer({ 
  targetBehavior, 
  onBestIndividual,
  className 
}: EvolutionaryOptimizerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [population, setPopulation] = useState<Individual[]>([]);
  const [stats, setStats] = useState<EvolutionStats[]>([]);
  const [currentGen, setCurrentGen] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(targetBehavior || "chemotaxis");
  
  // GA Parameters
  const [popSize, setPopSize] = useState(20);
  const [mutationRate, setMutationRate] = useState(0.1);
  const [crossoverRate, setCrossoverRate] = useState(0.7);
  const [elitism, setElitism] = useState(2);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize random population
  const initializePopulation = useCallback(() => {
    const newPop: Individual[] = [];
    for (let i = 0; i < popSize; i++) {
      const genome = Array(GENOME_SIZE).fill(0).map(() => Math.random());
      newPop.push({
        id: `gen0-${i}`,
        genome,
        fitness: evaluateFitness(genome, selectedTarget),
        generation: 0,
      });
    }
    setPopulation(newPop.sort((a, b) => b.fitness - a.fitness));
    setCurrentGen(0);
    setStats([{
      generation: 0,
      bestFitness: Math.max(...newPop.map(i => i.fitness)),
      avgFitness: newPop.reduce((s, i) => s + i.fitness, 0) / popSize,
      diversity: calculateDiversity(newPop),
    }]);
  }, [popSize, selectedTarget]);

  // Fitness function (simulated)
  const evaluateFitness = (genome: number[], target: string): number => {
    // Simulate fitness based on target behavior
    let baseFitness = 0;
    
    switch (target) {
      case "chemotaxis":
        // Favor strong sensory-to-interneuron connections
        baseFitness = genome.slice(0, 4).reduce((s, w) => s + w, 0) / 4;
        break;
      case "avoidance":
        // Favor quick motor responses
        baseFitness = genome.slice(6, 10).reduce((s, w) => s + w, 0) / 4;
        break;
      case "foraging":
        // Balanced exploration
        baseFitness = 1 - Math.abs(genome.reduce((s, w) => s + w, 0) / GENOME_SIZE - 0.5) * 2;
        break;
      case "omega_turn":
        // Asymmetric motor activation
        const leftSum = genome.slice(0, 6).reduce((s, w) => s + w, 0);
        const rightSum = genome.slice(6, 12).reduce((s, w) => s + w, 0);
        baseFitness = Math.abs(leftSum - rightSum) / 6;
        break;
    }
    
    // Add noise
    return Math.min(1, Math.max(0, baseFitness + (Math.random() - 0.5) * 0.1));
  };

  // Genetic operators
  const selection = (pop: Individual[]): Individual[] => {
    // Tournament selection
    const selected: Individual[] = [];
    for (let i = 0; i < pop.length - elitism; i++) {
      const tournamentSize = 3;
      const tournament = Array(tournamentSize).fill(0).map(() => 
        pop[Math.floor(Math.random() * pop.length)]
      );
      selected.push(tournament.sort((a, b) => b.fitness - a.fitness)[0]);
    }
    return selected;
  };

  const crossover = (parent1: number[], parent2: number[]): number[] => {
    if (Math.random() > crossoverRate) return [...parent1];
    const point = Math.floor(Math.random() * parent1.length);
    return [...parent1.slice(0, point), ...parent2.slice(point)];
  };

  const mutate = (genome: number[]): number[] => {
    return genome.map(gene => 
      Math.random() < mutationRate 
        ? Math.min(1, Math.max(0, gene + (Math.random() - 0.5) * 0.3))
        : gene
    );
  };

  const calculateDiversity = (pop: Individual[]): number => {
    if (pop.length < 2) return 0;
    let totalDiff = 0;
    for (let i = 0; i < pop.length; i++) {
      for (let j = i + 1; j < pop.length; j++) {
        const diff = pop[i].genome.reduce((s, g, k) => 
          s + Math.abs(g - pop[j].genome[k]), 0) / GENOME_SIZE;
        totalDiff += diff;
      }
    }
    return totalDiff / ((pop.length * (pop.length - 1)) / 2);
  };

  // Evolution step
  const evolveGeneration = useCallback(() => {
    setPopulation(prevPop => {
      if (prevPop.length === 0) return prevPop;

      const newGen = currentGen + 1;
      
      // Elite individuals
      const elite = prevPop.slice(0, elitism);
      
      // Selection
      const selected = selection(prevPop);
      
      // Create new population
      const offspring: Individual[] = [];
      while (offspring.length < popSize - elitism) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        const childGenome = mutate(crossover(parent1.genome, parent2.genome));
        offspring.push({
          id: `gen${newGen}-${offspring.length}`,
          genome: childGenome,
          fitness: evaluateFitness(childGenome, selectedTarget),
          generation: newGen,
        });
      }

      const newPop = [...elite.map(e => ({ ...e, generation: newGen })), ...offspring]
        .sort((a, b) => b.fitness - a.fitness);

      // Update stats
      const newStats: EvolutionStats = {
        generation: newGen,
        bestFitness: newPop[0].fitness,
        avgFitness: newPop.reduce((s, i) => s + i.fitness, 0) / popSize,
        diversity: calculateDiversity(newPop),
      };

      setStats(prev => [...prev.slice(-49), newStats]);
      setCurrentGen(newGen);

      // Notify parent of best individual
      onBestIndividual(newPop[0].genome);

      return newPop;
    });
  }, [currentGen, elitism, popSize, selectedTarget, onBestIndividual]);

  // Control evolution loop
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(evolveGeneration, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, evolveGeneration]);

  const toggleEvolution = () => {
    if (!isRunning && population.length === 0) {
      initializePopulation();
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPopulation([]);
    setStats([]);
    setCurrentGen(0);
    toast.info("Evolution reset");
  };

  const bestIndividual = population[0];
  const latestStats = stats[stats.length - 1];

  return (
    <Card className={`border-purple-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-500" />
            Evolutionary Optimizer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Button 
              size="sm" 
              onClick={toggleEvolution}
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? (
                <><Pause className="h-3 w-3 mr-1" />Pause</>
              ) : (
                <><Play className="h-3 w-3 mr-1" />Evolve</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Target Behavior
          </label>
          <Select value={selectedTarget} onValueChange={setSelectedTarget} disabled={isRunning}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_BEHAVIORS.map(b => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex flex-col">
                    <span>{b.name}</span>
                    <span className="text-xs text-muted-foreground">{b.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* GA Parameters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Population: {popSize}</label>
            <Slider
              value={[popSize]}
              min={10}
              max={50}
              step={5}
              onValueChange={([v]) => setPopSize(v)}
              disabled={isRunning}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Mutation: {(mutationRate * 100).toFixed(0)}%</label>
            <Slider
              value={[mutationRate]}
              min={0.01}
              max={0.3}
              step={0.01}
              onValueChange={([v]) => setMutationRate(v)}
              disabled={isRunning}
            />
          </div>
        </div>

        {/* Evolution Stats */}
        {latestStats && (
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-muted text-center">
              <div className="text-lg font-bold">{latestStats.generation}</div>
              <div className="text-xs text-muted-foreground">Generation</div>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10 text-center">
              <div className="text-lg font-bold text-green-500">
                {(latestStats.bestFitness * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Best Fit</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-center">
              <div className="text-lg font-bold text-blue-500">
                {(latestStats.avgFitness * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Fit</div>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 text-center">
              <div className="text-lg font-bold text-purple-500">
                {(latestStats.diversity * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Diversity</div>
            </div>
          </div>
        )}

        {/* Fitness Chart (simplified) */}
        {stats.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Fitness Progress
            </div>
            <div className="h-16 flex items-end gap-px">
              {stats.slice(-30).map((s, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-primary rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${s.bestFitness * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Best Individual */}
        {bestIndividual && (
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Best Individual</span>
              <Badge variant="outline" className="ml-auto">
                Gen {bestIndividual.generation}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {bestIndividual.genome.slice(0, 6).map((g, i) => (
                <div
                  key={i}
                  className="w-8 h-6 rounded text-xs flex items-center justify-center font-mono"
                  style={{
                    backgroundColor: `hsl(${120 * g}, 70%, 40%)`,
                    color: "white",
                  }}
                >
                  {g.toFixed(1)}
                </div>
              ))}
              <span className="text-muted-foreground">...</span>
            </div>
          </div>
        )}

        {/* Population Preview */}
        {population.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Population Fitness Distribution</div>
            <div className="flex gap-px h-4">
              {population.map((ind, i) => (
                <div
                  key={ind.id}
                  className="flex-1 rounded-sm"
                  style={{
                    backgroundColor: `hsl(${ind.fitness * 120}, 70%, ${40 + i * 2}%)`,
                  }}
                  title={`Individual ${i + 1}: ${(ind.fitness * 100).toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
