import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscoveryHint {
  hint: string;
  type: 'add_neuron' | 'make_connection' | 'experiment' | 'pattern';
  emoji: string;
}

interface DiscoveryHintBubbleProps {
  hint: DiscoveryHint | null;
  isVisible: boolean;
  isLoading: boolean;
  onDismiss: () => void;
  onGetHint: () => void;
  disabled?: boolean;
}

export function DiscoveryHintBubble({
  hint,
  isVisible,
  isLoading,
  onDismiss,
  onGetHint,
  disabled = false,
}: DiscoveryHintBubbleProps) {
  return (
    <div className="relative">
      {/* Hint Request Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onGetHint}
        disabled={disabled || isLoading}
        className="gap-1.5 bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/60 hover:bg-primary/10"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ) : (
          <Lightbulb className="w-4 h-4" />
        )}
        {isLoading ? 'Thinking...' : 'Get Hint'}
      </Button>

      {/* Hint Bubble */}
      <AnimatePresence>
        {isVisible && hint && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute bottom-full left-0 mb-2 z-50"
          >
            <div className="relative bg-card border-2 border-primary/40 rounded-xl p-3 shadow-lg shadow-primary/10 max-w-[280px] min-w-[200px]">
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-6 w-4 h-4 bg-card border-b-2 border-r-2 border-primary/40 transform rotate-45" />
              
              {/* Content */}
              <div className="flex items-start gap-2">
                <span className="text-2xl flex-shrink-0">{hint.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {hint.hint}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    💡 {hint.type.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={onDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
