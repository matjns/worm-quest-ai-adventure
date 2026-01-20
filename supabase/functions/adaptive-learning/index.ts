import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LearnerProfile {
  skills: Record<string, number>;
  learningStyle: Record<string, number>;
  successRate: number;
  streak: number;
  difficultyLevel: number;
}

interface RequestBody {
  prompt: string;
  systemPrompt: string;
  learnerProfile: LearnerProfile;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, systemPrompt, learnerProfile }: RequestBody = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhance system prompt with learner context
    const enhancedSystemPrompt = `${systemPrompt}

LEARNER CONTEXT:
- Skills: ${JSON.stringify(learnerProfile.skills)}
- Success Rate: ${(learnerProfile.successRate * 100).toFixed(0)}%
- Current Streak: ${learnerProfile.streak}
- Difficulty Level: ${learnerProfile.difficultyLevel.toFixed(1)}x
- Learning Style: ${learnerProfile.learningStyle.usesHints > 0.5 ? "Prefers guidance" : "Independent"}, ${learnerProfile.learningStyle.prefersTrial > 0.5 ? "Experimental" : "Methodical"}

Adapt your response to match this learner's level and style.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
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
    const content = data.choices?.[0]?.message?.content || "";
    
    // Try to extract JSON from the response
    let result = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                      content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = jsonMatch[1] || jsonMatch[0];
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Adaptive learning error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
