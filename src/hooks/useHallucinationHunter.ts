import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CircuitBuild {
  neurons: Array<{
    id: string;
    type: 'sensory' | 'interneuron' | 'motor';
    position: { x: number; y: number; z: number };
    activity?: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    type: 'chemical' | 'gap_junction';
  }>;
  targetBehavior?: string;
  simulationResults?: {
    outputPattern: number[];
    timing: number[];
    entropy: number;
  };
}

export interface HallucinationResult {
  accuracy: {
    overall: number;
    byDimension: {
      connectome: number;
      dynamics: number;
      behavior: number;
      physics: number;
    };
    confidence: number;
  };
  structural: {
    connectomeFidelity: number;
    missingNeurons: string[];
    extraConnections: number;
  };
  hallucinations: {
    score: number;
    flags: Array<{
      type: string;
      evidence?: string;
      description?: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    physicsViolations: string[];
  };
  optimizations: Array<{
    type: 'add_neuron' | 'remove_connection' | 'adjust_weight' | 'add_connection';
    target: string;
    value?: number;
    reason: string;
    priority: number;
  }>;
  iteration: {
    plan: Array<{
      step: number;
      action: string;
      expectedImprovement: number;
    }>;
    suggestedIterations: number;
  };
  mastery: {
    currentLevel: 'novice' | 'intermediate' | 'advanced' | 'expert';
    nextMilestone: string;
    skillsToImprove: string[];
  };
  insight: string;
  passesValidation: boolean;
}

export function useHallucinationHunter() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HallucinationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [iterationHistory, setIterationHistory] = useState<HallucinationResult[]>([]);

  const analyzeCircuit = useCallback(async (
    circuitBuild: CircuitBuild,
    options?: {
      iterations?: number;
      autoOptimize?: boolean;
    }
  ): Promise<HallucinationResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('hallucination-hunter', {
        body: { 
          circuitBuild, 
          iterations: options?.iterations ?? 3,
          autoOptimize: options?.autoOptimize ?? true,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Analysis failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      setIterationHistory(prev => [...prev, data]);
      
      if (data.passesValidation) {
        toast.success(`Validation passed! Accuracy: ${data.accuracy.overall.toFixed(1)}%`);
      } else if (data.hallucinations.score > 0.5) {
        toast.error('High hallucination score detected', {
          description: 'Review the flagged issues to improve accuracy',
        });
      } else {
        toast.warning('Validation incomplete - see optimization suggestions');
      }

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

  const applyOptimization = useCallback((
    build: CircuitBuild,
    optimization: HallucinationResult['optimizations'][0]
  ): CircuitBuild => {
    const newBuild = JSON.parse(JSON.stringify(build)) as CircuitBuild;

    switch (optimization.type) {
      case 'add_neuron':
        newBuild.neurons.push({
          id: optimization.target,
          type: 'interneuron',
          position: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: 0 },
        });
        break;
      case 'remove_connection':
        const [from, to] = optimization.target.split('->');
        newBuild.connections = newBuild.connections.filter(
          c => !(c.from === from && c.to === to)
        );
        break;
      case 'adjust_weight':
        const [fromW, toW] = optimization.target.split('->');
        const conn = newBuild.connections.find(c => c.from === fromW && c.to === toW);
        if (conn && optimization.value !== undefined) {
          conn.weight = optimization.value;
        }
        break;
      case 'add_connection':
        const [fromC, toC] = optimization.target.split('->');
        newBuild.connections.push({
          from: fromC,
          to: toC,
          weight: optimization.value ?? 1,
          type: 'chemical',
        });
        break;
    }

    return newBuild;
  }, []);

  const runAutoIteration = useCallback(async (
    initialBuild: CircuitBuild,
    maxIterations: number = 3
  ): Promise<{ finalBuild: CircuitBuild; history: HallucinationResult[] }> => {
    let currentBuild = initialBuild;
    const history: HallucinationResult[] = [];

    for (let i = 0; i < maxIterations; i++) {
      const result = await analyzeCircuit(currentBuild, { autoOptimize: true });
      if (!result) break;
      
      history.push(result);
      
      if (result.passesValidation || result.optimizations.length === 0) {
        break;
      }

      // Apply top optimization
      currentBuild = applyOptimization(currentBuild, result.optimizations[0]);
      
      toast.info(`Iteration ${i + 1}: Applied ${result.optimizations[0].type}`, {
        description: result.optimizations[0].reason,
      });
    }

    return { finalBuild: currentBuild, history };
  }, [analyzeCircuit, applyOptimization]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIterationHistory([]);
  }, []);

  return {
    analyzeCircuit,
    applyOptimization,
    runAutoIteration,
    isAnalyzing,
    result,
    error,
    iterationHistory,
    reset,
  };
}
