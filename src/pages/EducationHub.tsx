import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { EducationModuleCard } from "@/components/EducationModuleCard";
import { ModuleLessonPlayer } from "@/components/ModuleLessonPlayer";
import { KeynoteGenerator } from "@/components/KeynoteGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  LogIn,
  Cloud,
  Presentation,
} from "lucide-react";
import {
  PREK_MODULES,
  K5_MODULES,
  MIDDLE_MODULES,
  HIGH_MODULES,
  PUBLIC_MODULES,
  getModuleById,
  type EducationModule,
} from "@/data/educationModules";
import { useModuleProgress } from "@/hooks/useModuleProgress";

type GradeFilter = "all" | "prek" | "k5" | "middle" | "high" | "public";
type SortOption = "default" | "duration" | "objectives" | "steps";

const gradeLabels: Record<GradeFilter, string> = {
  all: "All Levels",
  prek: "Pre-K",
  k5: "K-5",
  middle: "Middle School",
  high: "High School",
  public: "Public",
};

const gradeDescriptions: Record<Exclude<GradeFilter, "all">, string> = {
  prek: "Colors & Wiggling - Simple tap interactions for ages 3-5",
  k5: "Drag Quizzes - Interactive labeling and circuits for ages 5-10",
  middle: "Synapse Edits - Adjust neural connections for ages 11-13",
  high: "AI Optimization - Machine learning concepts for ages 14-18",
  public: "Open Challenges - Community-driven experiments for all ages",
};

const gradeColors: Record<Exclude<GradeFilter, "all">, string> = {
  prek: "from-pink-500 to-orange-400",
  k5: "from-primary to-cyan-400",
  middle: "from-purple-500 to-pink-400",
  high: "from-indigo-500 to-purple-400",
  public: "from-foreground to-muted-foreground",
};

const gradeEmojis: Record<Exclude<GradeFilter, "all">, string> = {
  prek: "🐛",
  k5: "🧠",
  middle: "🔬",
  high: "💻",
  public: "🌐",
};

export default function EducationHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("modules");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  const { 
    completedModules, 
    loading: progressLoading, 
    completeModule, 
    isAuthenticated,
    getTotalScore,
  } = useModuleProgress();

  const allModules = useMemo(() => [
    ...PREK_MODULES,
    ...K5_MODULES,
    ...MIDDLE_MODULES,
    ...HIGH_MODULES,
    ...PUBLIC_MODULES,
  ], []);

  const filteredModules = useMemo(() => {
    let modules = gradeFilter === "all" 
      ? allModules 
      : allModules.filter(m => m.gradeLevel === gradeFilter);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      modules = modules.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.subtitle.toLowerCase().includes(query) ||
        m.vocabulary.some(v => v.term.toLowerCase().includes(query))
      );
    }

    switch (sortBy) {
      case "duration":
        modules = [...modules].sort((a, b) => 
          parseInt(a.duration) - parseInt(b.duration)
        );
        break;
      case "objectives":
        modules = [...modules].sort((a, b) => 
          b.objectives.length - a.objectives.length
        );
        break;
      case "steps":
        modules = [...modules].sort((a, b) => 
          b.steps.length - a.steps.length
        );
        break;
    }

    return modules;
  }, [allModules, gradeFilter, searchQuery, sortBy]);

  const modulesByGrade = useMemo(() => {
    const grouped: Record<string, EducationModule[]> = {};
    filteredModules.forEach(module => {
      if (!grouped[module.gradeLevel]) {
        grouped[module.gradeLevel] = [];
      }
      grouped[module.gradeLevel].push(module);
    });
    return grouped;
  }, [filteredModules]);

  const stats = useMemo(() => ({
    total: allModules.length,
    completed: completedModules.size,
    byGrade: {
      prek: PREK_MODULES.length,
      k5: K5_MODULES.length,
      middle: MIDDLE_MODULES.length,
      high: HIGH_MODULES.length,
      public: PUBLIC_MODULES.length,
    },
  }), [allModules.length, completedModules.size]);

  const handleStartModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
  };

  const handleCompleteModule = async (moduleId: string) => {
    const module = getModuleById(moduleId);
    const stepsCompleted = module?.steps.length || 0;
    const score = stepsCompleted * 10; // 10 points per step
    await completeModule(moduleId, score, stepsCompleted);
    setActiveModuleId(null);
  };

  const handleExitModule = () => {
    setActiveModuleId(null);
  };

  const activeModule = activeModuleId ? getModuleById(activeModuleId) : null;

  if (activeModule) {
    return (
      <ModuleLessonPlayer
        module={activeModule}
        onComplete={handleCompleteModule}
        onExit={handleExitModule}
      />
    );
  }

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
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Education Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Learn Neuroscience Through Play
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore {stats.total} interactive modules designed for every age group.
            From colorful Pre-K activities to advanced AI optimization.
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="modules" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="keynote" className="gap-2">
              <Presentation className="w-4 h-4" />
              Keynote Generator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keynote" className="mt-6">
            <KeynoteGenerator />
          </TabsContent>

          <TabsContent value="modules" className="mt-6">

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {(Object.keys(gradeDescriptions) as Exclude<GradeFilter, "all">[]).map((grade) => (
            <button
              key={grade}
              onClick={() => setGradeFilter(grade)}
              className={`p-4 rounded-xl border-2 transition-all ${
                gradeFilter === grade
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-1">{gradeEmojis[grade]}</div>
              <div className="font-bold">{gradeLabels[grade]}</div>
              <div className="text-sm text-muted-foreground">
                {stats.byGrade[grade]} modules
              </div>
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search modules, topics, vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={gradeFilter} onValueChange={(v) => setGradeFilter(v as GradeFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="prek">Pre-K</TabsTrigger>
              <TabsTrigger value="k5">K-5</TabsTrigger>
              <TabsTrigger value="middle">Middle</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Order</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="objectives">Most Objectives</SelectItem>
              <SelectItem value="steps">Most Steps</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Progress Bar */}
        {progressLoading ? (
          <Skeleton className="h-20 w-full mb-8 rounded-xl" />
        ) : (
          <>
            {!isAuthenticated && completedModules.size > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-500">Sign in to save your progress</p>
                    <p className="text-sm text-muted-foreground">Your progress is only saved locally. Sign in to sync across devices.</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                </div>
              </motion.div>
            )}
            
            {completedModules.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-card border border-border rounded-xl p-4 mb-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Your Progress
                    {isAuthenticated && (
                      <Badge variant="secondary" className="text-xs">
                        <Cloud className="w-3 h-3 mr-1" />
                        Synced
                      </Badge>
                    )}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {getTotalScore()} pts
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {completedModules.size} / {stats.total} completed
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedModules.size / stats.total) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-cyan-400"
                  />
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Modules Grid */}
        <AnimatePresence mode="wait">
          {gradeFilter === "all" ? (
            // Show grouped by grade
            <motion.div
              key="grouped"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {(Object.keys(modulesByGrade) as Exclude<GradeFilter, "all">[]).map((grade) => (
                <section key={grade}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradeColors[grade]}`}>
                      <span className="text-xl">{gradeEmojis[grade]}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{gradeLabels[grade]}</h2>
                      <p className="text-sm text-muted-foreground">
                        {gradeDescriptions[grade]}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {modulesByGrade[grade]?.length || 0} modules
                    </Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modulesByGrade[grade]?.map((module) => (
                      <EducationModuleCard
                        key={module.id}
                        module={module}
                        onStart={handleStartModule}
                        isCompleted={completedModules.has(module.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </motion.div>
          ) : (
            // Show flat grid for filtered view
            <motion.div
              key="flat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6">
                <div className={`p-4 rounded-xl bg-gradient-to-r ${gradeColors[gradeFilter as Exclude<GradeFilter, "all">]} bg-opacity-20`}>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {gradeEmojis[gradeFilter as Exclude<GradeFilter, "all">]} {gradeLabels[gradeFilter]}
                  </h2>
                  <p className="text-sm opacity-80">
                    {gradeDescriptions[gradeFilter as Exclude<GradeFilter, "all">]}
                  </p>
                </div>
              </div>
              
              {filteredModules.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No modules found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setGradeFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModules.map((module) => (
                    <EducationModuleCard
                      key={module.id}
                      module={module}
                      onStart={handleStartModule}
                      isCompleted={completedModules.has(module.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teacher CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Are You a Teacher?</h3>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            All modules include 2nd-person teacher scripts, learning objectives aligned with NGSS standards,
            and formative assessments. Create a classroom to track student progress!
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/teacher")}>
              <GraduationCap className="w-4 h-4 mr-2" />
              Teacher Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/join")}>
              Join Classroom
            </Button>
          </div>
        </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
