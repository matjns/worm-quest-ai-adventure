import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ChallengeResult {
  title?: string;
  description?: string;
  objective?: string;
  hint?: string;
}

interface QuizResult {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type AgeGroup = "pre-k" | "k5" | "middle" | "high";

export function useAIChallenge() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(async (
    type: "generate_challenge" | "generate_quiz" | "get_hint" | "validate_simulation",
    ageGroup: AgeGroup,
    options: { topic?: string; difficulty?: number; context?: string } = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-challenge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type,
            ageGroup,
            ...options,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many requests. Please wait a moment and try again.");
          throw new Error("Rate limit exceeded");
        }
        if (response.status === 402) {
          toast.error("AI credits depleted. Please add more credits.");
          throw new Error("Payment required");
        }
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateChallenge = useCallback(
    (ageGroup: AgeGroup, topic?: string, difficulty?: number) =>
      callAI("generate_challenge", ageGroup, { topic, difficulty }),
    [callAI]
  );

  const generateQuiz = useCallback(
    (ageGroup: AgeGroup, topic?: string): Promise<QuizResult> =>
      callAI("generate_quiz", ageGroup, { topic }),
    [callAI]
  );

  const getHint = useCallback(
    (ageGroup: AgeGroup, context: string): Promise<string> =>
      callAI("get_hint", ageGroup, { context }),
    [callAI]
  );

  const validateSimulation = useCallback(
    (ageGroup: AgeGroup, context: string) =>
      callAI("validate_simulation", ageGroup, { context }),
    [callAI]
  );

  return {
    isLoading,
    error,
    generateChallenge,
    generateQuiz,
    getHint,
    validateSimulation,
  };
}
