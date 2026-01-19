import { Trophy, Star, Zap, Target, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "star" | "zap" | "target" | "brain";
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface ProgressTrackerProps {
  level: number;
  xp: number;
  xpToNext: number;
  totalPoints: number;
  achievements: Achievement[];
  className?: string;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  brain: Brain,
};

export function ProgressTracker({
  level,
  xp,
  xpToNext,
  totalPoints,
  achievements,
  className,
}: ProgressTrackerProps) {
  const xpProgress = (xp / xpToNext) * 100;

  return (
    <div className={cn("bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))]", className)}>
      {/* Level & XP */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--foreground))]">
            <span className="text-xl font-bold text-primary-foreground">{level}</span>
          </div>
          <div>
            <p className="text-sm font-mono text-muted-foreground">LEVEL</p>
            <p className="font-bold uppercase">Neuron Novice</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-muted-foreground">TOTAL POINTS</p>
          <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-mono text-muted-foreground">XP</span>
          <span className="font-mono">{xp} / {xpToNext}</span>
        </div>
        <div className="h-4 bg-muted border-2 border-foreground overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="font-bold uppercase text-sm mb-3 tracking-tight">Recent Achievements</h4>
        <div className="grid grid-cols-2 gap-2">
          {achievements.slice(0, 4).map((achievement) => {
            const Icon = iconMap[achievement.icon];
            return (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-2 p-2 border-2 border-foreground transition-all",
                  achievement.unlocked
                    ? "bg-accent/10 shadow-[2px_2px_0px_hsl(var(--accent))]"
                    : "bg-muted/50 opacity-60"
                )}
              >
                <Icon className={cn("w-5 h-5", achievement.unlocked ? "text-accent" : "text-muted-foreground")} />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold uppercase truncate">{achievement.name}</p>
                  {achievement.progress !== undefined && (
                    <p className="text-xs font-mono text-muted-foreground">
                      {achievement.progress}/{achievement.maxProgress}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}