import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, SkipForward, Play, Pause } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

interface SplashIntroProps {
  onComplete: () => void;
  skipDelay?: number;
}

const INTRO_SCRIPT = `Welcome to NeuroQuest. You are about to embark on a journey from the connectome to exponential futures. Meet the worm—302 neurons, 7000 synapses, and a blueprint for understanding intelligence itself. You will simulate, perturb, and observe how neural circuits give rise to behavior. From sibernetic hydrodynamics to emergent locomotion, you will decode biology at its most fundamental level. This is not just education—this is the future of AI literacy. Let's begin.`;

const SCRIPT_SEGMENTS = [
  { text: "Welcome to NeuroQuest.", duration: 2000 },
  { text: "You are about to embark on a journey from the connectome to exponential futures.", duration: 4000 },
  { text: "Meet the worm—302 neurons, 7000 synapses, and a blueprint for understanding intelligence itself.", duration: 5000 },
  { text: "You will simulate, perturb, and observe how neural circuits give rise to behavior.", duration: 4500 },
  { text: "From sibernetic hydrodynamics to emergent locomotion, you will decode biology at its most fundamental level.", duration: 5000 },
  { text: "This is not just education—this is the future of AI literacy.", duration: 3500 },
  { text: "Let's begin.", duration: 2000 },
];

export function SplashIntro({ onComplete, skipDelay = 3000 }: SplashIntroProps) {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const { speak, stop, isSpeaking, isSupported } = useSpeech({ rate: 0.9 });
  const [isMuted, setIsMuted] = useState(false);

  // Check if user has seen intro before
  useEffect(() => {
    const seen = localStorage.getItem("neuroquest_intro_seen");
    if (seen === "true") {
      setHasSeenIntro(true);
      onComplete();
    }
  }, [onComplete]);

  // Enable skip after delay
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), skipDelay);
    return () => clearTimeout(timer);
  }, [skipDelay]);

  // Progress through segments
  useEffect(() => {
    if (isPaused || hasSeenIntro) return;

    if (currentSegment < SCRIPT_SEGMENTS.length) {
      // Speak current segment
      if (!isMuted && isSupported) {
        speak(SCRIPT_SEGMENTS[currentSegment].text);
      }

      const timer = setTimeout(() => {
        setCurrentSegment(prev => prev + 1);
      }, SCRIPT_SEGMENTS[currentSegment].duration);

      return () => clearTimeout(timer);
    } else {
      // All segments complete
      handleComplete();
    }
  }, [currentSegment, isPaused, isMuted, isSupported, hasSeenIntro]);

  const handleComplete = useCallback(() => {
    stop();
    localStorage.setItem("neuroquest_intro_seen", "true");
    onComplete();
  }, [stop, onComplete]);

  const handleSkip = () => {
    if (canSkip) {
      handleComplete();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      stop();
      setIsMuted(true);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      stop();
      setIsPaused(true);
    }
  };

  if (hasSeenIntro) return null;

  const progress = (currentSegment / SCRIPT_SEGMENTS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Animated neural network lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="neural-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[...Array(15)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#neural-line-grad)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          ))}
        </svg>

        {/* Floating neurons */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl px-8 text-center space-y-8">
        {/* Logo/Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="text-primary">Neuro</span>Quest
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Simulate organisms to decode biology
          </p>
        </motion.div>

        {/* Worm Animation */}
        <motion.div
          className="relative h-32 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <svg viewBox="0 0 200 60" className="w-64 h-auto">
            <motion.path
              d="M 20 30 Q 50 10, 80 30 T 140 30 T 180 30"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
            />
            <motion.circle
              cx="180"
              cy="30"
              r="6"
              fill="hsl(var(--primary))"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.5 }}
            />
          </svg>
        </motion.div>

        {/* Script Text */}
        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentSegment < SCRIPT_SEGMENTS.length && (
              <motion.p
                key={currentSegment}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-xl md:text-2xl font-medium text-foreground leading-relaxed"
              >
                {SCRIPT_SEGMENTS[currentSegment].text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">
        {/* Mute/Unmute */}
        {isSupported && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        )}

        {/* Pause/Play */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePause}
          className="text-muted-foreground hover:text-foreground"
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </Button>

        {/* Skip */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSkip}
          disabled={!canSkip}
          className="gap-2"
        >
          <SkipForward className="w-4 h-4" />
          {canSkip ? "Skip Intro" : "Please wait..."}
        </Button>
      </div>
    </motion.div>
  );
}

export function useSplashIntro() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("neuroquest_intro_seen");
    if (seen === "true") {
      setShowSplash(false);
    }
  }, []);

  const resetIntro = () => {
    localStorage.removeItem("neuroquest_intro_seen");
    setShowSplash(true);
  };

  return { showSplash, setShowSplash, resetIntro };
}
