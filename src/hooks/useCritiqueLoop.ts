import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PerturbationInput {
  type: 'neurotransmitter' | 'synapse' | 'neuron_ablation' | 'connection_weight';
  target: string;
  value: number;
  originalValue?: number;
  circuit?: string;
}

export interface SimulationState {
  neurons: Array<{
    id: string;
    activity: number;
    membrane_potential: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    type: string;
  }>;
  timeStep: number;
  entropy?: number;
}

export interface CritiqueResult {
  validation: {
    score: number;
    biologicalAccuracy: number;
    isValid: boolean;
    groundTruthReference: string;
    warnings: string[];
    deviationScore: number;
  };
  chaos: {
    isChaotic: boolean;
    lyapunovExponent: number;
    entropy: number;
    attractorType: 'fixed_point' | 'limit_cycle' | 'strange_attractor' | 'stable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    explanation: string;
    confidence: number;
  };
  prediction: {
    expectedBehavior: string;
    groundTruthAlignment: string;
  };
  recommendations: string[];
  educational: {
    insight: string;
    citations: string[];
  };
  redAlert: boolean;
}

export function useCritiqueLoop() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationHistory, setValidationHistory] = useState<CritiqueResult[]>([]);

  const validatePerturbation = useCallback(async (
    perturbation: PerturbationInput,
    simulationState: SimulationState,
    userHypothesis?: string
  ): Promise<CritiqueResult | null> => {
    setIsValidating(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('critique-loop', {
        body: { perturbation, simulationState, userHypothesis },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Validation failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Type-safe result mapping
      const critiqueResult: CritiqueResult = {
        validation: {
          score: data.validation?.score ?? 0,
          biologicalAccuracy: data.validation?.biologicalAccuracy ?? 0,
          isValid: data.validation?.isValid ?? false,
          groundTruthReference: data.validation?.groundTruthReference ?? '',
          warnings: data.validation?.warnings ?? [],
          deviationScore: data.validation?.deviationScore ?? 0,
        },
        chaos: {
          isChaotic: data.chaos?.isChaotic ?? false,
          lyapunovExponent: data.chaos?.lyapunovExponent ?? 0,
          entropy: data.chaos?.entropy ?? 0,
          attractorType: data.chaos?.attractorType ?? 'stable',
          riskLevel: data.chaos?.riskLevel ?? 'low',
          explanation: data.chaos?.explanation ?? '',
          confidence: data.chaos?.confidence ?? 0,
        },
        prediction: {
          expectedBehavior: data.prediction?.expectedBehavior ?? '',
          groundTruthAlignment: data.prediction?.groundTruthAlignment ?? '',
        },
        recommendations: data.recommendations ?? [],
        educational: {
          insight: data.educational?.insight ?? '',
          citations: data.educational?.citations ?? [],
        },
        redAlert: data.redAlert ?? false,
      };

      setResult(critiqueResult);
      setValidationHistory(prev => [...prev, critiqueResult]);
      
      // Enhanced toast notifications based on actual response
      if (critiqueResult.redAlert) {
        const riskEmoji = critiqueResult.chaos.riskLevel === 'critical' ? '🚨' : '⚠️';
        toast.error(`${riskEmoji} Red Alert: ${critiqueResult.chaos.attractorType.replace('_', ' ')} detected!`, {
          description: `Lyapunov: ${critiqueResult.chaos.lyapunovExponent.toFixed(2)} | Risk: ${critiqueResult.chaos.riskLevel}`,
          duration: 6000,
        });
      } else if (critiqueResult.validation.score >= 80) {
        toast.success(`✅ High accuracy validation: ${critiqueResult.validation.score}%`, {
          description: `Biological accuracy: ${critiqueResult.validation.biologicalAccuracy}%`,
        });
      } else if (critiqueResult.validation.score >= 50) {
        toast.warning(`Validation score: ${critiqueResult.validation.score}%`, {
          description: `${critiqueResult.recommendations.length} recommendations available`,
        });
      } else {
        toast.error(`Low validation score: ${critiqueResult.validation.score}%`, {
          description: critiqueResult.validation.warnings[0] || 'Review recommendations',
        });
      }

      return critiqueResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Validation failed: ${message}`);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setValidationHistory([]);
  }, []);

  return {
    validatePerturbation,
    isValidating,
    result,
    error,
    reset,
    validationHistory,
    clearHistory,
  };
}
