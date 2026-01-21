import { create } from "zustand";
import { persist } from "zustand/middleware";

// Full engagement system with daily quests, streaks, and worm evolution

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: "missions" | "neurons" | "connections" | "time" | "streak";
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
  expiresAt: number; // Timestamp
}

export interface WormEvolution {
  stage: number;
  name: string;
  sprite: string;
  unlockedAt: number; // Total XP needed
  abilities: string[];
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: "brain" | "zap" | "trophy" | "star" | "target" | "flame" | "crown" | "gem" | "rocket" | "heart" | "globe" | "flag" | "microscope" | "dna";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  category: "skill" | "dedication" | "social" | "achievement" | "special" | "ambassador";
}

export interface EngagementState {
  // Daily Quests
  dailyQuests: DailyQuest[];
  lastQuestRefresh: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  
  // Worm Evolution
  currentEvolutionStage: number;
  totalXPEarned: number;
  
  // Badges
  badges: Badge[];
  
  // Session stats
  missionsCompletedToday: number;
  neuronsPlacedToday: number;
  connectionsCreatedToday: number;
  minutesPlayedToday: number;
  sessionStartTime: number;
  
  // Celebration callbacks
  onEvolution?: (name: string, emoji: string) => void;
  onBadgeUnlock?: (badge: Badge) => void;
  onStreakMilestone?: (days: number) => void;
  onQuestComplete?: (quest: DailyQuest) => void;
  
  // Actions
  refreshDailyQuests: () => void;
  updateQuestProgress: (type: DailyQuest["type"], amount: number) => void;
  checkAndUpdateStreak: () => void;
  addXPToEvolution: (xp: number) => void;
  unlockBadge: (badgeId: string) => void;
  updateBadgeProgress: (badgeId: string, progress: number) => void;
  startSession: () => void;
  endSession: () => void;
  setCelebrationCallbacks: (
    onEvolution: (name: string, emoji: string) => void,
    onBadgeUnlock: (badge: Badge) => void,
    onStreakMilestone: (days: number) => void,
    onQuestComplete: (quest: DailyQuest) => void
  ) => void;
}

// Worm evolution stages
export const WORM_EVOLUTIONS: WormEvolution[] = [
  {
    stage: 0,
    name: "Egg",
    sprite: "🥚",
    unlockedAt: 0,
    abilities: [],
    description: "A tiny egg with potential. Every scientist starts somewhere!",
  },
  {
    stage: 1,
    name: "Larvae",
    sprite: "🐛",
    unlockedAt: 100,
    abilities: ["Basic Movement"],
    description: "You've hatched! Now learning to wiggle.",
  },
  {
    stage: 2,
    name: "Juvenile",
    sprite: "🪱",
    unlockedAt: 500,
    abilities: ["Basic Movement", "Touch Sense"],
    description: "Growing stronger! Can now sense touch.",
  },
  {
    stage: 3,
    name: "Adult C. elegans",
    sprite: "🧬",
    unlockedAt: 1500,
    abilities: ["Basic Movement", "Touch Sense", "Chemotaxis"],
    description: "Fully grown! All 302 neurons are firing.",
  },
  {
    stage: 4,
    name: "Super Worm",
    sprite: "⚡",
    unlockedAt: 5000,
    abilities: ["Basic Movement", "Touch Sense", "Chemotaxis", "Thermotaxis"],
    description: "Enhanced abilities beyond normal worms!",
  },
  {
    stage: 5,
    name: "Neuro Worm",
    sprite: "🧠",
    unlockedAt: 15000,
    abilities: ["Basic Movement", "Touch Sense", "Chemotaxis", "Thermotaxis", "Learning"],
    description: "Your worm has developed advanced neural capabilities!",
  },
  {
    stage: 6,
    name: "Cyber Worm",
    sprite: "🤖",
    unlockedAt: 50000,
    abilities: ["All Abilities", "AI Integration"],
    description: "The ultimate digital organism - part worm, part AI!",
  },
  {
    stage: 7,
    name: "Legendary Connectome",
    sprite: "👑",
    unlockedAt: 150000,
    abilities: ["All Abilities", "AI Integration", "Consciousness"],
    description: "You've achieved scientific immortality. OpenWorm is proud!",
  },
];

// All available badges
const ALL_BADGES: Badge[] = [
  // Skill badges
  { id: "neuron-ninja", name: "Neuron Ninja", description: "Complete your first circuit", icon: "brain", rarity: "common", category: "skill" },
  { id: "synapse-master", name: "Synapse Master", description: "Create 50 connections", icon: "zap", rarity: "rare", category: "skill", progress: 0, maxProgress: 50 },
  { id: "connectome-champion", name: "Connectome Champion", description: "Complete all 5 missions", icon: "trophy", rarity: "epic", category: "skill", progress: 0, maxProgress: 5 },
  { id: "circuit-genius", name: "Circuit Genius", description: "Build a circuit with 10+ neurons", icon: "brain", rarity: "rare", category: "skill" },
  { id: "speed-demon", name: "Speed Demon", description: "Complete a mission in under 30 seconds", icon: "rocket", rarity: "epic", category: "skill" },
  { id: "efficiency-expert", name: "Efficiency Expert", description: "Complete a mission with minimum neurons", icon: "target", rarity: "legendary", category: "skill" },
  
  // Dedication badges
  { id: "first-steps", name: "First Steps", description: "Complete your first lesson", icon: "star", rarity: "common", category: "dedication" },
  { id: "week-warrior", name: "Week Warrior", description: "7 day login streak", icon: "flame", rarity: "rare", category: "dedication" },
  { id: "month-master", name: "Month Master", description: "30 day login streak", icon: "crown", rarity: "epic", category: "dedication" },
  { id: "hundred-days", name: "Century Club", description: "100 day login streak", icon: "gem", rarity: "legendary", category: "dedication" },
  { id: "early-bird", name: "Early Bird", description: "Play before 8 AM", icon: "star", rarity: "common", category: "dedication" },
  { id: "night-owl", name: "Night Owl", description: "Play after 10 PM", icon: "star", rarity: "common", category: "dedication" },
  
  // Social badges
  { id: "community-contributor", name: "Community Contributor", description: "Share a circuit", icon: "heart", rarity: "rare", category: "social" },
  { id: "helpful-hero", name: "Helpful Hero", description: "Get 10 likes on shared circuits", icon: "heart", rarity: "epic", category: "social", progress: 0, maxProgress: 10 },
  { id: "viral-scientist", name: "Viral Scientist", description: "Get 100 likes on a single circuit", icon: "crown", rarity: "legendary", category: "social" },
  
  // Achievement badges
  { id: "brain-builder", name: "Brain Builder", description: "Reach Level 10", icon: "brain", rarity: "rare", category: "achievement" },
  { id: "neural-architect", name: "Neural Architect", description: "Reach Level 25", icon: "brain", rarity: "epic", category: "achievement" },
  { id: "master-scientist", name: "Master Scientist", description: "Reach Level 50", icon: "crown", rarity: "legendary", category: "achievement" },
  { id: "point-collector", name: "Point Collector", description: "Earn 10,000 points", icon: "gem", rarity: "rare", category: "achievement" },
  { id: "point-hoarder", name: "Point Hoarder", description: "Earn 100,000 points", icon: "gem", rarity: "legendary", category: "achievement" },
  
  // Special badges
  { id: "openworm-ally", name: "OpenWorm Ally", description: "Visit the OpenWorm GitHub", icon: "rocket", rarity: "common", category: "special" },
  { id: "science-supporter", name: "Science Supporter", description: "Learn about real C. elegans research", icon: "star", rarity: "common", category: "special" },
  { id: "ai-explorer", name: "AI Explorer", description: "Complete AI-related lessons", icon: "brain", rarity: "rare", category: "special" },
  
  // Chaos & Dynamical Systems badges
  { id: "chaos-tamer", name: "Chaos Tamer", description: "Optimize a supply chain through strange attractors", icon: "target", rarity: "epic", category: "skill" },
  { id: "chaos-master", name: "Chaos Master", description: "Discover all attractor types", icon: "brain", rarity: "legendary", category: "skill", progress: 0, maxProgress: 3 },
  { id: "bifurcation-hunter", name: "Bifurcation Hunter", description: "Find 5 bifurcation points", icon: "zap", rarity: "rare", category: "skill", progress: 0, maxProgress: 5 },
  { id: "dynamical-pioneer", name: "Dynamical Pioneer", description: "Run 100 chaos simulations", icon: "rocket", rarity: "epic", category: "dedication", progress: 0, maxProgress: 100 },

  // OpenWorm Ambassador badges
  { id: "ambassador-recruit", name: "Ambassador Recruit", description: "Complete your first research-aligned circuit", icon: "flag", rarity: "common", category: "ambassador" },
  { id: "science-communicator", name: "Science Communicator", description: "Share 5 circuits with educational descriptions", icon: "globe", rarity: "rare", category: "ambassador", progress: 0, maxProgress: 5 },
  { id: "research-contributor", name: "Research Contributor", description: "Create 3 circuits matching real C. elegans behaviors", icon: "microscope", rarity: "rare", category: "ambassador", progress: 0, maxProgress: 3 },
  { id: "community-mentor", name: "Community Mentor", description: "Have 10 of your circuits forked by others", icon: "heart", rarity: "epic", category: "ambassador", progress: 0, maxProgress: 10 },
  { id: "global-advocate", name: "Global Advocate", description: "Receive likes from users in 5 different sessions", icon: "globe", rarity: "epic", category: "ambassador", progress: 0, maxProgress: 5 },
  { id: "openworm-champion", name: "OpenWorm Champion", description: "Reach 100 total likes on research-aligned circuits", icon: "trophy", rarity: "legendary", category: "ambassador", progress: 0, maxProgress: 100 },
  { id: "connectome-scholar", name: "Connectome Scholar", description: "Complete all neuroscience lessons", icon: "brain", rarity: "epic", category: "ambassador" },
  { id: "citizen-scientist", name: "Citizen Scientist", description: "Contribute to 10 collaborative sandbox sessions", icon: "dna", rarity: "rare", category: "ambassador", progress: 0, maxProgress: 10 },
  { id: "usa-pioneer", name: "USA Pioneer", description: "Be among the first 1000 US contributors", icon: "flag", rarity: "legendary", category: "ambassador" },
  { id: "scientific-legacy", name: "Scientific Legacy", description: "Have your circuit featured in the Research Board", icon: "crown", rarity: "legendary", category: "ambassador" },

  // Race Victory badges
  { id: "first-victory", name: "First Victory", description: "Win your first race", icon: "trophy", rarity: "common", category: "achievement" },
  { id: "triple-crown", name: "Triple Crown", description: "Win 3 races", icon: "crown", rarity: "rare", category: "achievement", progress: 0, maxProgress: 3 },
  { id: "champion-racer", name: "Champion Racer", description: "Win 10 races", icon: "crown", rarity: "epic", category: "achievement", progress: 0, maxProgress: 10 },
  { id: "legendary-champion", name: "Legendary Champion", description: "Win 50 races", icon: "gem", rarity: "legendary", category: "achievement", progress: 0, maxProgress: 50 },

  // Race Speed badges
  { id: "speed-demon-racer", name: "Speed Demon", description: "Finish a race in under 30 seconds", icon: "rocket", rarity: "epic", category: "skill" },
  { id: "lightning-fast", name: "Lightning Fast", description: "Finish a race in under 20 seconds", icon: "zap", rarity: "legendary", category: "skill" },

  // Race Participation badges
  { id: "race-rookie", name: "Race Rookie", description: "Participate in your first race", icon: "star", rarity: "common", category: "dedication" },
  { id: "regular-racer", name: "Regular Racer", description: "Participate in 10 races", icon: "flame", rarity: "rare", category: "dedication", progress: 0, maxProgress: 10 },
  { id: "race-veteran", name: "Race Veteran", description: "Participate in 50 races", icon: "crown", rarity: "epic", category: "dedication", progress: 0, maxProgress: 50 },

  // Race Special badges
  { id: "podium-finisher", name: "Podium Finisher", description: "Finish in top 3", icon: "trophy", rarity: "common", category: "achievement" },
  { id: "consistent-podium", name: "Consistent Podium", description: "Finish in top 3 five times", icon: "trophy", rarity: "rare", category: "achievement", progress: 0, maxProgress: 5 },
  { id: "perfect-race", name: "Perfect Race", description: "Win a race with lead from start to finish", icon: "gem", rarity: "legendary", category: "skill" },
  { id: "comeback-king", name: "Comeback King", description: "Win after being in last place", icon: "rocket", rarity: "epic", category: "skill" },

  // Race Circuit badges
  { id: "neural-architect-racer", name: "Neural Architect", description: "Win a race with 8+ neurons", icon: "brain", rarity: "rare", category: "skill" },
  { id: "minimalist-winner", name: "Minimalist Winner", description: "Win a race with only 3 neurons", icon: "target", rarity: "epic", category: "skill" },
  { id: "complex-champion", name: "Complex Champion", description: "Win a race with 12+ neurons", icon: "brain", rarity: "legendary", category: "skill" },

  // Race Social badges
  { id: "race-host", name: "Race Host", description: "Host your first race", icon: "star", rarity: "common", category: "social" },
  { id: "popular-host", name: "Popular Host", description: "Host 10 races with 3+ participants", icon: "heart", rarity: "rare", category: "social", progress: 0, maxProgress: 10 },
  { id: "spectator-star", name: "Spectator Star", description: "Watch 5 races as spectator", icon: "star", rarity: "common", category: "social", progress: 0, maxProgress: 5 },

  // Race Streak badges
  { id: "winning-streak", name: "Winning Streak", description: "Win 3 races in a row", icon: "flame", rarity: "epic", category: "achievement" },
  { id: "undefeated", name: "Undefeated", description: "Win 5 races in a row", icon: "crown", rarity: "legendary", category: "achievement" },
];

// Daily quest templates
const QUEST_TEMPLATES = [
  { type: "missions" as const, title: "Mission Specialist", description: "Complete {target} mission(s)", targets: [1, 2, 3], xpMultiplier: 100 },
  { type: "neurons" as const, title: "Neuron Collector", description: "Place {target} neurons", targets: [5, 10, 20], xpMultiplier: 10 },
  { type: "connections" as const, title: "Connection Builder", description: "Create {target} connections", targets: [5, 10, 15], xpMultiplier: 15 },
  { type: "time" as const, title: "Dedicated Learner", description: "Play for {target} minutes", targets: [10, 20, 30], xpMultiplier: 5 },
  { type: "streak" as const, title: "Streak Keeper", description: "Maintain a {target} day streak", targets: [3, 7, 14], xpMultiplier: 50 },
];

function generateDailyQuests(): DailyQuest[] {
  const now = Date.now();
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  
  // Pick 3 random quest types
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  const selectedTemplates = shuffled.slice(0, 3);
  
  return selectedTemplates.map((template, i) => {
    const target = template.targets[Math.floor(Math.random() * template.targets.length)];
    return {
      id: `daily-${i}-${Date.now()}`,
      title: template.title,
      description: template.description.replace("{target}", target.toString()),
      type: template.type,
      target,
      progress: 0,
      xpReward: target * template.xpMultiplier,
      completed: false,
      expiresAt: tomorrow.getTime(),
    };
  });
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      dailyQuests: [],
      lastQuestRefresh: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      currentEvolutionStage: 0,
      totalXPEarned: 0,
      badges: ALL_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
      missionsCompletedToday: 0,
      neuronsPlacedToday: 0,
      connectionsCreatedToday: 0,
      minutesPlayedToday: 0,
      sessionStartTime: 0,
      onEvolution: undefined,
      onBadgeUnlock: undefined,
      onStreakMilestone: undefined,
      onQuestComplete: undefined,

      setCelebrationCallbacks: (onEvolution, onBadgeUnlock, onStreakMilestone, onQuestComplete) => {
        set({ onEvolution, onBadgeUnlock, onStreakMilestone, onQuestComplete });
      },

      refreshDailyQuests: () => {
        const now = Date.now();
        const state = get();
        
        // Check if quests need refresh (expired or never set)
        const needsRefresh = state.dailyQuests.length === 0 || 
          state.dailyQuests.some(q => q.expiresAt < now);
        
        if (needsRefresh) {
          set({
            dailyQuests: generateDailyQuests(),
            lastQuestRefresh: now,
            missionsCompletedToday: 0,
            neuronsPlacedToday: 0,
            connectionsCreatedToday: 0,
            minutesPlayedToday: 0,
          });
        }
      },

      updateQuestProgress: (type, amount) => {
        const state = get();
        const updatedQuests = state.dailyQuests.map(quest => {
          if (quest.type !== type || quest.completed) return quest;
          
          const newProgress = quest.progress + amount;
          const completed = newProgress >= quest.target;
          
          // Trigger quest complete celebration
          if (completed && !quest.completed && state.onQuestComplete) {
            setTimeout(() => state.onQuestComplete?.(quest), 100);
          }
          
          return {
            ...quest,
            progress: Math.min(newProgress, quest.target),
            completed,
          };
        });
        
        // Update daily stats
        const updates: Partial<EngagementState> = { dailyQuests: updatedQuests };
        switch (type) {
          case "missions":
            updates.missionsCompletedToday = state.missionsCompletedToday + amount;
            break;
          case "neurons":
            updates.neuronsPlacedToday = state.neuronsPlacedToday + amount;
            break;
          case "connections":
            updates.connectionsCreatedToday = state.connectionsCreatedToday + amount;
            break;
        }
        
        set(updates);
      },

      checkAndUpdateStreak: () => {
        const today = getTodayString();
        const state = get();
        
        if (state.lastActiveDate === today) return; // Already checked today
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split("T")[0];
        
        let newStreak = state.currentStreak;
        const oldStreak = state.currentStreak;
        
        if (state.lastActiveDate === yesterdayString) {
          // Continuing streak
          newStreak += 1;
        } else if (state.lastActiveDate !== today) {
          // Streak broken
          newStreak = 1;
        }
        
        const newLongestStreak = Math.max(state.longestStreak, newStreak);
        
        set({
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: today,
        });
        
        // Trigger streak milestone celebrations
        if (state.onStreakMilestone) {
          if ((oldStreak < 7 && newStreak >= 7) || 
              (oldStreak < 30 && newStreak >= 30) || 
              (oldStreak < 100 && newStreak >= 100)) {
            state.onStreakMilestone(newStreak);
          }
        }
        
        // Update streak quest progress
        get().updateQuestProgress("streak", 0); // Trigger check
        
        // Check streak badges
        if (newStreak >= 7) get().unlockBadge("week-warrior");
        if (newStreak >= 30) get().unlockBadge("month-master");
        if (newStreak >= 100) get().unlockBadge("hundred-days");
      },

      addXPToEvolution: (xp) => {
        const state = get();
        const newTotal = state.totalXPEarned + xp;
        const oldStage = state.currentEvolutionStage;
        
        // Check for evolution
        let newStage = oldStage;
        for (let i = WORM_EVOLUTIONS.length - 1; i >= 0; i--) {
          if (newTotal >= WORM_EVOLUTIONS[i].unlockedAt) {
            newStage = i;
            break;
          }
        }
        
        set({
          totalXPEarned: newTotal,
          currentEvolutionStage: newStage,
        });
        
        // Trigger evolution celebration if stage changed
        if (newStage > oldStage && state.onEvolution) {
          const evolution = WORM_EVOLUTIONS[newStage];
          state.onEvolution(evolution.name, evolution.sprite);
        }
      },

      unlockBadge: (badgeId) => {
        const state = get();
        const badge = state.badges.find(b => b.id === badgeId);
        
        // Only unlock if not already unlocked
        if (badge && !badge.unlockedAt) {
          set((state) => ({
            badges: state.badges.map(b =>
              b.id === badgeId ? { ...b, unlockedAt: Date.now() } : b
            ),
          }));
          
          // Trigger celebration
          if (state.onBadgeUnlock) {
            state.onBadgeUnlock({ ...badge, unlockedAt: Date.now() });
          }
        }
      },

      updateBadgeProgress: (badgeId, progress) => {
        set((state) => {
          const badges = state.badges.map(badge => {
            if (badge.id !== badgeId || badge.unlockedAt) return badge;
            
            const newProgress = (badge.progress || 0) + progress;
            const shouldUnlock = badge.maxProgress && newProgress >= badge.maxProgress;
            
            return {
              ...badge,
              progress: newProgress,
              unlockedAt: shouldUnlock ? Date.now() : undefined,
            };
          });
          
          return { badges };
        });
      },

      startSession: () => {
        set({ sessionStartTime: Date.now() });
        get().checkAndUpdateStreak();
        get().refreshDailyQuests();
        
        // Check time-based badges
        const hour = new Date().getHours();
        if (hour < 8) get().unlockBadge("early-bird");
        if (hour >= 22) get().unlockBadge("night-owl");
      },

      endSession: () => {
        const state = get();
        if (state.sessionStartTime > 0) {
          const minutesPlayed = Math.floor((Date.now() - state.sessionStartTime) / 60000);
          get().updateQuestProgress("time", minutesPlayed);
          set({
            minutesPlayedToday: state.minutesPlayedToday + minutesPlayed,
            sessionStartTime: 0,
          });
        }
      },
    }),
    {
      name: "neuroquest-engagement-storage",
      partialize: (state) => ({
        dailyQuests: state.dailyQuests,
        lastQuestRefresh: state.lastQuestRefresh,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastActiveDate: state.lastActiveDate,
        currentEvolutionStage: state.currentEvolutionStage,
        totalXPEarned: state.totalXPEarned,
        badges: state.badges,
        missionsCompletedToday: state.missionsCompletedToday,
        neuronsPlacedToday: state.neuronsPlacedToday,
        connectionsCreatedToday: state.connectionsCreatedToday,
        minutesPlayedToday: state.minutesPlayedToday,
        sessionStartTime: state.sessionStartTime,
      }),
    }
  )
);

// Utility functions
export function getEvolutionProgress(totalXP: number, currentStage: number): number {
  if (currentStage >= WORM_EVOLUTIONS.length - 1) return 100;
  
  const currentThreshold = WORM_EVOLUTIONS[currentStage].unlockedAt;
  const nextThreshold = WORM_EVOLUTIONS[currentStage + 1].unlockedAt;
  
  return Math.min(100, ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
}

export function getBadgesByCategory(badges: Badge[], category: Badge["category"]): Badge[] {
  return badges.filter(b => b.category === category);
}

export function getUnlockedBadges(badges: Badge[]): Badge[] {
  return badges.filter(b => b.unlockedAt);
}

export function getRarityColor(rarity: Badge["rarity"]): string {
  switch (rarity) {
    case "common": return "text-muted-foreground";
    case "rare": return "text-blue-400";
    case "epic": return "text-purple-400";
    case "legendary": return "text-amber-400";
  }
}
