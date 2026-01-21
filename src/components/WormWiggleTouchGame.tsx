import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Volume2, 
  VolumeX,
  Zap,
  Star,
  Trophy,
} from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { toast } from "sonner";
import AccessibleWorm3D from "@/components/AccessibleWorm3D";
import { supabase } from "@/integrations/supabase/client";

interface TouchPoint {
  x: number;
  y: number;
  segmentIndex: number;
}

const VENTRAL_CORD_SEGMENTS = [
  { name: "Head", neurons: ["ALML", "ALMR"], color: "#ec4899" },
  { name: "Nerve Ring", neurons: ["RIA", "RIB"], color: "#8b5cf6" },
  { name: "Anterior", neurons: ["DB1", "VB1"], color: "#14b8a6" },
  { name: "Central", neurons: ["DB3", "VB3"], color: "#3b82f6" },
  { name: "Posterior", neurons: ["DB5", "VB5"], color: "#f59e0b" },
  { name: "Tail", neurons: ["ALML", "PVDL"], color: "#ef4444" },
];

const ION_CHANNEL_FACTS = [
  "Ion channels are like tiny doors in neurons that let electricity flow! ⚡",
  "When you touch the worm, ion channels open and send signals! 🚪",
  "Sodium ions rush in to make the neuron fire - like a spark! ✨",
  "The worm feels your touch because of these tiny channels! 🐛",
  "Ion channels are faster than the blink of an eye! 👁️",
];

interface WormWiggleTouchGameProps {
  onComplete?: () => void;
  className?: string;
}

export function WormWiggleTouchGame({ onComplete, className }: WormWiggleTouchGameProps) {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  const [touchedSegments, setTouchedSegments] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNeurons, setActiveNeurons] = useState<boolean[]>(Array(10).fill(false));
  const [signalStrength, setSignalStrength] = useState(0);
  const [score, setScore] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // AI-guided prompt handler
  const askGrok = async (prompt: string) => {
    setIsLoadingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke('neural-qa', {
        body: { 
          question: prompt,
          context: "Pre-K student learning about C. elegans touch response. Keep answer simple and fun.",
          gradeLevel: "PreK"
        }
      });

      if (!error && data?.answer) {
        setAiResponse(data.answer);
        if (soundEnabled) {
          speakText(data.answer);
        }
      }
    } catch (e) {
      console.error('AI error:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSegmentTouch = useCallback((segmentIndex: number) => {
    if (!isPlaying) {
      setIsPlaying(true);
    }

    // Add to touched segments
    setTouchedSegments(prev => new Set([...prev, segmentIndex]));

    // Activate neurons with visual feedback
    setActiveNeurons(prev => {
      const next = [...prev];
      next[segmentIndex] = true;
      // Propagate signal
      if (segmentIndex < 9) next[segmentIndex + 1] = true;
      return next;
    });

    // Update signal strength
    setSignalStrength(prev => Math.min(1, prev + 0.15));

    // Score points
    const points = 10;
    setScore(s => s + points);
    addPoints(points);
    addXp(3);

    // Cycle through facts
    setCurrentFact(f => (f + 1) % ION_CHANNEL_FACTS.length);

    // Play sound effect
    if (soundEnabled) {
      playTouchSound(segmentIndex);
    }

    // Check for completion
    if (touchedSegments.size === 5) {
      handleComplete();
    }
  }, [isPlaying, touchedSegments.size, soundEnabled]);

  const playTouchSound = (segmentIndex: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different tones for different segments
      oscillator.frequency.value = 200 + segmentIndex * 100;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  };

  const handleComplete = () => {
    setShowCelebration(true);
    unlockAchievement('wiggle-master');
    toast.success("🎉 You learned about ion channels!");
    
    // Full worm wiggle animation
    let pos = 0;
    const interval = setInterval(() => {
      pos += 0.1;
      setSignalStrength(pos);
      if (pos >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setShowCelebration(false);
          onComplete?.();
        }, 2000);
      }
    }, 100);
  };

  const handleTouchReversal = () => {
    askGrok("Grok, simulate touch-induced reversal in C. elegans. Explain like I'm 5 years old.");
    
    // Visual reversal animation
    setActiveNeurons(Array(10).fill(true));
    setSignalStrength(1);
    
    setTimeout(() => {
      setActiveNeurons(prev => prev.map((_, i) => i < 5));
      setSignalStrength(0.5);
    }, 500);
  };

  const resetGame = () => {
    setTouchedSegments(new Set());
    setActiveNeurons(Array(10).fill(false));
    setSignalStrength(0);
    setScore(0);
    setIsPlaying(false);
    setAiResponse(null);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Worm Wiggle Touch Game
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {score} pts
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ventral Cord Traced</span>
            <span>{touchedSegments.size}/6 segments</span>
          </div>
          <Progress value={(touchedSegments.size / 6) * 100} className="h-2" />
        </div>

        {/* Worm Touch Area */}
        <div 
          ref={canvasRef}
          className="relative bg-gradient-to-b from-muted/50 to-muted rounded-xl overflow-hidden"
        >
          {/* Touch segments overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex gap-2">
              {VENTRAL_CORD_SEGMENTS.map((segment, i) => (
                <motion.button
                  key={segment.name}
                  onClick={() => handleSegmentTouch(i)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-12 h-24 rounded-full border-2 transition-all cursor-pointer
                    ${touchedSegments.has(i) 
                      ? 'bg-primary/30 border-primary' 
                      : 'bg-background/50 border-muted-foreground/30 hover:border-primary/50'
                    }
                  `}
                  style={{
                    boxShadow: touchedSegments.has(i) 
                      ? `0 0 20px ${segment.color}` 
                      : 'none'
                  }}
                  aria-label={`Touch ${segment.name} segment`}
                >
                  {touchedSegments.has(i) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      <Zap className="w-6 h-6 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 3D Worm Visualization */}
          <Suspense fallback={<div className="h-[200px]" />}>
            <AccessibleWorm3D
              className="h-[200px] opacity-50"
              activeNeurons={activeNeurons}
              signalStrength={signalStrength}
              wormType="hermaphrodite"
              ariaDescription="Touch the segments above to trace the ventral cord and watch the worm respond!"
            />
          </Suspense>
        </div>

        {/* Segment labels */}
        <div className="flex justify-between text-xs text-muted-foreground px-2">
          {VENTRAL_CORD_SEGMENTS.map((seg, i) => (
            <span 
              key={seg.name}
              className={touchedSegments.has(i) ? 'text-primary font-medium' : ''}
            >
              {seg.name}
            </span>
          ))}
        </div>

        {/* Ion Channel Fact */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-primary/5 rounded-lg border border-primary/20"
          >
            <p className="text-sm">💡 {ION_CHANNEL_FACTS[currentFact]}</p>
          </motion.div>
        </AnimatePresence>

        {/* AI Response */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-accent/10 rounded-lg border border-accent/20"
          >
            <p className="text-sm font-medium mb-1">🤖 AI Says:</p>
            <p className="text-sm text-muted-foreground">{aiResponse}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleTouchReversal}
            disabled={isLoadingAi}
            className="flex-1 gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isLoadingAi ? "Thinking..." : "Ask: Simulate Touch Reversal!"}
          </Button>
          <Button variant="outline" onClick={resetGame}>
            Reset
          </Button>
        </div>

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 rounded-xl"
            >
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Amazing! 🎉</h3>
                <p className="text-muted-foreground">
                  You traced the whole ventral cord!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default WormWiggleTouchGame;
