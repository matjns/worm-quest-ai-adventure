import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CircuitState {
  neurons: Array<{
    id: string;
    color: string;
    size: number;
    x: number;
    y: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
  }>;
}

interface HintRequest {
  circuitState: CircuitState;
  ageGroup: 'prek' | 'k5' | 'middle' | 'high';
  previousHints?: string[];
}

const agePrompts: Record<string, string> = {
  'prek': `You are a friendly brain buddy helping young children (ages 3-5) explore neurons! 
Use simple words, emoji, and excitement. Keep hints to 1 short sentence.
Examples: "Try adding a red neuron! 🔴" or "Connect two neurons to make friends! 💫"`,
  
  'k5': `You are an encouraging science guide for elementary students (ages 5-10).
Use simple but accurate terms. Keep hints to 1-2 sentences.
Examples: "What happens if you connect the blue sensor to a motor neuron?" or "Try making a chain of 3 neurons!"`,
  
  'middle': `You are a neuroscience mentor for middle schoolers (ages 11-14).
Use proper terminology while staying approachable. Encourage experimentation.
Examples: "Your circuit has sensory neurons but no interneurons - try adding one to process signals!" or "Connect multiple inputs to one output to see signal integration."`,
  
  'high': `You are a research advisor for high school students (ages 14-18).
Use accurate scientific terminology. Encourage hypothesis-driven exploration.
Examples: "Your reflex arc is missing the sensory-to-interneuron pathway. Try completing the circuit." or "Experiment with convergent vs divergent neural pathways."`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { circuitState, ageGroup, previousHints = [] }: HintRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const neuronCount = circuitState.neurons.length;
    const connectionCount = circuitState.connections.length;
    const colors = [...new Set(circuitState.neurons.map(n => n.color))];
    
    const circuitDescription = neuronCount === 0 
      ? "The canvas is empty - no neurons yet."
      : `Current circuit: ${neuronCount} neurons (colors: ${colors.join(', ')}), ${connectionCount} connections. ${
          connectionCount === 0 ? "No connections between neurons." : 
          connectionCount < neuronCount ? "Some neurons are isolated." :
          "Neurons are well connected."
        }`;

    const userPrompt = `Analyze this neural circuit and suggest ONE gentle experiment hint:

${circuitDescription}

${previousHints.length > 0 ? `Avoid repeating these previous hints: ${previousHints.slice(-3).join('; ')}` : ''}

Return a JSON object with:
- "hint": The suggestion text (keep it encouraging and curious)
- "type": One of "add_neuron", "make_connection", "experiment", "pattern"
- "emoji": A relevant emoji for the hint`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: agePrompts[ageGroup] || agePrompts['k5'] },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from the response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = { hint: content, type: 'experiment', emoji: '💡' };
      }
    } catch {
      result = { hint: content, type: 'experiment', emoji: '💡' };
    }

    console.log('Discovery hint generated:', result);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Discovery hints error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
