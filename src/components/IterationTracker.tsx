import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitBranch, 
  GitCommit, 
  Clock, 
  ArrowRight, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLearningStore, type AttemptRecord } from "@/stores/learningStore";
import { formatDistanceToNow } from "date-fns";

interface IterationTrackerProps {
  missionId?: number;
  className?: string;
}

export function IterationTracker({ missionId, className }: IterationTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { attemptHistory, profile } = useLearningStore();
  
  // Filter attempts for specific mission or show all recent
  const relevantAttempts = missionId 
    ? attemptHistory.filter(a => a.missionId === missionId).slice(-10)
    : attemptHistory.slice(-10);

  const successfulAttempts = relevantAttempts.filter(a => a.success);
  const failedAttempts = relevantAttempts.filter(a => !a.success);
  const successRate = relevantAttempts.length > 0 
    ? Math.round((successfulAttempts.length / relevantAttempts.length) * 100) 
    : 0;

  // Calculate improvement trend
  const recentAttempts = relevantAttempts.slice(-5);
  const olderAttempts = relevantAttempts.slice(-10, -5);
  const recentSuccessRate = recentAttempts.length > 0 
    ? recentAttempts.filter(a => a.success).length / recentAttempts.length 
    : 0;
  const olderSuccessRate = olderAttempts.length > 0 
    ? olderAttempts.filter(a => a.success).length / olderAttempts.length 
    : 0;
  const trend = recentSuccessRate - olderSuccessRate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card border-2 border-foreground rounded-lg overflow-hidden",
        "shadow-[4px_4px_0px_hsl(var(--foreground))]",
        className
      )}
    >
      {/* Header */}
      <div className="bg-muted/50 p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Iteration History
            </span>
            <Badge variant="outline" className="text-xs">
              {relevantAttempts.length} attempts
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-chart-3">{successfulAttempts.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Successes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-destructive">{failedAttempts.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Attempts</p>
        </div>
        <div className="text-center">
          <p className={cn(
            "text-lg font-bold",
            successRate >= 70 ? "text-chart-3" : successRate >= 40 ? "text-chart-2" : "text-destructive"
          )}>
            {successRate}%
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Success Rate</p>
        </div>
        <div className="text-center">
          <p className={cn(
            "text-lg font-bold flex items-center justify-center gap-0.5",
            trend > 0 ? "text-chart-3" : trend < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}
            {Math.abs(Math.round(trend * 100))}%
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Trend</p>
        </div>
      </div>

      {/* Attempt Timeline */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 max-h-60 overflow-y-auto space-y-2">
              {relevantAttempts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No attempts yet. Start a mission!</p>
                </div>
              ) : (
                relevantAttempts.map((attempt, i) => (
                  <AttemptItem 
                    key={`${attempt.missionId}-${attempt.timestamp}`} 
                    attempt={attempt} 
                    index={i}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills Summary */}
      <div className="bg-muted/30 p-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="text-xs font-medium uppercase tracking-wide">Skill Levels</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(profile.skills).slice(0, 3).map(([skill, level]) => (
            <div key={skill} className="flex items-center gap-1">
              <div 
                className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden"
                title={`${skill}: ${Math.round((level as number))}%`}
              >
                <div 
                  className={cn(
                    "h-full rounded-full",
                    (level as number) >= 70 ? "bg-chart-3" : (level as number) >= 40 ? "bg-chart-2" : "bg-primary"
                  )}
                  style={{ width: `${level as number}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground capitalize truncate w-16">
                {skill.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface AttemptItemProps {
  attempt: AttemptRecord;
  index: number;
}

function AttemptItem({ attempt, index }: AttemptItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg",
        attempt.success ? "bg-chart-3/10" : "bg-destructive/10"
      )}
    >
      <div className="flex items-center gap-2">
        <GitCommit className="w-3 h-3 text-muted-foreground" />
        {attempt.success ? (
          <CheckCircle2 className="w-4 h-4 text-chart-3" />
        ) : (
          <XCircle className="w-4 h-4 text-destructive" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Mission {attempt.missionId}</span>
          <Badge variant="outline" className="text-[10px] px-1">
            {attempt.neuronsPlaced} neurons
          </Badge>
          {attempt.hintsUsed > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1">
              {attempt.hintsUsed} hints
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(attempt.timestamp, { addSuffix: true })}
          <span className="mx-1">•</span>
          {attempt.timeSpentSeconds}s
        </p>
      </div>

      {attempt.success && (
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-accent" />
          <span className="text-xs font-bold text-accent">+XP</span>
        </div>
      )}
    </motion.div>
  );
}
