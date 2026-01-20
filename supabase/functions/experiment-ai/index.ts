import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SimulationVariant {
  id: string;
  name: string;
  connections: Array<{ from: string; to: string; weight: number }>;
  neurons: string[];
  successRate: number;
  testCount: number;
}

interface ExperimentRequest {
  type: "analyze" | "suggest" | "compare" | "validate";
  variants?: SimulationVariant[];
  currentVariant?: SimulationVariant;
  targetBehavior?: string;
  userFeedback?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, variants, currentVariant, targetBehavior, userFeedback }: ExperimentRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "analyze":
        systemPrompt = `You are a neuroscience research assistant analyzing C. elegans neural circuit simulations.
Your role is to provide scientific insights about circuit performance and suggest improvements.

Analyze the circuit variant and provide:
1. A scientific assessment of the circuit structure
2. Potential bottlenecks or inefficiencies
3. Comparison to real C. elegans connectome patterns
4. Specific, actionable improvement suggestions

Format your response as JSON:
{
  "assessment": "Overall circuit evaluation",
  "strengths": ["list of strengths"],
  "weaknesses": ["list of weaknesses"],
  "suggestions": [
    { "type": "add_connection" | "modify_weight" | "remove_neuron", "details": "specific suggestion", "rationale": "scientific reasoning" }
  ],
  "scientificInsight": "Connection to real C. elegans research",
  "confidenceScore": 0.0-1.0
}`;
        userPrompt = `Analyze this neural circuit variant:
Name: ${currentVariant?.name || "Unknown"}
Neurons: ${currentVariant?.neurons?.join(", ") || "None"}
Connections: ${JSON.stringify(currentVariant?.connections || [])}
Success Rate: ${((currentVariant?.successRate || 0) * 100).toFixed(1)}%
Test Count: ${currentVariant?.testCount || 0}
Target Behavior: ${targetBehavior || "General locomotion"}`;
        break;

      case "suggest":
        systemPrompt = `You are an AI research assistant helping students iterate on C. elegans neural circuit experiments.

Based on the current circuit configuration and desired behavior, suggest the next best variant to test.
Your suggestions should be:
1. Scientifically grounded in real C. elegans research
2. Incrementally different (one or two changes)
3. Testable and measurable

Format your response as JSON:
{
  "suggestedVariant": {
    "name": "Descriptive name for the variant",
    "changes": ["list of specific changes from current"],
    "hypothesis": "What we expect to happen",
    "connections": [{ "from": "neuron", "to": "neuron", "weight": 0.0-1.0 }],
    "rationale": "Why this change might work"
  },
  "alternativeVariants": [
    { "name": "Alternative 1", "changes": ["changes"], "rationale": "why" }
  ],
  "estimatedImprovement": "low" | "medium" | "high"
}`;
        userPrompt = `Current circuit:
${JSON.stringify(currentVariant, null, 2)}

Target behavior: ${targetBehavior || "Improve signal propagation"}

${userFeedback ? `User feedback: ${userFeedback}` : ""}

Suggest the next variant to test.`;
        break;

      case "compare":
        systemPrompt = `You are a research analyst comparing neural circuit experiment variants.

Analyze multiple variants and provide insights on:
1. Which variant performs best and why
2. Patterns across successful vs unsuccessful variants
3. Statistical significance considerations
4. Recommendations for further testing

Format your response as JSON:
{
  "bestVariant": "name of best performing variant",
  "ranking": ["ordered list of variant names"],
  "patterns": {
    "successFactors": ["factors that correlate with success"],
    "failureFactors": ["factors that correlate with failure"]
  },
  "statisticalNote": "Comment on sample size and confidence",
  "nextSteps": ["recommended next experiments"]
}`;
        userPrompt = `Compare these experiment variants:
${JSON.stringify(variants, null, 2)}

Target behavior: ${targetBehavior || "General performance"}`;
        break;

      case "validate":
        systemPrompt = `You are a research validation assistant ensuring experimental rigor.

Evaluate the experiment design and results for:
1. Scientific validity
2. Proper controls
3. Reproducibility concerns
4. Alignment with real C. elegans biology

Format your response as JSON:
{
  "isValid": true/false,
  "validationScore": 0.0-1.0,
  "concerns": ["list of scientific concerns"],
  "alignmentWithBiology": "How well this matches real C. elegans",
  "suggestions": ["improvements for experimental rigor"],
  "readyForSubmission": true/false,
  "submissionNotes": "Notes for challenge submission"
}`;
        userPrompt = `Validate this experiment:
Variant: ${JSON.stringify(currentVariant, null, 2)}
Target: ${targetBehavior}
User's observations: ${userFeedback || "None provided"}`;
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    let result = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch {
        result = { raw: content };
      }
    }

    return new Response(
      JSON.stringify({ result, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Experiment AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
