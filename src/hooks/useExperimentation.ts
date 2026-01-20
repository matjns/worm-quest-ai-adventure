import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SimulationVariant {
  id: string;
  name: string;
  connections: Array<{ from: string; to: string; weight: number }>;
  neurons: string[];
  successRate: number;
  testCount: number;
  createdAt: number;
  notes?: string;
}

export interface ExperimentResult {
  variantId: string;
  success: boolean;
  metrics: {
    signalPropagation: number;
    motorActivation: number;
    responseTime: number;
  };
  timestamp: number;
}

interface AIAnalysis {
  assessment?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: Array<{ type: string; details: string; rationale: string }>;
  scientificInsight?: string;
  confidenceScore?: number;
}

interface AISuggestion {
  suggestedVariant?: {
    name: string;
    changes: string[];
    hypothesis: string;
    connections: Array<{ from: string; to: string; weight: number }>;
    rationale: string;
  };
  alternativeVariants?: Array<{ name: string; changes: string[]; rationale: string }>;
  estimatedImprovement?: string;
}

interface AIComparison {
  bestVariant?: string;
  ranking?: string[];
  patterns?: {
    successFactors: string[];
    failureFactors: string[];
  };
  statisticalNote?: string;
  nextSteps?: string[];
}

interface AIValidation {
  isValid?: boolean;
  validationScore?: number;
  concerns?: string[];
  alignmentWithBiology?: string;
  suggestions?: string[];
  readyForSubmission?: boolean;
  submissionNotes?: string;
}

const STORAGE_KEY = "neuroquest-experiments";

export function useExperimentation() {
  const [variants, setVariants] = useState<SimulationVariant[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [currentComparison, setCurrentComparison] = useState<AIComparison | null>(null);
  const [currentValidation, setCurrentValidation] = useState<AIValidation | null>(null);

  const saveVariants = useCallback((newVariants: SimulationVariant[]) => {
    setVariants(newVariants);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVariants));
  }, []);

  const createVariant = useCallback((
    name: string,
    connections: SimulationVariant["connections"],
    neurons: string[],
    notes?: string
  ): SimulationVariant => {
    const variant: SimulationVariant = {
      id: `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      connections,
      neurons,
      successRate: 0,
      testCount: 0,
      createdAt: Date.now(),
      notes,
    };
    
    const newVariants = [...variants, variant];
    saveVariants(newVariants);
    toast.success(`Created variant: ${name}`);
    return variant;
  }, [variants, saveVariants]);

  const recordTestResult = useCallback((variantId: string, success: boolean, metrics: ExperimentResult["metrics"]) => {
    const result: ExperimentResult = {
      variantId,
      success,
      metrics,
      timestamp: Date.now(),
    };
    
    setResults(prev => [...prev, result]);
    
    // Update variant statistics
    const newVariants = variants.map(v => {
      if (v.id === variantId) {
        const newTestCount = v.testCount + 1;
        const newSuccessRate = ((v.successRate * v.testCount) + (success ? 1 : 0)) / newTestCount;
        return { ...v, testCount: newTestCount, successRate: newSuccessRate };
      }
      return v;
    });
    saveVariants(newVariants);
    
    return result;
  }, [variants, saveVariants]);

  const analyzeVariant = useCallback(async (variant: SimulationVariant, targetBehavior: string) => {
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    
    try {
      const response = await supabase.functions.invoke("experiment-ai", {
        body: {
          type: "analyze",
          currentVariant: variant,
          targetBehavior,
        },
      });
      
      if (response.error) throw response.error;
      
      const analysis = response.data?.result as AIAnalysis;
      setCurrentAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze variant");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getSuggestion = useCallback(async (
    currentVariant: SimulationVariant,
    targetBehavior: string,
    userFeedback?: string
  ) => {
    setIsAnalyzing(true);
    setCurrentSuggestion(null);
    
    try {
      const response = await supabase.functions.invoke("experiment-ai", {
        body: {
          type: "suggest",
          currentVariant,
          targetBehavior,
          userFeedback,
        },
      });
      
      if (response.error) throw response.error;
      
      const suggestion = response.data?.result as AISuggestion;
      setCurrentSuggestion(suggestion);
      return suggestion;
    } catch (error) {
      console.error("Suggestion error:", error);
      toast.error("Failed to get AI suggestions");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const compareVariants = useCallback(async (variantsToCompare: SimulationVariant[], targetBehavior: string) => {
    setIsAnalyzing(true);
    setCurrentComparison(null);
    
    try {
      const response = await supabase.functions.invoke("experiment-ai", {
        body: {
          type: "compare",
          variants: variantsToCompare,
          targetBehavior,
        },
      });
      
      if (response.error) throw response.error;
      
      const comparison = response.data?.result as AIComparison;
      setCurrentComparison(comparison);
      return comparison;
    } catch (error) {
      console.error("Comparison error:", error);
      toast.error("Failed to compare variants");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const validateExperiment = useCallback(async (
    variant: SimulationVariant,
    targetBehavior: string,
    observations?: string
  ) => {
    setIsAnalyzing(true);
    setCurrentValidation(null);
    
    try {
      const response = await supabase.functions.invoke("experiment-ai", {
        body: {
          type: "validate",
          currentVariant: variant,
          targetBehavior,
          userFeedback: observations,
        },
      });
      
      if (response.error) throw response.error;
      
      const validation = response.data?.result as AIValidation;
      setCurrentValidation(validation);
      return validation;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate experiment");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const deleteVariant = useCallback((variantId: string) => {
    const newVariants = variants.filter(v => v.id !== variantId);
    saveVariants(newVariants);
    toast.success("Variant deleted");
  }, [variants, saveVariants]);

  const duplicateVariant = useCallback((variantId: string, newName: string) => {
    const original = variants.find(v => v.id === variantId);
    if (!original) return null;
    
    return createVariant(
      newName,
      [...original.connections],
      [...original.neurons],
      `Duplicated from ${original.name}`
    );
  }, [variants, createVariant]);

  return {
    variants,
    results,
    isAnalyzing,
    currentAnalysis,
    currentSuggestion,
    currentComparison,
    currentValidation,
    createVariant,
    recordTestResult,
    analyzeVariant,
    getSuggestion,
    compareVariants,
    validateExperiment,
    deleteVariant,
    duplicateVariant,
  };
}
