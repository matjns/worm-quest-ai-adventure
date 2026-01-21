import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Sparkles, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StarProgress {
  module: string;
  stars: number; // 0-5 stars instead of entropy
  emoji: string;
}

interface KidsCertSystemProps {
  className?: string;
  ageGroup: 'prek' | 'k5';
}

const PREK_MODULES = [
  { module: 'colors', emoji: '🎨', label: 'Colors' },
  { module: 'counting', emoji: '🔢', label: 'Counting' },
  { module: 'wiggling', emoji: '🐛', label: 'Wiggling' },
];

const K5_MODULES = [
  { module: 'neurons', emoji: '🧠', label: 'Neurons' },
  { module: 'connections', emoji: '🔗', label: 'Connections' },
  { module: 'signals', emoji: '⚡', label: 'Signals' },
  { module: 'behavior', emoji: '🐛', label: 'Behavior' },
];

export function KidsCertSystem({ className, ageGroup }: KidsCertSystemProps) {
  const modules = ageGroup === 'prek' ? PREK_MODULES : K5_MODULES;
  
  const [progress, setProgress] = useState<StarProgress[]>(
    modules.map(m => ({ module: m.module, stars: Math.floor(Math.random() * 4), emoji: m.emoji }))
  );
  const [badges, setBadges] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check for badges
  useEffect(() => {
    const totalStars = progress.reduce((a, b) => a + b.stars, 0);
    const maxStars = progress.length * 5;
    
    if (totalStars >= maxStars * 0.8 && !badges.includes('Super Star')) {
      setBadges(prev => [...prev, 'Super Star']);
      setShowCelebration(true);
      toast.success('🌟 You earned the Super Star badge!');
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    if (progress.every(p => p.stars >= 3) && !badges.includes('Brain Builder')) {
      setBadges(prev => [...prev, 'Brain Builder']);
      toast.success('🧠 You earned the Brain Builder badge!');
    }
  }, [progress, badges]);

  const addStar = (index: number) => {
    setProgress(prev => prev.map((p, i) => 
      i === index ? { ...p, stars: Math.min(5, p.stars + 1) } : p
    ));
  };

  const totalStars = progress.reduce((a, b) => a + b.stars, 0);
  const maxStars = progress.length * 5;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/20 z-10 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="text-center"
            >
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-primary">Super Star!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {ageGroup === 'prek' ? 'My Stars ⭐' : 'Star Progress 🌟'}
          </span>
          <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            {totalStars}/{maxStars}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star progress for each module */}
        <div className="space-y-3">
          {progress.map((item, index) => (
            <motion.div
              key={item.module}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => i === item.stars && addStar(index)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 transition-colors",
                          i < item.stars
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total progress bar */}
        <div className="pt-2">
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalStars / maxStars) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Badges section */}
        {badges.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Your Badges:</p>
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <motion.div
                  key={badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {badge === 'Super Star' ? <Sparkles className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {badge}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement message */}
        <div className="text-center pt-2">
          {totalStars < maxStars * 0.3 ? (
            <p className="text-sm text-muted-foreground">Keep playing to earn more stars! ⭐</p>
          ) : totalStars < maxStars * 0.7 ? (
            <p className="text-sm text-primary">You're doing great! 🎉</p>
          ) : (
            <p className="text-sm text-green-500 font-medium">Amazing work, superstar! 🌟</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
