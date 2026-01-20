import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Target, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EducationModule } from "@/data/educationModules";

interface EducationModuleCardProps {
  module: EducationModule;
  onStart: (moduleId: string) => void;
  isCompleted?: boolean;
  className?: string;
}

const gradeLevelColors = {
  prek: "from-pink-500 to-orange-400",
  k5: "from-primary to-cyan-400",
  middle: "from-purple-500 to-pink-400",
  high: "from-indigo-500 to-purple-400",
  public: "from-foreground to-muted-foreground",
};

const gradeLevelEmoji = {
  prek: "🐛",
  k5: "🧠",
  middle: "🔬",
  high: "💻",
  public: "🌐",
};

export function EducationModuleCard({
  module,
  onStart,
  isCompleted = false,
  className,
}: EducationModuleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-border bg-card",
        "shadow-[4px_4px_0px_hsl(var(--foreground))]",
        "transition-shadow hover:shadow-[6px_6px_0px_hsl(var(--foreground))]",
        isCompleted && "border-green-500/50",
        className
      )}
    >
      {/* Gradient header */}
      <div
        className={cn(
          "h-24 bg-gradient-to-r flex items-center justify-center",
          gradeLevelColors[module.gradeLevel]
        )}
      >
        <span className="text-4xl">{gradeLevelEmoji[module.gradeLevel]}</span>
        {isCompleted && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">
            ✓ Completed
          </Badge>
        )}
      </div>

      <div className="p-5">
        {/* Title & subtitle */}
        <h3 className="text-xl font-bold mb-1">{module.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{module.subtitle}</p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {module.duration}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {module.objectives.length} objectives
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {module.steps.length} steps
          </div>
        </div>

        {/* Vocabulary preview */}
        {module.vocabulary.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {module.vocabulary.slice(0, 3).map((v) => (
              <Badge key={v.term} variant="secondary" className="text-xs">
                {v.emoji} {v.term}
              </Badge>
            ))}
            {module.vocabulary.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{module.vocabulary.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Objectives preview */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Learning Objectives:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {module.objectives.slice(0, 2).map((obj) => (
              <li key={obj.id} className="flex items-start gap-1">
                <span className="text-primary">•</span>
                <span className="line-clamp-1">{obj.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Start button */}
        <Button
          onClick={() => onStart(module.id)}
          className="w-full group"
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? "Review Module" : "Start Module"}
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </motion.div>
  );
}
