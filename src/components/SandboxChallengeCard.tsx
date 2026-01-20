import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SandboxChallenge } from '@/hooks/useSandboxChallenges';
import { useState } from 'react';

interface SandboxChallengeCardProps {
  challenge: SandboxChallenge | null;
  onDismiss: () => void;
  onPickNew: () => void;
  completedCount: number;
  totalCount: number;
}

export function SandboxChallengeCard({
  challenge,
  onDismiss,
  onPickNew,
  completedCount,
  totalCount,
}: SandboxChallengeCardProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!challenge) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 z-20"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onPickNew}
          className="gap-2 bg-card/90 backdrop-blur-sm border-primary/30 shadow-lg"
        >
          <Trophy className="w-4 h-4" />
          Get Challenge
          {completedCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className="absolute top-4 right-4 z-20"
    >
      <div className="bg-card/95 backdrop-blur-sm border-2 border-primary/40 rounded-xl shadow-lg shadow-primary/10 overflow-hidden min-w-[220px] max-w-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Optional Challenge</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
            >
              {isMinimized ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronUp className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-destructive/20 rounded transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{challenge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm leading-tight">
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {challenge.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-[10px] ${difficultyColors[challenge.difficulty]}`}>
                      {challenge.difficulty}
                    </Badge>
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      +{challenge.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Skip button */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">
                  {completedCount}/{totalCount} completed
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPickNew}
                  className="h-6 text-xs px-2"
                >
                  Try Another
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized state */}
        {isMinimized && (
          <div className="p-2 flex items-center gap-2">
            <span className="text-lg">{challenge.emoji}</span>
            <span className="text-xs font-medium truncate">{challenge.title}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ChallengeCompletionProps {
  challenge: SandboxChallenge;
}

export function ChallengeCompletion({ challenge }: ChallengeCompletionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -20 }}
      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
    >
      <motion.div
        className="bg-card/95 backdrop-blur-md border-4 border-primary rounded-2xl p-6 shadow-2xl shadow-primary/30 text-center"
        animate={{
          boxShadow: [
            '0 0 20px hsl(var(--primary) / 0.3)',
            '0 0 40px hsl(var(--primary) / 0.5)',
            '0 0 20px hsl(var(--primary) / 0.3)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-6xl mb-3"
        >
          {challenge.emoji}
        </motion.div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-xl font-bold text-foreground">Challenge Complete!</h3>
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <p className="text-lg font-medium text-primary">{challenge.title}</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center justify-center gap-1 text-primary"
        >
          <Star className="w-5 h-5 fill-primary" />
          <span className="text-lg font-bold">+{challenge.xpReward} XP</span>
        </motion.div>
      </motion.div>

      {/* Confetti particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
          }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.5, delay: Math.random() * 0.3 }}
          className="absolute text-2xl"
          style={{
            left: '50%',
            top: '50%',
          }}
        >
          {['⭐', '🎉', '✨', '🏆', '💫'][i % 5]}
        </motion.div>
      ))}
    </motion.div>
  );
}
