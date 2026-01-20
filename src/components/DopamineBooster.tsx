import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Zap, 
  Star, 
  Sparkles, 
  Trophy,
  Crown,
  Rocket,
  Target,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEngagementStore } from "@/stores/engagementStore";

interface DopamineBoosterProps {
  className?: string;
}

// Streak multiplier thresholds
const STREAK_MULTIPLIERS = [
  { days: 1, multiplier: 1, label: "1x", color: "text-muted-foreground" },
  { days: 3, multiplier: 1.5, label: "1.5x", color: "text-chart-2" },
  { days: 7, multiplier: 2, label: "2x", color: "text-chart-3" },
  { days: 14, multiplier: 2.5, label: "2.5x", color: "text-accent" },
  { days: 30, multiplier: 3, label: "3x", color: "text-primary" },
  { days: 100, multiplier: 5, label: "5x", color: "text-chart-1" },
];

export function getStreakMultiplier(streak: number): number {
  const tier = [...STREAK_MULTIPLIERS].reverse().find(t => streak >= t.days);
  return tier?.multiplier || 1;
}

export function DopamineBooster({ className }: DopamineBoosterProps) {
  const { currentStreak, longestStreak, totalXPEarned } = useEngagementStore();
  const [showBonus, setShowBonus] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  
  const multiplier = getStreakMultiplier(currentStreak);
  const currentTier = [...STREAK_MULTIPLIERS].reverse().find(t => currentStreak >= t.days) || STREAK_MULTIPLIERS[0];
  const nextTier = STREAK_MULTIPLIERS.find(t => t.days > currentStreak);
  const daysToNext = nextTier ? nextTier.days - currentStreak : 0;

  // Trigger bonus animation
  const triggerBonus = useCallback((amount: number) => {
    setBonusAmount(amount);
    setShowBonus(true);
    setTimeout(() => setShowBonus(false), 2000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden rounded-lg border-2 border-foreground",
        "bg-gradient-to-br from-card to-muted",
        "shadow-[4px_4px_0px_hsl(var(--foreground))]",
        className
      )}
    >
      {/* Animated background glow for high streaks */}
      {currentStreak >= 7 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 100%" }}
        />
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Flame className={cn("w-6 h-6", currentTier.color, currentStreak >= 3 && "animate-pulse")} />
              {currentStreak >= 7 && (
                <Sparkles className="w-3 h-3 text-accent absolute -top-1 -right-1 animate-spin" style={{ animationDuration: "3s" }} />
              )}
            </div>
            <div>
              <p className="font-arcade text-xs uppercase tracking-wider text-muted-foreground">
                Streak Bonus
              </p>
              <p className={cn("text-2xl font-black", currentTier.color)}>
                {currentTier.label}
              </p>
            </div>
          </div>

          {/* Streak counter */}
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
        </div>

        {/* Multiplier progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress to {nextTier?.label || "MAX"}</span>
            {nextTier && (
              <span className={cn("font-medium", currentTier.color)}>
                {daysToNext} days left
              </span>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                currentStreak >= 30 ? "bg-primary" : 
                currentStreak >= 14 ? "bg-accent" :
                currentStreak >= 7 ? "bg-chart-3" :
                currentStreak >= 3 ? "bg-chart-2" : "bg-muted-foreground"
              )}
              initial={{ width: 0 }}
              animate={{ 
                width: nextTier 
                  ? `${((currentStreak - (currentTier?.days || 0)) / (nextTier.days - (currentTier?.days || 0))) * 100}%`
                  : "100%"
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Tier badges */}
        <div className="flex justify-between mb-4">
          {STREAK_MULTIPLIERS.slice(0, 5).map((tier, i) => (
            <div
              key={tier.days}
              className={cn(
                "flex flex-col items-center p-1.5 rounded-lg transition-all",
                currentStreak >= tier.days 
                  ? "bg-muted border border-border" 
                  : "opacity-40"
              )}
            >
              <div className={cn(
                "p-1 rounded",
                currentStreak >= tier.days ? tier.color.replace("text-", "bg-") + "/20" : "bg-muted"
              )}>
                {i === 0 && <Star className={cn("w-3 h-3", tier.color)} />}
                {i === 1 && <Zap className={cn("w-3 h-3", tier.color)} />}
                {i === 2 && <Trophy className={cn("w-3 h-3", tier.color)} />}
                {i === 3 && <Crown className={cn("w-3 h-3", tier.color)} />}
                {i === 4 && <Rocket className={cn("w-3 h-3", tier.color)} />}
              </div>
              <span className="text-[10px] font-bold mt-1">{tier.label}</span>
              <span className="text-[8px] text-muted-foreground">{tier.days}d</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
          <div className="text-center">
            <p className="text-sm font-bold text-primary tabular-nums">
              {Math.round(totalXPEarned * multiplier).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">Boosted XP</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold tabular-nums">{longestStreak}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Best Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Gift className="w-3 h-3 text-accent" />
              <p className="text-sm font-bold text-accent">
                {currentStreak >= 7 ? "Unlocked" : "7 days"}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase">Daily Gift</p>
          </div>
        </div>
      </div>

      {/* Bonus popup animation */}
      <AnimatePresence>
        {showBonus && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-arcade text-lg shadow-lg">
              +{bonusAmount} XP BONUS!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Hook to apply streak multiplier to XP gains
export function useStreakMultiplier() {
  const { currentStreak } = useEngagementStore();
  
  const applyMultiplier = useCallback((baseXP: number): number => {
    const multiplier = getStreakMultiplier(currentStreak);
    return Math.round(baseXP * multiplier);
  }, [currentStreak]);

  return { applyMultiplier, multiplier: getStreakMultiplier(currentStreak), streak: currentStreak };
}
