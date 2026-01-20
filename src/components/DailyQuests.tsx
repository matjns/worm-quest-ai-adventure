import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEngagementStore, DailyQuest } from "@/stores/engagementStore";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Brain, 
  Link, 
  Flame,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyQuestsProps {
  className?: string;
  compact?: boolean;
}

const QUEST_ICONS = {
  missions: Target,
  neurons: Brain,
  connections: Link,
  time: Clock,
  streak: Flame,
};

export function DailyQuests({ className, compact = false }: DailyQuestsProps) {
  const { dailyQuests, refreshDailyQuests, startSession } = useEngagementStore();
  
  useEffect(() => {
    startSession();
  }, [startSession]);
  
  const completedCount = dailyQuests.filter(q => q.completed).length;
  const totalXPAvailable = dailyQuests.reduce((sum, q) => sum + q.xpReward, 0);
  const earnedXP = dailyQuests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0);
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (dailyQuests.length === 0) return "0h";
    const expiresAt = dailyQuests[0].expiresAt;
    const remaining = expiresAt - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  if (compact) {
    return (
      <div className={cn("p-3 bg-card/80 rounded-lg border border-border/50", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Daily Quests</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {completedCount}/{dailyQuests.length}
          </Badge>
        </div>
        <div className="flex gap-1">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={cn(
                "flex-1 h-2 rounded-full",
                quest.completed ? "bg-green-500" : "bg-secondary"
              )}
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Daily Quests
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Resets in {getTimeRemaining()}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">Progress: {completedCount}/{dailyQuests.length}</span>
          <span className="text-primary font-medium">
            <Zap className="w-3 h-3 inline mr-1" />
            {earnedXP}/{totalXPAvailable} XP
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dailyQuests.map((quest, index) => {
          const Icon = QUEST_ICONS[quest.type];
          const progressPercent = (quest.progress / quest.target) * 100;
          
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 rounded-lg border transition-all",
                quest.completed 
                  ? "bg-green-500/10 border-green-500/50" 
                  : "bg-secondary/30 border-border/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  quest.completed ? "bg-green-500/20" : "bg-primary/10"
                )}>
                  {quest.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Icon className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "font-medium text-sm",
                      quest.completed && "line-through text-muted-foreground"
                    )}>
                      {quest.title}
                    </h4>
                    <Badge 
                      variant={quest.completed ? "default" : "secondary"} 
                      className="text-xs ml-2"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {quest.xpReward} XP
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {quest.description}
                  </p>
                  
                  {!quest.completed && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {quest.progress}/{quest.target}
                        </span>
                        <span className="text-primary">{Math.round(progressPercent)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Bonus Reward for completing all */}
        {completedCount === dailyQuests.length && dailyQuests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/50 text-center"
          >
            <Gift className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-bold text-primary">All Quests Complete! 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">
              Come back tomorrow for new challenges!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
