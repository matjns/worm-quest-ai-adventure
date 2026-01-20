import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface PlayerRating {
  id: string;
  user_id: string;
  elo_rating: number;
  tier: SkillTier;
  total_races: number;
  wins: number;
  losses: number;
  win_streak: number;
  best_streak: number;
  rating_deviation: number;
  last_race_at: string | null;
}

export type SkillTier = 
  | "bronze" 
  | "silver" 
  | "gold" 
  | "platinum" 
  | "diamond" 
  | "master" 
  | "grandmaster";

export const TIER_CONFIG: Record<SkillTier, { 
  name: string; 
  color: string; 
  minElo: number;
  maxElo: number;
  icon: string;
}> = {
  bronze: { name: "Bronze", color: "text-amber-700", minElo: 0, maxElo: 999, icon: "🥉" },
  silver: { name: "Silver", color: "text-slate-400", minElo: 1000, maxElo: 1199, icon: "🥈" },
  gold: { name: "Gold", color: "text-yellow-500", minElo: 1200, maxElo: 1399, icon: "🥇" },
  platinum: { name: "Platinum", color: "text-cyan-400", minElo: 1400, maxElo: 1599, icon: "💎" },
  diamond: { name: "Diamond", color: "text-blue-400", minElo: 1600, maxElo: 1799, icon: "💠" },
  master: { name: "Master", color: "text-purple-500", minElo: 1800, maxElo: 1999, icon: "👑" },
  grandmaster: { name: "Grandmaster", color: "text-red-500", minElo: 2000, maxElo: 9999, icon: "🏆" },
};

export const TIER_ORDER: SkillTier[] = [
  "bronze", "silver", "gold", "platinum", "diamond", "master", "grandmaster"
];

const DEFAULT_ELO = 1200;
const K_FACTOR = 32;
const ELO_RANGE_FOR_MATCHING = 200;

export function useMatchmaking() {
  const { user } = useAuth();
  const [playerRating, setPlayerRating] = useState<PlayerRating | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create player rating
  const fetchPlayerRating = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Try to fetch existing rating
      const { data, error } = await supabase
        .from("player_ratings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching player rating:", error);
      }

      if (data) {
        setPlayerRating(data as PlayerRating);
      } else {
        // Create new rating for player
        const { data: newRating, error: insertError } = await supabase
          .from("player_ratings")
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating player rating:", insertError);
        } else {
          setPlayerRating(newRating as PlayerRating);
        }
      }
    } catch (err) {
      console.error("Error in fetchPlayerRating:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlayerRating();
  }, [fetchPlayerRating]);

  // Calculate ELO change
  const calculateEloChange = (
    winnerElo: number,
    loserElo: number,
    kFactor: number = K_FACTOR
  ): number => {
    const expectedScore = 1.0 / (1.0 + Math.pow(10.0, (loserElo - winnerElo) / 400.0));
    return Math.round(kFactor * (1.0 - expectedScore));
  };

  // Get tier from ELO
  const getTierFromElo = (elo: number): SkillTier => {
    if (elo >= 2000) return "grandmaster";
    if (elo >= 1800) return "master";
    if (elo >= 1600) return "diamond";
    if (elo >= 1400) return "platinum";
    if (elo >= 1200) return "gold";
    if (elo >= 1000) return "silver";
    return "bronze";
  };

  // Update rating after race
  const updateRatingAfterRace = async (
    finishRank: number,
    totalParticipants: number,
    opponentElos: number[]
  ) => {
    if (!user || !playerRating) return;

    try {
      // Calculate average opponent ELO
      const avgOpponentElo = opponentElos.length > 0
        ? opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length
        : DEFAULT_ELO;

      // Calculate ELO change based on finish position
      let eloChange = 0;
      const isWin = finishRank === 1;
      
      if (isWin) {
        // Winner gains ELO based on opponents beaten
        eloChange = calculateEloChange(playerRating.elo_rating, avgOpponentElo);
      } else {
        // Losers lose ELO based on position
        const positionPenalty = (finishRank - 1) / (totalParticipants - 1);
        eloChange = -Math.round(calculateEloChange(avgOpponentElo, playerRating.elo_rating) * positionPenalty);
      }

      // Apply diminished K-factor for experienced players
      const experienceFactor = Math.max(0.5, 1 - (playerRating.total_races / 100));
      eloChange = Math.round(eloChange * experienceFactor);

      // Ensure minimum change
      if (isWin && eloChange < 5) eloChange = 5;
      if (!isWin && eloChange > -5) eloChange = Math.min(-3, eloChange);

      const newElo = Math.max(100, playerRating.elo_rating + eloChange);
      const newTier = getTierFromElo(newElo);
      const newWinStreak = isWin ? playerRating.win_streak + 1 : 0;

      const { error } = await supabase
        .from("player_ratings")
        .update({
          elo_rating: newElo,
          tier: newTier,
          total_races: playerRating.total_races + 1,
          wins: isWin ? playerRating.wins + 1 : playerRating.wins,
          losses: !isWin ? playerRating.losses + 1 : playerRating.losses,
          win_streak: newWinStreak,
          best_streak: Math.max(playerRating.best_streak, newWinStreak),
          last_race_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Show rating change toast
      const tierChanged = newTier !== playerRating.tier;
      if (tierChanged) {
        const tierUp = TIER_ORDER.indexOf(newTier) > TIER_ORDER.indexOf(playerRating.tier);
        toast.success(
          tierUp 
            ? `🎉 Promoted to ${TIER_CONFIG[newTier].name}!` 
            : `📉 Demoted to ${TIER_CONFIG[newTier].name}`,
          { duration: 5000 }
        );
      } else {
        toast.info(
          `Rating: ${playerRating.elo_rating} → ${newElo} (${eloChange >= 0 ? '+' : ''}${eloChange})`,
          { duration: 3000 }
        );
      }

      // Refresh rating
      await fetchPlayerRating();

      return { newElo, eloChange, newTier, tierChanged };
    } catch (err) {
      console.error("Error updating rating:", err);
      return null;
    }
  };

  // Find races matching skill level
  const findMatchingRaces = async (): Promise<any[]> => {
    if (!playerRating) return [];

    try {
      const minElo = playerRating.elo_rating - ELO_RANGE_FOR_MATCHING;
      const maxElo = playerRating.elo_rating + ELO_RANGE_FOR_MATCHING;

      const { data, error } = await supabase
        .from("race_sessions")
        .select("*")
        .eq("status", "waiting")
        .or(`skill_tier.eq.open,and(min_elo.lte.${playerRating.elo_rating},max_elo.gte.${playerRating.elo_rating})`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error finding matching races:", err);
      return [];
    }
  };

  // Get ratings for multiple users
  const getRatingsForUsers = async (userIds: string[]): Promise<Map<string, PlayerRating>> => {
    if (userIds.length === 0) return new Map();

    try {
      const { data, error } = await supabase
        .from("player_ratings")
        .select("*")
        .in("user_id", userIds);

      if (error) throw error;

      const ratingsMap = new Map<string, PlayerRating>();
      (data || []).forEach((rating) => {
        ratingsMap.set(rating.user_id, {
          ...rating,
          tier: rating.tier as SkillTier
        } as PlayerRating);
      });

      return ratingsMap;
    } catch (err) {
      console.error("Error fetching ratings:", err);
      return new Map();
    }
  };

  // Calculate match quality (0-100)
  const calculateMatchQuality = (playerElos: number[]): number => {
    if (playerElos.length < 2) return 100;

    const avgElo = playerElos.reduce((a, b) => a + b, 0) / playerElos.length;
    const maxDeviation = Math.max(...playerElos.map(e => Math.abs(e - avgElo)));
    
    // 0 deviation = 100% quality, 400+ deviation = 0% quality
    return Math.max(0, Math.round(100 - (maxDeviation / 4)));
  };

  return {
    playerRating,
    loading,
    refetch: fetchPlayerRating,
    updateRatingAfterRace,
    findMatchingRaces,
    getRatingsForUsers,
    calculateMatchQuality,
    calculateEloChange,
    getTierFromElo,
    TIER_CONFIG,
  };
}
