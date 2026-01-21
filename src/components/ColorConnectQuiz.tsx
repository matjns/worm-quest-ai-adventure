import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Star,
  Lightbulb,
  Zap,
} from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Neurotransmitter {
  id: string;
  name: string;
  color: string;
  colorName: string;
  emoji: string;
  fact: string;
}

const NEUROTRANSMITTERS: Neurotransmitter[] = [
  {
    id: "gaba",
    name: "GABA",
    color: "#ef4444",
    colorName: "Red",
    emoji: "🔴",
    fact: "GABA says 'STOP!' to neurons - like a red traffic light!",
  },
  {
    id: "acetylcholine",
    name: "Acetylcholine",
    color: "#3b82f6",
    colorName: "Blue",
    emoji: "🔵",
    fact: "Acetylcholine helps muscles move - like turning on a motor!",
  },
  {
    id: "dopamine",
    name: "Dopamine",
    color: "#22c55e",
    colorName: "Green",
    emoji: "🟢",
    fact: "Dopamine makes you feel happy - like winning a game!",
  },
  {
    id: "serotonin",
    name: "Serotonin",
    color: "#eab308",
    colorName: "Yellow",
    emoji: "🟡",
    fact: "Serotonin helps you feel calm - like a sunny day!",
  },
  {
    id: "glutamate",
    name: "Glutamate",
    color: "#a855f7",
    colorName: "Purple",
    emoji: "🟣",
    fact: "Glutamate says 'GO!' to neurons - like a green light!",
  },
];

interface ColorConnectQuizProps {
  onComplete?: (score: number) => void;
  className?: string;
}

export function ColorConnectQuiz({ onComplete, className }: ColorConnectQuizProps) {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [aiNarration, setAiNarration] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<Record<string, string>>({});

  // Shuffle neurotransmitters for each round
  const [shuffledNeurotransmitters] = useState(() => 
    [...NEUROTRANSMITTERS].sort(() => Math.random() - 0.5)
  );
  
  const [targetNeurotransmitter] = useState(() =>
    NEUROTRANSMITTERS[Math.floor(Math.random() * NEUROTRANSMITTERS.length)]
  );

  const speakText = useCallback((text: string) => {
    if (soundEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, [soundEnabled]);

  const fetchAiNarration = async (correct: boolean, neurotransmitter: Neurotransmitter) => {
    setIsLoadingAi(true);
    try {
      const prompt = correct
        ? `Celebrate that a kid correctly matched ${neurotransmitter.name} with the ${neurotransmitter.colorName} color! Say something fun about how they "flipped the worm's decision tree!" Keep it under 2 sentences for a Pre-K kid.`
        : `Gently encourage a Pre-K kid who made a mistake matching ${neurotransmitter.name}. Give a hint about its ${neurotransmitter.colorName} color. Keep it fun and under 2 sentences.`;

      const { data, error } = await supabase.functions.invoke('neural-qa', {
        body: { 
          question: prompt,
          context: "Pre-K neuroscience game about neurotransmitter colors",
          gradeLevel: "PreK"
        }
      });

      if (!error && data?.answer) {
        setAiNarration(data.answer);
        speakText(data.answer);
      }
    } catch (e) {
      console.error('AI narration error:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem) return;

    const draggedNeurotransmitter = NEUROTRANSMITTERS.find(n => n.id === draggedItem);
    const correct = draggedItem === targetId;

    setDroppedItems(prev => ({ ...prev, [targetId]: draggedItem }));
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonusPoints = Math.min(newStreak * 5, 25);
      const totalPoints = 15 + bonusPoints;
      
      setScore(s => s + totalPoints);
      addPoints(totalPoints);
      addXp(8);
      
      toast.success(`🎉 Correct! +${totalPoints} points!`);
      
      if (newStreak >= 3) {
        unlockAchievement('color-master');
      }
    } else {
      setStreak(0);
      addXp(2); // Participation XP
      toast.error("Try again! 💪");
    }

    if (draggedNeurotransmitter) {
      fetchAiNarration(correct, draggedNeurotransmitter);
    }

    setDraggedItem(null);
  };

  const nextRound = () => {
    if (currentRound >= 4) {
      // Game complete
      onComplete?.(score);
      toast.success(`Game Complete! Final Score: ${score}`);
      return;
    }
    
    setCurrentRound(r => r + 1);
    setShowResult(false);
    setAiNarration(null);
    setDroppedItems({});
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setShowResult(false);
    setAiNarration(null);
    setDroppedItems({});
  };

  const currentTarget = shuffledNeurotransmitters[currentRound];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Color-Connect Quiz
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {score} pts
            </Badge>
            {streak >= 2 && (
              <Badge variant="default" className="gap-1 bg-orange-500">
                🔥 {streak}x streak
              </Badge>
            )}
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

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Round {currentRound + 1} of 5</span>
            <span>Match the neurotransmitter!</span>
          </div>
          <Progress value={(currentRound / 5) * 100} className="h-2" />
        </div>

        {/* Target Display */}
        <div className="text-center p-6 bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground mb-2">Find the color for:</p>
          <h2 className="text-3xl font-bold mb-2">{currentTarget?.name}</h2>
          <p className="text-sm text-muted-foreground">
            Drag the correct color to the target below!
          </p>
        </div>

        {/* Draggable Color Options */}
        <div className="grid grid-cols-5 gap-3">
          {NEUROTRANSMITTERS.map((nt) => (
            <motion.button
              key={nt.id}
              draggable
              onDragStart={() => handleDragStart(nt.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "aspect-square rounded-full border-4 cursor-grab active:cursor-grabbing transition-all",
                droppedItems[currentTarget?.id] === nt.id
                  ? "opacity-50"
                  : "hover:border-foreground"
              )}
              style={{ 
                backgroundColor: nt.color,
                borderColor: draggedItem === nt.id ? '#ffffff' : 'transparent',
                boxShadow: draggedItem === nt.id ? `0 0 20px ${nt.color}` : 'none',
              }}
              aria-label={`Drag ${nt.colorName} color for ${nt.name}`}
            >
              <span className="text-2xl">{nt.emoji}</span>
            </motion.button>
          ))}
        </div>

        {/* Drop Target */}
        <motion.div
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(currentTarget?.id)}
          className={cn(
            "h-24 rounded-xl border-4 border-dashed flex items-center justify-center transition-all",
            droppedItems[currentTarget?.id]
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/30 bg-muted/30"
          )}
        >
          {droppedItems[currentTarget?.id] ? (
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {NEUROTRANSMITTERS.find(n => n.id === droppedItems[currentTarget?.id])?.emoji}
              </span>
              {isCorrect ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Drop color here!</p>
          )}
        </motion.div>

        {/* Result & AI Narration */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "p-4 rounded-lg border",
                isCorrect
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              )}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium mb-1">
                    {isCorrect ? "🎉 You flipped the worm's decision tree!" : "Almost there!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentTarget?.fact}
                  </p>
                  
                  {aiNarration && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-sm p-2 bg-background/50 rounded"
                    >
                      🤖 {aiNarration}
                    </motion.p>
                  )}
                  
                  {isLoadingAi && (
                    <p className="mt-2 text-sm text-muted-foreground animate-pulse">
                      AI is thinking...
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showResult && (
            <Button onClick={nextRound} className="flex-1 gap-2">
              <Zap className="w-4 h-4" />
              {currentRound >= 4 ? "See Results!" : "Next Round"}
            </Button>
          )}
          <Button variant="outline" onClick={resetGame}>
            Restart
          </Button>
        </div>

        {/* Agent-Environment Loop Lesson */}
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <span>
              <strong>Sim Lesson:</strong> You're the agent, the colors are the environment! 
              Each match teaches the worm's neural network. That's an agent-environment loop!
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ColorConnectQuiz;
