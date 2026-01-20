import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Target, Brain, Flame, Crown, Gem, Rocket, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  brain: Brain,
  flame: Flame,
  crown: Crown,
  gem: Gem,
  rocket: Rocket,
  heart: Heart,
};

export type CelebrationIcon = keyof typeof ICONS;

export interface CelebrationEvent {
  id: string;
  type: "achievement" | "level-up" | "evolution" | "badge" | "streak" | "quest";
  title: string;
  subtitle?: string;
  icon?: CelebrationIcon;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

interface CelebrationOverlayProps {
  event: CelebrationEvent | null;
  onComplete?: () => void;
}

const RARITY_COLORS = {
  common: "from-muted-foreground to-muted",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-amber-600",
};

const RARITY_GLOW = {
  common: "shadow-muted/20",
  rare: "shadow-blue-500/40",
  epic: "shadow-purple-500/50",
  legendary: "shadow-amber-500/60",
};

function generateParticles(count: number): Particle[] {
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#A78BFA", "#F59E0B", "#10B981"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
  }));
}

export function CelebrationOverlay({ event, onComplete }: CelebrationOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (event) {
      setParticles(generateParticles(30));
      setShowContent(true);
      
      const timer = setTimeout(() => {
        setShowContent(false);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [event, onComplete]);

  if (!event) return null;

  const Icon = event.icon ? ICONS[event.icon] : Star;
  const rarity = event.rarity || "common";

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: "50vw", 
                y: "50vh", 
                scale: 0, 
                opacity: 1 
              }}
              animate={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`, 
                scale: [0, 1, 0.5],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: "50%",
              }}
            />
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Sparkle ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="absolute"
                  style={{
                    left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 8)}%`,
                    top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 8)}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              ))}
            </motion.div>

            {/* Icon container */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, times: [0, 0.5, 1] }}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                RARITY_COLORS[rarity],
                RARITY_GLOW[rarity]
              )}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
              >
                {event.type === "level-up" ? "Level Up!" : 
                 event.type === "evolution" ? "Evolution!" :
                 event.type === "streak" ? "Streak!" :
                 event.type === "quest" ? "Quest Complete!" :
                 "Achievement Unlocked!"}
              </motion.p>
              
              <motion.h2
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
                className={cn(
                  "text-2xl md:text-3xl font-bold mt-2",
                  rarity === "legendary" && "text-amber-400",
                  rarity === "epic" && "text-purple-400",
                  rarity === "rare" && "text-blue-400"
                )}
              >
                {event.title}
              </motion.h2>
              
              {event.subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground mt-1"
                >
                  {event.subtitle}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
