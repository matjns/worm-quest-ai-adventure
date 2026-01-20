import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, Zap, Brain, Dna, Trophy, Star, Lock, CheckCircle2,
  Play, BarChart3, Settings2, Sparkles, Target, Award
} from "lucide-react";

type SkillTier = "novice" | "intermediate" | "advanced";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  tier: SkillTier;
  skills: string[];
  xpReward: number;
  duration: string;
  prerequisites: string[];
  isComplete: boolean;
  isUnlocked: boolean;
}

interface SimulationLearningPathProps {
  onSelectModule: (moduleId: string) => void;
  completedModules: string[];
}

const LEARNING_MODULES: LearningModule[] = [
  // Novice Tier - View & Analyze
  {
    id: "n1-locomotion-basics",
    title: "Worm Locomotion Fundamentals",
    description: "Observe and analyze C. elegans movement patterns in 3D. Learn sinusoidal wave propagation.",
    tier: "novice",
    skills: ["3D Visualization", "Pattern Recognition", "Biological Observation"],
    xpReward: 100,
    duration: "15 min",
    prerequisites: [],
    isComplete: false,
    isUnlocked: true,
  },
  {
    id: "n2-connectome-explorer",
    title: "Connectome Navigation",
    description: "Explore the 302-neuron network. Identify sensory, motor, and interneuron classes.",
    tier: "novice",
    skills: ["Network Analysis", "Data Visualization", "Neuroanatomy"],
    xpReward: 150,
    duration: "20 min",
    prerequisites: ["n1-locomotion-basics"],
    isComplete: false,
    isUnlocked: false,
  },
  {
    id: "n3-behavior-catalog",
    title: "Behavior Recognition",
    description: "Classify worm behaviors: forward, backward, omega turns, pharyngeal pumping.",
    tier: "novice",
    skills: ["Behavioral Analysis", "Classification", "Systems Biology"],
    xpReward: 125,
    duration: "18 min",
    prerequisites: ["n1-locomotion-basics"],
    isComplete: false,
    isUnlocked: false,
  },
  // Intermediate Tier - Manipulate
  {
    id: "i1-synaptic-weights",
    title: "Synaptic Weight Manipulation",
    description: "Adjust connection strengths between neurons. Observe emergent behavior changes.",
    tier: "intermediate",
    skills: ["Parameter Tuning", "Causal Inference", "Dynamical Systems"],
    xpReward: 250,
    duration: "25 min",
    prerequisites: ["n2-connectome-explorer", "n3-behavior-catalog"],
    isComplete: false,
    isUnlocked: false,
  },
  {
    id: "i2-ion-channels",
    title: "Ion Channel Perturbation",
    description: "Modify ion channel conductances. Simulate pharmacological interventions.",
    tier: "intermediate",
    skills: ["Electrophysiology", "Drug Discovery", "Computational Modeling"],
    xpReward: 300,
    duration: "30 min",
    prerequisites: ["i1-synaptic-weights"],
    isComplete: false,
    isUnlocked: false,
  },
  {
    id: "i3-sensory-integration",
    title: "Sensory Circuit Design",
    description: "Build sensory-to-motor pathways. Test chemotaxis and mechanosensation.",
    tier: "intermediate",
    skills: ["Circuit Design", "Signal Processing", "Sensory Biology"],
    xpReward: 275,
    duration: "28 min",
    prerequisites: ["i1-synaptic-weights"],
    isComplete: false,
    isUnlocked: false,
  },
  // Advanced Tier - Create & Optimize
  {
    id: "a1-custom-networks",
    title: "Custom Neural Network Design",
    description: "Create novel circuit architectures. Test hypotheses about minimal cognition.",
    tier: "advanced",
    skills: ["Network Architecture", "Hypothesis Testing", "Cognitive Science"],
    xpReward: 500,
    duration: "45 min",
    prerequisites: ["i2-ion-channels", "i3-sensory-integration"],
    isComplete: false,
    isUnlocked: false,
  },
  {
    id: "a2-evolutionary-optimization",
    title: "Evolutionary Algorithm Lab",
    description: "Run genetic algorithms to evolve optimal circuit configurations for target behaviors.",
    tier: "advanced",
    skills: ["Evolutionary Computation", "Optimization", "AI/ML Fundamentals"],
    xpReward: 600,
    duration: "50 min",
    prerequisites: ["a1-custom-networks"],
    isComplete: false,
    isUnlocked: false,
  },
  {
    id: "a3-rl-integration",
    title: "Reinforcement Learning Integration",
    description: "Train RL agents to control worm behavior. Compare biological vs artificial strategies.",
    tier: "advanced",
    skills: ["Reinforcement Learning", "Control Theory", "Comparative Analysis"],
    xpReward: 750,
    duration: "60 min",
    prerequisites: ["a2-evolutionary-optimization"],
    isComplete: false,
    isUnlocked: false,
  },
];

const TIER_CONFIG = {
  novice: {
    label: "Novice",
    subtitle: "View & Analyze",
    icon: Eye,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Master 3D visualization and behavioral observation",
  },
  intermediate: {
    label: "Intermediate",
    subtitle: "Manipulate & Perturb",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Modify synaptic weights and ion channels",
  },
  advanced: {
    label: "Advanced",
    subtitle: "Create & Optimize",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Design custom networks and run evolutionary algorithms",
  },
};

const CAREER_SKILLS = [
  { name: "Systems Biology", icon: Dna, modules: ["n2-connectome-explorer", "i3-sensory-integration"] },
  { name: "Data Visualization", icon: BarChart3, modules: ["n1-locomotion-basics", "n2-connectome-explorer"] },
  { name: "Machine Learning", icon: Sparkles, modules: ["a2-evolutionary-optimization", "a3-rl-integration"] },
  { name: "Computational Modeling", icon: Settings2, modules: ["i2-ion-channels", "a1-custom-networks"] },
];

export function SimulationLearningPath({ onSelectModule, completedModules }: SimulationLearningPathProps) {
  const [selectedTier, setSelectedTier] = useState<SkillTier>("novice");

  const getModuleStatus = (module: LearningModule) => {
    if (completedModules.includes(module.id)) return "complete";
    const prerequisitesMet = module.prerequisites.every(p => completedModules.includes(p));
    return prerequisitesMet ? "unlocked" : "locked";
  };

  const getTierProgress = (tier: SkillTier) => {
    const tierModules = LEARNING_MODULES.filter(m => m.tier === tier);
    const completed = tierModules.filter(m => completedModules.includes(m.id)).length;
    return (completed / tierModules.length) * 100;
  };

  const totalXP = LEARNING_MODULES
    .filter(m => completedModules.includes(m.id))
    .reduce((sum, m) => sum + m.xpReward, 0);

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Simulation Mastery Path
          </h2>
          <p className="text-muted-foreground">
            Self-directed, merit-based learning for STEM excellence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalXP.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total XP Earned</div>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(TIER_CONFIG) as SkillTier[]).map((tier) => {
          const config = TIER_CONFIG[tier];
          const Icon = config.icon;
          const progress = getTierProgress(tier);
          const isSelected = selectedTier === tier;

          return (
            <motion.div
              key={tier}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? `${config.borderColor} border-2 ${config.bgColor}` 
                    : "hover:border-border/80"
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.subtitle}</div>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Module Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTier}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {LEARNING_MODULES.filter(m => m.tier === selectedTier).map((module) => {
            const status = getModuleStatus(module);
            const config = TIER_CONFIG[module.tier];

            return (
              <Card 
                key={module.id}
                className={`relative overflow-hidden transition-all ${
                  status === "locked" ? "opacity-60" : "hover:shadow-lg"
                }`}
              >
                {status === "complete" && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {status === "locked" && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{module.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {module.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {module.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {module.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{module.skills.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {module.xpReward} XP
                      </span>
                      <span>{module.duration}</span>
                    </div>
                    <Button 
                      size="sm"
                      disabled={status === "locked"}
                      variant={status === "complete" ? "outline" : "default"}
                      onClick={() => onSelectModule(module.id)}
                    >
                      {status === "complete" ? (
                        <>Review</>
                      ) : status === "locked" ? (
                        <>Locked</>
                      ) : (
                        <><Play className="h-3 w-3 mr-1" />Start</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Career Skills Mapping */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Real-World Skills Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            LinkedIn-ready skills for bioengineers, data scientists, and computational biologists
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CAREER_SKILLS.map((skill) => {
              const Icon = skill.icon;
              const completed = skill.modules.filter(m => completedModules.includes(m)).length;
              const total = skill.modules.length;
              const progress = (completed / total) * 100;

              return (
                <div 
                  key={skill.name}
                  className="p-3 rounded-lg bg-background border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{skill.name}</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {completed}/{total} modules
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
