import { useState, useCallback, useEffect } from "react";
import { useLearningStore } from "@/stores/learningStore";
import { supabase } from "@/integrations/supabase/client";
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

export interface PersistedEntropyProfile {
  id: string;
  user_id: string;
  age_group: string;
  skill_metrics: Record<string, number>;
  completed_modules: string[];
  failed_attempts: Record<string, number>;
  average_completion_time: number;
  streak_data: { current: number; best: number };
  learning_style: Record<string, number>;
  last_analysis: ChallengeRemap | null;
  calculated_entropy: number | null;
  skill_variance: number | null;
  scaffolding_level: string;
  difficulty_adjustment: number;
  content_adaptations: string[];
  created_at: string;
  updated_at: string;
}

export function useEntropyAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<EntropyResult | null>(null);
  const [persistedProfile, setPersistedProfile] = useState<PersistedEntropyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { profile } = useLearningStore();

  // Load persisted profile on mount
  useEffect(() => {
    loadPersistedProfile();
  }, []);

  const loadPersistedProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('learner_entropy_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error loading entropy profile:", fetchError);
        setIsLoading(false);
        return;
      }

      if (data) {
        const typedData = data as unknown as PersistedEntropyProfile;
        setPersistedProfile(typedData);
        
        // Restore last analysis if available
        if (typedData.last_analysis && typedData.calculated_entropy !== null) {
          setLastAnalysis({
            result: typedData.last_analysis,
            calculatedEntropy: typedData.calculated_entropy,
            skillVariance: typedData.skill_variance || 0,
          });
        }
      }
      setIsLoading(false);
    } catch (e) {
      console.error("Error loading persisted profile:", e);
      setIsLoading(false);
    }
  }, []);

  const saveEntropyProfile = useCallback(async (
    userId: string,
    ageGroup: AgeGroup,
    completedModules: string[],
    failedAttempts: Record<string, number>,
    analysisResult: EntropyResult
  ) => {
    try {
      // Check if profile exists
      const { data: existing } = await supabase
        .from('learner_entropy_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let data;
      let upsertError;

      if (existing) {
        // Update existing
        const result = await supabase
          .from('learner_entropy_profiles')
          .update({
            age_group: ageGroup,
            skill_metrics: { ...profile.skills },
            completed_modules: completedModules,
            failed_attempts: failedAttempts,
            average_completion_time: profile.averageTimePerMission || 120,
            streak_data: {
              current: profile.currentStreak,
              best: profile.longestStreak,
            },
            learning_style: { ...profile.learningStyle },
            last_analysis: JSON.parse(JSON.stringify(analysisResult.result)),
            calculated_entropy: analysisResult.calculatedEntropy,
            skill_variance: analysisResult.skillVariance,
            scaffolding_level: analysisResult.result.scaffoldingLevel,
            difficulty_adjustment: analysisResult.result.difficultyAdjustment,
            content_adaptations: analysisResult.result.contentAdaptations,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single();
        data = result.data;
        upsertError = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('learner_entropy_profiles')
          .insert({
            user_id: userId,
            age_group: ageGroup,
            skill_metrics: { ...profile.skills },
            completed_modules: completedModules,
            failed_attempts: failedAttempts,
            average_completion_time: profile.averageTimePerMission || 120,
            streak_data: {
              current: profile.currentStreak,
              best: profile.longestStreak,
            },
            learning_style: { ...profile.learningStyle },
            last_analysis: JSON.parse(JSON.stringify(analysisResult.result)),
            calculated_entropy: analysisResult.calculatedEntropy,
            skill_variance: analysisResult.skillVariance,
            scaffolding_level: analysisResult.result.scaffoldingLevel,
            difficulty_adjustment: analysisResult.result.difficultyAdjustment,
            content_adaptations: analysisResult.result.contentAdaptations,
          })
          .select()
          .single();
        data = result.data;
        upsertError = result.error;
      }

      if (upsertError) {
        console.error("Error saving entropy profile:", upsertError);
        return;
      }

      if (data) {
        setPersistedProfile(data as unknown as PersistedEntropyProfile);
      }
    } catch (e) {
      console.error("Error persisting entropy profile:", e);
    }
  }, [profile]);

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
      
      // Persist to database
      await saveEntropyProfile(userId, ageGroup, completedModules, failedAttempts, data);
      
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      console.error("Entropy analysis error:", e);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [profile, saveEntropyProfile]);

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

  const updateCompletedModules = useCallback(async (
    userId: string,
    moduleId: string
  ) => {
    if (!persistedProfile) return;
    
    const updatedModules = [...new Set([...persistedProfile.completed_modules, moduleId])];
    
    const { error: updateError } = await supabase
      .from('learner_entropy_profiles')
      .update({ 
        completed_modules: updatedModules,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error("Error updating completed modules:", updateError);
    } else {
      setPersistedProfile(prev => prev ? { ...prev, completed_modules: updatedModules } : null);
    }
  }, [persistedProfile]);

  const recordFailedAttempt = useCallback(async (
    userId: string,
    moduleId: string
  ) => {
    if (!persistedProfile) return;
    
    const updatedAttempts = {
      ...persistedProfile.failed_attempts,
      [moduleId]: (persistedProfile.failed_attempts[moduleId] || 0) + 1
    };
    
    const { error: updateError } = await supabase
      .from('learner_entropy_profiles')
      .update({ 
        failed_attempts: updatedAttempts,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error("Error recording failed attempt:", updateError);
    } else {
      setPersistedProfile(prev => prev ? { ...prev, failed_attempts: updatedAttempts } : null);
    }
  }, [persistedProfile]);

  return {
    isAnalyzing,
    isLoading,
    lastAnalysis,
    persistedProfile,
    error,
    analyzeEntropy,
    getQuickRecommendation,
    calculateLocalEntropy,
    loadPersistedProfile,
    updateCompletedModules,
    recordFailedAttempt,
  };
}
