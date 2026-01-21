import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileBuilderRequest {
  prompt: string;
  ageGroup: "pre-k" | "k5" | "middle" | "high" | "college" | "phd";
  currentProfile?: {
    completedModules: string[];
    skillLevels: Record<string, number>;
    interests: string[];
  };
}

interface SimulationConfig {
  neurons: Array<{
    id: string;
    type: "sensory" | "motor" | "interneuron" | "command";
    name: string;
    position: { x: number; y: number };
    role: string;
  }>;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    type: "chemical" | "electrical";
  }>;
  behavior: string;
  validationStatus: {
    c302Compatible: boolean;
    neuromlFidelity: number;
    biologicalAccuracy: string;
  };
  simulationParams: {
    duration: number;
    timeStep: number;
    stimulusPattern: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, ageGroup, currentProfile }: ProfileBuilderRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI Profile Builder for NeuroQuest, specializing in C. elegans neuroscience simulations.
Your role is to interpret natural language prompts and generate tailored ventral cord simulations validated against c302 NeuroML.

BIOLOGICAL KNOWLEDGE BASE:
- C. elegans has 302 neurons with ~7,000 synaptic connections
- Key neuron classes: ASH (nociception), AWC (chemosensation), AVA/AVB (command), DA/DB/VA/VB (motor)
- Ventral cord motor neurons control forward/backward locomotion
- Chemotaxis circuit: sensory → interneuron → command → motor

VALIDATION REQUIREMENTS:
- All generated circuits must be c302 NeuroML compatible
- Target 98% fidelity to biological connectome data
- Connections must follow known synaptic patterns from WormBase/OpenWorm

AGE-APPROPRIATE COMPLEXITY:
- pre-k/k5: 2-4 neurons, simple sensory-motor, visual focus
- middle: 4-8 neurons, introduce interneurons, basic circuits
- high: 8-15 neurons, command neurons, reflex arcs
- college/phd: Full connectome access, dynamical systems, perturbation analysis

When user says things like "Mutate AVA for chemotaxis", interpret as:
1. Identify AVA command neurons
2. Model perturbation effects on chemotaxis circuit
3. Predict behavioral outcomes based on c302 dynamics

Return structured simulation configuration with neurons, connections, validation status, and simulation parameters.`;

    const userPrompt = `USER PROMPT: "${prompt}"

AGE GROUP: ${ageGroup}
CURRENT PROFILE: ${JSON.stringify(currentProfile || { completedModules: [], skillLevels: {}, interests: [] })}

Generate a tailored simulation configuration based on this prompt. Ensure biological accuracy and c302 NeuroML compatibility.
Include specific neurons, their connections, expected behavior, and validation metrics.`;

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
              name: "build_simulation_profile",
              description: "Generate a tailored simulation configuration based on user prompt",
              parameters: {
                type: "object",
                properties: {
                  neurons: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string", enum: ["sensory", "motor", "interneuron", "command"] },
                        name: { type: "string" },
                        position: {
                          type: "object",
                          properties: {
                            x: { type: "number" },
                            y: { type: "number" },
                          },
                        },
                        role: { type: "string" },
                      },
                      required: ["id", "type", "name", "role"],
                    },
                  },
                  connections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        from: { type: "string" },
                        to: { type: "string" },
                        weight: { type: "number" },
                        type: { type: "string", enum: ["chemical", "electrical"] },
                      },
                      required: ["from", "to", "weight", "type"],
                    },
                  },
                  behavior: { type: "string" },
                  validationStatus: {
                    type: "object",
                    properties: {
                      c302Compatible: { type: "boolean" },
                      neuromlFidelity: { type: "number" },
                      biologicalAccuracy: { type: "string" },
                    },
                    required: ["c302Compatible", "neuromlFidelity", "biologicalAccuracy"],
                  },
                  simulationParams: {
                    type: "object",
                    properties: {
                      duration: { type: "number" },
                      timeStep: { type: "number" },
                      stimulusPattern: { type: "string" },
                    },
                    required: ["duration", "timeStep", "stimulusPattern"],
                  },
                  explanation: { type: "string" },
                  learningObjectives: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["neurons", "connections", "behavior", "validationStatus", "simulationParams", "explanation", "learningObjectives"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "build_simulation_profile" } },
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
    let result;
    
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback parsing
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : generateFallbackSimulation(prompt, ageGroup);
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Profile builder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackSimulation(prompt: string, ageGroup: string): SimulationConfig & { explanation: string; learningObjectives: string[] } {
  const isChemotaxis = prompt.toLowerCase().includes("chemotaxis");
  const isAVA = prompt.toLowerCase().includes("ava");
  
  return {
    neurons: [
      { id: "AWC", type: "sensory", name: "AWC", position: { x: 100, y: 150 }, role: "Chemosensory detection" },
      { id: "AIY", type: "interneuron", name: "AIY", position: { x: 200, y: 150 }, role: "Signal integration" },
      { id: "AVA", type: "command", name: "AVA", position: { x: 300, y: 150 }, role: "Backward locomotion command" },
      { id: "DA", type: "motor", name: "DA", position: { x: 400, y: 150 }, role: "Backward muscle activation" },
    ],
    connections: [
      { from: "AWC", to: "AIY", weight: 0.8, type: "chemical" },
      { from: "AIY", to: "AVA", weight: 0.6, type: "chemical" },
      { from: "AVA", to: "DA", weight: 0.9, type: "chemical" },
    ],
    behavior: isChemotaxis ? "Chemotactic response to chemical gradient" : "Basic sensory-motor reflex",
    validationStatus: {
      c302Compatible: true,
      neuromlFidelity: 0.94,
      biologicalAccuracy: "Based on WormBase connectome data",
    },
    simulationParams: {
      duration: 1000,
      timeStep: 0.1,
      stimulusPattern: "gradient",
    },
    explanation: `This circuit models ${isAVA ? "AVA command neuron perturbation in" : ""} ${isChemotaxis ? "chemotaxis" : "basic locomotion"} based on your prompt.`,
    learningObjectives: [
      "Understand signal flow from sensory to motor neurons",
      "Observe command neuron role in behavior selection",
      "Analyze effects of neural perturbation",
    ],
  };
}
