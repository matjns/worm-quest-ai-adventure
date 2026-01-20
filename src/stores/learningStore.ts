import { create } from "zustand";
import { persist } from "zustand/middleware";

// Learning analytics and adaptive difficulty system
// Based on research: Optimal learning happens at ~85% success rate

export interface AttemptRecord {
  missionId: number;
  timestamp: number;
  success: boolean;
  timeSpentSeconds: number;
  hintsUsed: number;
  neuronsPlaced: number;
  connectionsCreated: number;
  errorsBeforeSuccess: number;
}

export interface SkillMetrics {
  motorControl: number;      // 0-100: Understanding of motor neuron circuits
  sensoryProcessing: number; // 0-100: Understanding of sensory pathways
  integration: number;       // 0-100: Ability to combine multiple circuits
  efficiency: number;        // 0-100: Building circuits with minimal components
  speed: number;            // 0-100: Quick problem solving
}

export interface LearnerProfile {
  // Skill levels (0-100)
  skills: SkillMetrics;
  
  // Learning style preferences (detected from behavior)
  learningStyle: {
    prefersTrial: number;     // 0-1: Trial-and-error vs. careful planning
    usesHints: number;        // 0-1: Hint reliance
    explorative: number;      // 0-1: Explores many neurons vs. focused
    persistent: number;       // 0-1: Retries after failure
  };
  
  // Performance metrics
  averageSuccessRate: number;
  averageTimePerMission: number;
  currentStreak: number;
  longestStreak: number;
  
  // Adaptive difficulty
  currentDifficultyMultiplier: number; // 0.5-2.0, adjusts challenge level
  optimalChallengeLevel: number;       // Target difficulty for flow state
}

interface LearningState {
  profile: LearnerProfile;
  attemptHistory: AttemptRecord[];
  
  // AI-generated personalized content cache
  personalizedHints: Record<number, string[]>;
  adaptedMissionParams: Record<number, {
    extraHints?: string[];
    scaffolding?: string;
    challenge?: string;
  }>;
  
  // Session metrics
  sessionStartTime: number;
  missionsThisSession: number;
  
  // Actions
  recordAttempt: (attempt: AttemptRecord) => void;
  updateSkill: (skill: keyof SkillMetrics, delta: number) => void;
  calculateOptimalDifficulty: () => number;
  getAdaptedMissionConfig: (missionId: number) => {
    difficultyMultiplier: number;
    recommendedHints: number;
    scaffoldingLevel: "none" | "light" | "medium" | "heavy";
    bonusChallenges: boolean;
  };
  analyzeWeaknesses: () => { skill: keyof SkillMetrics; score: number }[];
  generateLearningPath: () => number[];
  startSession: () => void;
  resetLearningData: () => void;
}

const DEFAULT_SKILLS: SkillMetrics = {
  motorControl: 50,
  sensoryProcessing: 50,
  integration: 30,
  efficiency: 50,
  speed: 50,
};

const DEFAULT_PROFILE: LearnerProfile = {
  skills: DEFAULT_SKILLS,
  learningStyle: {
    prefersTrial: 0.5,
    usesHints: 0.5,
    explorative: 0.5,
    persistent: 0.5,
  },
  averageSuccessRate: 0,
  averageTimePerMission: 0,
  currentStreak: 0,
  longestStreak: 0,
  currentDifficultyMultiplier: 1.0,
  optimalChallengeLevel: 2,
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      attemptHistory: [],
      personalizedHints: {},
      adaptedMissionParams: {},
      sessionStartTime: Date.now(),
      missionsThisSession: 0,

      recordAttempt: (attempt) => {
        const state = get();
        const newHistory = [...state.attemptHistory, attempt];
        
        // Update learning style based on behavior
        const recentAttempts = newHistory.slice(-20);
        const avgHints = recentAttempts.reduce((sum, a) => sum + a.hintsUsed, 0) / recentAttempts.length;
        const avgNeurons = recentAttempts.reduce((sum, a) => sum + a.neuronsPlaced, 0) / recentAttempts.length;
        const avgErrors = recentAttempts.reduce((sum, a) => sum + a.errorsBeforeSuccess, 0) / recentAttempts.length;
        const successRate = recentAttempts.filter(a => a.success).length / recentAttempts.length;
        
        // Calculate streak
        let currentStreak = 0;
        for (let i = newHistory.length - 1; i >= 0; i--) {
          if (newHistory[i].success) currentStreak++;
          else break;
        }
        
        // Update skills based on mission type and performance
        const skillUpdates: Partial<SkillMetrics> = {};
        if (attempt.missionId <= 1) {
          skillUpdates.motorControl = attempt.success ? 5 : -2;
        } else if (attempt.missionId <= 3) {
          skillUpdates.sensoryProcessing = attempt.success ? 5 : -2;
        } else if (attempt.missionId >= 4) {
          skillUpdates.integration = attempt.success ? 5 : -2;
        }
        
        if (attempt.success) {
          skillUpdates.efficiency = attempt.neuronsPlaced < 6 ? 3 : -1;
          skillUpdates.speed = attempt.timeSpentSeconds < 60 ? 3 : -1;
        }
        
        const newSkills = { ...state.profile.skills };
        Object.entries(skillUpdates).forEach(([skill, delta]) => {
          const key = skill as keyof SkillMetrics;
          newSkills[key] = Math.max(0, Math.min(100, newSkills[key] + delta));
        });
        
        // Adaptive difficulty: target 85% success rate for optimal learning
        let newDifficultyMultiplier = state.profile.currentDifficultyMultiplier;
        if (successRate > 0.9) {
          newDifficultyMultiplier = Math.min(2.0, newDifficultyMultiplier + 0.1);
        } else if (successRate < 0.6) {
          newDifficultyMultiplier = Math.max(0.5, newDifficultyMultiplier - 0.1);
        }
        
        set({
          attemptHistory: newHistory,
          missionsThisSession: state.missionsThisSession + 1,
          profile: {
            ...state.profile,
            skills: newSkills,
            learningStyle: {
              prefersTrial: Math.min(1, avgErrors / 5),
              usesHints: Math.min(1, avgHints / 3),
              explorative: Math.min(1, avgNeurons / 10),
              persistent: Math.min(1, currentStreak / 5),
            },
            averageSuccessRate: successRate,
            averageTimePerMission: recentAttempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / recentAttempts.length,
            currentStreak,
            longestStreak: Math.max(state.profile.longestStreak, currentStreak),
            currentDifficultyMultiplier: newDifficultyMultiplier,
          },
        });
      },

      updateSkill: (skill, delta) => {
        set((state) => ({
          profile: {
            ...state.profile,
            skills: {
              ...state.profile.skills,
              [skill]: Math.max(0, Math.min(100, state.profile.skills[skill] + delta)),
            },
          },
        }));
      },

      calculateOptimalDifficulty: () => {
        const state = get();
        const { skills, averageSuccessRate } = state.profile;
        
        // Weighted average of skills
        const avgSkill = (
          skills.motorControl * 0.25 +
          skills.sensoryProcessing * 0.25 +
          skills.integration * 0.3 +
          skills.efficiency * 0.1 +
          skills.speed * 0.1
        );
        
        // Map skill level to difficulty (1-5)
        let optimalDifficulty = Math.round(avgSkill / 20);
        
        // Adjust based on success rate (target 85%)
        if (averageSuccessRate > 0.9) optimalDifficulty += 1;
        else if (averageSuccessRate < 0.6) optimalDifficulty -= 1;
        
        return Math.max(1, Math.min(5, optimalDifficulty));
      },

      getAdaptedMissionConfig: (missionId) => {
        const state = get();
        const { profile } = state;
        
        // Determine scaffolding based on skill level and learning style
        let scaffoldingLevel: "none" | "light" | "medium" | "heavy" = "none";
        const avgSkill = Object.values(profile.skills).reduce((a, b) => a + b, 0) / 5;
        
        if (avgSkill < 30 || profile.learningStyle.usesHints > 0.7) {
          scaffoldingLevel = "heavy";
        } else if (avgSkill < 50 || profile.learningStyle.usesHints > 0.5) {
          scaffoldingLevel = "medium";
        } else if (avgSkill < 70) {
          scaffoldingLevel = "light";
        }
        
        // Recommend hints based on learning style
        const recommendedHints = profile.learningStyle.usesHints > 0.5 ? 2 : 
                                 profile.learningStyle.usesHints > 0.3 ? 1 : 0;
        
        // Enable bonus challenges for high performers
        const bonusChallenges = profile.currentDifficultyMultiplier > 1.3 && profile.averageSuccessRate > 0.8;
        
        return {
          difficultyMultiplier: profile.currentDifficultyMultiplier,
          recommendedHints,
          scaffoldingLevel,
          bonusChallenges,
        };
      },

      analyzeWeaknesses: () => {
        const state = get();
        const skills = state.profile.skills;
        
        return Object.entries(skills)
          .map(([skill, score]) => ({ skill: skill as keyof SkillMetrics, score }))
          .sort((a, b) => a.score - b.score)
          .slice(0, 3);
      },

      generateLearningPath: () => {
        const state = get();
        const weaknesses = state.analyzeWeaknesses();
        const completedMissions = state.attemptHistory
          .filter(a => a.success)
          .map(a => a.missionId);
        
        // Skill-to-mission mapping
        const skillMissionMap: Record<keyof SkillMetrics, number[]> = {
          motorControl: [1],
          sensoryProcessing: [2, 3],
          integration: [4, 5],
          efficiency: [1, 2, 3],
          speed: [1, 2],
        };
        
        // Generate path focusing on weak skills
        const recommendedPath: number[] = [];
        
        for (const weakness of weaknesses) {
          const missions = skillMissionMap[weakness.skill] || [];
          for (const missionId of missions) {
            if (!recommendedPath.includes(missionId)) {
              recommendedPath.push(missionId);
            }
          }
        }
        
        // Add any uncompleted missions
        for (let i = 1; i <= 5; i++) {
          if (!completedMissions.includes(i) && !recommendedPath.includes(i)) {
            recommendedPath.push(i);
          }
        }
        
        return recommendedPath.slice(0, 3);
      },

      startSession: () => {
        set({
          sessionStartTime: Date.now(),
          missionsThisSession: 0,
        });
      },

      resetLearningData: () => {
        set({
          profile: DEFAULT_PROFILE,
          attemptHistory: [],
          personalizedHints: {},
          adaptedMissionParams: {},
          sessionStartTime: Date.now(),
          missionsThisSession: 0,
        });
      },
    }),
    {
      name: "neuroquest-learning-storage",
    }
  )
);

// Utility functions for AI-powered features
export const getSkillLabel = (score: number): string => {
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 40) return "Intermediate";
  if (score >= 20) return "Beginner";
  return "Novice";
};

export const getRecommendation = (profile: LearnerProfile): string => {
  const weakest = Object.entries(profile.skills)
    .sort(([, a], [, b]) => a - b)[0];
  
  const recommendations: Record<keyof SkillMetrics, string> = {
    motorControl: "Practice connecting motor neurons in Mission 1 to improve movement understanding.",
    sensoryProcessing: "Focus on touch reflex missions (2 & 3) to strengthen sensory pathway skills.",
    integration: "Challenge yourself with Mission 5 to improve circuit integration abilities.",
    efficiency: "Try completing missions with fewer neurons to boost efficiency scores.",
    speed: "Set personal time goals to improve problem-solving speed.",
  };
  
  return recommendations[weakest[0] as keyof SkillMetrics] || "Keep practicing to improve!";
};
