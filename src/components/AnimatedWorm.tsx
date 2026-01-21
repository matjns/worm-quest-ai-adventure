import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedWormProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: { width: 48, height: 16 },
  md: { width: 80, height: 28 },
  lg: { width: 120, height: 40 },
  xl: { width: 200, height: 60 },
};

export function AnimatedWorm({ 
  className, 
  size = "md", 
  color = "hsl(var(--primary))",
  animated = true 
}: AnimatedWormProps) {
  const { width, height } = sizeMap[size];

  return (
    <motion.svg
      viewBox="0 0 200 60"
      className={cn("", className)}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Worm body with undulating animation */}
      <motion.path
        d="M 20 30 Q 50 15, 80 30 T 140 30 T 180 30"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        animate={animated ? {
          d: [
            "M 20 30 Q 50 15, 80 30 T 140 30 T 180 30",
            "M 20 30 Q 50 45, 80 30 T 140 30 T 180 30",
            "M 20 30 Q 50 15, 80 30 T 140 30 T 180 30",
          ]
        } : undefined}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Worm head */}
      <motion.circle
        cx="180"
        cy="30"
        r="10"
        fill={color}
        animate={animated ? {
          cy: [30, 28, 32, 30]
        } : undefined}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {/* Eye */}
      <circle
        cx="183"
        cy="27"
        r="3"
        fill="hsl(var(--background))"
      />
      <circle
        cx="184"
        cy="27"
        r="1.5"
        fill="hsl(var(--foreground))"
      />
    </motion.svg>
  );
}

export function WormDecoration({ className }: { className?: string }) {
  return (
    <motion.div 
      className={cn("", className)}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <AnimatedWorm size="sm" animated />
    </motion.div>
  );
}