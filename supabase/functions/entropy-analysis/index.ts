import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EntropyProfile {
  userId: string;
  ageGroup: "pre-k" | "k5" | "middle" | "high" | "college" | "phd";
  skillMetrics: Record<string, number>;
  completedModules: string[];
  failedAttempts: Record<string, number>;
  averageCompletionTime: number;
  streakData: { current: number; best: number };
  learningStyle: Record<string, number>;
}

interface ChallengeRemap {
  recommendedChallenges: Array<{
    id: string;
    title: string;
    difficulty: number;
    entropyScore: number;
    focusArea: string;
    rationale: string;
  }>;
  difficultyAdjustment: number;
  contentAdaptations: string[];
  scaffoldingLevel: "none" | "light" | "medium" | "heavy";
  entropyAnalysis: {
    knowledgeGaps: string[];
    strengthAreas: string[];
    optimalChallengeZone: string;
    retentionPrediction: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, requestType = "full" }: { profile: EntropyProfile; requestType?: string } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const ageContexts: Record<string, string> = {
      "pre-k": "Ages 3-5. Use very simple ion channel colors, emoji-based learning, tap interactions. Focus: basic cause-and-effect with neurons.",
      "k5": "Ages 5-10. Simple circuit building with fun animations. Focus: sensory-motor pathways, basic neuron types.",
      "middle": "Ages 11-14. Introduction to connectome concepts, circuit efficiency. Focus: command neurons, integration patterns.",
      "high": "Ages 14-18. Advanced neural networks, activation functions, RL concepts. Focus: plasticity, learning algorithms.",
      "college": "Ages 18-22. Research-grade simulations, c302 NeuroML validation. Focus: dynamical systems, bifurcation theory.",
      "phd": "Graduate level. Full connectome manipulation, chaos theory, entropy analysis. Focus: bifurcation forks, attractor landscapes.",
    };

    // Calculate entropy from skill distribution
    const skills = Object.values(profile.skillMetrics);
    const avgSkill = skills.reduce((a, b) => a + b, 0) / skills.length || 50;
    const variance = skills.reduce((a, b) => a + Math.pow(b - avgSkill, 2), 0) / skills.length;
    const entropy = Math.log2(1 + Math.sqrt(variance)) / Math.log2(100);

    const systemPrompt = `You are an advanced Adaptive Learning AI for NeuroQuest, a C. elegans neuroscience education platform.
Your role is to analyze learner entropy and dynamically remap connectome challenges for optimal retention.

AGE GROUP CONTEXT: ${ageContexts[profile.ageGroup]}

ENTROPY ANALYSIS FRAMEWORK:
- High entropy (>0.7): Inconsistent performance → provide more scaffolding, revisit fundamentals
- Medium entropy (0.3-0.7): Normal learning curve → progressive difficulty scaling
- Low entropy (<0.3): Consistent mastery → introduce advanced concepts, reduce scaffolding

CHALLENGE REMAPPING PRINCIPLES:
1. Target 85% success rate zone for optimal learning (Zone of Proximal Development)
2. Use reinforcement learning principles: reward consistency, penalize wild variance
3. Validate against c302 NeuroML biological accuracy
4. Scale from ion channel colors (pre-K) to bifurcation forks (PhD) seamlessly

Return JSON with challengeRemap structure: recommendedChallenges, difficultyAdjustment, contentAdaptations, scaffoldingLevel, entropyAnalysis.`;

    const userPrompt = `Analyze this learner and generate personalized challenge remapping:

LEARNER PROFILE:
- User ID: ${profile.userId}
- Age Group: ${profile.ageGroup}
- Skills: ${JSON.stringify(profile.skillMetrics)}
- Completed Modules: ${profile.completedModules.join(", ") || "None"}
- Failed Attempts: ${JSON.stringify(profile.failedAttempts)}
- Average Completion Time: ${profile.averageCompletionTime}s
- Current Streak: ${profile.streakData.current} (Best: ${profile.streakData.best})
- Learning Style: ${JSON.stringify(profile.learningStyle)}

CALCULATED ENTROPY: ${entropy.toFixed(3)}
SKILL VARIANCE: ${variance.toFixed(1)}

${requestType === "quick" ? "Provide a quick analysis focusing on immediate next challenge." : "Provide comprehensive analysis with 3-5 recommended challenges and detailed entropy breakdown."}

Generate adaptive challenge remapping that maximizes retention (target 10x baseline through entropy minimization).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_challenge_remap",
              description: "Generate personalized challenge remapping based on entropy analysis",
              parameters: {
                type: "object",
                properties: {
                  recommendedChallenges: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        difficulty: { type: "number" },
                        entropyScore: { type: "number" },
                        focusArea: { type: "string" },
                        rationale: { type: "string" },
                      },
                      required: ["id", "title", "difficulty", "focusArea", "rationale"],
                    },
                  },
                  difficultyAdjustment: { type: "number" },
                  contentAdaptations: {
                    type: "array",
                    items: { type: "string" },
                  },
                  scaffoldingLevel: {
                    type: "string",
                    enum: ["none", "light", "medium", "heavy"],
                  },
                  entropyAnalysis: {
                    type: "object",
                    properties: {
                      knowledgeGaps: { type: "array", items: { type: "string" } },
                      strengthAreas: { type: "array", items: { type: "string" } },
                      optimalChallengeZone: { type: "string" },
                      retentionPrediction: { type: "number" },
                    },
                    required: ["knowledgeGaps", "strengthAreas", "optimalChallengeZone", "retentionPrediction"],
                  },
                },
                required: ["recommendedChallenges", "difficultyAdjustment", "contentAdaptations", "scaffoldingLevel", "entropyAnalysis"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_challenge_remap" } },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let result: ChallengeRemap;
    
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback parsing from content
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : generateFallbackRemap(profile, entropy);
    }

    return new Response(
      JSON.stringify({ 
        result, 
        calculatedEntropy: entropy,
        skillVariance: variance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Entropy analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackRemap(profile: EntropyProfile, entropy: number): ChallengeRemap {
  const scaffoldingLevel = entropy > 0.7 ? "heavy" : entropy > 0.4 ? "medium" : entropy > 0.2 ? "light" : "none";
  
  return {
    recommendedChallenges: [
      {
        id: "adaptive-1",
        title: "Personalized Circuit Challenge",
        difficulty: Math.max(0.5, 1 - entropy),
        entropyScore: entropy,
        focusArea: "sensory-motor",
        rationale: "Tailored to current skill level",
      },
    ],
    difficultyAdjustment: entropy > 0.5 ? -0.2 : 0.1,
    contentAdaptations: [
      entropy > 0.5 ? "Add visual scaffolding" : "Reduce hints",
      "Personalized pacing enabled",
    ],
    scaffoldingLevel,
    entropyAnalysis: {
      knowledgeGaps: Object.entries(profile.skillMetrics)
        .filter(([, v]) => v < 50)
        .map(([k]) => k),
      strengthAreas: Object.entries(profile.skillMetrics)
        .filter(([, v]) => v >= 70)
        .map(([k]) => k),
      optimalChallengeZone: `${Math.round((1 - entropy) * 100)}% difficulty`,
      retentionPrediction: Math.round((1 - entropy * 0.5) * 100),
    },
  };
}
