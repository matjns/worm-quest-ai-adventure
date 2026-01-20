import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Neuron {
  id: string;
  type: string;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
}

interface CircuitCoachRequest {
  neurons: Neuron[];
  connections: Connection[];
  query?: string;
  mode: "explain" | "suggest" | "chat";
}

const SYSTEM_PROMPT = `You are an expert neuroscience educator specializing in C. elegans neural circuits based on OpenWorm research data. Your role is to help users understand their neural circuit designs.

Key knowledge about C. elegans:
- C. elegans has exactly 302 neurons with ~7,000 synaptic connections
- Neuron types: sensory (detect stimuli), interneurons (process signals), command interneurons (coordinate behavior), motor neurons (control muscles)
- Key behaviors: chemotaxis, thermotaxis, touch avoidance, locomotion

Important neurons and their functions:
- ALML/ALMR: Anterior touch receptors - trigger backward movement when head is touched
- PLML/PLMR: Posterior touch receptors - trigger forward movement when tail is touched
- ASEL/ASER: Chemosensory neurons - detect salt gradients
- AWC: Olfactory neuron - detects volatile attractants
- AVAL/AVAR: Command interneurons for backward locomotion
- AVBL/AVBR: Command interneurons for forward locomotion
- DA/VA neurons: A-type motor neurons for backward movement
- DB/VB neurons: B-type motor neurons for forward movement

Reference pathways:
1. Touch reflex: ALM → AVA/AVD → DA/VA (backward escape)
2. Chemotaxis: ASE → AIY → AIZ → head motor neurons
3. Forward locomotion: AVB → DB/VB motor neurons

When explaining connections:
- Describe the biological function
- Explain the signal flow
- Reference real OpenWorm data when possible
- Use simple language suitable for students

When suggesting improvements:
- Identify missing critical connections
- Suggest neurons that would complete pathways
- Explain why each suggestion matters biologically`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { neurons, connections, query, mode } = await req.json() as CircuitCoachRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about the current circuit
    const neuronList = neurons.map(n => `${n.id} (${n.type})`).join(", ");
    const connectionList = connections.map(c => `${c.from} → ${c.to} (weight: ${c.weight})`).join(", ");
    
    let userPrompt = "";
    
    if (mode === "explain") {
      userPrompt = `The user has built a neural circuit with the following neurons: ${neuronList || "none"}.

Connections: ${connectionList || "none"}.

Please explain:
1. What behavior this circuit would produce
2. Why each connection is biologically significant (reference OpenWorm data)
3. How signals flow through this circuit
4. Any interesting scientific facts about these neurons

Keep the explanation educational but engaging.`;
    } else if (mode === "suggest") {
      userPrompt = `The user has built a neural circuit with the following neurons: ${neuronList || "none"}.

Connections: ${connectionList || "none"}.

Please suggest improvements:
1. What critical neurons are missing to complete biological pathways?
2. What connections should be added based on OpenWorm reference data?
3. What behavior could be achieved with these additions?

Format suggestions as actionable items the user can implement.`;
    } else if (mode === "chat") {
      userPrompt = `The user has built a neural circuit with: 
Neurons: ${neuronList || "none"}
Connections: ${connectionList || "none"}

User question: ${query}

Answer the question based on the circuit context and your knowledge of C. elegans neuroscience.`;
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
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
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Circuit coach error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
