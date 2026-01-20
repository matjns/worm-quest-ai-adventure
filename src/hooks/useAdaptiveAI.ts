import { useState, useCallback } from "react";
import { useLearningStore, SkillMetrics, getSkillLabel } from "@/stores/learningStore";
import { toast } from "sonner";

interface PersonalizedContent {
  scaffolding?: string;
  adaptedHints: string[];
  encouragement: string;
  bonusChallenge?: string;
}

interface LearningInsight {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  nextSteps: string[];
}

type AgeGroup = "pre-k" | "k5" | "middle" | "high";

export function useAdaptiveAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { profile, analyzeWeaknesses, generateLearningPath, getAdaptedMissionConfig } = useLearningStore();

  const callAI = useCallback(async (
    prompt: string,
    systemPrompt: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/adaptive-learning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            systemPrompt,
            learnerProfile: {
              skills: profile.skills,
              learningStyle: profile.learningStyle,
              successRate: profile.averageSuccessRate,
              streak: profile.currentStreak,
              difficultyLevel: profile.currentDifficultyMultiplier,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Too many requests. Please wait a moment.");
          throw new Error("Rate limit exceeded");
        }
        if (response.status === 402) {
          toast.error("AI credits depleted. Please add more credits.");
          throw new Error("Payment required");
        }
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const getPersonalizedContent = useCallback(async (
    missionId: number,
    missionTitle: string,
    missionDescription: string,
    ageGroup: AgeGroup = "middle"
  ): Promise<PersonalizedContent> => {
    const config = getAdaptedMissionConfig(missionId);
    const weaknesses = analyzeWeaknesses();
    
    // Build context for AI
    const skillSummary = Object.entries(profile.skills)
      .map(([skill, score]) => `${skill}: ${getSkillLabel(score)} (${score}%)`)
      .join(", ");
    
    const prompt = `
Mission: "${missionTitle}"
Description: ${missionDescription}
Learner's Skills: ${skillSummary}
Success Rate: ${(profile.averageSuccessRate * 100).toFixed(0)}%
Current Streak: ${profile.currentStreak}
Learning Style: ${profile.learningStyle.usesHints > 0.5 ? "Prefers hints" : "Independent learner"}, ${profile.learningStyle.prefersTrial > 0.5 ? "Trial-and-error" : "Careful planner"}
Scaffolding Level: ${config.scaffoldingLevel}
Weakest Skills: ${weaknesses.map(w => w.skill).join(", ")}

Generate personalized learning content for this mission.
`;

    try {
      const result = await callAI(prompt, getSystemPrompt(ageGroup, "personalize"));
      return JSON.parse(result);
    } catch {
      // Fallback to local generation
      return generateLocalContent(
        config.scaffoldingLevel,
        config.bonusChallenges,
        profile.currentStreak,
        missionTitle
      );
    }
  }, [callAI, getAdaptedMissionConfig, analyzeWeaknesses, profile]);

  const getLearningInsights = useCallback(async (
    ageGroup: AgeGroup = "middle"
  ): Promise<LearningInsight> => {
    const weaknesses = analyzeWeaknesses();
    const learningPath = generateLearningPath();
    
    const prompt = `
Analyze this learner's progress and provide insights:

Skills: ${JSON.stringify(profile.skills)}
Success Rate: ${(profile.averageSuccessRate * 100).toFixed(0)}%
Longest Streak: ${profile.longestStreak}
Current Difficulty: ${profile.currentDifficultyMultiplier.toFixed(1)}x
Weakest Areas: ${weaknesses.map(w => `${w.skill} (${w.score}%)`).join(", ")}
Recommended Path: Missions ${learningPath.join(", ")}

Provide a brief learning insight with strengths, areas to improve, and next steps.
`;

    try {
      const result = await callAI(prompt, getSystemPrompt(ageGroup, "insights"));
      return JSON.parse(result);
    } catch {
      // Fallback
      return {
        summary: `You've achieved a ${(profile.averageSuccessRate * 100).toFixed(0)}% success rate!`,
        strengths: getStrengths(profile.skills),
        areasToImprove: weaknesses.map(w => formatSkillName(w.skill)),
        nextSteps: [`Try Mission ${learningPath[0]} next`],
      };
    }
  }, [callAI, analyzeWeaknesses, generateLearningPath, profile]);

  const getAdaptiveHint = useCallback(async (
    context: string,
    previousHints: string[],
    ageGroup: AgeGroup = "middle"
  ): Promise<string> => {
    const config = getAdaptedMissionConfig(0);
    
    const prompt = `
The learner is stuck and needs a hint.
Context: ${context}
Previous hints given: ${previousHints.join("; ") || "None"}
Learner skill level: ${getSkillLabel(Object.values(profile.skills).reduce((a, b) => a + b, 0) / 5)}
Scaffolding preference: ${config.scaffoldingLevel}

Provide a helpful hint that guides without giving away the answer.
`;

    try {
      return await callAI(prompt, getSystemPrompt(ageGroup, "hint"));
    } catch {
      return "Try connecting the sensory neuron to a command neuron first, then connect to a motor neuron!";
    }
  }, [callAI, getAdaptedMissionConfig, profile]);

  const generateBonusChallenge = useCallback(async (
    missionId: number,
    completedBehavior: string,
    ageGroup: AgeGroup = "middle"
  ): Promise<string | null> => {
    const config = getAdaptedMissionConfig(missionId);
    
    if (!config.bonusChallenges) return null;
    
    const prompt = `
The learner just completed Mission ${missionId} achieving: ${completedBehavior}
They're performing at ${profile.currentDifficultyMultiplier.toFixed(1)}x difficulty level.
Current streak: ${profile.currentStreak}

Generate a brief bonus challenge that extends this mission's learning.
`;

    try {
      return await callAI(prompt, getSystemPrompt(ageGroup, "bonus"));
    } catch {
      return "🌟 BONUS: Can you complete this circuit using only 3 neurons?";
    }
  }, [callAI, getAdaptedMissionConfig, profile]);

  return {
    isLoading,
    error,
    getPersonalizedContent,
    getLearningInsights,
    getAdaptiveHint,
    generateBonusChallenge,
    // Expose local utilities for non-AI fallback
    getAdaptedMissionConfig,
    analyzeWeaknesses,
    generateLearningPath,
  };
}

// System prompts for different AI tasks
function getSystemPrompt(ageGroup: AgeGroup, task: "personalize" | "insights" | "hint" | "bonus"): string {
  const ageContexts: Record<AgeGroup, string> = {
    "pre-k": "Use very simple words and lots of encouragement. Ages 3-5.",
    "k5": "Use simple sentences and fun comparisons. Ages 5-10.",
    "middle": "Be friendly and educational. Explain concepts clearly. Ages 11-14.",
    "high": "Be scientific but accessible. Reference real research. Ages 14-18.",
  };

  const taskPrompts: Record<typeof task, string> = {
    personalize: `You are an adaptive learning AI for NeuroQuest. Generate personalized content based on the learner's profile. Return JSON with: scaffolding (optional intro help), adaptedHints (array of 3 hints), encouragement (motivational message), bonusChallenge (optional extra challenge for advanced learners).`,
    insights: `You are a learning analytics AI. Analyze the learner's progress and return JSON with: summary (1-2 sentences), strengths (array of 2-3 items), areasToImprove (array of 2-3 items), nextSteps (array of 1-2 items).`,
    hint: `You are a helpful neuroscience tutor. Give a hint that guides the learner without giving away the answer. Use Socratic questioning when appropriate. Keep it under 50 words.`,
    bonus: `You are a challenge designer. Create a fun bonus challenge that extends the current mission. Keep it under 30 words and make it achievable but challenging.`,
  };

  return `${ageContexts[ageGroup]} ${taskPrompts[task]}`;
}

// Local fallback functions
function generateLocalContent(
  scaffoldingLevel: "none" | "light" | "medium" | "heavy",
  bonusChallenges: boolean,
  streak: number,
  missionTitle: string
): PersonalizedContent {
  const encouragements = [
    `Great job on your ${streak} mission streak! Keep going!`,
    "You're making excellent progress!",
    "Every circuit you build makes your brain stronger!",
    `"${missionTitle}" is a great challenge - you've got this!`,
  ];

  return {
    scaffolding: scaffoldingLevel === "heavy" 
      ? "Let's start simple: First, find the sensory neuron (it detects input). Then find the motor neuron (it creates movement). Now think: what connects them?"
      : undefined,
    adaptedHints: [
      "Look at the neuron types - sensory neurons detect, motors move!",
      "Signals flow from sensors → command → motors",
      "The worm needs the right pathway to respond correctly",
    ],
    encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
    bonusChallenge: bonusChallenges 
      ? "🌟 BONUS: Complete this circuit in under 45 seconds!"
      : undefined,
  };
}

function getStrengths(skills: SkillMetrics): string[] {
  return Object.entries(skills)
    .filter(([, score]) => score >= 60)
    .map(([skill]) => formatSkillName(skill as keyof SkillMetrics));
}

function formatSkillName(skill: keyof SkillMetrics): string {
  const names: Record<keyof SkillMetrics, string> = {
    motorControl: "Motor Control",
    sensoryProcessing: "Sensory Processing",
    integration: "Circuit Integration",
    efficiency: "Building Efficiency",
    speed: "Problem Solving Speed",
  };
  return names[skill];
}
