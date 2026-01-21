import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NeuronInput {
  neuronId: string;
  type: string;
  connections: number;
  position: { x: number; y: number; z: number };
}

export interface GliaAnalysisResult {
  neuronId: string;
  hasGliaInVivo: boolean;
  gliaType: 'sheath' | 'socket' | 'CEPsh' | 'none';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  reasoning: string;
  recommendation: string;
}

export interface GliaAnalysisResponse {
  analysis: GliaAnalysisResult[];
  overallImpact: {
    chemotaxisAccuracy: number;
    mechanosensationAccuracy: number;
    thermotaxisAccuracy: number;
  };
  summary: string;
}

export function useGliaAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<GliaAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeNeurons = useCallback(async (
    neurons: NeuronInput[],
    analysisType: 'omission' | 'impact' | 'recommendation' = 'omission'
  ) => {
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('glia-analysis', {
        body: { neurons, analysisType },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
      toast.success('Glia analysis complete!');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(`Analysis failed: ${message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    analyzeNeurons,
    isAnalyzing,
    results,
    error,
    reset,
  };
}
