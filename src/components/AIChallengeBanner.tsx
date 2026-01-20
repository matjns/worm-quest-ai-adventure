import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIChallenge } from "@/hooks/useAIChallenge";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, RefreshCw, Brain, Target, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIChallengeBannerProps {
  ageGroup?: "pre-k" | "k5" | "middle" | "high";
  topic?: string;
  className?: string;
  onChallengeStart?: (challenge: Challenge) => void;
}

interface Challenge {
  title: string;
  description: string;
  objective: string;
  hint: string;
}

export function AIChallengeBanner({ 
  ageGroup = "middle", 
  topic,
  className,
  onChallengeStart 
}: AIChallengeBannerProps) {
  const { generateChallenge, isLoading, error } = useAIChallenge();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [showHint, setShowHint] = useState(false);

  const fetchNewChallenge = async () => {
    try {
      const result = await generateChallenge(ageGroup, topic);
      if (result && typeof result === 'object') {
        setChallenge(result as Challenge);
        setShowHint(false);
      }
    } catch (e) {
      console.error("Failed to generate challenge:", e);
    }
  };

  useEffect(() => {
    fetchNewChallenge();
  }, [ageGroup, topic]);

  const handleStart = () => {
    if (challenge && onChallengeStart) {
      onChallengeStart(challenge);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-lg border-3 border-foreground",
        "bg-gradient-to-br from-card via-card to-muted",
        "shadow-[6px_6px_0px_hsl(var(--foreground))]",
        className
      )}
    >
      {/* Arcade header */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-foreground animate-pulse" />
            <span className="font-arcade text-xs text-primary-foreground uppercase tracking-wider">
              AI Challenge Generator
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNewChallenge}
            disabled={isLoading}
            className="h-7 px-2 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 gap-4"
            >
              <div className="relative">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
                <Zap className="w-6 h-6 text-accent absolute -top-1 -right-1 animate-bounce" />
              </div>
              <p className="font-arcade text-xs text-muted-foreground animate-pulse">
                AI is thinking...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-destructive font-mono text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNewChallenge}
                className="mt-4"
              >
                Try Again
              </Button>
            </motion.div>
          ) : challenge ? (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div>
                <h3 className="font-arcade text-sm text-primary mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="font-mono text-xs text-accent uppercase tracking-wider mb-1">
                  Objective
                </p>
                <p className="text-sm font-medium">{challenge.objective}</p>
              </div>

              {/* Hint toggle */}
              <AnimatePresence>
                {showHint && challenge.hint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-accent/10 rounded-lg p-3 border border-accent/30"
                  >
                    <p className="font-mono text-xs text-accent uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Hint
                    </p>
                    <p className="text-sm">{challenge.hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleStart}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Start Challenge
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Decorative corner dots */}
      <div className="absolute top-12 left-2 w-2 h-2 rounded-full bg-primary/50 animate-pulse" />
      <div className="absolute top-12 right-2 w-2 h-2 rounded-full bg-accent/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-accent/50 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "1.5s" }} />
    </motion.div>
  );
}
