import { useState, useCallback } from "react";
import { useLearningStore } from "@/stores/learningStore";
import { toast } from "sonner";

export type AgeGroup = "pre-k" | "k5" | "middle" | "high" | "college" | "phd";

export interface ChallengeRecommendation {
  id: string;
  title: string;
  difficulty: number;
  entropyScore?: number;
  focusArea: string;
  rationale: string;
}

export interface EntropyAnalysis {
  knowledgeGaps: string[];
  strengthAreas: string[];
  optimalChallengeZone: string;
  retentionPrediction: number;
}

export interface ChallengeRemap {
  recommendedChallenges: ChallengeRecommendation[];
  difficultyAdjustment: number;
  contentAdaptations: string[];
  scaffoldingLevel: "none" | "light" | "medium" | "heavy";
  entropyAnalysis: EntropyAnalysis;
}

export interface EntropyResult {
  result: ChallengeRemap;
  calculatedEntropy: number;
  skillVariance: number;
}

export function useEntropyAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<EntropyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { profile } = useLearningStore();

  const analyzeEntropy = useCallback(async (
    userId: string,
    ageGroup: AgeGroup,
    completedModules: string[] = [],
    failedAttempts: Record<string, number> = {},
    requestType: "full" | "quick" = "full"
  ): Promise<EntropyResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/entropy-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            profile: {
              userId,
              ageGroup,
              skillMetrics: profile.skills,
              completedModules,
              failedAttempts,
              averageCompletionTime: profile.averageTimePerMission || 120,
              streakData: {
                current: profile.currentStreak,
                best: profile.longestStreak,
              },
              learningStyle: profile.learningStyle,
            },
            requestType,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
          throw new Error("Rate limit exceeded");
        }
        if (response.status === 402) {
          toast.error("AI credits depleted. Please add more credits.");
          throw new Error("Payment required");
        }
        throw new Error("Failed to analyze entropy");
      }

      const data: EntropyResult = await response.json();
      setLastAnalysis(data);
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      console.error("Entropy analysis error:", e);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile]);

  const getQuickRecommendation = useCallback(async (
    userId: string,
    ageGroup: AgeGroup
  ): Promise<ChallengeRecommendation | null> => {
    const result = await analyzeEntropy(userId, ageGroup, [], {}, "quick");
    return result?.result.recommendedChallenges[0] || null;
  }, [analyzeEntropy]);

  const calculateLocalEntropy = useCallback((): number => {
    const skills = Object.values(profile.skills);
    const avgSkill = skills.reduce((a, b) => a + b, 0) / skills.length || 50;
    const variance = skills.reduce((a, b) => a + Math.pow(b - avgSkill, 2), 0) / skills.length;
    return Math.log2(1 + Math.sqrt(variance)) / Math.log2(100);
  }, [profile.skills]);

  return {
    isAnalyzing,
    lastAnalysis,
    error,
    analyzeEntropy,
    getQuickRecommendation,
    calculateLocalEntropy,
  };
}
