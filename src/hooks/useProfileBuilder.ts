import { useState, useCallback } from "react";
import { toast } from "sonner";

export type AgeGroup = "pre-k" | "k5" | "middle" | "high" | "college" | "phd";

export interface NeuronConfig {
  id: string;
  type: "sensory" | "motor" | "interneuron" | "command";
  name: string;
  position: { x: number; y: number };
  role: string;
}

export interface ConnectionConfig {
  from: string;
  to: string;
  weight: number;
  type: "chemical" | "electrical";
}

export interface ValidationStatus {
  c302Compatible: boolean;
  neuromlFidelity: number;
  biologicalAccuracy: string;
}

export interface SimulationParams {
  duration: number;
  timeStep: number;
  stimulusPattern: string;
}

export interface SimulationProfile {
  neurons: NeuronConfig[];
  connections: ConnectionConfig[];
  behavior: string;
  validationStatus: ValidationStatus;
  simulationParams: SimulationParams;
  explanation: string;
  learningObjectives: string[];
}

export interface CurrentProfile {
  completedModules: string[];
  skillLevels: Record<string, number>;
  interests: string[];
}

export function useProfileBuilder() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [lastProfile, setLastProfile] = useState<SimulationProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const buildProfile = useCallback(async (
    prompt: string,
    ageGroup: AgeGroup,
    currentProfile?: CurrentProfile
  ): Promise<SimulationProfile | null> => {
    setIsBuilding(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/profile-builder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            ageGroup,
            currentProfile,
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
        throw new Error("Failed to build profile");
      }

      const data = await response.json();
      const profile = data.result as SimulationProfile;
      
      setLastProfile(profile);
      setPromptHistory(prev => [...prev.slice(-9), prompt]); // Keep last 10 prompts
      
      toast.success(`Generated ${profile.neurons.length}-neuron simulation`, {
        description: `${Math.round(profile.validationStatus.neuromlFidelity * 100)}% NeuroML fidelity`,
      });
      
      return profile;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      console.error("Profile builder error:", e);
      return null;
    } finally {
      setIsBuilding(false);
    }
  }, []);

  const suggestPrompts = useCallback((ageGroup: AgeGroup): string[] => {
    const prompts: Record<AgeGroup, string[]> = {
      "pre-k": [
        "Make the worm wiggle!",
        "Touch the worm and see what happens",
        "The worm finds food",
      ],
      "k5": [
        "Build a simple touch reflex",
        "Make the worm move forward",
        "Connect the eye to the muscles",
      ],
      "middle": [
        "Create a chemotaxis response circuit",
        "Build an escape reflex from touch",
        "Design forward locomotion with AVB",
      ],
      "high": [
        "Mutate AVA for chemotaxis response",
        "Model thermotaxis decision circuit",
        "Build reversal command integration",
      ],
      "college": [
        "Simulate gap junction coupling in motor neurons",
        "Model oscillatory locomotion dynamics",
        "Analyze command neuron bistability",
      ],
      "phd": [
        "Explore bifurcation in AVA/AVB decision circuits",
        "Model chaos attractors in connectome dynamics",
        "Perturb hub neurons for network resilience analysis",
      ],
    };
    return prompts[ageGroup] || prompts["middle"];
  }, []);

  const getValidationDetails = useCallback((profile: SimulationProfile): string => {
    const { validationStatus } = profile;
    return `c302: ${validationStatus.c302Compatible ? "✓" : "✗"} | Fidelity: ${Math.round(validationStatus.neuromlFidelity * 100)}% | ${validationStatus.biologicalAccuracy}`;
  }, []);

  return {
    isBuilding,
    lastProfile,
    error,
    promptHistory,
    buildProfile,
    suggestPrompts,
    getValidationDetails,
  };
}
