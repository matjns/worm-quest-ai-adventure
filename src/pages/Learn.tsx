import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Brain, BookOpen, Play, CheckCircle, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/stores/gameStore";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const lessons = [
  {
    id: "intro-worm",
    module: "Introduction",
    title: "Meet C. elegans",
    description: "Discover the tiny worm that changed neuroscience forever.",
    duration: "5 min",
    xp: 50,
  },
  {
    id: "neurons-101",
    module: "Introduction",
    title: "What Are Neurons?",
    description: "Learn about the building blocks of all brains.",
    duration: "8 min",
    xp: 75,
  },
  {
    id: "connectome",
    module: "Neural Networks",
    title: "The Connectome",
    description: "Explore how 302 neurons connect to create behavior.",
    duration: "10 min",
    xp: 100,
  },
  {
    id: "synapses",
    module: "Neural Networks",
    title: "Synapses & Signals",
    description: "Understand how neurons communicate with each other.",
    duration: "12 min",
    xp: 100,
  },
  {
    id: "sensory",
    module: "Worm Systems",
    title: "Sensory Neurons",
    description: "How the worm senses its environment.",
    duration: "15 min",
    xp: 125,
  },
  {
    id: "motor",
    module: "Worm Systems",
    title: "Motor Control",
    description: "From signal to movement — how worms wiggle.",
    duration: "15 min",
    xp: 125,
  },
  {
    id: "ai-basics",
    module: "AI & Neuroscience",
    title: "Neural Networks in AI",
    description: "How artificial neural networks mimic real brains.",
    duration: "20 min",
    xp: 150,
  },
  {
    id: "train-model",
    module: "AI & Neuroscience",
    title: "Training Your First Model",
    description: "Use worm data to train a simple AI.",
    duration: "25 min",
    xp: 200,
  },
];

export default function LearnPage() {
  const { completedLessons, completeLesson } = useGameStore();

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module]) acc[lesson.module] = [];
    acc[lesson.module].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>);

  const isUnlocked = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    return completedLessons.includes(lessons[lessonIndex - 1].id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Learning <span className="text-primary">Path</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From worm basics to AI mastery — complete lessons to unlock new skills and earn XP.
            </p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm text-muted-foreground">PROGRESS</p>
                <p className="text-3xl font-bold">
                  {completedLessons.length} / {lessons.length} Lessons
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-muted-foreground">TOTAL XP AVAILABLE</p>
                <p className="text-3xl font-bold text-primary">
                  {lessons.reduce((sum, l) => sum + l.xp, 0)} XP
                </p>
              </div>
            </div>
            <div className="mt-4 h-4 bg-muted border-2 border-foreground overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
              />
            </div>
          </motion.div>

          {/* Lessons by Module */}
          {Object.entries(groupedLessons).map(([module, moduleLessons], moduleIndex) => (
            <motion.div
              key={module}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + moduleIndex * 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {module}
              </h2>

              <div className="space-y-3">
                {moduleLessons.map((lesson, lessonIndex) => {
                  const globalIndex = lessons.findIndex((l) => l.id === lesson.id);
                  const completed = completedLessons.includes(lesson.id);
                  const unlocked = isUnlocked(globalIndex);

                  return (
                    <Link
                      key={lesson.id}
                      to={unlocked ? `/learn/${lesson.id}` : "#"}
                      className={cn(
                        "block bg-card border-2 border-foreground p-4 transition-all rounded-xl",
                        unlocked && "shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_hsl(var(--primary))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:border-primary cursor-pointer",
                        completed && "bg-accent/10 border-accent",
                        !unlocked && "opacity-60 pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Status Icon */}
                        <div
                          className={cn(
                            "w-10 h-10 flex items-center justify-center border-2",
                            completed && "bg-accent border-accent",
                            !completed && unlocked && "bg-primary border-foreground",
                            !unlocked && "bg-muted border-foreground"
                          )}
                        >
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-accent-foreground" />
                          ) : unlocked ? (
                            <Play className="w-5 h-5 text-primary-foreground" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="font-bold uppercase">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">{lesson.description}</p>
                        </div>

                        {/* Meta */}
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
            </motion.div>
          ))}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Ready to apply what you've learned?
            </p>
            <Link to="/play">
              <Button variant="hero" size="lg">
                <Brain className="w-5 h-5 mr-2" />
                Start Playing
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}