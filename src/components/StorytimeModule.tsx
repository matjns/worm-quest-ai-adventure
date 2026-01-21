import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Send,
  Sparkles,
  HelpCircle,
  Star,
  Lightbulb,
} from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StoryPage {
  title: string;
  content: string;
  image: string;
  neurons?: string[];
}

const HERMAPHRODITE_STORY: StoryPage[] = [
  {
    title: "Meet Wiggle the Worm!",
    content: "Once upon a time, in a tiny drop of water, there lived a special worm named Wiggle. Wiggle was a C. elegans - that means 'elegant worm' in a fancy science language!",
    image: "🐛",
    neurons: ["ALML", "ALMR"],
  },
  {
    title: "The Brain Made of Stars",
    content: "Inside Wiggle's tiny head, there were 302 special sparkly cells called neurons - like a brain made of little stars! Each star could talk to its friends.",
    image: "✨",
    neurons: ["AVAL", "AVAR", "AVBL", "AVBR"],
  },
  {
    title: "The Great Adventure",
    content: "One day, Wiggle smelled something yummy! The smell went to special neurons in her nose called chemosensory neurons. 'I must find that food!' she decided.",
    image: "🍎",
    neurons: ["AWA", "AWC", "ASE"],
  },
  {
    title: "Wiggle, Wiggle, Go!",
    content: "The message traveled from neuron to neuron like a game of telephone! First to the thinking neurons, then to the wiggle neurons. Soon, Wiggle was moving toward the yummy smell!",
    image: "💨",
    neurons: ["AIY", "AIZ", "DB1", "VB1"],
  },
  {
    title: "Uh Oh, Danger!",
    content: "Suddenly, something touched Wiggle's head! Her touch neurons said 'STOP! GO BACK!' The command neurons AVA and AVD sent a message: 'Reverse!'",
    image: "😱",
    neurons: ["ALM", "AVA", "AVD"],
  },
  {
    title: "The Happy Ending",
    content: "Wiggle wiggled backwards, turned around, and found another way to the food. She ate and ate and was so happy! All 302 of her neurons danced with joy!",
    image: "🎉",
    neurons: ["All neurons!"],
  },
];

interface StorytimeModuleProps {
  onComplete?: () => void;
  className?: string;
}

export function StorytimeModule({ onComplete, className }: StorytimeModuleProps) {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [question, setQuestion] = useState("");
  const [aiResponses, setAiResponses] = useState<{ question: string; answer: string }[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentStory = HERMAPHRODITE_STORY[currentPage];

  // Auto-read when playing
  useEffect(() => {
    if (isPlaying && soundEnabled) {
      speakText(currentStory.content);
    }
  }, [currentPage, isPlaying, soundEnabled]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.15;
      utterance.onend = () => {
        if (isPlaying && currentPage < HERMAPHRODITE_STORY.length - 1) {
          setTimeout(() => nextPage(), 1500);
        }
      };
      speechSynthesis.speak(utterance);
    }
  };

  const nextPage = () => {
    if (currentPage < HERMAPHRODITE_STORY.length - 1) {
      setCurrentPage(p => p + 1);
      addXp(3);
    } else {
      handleComplete();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    addPoints(50);
    addXp(20);
    unlockAchievement('storyteller');
    toast.success("🎉 Story complete! You learned about Wiggle the worm!");
    onComplete?.();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsLoadingAi(true);
    const userQuestion = question;
    setQuestion("");
    setQuestionsAsked(q => q + 1);

    try {
      const { data, error } = await supabase.functions.invoke('neural-qa', {
        body: {
          question: userQuestion,
          context: `A Pre-K child is reading a story about a C. elegans worm named Wiggle. Current page: "${currentStory.title}" - "${currentStory.content}". Answer in 1-2 simple sentences a young child can understand. If they ask about mutations or what-if scenarios, explain emergent behaviors simply.`,
          gradeLevel: "PreK",
        },
      });

      if (!error && data?.answer) {
        const response = { question: userQuestion, answer: data.answer };
        setAiResponses(prev => [...prev, response]);
        
        if (soundEnabled) {
          speakText(data.answer);
        }

        // Award XP for curiosity
        addXp(5);
        
        if (questionsAsked >= 2) {
          unlockAchievement('curious-explorer');
        }
      }
    } catch (e) {
      console.error('AI error:', e);
      toast.error("Oops! The AI is thinking too hard. Try again!");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Scroll to bottom when new responses come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiResponses]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Storytime: Wiggle's Adventure
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Page {currentPage + 1}/{HERMAPHRODITE_STORY.length}
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
        {/* Story Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-6 min-h-[200px]"
          >
            <div className="text-center mb-4">
              <span className="text-6xl">{currentStory.image}</span>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-3">
              {currentStory.title}
            </h2>
            
            <p className="text-lg leading-relaxed text-center">
              {currentStory.content}
            </p>

            {/* Neurons mentioned */}
            {currentStory.neurons && (
              <div className="mt-4 flex flex-wrap gap-1 justify-center">
                {currentStory.neurons.map((neuron, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {neuron}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            size="lg"
            onClick={togglePlayPause}
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {currentPage === 0 ? "Start Story" : "Continue"}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={currentPage === HERMAPHRODITE_STORY.length - 1}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Ask AI Section */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
            <span>Ask about the story! Try: "What if AVA mutates?"</span>
          </div>

          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask Wiggle a question..."
              disabled={isLoadingAi}
              className="flex-1"
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoadingAi || !question.trim()}
              size="icon"
            >
              {isLoadingAi ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* AI Responses */}
          {aiResponses.length > 0 && (
            <ScrollArea className="h-[150px] rounded-lg border p-3" ref={scrollRef}>
              <div className="space-y-3">
                {aiResponses.map((response, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="flex-shrink-0">
                        You
                      </Badge>
                      <p className="text-sm">{response.question}</p>
                    </div>
                    <div className="flex items-start gap-2 pl-4">
                      <Badge className="flex-shrink-0 bg-accent">
                        🤖 AI
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {response.answer}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Emergent Behavior Prompt */}
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <strong>Try asking:</strong>
              <ul className="mt-1 space-y-1">
                <li>• "What if AVA mutates?"</li>
                <li>• "What happens if all touch neurons stop working?"</li>
                <li>• "Can Wiggle learn new things?"</li>
              </ul>
              <p className="mt-2 text-accent">These teach <strong>emergent behaviors</strong> - how small changes create big effects!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StorytimeModule;
