import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Play, RotateCcw, Trophy, Award, 
  TrendingUp, Settings2, Lightbulb, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

// c302 simplified neural pathway weights
const INITIAL_WEIGHTS = {
  sensoryToInter: 0.5,
  interToCommand: 0.5,
  commandToMotor: 0.5,
  inhibitory: 0.3,
};

const QUESTION_BANK = [
  {
    id: 1,
    question: "What happens to chemotaxis when you increase sensory-to-interneuron weights?",
    options: ["Stronger attraction", "Weaker attraction", "No change", "Random movement"],
    correct: 0,
    explanation: "Higher sensory weights amplify chemical gradient detection, causing stronger attraction to food sources."
  },
  {
    id: 2,
    question: "Predict: What is stochastic resonance in neural circuits?",
    options: [
      "Noise disrupts signals completely",
      "Moderate noise enhances weak signal detection",
      "Signals always need silence",
      "Resonance destroys neurons"
    ],
    correct: 1,
    explanation: "Stochastic resonance is when moderate noise actually helps neurons detect weak signals better - a counterintuitive phenomenon!"
  },
  {
    id: 3,
    question: "If you ablate (remove) command interneurons, what behavior changes?",
    options: [
      "Worm moves faster",
      "Worm can't reverse direction",
      "Worm becomes more sensitive",
      "No behavioral change"
    ],
    correct: 1,
    explanation: "Command interneurons (like AVA/AVB) control forward/backward switching. Without them, the worm loses directional control."
  },
  {
    id: 4,
    question: "What role do inhibitory connections play in the c302 model?",
    options: [
      "They always block all signals",
      "They create rhythmic patterns via mutual inhibition",
      "They only activate during sleep",
      "They have no function"
    ],
    correct: 1,
    explanation: "Inhibitory connections create central pattern generators (CPGs) that produce the rhythmic undulations for locomotion."
  },
];

interface SimulationResult {
  chemotaxisScore: number;
  locomotionEfficiency: number;
  responseTime: number;
  energyUsage: number;
  overallFitness: number;
}

export function NeuralNetBuilderActivity() {
  const { addXp, addPoints, completeLesson, unlockAchievement } = useGameStore();
  const [weights, setWeights] = useState(INITIAL_WEIGHTS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [rlIterations, setRlIterations] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [certEarned, setCertEarned] = useState(false);

  // Q-learning inspired optimization
  const runSimulation = useCallback(() => {
    setIsSimulating(true);
    
    setTimeout(() => {
      // Simplified c302 simulation based on weight configuration
      const chemotaxis = Math.min(1, weights.sensoryToInter * weights.interToCommand * 1.5 + Math.random() * 0.1);
      const locomotion = Math.min(1, weights.commandToMotor * (1 - weights.inhibitory * 0.5) + Math.random() * 0.1);
      const response = 1 - (weights.sensoryToInter + weights.interToCommand) / 4;
      const energy = 1 - (weights.sensoryToInter + weights.interToCommand + weights.commandToMotor) / 3;
      
      const fitness = (chemotaxis * 0.4 + locomotion * 0.3 + (1 - response) * 0.2 + energy * 0.1);
      
      const result: SimulationResult = {
        chemotaxisScore: chemotaxis,
        locomotionEfficiency: locomotion,
        responseTime: response,
        energyUsage: 1 - energy,
        overallFitness: fitness,
      };
      
      setSimResult(result);
      setIsSimulating(false);
      
      if (fitness > bestFitness) {
        setBestFitness(fitness);
        addXp(10);
        addPoints(20);
        toast.success(`New best fitness: ${(fitness * 100).toFixed(1)}%!`);
      }
    }, 1500);
  }, [weights, bestFitness, addXp, addPoints]);

  // RL optimization step
  const runRLOptimization = useCallback(() => {
    setIsSimulating(true);
    
    const optimize = (iteration: number) => {
      if (iteration >= 10) {
        setIsSimulating(false);
        toast.success("Q-learning optimization complete!");
        return;
      }
      
      setTimeout(() => {
        // Q-learning inspired weight adjustment
        const learningRate = 0.1 * (1 - iteration / 10);
        const newWeights = {
          sensoryToInter: Math.max(0.1, Math.min(1, weights.sensoryToInter + (Math.random() - 0.5) * learningRate)),
          interToCommand: Math.max(0.1, Math.min(1, weights.interToCommand + (Math.random() - 0.5) * learningRate)),
          commandToMotor: Math.max(0.1, Math.min(1, weights.commandToMotor + (Math.random() - 0.5) * learningRate)),
          inhibitory: Math.max(0.1, Math.min(0.8, weights.inhibitory + (Math.random() - 0.5) * learningRate * 0.5)),
        };
        
        setWeights(newWeights);
        setRlIterations(iteration + 1);
        optimize(iteration + 1);
      }, 300);
    };
    
    optimize(0);
  }, [weights]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === QUESTION_BANK[currentQuestion].correct) {
      setQuizScore(s => s + 1);
      addXp(15);
      addPoints(25);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < QUESTION_BANK.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      if (quizScore >= 3) {
        setCertEarned(true);
        completeLesson("neural-net-builder");
        unlockAchievement("junior-connectomist");
        toast.success("🎓 You earned the Junior Connectomist certificate!");
      }
      setShowQuiz(false);
    }
  };

  const resetWeights = () => {
    setWeights(INITIAL_WEIGHTS);
    setSimResult(null);
    setRlIterations(0);
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Neural Net Builder</CardTitle>
              <CardDescription>Port c302 model • Tweak weights • Run RL optimization</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Best: {(bestFitness * 100).toFixed(1)}%</Badge>
            {certEarned && (
              <Badge className="bg-amber-500 text-white">
                <Award className="w-3 h-3 mr-1" />
                Junior Connectomist
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {!showQuiz ? (
          <>
            {/* Weight Sliders */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Synaptic Weights
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sensory → Interneuron</span>
                      <span className="font-mono">{weights.sensoryToInter.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[weights.sensoryToInter]}
                      onValueChange={([v]) => setWeights(w => ({ ...w, sensoryToInter: v }))}
                      max={1}
                      min={0.1}
                      step={0.05}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Interneuron → Command</span>
                      <span className="font-mono">{weights.interToCommand.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[weights.interToCommand]}
                      onValueChange={([v]) => setWeights(w => ({ ...w, interToCommand: v }))}
                      max={1}
                      min={0.1}
                      step={0.05}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Command → Motor</span>
                      <span className="font-mono">{weights.commandToMotor.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[weights.commandToMotor]}
                      onValueChange={([v]) => setWeights(w => ({ ...w, commandToMotor: v }))}
                      max={1}
                      min={0.1}
                      step={0.05}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-red-500">Inhibitory Strength</span>
                      <span className="font-mono text-red-500">{weights.inhibitory.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[weights.inhibitory]}
                      onValueChange={([v]) => setWeights(w => ({ ...w, inhibitory: v }))}
                      max={0.8}
                      min={0.1}
                      step={0.05}
                      className="[&_[role=slider]]:bg-red-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={runSimulation} disabled={isSimulating} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </Button>
                  <Button variant="outline" onClick={resetWeights}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button 
                  variant="secondary" 
                  onClick={runRLOptimization} 
                  disabled={isSimulating}
                  className="w-full"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Q-Learning Optimize ({rlIterations}/10 iterations)
                </Button>
              </div>
              
              {/* Results */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Simulation Results
                </h3>
                
                <AnimatePresence mode="wait">
                  {isSimulating ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-48"
                    >
                      <div className="text-center">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-primary animate-pulse" />
                        <p className="text-muted-foreground">Simulating neural dynamics...</p>
                      </div>
                    </motion.div>
                  ) : simResult ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Chemotaxis Score</span>
                          <span>{(simResult.chemotaxisScore * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={simResult.chemotaxisScore * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Locomotion Efficiency</span>
                          <span>{(simResult.locomotionEfficiency * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={simResult.locomotionEfficiency * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Response Time</span>
                          <span>{(simResult.responseTime * 1000).toFixed(0)}ms</span>
                        </div>
                        <Progress value={(1 - simResult.responseTime) * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Energy Usage</span>
                          <span>{(simResult.energyUsage * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={simResult.energyUsage * 100} className="h-2" />
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Overall Fitness</span>
                          <Badge 
                            variant={simResult.overallFitness > 0.7 ? "default" : "secondary"}
                            className="text-lg px-3 py-1"
                          >
                            {(simResult.overallFitness * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground text-center">
                        Adjust weights and run simulation<br />to see results
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Take Quiz Button */}
            <div className="pt-4 border-t">
              <Button onClick={() => setShowQuiz(true)} className="w-full" variant="outline">
                <Lightbulb className="w-4 h-4 mr-2" />
                Take Knowledge Quiz (Earn Junior Connectomist Certificate)
              </Button>
            </div>
          </>
        ) : (
          /* Quiz Section */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge>Question {currentQuestion + 1}/{QUESTION_BANK.length}</Badge>
              <Badge variant="secondary">Score: {quizScore}/{QUESTION_BANK.length}</Badge>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {QUESTION_BANK[currentQuestion].question}
              </h3>
              
              <div className="space-y-2">
                {QUESTION_BANK[currentQuestion].options.map((option, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => !showExplanation && handleAnswerSelect(i)}
                    disabled={showExplanation}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      showExplanation
                        ? i === QUESTION_BANK[currentQuestion].correct
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : selectedAnswer === i
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-border"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {showExplanation && i === QUESTION_BANK[currentQuestion].correct && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                      {showExplanation && selectedAnswer === i && i !== QUESTION_BANK[currentQuestion].correct && (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      {option}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
            
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-primary/5 rounded-lg border border-primary/20"
              >
                <p className="text-sm">
                  <strong>Explanation:</strong> {QUESTION_BANK[currentQuestion].explanation}
                </p>
              </motion.div>
            )}
            
            {showExplanation && (
              <Button onClick={nextQuestion} className="w-full">
                {currentQuestion < QUESTION_BANK.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
