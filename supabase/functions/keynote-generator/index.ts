import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Slide {
  title: string;
  content: string;
  equations?: string;
  bulletPoints?: string[];
  imagePrompt?: string;
  speakerNotes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, slideCount = 10, style = 'professional' } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert presentation designer specializing in computational neuroscience and C. elegans research. 
Create compelling, educational keynote presentations that blend scientific accuracy with engaging storytelling.

Your slides should:
- Have clear, impactful titles
- Include bullet points for key concepts
- Add relevant equations when discussing computational models
- Suggest image/visualization prompts for each slide
- Include speaker notes for presenters

Style: ${style}`;

    const userPrompt = `Generate a ${slideCount}-slide keynote presentation on: "${topic || 'C. elegans as ExO bio-AI archetype'}"

Include content covering:
1. Introduction and hook
2. Core scientific concepts (e.g., Hodgkin-Huxley models, connectome structure)
3. Practical applications and implications
4. Future directions
5. Conclusion with call to action

Return ONLY a valid JSON array of slides with this structure:
[
  {
    "title": "Slide Title",
    "content": "Main narrative content",
    "bulletPoints": ["Key point 1", "Key point 2"],
    "equations": "dV/dt = -g_L(V - E_L) + I_ext (if applicable)",
    "imagePrompt": "Description for visualization",
    "speakerNotes": "Additional context for presenter"
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let slides: Slide[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      // Generate fallback slides
      slides = generateFallbackSlides(topic || 'C. elegans Neural Networks');
    }

    // Validate and clean slides
    slides = slides.map((slide, i) => ({
      title: slide.title || `Slide ${i + 1}`,
      content: slide.content || '',
      bulletPoints: Array.isArray(slide.bulletPoints) ? slide.bulletPoints : [],
      equations: slide.equations || '',
      imagePrompt: slide.imagePrompt || '',
      speakerNotes: slide.speakerNotes || '',
    }));

    return new Response(JSON.stringify({ slides, topic }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Keynote generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        slides: generateFallbackSlides('C. elegans Neural Networks')
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateFallbackSlides(topic: string): Slide[] {
  return [
    {
      title: topic,
      content: "An exploration of nature's most elegant neural architecture",
      bulletPoints: ["302 neurons, complete connectome", "Foundation for computational neuroscience", "OpenWorm project milestone"],
      imagePrompt: "C. elegans worm with glowing neural network visualization",
      speakerNotes: "Open with the remarkable fact that C. elegans has the only fully mapped nervous system."
    },
    {
      title: "The Connectome Revolution",
      content: "Understanding every synapse opens new frontiers",
      bulletPoints: ["~7,000 synaptic connections mapped", "Chemical and electrical synapses", "Reproducible across individuals"],
      equations: "",
      imagePrompt: "3D connectome graph visualization with colored neuron types",
      speakerNotes: "Emphasize the unique opportunity this provides for computational modeling."
    },
    {
      title: "Hodgkin-Huxley Framework",
      content: "Mathematical foundations of neural computation",
      bulletPoints: ["Ion channel dynamics", "Action potential generation", "Membrane potential equations"],
      equations: "C_m(dV/dt) = -g_Na·m³h(V - E_Na) - g_K·n⁴(V - E_K) - g_L(V - E_L) + I_ext",
      imagePrompt: "Diagram showing ion channels and membrane potential",
      speakerNotes: "Walk through each term in the equation and its biological meaning."
    },
    {
      title: "From Neurons to Behavior",
      content: "Emergent properties from network dynamics",
      bulletPoints: ["Chemotaxis navigation", "Thermotaxis responses", "Touch reflex circuits"],
      imagePrompt: "Worm navigating gradient with neural activity overlay",
      speakerNotes: "Show how simple circuits produce complex behaviors."
    },
    {
      title: "Exponential Organization Principles",
      content: "C. elegans as a model for scalable bio-AI systems",
      bulletPoints: ["Minimal viable neural architecture", "Maximum behavioral repertoire", "Lessons for artificial systems"],
      imagePrompt: "Scale comparison of C. elegans brain to human and AI systems",
      speakerNotes: "Bridge to ExO concepts and scalability."
    },
    {
      title: "Future Directions",
      content: "Where computational neuroscience meets AI",
      bulletPoints: ["Whole-brain simulation goals", "Neuromorphic computing applications", "Drug discovery acceleration"],
      imagePrompt: "Futuristic lab with holographic brain simulations",
      speakerNotes: "Paint a vision of the future enabled by this research."
    },
    {
      title: "Call to Action",
      content: "Join the digital life revolution",
      bulletPoints: ["Contribute to OpenWorm", "Build simulations and share insights", "Advance computational neuroscience"],
      imagePrompt: "Global network of researchers connected by neural pathways",
      speakerNotes: "End with concrete ways audience can get involved."
    }
  ];
}
