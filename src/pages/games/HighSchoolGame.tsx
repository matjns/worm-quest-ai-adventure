import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, GraduationCap, Brain, Zap, Code2, GitBranch, Network, Play, Pause, RotateCcw, Download, FileCode, ClipboardCheck, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { useAIChallenge } from "@/hooks/useAIChallenge";
import { Worm3D } from "@/components/Worm3D";
import AccessibleWorm3D from "@/components/AccessibleWorm3D";
import { NeuralQAPanel } from "@/components/NeuralQAPanel";
import { IterationFeedback } from "@/components/IterationFeedback";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveHighSchoolState, loadHighSchoolState, downloadExport } from "@/utils/simulationPersistence";
import { Analytics } from "@/utils/analytics";
import { NeuroMLExportPipeline } from "@/components/NeuroMLExportPipeline";
import { GitHubPRBot } from "@/components/GitHubPRBot";
import { PeerReviewRubric } from "@/components/PeerReviewRubric";
import { EvolutionaryAlgoLab } from "@/components/EvolutionaryAlgoLab";
import { VRSimPresentation } from "@/components/VRSimPresentation";
import { CodingChallengeModule } from "@/components/CodingChallengeModule";
import { SimulationMasteryDashboard } from "@/components/SimulationMasteryDashboard";
import { DashboardCertSystem } from "@/components/DashboardCertSystem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NeuralLayer {
  neurons: number;
  activation: "relu" | "sigmoid" | "tanh";
}

export default function HighSchoolGame() {
  const { addXp, addPoints, completeLesson } = useGameStore();
  const { generateChallenge, validateSimulation, isLoading } = useAIChallenge();
  const [currentView, setCurrentView] = useState<"network" | "train" | "visualize" | "contribute">("network");
  const [layers, setLayers] = useState<NeuralLayer[]>([
    { neurons: 7, activation: "relu" },
    { neurons: 5, activation: "relu" },
    { neurons: 3, activation: "sigmoid" },
  ]);
  const [learningRate, setLearningRate] = useState([0.01]);
  const [epochs, setEpochs] = useState([100]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [activeNeurons, setActiveNeurons] = useState<boolean[]>([]);
  const [signalStrength, setSignalStrength] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<{ epochs: number; loss: number; accuracy: number }[]>([]);

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadHighSchoolState();
    if (saved && saved.trainingHistory) {
      setTrainingHistory(saved.trainingHistory);
    }
    Analytics.gameStart("high_school");
  }, []);

  // Save state when training completes
  useEffect(() => {
    if (trainingHistory.length > 0) {
      saveHighSchoolState({
        hypothesis: [],
        trials: [],
        layers,
        learningRate: learningRate[0],
        epochs: epochs[0],
        trainingHistory,
      });
    }
  }, [trainingHistory, layers, learningRate, epochs]);

  const addLayer = () => {
    if (layers.length < 6) {
      setLayers([...layers, { neurons: 4, activation: "relu" }]);
      addPoints(5);
    }
  };

  const removeLayer = (index: number) => {
    if (layers.length > 2) {
      setLayers(layers.filter((_, i) => i !== index));
    }
  };

  const updateLayer = (index: number, updates: Partial<NeuralLayer>) => {
    setLayers(layers.map((l, i) => (i === index ? { ...l, ...updates } : l)));
  };

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLoss([]);

    // Simulate training with decreasing loss
    const totalEpochs = epochs[0];
    let loss = 1.0;

    for (let i = 0; i < totalEpochs; i++) {
      await new Promise((r) => setTimeout(r, 50));
      loss *= 0.95 + Math.random() * 0.03;
      setTrainingProgress(((i + 1) / totalEpochs) * 100);
      setTrainingLoss((prev) => [...prev, loss]);

      // Update 3D visualization
      setSignalStrength(i / totalEpochs);
      setActiveNeurons(
        Array(10)
          .fill(false)
          .map((_, idx) => idx <= Math.floor((i / totalEpochs) * 10))
      );
    }

    setIsTraining(false);
    addXp(50);
    addPoints(100);
    setScore((s) => s + 100);
    toast.success("Training complete! Model accuracy: " + ((1 - loss) * 100).toFixed(1) + "%");
    completeLesson("high-neural-network");
  };

  const validateNetwork = async () => {
    try {
      const result = await validateSimulation(
        "high",
        JSON.stringify({ layers, learningRate: learningRate[0], epochs: epochs[0] })
      );
      
      if (result.isValid) {
        toast.success("Network architecture validated! " + result.feedback);
        addPoints(50);
        addXp(30);
      } else {
        toast.info(result.feedback);
        if (result.suggestions) {
          result.suggestions.forEach((s: string) => toast.info("💡 " + s));
        }
      }
    } catch (e) {
      toast.error("Validation failed. Try again!");
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
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              High School Advanced
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Neural Network Lab 🧬
            </h1>
            <p className="text-muted-foreground">
              Design, train, and optimize neural networks using real C. elegans data!
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Network className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Layers</p>
                <p className="text-xl font-bold">{layers.length}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Neurons</p>
                <p className="text-xl font-bold">{layers.reduce((a, l) => a + l.neurons, 0)}</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Training Progress</p>
                <p className="text-xl font-bold">{trainingProgress.toFixed(0)}%</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-xl font-bold">{score}</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs - Enhanced with All High School Features */}
          <Tabs defaultValue="classic" className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="classic">Neural Network Lab</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Optimizations</TabsTrigger>
              <TabsTrigger value="research">Research Contributions</TabsTrigger>
            </TabsList>

            <TabsContent value="advanced" className="space-y-6">
              {/* Knowledge Entropy Tracker & Certification */}
              <DashboardCertSystem />
              
              {/* AI Validation Hub - Hallucination Hunter, Critique Loop, Glia Analysis */}
              <SimulationMasteryDashboard />
              
              {/* Evolutionary Algorithm Lab */}
              <EvolutionaryAlgoLab />
              
              {/* VR Simulation Presentation Tool */}
              <VRSimPresentation />
              
              {/* Python Coding Challenges */}
              <CodingChallengeModule />
            </TabsContent>

            <TabsContent value="research" className="space-y-6">
              {/* NeuroML Export Pipeline */}
              <NeuroMLExportPipeline />
              
              {/* GitHub PR Bot */}
              <GitHubPRBot />
              
              {/* Peer Review Rubric */}
              <PeerReviewRubric />
            </TabsContent>

            <TabsContent value="classic">
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: "network", label: "Architecture", icon: Network },
                  { id: "train", label: "Training", icon: Zap },
                  { id: "visualize", label: "Visualize", icon: Brain },
                  { id: "contribute", label: "OpenWorm", icon: GitBranch },
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
              {currentView === "network" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Network Architecture</h2>
                    <Button onClick={addLayer} variant="outline" size="sm" disabled={layers.length >= 6}>
                      + Add Layer
                    </Button>
                  </div>

                  {/* Visual network representation */}
                  <div className="flex items-center justify-center gap-4 mb-8 overflow-x-auto py-4">
                    <div className="text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {Array(7).fill(0).map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded-full bg-primary" />
                        ))}
                      </div>
                      <p className="text-xs mt-2">Input (7)</p>
                    </div>
                    
                    {layers.map((layer, idx) => (
                      <div key={idx} className="text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {Array(layer.neurons).fill(0).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-4 h-4 rounded-full",
                                layer.activation === "relu"
                                  ? "bg-accent"
                                  : layer.activation === "sigmoid"
                                  ? "bg-purple-500"
                                  : "bg-amber-500"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs mt-2">
                          L{idx + 1} ({layer.neurons})
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Layer editors */}
                  <div className="space-y-4">
                    {layers.map((layer, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">Layer {idx + 1}</span>
                          {layers.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLayer(idx)}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Neurons</label>
                            <Slider
                              value={[layer.neurons]}
                              onValueChange={([v]) => updateLayer(idx, { neurons: v })}
                              min={1}
                              max={10}
                              className="mt-2"
                            />
                            <span className="text-xs font-mono">{layer.neurons}</span>
                          </div>
                          
                          <div>
                            <label className="text-sm text-muted-foreground">Activation</label>
                            <div className="flex gap-2 mt-2">
                              {(["relu", "sigmoid", "tanh"] as const).map((act) => (
                                <Button
                                  key={act}
                                  size="sm"
                                  variant={layer.activation === act ? "default" : "outline"}
                                  onClick={() => updateLayer(idx, { activation: act })}
                                >
                                  {act}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={validateNetwork}
                    className="w-full mt-6"
                    disabled={isLoading}
                  >
                    Validate Architecture with AI
                  </Button>
                </motion.div>
              )}

              {currentView === "train" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-6">Training Configuration</h2>

                  <div className="space-y-6 mb-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Learning Rate</label>
                        <span className="font-mono text-sm">{learningRate[0]}</span>
                      </div>
                      <Slider
                        value={learningRate}
                        onValueChange={setLearningRate}
                        min={0.001}
                        max={0.1}
                        step={0.001}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Epochs</label>
                        <span className="font-mono text-sm">{epochs[0]}</span>
                      </div>
                      <Slider
                        value={epochs}
                        onValueChange={setEpochs}
                        min={10}
                        max={500}
                        step={10}
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {isTraining && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Training Progress</span>
                        <span className="font-mono">{trainingProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${trainingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Loss chart (simple representation) */}
                  {trainingLoss.length > 0 && (
                    <div className="bg-muted/50 rounded-xl p-4 mb-6">
                      <h3 className="text-sm font-semibold mb-2">Loss Over Time</h3>
                      <div className="h-32 flex items-end gap-px">
                        {trainingLoss.slice(-50).map((loss, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary rounded-t"
                            style={{ height: `${loss * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={startTraining}
                      disabled={isTraining}
                      className="flex-1"
                      size="lg"
                    >
                      {isTraining ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Training...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Training
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTrainingProgress(0);
                        setTrainingLoss([]);
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentView === "visualize" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
                >
                  <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold">3D Neural Visualization</h2>
                    <p className="text-muted-foreground text-sm">
                      Watch your trained network in action!
                    </p>
                  </div>
                  
                  <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading...</div>}>
                    <AccessibleWorm3D 
                      activeNeurons={activeNeurons} 
                      signalStrength={signalStrength}
                      wormType="hermaphrodite"
                      ariaDescription={`High school neural network visualization. ${layers.length} layers configured with learning rate ${learningRate[0]}. Signal shows trained network inference.`}
                      neuronLabels={["ASE", "AIY", "RIA", "SMD", "RMD"]}
                      showLabels={true}
                    />
                  </Suspense>

                  <div className="p-4 border-t border-border">
                    <Button
                      onClick={() => {
                        let pos = 0;
                        const interval = setInterval(() => {
                          pos += 0.05;
                          setSignalStrength(pos);
                          setActiveNeurons(
                            Array(10)
                              .fill(false)
                              .map((_, idx) => idx <= Math.floor(pos * 10))
                          );
                          if (pos >= 1) clearInterval(interval);
                        }, 50);
                      }}
                      className="w-full"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Run Inference
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentView === "contribute" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-4">Contribute to OpenWorm</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                      <h3 className="font-semibold mb-2">🧬 c302 Repository</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Contribute to the computational model of C. elegans neural network.
                      </p>
                      <a
                        href="https://github.com/openworm/c302"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <GitBranch className="w-4 h-4 mr-2" />
                          View on GitHub
                        </Button>
                      </a>
                    </div>

                    <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                      <h3 className="font-semibold mb-2">🌊 Sibernetic</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Physics simulation engine for C. elegans movement.
                      </p>
                      <a
                        href="https://github.com/openworm/sibernetic"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <GitBranch className="w-4 h-4 mr-2" />
                          View on GitHub
                        </Button>
                      </a>
                    </div>

                    <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                      <h3 className="font-semibold mb-2">📊 PyOpenWorm</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Data access library for C. elegans anatomy and connectome.
                      </p>
                      <a
                        href="https://github.com/openworm/PyOpenWorm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <GitBranch className="w-4 h-4 mr-2" />
                          View on GitHub
                        </Button>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <h3 className="font-bold mb-4">Network Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input neurons:</span>
                    <span className="font-mono">7 (sensory)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hidden layers:</span>
                    <span className="font-mono">{layers.length - 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Output neurons:</span>
                    <span className="font-mono">{layers[layers.length - 1]?.neurons} (motor)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total parameters:</span>
                    <span className="font-mono">
                      {layers.reduce((acc, l, i) => {
                        const prev = i === 0 ? 7 : layers[i - 1].neurons;
                        return acc + prev * l.neurons + l.neurons;
                      }, 0)}
                    </span>
                  </div>
                </div>
                
                {/* Export button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 gap-2"
                  onClick={() => {
                    downloadExport({
                      type: "neural_network",
                      layers,
                      learningRate: learningRate[0],
                      epochs: epochs[0],
                      trainingHistory,
                      timestamp: Date.now(),
                    }, "neural-network-export.json");
                    Analytics.exportData("neural_network");
                    toast.success("Network exported for OpenWorm contribution!");
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export for OpenWorm
                </Button>
              </div>

              {/* Neural Q&A Panel */}
              <NeuralQAPanel 
                userLevel="high"
                currentCircuit={{
                  neurons: layers.flatMap((l, i) => 
                    Array(l.neurons).fill(0).map((_, j) => `L${i}_N${j}`)
                  ),
                  connections: [],
                }}
              />

              <div className="bg-gradient-to-br from-purple-500/10 to-primary/10 rounded-2xl border border-purple-500/20 p-4">
                <h4 className="font-semibold text-sm mb-2">🎓 Research Challenge</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Can you create a network that predicts worm behavior with &gt;90% accuracy?
                </p>
                <Button size="sm" className="w-full" onClick={() => {
                  addPoints(200);
                  addXp(100);
                  Analytics.experimentRun("research_challenge", true);
                  toast.success("Research challenge started! Good luck!");
                }}>
                  Accept Challenge
                </Button>
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
