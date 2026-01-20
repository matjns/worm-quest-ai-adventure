import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SharedCircuit } from "@/hooks/useCommunity";

/**
 * Hook to handle circuit ID from URL query parameter
 * Returns the circuit ID if present and provides a function to clear it
 */
export function useCircuitFromUrl(circuits: SharedCircuit[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [circuitToOpen, setCircuitToOpen] = useState<SharedCircuit | null>(null);
  
  const circuitId = searchParams.get("circuit");

  useEffect(() => {
    if (circuitId && circuits.length > 0) {
      const circuit = circuits.find(c => c.id === circuitId);
      if (circuit) {
        setCircuitToOpen(circuit);
      }
    }
  }, [circuitId, circuits]);

  const clearCircuitParam = () => {
    setSearchParams((params) => {
      params.delete("circuit");
      return params;
    });
    setCircuitToOpen(null);
  };

  return { circuitToOpen, clearCircuitParam, hasCircuitParam: !!circuitId };
}
