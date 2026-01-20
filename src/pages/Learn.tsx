import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Brain, BookOpen, Play, CheckCircle, Lock, ChevronRight, Microscope, Sparkles, Gamepad2, Volume2, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/gameStore";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ConnectomeExplorer } from "@/components/ConnectomeExplorer";
import { WormEvolutionTracker } from "@/components/WormEvolutionTracker";
import { DailyQuests } from "@/components/DailyQuests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArcadeScreen, GhostIcon, PacManLoader } from "@/components/ArcadeScreen";
import { TeacherScript, TEACHER_SCRIPTS } from "@/components/TeacherScript";
import { AgeSelector } from "@/components/AgeSelector";
import { NeuronBuilder } from "@/components/NeuronBuilder";
import { useState } from "react";

type AgeGroup = "prek" | "k5" | "middle" | "high";

const lessons = [
  { id: "intro-worm", module: "Introduction", title: "Meet C. elegans", description: "Discover the tiny worm that changed neuroscience forever.", duration: "5 min", xp: 50, ghost: "pinky" as const },
  { id: "neurons-101", module: "Introduction", title: "What Are Neurons?", description: "Learn about the building blocks of all brains.", duration: "8 min", xp: 75, ghost: "blinky" as const },
  { id: "connectome", module: "Neural Networks", title: "The Connectome", description: "Explore how 302 neurons connect to create behavior.", duration: "10 min", xp: 100, ghost: "inky" as const },
  { id: "synapses", module: "Neural Networks", title: "Synapses & Signals", description: "Understand how neurons communicate with each other.", duration: "12 min", xp: 100, ghost: "clyde" as const },
  { id: "sensory", module: "Worm Systems", title: "Sensory Neurons", description: "How the worm senses its environment.", duration: "15 min", xp: 125, ghost: "pinky" as const },
  { id: "motor", module: "Worm Systems", title: "Motor Control", description: "From signal to movement — how worms wiggle.", duration: "15 min", xp: 125, ghost: "blinky" as const },
  { id: "ai-basics", module: "AI & Neuroscience", title: "Neural Networks in AI", description: "How artificial neural networks mimic real brains.", duration: "20 min", xp: 150, ghost: "inky" as const },
  { id: "train-model", module: "AI & Neuroscience", title: "Training Your First Model", description: "Use worm data to train a simple AI.", duration: "25 min", xp: 200, ghost: "clyde" as const },
];

const moduleIcons: Record<string, React.ReactNode> = {
  "Introduction": <span className="text-2xl">🐛</span>,
  "Neural Networks": <span className="text-2xl">🧠</span>,
  "Worm Systems": <span className="text-2xl">⚡</span>,
  "AI & Neuroscience": <span className="text-2xl">🤖</span>,
};

export default function LearnPage() {
  const { completedLessons } = useGameStore();
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("k5");
  
  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module]) acc[lesson.module] = [];
    acc[lesson.module].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>);

  const isUnlocked = (lessonIndex: number) => lessonIndex === 0 || completedLessons.includes(lessons[lessonIndex - 1].id);
  
  const totalXP = lessons.reduce((sum, l) => completedLessons.includes(l.id) ? sum + l.xp : sum, 0);
  const maxXP = lessons.reduce((sum, l) => sum + l.xp, 0);

  return (
    <div className="min-h-screen bg-background pellet-bg">
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Arcade Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-4 mb-4">
              <GhostIcon color="pinky" animated />
              <GhostIcon color="blinky" animated />
              <h1 className="text-4xl md:text-6xl font-arcade uppercase tracking-tighter text-neon-pink">
                Learning Lab
              </h1>
              <GhostIcon color="inky" animated />
              <GhostIcon color="clyde" animated />
            </div>
            
            {/* XP Progress Bar - Arcade Style */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex justify-between text-xs font-arcade uppercase mb-2">
                <span className="text-muted-foreground">Total XP</span>
                <span className="text-primary">{totalXP} / {maxXP}</span>
              </div>
              <div className="h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalXP / maxXP) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Age Selector */}
            <AgeSelector 
              selected={ageGroup} 
              onSelect={setAgeGroup} 
              compact 
              className="justify-center mb-4"
            />
            
            {/* Teacher Script */}
            <TeacherScript 
              script={TEACHER_SCRIPTS.intro[ageGroup]}
              ageGroup={ageGroup}
              className="max-w-2xl mx-auto"
            />
          </motion.div>

          <Tabs defaultValue="lessons" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-card border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
              <TabsTrigger 
                value="lessons" 
                className="font-arcade text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Gamepad2 className="w-4 h-4 mr-1" />Lessons
              </TabsTrigger>
              <TabsTrigger 
                value="builder"
                className="font-arcade text-xs data-[state=active]:bg-[hsl(280_100%_60%)] data-[state=active]:text-foreground"
              >
                <Puzzle className="w-4 h-4 mr-1" />Build
              </TabsTrigger>
              <TabsTrigger 
                value="connectome"
                className="font-arcade text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Microscope className="w-4 h-4 mr-1" />Brain Map
              </TabsTrigger>
              <TabsTrigger 
                value="progress"
                className="font-arcade text-xs data-[state=active]:bg-[hsl(45_100%_50%)] data-[state=active]:text-foreground"
              >
                <Sparkles className="w-4 h-4 mr-1" />Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lessons">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-8">
                  {Object.entries(groupedLessons).map(([module, moduleLessons], moduleIdx) => (
                    <ArcadeScreen 
                      key={module} 
                      title={module}
                      className="overflow-visible"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: moduleIdx * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-4 pt-2">
                          {moduleIcons[module]}
                          <h2 className="text-lg font-arcade uppercase text-primary">
                            {module}
                          </h2>
                        </div>
                        
                        <div className="space-y-3">
                          {moduleLessons.map((lesson, lessonIdx) => {
                            const globalIndex = lessons.findIndex((l) => l.id === lesson.id);
                            const completed = completedLessons.includes(lesson.id);
                            const unlocked = isUnlocked(globalIndex);
                            
                            return (
                              <Link 
                                key={lesson.id} 
                                to={unlocked ? `/learn/${lesson.id}` : "#"} 
                                className={cn(
                                  "group block bg-card/80 backdrop-blur border-2 p-4 rounded-xl transition-all",
                                  unlocked && "border-foreground shadow-[3px_3px_0px_hsl(var(--foreground))] hover:shadow-[5px_5px_0px_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer",
                                  completed && "border-accent bg-accent/10",
                                  !unlocked && "opacity-50 pointer-events-none border-muted"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  {/* Lesson Icon with Ghost */}
                                  <div className="relative">
                                    <div className={cn(
                                      "w-12 h-12 flex items-center justify-center border-2 rounded-lg",
                                      completed && "bg-accent border-accent",
                                      !completed && unlocked && "bg-primary border-foreground",
                                      !unlocked && "bg-muted border-muted-foreground"
                                    )}>
                                      {completed ? (
                                        <CheckCircle className="w-6 h-6" />
                                      ) : unlocked ? (
                                        <Play className="w-6 h-6 group-hover:animate-pulse" />
                                      ) : (
                                        <Lock className="w-5 h-5" />
                                      )}
                                    </div>
                                    {unlocked && !completed && (
                                      <div className="absolute -top-2 -right-2">
                                        <GhostIcon color={lesson.ghost} className="text-sm" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Lesson Info */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold uppercase text-sm truncate">
                                      {lesson.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {lesson.description}
                                    </p>
                                  </div>
                                  
                                  {/* XP Badge - Pac-Man pellet style */}
                                  <div className="hidden sm:flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs text-muted-foreground">
                                        {lesson.duration}
                                      </span>
                                    </div>
                                    <div className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-arcade",
                                      completed 
                                        ? "bg-accent/20 text-accent" 
                                        : "bg-[hsl(45_100%_50%/0.2)] text-[hsl(45_100%_50%)]"
                                    )}>
                                      <span className="w-2 h-2 rounded-full bg-current" />
                                      +{lesson.xp} XP
                                    </div>
                                  </div>
                                  
                                  <ChevronRight className={cn(
                                    "w-5 h-5 transition-transform",
                                    unlocked && "group-hover:translate-x-1",
                                    !unlocked && "opacity-30"
                                  )} />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    </ArcadeScreen>
                  ))}
                </div>
                
                {/* Sidebar */}
                <div className="space-y-4">
                  <ArcadeScreen title="Your Worm">
                    <WormEvolutionTracker />
                  </ArcadeScreen>
                  <ArcadeScreen title="Daily Quests">
                    <DailyQuests />
                  </ArcadeScreen>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="builder">
              <ArcadeScreen title="Neuron Builder" className="min-h-[500px]">
                <NeuronBuilder 
                  ageGroup={ageGroup}
                  onCircuitComplete={(connections) => {
                    console.log("Circuit complete!", connections);
                  }}
                />
              </ArcadeScreen>
            </TabsContent>

            <TabsContent value="connectome">
              <ArcadeScreen title="C. elegans Connectome Explorer" className="min-h-[600px]">
                <TeacherScript 
                  script={TEACHER_SCRIPTS.neurons[ageGroup]}
                  ageGroup={ageGroup}
                  className="mb-6"
                />
                <ConnectomeExplorer />
              </ArcadeScreen>
            </TabsContent>

            <TabsContent value="progress">
              <div className="grid md:grid-cols-2 gap-6">
                <ArcadeScreen title="Worm Evolution">
                  <TeacherScript 
                    script={TEACHER_SCRIPTS.success[ageGroup]}
                    ageGroup={ageGroup}
                    className="mb-4"
                  />
                  <WormEvolutionTracker />
                </ArcadeScreen>
                <ArcadeScreen title="Daily Challenges">
                  <DailyQuests />
                </ArcadeScreen>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center mt-12"
          >
            <ArcadeScreen className="inline-block">
              <div className="flex items-center gap-4 p-2">
                <PacManLoader />
                <div className="text-left">
                  <p className="font-arcade text-xs text-muted-foreground uppercase">
                    Ready to build circuits?
                  </p>
                  <p className="font-speak text-lg text-primary">
                    {TEACHER_SCRIPTS.circuit[ageGroup].split('.')[0]}!
                  </p>
                </div>
                <Link to="/neuroquest">
                  <Button variant="hero" size="lg" className="font-arcade">
                    <Brain className="w-5 h-5 mr-2" />
                    Start Quest
                  </Button>
                </Link>
              </div>
            </ArcadeScreen>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
