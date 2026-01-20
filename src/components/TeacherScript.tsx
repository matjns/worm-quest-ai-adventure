import { cn } from "@/lib/utils";
import { Volume2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TeacherScriptProps {
  script: string;
  ageGroup?: "prek" | "k5" | "middle" | "high";
  className?: string;
  showSpeaker?: boolean;
}

const ageStyles = {
  prek: {
    bg: "bg-gradient-to-r from-[hsl(340_100%_60%)] to-[hsl(25_100%_55%)]",
    text: "text-2xl font-speak",
    icon: "🐛",
  },
  k5: {
    bg: "bg-gradient-to-r from-[hsl(175_100%_45%)] to-[hsl(200_100%_50%)]",
    text: "text-xl font-speak",
    icon: "🧠",
  },
  middle: {
    bg: "bg-gradient-to-r from-[hsl(280_100%_60%)] to-[hsl(340_100%_55%)]",
    text: "text-lg font-mono",
    icon: "🔬",
  },
  high: {
    bg: "bg-gradient-to-r from-[hsl(250_40%_25%)] to-[hsl(280_50%_20%)]",
    text: "text-base font-mono",
    icon: "💻",
  },
};

export function TeacherScript({ 
  script, 
  ageGroup = "k5", 
  className,
  showSpeaker = true 
}: TeacherScriptProps) {
  const style = ageStyles[ageGroup];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "relative rounded-xl p-4 border-2 border-foreground",
        "shadow-[4px_4px_0px_hsl(var(--foreground))]",
        style.bg,
        className
      )}
    >
      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-card border-2 border-foreground flex items-center justify-center text-xl shadow-md">
        {style.icon}
      </div>
      
      <div className="flex items-start gap-3 pl-6">
        <div className={cn("flex-1", style.text, "text-foreground leading-relaxed")}>
          <MessageCircle className="inline w-4 h-4 mr-2 opacity-70" />
          "{script}"
        </div>
        
        {showSpeaker && (
          <button 
            className="p-2 rounded-lg bg-card/20 hover:bg-card/40 transition-colors"
            aria-label="Read aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Age-specific scripts for different lesson contexts
export const TEACHER_SCRIPTS = {
  intro: {
    prek: "You're about to meet a tiny worm friend! Watch how it wiggles when you tap!",
    k5: "You're going to explore a real worm's brain today! Tap on the neurons to see what happens!",
    middle: "You're about to dive into neural networks. When you activate these neurons, watch how the signal flows to the muscles!",
    high: "You'll be analyzing the C. elegans connectome. Manipulate synaptic weights and observe emergent locomotion patterns.",
  },
  neurons: {
    prek: "See those glowing dots? You touch one, and the worm feels it! Try it!",
    k5: "You just found a sensory neuron! When you activate it, watch the signal travel to the motor neurons!",
    middle: "You're looking at interneurons now. These are like traffic controllers—they decide where signals go next!",
    high: "You're examining gap junctions vs. chemical synapses. Adjust the coupling coefficients to see differential propagation.",
  },
  circuit: {
    prek: "You're building a worm brain! Drag the sparkly parts together and watch your worm dance!",
    k5: "You're connecting neurons like puzzle pieces! Each connection you make tells the worm how to move!",
    middle: "You're designing a neural circuit. Connect sensory neurons to interneurons to motor neurons—create a reflex arc!",
    high: "You're implementing a feedforward network. Consider adding recurrent connections for more complex behaviors.",
  },
  success: {
    prek: "You did it! Your worm is so happy it's wiggling! You're a worm brain builder!",
    k5: "Amazing! You made the worm move! That's exactly how real scientists study brains!",
    middle: "Excellent circuit design! Your neural pathway successfully triggered the expected motor response!",
    high: "Circuit validated. Motor neuron activation pattern matches OpenWorm simulation data within acceptable parameters.",
  },
};
