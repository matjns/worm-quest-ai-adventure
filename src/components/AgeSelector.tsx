import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Baby, GraduationCap, Microscope, Code, ChevronRight } from "lucide-react";
import { GhostIcon } from "./ArcadeScreen";

type AgeGroup = "prek" | "k5" | "middle" | "high";

interface AgeSelectorProps {
  selected: AgeGroup;
  onSelect: (age: AgeGroup) => void;
  className?: string;
  compact?: boolean;
}

const ageGroups: { id: AgeGroup; label: string; grades: string; icon: React.ReactNode; ghost: "blinky" | "pinky" | "inky" | "clyde"; description: string }[] = [
  { 
    id: "prek", 
    label: "Little Explorers", 
    grades: "Pre-K", 
    icon: <Baby className="w-5 h-5" />,
    ghost: "pinky",
    description: "Tap & play with worms!"
  },
  { 
    id: "k5", 
    label: "Brain Builders", 
    grades: "K-5", 
    icon: <GraduationCap className="w-5 h-5" />,
    ghost: "blinky",
    description: "Drag neurons, make worms wiggle!"
  },
  { 
    id: "middle", 
    label: "Circuit Designers", 
    grades: "6-8", 
    icon: <Microscope className="w-5 h-5" />,
    ghost: "inky",
    description: "Build neural circuits!"
  },
  { 
    id: "high", 
    label: "Neuroscientists", 
    grades: "9-12", 
    icon: <Code className="w-5 h-5" />,
    ghost: "clyde",
    description: "Code with real data!"
  },
];

export function AgeSelector({ selected, onSelect, className, compact = false }: AgeSelectorProps) {
  if (compact) {
    return (
      <div className={cn("flex gap-2 flex-wrap", className)}>
        {ageGroups.map((age) => (
          <button
            key={age.id}
            onClick={() => onSelect(age.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all",
              "font-arcade text-xs uppercase",
              selected === age.id
                ? "border-primary bg-primary/20 text-primary glow-neon-pink"
                : "border-muted bg-muted/50 text-muted-foreground hover:border-primary/50"
            )}
          >
            <GhostIcon color={age.ghost} className="text-sm" />
            <span>{age.grades}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {ageGroups.map((age, i) => (
        <motion.button
          key={age.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(age.id)}
          className={cn(
            "relative p-4 rounded-xl border-3 transition-all text-left",
            "shadow-[4px_4px_0px_hsl(var(--foreground))]",
            selected === age.id
              ? "border-primary bg-gradient-to-br from-primary/20 to-accent/10 glow-neon-pink"
              : "border-foreground bg-card hover:border-primary hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_hsl(var(--foreground))]"
          )}
        >
          <div className="absolute -top-3 -right-3">
            <GhostIcon color={age.ghost} animated={selected === age.id} />
          </div>
          
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
            "border-2 border-foreground",
            selected === age.id ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            {age.icon}
          </div>
          
          <h3 className="font-arcade text-xs uppercase mb-1">{age.label}</h3>
          <p className="text-sm text-muted-foreground font-mono">{age.grades}</p>
          <p className="text-xs text-muted-foreground mt-2">{age.description}</p>
          
          {selected === age.id && (
            <div className="absolute bottom-2 right-2">
              <ChevronRight className="w-5 h-5 text-primary animate-pulse" />
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
