import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ArcadeScreenProps {
  children: ReactNode;
  className?: string;
  title?: string;
  showScanlines?: boolean;
}

export function ArcadeScreen({ 
  children, 
  className, 
  title,
  showScanlines = true 
}: ArcadeScreenProps) {
  return (
    <div className={cn(
      "arcade-bezel relative overflow-hidden",
      className
    )}>
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-accent to-primary px-2 py-1">
          <p className="text-[10px] sm:text-xs text-center text-primary-foreground uppercase tracking-wide font-semibold truncate">
            {title}
          </p>
        </div>
      )}
      <div className={cn("p-3 sm:p-4", title && "pt-7 sm:pt-8", showScanlines && "crt-screen")}>
        {children}
      </div>
    </div>
  );
}

interface SpeakDisplayProps {
  text: string;
  className?: string;
  isLoading?: boolean;
}

export function SpeakDisplay({ text, className, isLoading }: SpeakDisplayProps) {
  return (
    <div className={cn("speak-display", className)}>
      {isLoading ? (
        <span className="animate-pulse">● ● ●</span>
      ) : (
        text
      )}
    </div>
  );
}

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "pink" | "cyan" | "yellow" | "orange";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantColors = {
  pink: "from-primary to-[hsl(340_100%_45%)] border-[hsl(340_100%_35%)] shadow-[0_0_20px_hsl(340_100%_60%/0.5)]",
  cyan: "from-accent to-[hsl(175_100%_35%)] border-[hsl(175_100%_25%)] shadow-[0_0_20px_hsl(175_100%_50%/0.5)]",
  yellow: "from-[hsl(45_100%_55%)] to-[hsl(45_100%_45%)] border-[hsl(45_100%_35%)] shadow-[0_0_20px_hsl(45_100%_50%/0.5)]",
  orange: "from-[hsl(25_100%_55%)] to-[hsl(25_100%_45%)] border-[hsl(25_100%_35%)] shadow-[0_0_20px_hsl(25_100%_50%/0.5)]",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function ArcadeButton({ 
  variant = "pink", 
  size = "md", 
  children, 
  className,
  ...props 
}: ArcadeButtonProps) {
  return (
    <button
      className={cn(
        "font-arcade uppercase tracking-wider text-foreground",
        "bg-gradient-to-b border-3 rounded-lg",
        "transform transition-all duration-100",
        "hover:translate-y-[-2px] hover:brightness-110",
        "active:translate-y-[2px] active:brightness-90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantColors[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PacManLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="loader-pacman" />
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-[hsl(60_10%_90%)] animate-pulse"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function GhostIcon({ 
  color = "pinky", 
  className,
  animated = false 
}: { 
  color?: "blinky" | "pinky" | "inky" | "clyde";
  className?: string;
  animated?: boolean;
}) {
  const colors = {
    blinky: "text-[hsl(0_100%_50%)]",
    pinky: "text-[hsl(340_100%_70%)]",
    inky: "text-[hsl(175_100%_50%)]",
    clyde: "text-[hsl(25_100%_55%)]",
  };

  return (
    <div className={cn(
      "text-2xl", 
      colors[color],
      animated && "animate-bounce",
      className
    )}>
      👻
    </div>
  );
}
