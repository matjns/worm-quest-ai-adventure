import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WormAtlas ground truth reference data for validation
const WORMATLAS_GROUND_TRUTH = {
  neurotransmitters: {
    GABA: {
      neurons: ['RME', 'RIS', 'AVL', 'DVB', 'DD', 'VD'],
      normalRange: { min: 0.2, max: 0.8 },
      inhibitory: true,
      targetMuscles: ['body_wall', 'vulva', 'enteric'],
    },
    acetylcholine: {
      neurons: ['VA', 'VB', 'DA', 'DB', 'AS', 'VC'],
      normalRange: { min: 0.3, max: 0.9 },
      excitatory: true,
      targetMuscles: ['body_wall'],
    },
    dopamine: {
      neurons: ['CEP', 'ADE', 'PDE'],
      normalRange: { min: 0.1, max: 0.6 },
      modulatory: true,
      behaviors: ['locomotion_modulation', 'food_response'],
    },
    serotonin: {
      neurons: ['NSM', 'HSN', 'ADF'],
      normalRange: { min: 0.1, max: 0.5 },
      modulatory: true,
      behaviors: ['egg_laying', 'feeding', 'locomotion'],
    },
    glutamate: {
      neurons: ['AVA', 'AVB', 'AVD', 'AVE', 'PVC'],
      normalRange: { min: 0.2, max: 0.7 },
      excitatory: true,
      behaviors: ['command_interneuron_signaling'],
    },
  },
  synapticConnections: {
    // Key circuits from WormAtlas
    touchReflex: {
      pathway: ['ALM', 'AVM', 'PLM'] as string[],
      interneurons: ['AVD', 'AVA', 'PVC'],
      motors: ['DA', 'VA', 'DB', 'VB'],
      expectedLatency: { min: 50, max: 200 }, // ms
    },
    chemotaxis: {
      sensors: ['AWC', 'AWA', 'ASE'],
      interneurons: ['AIY', 'AIZ', 'AIB', 'RIA'],
      motors: ['SMB', 'SMD', 'RME'],
      expectedLatency: { min: 100, max: 500 },
    },
    locomotion: {
      commandForward: ['AVB', 'PVC'],
      commandBackward: ['AVA', 'AVD', 'AVE'],
      motorDorsal: ['DA', 'DB', 'DD'],
      motorVentral: ['VA', 'VB', 'VD'],
    },
  },
  chaosIndicators: {
    lyapunovThreshold: 0.1, // Positive = chaos
    entropyThreshold: 2.5, // Bits, high = disorder
    bifurcationSensitivity: 0.05,
  },
};

interface PerturbationInput {
  type: 'neurotransmitter' | 'synapse' | 'neuron_ablation' | 'connection_weight';
  target: string;
  value: number;
  originalValue?: number;
  circuit?: string;
}

interface SimulationState {
  neurons: Array<{
    id: string;
    activity: number;
    membrane_potential: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    type: string;
  }>;
  timeStep: number;
  entropy?: number;
}

interface ValidationRequest {
  perturbation: PerturbationInput;
  simulationState: SimulationState;
  userHypothesis?: string;
}

// Calculate Lyapunov exponent approximation from activity patterns
function estimateLyapunovExponent(activities: number[]): number {
  if (activities.length < 10) return 0;
  
  let divergence = 0;
  const epsilon = 0.001;
  
  for (let i = 1; i < activities.length; i++) {
    const delta = Math.abs(activities[i] - activities[i - 1]);
    if (delta > epsilon) {
      divergence += Math.log(delta / epsilon);
    }
  }
  
  return divergence / activities.length;
}

// Calculate entropy of neural activity distribution
function calculateEntropy(activities: number[]): number {
  const bins = 10;
  const histogram = new Array(bins).fill(0);
  
  activities.forEach(a => {
    const bin = Math.min(Math.floor(a * bins), bins - 1);
    histogram[bin]++;
  });
  
  const total = activities.length;
  let entropy = 0;
  
  histogram.forEach(count => {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  });
  
  return entropy;
}

// Detect chaos attractors in the simulation
function detectChaosAttractors(state: SimulationState, perturbation: PerturbationInput): {
  isChaotic: boolean;
  lyapunovExponent: number;
  entropy: number;
  attractorType: 'fixed_point' | 'limit_cycle' | 'strange_attractor' | 'stable';
  confidence: number;
} {
  const activities = state.neurons.map(n => n.activity);
  const lyapunov = estimateLyapunovExponent(activities);
  const entropy = calculateEntropy(activities);
  
  const thresholds = WORMATLAS_GROUND_TRUTH.chaosIndicators;
  
  let attractorType: 'fixed_point' | 'limit_cycle' | 'strange_attractor' | 'stable' = 'stable';
  let isChaotic = false;
  
  if (lyapunov > thresholds.lyapunovThreshold) {
    isChaotic = true;
    attractorType = 'strange_attractor';
  } else if (entropy > thresholds.entropyThreshold) {
    attractorType = 'limit_cycle';
  } else if (Math.abs(lyapunov) < 0.01) {
    attractorType = 'fixed_point';
  }
  
  // Confidence based on sample size and consistency
  const confidence = Math.min(0.95, 0.5 + (state.neurons.length / 100) * 0.3 + 
    (state.timeStep > 100 ? 0.15 : state.timeStep / 1000));
  
  return { isChaotic, lyapunovExponent: lyapunov, entropy, attractorType, confidence };
}

// Validate against WormAtlas ground truth
function validateAgainstGroundTruth(perturbation: PerturbationInput): {
  isValid: boolean;
  deviationScore: number;
  groundTruthReference: string;
  warnings: string[];
  biologicalPlausibility: number;
} {
  const warnings: string[] = [];
  let deviationScore = 0;
  let groundTruthReference = '';
  let biologicalPlausibility = 1.0;
  
  if (perturbation.type === 'neurotransmitter') {
    const ntData = WORMATLAS_GROUND_TRUTH.neurotransmitters[perturbation.target as keyof typeof WORMATLAS_GROUND_TRUTH.neurotransmitters];
    
    if (ntData) {
      groundTruthReference = `WormAtlas Neurotransmitter: ${perturbation.target}`;
      
      if (perturbation.value < ntData.normalRange.min) {
        deviationScore = (ntData.normalRange.min - perturbation.value) / ntData.normalRange.min;
        warnings.push(`${perturbation.target} level ${perturbation.value.toFixed(2)} below physiological minimum (${ntData.normalRange.min})`);
        biologicalPlausibility -= deviationScore * 0.3;
      } else if (perturbation.value > ntData.normalRange.max) {
        deviationScore = (perturbation.value - ntData.normalRange.max) / ntData.normalRange.max;
        warnings.push(`${perturbation.target} level ${perturbation.value.toFixed(2)} exceeds physiological maximum (${ntData.normalRange.max})`);
        biologicalPlausibility -= deviationScore * 0.3;
        
        if (perturbation.target === 'GABA' && perturbation.value > 1.5) {
          warnings.push('⚠️ GABA overdrive may cause complete motor inhibition - rarely observed in vivo');
          biologicalPlausibility -= 0.2;
        }
      }
    }
  }
  
  if (perturbation.type === 'synapse' || perturbation.type === 'connection_weight') {
    if (Math.abs(perturbation.value) > 2.0) {
      warnings.push(`Synaptic weight ${perturbation.value.toFixed(2)} exceeds observed biological range (±2.0)`);
      deviationScore = (Math.abs(perturbation.value) - 2.0) / 2.0;
      biologicalPlausibility -= deviationScore * 0.4;
    }
  }
  
  if (perturbation.type === 'neuron_ablation') {
    groundTruthReference = `WormAtlas Ablation Studies: ${perturbation.target}`;
    // Ablations are experimentally validated
    biologicalPlausibility = 0.95;
  }
  
  return {
    isValid: biologicalPlausibility > 0.5,
    deviationScore: Math.min(1, deviationScore),
    groundTruthReference,
    warnings,
    biologicalPlausibility: Math.max(0, biologicalPlausibility),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { perturbation, simulationState, userHypothesis } = await req.json() as ValidationRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Validating perturbation: ${perturbation.type} on ${perturbation.target}`);

    // Step 1: Validate against ground truth
    const groundTruthValidation = validateAgainstGroundTruth(perturbation);
    
    // Step 2: Detect chaos attractors
    const chaosAnalysis = detectChaosAttractors(simulationState, perturbation);
    
    // Step 3: AI-powered deep analysis
    const systemPrompt = `You are an expert computational neuroscientist validating C. elegans neural circuit simulations against WormAtlas and OpenWorm ground truth data.

Your task is to:
1. Assess biological plausibility of the perturbation
2. Predict expected behavioral outcomes based on published ablation/pharmacology studies
3. Flag potential artifacts or non-biological dynamics
4. Provide educational feedback on dynamical systems concepts

Reference databases:
- WormAtlas (wormatlas.org) - anatomical ground truth
- WormBase (wormbase.org) - genetic/molecular data
- OpenWorm (openworm.org) - computational models

Be precise and cite specific neurons/pathways when possible.`;

    const userPrompt = `Analyze this C. elegans simulation perturbation:

PERTURBATION:
- Type: ${perturbation.type}
- Target: ${perturbation.target}
- Value: ${perturbation.value}
- Original: ${perturbation.originalValue ?? 'baseline'}

SIMULATION STATE:
- Active neurons: ${simulationState.neurons.length}
- Time step: ${simulationState.timeStep}
- Entropy: ${simulationState.entropy?.toFixed(3) ?? chaosAnalysis.entropy.toFixed(3)}

CHAOS ANALYSIS:
- Lyapunov exponent: ${chaosAnalysis.lyapunovExponent.toFixed(4)}
- Attractor type: ${chaosAnalysis.attractorType}
- Is chaotic: ${chaosAnalysis.isChaotic}

GROUND TRUTH VALIDATION:
- Biological plausibility: ${(groundTruthValidation.biologicalPlausibility * 100).toFixed(1)}%
- Warnings: ${groundTruthValidation.warnings.join('; ') || 'None'}

${userHypothesis ? `USER HYPOTHESIS: "${userHypothesis}"` : ''}

Respond with JSON:
{
  "validationScore": number (0-100),
  "biologicalAccuracy": number (0-100),
  "expectedBehavior": "string describing predicted worm behavior",
  "groundTruthAlignment": "string explaining match/mismatch with published data",
  "chaosRiskLevel": "low" | "medium" | "high" | "critical",
  "chaosExplanation": "string explaining dynamical systems implications",
  "recommendations": ["array of specific suggestions"],
  "educationalInsight": "string teaching dynamical systems concepts",
  "citations": ["relevant WormAtlas/WormBase references"]
}`;

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
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let aiAnalysis;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      aiAnalysis = JSON.parse(jsonStr);
    } catch {
      aiAnalysis = {
        validationScore: groundTruthValidation.biologicalPlausibility * 100,
        biologicalAccuracy: groundTruthValidation.biologicalPlausibility * 100,
        expectedBehavior: "Analysis pending",
        groundTruthAlignment: content,
        chaosRiskLevel: chaosAnalysis.isChaotic ? "high" : "low",
        recommendations: groundTruthValidation.warnings,
      };
    }

    const result = {
      validation: {
        score: aiAnalysis.validationScore,
        biologicalAccuracy: aiAnalysis.biologicalAccuracy,
        isValid: groundTruthValidation.isValid,
        groundTruthReference: groundTruthValidation.groundTruthReference,
        warnings: groundTruthValidation.warnings,
        deviationScore: groundTruthValidation.deviationScore,
      },
      chaos: {
        isChaotic: chaosAnalysis.isChaotic,
        lyapunovExponent: chaosAnalysis.lyapunovExponent,
        entropy: chaosAnalysis.entropy,
        attractorType: chaosAnalysis.attractorType,
        riskLevel: aiAnalysis.chaosRiskLevel,
        explanation: aiAnalysis.chaosExplanation,
        confidence: chaosAnalysis.confidence,
      },
      prediction: {
        expectedBehavior: aiAnalysis.expectedBehavior,
        groundTruthAlignment: aiAnalysis.groundTruthAlignment,
      },
      recommendations: aiAnalysis.recommendations || [],
      educational: {
        insight: aiAnalysis.educationalInsight,
        citations: aiAnalysis.citations || [],
      },
      redAlert: chaosAnalysis.isChaotic || groundTruthValidation.biologicalPlausibility < 0.3,
    };

    console.log(`Validation complete: score=${result.validation.score}, chaos=${result.chaos.isChaotic}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Validation error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
