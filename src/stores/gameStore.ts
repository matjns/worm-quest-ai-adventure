import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "star" | "zap" | "target" | "brain";
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface GameState {
  // Player progress
  level: number;
  xp: number;
  xpToNext: number;
  totalPoints: number;
  
  // Game mode progress
  currentMode: "pre-k" | "k-5" | "middle" | "high" | "public" | null;
  completedLessons: string[];
  
  // Achievements
  achievements: Achievement[];
  
  // Actions
  addXp: (amount: number) => void;
  addPoints: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  setGameMode: (mode: GameState["currentMode"]) => void;
  resetProgress: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-neuron",
    name: "Neuron Ninja",
    description: "Complete your first neuron simulation",
    icon: "brain",
    unlocked: false,
  },
  {
    id: "connection-master",
    name: "Synapse Master",
    description: "Create 10 neural connections",
    icon: "zap",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "worm-wizard",
    name: "Worm Wizard",
    description: "Complete all Pre-K lessons",
    icon: "star",
    unlocked: false,
  },
  {
    id: "brain-builder",
    name: "Brain Builder",
    description: "Reach level 10",
    icon: "trophy",
    unlocked: false,
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    description: "Analyze 100 neuron behaviors",
    icon: "target",
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
];

const calculateXpToNext = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpToNext: 100,
      totalPoints: 0,
      currentMode: null,
      completedLessons: [],
      achievements: DEFAULT_ACHIEVEMENTS,

      addXp: (amount) => {
        const state = get();
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let newXpToNext = state.xpToNext;

        while (newXp >= newXpToNext) {
          newXp -= newXpToNext;
          newLevel += 1;
          newXpToNext = calculateXpToNext(newLevel);
        }

        set({
          xp: newXp,
          level: newLevel,
          xpToNext: newXpToNext,
        });

        // Check level achievement
        if (newLevel >= 10) {
          get().unlockAchievement("brain-builder");
        }
      },

      addPoints: (amount) => {
        set((state) => ({
          totalPoints: state.totalPoints + amount,
        }));
      },

      completeLesson: (lessonId) => {
        set((state) => {
          if (state.completedLessons.includes(lessonId)) return state;
          
          const newCompleted = [...state.completedLessons, lessonId];
          
          return {
            completedLessons: newCompleted,
          };
        });

        // Add XP and points for lesson completion
        get().addXp(50);
        get().addPoints(100);
      },

      unlockAchievement: (achievementId) => {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === achievementId ? { ...a, unlocked: true } : a
          ),
        }));
      },

      setGameMode: (mode) => {
        set({ currentMode: mode });
      },

      resetProgress: () => {
        set({
          level: 1,
          xp: 0,
          xpToNext: 100,
          totalPoints: 0,
          currentMode: null,
          completedLessons: [],
          achievements: DEFAULT_ACHIEVEMENTS,
        });
      },
    }),
    {
      name: "wormquest-storage",
    }
  )
);