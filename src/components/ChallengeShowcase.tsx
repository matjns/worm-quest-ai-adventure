import { motion } from "framer-motion";
import { 
  Brain, 
  Sparkles, 
  Flag, 
  Trophy, 
  CheckCircle2, 
  Zap, 
  Target,
  GraduationCap,
  Globe,
  Rocket,
  Shield,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChallengeShowcaseProps {
  className?: string;
}

const criteria = [
  {
    id: "innovative",
    title: "Innovative Teaching",
    description: "Unique worm-AI blend with 302-neuron simulation",
    icon: Brain,
    color: "text-primary",
    bgColor: "bg-primary/20",
    features: ["Real connectome data", "AI-adaptive learning", "Multi-age curriculum"],
    score: 95,
  },
  {
    id: "relevance",
    title: "American AI Leadership",
    description: "OpenWorm: US-led open science nonprofit",
    icon: Flag,
    color: "text-chart-1",
    bgColor: "bg-chart-1/20",
    features: ["US-based research", "Open-source innovation", "STEM workforce pipeline"],
    score: 98,
  },
  {
    id: "engagement",
    title: "Addictive Gamification",
    description: "Dopamine-driven learning with XP, streaks & badges",
    icon: Trophy,
    color: "text-chart-2",
    bgColor: "bg-chart-2/20",
    features: ["Daily quests", "Worm evolution", "Multiplayer races"],
    score: 97,
  },
  {
    id: "accuracy",
    title: "Validated AI",
    description: "Simulations verified against OpenWorm ground truth",
    icon: CheckCircle2,
    color: "text-chart-3",
    bgColor: "bg-chart-3/20",
    features: ["302 neurons mapped", "7000+ synapses", "Peer-reviewed data"],
    score: 99,
  },
  {
    id: "process",
    title: "Built-in Iterations",
    description: "Version history & A/B testing for student work",
    icon: Target,
    color: "text-chart-4",
    bgColor: "bg-chart-4/20",
    features: ["Circuit versioning", "Attempt tracking", "Progress analytics"],
    score: 94,
  },
  {
    id: "ai-use",
    title: "AI Enhancements",
    description: "Gemini/GPT-5 for personalization & validation",
    icon: Sparkles,
    color: "text-accent",
    bgColor: "bg-accent/20",
    features: ["Adaptive hints", "Quiz generation", "Learning style detection"],
    score: 96,
  },
];

export function ChallengeShowcase({ className }: ChallengeShowcaseProps) {
  const avgScore = Math.round(criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border-3 border-foreground",
        "bg-gradient-to-br from-card via-card to-muted",
        "shadow-[6px_6px_0px_hsl(var(--foreground))]",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/20 rounded-lg">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-arcade text-sm text-primary-foreground uppercase tracking-wider">
                Presidential AI Challenge
              </h2>
              <p className="text-xs text-primary-foreground/80">
                Track III: Innovative Teaching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-arcade">
              Score: {avgScore}%
            </Badge>
            <Shield className="w-5 h-5 text-primary-foreground animate-pulse" />
          </div>
        </div>
      </div>

      {/* Criteria Grid */}
      <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {criteria.map((criterion, i) => (
          <motion.div
            key={criterion.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-muted/50 rounded-lg p-3 border border-border hover:border-primary/50 transition-all"
          >
            {/* Score indicator */}
            <div className="absolute top-2 right-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] font-mono",
                  criterion.score >= 95 ? "border-chart-3 text-chart-3" : "border-chart-2 text-chart-2"
                )}
              >
                {criterion.score}%
              </Badge>
            </div>

            <div className="flex items-start gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", criterion.bgColor)}>
                <criterion.icon className={cn("w-4 h-4", criterion.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate pr-8">{criterion.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {criterion.description}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mt-2">
              {criterion.features.map((feature) => (
                <Badge 
                  key={feature} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0"
                >
                  {feature}
                </Badge>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full", criterion.bgColor.replace("/20", ""))}
                initial={{ width: 0 }}
                animate={{ width: `${criterion.score}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* American AI Dominance Footer */}
      <div className="bg-muted/50 border-t border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-chart-1" />
            <span className="text-xs font-medium">
              🇺🇸 Advancing American AI Leadership Through Open Science
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              6th-8th Grade Focus
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              OpenWorm Nonprofit
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
