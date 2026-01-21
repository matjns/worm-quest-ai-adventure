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

      setResult(data);
      
      if (data.redAlert) {
        toast.error('⚠️ Red Alert: Chaos attractor detected!', {
          description: 'Your perturbation may cause unstable dynamics',
          duration: 5000,
        });
      } else if (data.validation.score >= 80) {
        toast.success('Validation passed with high accuracy!');
      } else {
        toast.warning('Validation complete - see recommendations');
      }

      return data;
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

  return {
    validatePerturbation,
    isValidating,
    result,
    error,
    reset,
  };
}
