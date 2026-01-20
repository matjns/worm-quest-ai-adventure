import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Zap, 
  ArrowRight, 
  Share2,
  Sparkles,
  BookOpen,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Mission } from "@/data/missionData";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface MissionCompleteProps {
  mission: Mission;
  attempts: number;
  activeNeurons: string[];
  onNextMission: () => void;
  onBackToMissions: () => void;
  hasNextMission: boolean;
  className?: string;
}

export function MissionComplete({
  mission,
  attempts,
  activeNeurons,
  onNextMission,
  onBackToMissions,
  hasNextMission,
  className,
}: MissionCompleteProps) {
  const [labReport, setLabReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const generateReport = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-challenge", {
          body: {
            type: "validate_simulation",
            ageGroup: "middle",
            context: JSON.stringify({
              mission: mission.title,
              neuronsUsed: activeNeurons,
              attempts,
              goal: mission.goal,
            }),
          },
        });

        if (!error && data?.result?.feedback) {
          setLabReport(data.result.feedback);
        } else {
          setLabReport(`Congratulations on completing ${mission.title}! You successfully wired ${activeNeurons.length} neurons to achieve the ${mission.correctBehavior.replace("_", " ")} behavior. Great work understanding how neural circuits control worm behavior!`);
        }
      } catch {
        setLabReport(`You did it! Mission complete. The worm now responds correctly thanks to your neural circuit.`);
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const performanceRating = attempts <= 2 ? "Perfect" : attempts <= 4 ? "Great" : "Good";
  const stars = attempts <= 2 ? 3 : attempts <= 4 ? 2 : 1;

  return (
    <div className={cn("relative", className)}>
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-sm"
              initial={{
                x: "50%",
                y: "30%",
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${100 + Math.random() * 50}%`,
                scale: [0, 1, 1],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut",
              }}
              style={{
                backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][
                  Math.floor(Math.random() * 5)
                ],
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border-2 border-foreground rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 text-center text-primary-foreground">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 drop-shadow-lg" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Mission Complete!</h2>
          <p className="opacity-90">{mission.title}</p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-6">
          {/* Performance */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-2 border-foreground/10">
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="text-xl font-bold">{performanceRating}</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-8 h-8 transition-all",
                    i < stars
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">+{mission.xpReward}</p>
              <p className="text-xs text-muted-foreground uppercase">XP Earned</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border-2 border-accent/30 text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                {mission.badge.name}
              </Badge>
              <p className="text-xs text-muted-foreground uppercase mt-2">Badge Unlocked</p>
            </div>
          </div>

          {/* Lab Report */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-bold uppercase text-sm">Your Lab Report</h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border-2 border-foreground/10">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating your report...</span>
                </div>
              ) : (
                <p className="text-sm leading-relaxed italic">{labReport}</p>
              )}
            </div>
          </div>

          {/* Stats summary */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{attempts}</p>
              <p>Attempts</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{activeNeurons.length}</p>
              <p>Neurons Used</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t-2 border-foreground flex gap-4">
          <Button
            variant="outline"
            onClick={onBackToMissions}
            className="flex-1 rounded-lg"
          >
            Mission Select
          </Button>
          {hasNextMission && (
            <Button
              onClick={onNextMission}
              className="flex-1 rounded-lg"
            >
              Next Mission
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
