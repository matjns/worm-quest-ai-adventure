import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLearningStore, AttemptRecord } from "@/stores/learningStore";
import {
  TrendingUp,
  TrendingDown,
  GitBranch,
  Lightbulb,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface IterationFeedbackProps {
  missionId: number;
  onApplySuggestion?: (suggestion: string) => void;
  className?: string;
}

interface BifurcationSuggestion {
  id: string;
  type: "add_neuron" | "change_connection" | "try_pathway" | "optimize";
  title: string;
  description: string;
  expectedImprovement: number;
  difficulty: "easy" | "medium" | "hard";
}

export function IterationFeedback({ missionId, onApplySuggestion, className }: IterationFeedbackProps) {
  const { attemptHistory, profile } = useLearningStore();
  const [suggestions, setSuggestions] = useState<BifurcationSuggestion[]>([]);
  const [showingSuggestions, setShowingSuggestions] = useState(false);

  // Get attempts for this mission
  const missionAttempts = attemptHistory.filter((a) => a.missionId === missionId);
  const recentAttempts = missionAttempts.slice(-5);

  // Calculate trends
  const calculateTrend = useCallback((attempts: AttemptRecord[], field: keyof AttemptRecord) => {
    if (attempts.length < 2) return 0;
    const recent = attempts.slice(-3);
    const older = attempts.slice(0, -3);
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((a, b) => a + Number(b[field]), 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + Number(b[field]), 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }, []);

  const timeTrend = calculateTrend(recentAttempts, "timeSpentSeconds");
  const errorTrend = calculateTrend(recentAttempts, "errorsBeforeSuccess");

  // Generate AI bifurcation suggestions based on attempt patterns
  useEffect(() => {
    if (missionAttempts.length < 2) return;

    const newSuggestions: BifurcationSuggestion[] = [];
    const lastAttempt = missionAttempts[missionAttempts.length - 1];
    const successRate = missionAttempts.filter((a) => a.success).length / missionAttempts.length;

    // Analyze patterns and suggest improvements
    if (!lastAttempt.success) {
      if (lastAttempt.neuronsPlaced < 3) {
        newSuggestions.push({
          id: "add_neurons",
          type: "add_neuron",
          title: "Add Command Interneurons",
          description: "Your circuit needs intermediary neurons. Try adding AVA or AVB to process sensory signals.",
          expectedImprovement: 30,
          difficulty: "easy",
        });
      }

      if (lastAttempt.connectionsCreated < lastAttempt.neuronsPlaced) {
        newSuggestions.push({
          id: "add_connections",
          type: "change_connection",
          title: "Complete the Pathway",
          description: "Some neurons aren't connected. Ensure signal can flow from sensory → interneuron → motor.",
          expectedImprovement: 25,
          difficulty: "medium",
        });
      }
    }

    if (successRate < 0.5 && missionAttempts.length > 3) {
      newSuggestions.push({
        id: "try_pathway",
        type: "try_pathway",
        title: "Try Canonical Pathway",
        description: "Based on your attempts, try the reference pathway: ALM → AVD → AVA → DA1",
        expectedImprovement: 40,
        difficulty: "medium",
      });
    }

    if (profile.learningStyle.prefersTrial > 0.7) {
      newSuggestions.push({
        id: "systematic",
        type: "optimize",
        title: "Systematic Approach",
        description: "You learn by trial-and-error. Try building one connection at a time and testing each step.",
        expectedImprovement: 20,
        difficulty: "easy",
      });
    }

    if (lastAttempt.hintsUsed === 0 && !lastAttempt.success) {
      newSuggestions.push({
        id: "use_hints",
        type: "optimize",
        title: "Strategic Hint Usage",
        description: "Hints can accelerate learning. Using 1-2 targeted hints often leads to better understanding.",
        expectedImprovement: 15,
        difficulty: "easy",
      });
    }

    setSuggestions(newSuggestions.slice(0, 3));
  }, [missionAttempts, profile.learningStyle]);

  if (missionAttempts.length === 0) {
    return null;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Iteration Tracking
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {missionAttempts.length} attempts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Success Rate</span>
              {missionAttempts.filter((a) => a.success).length / missionAttempts.length > 0.5 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-amber-500" />
              )}
            </div>
            <p className="text-lg font-bold">
              {((missionAttempts.filter((a) => a.success).length / missionAttempts.length) * 100).toFixed(0)}%
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Avg Time</span>
              <Clock className="w-3 h-3 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold">
              {(missionAttempts.reduce((a, b) => a + b.timeSpentSeconds, 0) / missionAttempts.length).toFixed(0)}s
            </p>
          </div>
        </div>

        {/* Trend indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time Trend</span>
            <span className={cn(
              "font-medium",
              timeTrend < 0 ? "text-green-500" : "text-amber-500"
            )}>
              {timeTrend > 0 ? "+" : ""}{timeTrend.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Error Trend</span>
            <span className={cn(
              "font-medium",
              errorTrend < 0 ? "text-green-500" : "text-amber-500"
            )}>
              {errorTrend > 0 ? "+" : ""}{errorTrend.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* AI Bifurcation Suggestions */}
        {suggestions.length > 0 && (
          <div className="pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowingSuggestions(!showingSuggestions)}
              className="w-full justify-between mb-2"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                AI Suggestions ({suggestions.length})
              </span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                showingSuggestions && "rotate-90"
              )} />
            </Button>

            <AnimatePresence>
              {showingSuggestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="bg-primary/5 rounded-lg p-3 border border-primary/10"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-medium">{suggestion.title}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            suggestion.difficulty === "easy" && "border-green-500 text-green-600",
                            suggestion.difficulty === "medium" && "border-amber-500 text-amber-600",
                            suggestion.difficulty === "hard" && "border-red-500 text-red-600"
                          )}
                        >
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Target className="w-3 h-3" />
                          <span>+{suggestion.expectedImprovement}% expected</span>
                        </div>
                        {onApplySuggestion && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onApplySuggestion(suggestion.description)}
                            className="h-6 text-xs"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Apply
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Recent attempts mini-timeline */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Recent Attempts</p>
          <div className="flex gap-1">
            {recentAttempts.map((attempt, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  attempt.success ? "bg-green-500" : "bg-red-500"
                )}
                title={`Attempt ${idx + 1}: ${attempt.success ? "Success" : "Failed"} (${attempt.timeSpentSeconds}s)`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
