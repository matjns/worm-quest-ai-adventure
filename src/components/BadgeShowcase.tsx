import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  useEngagementStore, 
  Badge as BadgeType,
  getBadgesByCategory,
  getUnlockedBadges,
  getRarityColor
} from "@/stores/engagementStore";
import { motion } from "framer-motion";
import { 
  Award, 
  Brain, 
  Zap, 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Crown, 
  Gem, 
  Rocket, 
  Heart,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BadgeShowcaseProps {
  className?: string;
  showAll?: boolean;
}

const BADGE_ICONS = {
  brain: Brain,
  zap: Zap,
  trophy: Trophy,
  star: Star,
  target: Target,
  flame: Flame,
  crown: Crown,
  gem: Gem,
  rocket: Rocket,
  heart: Heart,
};

const RARITY_COLORS = {
  common: "from-gray-400/20 to-gray-500/20 border-gray-500/50",
  rare: "from-blue-400/20 to-blue-500/20 border-blue-500/50",
  epic: "from-purple-400/20 to-purple-500/20 border-purple-500/50",
  legendary: "from-amber-400/20 to-amber-500/20 border-amber-500/50 ring-2 ring-amber-500/30",
};

const CATEGORY_LABELS = {
  skill: "Skill Badges",
  dedication: "Dedication",
  social: "Social",
  achievement: "Achievements",
  special: "Special",
};

export function BadgeShowcase({ className, showAll = false }: BadgeShowcaseProps) {
  const { badges } = useEngagementStore();
  const [selectedCategory, setSelectedCategory] = useState<BadgeType["category"] | "all">("all");
  
  const unlockedBadges = getUnlockedBadges(badges);
  const displayBadges = selectedCategory === "all" 
    ? badges 
    : getBadgesByCategory(badges, selectedCategory);
  
  // Sort: unlocked first, then by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sortedBadges = [...displayBadges].sort((a, b) => {
    if (a.unlockedAt && !b.unlockedAt) return -1;
    if (!a.unlockedAt && b.unlockedAt) return 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });
  
  const recentUnlocks = unlockedBadges
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);
  
  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badge Collection
          </CardTitle>
          <Badge variant="outline">
            {unlockedBadges.length}/{badges.length} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filters */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          <Badge 
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer shrink-0"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Badge>
          {(Object.keys(CATEGORY_LABELS) as BadgeType["category"][]).map((cat) => (
            <Badge 
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer shrink-0"
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </Badge>
          ))}
        </div>
        
        {/* Recent Unlocks */}
        {recentUnlocks.length > 0 && selectedCategory === "all" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Recently Unlocked</p>
            <div className="flex gap-2">
              {recentUnlocks.map((badge) => {
                const Icon = BADGE_ICONS[badge.icon];
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "p-2 rounded-lg bg-gradient-to-br border",
                      RARITY_COLORS[badge.rarity]
                    )}
                    title={`${badge.name}: ${badge.description}`}
                  >
                    <Icon className={cn("w-6 h-6", getRarityColor(badge.rarity))} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Badge Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {(showAll ? sortedBadges : sortedBadges.slice(0, 12)).map((badge, index) => {
            const Icon = BADGE_ICONS[badge.icon];
            const isUnlocked = !!badge.unlockedAt;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 border transition-all",
                  isUnlocked 
                    ? cn("bg-gradient-to-br cursor-pointer hover:scale-105", RARITY_COLORS[badge.rarity])
                    : "bg-muted/30 border-border/30"
                )}
                title={`${badge.name}: ${badge.description}`}
              >
                {isUnlocked ? (
                  <Icon className={cn("w-6 h-6", getRarityColor(badge.rarity))} />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground/50" />
                )}
                
                {/* Progress indicator for trackable badges */}
                {!isUnlocked && badge.maxProgress && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <Progress 
                      value={((badge.progress || 0) / badge.maxProgress) * 100} 
                      className="h-1" 
                    />
                  </div>
                )}
                
                {/* Rarity indicator */}
                <div className={cn(
                  "absolute top-1 right-1 w-2 h-2 rounded-full",
                  badge.rarity === "legendary" && "bg-amber-400",
                  badge.rarity === "epic" && "bg-purple-400",
                  badge.rarity === "rare" && "bg-blue-400",
                  badge.rarity === "common" && "bg-gray-400",
                  !isUnlocked && "opacity-30"
                )} />
              </motion.div>
            );
          })}
        </div>
        
        {/* Show More */}
        {!showAll && sortedBadges.length > 12 && (
          <p className="text-xs text-center text-muted-foreground">
            +{sortedBadges.length - 12} more badges
          </p>
        )}
        
        {/* Rarity Legend */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" /> Common
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-400" /> Rare
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400" /> Epic
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" /> Legendary
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
