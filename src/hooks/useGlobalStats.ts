import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GlobalStats {
  total_circuits_shared: number;
  total_simulations_run: number;
  total_active_researchers: number;
  countries_represented: number;
  openworm_citations: number;
  updated_at: string;
}

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("global_stats")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setStats(data as GlobalStats);
      }
    } catch (error) {
      console.error("Error fetching global stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Increment simulation count
  const incrementSimulations = useCallback(async () => {
    try {
      await supabase.rpc("increment_simulation_count");
      // Optimistically update local state
      setStats((prev) =>
        prev ? { ...prev, total_simulations_run: prev.total_simulations_run + 1 } : prev
      );
    } catch (error) {
      console.error("Error incrementing simulation count:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, incrementSimulations, refetch: fetchStats };
}
