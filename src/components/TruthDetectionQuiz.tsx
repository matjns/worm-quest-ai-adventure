import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Brain,
  Target,
  Award,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

interface TruthQuestion {
  id: string;
  claim: string;
  context: string;
  options: {
    id: string;
    label: string;
    isStrawman: boolean;
    explanation: string;
  }[];
  truthLevel: 'verified' | 'partially-true' | 'misleading' | 'false';
  sources: string[];
  lesson: string;
}

interface TruthDetectionQuizProps {
  ageGroup: 'prek' | 'k5' | 'middle' | 'high';
  onComplete?: (score: number, total: number) => void;
  className?: string;
}

const TRUTH_QUESTIONS: Record<string, TruthQuestion[]> = {
  prek: [
    {
      id: 'pk1',
      claim: '"All worms are the same!"',
      context: 'Someone says this about the worms we study.',
      options: [
        { id: 'a', label: '✓ True - worms are all identical', isStrawman: true, explanation: 'This is a straw man! There are over 2,700 kinds of worms, each different.' },
        { id: 'b', label: '✗ Not quite - worms come in many types', isStrawman: false, explanation: 'Great job! C. elegans is special - it has exactly 302 neurons we can study!' },
      ],
      truthLevel: 'false',
      sources: ['OpenWorm Project'],
      lesson: 'When someone says "all" or "every," ask questions! Truth detectives check the facts.',
    },
    {
      id: 'pk2',
      claim: '"Computers are always right!"',
      context: 'A friend says this about AI helpers.',
      options: [
        { id: 'a', label: '✓ Yes - computers never make mistakes', isStrawman: true, explanation: 'This is a straw man! Computers and AI can make mistakes because humans made them.' },
        { id: 'b', label: '✗ Not always - they can make mistakes too', isStrawman: false, explanation: 'Excellent! Even smart AI can be wrong. Always ask a grown-up to help check!' },
      ],
      truthLevel: 'false',
      sources: ['AI Safety Research'],
      lesson: 'Being a truth detective means checking everything - even computers!',
    },
  ],
  k5: [
    {
      id: 'k1',
      claim: '"AI chatbots know everything and are never wrong."',
      context: 'You hear this from a classmate who uses an AI helper for homework.',
      options: [
        { id: 'a', label: 'Agree - AI has access to all information', isStrawman: true, explanation: 'Straw man detected! AI can "hallucinate" - make up facts that sound true but aren\'t.' },
        { id: 'b', label: 'Disagree - AI can make mistakes called hallucinations', isStrawman: false, explanation: 'Truth detected! AI learns from internet data which includes mistakes. Always verify!' },
        { id: 'c', label: 'AI is too dumb to be useful', isStrawman: true, explanation: 'This is also a straw man! AI is helpful but needs human fact-checking.' },
      ],
      truthLevel: 'false',
      sources: ['AI Research Papers', 'Digital Literacy Guidelines'],
      lesson: 'The Deep Truth: AI is trained on internet data with mistakes. Check important facts with trusted adults!',
    },
    {
      id: 'k2',
      claim: '"C. elegans worms are exactly like human brains."',
      context: 'A video says studying worms tells us everything about human brains.',
      options: [
        { id: 'a', label: 'Exactly the same - worms = humans', isStrawman: true, explanation: 'Straw man! Worms have 302 neurons, humans have 86 billion. They\'re useful models, not copies.' },
        { id: 'b', label: 'Totally different - we can\'t learn anything', isStrawman: true, explanation: 'This is also a straw man! We share 60-80% of genes and learn a lot from worms.' },
        { id: 'c', label: 'Similar in some ways - helpful for learning basics', isStrawman: false, explanation: 'Truth! Worms help us understand how neurons work, but human brains are much more complex.' },
      ],
      truthLevel: 'partially-true',
      sources: ['OpenWorm Project', 'Nature Neuroscience'],
      lesson: 'Steel man thinking: Find the true parts of claims instead of just saying yes or no!',
    },
  ],
  middle: [
    {
      id: 'm1',
      claim: '"AI systems are trained to always tell the truth."',
      context: 'This claim appears in an article about Large Language Models.',
      options: [
        { id: 'a', label: 'True - honesty is the primary training goal', isStrawman: true, explanation: 'Straw man! AI is primarily trained to be "helpful" and "harmless," not necessarily truthful. This is why Brian Roemmele\'s Deep Truth Prompt was revolutionary.' },
        { id: 'b', label: 'False - AI is trained for helpfulness, not truth', isStrawman: false, explanation: 'Correct! RLHF (Reinforcement Learning from Human Feedback) optimizes for helpfulness. Truth-seeking requires special prompting techniques.' },
        { id: 'c', label: 'AI can\'t understand truth at all', isStrawman: true, explanation: 'This understates AI capabilities. AI can process factual information but wasn\'t primarily optimized for truth.' },
      ],
      truthLevel: 'misleading',
      sources: ['OpenAI Research Papers', 'Brian Roemmele (2025)'],
      lesson: 'The Deep Truth Prompt (2025) was revolutionary because it explicitly asks AI to prioritize truth over helpfulness - something no one had systematically done before.',
    },
    {
      id: 'm2',
      claim: '"You can believe everything from official-looking sources."',
      context: 'A website with a professional design makes scientific claims.',
      options: [
        { id: 'a', label: 'Professional design = trustworthy information', isStrawman: true, explanation: 'Straw man! Misinformation often uses professional presentation. Check sources, not appearances.' },
        { id: 'b', label: 'All websites are equally unreliable', isStrawman: true, explanation: 'Also a straw man! Some sources are more reliable - peer-reviewed journals, official organizations.' },
        { id: 'c', label: 'Evaluate sources critically regardless of appearance', isStrawman: false, explanation: 'Truth! Check: Who wrote it? What are their credentials? Can you verify the claims? Are there citations?' },
      ],
      truthLevel: 'false',
      sources: ['Stanford Internet Observatory', 'Media Literacy Consortium'],
      lesson: 'Truth identification may become humanity\'s greatest challenge. Learning these skills now is critical for your future.',
    },
  ],
  high: [
    {
      id: 'h1',
      claim: '"AI alignment is a solved problem - we\'ve figured out how to make AI safe."',
      context: 'A tech CEO makes this claim in an interview.',
      options: [
        { id: 'a', label: 'True - modern AI systems are fully aligned with human values', isStrawman: true, explanation: 'Straw man! AI alignment remains one of the most challenging unsolved problems. Current techniques like RLHF are approximations, not solutions.' },
        { id: 'b', label: 'False - alignment is unsolved and may be fundamentally unsolvable', isStrawman: true, explanation: 'This may be too pessimistic. Progress is being made, though full alignment remains elusive.' },
        { id: 'c', label: 'Partially true - we have techniques, but major challenges remain', isStrawman: false, explanation: 'Steel man position! RLHF and Constitutional AI help, but issues like reward hacking, distributional shift, and value specification remain unsolved.' },
      ],
      truthLevel: 'misleading',
      sources: ['Anthropic Research', 'DeepMind Safety Team', 'OpenAI Alignment Papers'],
      lesson: 'The Deep Truth: AI safety is an existential concern. The gap between "helpful" and "truthful" AI is why the Deep Truth Prompt was necessary - no one had optimized for truth-seeking.',
    },
    {
      id: 'h2',
      claim: '"Identifying truth online will become easier as AI improves."',
      context: 'An optimistic prediction about AI-assisted fact-checking.',
      options: [
        { id: 'a', label: 'True - AI will solve misinformation automatically', isStrawman: true, explanation: 'Straw man! AI can also generate increasingly convincing misinformation. It\'s an arms race.' },
        { id: 'b', label: 'False - truth identification is becoming impossible', isStrawman: true, explanation: 'Overly pessimistic. With proper training and tools, humans can still identify truth - but it requires effort.' },
        { id: 'c', label: 'Complex - AI helps and hurts; human judgment remains critical', isStrawman: false, explanation: 'Nuanced truth! AI creates deepfakes AND detects them. Human critical thinking + AI tools + source verification is the path forward.' },
        { id: 'd', label: 'Truth itself is subjective, so this question is meaningless', isStrawman: true, explanation: 'Epistemological nihilism is itself a straw man. Empirical truths exist even if our access to them is imperfect.' },
      ],
      truthLevel: 'partially-true',
      sources: ['MIT Media Lab', 'Stanford HAI', 'Future of Life Institute'],
      lesson: 'Identifying truth may soon become the most challenging problem for individuals, communities, nations, and humanity. Your generation must master these skills - civilization depends on it.',
    },
  ],
};

export function TruthDetectionQuiz({
  ageGroup,
  onComplete,
  className,
}: TruthDetectionQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const { addXp, addPoints, unlockAchievement } = useGameStore();

  const questions = TRUTH_QUESTIONS[ageGroup] || TRUTH_QUESTIONS.k5;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const selected = currentQuestion.options.find((o) => o.id === selectedAnswer);
    const isCorrect = selected && !selected.isStrawman;
    
    if (isCorrect) {
      setScore((s) => s + 1);
      addPoints(25);
      addXp(15);
    }
    
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete
      setCompleted(true);
      const finalScore = score + (currentQuestion.options.find((o) => o.id === selectedAnswer)?.isStrawman === false ? 1 : 0);
      
      if (finalScore === questions.length) {
        unlockAchievement('truth-champion');
        toast.success('🏆 Truth Champion Badge Earned!', {
          description: 'You detected all straw man arguments!',
        });
      } else if (finalScore >= questions.length * 0.7) {
        unlockAchievement('truth-seeker');
        toast.success('🔍 Truth Seeker Badge Earned!');
      }
      
      onComplete?.(finalScore, questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  const selectedOption = currentQuestion?.options.find((o) => o.id === selectedAnswer);

  if (completed) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('bg-card rounded-2xl border border-border p-8 text-center', className)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className={cn(
            'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
            percentage >= 80 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
          )}
        >
          {percentage >= 80 ? (
            <Award className="w-10 h-10 text-green-500" />
          ) : (
            <Target className="w-10 h-10 text-amber-500" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Truth Detection Complete!</h2>
        <p className="text-muted-foreground mb-4">
          You scored {finalScore} out of {questions.length} ({percentage}%)
        </p>

        {percentage >= 80 && (
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Truth Challenge Badge Earned!</span>
          </div>
        )}

        <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Key Takeaway
          </h3>
          <p className="text-sm text-muted-foreground">
            {ageGroup === 'prek' || ageGroup === 'k5'
              ? 'Being a Truth Detective means asking questions and checking facts. Never believe something just because someone said it!'
              : 'Identifying truth is becoming one of humanity\'s greatest challenges. The Deep Truth Prompt and steel man thinking are essential tools for navigating an AI-filled world.'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => onComplete?.(finalScore, questions.length)}>
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold">Truth Detection Quiz</h2>
            <p className="text-xs text-muted-foreground">Spot the straw man arguments</p>
          </div>
        </div>
        <Badge variant="secondary">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {/* Claim */}
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Claim to evaluate:</p>
                <p className="text-lg font-semibold">{currentQuestion.claim}</p>
                <p className="text-sm text-muted-foreground mt-2">{currentQuestion.context}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            <p className="text-sm font-medium mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Which response avoids straw man thinking?
            </p>

            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = !option.isStrawman;

              return (
                <motion.button
                  key={option.id}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all',
                    !showResult && isSelected && 'border-primary bg-primary/5',
                    !showResult && !isSelected && 'border-border hover:border-primary/50',
                    showResult && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/30',
                    showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950/30',
                    showResult && !isSelected && !isCorrect && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-sm">{option.label}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Result explanation */}
          <AnimatePresence>
            {showResult && selectedOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border"
              >
                <div
                  className={cn(
                    'p-4 m-4 rounded-xl',
                    !selectedOption.isStrawman
                      ? 'bg-green-50 dark:bg-green-950/30'
                      : 'bg-amber-50 dark:bg-amber-950/30'
                  )}
                >
                  <p className="text-sm mb-3">{selectedOption.explanation}</p>
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold flex items-center gap-2 mb-1">
                      <Lightbulb className="w-3 h-3" />
                      Deep Truth Lesson:
                    </p>
                    <p className="text-xs text-muted-foreground">{currentQuestion.lesson}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <Button onClick={handleSubmit} disabled={!selectedAnswer}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default TruthDetectionQuiz;
