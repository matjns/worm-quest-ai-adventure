import { cn } from "@/lib/utils";
import { Volume2, VolumeX, MessageCircle, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeech } from "@/hooks/useSpeech";
import { useMemo } from "react";

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
    rate: 0.85, // Slower for young kids
  },
  k5: {
    bg: "bg-gradient-to-r from-[hsl(175_100%_45%)] to-[hsl(200_100%_50%)]",
    text: "text-xl font-speak",
    icon: "🧠",
    rate: 0.9,
  },
  middle: {
    bg: "bg-gradient-to-r from-[hsl(280_100%_60%)] to-[hsl(340_100%_55%)]",
    text: "text-lg font-mono",
    icon: "🔬",
    rate: 0.95,
  },
  high: {
    bg: "bg-gradient-to-r from-[hsl(250_40%_25%)] to-[hsl(280_50%_20%)]",
    text: "text-base font-mono",
    icon: "💻",
    rate: 1.0,
  },
};

// Bold 2nd-person pronouns and action verbs for emphasis
function formatScript(script: string): React.ReactNode {
  // Patterns to bold: You, Your, you, your + action verbs
  const patterns = [
    /\b(You(?:'re|'ll|'ve)?)\b/gi,
    /\b(Your)\b/gi,
    /\b(watch|observe|see|look|notice)\b/gi,
    /\b(tap|click|drag|touch|press|activate|connect|build|create|design)\b/gi,
    /\b(perturb|manipulate|adjust|tweak|modify|change)\b/gi,
    /\b(simulate|run|test|validate|experiment)\b/gi,
  ];

  // Split script into segments, bolding matches
  let result: React.ReactNode[] = [];
  let remaining = script;
  let key = 0;

  // Process each pattern
  const combinedPattern = new RegExp(
    patterns.map(p => p.source).join("|"),
    "gi"
  );

  const parts = remaining.split(combinedPattern);
  const matches = remaining.match(combinedPattern) || [];

  parts.forEach((part, i) => {
    if (part) {
      result.push(<span key={`text-${key++}`}>{part}</span>);
    }
    if (matches[i]) {
      result.push(
        <strong 
          key={`bold-${key++}`} 
          className="font-black text-primary-foreground bg-foreground/20 px-1 rounded"
        >
          {matches[i]}
        </strong>
      );
    }
  });

  return result;
}

export function TeacherScript({ 
  script, 
  ageGroup = "k5", 
  className,
  showSpeaker = true 
}: TeacherScriptProps) {
  const style = ageStyles[ageGroup];
  const { speak, stop, pause, resume, isSpeaking, isPaused, isSupported } = useSpeech({
    rate: style.rate,
  });

  const formattedScript = useMemo(() => formatScript(script), [script]);

  const handleSpeakerClick = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(script);
    }
  };

  const handleStop = () => {
    stop();
  };

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
          "{formattedScript}"
        </div>
        
        {showSpeaker && isSupported && (
          <div className="flex items-center gap-1">
            <motion.button 
              onClick={handleSpeakerClick}
              className={cn(
                "p-2 rounded-lg transition-all",
                isSpeaking 
                  ? "bg-card/40 text-foreground" 
                  : "bg-card/20 hover:bg-card/40"
              )}
              aria-label={isSpeaking ? (isPaused ? "Resume" : "Pause") : "Read aloud"}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isSpeaking && !isPaused ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Pause className="w-5 h-5" />
                  </motion.div>
                ) : isPaused ? (
                  <motion.div
                    key="play"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Play className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="volume"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative"
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            {isSpeaking && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={handleStop}
                className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/40 transition-colors"
                aria-label="Stop"
              >
                <VolumeX className="w-5 h-5" />
              </motion.button>
            )}
            
            {/* Speaking indicator */}
            {isSpeaking && !isPaused && (
              <motion.div 
                className="flex items-center gap-0.5 ml-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-foreground rounded-full"
                    animate={{
                      height: ["8px", "16px", "8px"],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
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
