import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface Neuron {
  id: string;
  color: string;
  size: number;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

interface CircuitState {
  neurons: Neuron[];
  connections: Connection[];
}

interface DiscoveryHint {
  hint: string;
  type: 'add_neuron' | 'make_connection' | 'experiment' | 'pattern';
  emoji: string;
}

type AgeGroup = 'prek' | 'k5' | 'middle' | 'high';

export function useDiscoveryHints(ageGroup: AgeGroup = 'k5') {
  const [currentHint, setCurrentHint] = useState<DiscoveryHint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const previousHintsRef = useRef<string[]>([]);
  const lastCircuitStateRef = useRef<string>('');

  const getHint = useCallback(async (circuitState: CircuitState) => {
    // Avoid duplicate requests for same state
    const stateHash = JSON.stringify({
      neurons: circuitState.neurons.length,
      connections: circuitState.connections.length,
    });
    
    if (stateHash === lastCircuitStateRef.current && currentHint) {
      setIsVisible(true);
      return;
    }
    lastCircuitStateRef.current = stateHash;

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/discovery-hints`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            circuitState,
            ageGroup,
            previousHints: previousHintsRef.current,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many requests. Try again in a moment!");
          return;
        }
        if (response.status === 402) {
          toast.error("AI hints temporarily unavailable");
          return;
        }
        throw new Error('Failed to get hint');
      }

      const data = await response.json();
      const hint = data.result as DiscoveryHint;
      
      if (hint?.hint) {
        previousHintsRef.current = [...previousHintsRef.current.slice(-5), hint.hint];
        setCurrentHint(hint);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Discovery hint error:', error);
      // Fallback hints if AI fails
      const fallbackHints: DiscoveryHint[] = [
        { hint: "Try adding more neurons!", emoji: "🧠", type: 'add_neuron' },
        { hint: "Connect two neurons to see what happens!", emoji: "⚡", type: 'make_connection' },
        { hint: "What if you made a chain of neurons?", emoji: "🔗", type: 'pattern' },
      ];
      const fallback = fallbackHints[Math.floor(Math.random() * fallbackHints.length)];
      setCurrentHint(fallback);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [ageGroup, currentHint]);

  const dismissHint = useCallback(() => {
    setIsVisible(false);
  }, []);

  const clearHints = useCallback(() => {
    setCurrentHint(null);
    setIsVisible(false);
    previousHintsRef.current = [];
    lastCircuitStateRef.current = '';
  }, []);

  return {
    currentHint,
    isLoading,
    isVisible,
    getHint,
    dismissHint,
    clearHints,
  };
}
