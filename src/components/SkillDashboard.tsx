import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLearningStore, getSkillLabel, getRecommendation } from "@/stores/learningStore";
import { Brain, Zap, Activity, Target, Clock, TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillDashboardProps {
  className?: string;
  compact?: boolean;
}

const SKILL_ICONS = {
  motorControl: Zap,
  sensoryProcessing: Activity,
  integration: Brain,
  efficiency: Target,
  speed: Clock,
};

const SKILL_COLORS = {
  motorControl: "from-yellow-500 to-amber-500",
  sensoryProcessing: "from-cyan-500 to-blue-500",
  integration: "from-purple-500 to-pink-500",
  efficiency: "from-green-500 to-emerald-500",
  speed: "from-orange-500 to-red-500",
};

export function SkillDashboard({ className, compact = false }: SkillDashboardProps) {
  const { profile, analyzeWeaknesses, generateLearningPath, calculateOptimalDifficulty } = useLearningStore();
  
  const weaknesses = useMemo(() => analyzeWeaknesses(), [analyzeWeaknesses]);
  const learningPath = useMemo(() => generateLearningPath(), [generateLearningPath]);
  const optimalDifficulty = useMemo(() => calculateOptimalDifficulty(), [calculateOptimalDifficulty]);
  const recommendation = useMemo(() => getRecommendation(profile), [profile]);

  const skillEntries = Object.entries(profile.skills) as [keyof typeof profile.skills, number][];

  if (compact) {
    return (
      <Card className={cn("bg-card/80 backdrop-blur-sm border-border/50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Skill Level</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {Math.round(Object.values(profile.skills).reduce((a, b) => a + b, 0) / 5)}%
            </Badge>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {skillEntries.map(([skill, score]) => {
              const Icon = SKILL_ICONS[skill];
              return (
                <div key={skill} className="flex flex-col items-center gap-1">
                  <Icon className={cn("w-3 h-3", score >= 60 ? "text-green-400" : "text-muted-foreground")} />
                  <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full bg-gradient-to-r", SKILL_COLORS[skill])}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm border-border/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Your Neural Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skills Grid */}
        <div className="space-y-3">
          {skillEntries.map(([skill, score]) => {
            const Icon = SKILL_ICONS[skill];
            const isWeak = weaknesses.some(w => w.skill === skill);
            
            return (
              <div key={skill} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4", SKILL_COLORS[skill].includes("yellow") ? "text-yellow-400" : "text-muted-foreground")} />
                    <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {isWeak && <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/50">Needs Work</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{getSkillLabel(score)}</span>
                </div>
                <div className="relative">
                  <Progress value={score} className="h-2" />
                  <div 
                    className={cn(
                      "absolute inset-0 h-2 rounded-full bg-gradient-to-r opacity-80",
                      SKILL_COLORS[skill]
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-primary">{profile.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-green-400">{(profile.averageSuccessRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-secondary/50">
            <div className="text-lg font-bold text-purple-400">{optimalDifficulty}</div>
            <div className="text-xs text-muted-foreground">Opt. Diff</div>
          </div>
        </div>

        {/* Difficulty Indicator */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-secondary/50 to-transparent">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm">Current Difficulty</span>
          </div>
          <Badge className={cn(
            "text-xs",
            profile.currentDifficultyMultiplier > 1.3 ? "bg-purple-500" :
            profile.currentDifficultyMultiplier > 1.0 ? "bg-blue-500" :
            profile.currentDifficultyMultiplier < 0.8 ? "bg-orange-500" : "bg-green-500"
          )}>
            {profile.currentDifficultyMultiplier.toFixed(1)}x
          </Badge>
        </div>

        {/* AI Recommendation */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">{recommendation}</p>
        </div>

        {/* Next Missions */}
        {learningPath.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="text-xs text-muted-foreground mb-2">Recommended Next:</div>
            <div className="flex gap-2">
              {learningPath.map((missionId, idx) => (
                <Badge 
                  key={missionId} 
                  variant={idx === 0 ? "default" : "outline"}
                  className="text-xs"
                >
                  Mission {missionId}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
