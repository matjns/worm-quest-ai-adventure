import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  Zap,
  Target,
  Brain,
  Flame,
  Crown,
  Gem,
  Rocket,
  Heart,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRaceAchievements, RACE_BADGES } from "@/hooks/useRaceAchievements";
import { useEngagementStore, Badge } from "@/stores/engagementStore";

const iconMap = {
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
};

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-amber-600",
};

const rarityBgColors = {
  common: "bg-slate-500/20 border-slate-500/30",
  rare: "bg-blue-500/20 border-blue-500/30",
  epic: "bg-purple-500/20 border-purple-500/30",
  legendary: "bg-amber-500/20 border-amber-500/30",
};

const rarityTextColors = {
  common: "text-slate-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
};

interface RaceBadgeCardProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
}

function RaceBadgeCard({ badge, size = "md" }: RaceBadgeCardProps) {
  const Icon = iconMap[badge.icon] || Trophy;
  const isUnlocked = !!badge.unlockedAt;
  const hasProgress = badge.maxProgress && badge.maxProgress > 0;
  const progressPercent = hasProgress
    ? ((badge.progress || 0) / badge.maxProgress!) * 100
    : 0;

  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-xl border transition-all",
        sizeClasses[size],
        isUnlocked
          ? rarityBgColors[badge.rarity]
          : "bg-muted/30 border-border/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "rounded-lg p-2 relative",
            isUnlocked
              ? `bg-gradient-to-br ${rarityColors[badge.rarity]}`
              : "bg-muted"
          )}
        >
          {isUnlocked ? (
            <Icon className={cn(iconSizes[size], "text-white")} />
          ) : (
            <Lock
              className={cn(iconSizes[size], "text-muted-foreground")}
            />
          )}

          {/* Glow effect for legendary */}
          {isUnlocked && badge.rarity === "legendary" && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-400/50 to-amber-600/50"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                "font-semibold text-sm truncate",
                isUnlocked ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {badge.name}
            </h4>
            <UIBadge
              variant="outline"
              className={cn(
                "text-[10px] capitalize",
                rarityTextColors[badge.rarity]
              )}
            >
              {badge.rarity}
            </UIBadge>
          </div>

          <p
            className={cn(
              "text-xs mt-0.5 line-clamp-2",
              isUnlocked ? "text-muted-foreground" : "text-muted-foreground/60"
            )}
          >
            {badge.description}
          </p>

          {/* Progress bar */}
          {hasProgress && !isUnlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {badge.progress || 0}/{badge.maxProgress}
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Unlocked date */}
          {isUnlocked && badge.unlockedAt && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Unlocked{" "}
              {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface RaceAchievementsProps {
  className?: string;
  showStats?: boolean;
}

export function RaceAchievements({
  className,
  showStats = true,
}: RaceAchievementsProps) {
  const { getRaceStats } = useRaceAchievements();
  const { badges } = useEngagementStore();
  const stats = getRaceStats();

  // Get race badges from the store (merged with definitions for unlocked status)
  const raceBadgeIds = RACE_BADGES.map((b) => b.id);
  const raceBadges = badges.filter((b) => raceBadgeIds.includes(b.id));

  // If no race badges in store yet, use definitions
  const displayBadges =
    raceBadges.length > 0
      ? raceBadges
      : RACE_BADGES.map((b) => ({ ...b, unlockedAt: undefined }));

  // Categorize badges
  const victoryBadges = displayBadges.filter(
    (b) =>
      b.id.includes("victory") ||
      b.id.includes("crown") ||
      b.id.includes("champion") ||
      b.id.includes("legendary")
  );
  const speedBadges = displayBadges.filter(
    (b) => b.id.includes("speed") || b.id.includes("lightning")
  );
  const participationBadges = displayBadges.filter(
    (b) =>
      b.id.includes("rookie") ||
      b.id.includes("regular") ||
      b.id.includes("veteran")
  );
  const specialBadges = displayBadges.filter(
    (b) =>
      !victoryBadges.includes(b) &&
      !speedBadges.includes(b) &&
      !participationBadges.includes(b)
  );

  const unlockedCount = displayBadges.filter((b) => b.unlockedAt).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {stats.totalWins}
              </p>
              <p className="text-xs text-muted-foreground">Total Wins</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {stats.totalRaces}
              </p>
              <p className="text-xs text-muted-foreground">Races</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <Flame className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {stats.bestWinStreak}
              </p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {unlockedCount}/{displayBadges.length}
              </p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badges by Category */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            Race Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-5 w-full mb-4">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="victory" className="text-xs">
                Victory
              </TabsTrigger>
              <TabsTrigger value="speed" className="text-xs">
                Speed
              </TabsTrigger>
              <TabsTrigger value="participation" className="text-xs">
                Races
              </TabsTrigger>
              <TabsTrigger value="special" className="text-xs">
                Special
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <AnimatePresence>
                  {displayBadges
                    .sort((a, b) => {
                      // Unlocked first, then by rarity
                      if (a.unlockedAt && !b.unlockedAt) return -1;
                      if (!a.unlockedAt && b.unlockedAt) return 1;
                      const rarityOrder = {
                        legendary: 0,
                        epic: 1,
                        rare: 2,
                        common: 3,
                      };
                      return (
                        rarityOrder[a.rarity] - rarityOrder[b.rarity]
                      );
                    })
                    .map((badge) => (
                      <RaceBadgeCard key={badge.id} badge={badge} />
                    ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="victory" className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {victoryBadges.map((badge) => (
                  <RaceBadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="speed" className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {speedBadges.map((badge) => (
                  <RaceBadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="participation" className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {participationBadges.map((badge) => (
                  <RaceBadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="special" className="mt-0">
              <div className="grid gap-3 sm:grid-cols-2">
                {specialBadges.map((badge) => (
                  <RaceBadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
