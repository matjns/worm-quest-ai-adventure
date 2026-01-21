import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, School, Sparkles, Brain, Zap, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "@/stores/gameStore";
import { QuizCard } from "@/components/QuizCard";
import { TutorialCard } from "@/components/TutorialCard";
import { AchievementBadge } from "@/components/AchievementBadge";
import { useAIChallenge } from "@/hooks/useAIChallenge";
import { Worm3D } from "@/components/Worm3D";
import AccessibleWorm3D from "@/components/AccessibleWorm3D";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Brain Building!",
    content: "You're going to learn how worms think! The C. elegans worm has a tiny brain with just 302 neurons.",
    action: "Let's see how neurons connect!",
  },
  {
    title: "What are Neurons?",
    content: "Neurons are like tiny messengers in your brain. They send signals to each other, kind of like passing notes in class!",
    action: "Click 'Next' to learn more.",
  },
  {
    title: "Making Connections",
    content: "When neurons connect, they form a network. The worm uses this network to move, find food, and avoid danger.",
    action: "Ready to build your first brain?",
  },
];

const DRAG_NEURONS = [
  { id: "sensory", name: "Sensory", color: "bg-primary", description: "Feels things!" },
  { id: "motor", name: "Motor", color: "bg-accent", description: "Makes movement!" },
  { id: "inter", name: "Inter", color: "bg-purple-500", description: "Connects others!" },
];

export default function K5Game() {
  const { addXp, addPoints, completeLesson, achievements } = useGameStore();
  const { generateQuiz, getHint, isLoading } = useAIChallenge();
  const [currentView, setCurrentView] = useState<"tutorial" | "build" | "quiz" | "3d">("tutorial");
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [connections, setConnections] = useState<{ from: string; to: string }[]>([]);
  const [score, setScore] = useState(0);
  const [quizData, setQuizData] = useState<any>(null);
  const [activeNeurons, setActiveNeurons] = useState<boolean[]>([]);
  const [signalStrength, setSignalStrength] = useState(0);

  const loadQuiz = async () => {
    try {
      const quiz = await generateQuiz("k5", "neurons and connections");
      setQuizData(quiz);
    } catch (e) {
      toast.error("Couldn't load quiz. Try again!");
    }
  };

  const handleQuizComplete = (correct: boolean) => {
    if (correct) {
      addPoints(20);
      addXp(15);
      setScore((s) => s + 20);
      toast.success("Amazing! You got it right! 🎉");
    } else {
      addXp(5);
    }
  };

  const simulateSignal = () => {
    setActiveNeurons([true, false, false, false, false, false, false, false, false, false]);
    let pos = 0;
    const interval = setInterval(() => {
      pos += 0.1;
      setSignalStrength(pos);
      setActiveNeurons((prev) => {
        const next = [...prev];
        const activeIndex = Math.floor(pos * 10);
        if (activeIndex < 10) next[activeIndex] = true;
        return next;
      });
      if (pos >= 1) {
        clearInterval(interval);
        addPoints(10);
        addXp(5);
        setScore((s) => s + 10);
      }
    }, 100);
  };

  useEffect(() => {
    if (currentView === "quiz" && !quizData) {
      loadQuiz();
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
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
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <School className="w-4 h-4" />
              K-5 Brain Builder
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Build Your First Brain! 🧠
            </h1>
            <p className="text-muted-foreground">
              Connect neurons, watch signals flow, and become a neuroscience star!
            </p>
          </motion.div>

          {/* Score & Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
            </div>
            
            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-2xl font-bold">{connections.length}</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">
                  {achievements.filter((a) => a.unlocked).length}/{achievements.length}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Activity Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: "tutorial", label: "Tutorial 📖", icon: "📖" },
              { id: "build", label: "Build Brain 🔧", icon: "🔧" },
              { id: "3d", label: "3D Worm 🐛", icon: "🐛" },
              { id: "quiz", label: "Quiz Time ❓", icon: "❓" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={currentView === tab.id ? "default" : "outline"}
                onClick={() => setCurrentView(tab.id as any)}
                className="flex-shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tutorial View */}
          {currentView === "tutorial" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TutorialCard
                title="Learn About Neurons"
                steps={TUTORIAL_STEPS}
                onComplete={() => {
                  setTutorialComplete(true);
                  addXp(20);
                  addPoints(50);
                  completeLesson("k5-intro");
                  toast.success("Tutorial complete! You earned 50 points! 🎉");
                  setCurrentView("build");
                }}
              />
            </motion.div>
          )}

          {/* Build View */}
          {currentView === "build" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold mb-4">Drag neurons to connect them!</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {DRAG_NEURONS.map((neuron) => (
                  <motion.div
                    key={neuron.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "p-4 rounded-xl text-white cursor-grab active:cursor-grabbing",
                      neuron.color
                    )}
                    draggable
                    onDragEnd={() => {
                      // Simplified: just add a connection
                      if (connections.length < 6) {
                        setConnections((prev) => [
                          ...prev,
                          { from: neuron.id, to: DRAG_NEURONS[(prev.length + 1) % 3].id },
                        ]);
                        addPoints(5);
                        addXp(3);
                        setScore((s) => s + 5);
                      }
                    }}
                  >
                    <Brain className="w-8 h-8 mb-2" />
                    <p className="font-bold">{neuron.name}</p>
                    <p className="text-sm opacity-80">{neuron.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold mb-2">Your Connections ({connections.length}/6)</h3>
                <div className="flex flex-wrap gap-2">
                  {connections.map((conn, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {conn.from} → {conn.to}
                    </span>
                  ))}
                </div>
              </div>

              <Button onClick={simulateSignal} className="w-full" size="lg">
                <Zap className="w-4 h-4 mr-2" />
                Send Signal Through Brain!
              </Button>
            </motion.div>
          )}

          {/* 3D View */}
          {currentView === "3d" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-bold">Watch the Worm Move!</h2>
                <p className="text-muted-foreground text-sm">
                  Click "Send Signal" to see how neurons make the worm wiggle!
                </p>
              </div>
              
              <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading 3D worm...</div>}>
                <AccessibleWorm3D 
                  activeNeurons={activeNeurons} 
                  signalStrength={signalStrength}
                  wormType="hermaphrodite"
                  ariaDescription="Interactive K-5 C. elegans worm showing how neurons connect to create movement. Active neurons glow to show signal propagation."
                  neuronLabels={connections.map(c => c.from)}
                />
              </Suspense>

              <div className="p-4 border-t border-border">
                <Button onClick={simulateSignal} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Send Signal!
                </Button>
              </div>
            </motion.div>
          )}

          {/* Quiz View */}
          {currentView === "quiz" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isLoading ? (
                <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
                  <div className="loader mx-auto mb-4" />
                  <p className="text-muted-foreground">AI is creating a quiz for you...</p>
                </div>
              ) : quizData ? (
                <QuizCard
                  question={quizData.question}
                  options={quizData.options}
                  correctIndex={quizData.correctIndex}
                  explanation={quizData.explanation}
                  onComplete={handleQuizComplete}
                />
              ) : (
                <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
                  <p className="text-muted-foreground mb-4">Ready for a quiz?</p>
                  <Button onClick={loadQuiz}>Generate Quiz</Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Achievements Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-card rounded-2xl border border-border p-6 shadow-sm"
          >
            <h3 className="font-bold mb-4">Your Achievements</h3>
            <div className="flex gap-6 overflow-x-auto pb-2">
              {achievements.slice(0, 4).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  {...achievement}
                  size="sm"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
