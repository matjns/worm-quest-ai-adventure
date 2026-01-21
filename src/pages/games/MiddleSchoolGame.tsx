import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, FlaskConical, Brain, Zap, BarChart3, Lightbulb, RefreshCw, Download, Save, Dna, Users, Cpu, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { NeuronSimulator } from "@/components/NeuronSimulator";
import { QuizCard } from "@/components/QuizCard";
import { useAIChallenge } from "@/hooks/useAIChallenge";
import { Worm3D } from "@/components/Worm3D";
import AccessibleWorm3D from "@/components/AccessibleWorm3D";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveMiddleSchoolState, loadMiddleSchoolState, downloadExport, type ExperimentState } from "@/utils/simulationPersistence";
import { Analytics } from "@/utils/analytics";
import { withRetry, getResilienceMessage } from "@/utils/apiResilience";
import { NeuralNetBuilderActivity } from "@/components/NeuralNetBuilderActivity";
import { MutationMazeGame } from "@/components/MutationMazeGame";
import { GroupDebateApp } from "@/components/GroupDebateApp";
import { DashboardCertSystem } from "@/components/DashboardCertSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Hypothesis {
  id: string;
  text: string;
  tested: boolean;
  result?: "confirmed" | "rejected";
}

export default function MiddleSchoolGame() {
  const { addXp, addPoints, completeLesson } = useGameStore();
  const { generateQuiz, getHint, validateSimulation, isLoading } = useAIChallenge();
  const [currentView, setCurrentView] = useState<"simulate" | "experiment" | "analyze" | "3d">("simulate");
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([
    { id: "h1", text: "Increasing synaptic weight speeds up signal propagation", tested: false },
    { id: "h2", text: "Motor neurons require input from interneurons", tested: false },
    { id: "h3", text: "Sensory neurons respond to stimulus strength", tested: false },
  ]);
  const [experimentData, setExperimentData] = useState<{ weight: number; speed: number }[]>([]);
  const [score, setScore] = useState(0);
  const [activeNeurons, setActiveNeurons] = useState<boolean[]>([]);
  const [signalStrength, setSignalStrength] = useState(0);
  const [currentWeight, setCurrentWeight] = useState([50]);
  const [quizData, setQuizData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const savedState = loadMiddleSchoolState();
    if (savedState) {
      if (savedState.trials && savedState.trials.length > 0) {
        setExperimentData(savedState.trials.map(t => ({ weight: t.weight, speed: t.speed })));
      }
      toast.success("Previous session restored!");
    }
    Analytics.gameStart("middle_school", "middle");
  }, []);

  // Auto-save state on changes
  useEffect(() => {
    if (experimentData.length > 0) {
      const state: ExperimentState = {
        hypothesis: hypotheses.map(h => h.text),
        trials: experimentData.map(d => ({ ...d, timestamp: Date.now() })),
      };
      saveMiddleSchoolState(state);
    }
  }, [experimentData, hypotheses]);

  const runExperiment = () => {
    const weight = currentWeight[0] / 100;
    const speed = weight * 0.8 + Math.random() * 0.2;
    
    setExperimentData((prev) => [...prev, { weight: currentWeight[0], speed: speed * 100 }]);
    
    // Track analytics
    Analytics.experimentRun(`synaptic_weight_${currentWeight[0]}`);
    
    // Animate 3D worm
    setActiveNeurons([true, false, false, false, false, false, false, false, false, false]);
    let pos = 0;
    const interval = setInterval(() => {
      pos += 0.05 * (1 + weight);
      setSignalStrength(pos);
      setActiveNeurons((prev) => {
        const next = [...prev];
        const activeIndex = Math.floor(pos * 10);
        if (activeIndex < 10) next[activeIndex] = true;
        return next;
      });
      if (pos >= 1) {
        clearInterval(interval);
        addPoints(15);
        addXp(10);
        setScore((s) => s + 15);
      }
    }, 100);
  };

  const testHypothesis = async (id: string) => {
    const hypothesis = hypotheses.find((h) => h.id === id);
    if (!hypothesis) return;

    try {
      // Use retry wrapper with resilience messages
      const result = await withRetry(
        () => validateSimulation("middle", JSON.stringify({
          hypothesis: hypothesis.text,
          experimentData,
        })),
        3,
        (attempt, message) => {
          toast.info(message);
        }
      );

      const confirmed = result.isValid !== false;
      
      setHypotheses((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, tested: true, result: confirmed ? "confirmed" : "rejected" } : h
        )
      );

      addPoints(confirmed ? 30 : 10);
      addXp(20);
      setScore((s) => s + (confirmed ? 30 : 10));
      
      toast.success(
        confirmed
          ? "Hypothesis confirmed! Great scientific thinking! 🎉"
          : "Hypothesis needs revision. Science is about learning from results!"
      );
    } catch (e) {
      // Fallback with c302 cached data
      toast.info(getResilienceMessage());
      
      // Use local validation
      const confirmed = experimentData.length >= 3 && 
        experimentData.some(d => d.weight > 70 && d.speed > 70);
      
      setHypotheses((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, tested: true, result: confirmed ? "confirmed" : "rejected" } : h
        )
      );
      addPoints(10);
      addXp(10);
    }
  };

  // Export data for OpenWorm contributions
  const handleExport = () => {
    const exportData = {
      type: 'experiment',
      hypothesis: hypotheses.map(h => h.text),
      trials: experimentData.map(d => ({ ...d, timestamp: Date.now() })),
    };
    downloadExport(exportData, `middle-school-experiment-${Date.now()}.json`);
    Analytics.exportData('json');
    toast.success("Experiment data exported for OpenWorm!");
  };

  const loadQuiz = async () => {
    try {
      const quiz = await generateQuiz("middle", "synaptic transmission and neural networks");
      setQuizData(quiz);
    } catch (e) {
      toast.error("Couldn't load quiz. Try again!");
    }
  };

  const handleQuizComplete = (correct: boolean) => {
    if (correct) {
      addPoints(25);
      addXp(20);
      setScore((s) => s + 25);
    } else {
      addXp(5);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back button */}
          <Link to="/play">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FlaskConical className="w-4 h-4" />
              Middle School Lab
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Neural Science Lab 🔬
            </h1>
            <p className="text-muted-foreground">
              Form hypotheses, run experiments, and discover how neurons really work!
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experiments</p>
                <p className="text-xl font-bold">{experimentData.length}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hypotheses Tested</p>
                <p className="text-xl font-bold">{hypotheses.filter((h) => h.tested).length}/3</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data Points</p>
                <p className="text-xl font-bold">{experimentData.length * 2}</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-xl font-bold">{score}</p>
              </div>
            </div>
          </motion.div>

          {/* Activity Tabs - Enhanced with Batch 2 Features */}
          <Tabs defaultValue="classic" className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="classic">Classic Lab</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Builds</TabsTrigger>
              <TabsTrigger value="certs" className="gap-1">
                <Trophy className="w-4 h-4" />
                Certs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="advanced" className="space-y-6">
              {/* Neural Net Builder - c302 port with Q-learning */}
              <NeuralNetBuilderActivity />
              
              {/* Mutation Maze - owmeta RDF validation */}
              <MutationMazeGame />
              
              {/* Group Debate - AI Ethics */}
              <GroupDebateApp />
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certs" className="space-y-6">
              <DashboardCertSystem />
            </TabsContent>

            <TabsContent value="classic">
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: "simulate", label: "Simulator", icon: Brain },
                  { id: "experiment", label: "Experiment", icon: FlaskConical },
                  { id: "3d", label: "3D Worm", icon: Zap },
                  { id: "analyze", label: "Analyze", icon: BarChart3 },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={currentView === tab.id ? "default" : "outline"}
                    onClick={() => setCurrentView(tab.id as any)}
                    className="flex-shrink-0 gap-2"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentView === "simulate" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <NeuronSimulator
                    onScoreChange={(s) => {
                      setScore((prev) => prev + 5);
                      addXp(3);
                    }}
                    className="border border-border rounded-2xl shadow-sm"
                  />
                </motion.div>
              )}

              {currentView === "experiment" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-4">Run Controlled Experiments</h2>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Synaptic Weight</span>
                      <span className="font-mono text-sm">{currentWeight[0]}%</span>
                    </div>
                    <Slider
                      value={currentWeight}
                      onValueChange={setCurrentWeight}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <Button onClick={runExperiment} className="w-full mb-4" size="lg">
                    <Zap className="w-4 h-4 mr-2" />
                    Run Experiment
                  </Button>

                  {experimentData.length > 0 && (
                    <div className="bg-muted/50 rounded-xl p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Results ({experimentData.length} trials)
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {experimentData.map((data, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>Trial {i + 1}: Weight {data.weight}%</span>
                            <span className="font-mono">Speed: {data.speed.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExport}
                        className="w-full mt-3 gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export for OpenWorm
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentView === "3d" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
                >
                  <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold">3D Neural Visualization</h2>
                    <p className="text-muted-foreground text-sm">
                      Watch how changing synaptic weights affects signal propagation!
                    </p>
                  </div>
                  
                  <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading...</div>}>
                    <AccessibleWorm3D 
                      activeNeurons={activeNeurons} 
                      signalStrength={signalStrength}
                      wormType="hermaphrodite"
                      ariaDescription={`Middle school neural experiment visualization. Current synaptic weight: ${currentWeight[0]}%. Signal propagation demonstrates relationship between weight and speed.`}
                      neuronLabels={["AVAL", "AVAR", "DB1", "VB1"]}
                      showLabels={true}
                    />
                  </Suspense>

                  <div className="p-4 border-t border-border space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Signal Strength</span>
                        <span className="font-mono text-sm">{currentWeight[0]}%</span>
                      </div>
                      <Slider
                        value={currentWeight}
                        onValueChange={setCurrentWeight}
                        max={100}
                        step={5}
                      />
                    </div>
                    <Button onClick={runExperiment} className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Send Signal
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentView === "analyze" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {quizData ? (
                    <QuizCard
                      question={quizData.question}
                      options={quizData.options}
                      correctIndex={quizData.correctIndex}
                      explanation={quizData.explanation}
                      onComplete={handleQuizComplete}
                    />
                  ) : (
                    <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
                      <p className="text-muted-foreground mb-4">
                        Test your understanding with an AI-generated quiz!
                      </p>
                      <Button onClick={loadQuiz} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Quiz"
                        )}
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar - Hypotheses */}
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Your Hypotheses
                </h3>
                <div className="space-y-3">
                  {hypotheses.map((h) => (
                    <div
                      key={h.id}
                      className={cn(
                        "p-3 rounded-xl border transition-colors",
                        h.tested
                          ? h.result === "confirmed"
                            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <p className="text-sm mb-2">{h.text}</p>
                      {!h.tested ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testHypothesis(h.id)}
                          disabled={experimentData.length < 3 || isLoading}
                          className="w-full"
                        >
                          {experimentData.length < 3
                            ? `Need ${3 - experimentData.length} more experiments`
                            : "Test Hypothesis"}
                        </Button>
                      ) : (
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            h.result === "confirmed" ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {h.result === "confirmed" ? "✓ Confirmed" : "✗ Needs revision"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4">
                <h4 className="font-semibold text-sm mb-2">💡 Scientific Method</h4>
                <ol className="text-xs text-muted-foreground space-y-1">
                  <li>1. Form a hypothesis</li>
                  <li>2. Design an experiment</li>
                  <li>3. Collect data</li>
                  <li>4. Analyze results</li>
                  <li>5. Draw conclusions</li>
                </ol>
              </div>
            </div>
          </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
