import { ReactNode } from "react";
import { useLearningStore } from "@/stores/learningStore";
import { cn } from "@/lib/utils";

interface AdaptiveUIWrapperProps {
  children: ReactNode;
  ageGroup?: "pre-k" | "k5" | "middle" | "high";
  className?: string;
}

/**
 * Wrapper component that adapts UI based on user learning profile and entropy metrics.
 * - Pre-K: Larger touch targets, more visual feedback, simplified text
 * - K5: Balanced visuals and text, guided interactions
 * - Middle: More text, moderate visual aids
 * - High: Full complexity, minimal hand-holding
 */
export function AdaptiveUIWrapper({ 
  children, 
  ageGroup = "high",
  className 
}: AdaptiveUIWrapperProps) {
  const { profile } = useLearningStore();

  // Calculate adaptive settings based on learning profile
  const getAdaptiveStyles = () => {
    const { learningStyle, averageSuccessRate } = profile;

    // Base styles per age group
    const baseStyles: Record<string, string> = {
      "pre-k": "text-xl leading-relaxed [&_button]:min-h-16 [&_button]:text-lg",
      "k5": "text-lg leading-relaxed [&_button]:min-h-12",
      "middle": "text-base",
      "high": "text-sm",
    };

    let styles = baseStyles[ageGroup] || "";

    // Add learning style adaptations
    if (learningStyle.usesHints > 0.7) {
      // User relies on hints - show more guidance
      styles += " [&_.hint-trigger]:opacity-100 [&_.hint-trigger]:animate-pulse";
    }

    if (averageSuccessRate < 0.5) {
      // Struggling - add more visual feedback
      styles += " [&_.feedback]:scale-110 [&_.feedback]:duration-500";
    }

    if (learningStyle.explorative > 0.7) {
      // Exploratory learner - show more options
      styles += " [&_.advanced-options]:block";
    }

    return styles;
  };

  return (
    <div className={cn(getAdaptiveStyles(), className)}>
      {children}
    </div>
  );
}

/**
 * Adaptive text component that adjusts complexity based on age group
 */
interface AdaptiveTextProps {
  preK?: string;
  k5?: string;
  middle?: string;
  high?: string;
  fallback: string;
  ageGroup?: "pre-k" | "k5" | "middle" | "high";
  className?: string;
}

export function AdaptiveText({
  preK,
  k5,
  middle,
  high,
  fallback,
  ageGroup = "high",
  className,
}: AdaptiveTextProps) {
  const textMap: Record<string, string | undefined> = {
    "pre-k": preK,
    "k5": k5,
    "middle": middle,
    "high": high,
  };

  const text = textMap[ageGroup] || fallback;

  return <span className={className}>{text}</span>;
}

/**
 * Adaptive visual feedback - more prominent for younger users
 */
interface AdaptiveFeedbackProps {
  type: "success" | "error" | "hint" | "progress";
  message: string;
  ageGroup?: "pre-k" | "k5" | "middle" | "high";
  className?: string;
}

export function AdaptiveFeedback({
  type,
  message,
  ageGroup = "high",
  className,
}: AdaptiveFeedbackProps) {
  const getEmoji = () => {
    const emojis: Record<string, Record<string, string>> = {
      success: { "pre-k": "🎉🌟", "k5": "⭐", "middle": "✓", "high": "" },
      error: { "pre-k": "😢", "k5": "❌", "middle": "✗", "high": "" },
      hint: { "pre-k": "💡🤔", "k5": "💡", "middle": "💡", "high": "" },
      progress: { "pre-k": "🚀", "k5": "📈", "middle": "", "high": "" },
    };
    return emojis[type]?.[ageGroup] || "";
  };

  const getSizeClass = () => {
    const sizes: Record<string, string> = {
      "pre-k": "text-2xl p-6 rounded-3xl",
      "k5": "text-xl p-4 rounded-2xl",
      "middle": "text-lg p-3 rounded-xl",
      "high": "text-base p-2 rounded-lg",
    };
    return sizes[ageGroup] || sizes.high;
  };

  const getTypeClass = () => {
    const types: Record<string, string> = {
      success: "bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400",
      error: "bg-destructive/20 border-destructive/30 text-destructive",
      hint: "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400",
      progress: "bg-primary/20 border-primary/30 text-primary",
    };
    return types[type] || "";
  };

  return (
    <div
      className={cn(
        "feedback border animate-in fade-in slide-in-from-bottom-2",
        getSizeClass(),
        getTypeClass(),
        className
      )}
    >
      {getEmoji() && <span className="mr-2">{getEmoji()}</span>}
      {message}
    </div>
  );
}
