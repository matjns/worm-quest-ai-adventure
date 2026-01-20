import { motion } from "framer-motion";
import { Trophy, Star, Zap, Target, Brain, Lock, Flame, Crown, Gem, Rocket, Heart, Globe, Flag, Microscope, Dna } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  brain: Brain,
  flame: Flame,
  crown: Crown,
  gem: Gem,
  rocket: Rocket,
  heart: Heart,
  globe: Globe,
  flag: Flag,
  microscope: Microscope,
  dna: Dna,
};

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: keyof typeof icons;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AchievementBadge({
  name,
  description,
  icon,
  unlocked,
  progress,
  maxProgress,
  size = "md",
  className,
}: AchievementBadgeProps) {
  const Icon = icons[icon];
  const hasProgress = progress !== undefined && maxProgress !== undefined;
  const progressPercent = hasProgress ? (progress / maxProgress) * 100 : 0;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn("flex flex-col items-center text-center", className)}
    >
      <div className="relative">
        {/* Badge circle */}
        <div
          className={cn(
            "rounded-full flex items-center justify-center relative",
            sizeClasses[size],
            unlocked
              ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"
              : "bg-muted"
          )}
        >
          {unlocked ? (
            <Icon className={cn(iconSizes[size], "text-white")} />
          ) : (
            <Lock className={cn(iconSizes[size], "text-muted-foreground")} />
          )}

          {/* Progress ring */}
          {hasProgress && !unlocked && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={`${progressPercent * 2.83} 283`}
                className="text-primary transition-all duration-300"
              />
            </svg>
          )}
        </div>

        {/* Sparkle effect for unlocked */}
        {unlocked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <p
        className={cn(
          "mt-2 font-semibold text-sm",
          !unlocked && "text-muted-foreground"
        )}
      >
        {name}
      </p>
      
      {size !== "sm" && (
        <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">
          {description}
        </p>
      )}

      {hasProgress && !unlocked && (
        <p className="text-xs font-mono text-muted-foreground mt-1">
          {progress}/{maxProgress}
        </p>
      )}
    </motion.div>
  );
}
