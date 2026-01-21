import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NeuronData {
  neuronId: string;
  type: string;
  connections: number;
  position: { x: number; y: number; z: number };
}

interface GliaAnalysisRequest {
  neurons: NeuronData[];
  analysisType: 'omission' | 'impact' | 'recommendation';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { neurons, analysisType } = await req.json() as GliaAnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a computational neuroscience expert specializing in C. elegans glial cell analysis. 
You analyze neural circuits to identify which neurons lack proper glial cell modeling and assess the impact on simulation accuracy.

C. elegans has 56 glial cells (50 sheath glia, 6 socket glia) that support the 302 neurons. Key facts:
- Sheath glia wrap around sensory neuron endings (amphid/phasmid neurons like ASE, AWC, AWA, AFD)
- CEPsh glia are critical for dopaminergic neuron function
- Glial cells regulate synaptic transmission and ion homeostasis
- Missing glia affects chemotaxis accuracy by 10-15% in simulations

For each neuron, assess:
1. Whether it typically has glial support in vivo
2. Confidence level (0-1) based on published literature
3. Impact on simulation (low/medium/high) if glia is omitted
4. Specific recommendation for modeling`;

    const userPrompt = `Analyze these C. elegans neurons for glia omission impact:

${JSON.stringify(neurons, null, 2)}

Analysis type requested: ${analysisType}

Respond with a JSON object containing:
{
  "analysis": [
    {
      "neuronId": "string",
      "hasGliaInVivo": boolean,
      "gliaType": "sheath" | "socket" | "CEPsh" | "none",
      "confidence": number (0-1),
      "impact": "low" | "medium" | "high",
      "reasoning": "string",
      "recommendation": "string"
    }
  ],
  "overallImpact": {
    "chemotaxisAccuracy": number (percent reduction),
    "mechanosensationAccuracy": number,
    "thermotaxisAccuracy": number
  },
  "summary": "string with overall recommendations"
}`;

    console.log(`Processing glia analysis for ${neurons.length} neurons, type: ${analysisType}`);

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from AI response (handle markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    console.log(`Glia analysis complete: ${analysisResult.analysis?.length || 0} neurons analyzed`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Glia analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
