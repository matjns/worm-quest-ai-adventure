import { useState } from "react";
import { Header } from "@/components/Header";
import { GameModeCard } from "@/components/GameModeCard";
import { ProgressTracker } from "@/components/ProgressTracker";
import { NeuronSimulator } from "@/components/NeuronSimulator";
import { AutonomousPlayground } from "@/components/AutonomousPlayground";
import { useGameStore } from "@/stores/gameStore";
import { motion } from "framer-motion";
import { Baby, GraduationCap, School, FlaskConical, Globe, ArrowLeft, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const gameModes = [
  {
    title: "Pre-K Explorer",
    description: "Watch colorful worms wiggle and learn about neurons through fun animations!",
    ageRange: "Ages 3-5",
    icon: Baby,
    href: "/play/pre-k",
    color: "gold" as const,
    features: [
      "Colorful worm animations",
      "Tap to make neurons light up",
      "Simple color matching games",
      "Voice narration for all content",
    ],
  },
  {
    title: "K-5 Brain Builder",
    description: "Drag and drop neurons to build your first connectome. Simple, visual, and super fun!",
    ageRange: "Ages 5-11",
    icon: School,
    href: "/play/k5",
    color: "primary" as const,
    features: [
      "Drag-drop neuron connections",
      "AI-quizzed fun facts",
      "Earn badges and points",
      "Share your worm creations",
    ],
  },
  {
    title: "Middle School Lab",
    description: "Tweak synaptic weights and watch behavior change. Real neuroscience, game-style!",
    ageRange: "Ages 11-14",
    icon: FlaskConical,
    href: "/play/middle",
    color: "accent" as const,
    features: [
      "Adjust connection strengths",
      "AI-simulated behaviors",
      "Hypothesis testing",
      "Compare with real worm data",
    ],
  },
  {
    title: "High School Advanced",
    description: "Build and train neural networks on real C. elegans data. AI-powered optimization.",
    ageRange: "Ages 14+",
    icon: GraduationCap,
    href: "/play/high",
    color: "purple" as const,
    features: [
      "Full connectome access",
      "Train ML models",
      "Reinforcement learning",
      "Contribute to OpenWorm",
    ],
  },
];

export default function PlayPage() {
  const { level, xp, xpToNext, totalPoints, achievements, currentMode, setGameMode, addPoints, addXp } = useGameStore();
  const [showSimulator, setShowSimulator] = useState(false);
  const [activeTab, setActiveTab] = useState<"guided" | "autonomous">("guided");

  const handleScoreChange = (score: number) => {
    addPoints(10);
    addXp(5);
  };

  const handleModeChange = (mode: string) => {
    setGameMode(mode as any);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Back button when in simulator */}
          {showSimulator && (
            <Button 
              variant="ghost" 
              onClick={() => setShowSimulator(false)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Modes
            </Button>
          )}

          {!showSimulator ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                  Choose Your <span className="text-primary">Adventure</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Select a learning mode designed for your age and experience. 
                  Every quest earns you XP, badges, and neuroscience knowledge!
                </p>
              </motion.div>

              {/* Progress Tracker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <ProgressTracker
                  level={level}
                  xp={xp}
                  xpToNext={xpToNext}
                  totalPoints={totalPoints}
                  achievements={achievements}
                />
              </motion.div>

              {/* Mode Selection Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "guided" | "autonomous")} className="mb-8">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="guided" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Guided Learning
                  </TabsTrigger>
                  <TabsTrigger value="autonomous" className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Free Play
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guided">
                  {/* Game Mode Cards */}
                  <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {gameModes.map((mode, i) => (
                      <motion.div
                        key={mode.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        onClick={() => {
                          setGameMode(mode.href.split('/').pop() as any);
                          setShowSimulator(true);
                        }}
                        className="cursor-pointer"
                      >
                        <GameModeCard {...mode} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Public Mode */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-card border-2 border-foreground p-8 shadow-[4px_4px_0px_hsl(var(--foreground))]"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-20 h-20 bg-foreground flex items-center justify-center border-2 border-foreground">
                        <Globe className="w-10 h-10 text-background" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold uppercase mb-2">Public Explorer</h3>
                        <p className="text-muted-foreground mb-4">
                          Free exploration mode — no lessons, no structure, just pure neural playground. 
                          Build anything, share everything, join community challenges.
                        </p>
                      </div>
                      <Button 
                        variant="brutal" 
                        size="lg"
                        onClick={() => {
                          setGameMode("public");
                          setShowSimulator(true);
                        }}
                      >
                        Enter Sandbox
                      </Button>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="autonomous">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AutonomousPlayground 
                      initialMode="sandbox"
                      onModeChange={handleModeChange}
                    />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            /* Simulator View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black uppercase mb-2">Neural Simulator</h2>
                <p className="text-muted-foreground">
                  Click neurons to select them, adjust connection weights, and watch signals propagate!
                </p>
              </div>

              <NeuronSimulator 
                className="mb-8" 
                onScoreChange={handleScoreChange}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <ProgressTracker
                  level={level}
                  xp={xp}
                  xpToNext={xpToNext}
                  totalPoints={totalPoints}
                  achievements={achievements}
                />

                <div className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))]">
                  <h3 className="font-bold uppercase mb-4">Teacher Script</h3>
                  <div className="bg-muted/50 border-2 border-foreground p-4 font-serif italic">
                    <p className="mb-3">
                      "You are now the <strong>Worm Wizard!</strong> See those glowing dots? 
                      Those are neurons — tiny brain cells that help the worm think and move."
                    </p>
                    <p className="mb-3">
                      "Click the <strong>Stimulate</strong> button to send a signal. 
                      Watch how it travels through the connections!"
                    </p>
                    <p>
                      "What happens if you change the connection strength? 
                      Try moving the slider and see how the signal changes!"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}