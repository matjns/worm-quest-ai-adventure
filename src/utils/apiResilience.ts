// API resilience utilities with c302-cached fallbacks
// Error handling with patriotic retry messages

import { REFERENCE_CONNECTIONS, NEURON_PALETTE, simulateCircuit } from "@/data/neuronData";

export const RESILIENCE_MESSAGES = [
  "Rebooting worm resilience—America endures.",
  "Neural pathways rebuilding—stronger than before.",
  "C. elegans never gives up, and neither do we.",
  "Synaptic recovery in progress—stand by for science.",
  "302 neurons, infinite determination.",
];

export function getResilienceMessage(): string {
  return RESILIENCE_MESSAGES[Math.floor(Math.random() * RESILIENCE_MESSAGES.length)];
}

// Cached c302 reference data for offline fallback
export const C302_CACHED_DATA = {
  neurons: NEURON_PALETTE,
  connections: REFERENCE_CONNECTIONS,
  behaviors: {
    touch_head: { expected: "move_backward", description: "Retreat from anterior stimulus" },
    touch_tail: { expected: "move_forward", description: "Escape via forward locomotion" },
    smell_food: { expected: "head_wiggle", description: "Chemotactic orientation response" },
  },
  pathways: {
    touch_reflex: ["ALML", "ALMR", "AVM", "AVAL", "AVAR", "DA1", "VA1"],
    forward_locomotion: ["PLML", "PLMR", "AVBL", "AVBR", "DB1", "VB1"],
    chemotaxis: ["ASEL", "ASER", "AIYL", "AIYR", "SMBD", "SMBV"],
  },
};

// Validate simulation against ground truth
export interface ValidationResult {
  isValid: boolean;
  accuracy: number;
  feedback: string;
  suggestions?: string[];
}

export function validateAgainstGroundTruth(
  userCircuit: { neurons: string[]; connections: Array<{ from: string; to: string; weight: number; type?: "chemical" | "electrical" }> },
  stimulus: "touch_head" | "touch_tail" | "smell_food"
): ValidationResult {
  const expectedBehavior = C302_CACHED_DATA.behaviors[stimulus];
  
  // Add default type to connections for simulation
  const connectionsWithType = userCircuit.connections.map(c => ({
    ...c,
    type: c.type || "chemical" as const,
  }));
  
  // Run simulation
  const result = simulateCircuit(connectionsWithType, stimulus, userCircuit.neurons);
  
  // Calculate accuracy based on pathway completion
  const expectedPathway = stimulus === "touch_head" 
    ? C302_CACHED_DATA.pathways.touch_reflex
    : stimulus === "touch_tail"
    ? C302_CACHED_DATA.pathways.forward_locomotion
    : C302_CACHED_DATA.pathways.chemotaxis;
  
  const pathwayNeurons = expectedPathway.filter(n => userCircuit.neurons.includes(n));
  const pathwayCompleteness = pathwayNeurons.length / expectedPathway.length;
  
  // Check if behavior matches
  const behaviorMatch = result.behavior === expectedBehavior.expected;
  
  // Calculate overall accuracy (weighted average)
  const accuracy = (pathwayCompleteness * 0.6 + (behaviorMatch ? 1 : 0) * 0.4) * 100;
  
  const isValid = accuracy >= 75;
  
  const suggestions: string[] = [];
  if (!behaviorMatch) {
    suggestions.push(`Expected ${expectedBehavior.expected} but got ${result.behavior}`);
  }
  
  const missingNeurons = expectedPathway.filter(n => !userCircuit.neurons.includes(n));
  if (missingNeurons.length > 0) {
    suggestions.push(`Consider adding: ${missingNeurons.slice(0, 3).join(', ')}`);
  }
  
  return {
    isValid,
    accuracy,
    feedback: isValid 
      ? `Excellent! ${accuracy.toFixed(1)}% match with CElegansNeuroML ground truth.`
      : `${accuracy.toFixed(1)}% accuracy. ${expectedBehavior.description} pathway needs work.`,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  onRetry?: (attempt: number, message: string) => void
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        
        if (onRetry) {
          onRetry(attempt, getResilienceMessage());
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Calculate emergent locomotion metrics from adjacency matrix
export interface LocomotionMetrics {
  forwardBias: number;
  velocityChange: number;
  bifurcationPoint: number | null;
  dominantBehavior: string;
}

export function calculateEmergentLocomotion(
  adjacencyMatrix: number[][],
  neuronIds: string[]
): LocomotionMetrics {
  // Find forward and backward command indices
  const forwardNeurons = ["AVBL", "AVBR", "DB1", "DB2", "VB1"];
  const backwardNeurons = ["AVAL", "AVAR", "DA1", "DA2", "VA1"];
  
  let forwardWeight = 0;
  let backwardWeight = 0;
  
  neuronIds.forEach((neuronId, i) => {
    const totalWeight = adjacencyMatrix[i]?.reduce((sum, w) => sum + w, 0) || 0;
    
    if (forwardNeurons.includes(neuronId)) {
      forwardWeight += totalWeight;
    } else if (backwardNeurons.includes(neuronId)) {
      backwardWeight += totalWeight;
    }
  });
  
  const totalWeight = forwardWeight + backwardWeight || 1;
  const forwardBias = ((forwardWeight - backwardWeight) / totalWeight) * 100;
  
  // Calculate velocity change based on motor neuron connectivity
  const motorConnections = adjacencyMatrix.reduce((sum, row, i) => {
    if (neuronIds[i]?.startsWith('D') || neuronIds[i]?.startsWith('V')) {
      return sum + row.reduce((a, b) => a + b, 0);
    }
    return sum;
  }, 0);
  
  const velocityChange = (motorConnections / (neuronIds.length || 1)) * 20;
  
  // Detect bifurcation point (threshold where behavior switches)
  const bifurcationPoint = Math.abs(forwardBias) > 50 ? Math.abs(forwardBias) : null;
  
  const dominantBehavior = forwardBias > 10 
    ? "Forward locomotion dominant" 
    : forwardBias < -10 
    ? "Backward locomotion dominant"
    : "Balanced/oscillatory behavior";
  
  return {
    forwardBias,
    velocityChange,
    bifurcationPoint,
    dominantBehavior,
  };
}
