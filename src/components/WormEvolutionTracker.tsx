import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  useEngagementStore, 
  WORM_EVOLUTIONS,
  getEvolutionProgress 
} from "@/stores/engagementStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, Info } from "lucide-react";

interface WormEvolutionTrackerProps {
  className?: string;
  compact?: boolean;
}

export function WormEvolutionTracker({ className, compact = false }: WormEvolutionTrackerProps) {
  const { currentEvolutionStage, totalXPEarned } = useEngagementStore();
  
  const currentEvolution = WORM_EVOLUTIONS[currentEvolutionStage];
  const nextEvolution = WORM_EVOLUTIONS[currentEvolutionStage + 1];
  const progress = getEvolutionProgress(totalXPEarned, currentEvolutionStage);
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-card/80 rounded-lg border border-border/50", className)}>
        <motion.span 
          className="text-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {currentEvolution.sprite}
        </motion.span>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{currentEvolution.name}</span>
            {nextEvolution && (
              <span className="text-xs text-muted-foreground">
                Next: {nextEvolution.sprite} {nextEvolution.name}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2 mt-1" />
        </div>
      </div>
    );
  }
  
  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Worm Evolution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Evolution */}
        <div className="flex items-center gap-4">
          <motion.div
            className="text-5xl"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {currentEvolution.sprite}
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{currentEvolution.name}</h3>
              <Badge variant="outline" className="text-xs">
                Stage {currentEvolutionStage + 1}/{WORM_EVOLUTIONS.length}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentEvolution.description}
            </p>
          </div>
        </div>
        
        {/* Abilities */}
        {currentEvolution.abilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentEvolution.abilities.map((ability) => (
              <Badge key={ability} variant="secondary" className="text-xs">
                {ability}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Evolution Progress */}
        {nextEvolution && (
          <div className="space-y-2 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Evolution</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{nextEvolution.sprite}</span>
                <span className="font-medium">{nextEvolution.name}</span>
              </div>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div 
                className="absolute inset-0 h-3 rounded-full bg-gradient-to-r from-primary/50 to-primary overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalXPEarned.toLocaleString()} XP</span>
              <span>{nextEvolution.unlockedAt.toLocaleString()} XP needed</span>
            </div>
          </div>
        )}
        
        {/* Evolution Tree Preview */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Info className="w-3 h-3" />
            Evolution Tree
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {WORM_EVOLUTIONS.map((evo, idx) => (
              <div 
                key={evo.stage}
                className={cn(
                  "flex items-center",
                  idx <= currentEvolutionStage ? "opacity-100" : "opacity-40"
                )}
              >
                <motion.span 
                  className={cn(
                    "text-2xl p-1 rounded",
                    idx === currentEvolutionStage && "bg-primary/20 ring-2 ring-primary"
                  )}
                  whileHover={{ scale: 1.2 }}
                  title={evo.name}
                >
                  {evo.sprite}
                </motion.span>
                {idx < WORM_EVOLUTIONS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
