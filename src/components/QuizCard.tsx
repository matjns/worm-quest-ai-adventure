import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Lightbulb, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onComplete: (correct: boolean) => void;
  className?: string;
}

export function QuizCard({
  question,
  options,
  correctIndex,
  explanation,
  onComplete,
  className,
}: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setShowResult(true);
    onComplete(selectedIndex === correctIndex);
  };

  const isCorrect = selectedIndex === correctIndex;

  return (
    <div className={cn("bg-card rounded-2xl border border-border p-6 shadow-sm", className)}>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold leading-relaxed">{question}</h3>
      </div>

      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isThisCorrect = index === correctIndex;

          return (
            <motion.button
              key={index}
              whileHover={!showResult ? { scale: 1.01 } : {}}
              whileTap={!showResult ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(index)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                !showResult && isSelected && "border-primary bg-primary/5",
                !showResult && !isSelected && "border-border hover:border-primary/50",
                showResult && isThisCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                showResult && isSelected && !isThisCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30",
                showResult && !isSelected && !isThisCorrect && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-semibold text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {showResult && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div
              className={cn(
                "p-4 rounded-xl flex items-start gap-3",
                isCorrect ? "bg-green-50 dark:bg-green-950/30" : "bg-amber-50 dark:bg-amber-950/30"
              )}
            >
              <Lightbulb
                className={cn(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  isCorrect ? "text-green-600" : "text-amber-600"
                )}
              />
              <p className="text-sm">{explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showResult ? (
        <Button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="w-full"
          size="lg"
        >
          Check Answer
        </Button>
      ) : (
        <Button
          onClick={() => {
            setSelectedIndex(null);
            setShowResult(false);
          }}
          variant="outline"
          className="w-full"
          size="lg"
        >
          Try Another
        </Button>
      )}
    </div>
  );
}
