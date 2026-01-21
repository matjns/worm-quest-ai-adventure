import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenWorm corpus reference data for validation
const OPENWORM_REFERENCE = {
  connectome: {
    totalNeurons: 302,
    totalSynapses: 7000,
    gapJunctions: 900,
    chemicalSynapses: 6100,
  },
  behaviors: {
    chemotaxis: {
      keyNeurons: ['AWC', 'AWA', 'ASE', 'AIY', 'AIZ', 'AIB'],
      expectedAccuracy: 0.85,
      signaturePatterns: ['gradient_following', 'pirouette_suppression'],
    },
    mechanosensation: {
      keyNeurons: ['ALM', 'AVM', 'PLM', 'PVD', 'FLP'],
      expectedAccuracy: 0.90,
      signaturePatterns: ['touch_response', 'escape_reflex'],
    },
    thermotaxis: {
      keyNeurons: ['AFD', 'AIY', 'AIZ', 'RIA'],
      expectedAccuracy: 0.80,
      signaturePatterns: ['isothermal_tracking', 'cryophilic_migration'],
    },
    locomotion: {
      keyNeurons: ['AVA', 'AVB', 'AVD', 'AVE', 'PVC', 'DA', 'DB', 'VA', 'VB'],
      expectedAccuracy: 0.88,
      signaturePatterns: ['forward_crawl', 'backward_crawl', 'omega_turn'],
    },
  },
  physicsConstraints: {
    bodyLength: { min: 900, max: 1100, unit: 'μm' },
    crawlSpeed: { min: 100, max: 300, unit: 'μm/s' },
    muscleActivationTime: { min: 20, max: 100, unit: 'ms' },
    neuralPropagationSpeed: { min: 0.5, max: 2.0, unit: 'm/s' },
  },
};

interface CircuitBuild {
  neurons: Array<{
    id: string;
    type: 'sensory' | 'interneuron' | 'motor';
    position: { x: number; y: number; z: number };
    activity?: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    type: 'chemical' | 'gap_junction';
  }>;
  targetBehavior?: string;
  simulationResults?: {
    outputPattern: number[];
    timing: number[];
    entropy: number;
  };
}

interface HallucinationRequest {
  circuitBuild: CircuitBuild;
  iterations?: number;
  autoOptimize?: boolean;
}

// Calculate structural similarity to OpenWorm reference
function calculateStructuralSimilarity(build: CircuitBuild): {
  score: number;
  missingNeurons: string[];
  extraConnections: number;
  connectomeFidelity: number;
} {
  const targetBehavior = build.targetBehavior || 'locomotion';
  const reference = OPENWORM_REFERENCE.behaviors[targetBehavior as keyof typeof OPENWORM_REFERENCE.behaviors];
  
  if (!reference) {
    return { score: 0.5, missingNeurons: [], extraConnections: 0, connectomeFidelity: 0.5 };
  }
  
  const neuronIds = new Set(build.neurons.map(n => n.id));
  const missingNeurons = reference.keyNeurons.filter(n => !neuronIds.has(n));
  
  // Calculate connection density
  const expectedDensity = OPENWORM_REFERENCE.connectome.totalSynapses / OPENWORM_REFERENCE.connectome.totalNeurons;
  const actualDensity = build.connections.length / Math.max(1, build.neurons.length);
  const densityRatio = Math.min(1, actualDensity / expectedDensity);
  
  // Gap junction ratio check
  const gapJunctions = build.connections.filter(c => c.type === 'gap_junction').length;
  const expectedGapRatio = OPENWORM_REFERENCE.connectome.gapJunctions / OPENWORM_REFERENCE.connectome.totalSynapses;
  const actualGapRatio = gapJunctions / Math.max(1, build.connections.length);
  const gapRatioScore = 1 - Math.abs(expectedGapRatio - actualGapRatio);
  
  const keyNeuronScore = 1 - (missingNeurons.length / reference.keyNeurons.length);
  const connectomeFidelity = (keyNeuronScore * 0.4 + densityRatio * 0.3 + gapRatioScore * 0.3);
  
  return {
    score: connectomeFidelity * reference.expectedAccuracy,
    missingNeurons,
    extraConnections: Math.max(0, build.connections.length - (build.neurons.length * 3)),
    connectomeFidelity,
  };
}

// Detect potential hallucinations in simulation output
function detectHallucinations(build: CircuitBuild): {
  hallucinationScore: number;
  issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; description: string }>;
  physicsViolations: string[];
} {
  const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; description: string }> = [];
  const physicsViolations: string[] = [];
  
  // Check for disconnected components
  const neuronSet = new Set(build.neurons.map(n => n.id));
  const connectedNeurons = new Set<string>();
  build.connections.forEach(c => {
    connectedNeurons.add(c.from);
    connectedNeurons.add(c.to);
  });
  
  const disconnected = build.neurons.filter(n => !connectedNeurons.has(n.id));
  if (disconnected.length > 0) {
    issues.push({
      type: 'disconnected_neurons',
      severity: disconnected.length > 3 ? 'high' : 'medium',
      description: `${disconnected.length} neurons have no connections: ${disconnected.map(n => n.id).join(', ')}`,
    });
  }
  
  // Check for self-loops
  const selfLoops = build.connections.filter(c => c.from === c.to);
  if (selfLoops.length > 0) {
    issues.push({
      type: 'self_loops',
      severity: 'medium',
      description: `${selfLoops.length} self-loop connections detected (biologically rare)`,
    });
  }
  
  // Check for extreme weights
  const extremeWeights = build.connections.filter(c => Math.abs(c.weight) > 3);
  if (extremeWeights.length > 0) {
    issues.push({
      type: 'extreme_weights',
      severity: 'high',
      description: `${extremeWeights.length} connections have unrealistic weights (>3σ from mean)`,
    });
    physicsViolations.push('Synaptic weights exceed biophysical limits');
  }
  
  // Check simulation results if available
  if (build.simulationResults) {
    const { outputPattern, entropy } = build.simulationResults;
    
    // Check for frozen states
    if (outputPattern.every(v => v === outputPattern[0])) {
      issues.push({
        type: 'frozen_state',
        severity: 'high',
        description: 'Simulation output is constant - possible dead network',
      });
    }
    
    // Check for explosion
    if (outputPattern.some(v => !isFinite(v) || Math.abs(v) > 1000)) {
      issues.push({
        type: 'numerical_explosion',
        severity: 'high',
        description: 'Simulation values exploded - unstable dynamics',
      });
      physicsViolations.push('Neural activity exceeds physiological bounds');
    }
    
    // Entropy check
    if (entropy > 3.5) {
      issues.push({
        type: 'high_entropy',
        severity: 'medium',
        description: `High entropy (${entropy.toFixed(2)}) suggests chaotic or random behavior`,
      });
    } else if (entropy < 0.5) {
      issues.push({
        type: 'low_entropy',
        severity: 'medium',
        description: `Low entropy (${entropy.toFixed(2)}) suggests overly regular/artificial pattern`,
      });
    }
  }
  
  // Calculate overall hallucination score
  const severityWeights = { low: 0.1, medium: 0.3, high: 0.6 };
  const totalWeight = issues.reduce((sum, i) => sum + severityWeights[i.severity], 0);
  const hallucinationScore = Math.min(1, totalWeight / 2);
  
  return { hallucinationScore, issues, physicsViolations };
}

// Generate optimization suggestions
function generateOptimizations(
  build: CircuitBuild,
  structuralAnalysis: ReturnType<typeof calculateStructuralSimilarity>,
  hallucinationAnalysis: ReturnType<typeof detectHallucinations>
): Array<{
  type: 'add_neuron' | 'remove_connection' | 'adjust_weight' | 'add_connection';
  target: string;
  value?: number;
  reason: string;
  priority: number;
}> {
  const optimizations: Array<{
    type: 'add_neuron' | 'remove_connection' | 'adjust_weight' | 'add_connection';
    target: string;
    value?: number;
    reason: string;
    priority: number;
  }> = [];
  
  // Add missing key neurons
  structuralAnalysis.missingNeurons.forEach((neuron, i) => {
    optimizations.push({
      type: 'add_neuron',
      target: neuron,
      reason: `Required for ${build.targetBehavior || 'behavior'} circuit`,
      priority: 1 - (i * 0.1),
    });
  });
  
  // Fix extreme weights
  hallucinationAnalysis.issues
    .filter(i => i.type === 'extreme_weights')
    .forEach(() => {
      build.connections
        .filter(c => Math.abs(c.weight) > 3)
        .forEach(c => {
          optimizations.push({
            type: 'adjust_weight',
            target: `${c.from}->${c.to}`,
            value: Math.sign(c.weight) * 1.5,
            reason: 'Weight exceeds biological range',
            priority: 0.9,
          });
        });
    });
  
  // Remove self-loops
  build.connections
    .filter(c => c.from === c.to)
    .forEach(c => {
      optimizations.push({
        type: 'remove_connection',
        target: `${c.from}->${c.to}`,
        reason: 'Self-loops are rarely observed in C. elegans',
        priority: 0.7,
      });
    });
  
  return optimizations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { circuitBuild, iterations = 3, autoOptimize = true } = await req.json() as HallucinationRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Hallucination analysis: ${circuitBuild.neurons.length} neurons, ${circuitBuild.connections.length} connections`);

    // Step 1: Structural analysis
    const structuralAnalysis = calculateStructuralSimilarity(circuitBuild);
    
    // Step 2: Hallucination detection
    const hallucinationAnalysis = detectHallucinations(circuitBuild);
    
    // Step 3: Generate optimizations
    const optimizations = autoOptimize 
      ? generateOptimizations(circuitBuild, structuralAnalysis, hallucinationAnalysis)
      : [];

    // Step 4: AI ensemble scoring
    const systemPrompt = `You are an ensemble of computational neuroscience models trained on the OpenWorm corpus. Your task is to:

1. Score simulation accuracy against published C. elegans data
2. Detect "hallucinations" - outputs that deviate from biological reality
3. Provide specific iteration suggestions for dynamical systems mastery

You represent multiple validation perspectives:
- Connectome Validator: Checks structural fidelity to WormAtlas
- Dynamics Validator: Checks temporal patterns against Sibernetic physics
- Behavior Validator: Checks output against ethological observations
- Physics Validator: Checks biophysical constraints

Score each dimension 0-100 and provide consensus recommendations.`;

    const userPrompt = `Analyze this C. elegans circuit build:

STRUCTURE:
- Neurons: ${circuitBuild.neurons.length} (types: ${countTypes(circuitBuild.neurons)})
- Connections: ${circuitBuild.connections.length}
- Target behavior: ${circuitBuild.targetBehavior || 'unspecified'}

STRUCTURAL ANALYSIS:
- Connectome fidelity: ${(structuralAnalysis.connectomeFidelity * 100).toFixed(1)}%
- Missing key neurons: ${structuralAnalysis.missingNeurons.join(', ') || 'None'}
- Extra connections: ${structuralAnalysis.extraConnections}

HALLUCINATION DETECTION:
- Hallucination score: ${(hallucinationAnalysis.hallucinationScore * 100).toFixed(1)}%
- Issues found: ${hallucinationAnalysis.issues.length}
- Physics violations: ${hallucinationAnalysis.physicsViolations.join('; ') || 'None'}

${circuitBuild.simulationResults ? `
SIMULATION RESULTS:
- Output entropy: ${circuitBuild.simulationResults.entropy.toFixed(3)}
- Pattern length: ${circuitBuild.simulationResults.outputPattern.length}
` : ''}

Respond with JSON:
{
  "ensembleScores": {
    "connectome": number (0-100),
    "dynamics": number (0-100),
    "behavior": number (0-100),
    "physics": number (0-100),
    "overall": number (0-100)
  },
  "confidenceLevel": number (0-1),
  "hallucinationFlags": [
    { "type": "string", "evidence": "string", "severity": "low|medium|high" }
  ],
  "iterationPlan": [
    { "step": number, "action": "string", "expectedImprovement": number }
  ],
  "dynamicalSystemsInsight": "string explaining chaos/stability/attractors",
  "masteryProgress": {
    "currentLevel": "novice|intermediate|advanced|expert",
    "nextMilestone": "string",
    "skillsToImprove": ["array"]
  }
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
        temperature: 0.25,
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
    
    let ensembleAnalysis;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      ensembleAnalysis = JSON.parse(jsonStr);
    } catch {
      ensembleAnalysis = {
        ensembleScores: {
          connectome: structuralAnalysis.connectomeFidelity * 100,
          dynamics: (1 - hallucinationAnalysis.hallucinationScore) * 100,
          behavior: structuralAnalysis.score * 100,
          physics: hallucinationAnalysis.physicsViolations.length === 0 ? 90 : 50,
          overall: structuralAnalysis.score * 100 * (1 - hallucinationAnalysis.hallucinationScore),
        },
        confidenceLevel: 0.7,
        hallucinationFlags: hallucinationAnalysis.issues,
        iterationPlan: [],
        dynamicalSystemsInsight: content,
      };
    }

    const result = {
      accuracy: {
        overall: ensembleAnalysis.ensembleScores?.overall ?? structuralAnalysis.score * 100,
        byDimension: ensembleAnalysis.ensembleScores ?? {},
        confidence: ensembleAnalysis.confidenceLevel ?? 0.7,
      },
      structural: {
        connectomeFidelity: structuralAnalysis.connectomeFidelity,
        missingNeurons: structuralAnalysis.missingNeurons,
        extraConnections: structuralAnalysis.extraConnections,
      },
      hallucinations: {
        score: hallucinationAnalysis.hallucinationScore,
        flags: ensembleAnalysis.hallucinationFlags ?? hallucinationAnalysis.issues,
        physicsViolations: hallucinationAnalysis.physicsViolations,
      },
      optimizations,
      iteration: {
        plan: ensembleAnalysis.iterationPlan ?? [],
        suggestedIterations: iterations,
      },
      mastery: ensembleAnalysis.masteryProgress ?? {
        currentLevel: 'intermediate',
        nextMilestone: 'Add all key neurons for target behavior',
        skillsToImprove: ['connection_topology', 'weight_calibration'],
      },
      insight: ensembleAnalysis.dynamicalSystemsInsight ?? '',
      passesValidation: hallucinationAnalysis.hallucinationScore < 0.3 && structuralAnalysis.connectomeFidelity > 0.6,
    };

    console.log(`Hallucination analysis complete: overall=${result.accuracy.overall.toFixed(1)}%, hallucination=${result.hallucinations.score.toFixed(2)}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Hallucination hunter error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function countTypes(neurons: CircuitBuild['neurons']): string {
  const counts = { sensory: 0, interneuron: 0, motor: 0 };
  neurons.forEach(n => counts[n.type]++);
  return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
}
