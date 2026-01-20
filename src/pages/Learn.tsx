import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Brain, BookOpen, Play, CheckCircle, Lock, ChevronRight, Microscope, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/gameStore";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ConnectomeExplorer } from "@/components/ConnectomeExplorer";
import { WormEvolutionTracker } from "@/components/WormEvolutionTracker";
import { DailyQuests } from "@/components/DailyQuests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const lessons = [
  { id: "intro-worm", module: "Introduction", title: "Meet C. elegans", description: "Discover the tiny worm that changed neuroscience forever.", duration: "5 min", xp: 50 },
  { id: "neurons-101", module: "Introduction", title: "What Are Neurons?", description: "Learn about the building blocks of all brains.", duration: "8 min", xp: 75 },
  { id: "connectome", module: "Neural Networks", title: "The Connectome", description: "Explore how 302 neurons connect to create behavior.", duration: "10 min", xp: 100 },
  { id: "synapses", module: "Neural Networks", title: "Synapses & Signals", description: "Understand how neurons communicate with each other.", duration: "12 min", xp: 100 },
  { id: "sensory", module: "Worm Systems", title: "Sensory Neurons", description: "How the worm senses its environment.", duration: "15 min", xp: 125 },
  { id: "motor", module: "Worm Systems", title: "Motor Control", description: "From signal to movement — how worms wiggle.", duration: "15 min", xp: 125 },
  { id: "ai-basics", module: "AI & Neuroscience", title: "Neural Networks in AI", description: "How artificial neural networks mimic real brains.", duration: "20 min", xp: 150 },
  { id: "train-model", module: "AI & Neuroscience", title: "Training Your First Model", description: "Use worm data to train a simple AI.", duration: "25 min", xp: 200 },
];

export default function LearnPage() {
  const { completedLessons } = useGameStore();
  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module]) acc[lesson.module] = [];
    acc[lesson.module].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>);

  const isUnlocked = (lessonIndex: number) => lessonIndex === 0 || completedLessons.includes(lessons[lessonIndex - 1].id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Learning <span className="text-primary">Lab</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the connectome, complete lessons, and evolve your worm!
            </p>
          </motion.div>

          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="lessons"><BookOpen className="w-4 h-4 mr-1" />Lessons</TabsTrigger>
              <TabsTrigger value="connectome"><Microscope className="w-4 h-4 mr-1" />Connectome</TabsTrigger>
              <TabsTrigger value="progress"><Sparkles className="w-4 h-4 mr-1" />Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {Object.entries(groupedLessons).map(([module, moduleLessons]) => (
                    <div key={module}>
                      <h2 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />{module}
                      </h2>
                      <div className="space-y-3">
                        {moduleLessons.map((lesson) => {
                          const globalIndex = lessons.findIndex((l) => l.id === lesson.id);
                          const completed = completedLessons.includes(lesson.id);
                          const unlocked = isUnlocked(globalIndex);
                          return (
                            <Link key={lesson.id} to={unlocked ? `/learn/${lesson.id}` : "#"} className={cn(
                              "block bg-card border-2 border-foreground p-4 rounded-xl transition-all",
                              unlocked && "shadow-[4px_4px_0px_hsl(var(--foreground))] hover:border-primary cursor-pointer",
                              completed && "bg-accent/10 border-accent",
                              !unlocked && "opacity-60 pointer-events-none"
                            )}>
                              <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 flex items-center justify-center border-2 rounded-lg",
                                  completed && "bg-accent border-accent",
                                  !completed && unlocked && "bg-primary border-foreground",
                                  !unlocked && "bg-muted border-foreground"
                                )}>
                                  {completed ? <CheckCircle className="w-5 h-5" /> : unlocked ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold uppercase">{lesson.title}</h3>
                                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                  <p className="font-mono text-sm">{lesson.duration}</p>
                                  <p className="text-sm text-primary font-bold">+{lesson.xp} XP</p>
                                </div>
                                <ChevronRight className={cn("w-5 h-5", !unlocked && "opacity-30")} />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <WormEvolutionTracker />
                  <DailyQuests />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="connectome">
              <ConnectomeExplorer />
            </TabsContent>

            <TabsContent value="progress">
              <div className="grid md:grid-cols-2 gap-6">
                <WormEvolutionTracker />
                <DailyQuests />
              </div>
            </TabsContent>
          </Tabs>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
            <Link to="/neuroquest">
              <Button variant="hero" size="lg"><Brain className="w-5 h-5 mr-2" />Start NeuroQuest</Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
