import { useCallback } from "react";
import { useEngagementStore, Badge } from "@/stores/engagementStore";

// Race-specific badge definitions
export const RACE_BADGES: Omit<Badge, "unlockedAt">[] = [
  // Victory badges
  {
    id: "first-victory",
    name: "First Victory",
    description: "Win your first race",
    icon: "trophy",
    rarity: "common",
    category: "achievement",
  },
  {
    id: "triple-crown",
    name: "Triple Crown",
    description: "Win 3 races",
    icon: "crown",
    rarity: "rare",
    category: "achievement",
    progress: 0,
    maxProgress: 3,
  },
  {
    id: "champion-racer",
    name: "Champion Racer",
    description: "Win 10 races",
    icon: "crown",
    rarity: "epic",
    category: "achievement",
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "legendary-champion",
    name: "Legendary Champion",
    description: "Win 50 races",
    icon: "gem",
    rarity: "legendary",
    category: "achievement",
    progress: 0,
    maxProgress: 50,
  },

  // Speed badges
  {
    id: "speed-demon-racer",
    name: "Speed Demon",
    description: "Finish a race in under 30 seconds",
    icon: "rocket",
    rarity: "epic",
    category: "skill",
  },
  {
    id: "lightning-fast",
    name: "Lightning Fast",
    description: "Finish a race in under 20 seconds",
    icon: "zap",
    rarity: "legendary",
    category: "skill",
  },

  // Participation badges
  {
    id: "race-rookie",
    name: "Race Rookie",
    description: "Participate in your first race",
    icon: "star",
    rarity: "common",
    category: "dedication",
  },
  {
    id: "regular-racer",
    name: "Regular Racer",
    description: "Participate in 10 races",
    icon: "flame",
    rarity: "rare",
    category: "dedication",
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "race-veteran",
    name: "Race Veteran",
    description: "Participate in 50 races",
    icon: "crown",
    rarity: "epic",
    category: "dedication",
    progress: 0,
    maxProgress: 50,
  },

  // Special achievement badges
  {
    id: "podium-finisher",
    name: "Podium Finisher",
    description: "Finish in top 3",
    icon: "trophy",
    rarity: "common",
    category: "achievement",
  },
  {
    id: "consistent-podium",
    name: "Consistent Podium",
    description: "Finish in top 3 five times",
    icon: "trophy",
    rarity: "rare",
    category: "achievement",
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "perfect-race",
    name: "Perfect Race",
    description: "Win a race with the lead from start to finish",
    icon: "gem",
    rarity: "legendary",
    category: "skill",
  },
  {
    id: "comeback-king",
    name: "Comeback King",
    description: "Win after being in last place",
    icon: "rocket",
    rarity: "epic",
    category: "skill",
  },

  // Circuit complexity badges
  {
    id: "neural-architect-racer",
    name: "Neural Architect",
    description: "Win a race with 8+ neurons in your circuit",
    icon: "brain",
    rarity: "rare",
    category: "skill",
  },
  {
    id: "minimalist-winner",
    name: "Minimalist Winner",
    description: "Win a race with only 3 neurons",
    icon: "target",
    rarity: "epic",
    category: "skill",
  },
  {
    id: "complex-champion",
    name: "Complex Champion",
    description: "Win a race with 12+ neurons",
    icon: "brain",
    rarity: "legendary",
    category: "skill",
  },

  // Social racing badges
  {
    id: "race-host",
    name: "Race Host",
    description: "Host your first race",
    icon: "star",
    rarity: "common",
    category: "social",
  },
  {
    id: "popular-host",
    name: "Popular Host",
    description: "Host 10 races with 3+ participants",
    icon: "heart",
    rarity: "rare",
    category: "social",
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "spectator-star",
    name: "Spectator Star",
    description: "Watch 5 races as a spectator",
    icon: "star",
    rarity: "common",
    category: "social",
    progress: 0,
    maxProgress: 5,
  },

  // Streak badges
  {
    id: "winning-streak",
    name: "Winning Streak",
    description: "Win 3 races in a row",
    icon: "flame",
    rarity: "epic",
    category: "achievement",
  },
  {
    id: "undefeated",
    name: "Undefeated",
    description: "Win 5 races in a row",
    icon: "crown",
    rarity: "legendary",
    category: "achievement",
  },
];

export interface RaceResult {
  finishRank: number;
  totalParticipants: number;
  raceTimeSeconds: number;
  neuronCount: number;
  wasInLead: boolean;
  wasInLastPlace: boolean;
  isHost: boolean;
}

interface RaceStats {
  totalRaces: number;
  totalWins: number;
  currentWinStreak: number;
  bestWinStreak: number;
  podiumFinishes: number;
  fastestRaceTime: number | null;
}

const RACE_STATS_KEY = "neuroquest-race-stats";

function loadRaceStats(): RaceStats {
  try {
    const stored = localStorage.getItem(RACE_STATS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load race stats:", e);
  }
  return {
    totalRaces: 0,
    totalWins: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    podiumFinishes: 0,
    fastestRaceTime: null,
  };
}

function saveRaceStats(stats: RaceStats) {
  try {
    localStorage.setItem(RACE_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save race stats:", e);
  }
}

export function useRaceAchievements() {
  const { badges, unlockBadge, updateBadgeProgress } = useEngagementStore();

  const processRaceResult = useCallback(
    (result: RaceResult) => {
      const stats = loadRaceStats();
      const isWin = result.finishRank === 1;
      const isPodium = result.finishRank <= 3;

      // Update stats
      stats.totalRaces += 1;
      if (isWin) {
        stats.totalWins += 1;
        stats.currentWinStreak += 1;
        stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak);
      } else {
        stats.currentWinStreak = 0;
      }
      if (isPodium) {
        stats.podiumFinishes += 1;
      }
      if (
        stats.fastestRaceTime === null ||
        result.raceTimeSeconds < stats.fastestRaceTime
      ) {
        stats.fastestRaceTime = result.raceTimeSeconds;
      }

      saveRaceStats(stats);

      // Process achievements

      // Participation badges
      if (stats.totalRaces === 1) {
        unlockBadge("race-rookie");
      }
      updateBadgeProgress("regular-racer", 1);
      updateBadgeProgress("race-veteran", 1);

      // Host badge
      if (result.isHost) {
        unlockBadge("race-host");
        if (result.totalParticipants >= 3) {
          updateBadgeProgress("popular-host", 1);
        }
      }

      // Podium badges
      if (isPodium) {
        unlockBadge("podium-finisher");
        updateBadgeProgress("consistent-podium", 1);
      }

      // Victory badges
      if (isWin) {
        if (stats.totalWins === 1) {
          unlockBadge("first-victory");
        }
        updateBadgeProgress("triple-crown", 1);
        updateBadgeProgress("champion-racer", 1);
        updateBadgeProgress("legendary-champion", 1);

        // Win streak badges
        if (stats.currentWinStreak >= 3) {
          unlockBadge("winning-streak");
        }
        if (stats.currentWinStreak >= 5) {
          unlockBadge("undefeated");
        }

        // Circuit complexity badges
        if (result.neuronCount >= 12) {
          unlockBadge("complex-champion");
        } else if (result.neuronCount >= 8) {
          unlockBadge("neural-architect-racer");
        } else if (result.neuronCount === 3) {
          unlockBadge("minimalist-winner");
        }

        // Special achievement badges
        if (result.wasInLead) {
          unlockBadge("perfect-race");
        }
        if (result.wasInLastPlace) {
          unlockBadge("comeback-king");
        }
      }

      // Speed badges
      if (result.raceTimeSeconds < 30) {
        unlockBadge("speed-demon-racer");
      }
      if (result.raceTimeSeconds < 20) {
        unlockBadge("lightning-fast");
      }

      return stats;
    },
    [unlockBadge, updateBadgeProgress]
  );

  const trackSpectating = useCallback(() => {
    updateBadgeProgress("spectator-star", 1);
  }, [updateBadgeProgress]);

  const getRaceStats = useCallback(() => {
    return loadRaceStats();
  }, []);

  const getRaceBadges = useCallback(() => {
    const raceBadgeIds = RACE_BADGES.map((b) => b.id);
    return badges.filter((b) => raceBadgeIds.includes(b.id));
  }, [badges]);

  return {
    processRaceResult,
    trackSpectating,
    getRaceStats,
    getRaceBadges,
    raceBadgeDefinitions: RACE_BADGES,
  };
}
