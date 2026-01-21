import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/Header";
import { 
  Activity, Zap, Target, TrendingUp, AlertTriangle, 
  Play, Pause, RotateCcw, Settings, Brain, Sparkles,
  ChevronRight, Trophy, Download, Share2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEngagementStore } from "@/stores/engagementStore";

// Lorenz attractor parameters for strange attractors
interface LorenzState {
  x: number;
  y: number;
  z: number;
}

interface SupplyNode {
  id: string;
  name: string;
  type: "supplier" | "factory" | "warehouse" | "retailer";
  health: number;
  throughput: number;
  chaos: number;
  connections: string[];
}

interface SimulationParams {
  sigma: number; // Lorenz sigma
  rho: number;   // Lorenz rho
  beta: number;  // Lorenz beta
  perturbation: number;
  adaptiveGain: number;
}

const INITIAL_SUPPLY_CHAIN: SupplyNode[] = [
  { id: "s1", name: "Raw Materials", type: "supplier", health: 100, throughput: 85, chaos: 0, connections: ["f1", "f2"] },
  { id: "s2", name: "Components", type: "supplier", health: 100, throughput: 90, chaos: 0, connections: ["f1"] },
  { id: "f1", name: "Assembly Plant", type: "factory", health: 100, throughput: 75, chaos: 0, connections: ["w1", "w2"] },
  { id: "f2", name: "Processing Hub", type: "factory", health: 100, throughput: 80, chaos: 0, connections: ["w1"] },
  { id: "w1", name: "Central Warehouse", type: "warehouse", health: 100, throughput: 95, chaos: 0, connections: ["r1", "r2", "r3"] },
  { id: "w2", name: "Regional Depot", type: "warehouse", health: 100, throughput: 88, chaos: 0, connections: ["r2", "r3"] },
  { id: "r1", name: "Metro Retail", type: "retailer", health: 100, throughput: 70, chaos: 0, connections: [] },
  { id: "r2", name: "Suburban Outlets", type: "retailer", health: 100, throughput: 65, chaos: 0, connections: [] },
  { id: "r3", name: "E-Commerce", type: "retailer", health: 100, throughput: 92, chaos: 0, connections: [] },
];

// Worm-inspired neural dynamics for optimization
const WORM_NEURONS = {
  sensory: ["AWA", "AWB", "AWC", "ASE", "ASH"], // Detect chaos
  inter: ["AIY", "AIZ", "AIB", "RIA", "AVA"],   // Process & decide
  motor: ["VB", "VA", "DB", "DA", "AS"],         // Execute adaptation
};

export default function ChaosSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [supplyChain, setSupplyChain] = useState<SupplyNode[]>(INITIAL_SUPPLY_CHAIN);
  const [lorenzState, setLorenzState] = useState<LorenzState>({ x: 1, y: 1, z: 1 });
  const [params, setParams] = useState<SimulationParams>({
    sigma: 10,
    rho: 28,
    beta: 8/3,
    perturbation: 0.5,
    adaptiveGain: 0.3,
  });
  const [chaosHistory, setChaosHistory] = useState<number[]>([]);
  const [neuronActivity, setNeuronActivity] = useState<Record<string, number>>({});
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [phase, setPhase] = useState<"stable" | "bifurcation" | "chaos" | "optimized">("stable");
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const frameRef = useRef<number>(0);
  
  const { unlockBadge, updateBadgeProgress } = useEngagementStore();

  // Lorenz system step
  const lorenzStep = useCallback((state: LorenzState, dt: number): LorenzState => {
    const { sigma, rho, beta } = params;
    const dx = sigma * (state.y - state.x);
    const dy = state.x * (rho - state.z) - state.y;
    const dz = state.x * state.y - beta * state.z;
    
    return {
      x: state.x + dx * dt,
      y: state.y + dy * dt,
      z: state.z + dz * dt,
    };
  }, [params]);

  // Worm-inspired adaptive control
  const applyWormOptimization = useCallback((nodes: SupplyNode[], chaosLevel: number): SupplyNode[] => {
    // Sensory neurons detect chaos
    const sensoryResponse = WORM_NEURONS.sensory.reduce((acc, n, i) => {
      acc[n] = Math.min(1, chaosLevel / 50 + Math.random() * 0.2);
      return acc;
    }, {} as Record<string, number>);

    // Interneurons process (simple network dynamics)
    const interResponse = WORM_NEURONS.inter.reduce((acc, n, i) => {
      const sensorySum = Object.values(sensoryResponse).reduce((s, v) => s + v, 0) / 5;
      acc[n] = Math.tanh(sensorySum * 2 - 1 + (Math.random() - 0.5) * 0.3);
      return acc;
    }, {} as Record<string, number>);

    // Motor neurons drive adaptation
    const motorResponse = WORM_NEURONS.motor.reduce((acc, n, i) => {
      const interSum = Object.values(interResponse).reduce((s, v) => s + v, 0) / 5;
      acc[n] = Math.max(0, Math.min(1, 0.5 + interSum * params.adaptiveGain));
      return acc;
    }, {} as Record<string, number>);

    setNeuronActivity({ ...sensoryResponse, ...interResponse, ...motorResponse });

    // Apply motor output to supply chain
    const avgMotor = Object.values(motorResponse).reduce((s, v) => s + v, 0) / 5;
    
    return nodes.map((node, i) => {
      const adaptation = avgMotor * params.adaptiveGain * 10;
      const chaosImpact = (chaosLevel / 100) * params.perturbation * 20;
      
      const newHealth = Math.max(0, Math.min(100, 
        node.health - chaosImpact + adaptation + (Math.random() - 0.5) * 5
      ));
      
      const newThroughput = Math.max(0, Math.min(100,
        node.throughput * (0.95 + adaptation * 0.1) + (Math.random() - 0.5) * 3
      ));
      
      const newChaos = Math.max(0, Math.min(100,
        node.chaos + chaosImpact * 0.5 - adaptation * 0.3
      ));

      return { ...node, health: newHealth, throughput: newThroughput, chaos: newChaos };
    });
  }, [params]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const dt = 0.01;
    let animationId: number;

    const tick = () => {
      frameRef.current++;
      
      // Update Lorenz attractor
      setLorenzState(prev => lorenzStep(prev, dt));
      
      // Calculate chaos metric from attractor
      setLorenzState(prev => {
        const chaosMetric = Math.sqrt(prev.x ** 2 + prev.y ** 2 + prev.z ** 2);
        const normalizedChaos = Math.min(100, (chaosMetric / 50) * 100);
        
        setChaosHistory(h => [...h.slice(-100), normalizedChaos]);
        
        // Determine phase
        if (normalizedChaos < 20) setPhase("stable");
        else if (normalizedChaos < 40) setPhase("bifurcation");
        else if (normalizedChaos < 70) setPhase("chaos");
        else setPhase("optimized");
        
        // Update supply chain
        setSupplyChain(nodes => {
          const updated = applyWormOptimization(nodes, normalizedChaos);
          
          // Calculate optimization score
          const avgHealth = updated.reduce((s, n) => s + n.health, 0) / updated.length;
          const avgThroughput = updated.reduce((s, n) => s + n.throughput, 0) / updated.length;
          const score = (avgHealth + avgThroughput) / 2;
          setOptimizationScore(Math.round(score));
          
          return updated;
        });
        
        return prev;
      });
      
      animationId = requestAnimationFrame(tick);
    };
    
    animationId = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, lorenzStep, applyWormOptimization]);

  // Check for discoveries
  useEffect(() => {
    if (optimizationScore > 85 && !discoveries.includes("stable-attractor")) {
      setDiscoveries(d => [...d, "stable-attractor"]);
      toast.success("🎯 Discovery: Stable Attractor Found!");
      unlockBadge("chaos-tamer");
    }
    
    if (phase === "bifurcation" && !discoveries.includes("bifurcation-point")) {
      setDiscoveries(d => [...d, "bifurcation-point"]);
      toast.success("🌀 Discovery: Bifurcation Point Detected!");
    }
    
    if (chaosHistory.length > 50 && !discoveries.includes("strange-attractor")) {
      const variance = chaosHistory.slice(-50).reduce((acc, v, i, arr) => {
        const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
        return acc + (v - mean) ** 2;
      }, 0) / 50;
      
      if (variance > 100) {
        setDiscoveries(d => [...d, "strange-attractor"]);
        toast.success("🦋 Discovery: Strange Attractor Identified!");
        updateBadgeProgress("chaos-master", 1);
      }
    }
  }, [optimizationScore, phase, chaosHistory, discoveries, unlockBadge, updateBadgeProgress]);

  const resetSimulation = () => {
    setIsRunning(false);
    setSupplyChain(INITIAL_SUPPLY_CHAIN);
    setLorenzState({ x: 1, y: 1, z: 1 });
    setChaosHistory([]);
    setNeuronActivity({});
    setOptimizationScore(0);
    setPhase("stable");
    frameRef.current = 0;
  };

  const getPhaseColor = (p: typeof phase) => {
    switch (p) {
      case "stable": return "text-green-500 bg-green-500/10";
      case "bifurcation": return "text-amber-500 bg-amber-500/10";
      case "chaos": return "text-red-500 bg-red-500/10";
      case "optimized": return "text-primary bg-primary/10";
    }
  };

  const getNodeColor = (node: SupplyNode) => {
    if (node.health > 80) return "bg-green-500";
    if (node.health > 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-4">
            <Activity className="h-3 w-3 mr-1" />
            Dynamical Systems Lab
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Supply Chain Chaos Optimizer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Use C. elegans neural dynamics to optimize complex supply chains through 
            strange attractors and bifurcation analysis. A worm proxy for real-world chaos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* Control Panel */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      variant={isRunning ? "destructive" : "default"}
                    >
                      {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isRunning ? "Pause" : "Start"} Simulation
                    </Button>
                    <Button variant="outline" onClick={resetSimulation}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={cn("px-3 py-1", getPhaseColor(phase))}>
                      {phase.charAt(0).toUpperCase() + phase.slice(1)}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{optimizationScore}%</div>
                      <div className="text-xs text-muted-foreground">Optimization Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply Chain Network */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Supply Chain Network
                </CardTitle>
                <CardDescription>
                  Real-time node health influenced by Lorenz attractor dynamics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative min-h-[300px] bg-muted/30 rounded-lg p-4"
                  role="img"
                  aria-label="Interactive supply chain network diagram showing suppliers, factories, warehouses, and retailers with real-time health indicators"
                >
                  {/* Network visualization */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Suppliers */}
                    <div className="space-y-3">
                      <Badge variant="secondary" className="w-full justify-center">Suppliers</Badge>
                      {supplyChain.filter(n => n.type === "supplier").map(node => (
                        <motion.div
                          key={node.id}
                          className="p-3 bg-background rounded-lg border shadow-sm"
                          animate={{ 
                            borderColor: node.chaos > 30 ? "hsl(var(--destructive))" : "hsl(var(--border))"
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{node.name}</span>
                            <div className={cn("h-2 w-2 rounded-full", getNodeColor(node))} />
                          </div>
                          <Progress value={node.health} className="h-1.5 mb-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Health: {Math.round(node.health)}%</span>
                            <span>Chaos: {Math.round(node.chaos)}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Factories */}
                    <div className="space-y-3">
                      <Badge variant="secondary" className="w-full justify-center">Factories</Badge>
                      {supplyChain.filter(n => n.type === "factory").map(node => (
                        <motion.div
                          key={node.id}
                          className="p-3 bg-background rounded-lg border shadow-sm"
                          animate={{ 
                            borderColor: node.chaos > 30 ? "hsl(var(--destructive))" : "hsl(var(--border))"
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{node.name}</span>
                            <div className={cn("h-2 w-2 rounded-full", getNodeColor(node))} />
                          </div>
                          <Progress value={node.health} className="h-1.5 mb-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Health: {Math.round(node.health)}%</span>
                            <span>Chaos: {Math.round(node.chaos)}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Warehouses */}
                    <div className="space-y-3">
                      <Badge variant="secondary" className="w-full justify-center">Warehouses</Badge>
                      {supplyChain.filter(n => n.type === "warehouse").map(node => (
                        <motion.div
                          key={node.id}
                          className="p-3 bg-background rounded-lg border shadow-sm"
                          animate={{ 
                            borderColor: node.chaos > 30 ? "hsl(var(--destructive))" : "hsl(var(--border))"
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{node.name}</span>
                            <div className={cn("h-2 w-2 rounded-full", getNodeColor(node))} />
                          </div>
                          <Progress value={node.health} className="h-1.5 mb-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Health: {Math.round(node.health)}%</span>
                            <span>Chaos: {Math.round(node.chaos)}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Retailers */}
                    <div className="space-y-3">
                      <Badge variant="secondary" className="w-full justify-center">Retailers</Badge>
                      {supplyChain.filter(n => n.type === "retailer").map(node => (
                        <motion.div
                          key={node.id}
                          className="p-3 bg-background rounded-lg border shadow-sm"
                          animate={{ 
                            borderColor: node.chaos > 30 ? "hsl(var(--destructive))" : "hsl(var(--border))"
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{node.name}</span>
                            <div className={cn("h-2 w-2 rounded-full", getNodeColor(node))} />
                          </div>
                          <Progress value={node.health} className="h-1.5 mb-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Health: {Math.round(node.health)}%</span>
                            <span>Chaos: {Math.round(node.chaos)}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chaos History Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Chaos Dynamics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="h-32 bg-muted/30 rounded-lg p-2 flex items-end gap-0.5"
                  role="img"
                  aria-label="Time series chart showing chaos levels over the last 100 simulation steps"
                >
                  {chaosHistory.slice(-100).map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/60 rounded-t transition-all"
                      style={{ height: `${value}%` }}
                    />
                  ))}
                  {chaosHistory.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                      Start simulation to see chaos dynamics
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Parameter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Attractor Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>σ (Sigma)</span>
                    <span>{params.sigma.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[params.sigma]}
                    onValueChange={([v]) => setParams(p => ({ ...p, sigma: v }))}
                    min={1}
                    max={20}
                    step={0.5}
                    disabled={isRunning}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>ρ (Rho)</span>
                    <span>{params.rho.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[params.rho]}
                    onValueChange={([v]) => setParams(p => ({ ...p, rho: v }))}
                    min={0}
                    max={50}
                    step={1}
                    disabled={isRunning}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Perturbation</span>
                    <span>{params.perturbation.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[params.perturbation]}
                    onValueChange={([v]) => setParams(p => ({ ...p, perturbation: v }))}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Adaptive Gain</span>
                    <span>{params.adaptiveGain.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[params.adaptiveGain]}
                    onValueChange={([v]) => setParams(p => ({ ...p, adaptiveGain: v }))}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Worm Neural Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Worm Neural Activity
                </CardTitle>
                <CardDescription>
                  C. elegans neurons controlling adaptation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sensory">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="sensory">Sensory</TabsTrigger>
                    <TabsTrigger value="inter">Inter</TabsTrigger>
                    <TabsTrigger value="motor">Motor</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(WORM_NEURONS).map(([type, neurons]) => (
                    <TabsContent key={type} value={type} className="space-y-2">
                      {neurons.map(neuron => (
                        <div key={neuron} className="flex items-center gap-3">
                          <span className="text-xs font-mono w-10">{neuron}</span>
                          <Progress 
                            value={(neuronActivity[neuron] || 0) * 100} 
                            className="h-2 flex-1"
                          />
                          <span className="text-xs w-10 text-right">
                            {((neuronActivity[neuron] || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Discoveries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Discoveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[150px]">
                  {discoveries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Run the simulation to unlock discoveries
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {discoveries.map(d => (
                        <div key={d} className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="text-sm capitalize">{d.replace(/-/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Educational Context */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Why Worms for Chaos?
                </h4>
                <p className="text-sm text-muted-foreground">
                  C. elegans' 302-neuron network evolved to navigate chaotic environments
                  (turbulent soil, fluctuating chemicals). This same neural architecture 
                  can optimize complex dynamical systems like supply chains through 
                  strange attractor navigation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
