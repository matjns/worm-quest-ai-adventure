import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, AlertTriangle, CheckCircle2, XCircle, Zap, 
  RotateCcw, Trophy, Lightbulb, ArrowRight, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

// owmeta RDF-inspired ground truth data
const OWMETA_NEURONS = {
  AVAL: { type: "command", function: "backward locomotion", connections: ["DA1", "VA1", "AVAR"] },
  AVAR: { type: "command", function: "backward locomotion", connections: ["DA2", "VA2", "AVAL"] },
  AVBL: { type: "command", function: "forward locomotion", connections: ["DB1", "VB1", "AVBR"] },
  AVBR: { type: "command", function: "forward locomotion", connections: ["DB2", "VB2", "AVBL"] },
  ASEL: { type: "sensory", function: "salt chemotaxis", connections: ["AIY", "AIZ"] },
  ASER: { type: "sensory", function: "salt avoidance", connections: ["AIY", "AIZ"] },
  AWC: { type: "sensory", function: "odor detection", connections: ["AIY", "AIB"] },
  ASH: { type: "sensory", function: "nociception", connections: ["AVA", "AVD", "AVE"] },
};

interface MutationScenario {
  id: string;
  neuron: string;
  mutationType: "ablation" | "overexpress" | "silence";
  question: string;
  options: string[];
  correct: number;
  hallucinationTrap?: number; // AI might hallucinate this
  explanation: string;
  supplyChainAnalog: string;
}

const MUTATION_SCENARIOS: MutationScenario[] = [
  {
    id: "m1",
    neuron: "AVAL",
    mutationType: "ablation",
    question: "If AVAL is ablated (removed), what behavior is affected?",
    options: [
      "Worm loses ability to move forward",
      "Worm loses ability to reverse",
      "Worm becomes hyperactive",
      "Worm loses chemosensation"
    ],
    correct: 1,
    hallucinationTrap: 0,
    explanation: "AVAL is a command interneuron for backward locomotion. Without it, the worm cannot coordinate reversal movements.",
    supplyChainAnalog: "Like removing a key logistics hub that handles return shipments - the reverse supply chain collapses."
  },
  {
    id: "m2",
    neuron: "ASH",
    mutationType: "ablation",
    question: "Without ASH neurons, how does the worm respond to painful stimuli?",
    options: [
      "Enhanced pain response",
      "No change in behavior",
      "Reduced avoidance of noxious substances",
      "Increased forward speed"
    ],
    correct: 2,
    hallucinationTrap: 1,
    explanation: "ASH neurons are polymodal nociceptors. Ablating them reduces the worm's ability to detect and avoid harmful chemicals.",
    supplyChainAnalog: "Like disabling quality control sensors - defective products pass through undetected."
  },
  {
    id: "m3",
    neuron: "AVBL",
    mutationType: "overexpress",
    question: "If AVBL is overexpressed (hyperactive), what happens?",
    options: [
      "Worm moves only backward",
      "Worm shows excessive forward movement",
      "No locomotion changes",
      "Worm becomes paralyzed"
    ],
    correct: 1,
    explanation: "AVBL drives forward locomotion. Overexpression biases the circuit toward constant forward movement.",
    supplyChainAnalog: "Like a warehouse receiving signal stuck 'ON' - inventory piles up from constant inbound flow."
  },
  {
    id: "m4",
    neuron: "AWC",
    mutationType: "silence",
    question: "Silencing AWC neurons affects which primary behavior?",
    options: [
      "Touch sensitivity",
      "Temperature sensing",
      "Odor-guided food seeking",
      "Mating behavior"
    ],
    correct: 2,
    hallucinationTrap: 1,
    explanation: "AWC neurons detect volatile odors. Silencing them impairs the worm's ability to find food via smell.",
    supplyChainAnalog: "Like blocking market demand signals - production continues blindly without customer feedback."
  },
  {
    id: "m5",
    neuron: "ASEL",
    mutationType: "ablation",
    question: "ASEL ablation primarily disrupts:",
    options: [
      "Movement toward salt gradients",
      "Escape from predators",
      "Egg-laying behavior",
      "Sleep patterns"
    ],
    correct: 0,
    explanation: "ASEL is specifically tuned for salt-seeking (attractive chemotaxis). Its removal impairs navigation toward salt sources.",
    supplyChainAnalog: "Like removing procurement sensors - you can't detect supplier opportunities."
  },
];

export function MutationMazeGame() {
  const { addXp, addPoints, completeLesson, unlockAchievement } = useGameStore();
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [hallucinationsAvoided, setHallucinationsAvoided] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnalog, setShowAnalog] = useState(false);

  const scenario = MUTATION_SCENARIOS[currentScenario];
  const neuronData = OWMETA_NEURONS[scenario.neuron as keyof typeof OWMETA_NEURONS];

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === scenario.correct;
    const avoidedHallucination = scenario.hallucinationTrap !== undefined && answerIndex !== scenario.hallucinationTrap;
    
    if (isCorrect) {
      setScore(s => s + 1);
      addXp(20);
      addPoints(30);
      
      if (avoidedHallucination) {
        setHallucinationsAvoided(h => h + 1);
        toast.success("🛡️ Hallucination avoided! You didn't fall for the AI trap.");
      }
    }
  };

  const nextScenario = () => {
    if (currentScenario < MUTATION_SCENARIOS.length - 1) {
      setCurrentScenario(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowAnalog(false);
    } else {
      setIsComplete(true);
      if (score >= 4) {
        completeLesson("mutation-maze");
        unlockAchievement("systems-thinker");
        toast.success("🧬 Mutation Maze complete! Dynamical systems mastery achieved!");
      }
    }
  };

  const resetGame = () => {
    setCurrentScenario(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setHallucinationsAvoided(0);
    setIsComplete(false);
    setShowAnalog(false);
  };

  if (isComplete) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Mutation Maze Complete!</h2>
            <p className="text-muted-foreground mb-4">
              Score: {score}/{MUTATION_SCENARIOS.length}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm mx-auto">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground">Correct Predictions</p>
              </div>
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{hallucinationsAvoided}</p>
                <p className="text-sm text-muted-foreground">Hallucinations Avoided</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Key Takeaway: Dynamical Systems
              </h3>
              <p className="text-sm text-muted-foreground">
                Neural circuits are dynamical systems where small perturbations can cascade into 
                large behavioral changes. This same principle applies to supply chains, 
                organizational structures, and any complex interconnected system.
              </p>
            </div>
            
            <Button onClick={resetGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Dna className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <CardTitle>Mutation Maze</CardTitle>
              <CardDescription>Virtual perturbations • owmeta RDF validation • Dynamical systems</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentScenario + 1}/{MUTATION_SCENARIOS.length}
            </Badge>
            <Badge>Score: {score}</Badge>
          </div>
        </div>
        <Progress value={(currentScenario / MUTATION_SCENARIOS.length) * 100} className="h-2 mt-4" />
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Neuron Info Card */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold text-lg">{scenario.neuron}</span>
            <Badge variant="outline">{neuronData?.type}</Badge>
            <Badge 
              variant={
                scenario.mutationType === "ablation" ? "destructive" :
                scenario.mutationType === "overexpress" ? "default" : "secondary"
              }
            >
              {scenario.mutationType}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Function: {neuronData?.function}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Connections: {neuronData?.connections.join(", ")}
          </p>
        </div>
        
        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{scenario.question}</h3>
          
          <div className="space-y-2">
            {scenario.options.map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => !showResult && handleAnswer(i)}
                disabled={showResult}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  showResult
                    ? i === scenario.correct
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : selectedAnswer === i
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : i === scenario.hallucinationTrap
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10 opacity-75"
                      : "border-border opacity-50"
                    : "border-border hover:border-primary cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2">
                  {showResult && i === scenario.correct && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && selectedAnswer === i && i !== scenario.correct && (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  {showResult && i === scenario.hallucinationTrap && i !== scenario.correct && (
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Explanation */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className={`p-4 rounded-lg ${
                selectedAnswer === scenario.correct 
                  ? "bg-green-100 dark:bg-green-900/20 border border-green-500" 
                  : "bg-red-100 dark:bg-red-900/20 border border-red-500"
              }`}>
                <p className="text-sm">
                  <strong>owmeta RDF Validation:</strong> {scenario.explanation}
                </p>
              </div>
              
              {scenario.hallucinationTrap !== undefined && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-500/50">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      <strong>AI Hallucination Trap:</strong> Option "{scenario.options[scenario.hallucinationTrap]}" 
                      is a plausible but incorrect answer that AI models sometimes generate.
                    </p>
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setShowAnalog(!showAnalog)}
                className="w-full"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showAnalog ? "Hide" : "Show"} Supply Chain Analog
              </Button>
              
              <AnimatePresence>
                {showAnalog && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <h4 className="font-semibold mb-2">📦 Supply Chain Analog:</h4>
                    <p className="text-sm text-muted-foreground">{scenario.supplyChainAnalog}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button onClick={nextScenario} className="w-full">
                {currentScenario < MUTATION_SCENARIOS.length - 1 ? (
                  <>Next Mutation <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Complete Maze <Trophy className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
