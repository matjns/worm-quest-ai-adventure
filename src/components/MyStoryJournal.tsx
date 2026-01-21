import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  BookHeart, Sparkles, Save, ChevronRight, 
  Lightbulb, Target, Heart, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface JournalPrompt {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
  placeholder: string;
}

interface MyStoryJournalProps {
  moduleId: string;
  moduleTitle: string;
  ageGroup: 'prek' | 'k5' | 'middle' | 'high';
  onComplete: () => void;
  onSkip: () => void;
  className?: string;
}

const JOURNAL_PROMPTS: Record<string, JournalPrompt[]> = {
  prek: [
    {
      id: 'favorite',
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      label: 'My Favorite Part',
      prompt: 'What was your favorite part of this lesson?',
      placeholder: 'I liked when...',
    },
    {
      id: 'feel',
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      label: 'How I Feel',
      prompt: 'How does learning this make you feel?',
      placeholder: 'I feel...',
    },
  ],
  k5: [
    {
      id: 'connection',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      label: 'My Connection',
      prompt: 'How does this connect to something in your life?',
      placeholder: 'This reminds me of when...',
    },
    {
      id: 'curious',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      label: 'I Wonder...',
      prompt: 'What questions do you still have? What do you want to learn next?',
      placeholder: 'I wonder why...',
    },
    {
      id: 'share',
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      label: 'Tell Someone',
      prompt: 'What would you tell a friend or family member about what you learned?',
      placeholder: 'I would tell them that...',
    },
  ],
  middle: [
    {
      id: 'personal',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      label: 'Personal Connection',
      prompt: 'How does this topic connect to your daily life or experiences?',
      placeholder: 'This connects to my life because...',
    },
    {
      id: 'future',
      icon: <Target className="w-5 h-5 text-blue-500" />,
      label: 'Future Goals',
      prompt: 'How might this knowledge help you in the future? What goals does it connect to?',
      placeholder: 'This could help me...',
    },
    {
      id: 'challenge',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      label: 'Challenge Accepted',
      prompt: 'What was challenging about this lesson? How did you work through it?',
      placeholder: 'The hardest part was... I figured it out by...',
    },
  ],
  high: [
    {
      id: 'analysis',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      label: 'Critical Analysis',
      prompt: 'How does this content challenge or confirm your existing understanding? What assumptions did you have before?',
      placeholder: 'Before this lesson, I thought... Now I understand that...',
    },
    {
      id: 'application',
      icon: <Target className="w-5 h-5 text-blue-500" />,
      label: 'Real-World Application',
      prompt: 'How could you apply this knowledge to solve real problems in your community or future career?',
      placeholder: 'I could use this to...',
    },
    {
      id: 'truth',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      label: 'Truth & Uncertainty',
      prompt: 'What questions remain unanswered? How confident are you in what you learned, and why?',
      placeholder: 'I am confident about... but still uncertain about...',
    },
    {
      id: 'identity',
      icon: <Heart className="w-5 h-5 text-pink-500" />,
      label: 'Personal Growth',
      prompt: 'How does this learning experience connect to who you are and who you want to become?',
      placeholder: 'This matters to me because...',
    },
  ],
};

const STORAGE_KEY = 'neuroquest_journal_entries';

interface JournalEntry {
  moduleId: string;
  promptId: string;
  response: string;
  timestamp: string;
}

export function MyStoryJournal({
  moduleId,
  moduleTitle,
  ageGroup,
  onComplete,
  onSkip,
  className,
}: MyStoryJournalProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const prompts = JOURNAL_PROMPTS[ageGroup] || JOURNAL_PROMPTS.k5;
  const currentPrompt = prompts[currentPromptIndex];
  const isLastPrompt = currentPromptIndex === prompts.length - 1;

  // Load existing entries
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const entries: JournalEntry[] = JSON.parse(stored);
        const moduleEntries = entries.filter((e) => e.moduleId === moduleId);
        const existingResponses: Record<string, string> = {};
        moduleEntries.forEach((e) => {
          existingResponses[e.promptId] = e.response;
        });
        setResponses(existingResponses);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  }, [moduleId]);

  const saveEntry = (promptId: string, response: string) => {
    if (!response.trim()) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
      
      // Remove existing entry for this module/prompt
      const filtered = entries.filter(
        (e) => !(e.moduleId === moduleId && e.promptId === promptId)
      );
      
      // Add new entry
      filtered.push({
        moduleId,
        promptId,
        response: response.trim(),
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const handleNext = () => {
    const response = responses[currentPrompt.id];
    if (response?.trim()) {
      saveEntry(currentPrompt.id, response);
    }

    if (isLastPrompt) {
      setIsSaving(true);
      setTimeout(() => {
        toast.success('Journal saved! Great reflection! 📝');
        onComplete();
      }, 500);
    } else {
      setCurrentPromptIndex((i) => i + 1);
    }
  };

  const handleResponseChange = (value: string) => {
    // Limit response length based on age group
    const maxLength = ageGroup === 'prek' ? 200 : ageGroup === 'k5' ? 500 : 1000;
    if (value.length <= maxLength) {
      setResponses((prev) => ({ ...prev, [currentPrompt.id]: value }));
    }
  };

  const currentResponse = responses[currentPrompt.id] || '';
  const hasResponse = currentResponse.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4"
        >
          <BookHeart className="w-5 h-5" />
          <span className="font-semibold">My Story Journal</span>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Reflect on Your Learning</h2>
        <p className="text-muted-foreground">
          Take a moment to connect "{moduleTitle}" to your own life
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {prompts.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentPromptIndex
                ? 'bg-primary'
                : index < currentPromptIndex
                ? 'bg-primary/50'
                : 'bg-muted'
            )}
            animate={index === currentPromptIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {/* Current prompt */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPrompt.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-muted">{currentPrompt.icon}</div>
            <div>
              <Badge variant="secondary" className="mb-1">
                {currentPromptIndex + 1} of {prompts.length}
              </Badge>
              <h3 className="font-semibold">{currentPrompt.label}</h3>
            </div>
          </div>

          <p className="text-lg mb-4 font-medium text-primary">
            {currentPrompt.prompt}
          </p>

          <Textarea
            value={currentResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder={currentPrompt.placeholder}
            className="min-h-[120px] text-base resize-none"
            maxLength={ageGroup === 'prek' ? 200 : ageGroup === 'k5' ? 500 : 1000}
          />

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {currentResponse.length} / {ageGroup === 'prek' ? 200 : ageGroup === 'k5' ? 500 : 1000}
            </span>
            {hasResponse && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-green-600 flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Auto-saved
              </motion.span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onSkip}>
          Skip Journal
        </Button>

        <Button
          onClick={handleNext}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            'Saving...'
          ) : isLastPrompt ? (
            <>
              <Save className="w-4 h-4" />
              Finish & Save
            </>
          ) : (
            <>
              Next Prompt
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Encouragement message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        💡 There are no wrong answers—this is your personal story!
      </motion.p>
    </motion.div>
  );
}

export default MyStoryJournal;
