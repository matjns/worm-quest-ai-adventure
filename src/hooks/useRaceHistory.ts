import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RaceHistoryEntry {
  id: string;
  race_id: string;
  race_name: string;
  race_distance: number;
  worm_name: string;
  position: number;
  finish_rank: number | null;
  finished_at: string | null;
  created_at: string;
  started_at: string | null;
  race_status: string;
  participant_count: number;
  circuit_data: Record<string, unknown>;
}

export interface RaceStats {
  totalRaces: number;
  totalWins: number;
  totalPodiums: number;
  winRate: number;
  avgFinishPosition: number;
  bestStreak: number;
  currentStreak: number;
  totalDistance: number;
  avgNeuronCount: number;
  avgConnectionCount: number;
  favoriteWormName: string | null;
}

export interface PerformanceTrend {
  date: string;
  finishPosition: number;
  neuronCount: number;
  connectionCount: number;
  raceIndex: number;
}

export function useRaceHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<RaceHistoryEntry[]>([]);
  const [stats, setStats] = useState<RaceStats | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user's race participations with race session data
      const { data: participations, error: participationsError } = await supabase
        .from("race_participants")
        .select(`
          id,
          race_id,
          worm_name,
          position,
          finish_rank,
          finished_at,
          created_at,
          circuit_data,
          race_sessions (
            name,
            race_distance,
            status,
            started_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (participationsError) throw participationsError;

      // Get participant counts for each race
      const raceIds = [...new Set(participations?.map(p => p.race_id) || [])];
      
      const { data: participantCounts, error: countsError } = await supabase
        .from("race_participants")
        .select("race_id")
        .in("race_id", raceIds);

      if (countsError) throw countsError;

      // Count participants per race
      const countMap = new Map<string, number>();
      participantCounts?.forEach(p => {
        countMap.set(p.race_id, (countMap.get(p.race_id) || 0) + 1);
      });

      // Transform data
      const historyEntries: RaceHistoryEntry[] = (participations || []).map(p => {
        const raceSession = p.race_sessions as {
          name: string;
          race_distance: number;
          status: string;
          started_at: string | null;
        } | null;

        return {
          id: p.id,
          race_id: p.race_id,
          race_name: raceSession?.name || "Unknown Race",
          race_distance: raceSession?.race_distance || 100,
          worm_name: p.worm_name,
          position: p.position,
          finish_rank: p.finish_rank,
          finished_at: p.finished_at,
          created_at: p.created_at,
          started_at: raceSession?.started_at || null,
          race_status: raceSession?.status || "unknown",
          participant_count: countMap.get(p.race_id) || 1,
          circuit_data: p.circuit_data as Record<string, unknown>,
        };
      });

      setHistory(historyEntries);

      // Calculate stats
      const finishedRaces = historyEntries.filter(r => r.finish_rank !== null);
      const wins = finishedRaces.filter(r => r.finish_rank === 1).length;
      const podiums = finishedRaces.filter(r => r.finish_rank && r.finish_rank <= 3).length;

      // Calculate streaks
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      for (const race of finishedRaces) {
        if (race.finish_rank === 1) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
          currentStreak = tempStreak;
        } else {
          tempStreak = 0;
          currentStreak = 0;
        }
      }

      // Calculate average neuron/connection counts
      let totalNeurons = 0;
      let totalConnections = 0;
      const wormNameCounts = new Map<string, number>();

      historyEntries.forEach(entry => {
        const neurons = (entry.circuit_data?.neurons as unknown[]) || [];
        const connections = (entry.circuit_data?.connections as unknown[]) || [];
        totalNeurons += neurons.length;
        totalConnections += connections.length;
        wormNameCounts.set(entry.worm_name, (wormNameCounts.get(entry.worm_name) || 0) + 1);
      });

      // Find favorite worm name
      let favoriteWormName: string | null = null;
      let maxCount = 0;
      wormNameCounts.forEach((count, name) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteWormName = name;
        }
      });

      const calculatedStats: RaceStats = {
        totalRaces: historyEntries.length,
        totalWins: wins,
        totalPodiums: podiums,
        winRate: finishedRaces.length > 0 ? (wins / finishedRaces.length) * 100 : 0,
        avgFinishPosition: finishedRaces.length > 0
          ? finishedRaces.reduce((sum, r) => sum + (r.finish_rank || 0), 0) / finishedRaces.length
          : 0,
        bestStreak,
        currentStreak,
        totalDistance: historyEntries.reduce((sum, r) => sum + r.race_distance, 0),
        avgNeuronCount: historyEntries.length > 0 ? totalNeurons / historyEntries.length : 0,
        avgConnectionCount: historyEntries.length > 0 ? totalConnections / historyEntries.length : 0,
        favoriteWormName,
      };

      setStats(calculatedStats);

      // Calculate performance trends (last 20 races, oldest first for charting)
      const trendData: PerformanceTrend[] = finishedRaces
        .slice(0, 20)
        .reverse()
        .map((race, index) => {
          const neurons = (race.circuit_data?.neurons as unknown[]) || [];
          const connections = (race.circuit_data?.connections as unknown[]) || [];
          return {
            date: race.finished_at || race.created_at,
            finishPosition: race.finish_rank || 0,
            neuronCount: neurons.length,
            connectionCount: connections.length,
            raceIndex: index + 1,
          };
        });

      setTrends(trendData);
    } catch (err) {
      console.error("Error fetching race history:", err);
      setError("Failed to load race history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    stats,
    trends,
    loading,
    error,
    refetch: fetchHistory,
  };
}
