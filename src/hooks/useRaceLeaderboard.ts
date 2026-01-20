import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RacerStats {
  id: string;
  user_id: string;
  worm_name: string;
  display_name: string;
  avatar_url: string | null;
  races_participated: number;
  wins: number;
  podiums: number; // Top 3 finishes
  avg_finish_position: number;
  win_rate: number;
  total_neurons: number;
  total_connections: number;
  fastest_finish_time: number | null;
  circuit_data: Record<string, unknown> | null;
}

export interface CircuitStats {
  circuit_id: string;
  worm_name: string;
  display_name: string;
  user_id: string;
  neuron_count: number;
  connection_count: number;
  races_used: number;
  wins_with_circuit: number;
  avg_position: number;
}

export interface LeaderboardData {
  topWinners: RacerStats[];
  fastestCircuits: CircuitStats[];
  mostActive: RacerStats[];
  recentWinners: {
    id: string;
    worm_name: string;
    display_name: string;
    race_name: string;
    finished_at: string;
  }[];
  totalStats: {
    totalRaces: number;
    totalParticipants: number;
    avgParticipantsPerRace: number;
  };
}

export function useRaceLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all finished race participants with their profiles
      const { data: participants, error: participantsError } = await supabase
        .from("race_participants")
        .select(`
          id,
          user_id,
          worm_name,
          circuit_data,
          position,
          finish_rank,
          finished_at,
          race_id,
          race_sessions!inner (
            id,
            name,
            status
          )
        `)
        .not("finish_rank", "is", null)
        .order("finished_at", { ascending: false });

      if (participantsError) throw participantsError;

      // Fetch profiles separately
      const userIds = [...new Set((participants || []).map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch total race stats
      const { data: raceSessions } = await supabase
        .from("race_sessions")
        .select("id, status")
        .eq("status", "finished");

      // Aggregate stats by user/worm
      const statsMap = new Map<string, RacerStats>();
      
      (participants || []).forEach(p => {
        const key = `${p.user_id}-${p.worm_name}`;
        const profile = profileMap.get(p.user_id);
        const circuitData = p.circuit_data as Record<string, unknown>;
        const neurons = (circuitData?.neurons as unknown[]) || [];
        const connections = (circuitData?.connections as unknown[]) || [];
        
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            id: key,
            user_id: p.user_id,
            worm_name: p.worm_name,
            display_name: profile?.display_name || "Anonymous",
            avatar_url: profile?.avatar_url || null,
            races_participated: 0,
            wins: 0,
            podiums: 0,
            avg_finish_position: 0,
            win_rate: 0,
            total_neurons: neurons.length,
            total_connections: connections.length,
            fastest_finish_time: null,
            circuit_data: circuitData,
          });
        }
        
        const stats = statsMap.get(key)!;
        stats.races_participated++;
        
        if (p.finish_rank === 1) stats.wins++;
        if (p.finish_rank && p.finish_rank <= 3) stats.podiums++;
        
        // Track avg position
        stats.avg_finish_position = 
          ((stats.avg_finish_position * (stats.races_participated - 1)) + (p.finish_rank || 0)) / 
          stats.races_participated;
        
        // Update neuron/connection counts if higher
        stats.total_neurons = Math.max(stats.total_neurons, neurons.length);
        stats.total_connections = Math.max(stats.total_connections, connections.length);
      });

      // Calculate win rates
      statsMap.forEach(stats => {
        stats.win_rate = stats.races_participated > 0 
          ? (stats.wins / stats.races_participated) * 100 
          : 0;
      });

      const allStats = Array.from(statsMap.values());

      // Top winners (by wins, then win rate)
      const topWinners = [...allStats]
        .filter(s => s.races_participated >= 1)
        .sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.win_rate - a.win_rate;
        })
        .slice(0, 10);

      // Most active (by races participated)
      const mostActive = [...allStats]
        .sort((a, b) => b.races_participated - a.races_participated)
        .slice(0, 10);

      // Fastest/most efficient circuits (best avg position with most neurons)
      const fastestCircuits: CircuitStats[] = [...allStats]
        .filter(s => s.races_participated >= 1 && s.total_neurons > 0)
        .map(s => ({
          circuit_id: s.id,
          worm_name: s.worm_name,
          display_name: s.display_name,
          user_id: s.user_id,
          neuron_count: s.total_neurons,
          connection_count: s.total_connections,
          races_used: s.races_participated,
          wins_with_circuit: s.wins,
          avg_position: s.avg_finish_position,
        }))
        .sort((a, b) => {
          // Sort by wins first, then by avg position
          if (b.wins_with_circuit !== a.wins_with_circuit) {
            return b.wins_with_circuit - a.wins_with_circuit;
          }
          return a.avg_position - b.avg_position;
        })
        .slice(0, 10);

      // Recent winners
      const recentWinners = (participants || [])
        .filter(p => p.finish_rank === 1)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          worm_name: p.worm_name,
          display_name: profileMap.get(p.user_id)?.display_name || "Anonymous",
          race_name: (p.race_sessions as any)?.name || "Unknown Race",
          finished_at: p.finished_at || "",
        }));

      // Total stats
      const totalRaces = raceSessions?.length || 0;
      const totalParticipants = participants?.length || 0;

      setLeaderboard({
        topWinners,
        fastestCircuits,
        mostActive,
        recentWinners,
        totalStats: {
          totalRaces,
          totalParticipants,
          avgParticipantsPerRace: totalRaces > 0 ? totalParticipants / totalRaces : 0,
        },
      });
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
}
