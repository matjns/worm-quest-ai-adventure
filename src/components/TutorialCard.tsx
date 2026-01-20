import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  title: string;
  content: string;
  image?: string;
  action?: string;
}

interface TutorialCardProps {
  title: string;
  steps: TutorialStep[];
  onComplete: () => void;
  className?: string;
}

export function TutorialCard({ title, steps, onComplete, className }: TutorialCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const allComplete = completedSteps.size === steps.length;

  const handleNext = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className={cn("bg-card rounded-2xl border border-border overflow-hidden shadow-sm", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-1 mt-3">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Step {currentStep + 1} of {steps.length}
            </span>
            {completedSteps.has(currentStep) && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <h4 className="text-lg font-semibold mb-3">{step.title}</h4>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            {step.content}
          </p>

          {step.action && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
              <p className="text-sm font-medium text-primary">{step.action}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <Button onClick={handleNext}>
          {isLastStep ? (
            <>
              Complete
              <CheckCircle2 className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
