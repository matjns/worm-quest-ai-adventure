import { createContext, useContext, ReactNode, useEffect } from "react";
import { CelebrationOverlay, CelebrationIcon } from "@/components/CelebrationOverlay";
import { useCelebration } from "@/hooks/useCelebration";
import { useGameStore } from "@/stores/gameStore";
import { useEngagementStore } from "@/stores/engagementStore";

interface CelebrationContextType {
  celebrateAchievement: (
    name: string, 
    description?: string, 
    icon?: CelebrationIcon,
    rarity?: "common" | "rare" | "epic" | "legendary"
  ) => void;
  celebrateLevelUp: (newLevel: number) => void;
  celebrateEvolution: (evolutionName: string, emoji: string) => void;
  celebrateBadge: (
    name: string, 
    description?: string,
    icon?: CelebrationIcon,
    rarity?: "common" | "rare" | "epic" | "legendary"
  ) => void;
  celebrateStreak: (days: number) => void;
  celebrateQuestComplete: (questName: string, xpReward: number) => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const {
    currentEvent,
    handleComplete,
    celebrateAchievement,
    celebrateLevelUp,
    celebrateEvolution,
    celebrateBadge,
    celebrateStreak,
    celebrateQuestComplete,
  } = useCelebration();

  const setGameCallbacks = useGameStore(state => state.setCelebrationCallbacks);
  const setEngagementCallbacks = useEngagementStore(state => state.setCelebrationCallbacks);

  // Wire up store callbacks to celebration system
  useEffect(() => {
    setGameCallbacks(
      celebrateLevelUp,
      (achievement) => celebrateAchievement(achievement.name, achievement.description, achievement.icon)
    );
    
    setEngagementCallbacks(
      celebrateEvolution,
      (badge) => celebrateBadge(badge.name, badge.description, badge.icon, badge.rarity),
      celebrateStreak,
      (quest) => celebrateQuestComplete(quest.title, quest.xpReward)
    );
  }, [setGameCallbacks, setEngagementCallbacks, celebrateLevelUp, celebrateAchievement, celebrateEvolution, celebrateBadge, celebrateStreak, celebrateQuestComplete]);

  return (
    <CelebrationContext.Provider
      value={{
        celebrateAchievement,
        celebrateLevelUp,
        celebrateEvolution,
        celebrateBadge,
        celebrateStreak,
        celebrateQuestComplete,
      }}
    >
      {children}
      <CelebrationOverlay event={currentEvent} onComplete={handleComplete} />
    </CelebrationContext.Provider>
  );
}

export function useCelebrations() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error("useCelebrations must be used within a CelebrationProvider");
  }
  return context;
}
