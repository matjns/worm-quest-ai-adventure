import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TeacherScript } from "@/components/TeacherScript";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Target,
  Award,
  Home,
} from "lucide-react";
import type { EducationModule } from "@/data/educationModules";

interface ModuleLessonPlayerProps {
  module: EducationModule;
  onComplete: (moduleId: string) => void;
  onExit: () => void;
}

type Phase = "warmup" | "learning" | "wrapup" | "complete";

export function ModuleLessonPlayer({
  module,
  onComplete,
  onExit,
}: ModuleLessonPlayerProps) {
  const [phase, setPhase] = useState<Phase>("warmup");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStep = module.steps[currentStepIndex];
  const progress =
    phase === "warmup"
      ? 5
      : phase === "learning"
      ? 10 + (currentStepIndex / module.steps.length) * 80
      : phase === "wrapup"
      ? 95
      : 100;

  const handleStepComplete = useCallback(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep.id]));
    setShowHint(false);

    if (currentStepIndex < module.steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      setPhase("wrapup");
    }
  }, [currentStep?.id, currentStepIndex, module.steps.length]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
      setShowHint(false);
    } else if (phase === "learning") {
      setPhase("warmup");
    }
  }, [currentStepIndex, phase]);

  const handleFinalComplete = useCallback(() => {
    setPhase("complete");
    onComplete(module.id);
  }, [module.id, onComplete]);

  const getAgeGroupFromGrade = (
    grade: EducationModule["gradeLevel"]
  ): "prek" | "k5" | "middle" | "high" => {
    if (grade === "public") return "k5";
    return grade;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onExit}>
              <Home className="w-4 h-4 mr-2" />
              Exit Module
            </Button>
            <Badge variant="outline">{module.title}</Badge>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {/* Warm-up Phase */}
            {phase === "warmup" && (
              <motion.div
                key="warmup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Lightbulb className="w-4 h-4" />
                    Warm-Up
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
                  <p className="text-muted-foreground">{module.subtitle}</p>
                </div>

                {/* Discussion question */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Discussion Question
                  </h2>
                  <p className="text-xl font-medium mb-4 text-primary">
                    "{module.warmUp.question}"
                  </p>
                  <TeacherScript
                    script={module.warmUp.discussion}
                    ageGroup={getAgeGroupFromGrade(module.gradeLevel)}
                  />
                </div>

                {/* Learning objectives */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    What You'll Learn
                  </h2>
                  <ul className="space-y-2">
                    {module.objectives.map((obj) => (
                      <li
                        key={obj.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{obj.text}</span>
                        {obj.ngssStandard && (
                          <Badge variant="outline" className="text-xs ml-auto">
                            {obj.ngssStandard}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vocabulary */}
                {module.vocabulary.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                    <h2 className="font-bold text-lg mb-4">Key Vocabulary</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {module.vocabulary.map((v) => (
                        <div
                          key={v.term}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl"
                        >
                          <span className="text-2xl">{v.emoji}</span>
                          <div>
                            <p className="font-semibold text-sm">{v.term}</p>
                            <p className="text-xs text-muted-foreground">
                              {v.definition}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setPhase("learning")}
                  className="w-full"
                  size="lg"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Learning Phase */}
            {phase === "learning" && currentStep && (
              <motion.div
                key={`step-${currentStepIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    Step {currentStepIndex + 1} of {module.steps.length}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {currentStep.interactionType}
                  </Badge>
                </div>

                {/* Step title */}
                <h2 className="text-2xl font-bold">{currentStep.title}</h2>

                {/* Teacher script */}
                <TeacherScript
                  script={currentStep.script}
                  ageGroup={getAgeGroupFromGrade(module.gradeLevel)}
                />

                {/* Interaction area placeholder */}
                <div className="bg-muted/50 rounded-2xl border-2 border-dashed border-border p-12 text-center">
                  <p className="text-muted-foreground mb-2">
                    Interactive Activity Area
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentStep.visualCue}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Success: {currentStep.successCriteria}
                  </p>
                </div>

                {/* Hint toggle */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                    >
                      <p className="text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Hint:</span>{" "}
                        {currentStep.hint}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </Button>

                  <Button onClick={handleStepComplete}>
                    {currentStepIndex < module.steps.length - 1
                      ? "Next Step"
                      : "Finish"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Wrap-up Phase */}
            {phase === "wrapup" && (
              <motion.div
                key="wrapup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Award className="w-4 h-4" />
                    Wrap-Up
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Great Work!</h1>
                  <p className="text-muted-foreground">
                    Let's review what you learned
                  </p>
                </div>

                {/* Review */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-4">📚 Review</h2>
                  <TeacherScript
                    script={module.wrapUp.review}
                    ageGroup={getAgeGroupFromGrade(module.gradeLevel)}
                  />
                </div>

                {/* Real-world connection */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-4">🌍 Real World</h2>
                  <p className="text-muted-foreground">
                    {module.wrapUp.realWorldConnection}
                  </p>
                </div>

                {/* Take-home */}
                <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                  <h2 className="font-bold text-lg mb-2">🏠 Take Home</h2>
                  <p className="text-sm">{module.wrapUp.takeHome}</p>
                </div>

                <Button
                  onClick={handleFinalComplete}
                  className="w-full"
                  size="lg"
                >
                  Complete Module
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Completion Phase */}
            {phase === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <Award className="w-12 h-12 text-green-500" />
                </motion.div>

                <h1 className="text-3xl font-bold mb-2">Module Complete!</h1>
                <p className="text-muted-foreground mb-8">
                  You've finished "{module.title}"
                </p>

                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button onClick={onExit} size="lg">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Modules
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
