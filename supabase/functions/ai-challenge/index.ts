import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChallengeRequest {
  type: "generate_challenge" | "generate_quiz" | "get_hint" | "validate_simulation";
  ageGroup: "pre-k" | "k5" | "middle" | "high";
  topic?: string;
  difficulty?: number;
  context?: string;
}

const systemPrompts = {
  "pre-k": `You are a friendly, encouraging science teacher for Pre-K children (ages 3-5). 
Use simple words, lots of enthusiasm, and relate everything to things kids know (colors, animals, wiggling).
Keep responses very short (1-2 sentences). Use emojis liberally! 🐛✨
Focus on visual concepts like colors, shapes, and movement.`,
  
  "k5": `You are an engaging science teacher for elementary students (ages 5-11).
Use clear, simple language but introduce scientific terms with explanations.
Make learning fun with analogies to everyday things like games, food, and toys.
Keep responses concise (2-3 sentences) and end with encouraging words!`,
  
  "middle": `You are a science mentor for middle school students (ages 11-14).
Introduce real scientific concepts while keeping it engaging.
Use analogies to technology, games, and social media they understand.
Be supportive but challenge them to think deeper.`,
  
  "high": `You are a neuroscience tutor for high school students and beyond.
Use proper scientific terminology while remaining accessible.
Connect concepts to real research and career opportunities.
Encourage critical thinking and hypothesis formation.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ageGroup, topic, difficulty, context }: ChallengeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";
    
    switch (type) {
      case "generate_challenge":
        userPrompt = `Generate a fun, age-appropriate neuroscience challenge about ${topic || "neurons and worms"}.
The challenge should be at difficulty level ${difficulty || 1}/5.
Include: a catchy title, a brief description, and a clear objective.
Format as JSON: { "title": "...", "description": "...", "objective": "...", "hint": "..." }`;
        break;
        
      case "generate_quiz":
        userPrompt = `Create a quick quiz question about ${topic || "C. elegans neurons"}.
Make it engaging and educational for the age group.
Format as JSON: { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }`;
        break;
        
      case "get_hint":
        userPrompt = `The student is stuck on: "${context}". 
Give them a helpful hint that guides them without giving away the answer.
Be encouraging! Keep it to 1-2 sentences.`;
        break;
        
      case "validate_simulation":
        userPrompt = `The student created a neural simulation with these parameters: ${context}
Analyze if this is scientifically reasonable for C. elegans.
Format as JSON: { "isValid": true/false, "feedback": "...", "suggestions": ["..."] }`;
        break;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompts[ageGroup] },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse JSON if the response contains it
    let result = content;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Keep as string if not valid JSON
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI challenge error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
