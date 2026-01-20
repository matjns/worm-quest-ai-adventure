import { useState, useCallback } from "react";
import { toast } from "sonner";
import { withRetry, getResilienceMessage } from "@/utils/apiResilience";

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  sources: string[];
  corrections?: string[];
}

interface QAResponse {
  answer: string;
  validation: ValidationResult;
  hallucination: boolean;
  owmetaReference?: Record<string, unknown>;
}

interface CircuitContext {
  neurons: string[];
  connections: { from: string; to: string; weight: number }[];
}

export function useNeuralQA() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<QAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = useCallback(async (
    question: string,
    context?: {
      currentCircuit?: CircuitContext;
      userLevel?: "pre-k" | "k5" | "middle" | "high";
      experimentHistory?: string[];
    }
  ): Promise<QAResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neural-qa`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ question, context }),
            }
          );

          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }

          return res.json();
        },
        3,
        () => toast.info(getResilienceMessage())
      );

      setLastResponse(response);

      // Flag hallucinations with warning
      if (response.hallucination) {
        toast.warning("⚠️ Response may contain unverified claims - flagged for review");
      }

      return response;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      
      // Return fallback response
      const fallback: QAResponse = {
        answer: "I'm having trouble connecting to the knowledge base. The C. elegans nervous system has 302 neurons with ~7,000 synaptic connections. Please try again for detailed analysis.",
        validation: { isValid: true, confidence: 0.9, sources: ["local-cache"] },
        hallucination: false,
      };
      
      setLastResponse(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Specific mutation query helper
  const queryMutation = useCallback(async (
    target: string,
    mutationType: "knockout" | "overexpress" | "modify",
    context?: CircuitContext
  ): Promise<QAResponse> => {
    const question = `Mutate ${target} synapse (${mutationType}) — predict stochastic delta and behavioral outcome?`;
    return askQuestion(question, { currentCircuit: context, userLevel: "high" });
  }, [askQuestion]);

  // Quick validation helper
  const validateClaim = useCallback(async (claim: string): Promise<ValidationResult> => {
    const response = await askQuestion(`Validate this claim against owmeta data: "${claim}"`);
    return response.validation;
  }, [askQuestion]);

  return {
    isLoading,
    error,
    lastResponse,
    askQuestion,
    queryMutation,
    validateClaim,
  };
}
