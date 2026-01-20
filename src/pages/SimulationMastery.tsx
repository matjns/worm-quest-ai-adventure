import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, Zap, Brain, GraduationCap, Trophy, Dna, 
  Play, BarChart3, Target, Sparkles, BookOpen
} from "lucide-react";
import { Header } from "@/components/Header";
import { SimulationLearningPath } from "@/components/SimulationLearningPath";
import { SynapticManipulator } from "@/components/SynapticManipulator";
import { EvolutionaryOptimizer } from "@/components/EvolutionaryOptimizer";
import { AISimulationFeedback } from "@/components/AISimulationFeedback";
import { WormSimulator3D } from "@/components/WormSimulator3D";
import { useGameStore } from "@/stores/gameStore";
import { toast } from "sonner";

type ActiveTier = "novice" | "intermediate" | "advanced";

export default function SimulationMastery() {
  const { completedLessons, addXp, addPoints } = useGameStore();
  const [activeTier, setActiveTier] = useState<ActiveTier>("novice");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [synapticWeights, setSynapticWeights] = useState<Record<string, number>>({});
  const [ionChannels, setIonChannels] = useState<Record<string, number>>({});
  const [evolutionaryWeights, setEvolutionaryWeights] = useState<number[]>([]);
  const [wormBehavior, setWormBehavior] = useState<"no_movement" | "move_forward" | "move_backward" | "curl" | "head_wiggle">("no_movement");
  const [activeNeurons, setActiveNeurons] = useState<string[]>([]);

  const handleSelectModule = useCallback((moduleId: string) => {
    setActiveModule(moduleId);
    toast.success(`Starting module: ${moduleId}`);
    
    // Set tier based on module prefix
    if (moduleId.startsWith("n")) setActiveTier("novice");
    else if (moduleId.startsWith("i")) setActiveTier("intermediate");
    else if (moduleId.startsWith("a")) setActiveTier("advanced");
  }, []);

  const handleWeightsChange = useCallback((weights: Record<string, number>) => {
    setSynapticWeights(weights);
    
    // Determine behavior based on weight changes
    const avgWeight = Object.values(weights).reduce((s, w) => s + w, 0) / Math.max(Object.keys(weights).length, 1);
    if (avgWeight > 0.7) {
      setWormBehavior("move_forward");
      setActiveNeurons(["DA1", "VA1", "DB1", "VB1"]);
    } else if (avgWeight < 0.3) {
      setWormBehavior("curl");
      setActiveNeurons(["DD1", "VD1"]);
    } else {
      setWormBehavior("head_wiggle");
      setActiveNeurons(["ASEL", "ASER"]);
    }
  }, []);

  const handleChannelsChange = useCallback((channels: Record<string, number>) => {
    setIonChannels(channels);
  }, []);

  const handleSimulate = useCallback(() => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      addXp(10);
      toast.success("Simulation started!");
    }
  }, [isSimulating, addXp]);

  const handleBestIndividual = useCallback((weights: number[]) => {
    setEvolutionaryWeights(weights);
    
    // Map evolved weights to behavior
    const avgWeight = weights.reduce((s, w) => s + w, 0) / weights.length;
    if (avgWeight > 0.6) {
      setWormBehavior("move_forward");
    } else if (avgWeight < 0.4) {
      setWormBehavior("move_backward");
    }
  }, []);

  const handleApplySuggestion = useCallback((suggestion: { type: string; target: string; rationale: string }) => {
    toast.success(`Applied suggestion: ${suggestion.target}`);
    addPoints(25);
  }, [addPoints]);

  const circuitConfig = {
    neurons: ["ASEL", "ASER", "AIY", "AIZ", "AVA", "AVB", "DA1", "VA1"],
    connections: Object.entries(synapticWeights).map(([key, weight]) => {
      const [from, to] = key.split("-");
      return { from, to, weight };
    }),
  };

  const simulationResult = {
    behavior: wormBehavior,
    success: wormBehavior !== "no_movement",
    metrics: {
      signalStrength: Object.values(synapticWeights).reduce((s, w) => s + w, 0) / Math.max(Object.keys(synapticWeights).length, 1),
      responseTime: 150 - Object.keys(synapticWeights).length * 10,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4" variant="outline">
            <Dna className="h-3 w-3 mr-1" />
            OpenWorm Simulation Engine
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Simulation Mastery Lab
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Self-directed, merit-based learning through C. elegans neural simulation.
            Create, visualize, analyze, manipulate, optimize—in silico.
          </p>
        </motion.div>

        {/* Tier Tabs */}
        <Tabs value={activeTier} onValueChange={(v) => setActiveTier(v as ActiveTier)} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="novice" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Novice
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Novice: View & Analyze */}
          <TabsContent value="novice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-emerald-500" />
                      3D Worm Locomotion Viewer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WormSimulator3D
                      behavior={wormBehavior}
                      activeNeurons={activeNeurons}
                      signalPath={[]}
                      isSimulating={isSimulating}
                      className="w-full"
                    />
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <Button onClick={handleSimulate} variant={isSimulating ? "destructive" : "default"}>
                        {isSimulating ? "Stop" : "Start"} Observation
                      </Button>
                      <div className="flex gap-2">
                        {["no_movement", "move_forward", "move_backward", "curl"].map((b) => (
                          <Button
                            key={b}
                            variant={wormBehavior === b ? "default" : "outline"}
                            size="sm"
                            onClick={() => setWormBehavior(b as typeof wormBehavior)}
                          >
                            {b.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <SimulationLearningPath
                  onSelectModule={handleSelectModule}
                  completedModules={completedLessons}
                />
              </div>
            </div>
          </TabsContent>

          {/* Intermediate: Manipulate */}
          <TabsContent value="intermediate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SynapticManipulator
                onWeightsChange={handleWeightsChange}
                onChannelsChange={handleChannelsChange}
                onSimulate={handleSimulate}
                isSimulating={isSimulating}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-amber-500" />
                    Live Simulation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WormSimulator3D
                    behavior={wormBehavior}
                    activeNeurons={activeNeurons}
                    signalPath={Object.keys(synapticWeights)}
                    isSimulating={isSimulating}
                    className="w-full"
                  />
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="p-2 rounded bg-muted">
                      <div className="font-bold">{Object.keys(synapticWeights).length}</div>
                      <div className="text-xs text-muted-foreground">Modified</div>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <div className="font-bold">{wormBehavior.replace("_", " ")}</div>
                      <div className="text-xs text-muted-foreground">Behavior</div>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <div className="font-bold">{activeNeurons.length}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <AISimulationFeedback
              circuitConfig={circuitConfig}
              simulationResult={simulationResult}
              targetBehavior="chemotaxis"
              onApplySuggestion={handleApplySuggestion}
            />
          </TabsContent>

          {/* Advanced: Create & Optimize */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EvolutionaryOptimizer
                targetBehavior="chemotaxis"
                onBestIndividual={handleBestIndividual}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    Evolved Circuit Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WormSimulator3D
                    behavior={wormBehavior}
                    activeNeurons={activeNeurons}
                    signalPath={[]}
                    isSimulating={evolutionaryWeights.length > 0}
                    className="w-full"
                  />
                  {evolutionaryWeights.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="text-sm font-medium mb-2">Evolved Genome</div>
                      <div className="flex flex-wrap gap-1">
                        {evolutionaryWeights.map((w, i) => (
                          <div
                            key={i}
                            className="w-8 h-6 rounded text-xs flex items-center justify-center font-mono"
                            style={{
                              backgroundColor: `hsl(${w * 120}, 70%, 40%)`,
                              color: "white",
                            }}
                          >
                            {w.toFixed(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Career Skills Unlocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Evolutionary Computation", icon: Dna },
                    { name: "Optimization Algorithms", icon: Target },
                    { name: "AI/ML Fundamentals", icon: Sparkles },
                    { name: "Computational Biology", icon: BookOpen },
                  ].map((skill) => (
                    <div key={skill.name} className="flex items-center gap-2 p-3 rounded-lg bg-background border">
                      <skill.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{skill.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  These LinkedIn-ready skills demonstrate expertise in computational neuroscience, 
                  systems biology, and AI—positioning you for careers in biotech, pharma, and data science.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* American STEM Dominance Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center py-8 border-t"
        >
          <Badge variant="outline" className="mb-4">
            <Trophy className="h-3 w-3 mr-1" />
            Fueling American STEM Dominance
          </Badge>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Self-directed, merit-based learning through OpenWorm's open-source platform.
            Master simulation skills that power the next generation of American innovation 
            in biotech, AI, and computational science.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
