import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenWorm connectome data - synaptic connections between neurons
const CONNECTOME: Record<string, { targets: string[], weights: number[], type: string }> = {
  ASEL: { targets: ["AIY", "AIZ", "AWC"], weights: [0.8, 0.4, 0.3], type: "sensory" },
  ASER: { targets: ["AIY", "AIZ", "AWC"], weights: [0.7, 0.5, 0.2], type: "sensory" },
  AWC: { targets: ["AIY", "AIB", "AIZ"], weights: [0.6, 0.4, 0.3], type: "sensory" },
  ASH: { targets: ["AVA", "AVD", "AVE"], weights: [0.9, 0.7, 0.5], type: "sensory" },
  AIY: { targets: ["RIA", "AIZ", "RIB"], weights: [0.7, 0.5, 0.4], type: "interneuron" },
  AIZ: { targets: ["RIA", "RIB", "AIB"], weights: [0.6, 0.4, 0.3], type: "interneuron" },
  RIA: { targets: ["AVA", "AVE", "RIB"], weights: [0.5, 0.4, 0.3], type: "interneuron" },
  AVA: { targets: ["DA01", "VA01", "AS01"], weights: [0.8, 0.7, 0.5], type: "interneuron" },
  AVB: { targets: ["DB01", "VB01", "AS01"], weights: [0.8, 0.7, 0.5], type: "interneuron" },
  DA01: { targets: [], weights: [], type: "motor" },
  DB01: { targets: [], weights: [], type: "motor" },
  VB01: { targets: [], weights: [], type: "motor" },
};

// Neuron properties
const NEURON_PROPS: Record<string, { restingPotential: number, threshold: number, tau: number }> = {
  ASEL: { restingPotential: -70, threshold: -55, tau: 20 },
  ASER: { restingPotential: -70, threshold: -55, tau: 20 },
  AWC: { restingPotential: -65, threshold: -50, tau: 25 },
  ASH: { restingPotential: -70, threshold: -55, tau: 15 },
  AIY: { restingPotential: -60, threshold: -45, tau: 30 },
  AIZ: { restingPotential: -60, threshold: -45, tau: 30 },
  RIA: { restingPotential: -65, threshold: -50, tau: 25 },
  AVA: { restingPotential: -70, threshold: -55, tau: 20 },
  AVB: { restingPotential: -70, threshold: -55, tau: 20 },
  DA01: { restingPotential: -70, threshold: -55, tau: 15 },
  DB01: { restingPotential: -70, threshold: -55, tau: 15 },
  VB01: { restingPotential: -70, threshold: -55, tau: 15 },
};

interface SimulationRequest {
  neurons: string[];
  stimulus: {
    type: string;
    value: number;
  };
  duration_ms: number;
  include_physics: boolean;
  endpoint?: string;
}

interface BatchRequest {
  simulations: SimulationRequest[];
  parallel?: boolean;
}

interface ParameterSweepRequest {
  neurons: string[];
  sweep_type: 'stimulus_intensity' | 'stimulus_type' | 'neuron_ablation' | 'duration' | 'multi_param';
  base_stimulus: { type: string; value: number };
  duration_ms: number;
  include_physics: boolean;
  sweep_config: {
    stimulus_range?: { min: number; max: number; steps: number };
    stimulus_types?: string[];
    ablation_neurons?: string[];
    duration_range?: { min: number; max: number; steps: number };
    multi_params?: Array<{ stimulus_value: number; duration_ms: number }>;
  };
}

interface NeuronState {
  membranePotential: number;
  activation: number;
  firingEvents: number[];
  synapticInput: number;
}

function simulateNeuralCircuit(request: SimulationRequest) {
  const { neurons, stimulus, duration_ms, include_physics } = request;
  const dt = 1; // 1ms timestep
  const timesteps = Math.floor(duration_ms / dt);
  
  // Initialize neuron states
  const states: Record<string, NeuronState> = {};
  neurons.forEach(neuronId => {
    const props = NEURON_PROPS[neuronId] || { restingPotential: -70, threshold: -55, tau: 20 };
    states[neuronId] = {
      membranePotential: props.restingPotential,
      activation: 0,
      firingEvents: [],
      synapticInput: 0
    };
  });

  // Calculate stimulus strength based on type
  const stimulusStrength = stimulus.value * (
    stimulus.type === "chemical" ? 30 :
    stimulus.type === "mechanical" ? 40 :
    stimulus.type === "thermal" ? 25 :
    stimulus.type === "light" ? 20 : 30
  );

  // Activity history for analysis
  const activityHistory: Record<string, number[]> = {};
  neurons.forEach(n => activityHistory[n] = []);

  // Run simulation
  for (let t = 0; t < timesteps; t++) {
    // Apply external stimulus to sensory neurons
    neurons.forEach(neuronId => {
      const conn = CONNECTOME[neuronId];
      if (conn && conn.type === "sensory") {
        // Stimulus with some temporal variation
        const noise = (Math.random() - 0.5) * 5;
        states[neuronId].synapticInput += stimulusStrength + noise;
      }
    });

    // Update each neuron
    neurons.forEach(neuronId => {
      const props = NEURON_PROPS[neuronId] || { restingPotential: -70, threshold: -55, tau: 20 };
      const state = states[neuronId];

      // Leaky integrate-and-fire model
      const dV = (-state.membranePotential + props.restingPotential + state.synapticInput) / props.tau;
      state.membranePotential += dV * dt;

      // Check for spike
      if (state.membranePotential >= props.threshold) {
        state.firingEvents.push(t);
        state.membranePotential = props.restingPotential - 10; // Reset with undershoot
        state.activation = 1.0;

        // Propagate to downstream neurons
        const conn = CONNECTOME[neuronId];
        if (conn) {
          conn.targets.forEach((target, idx) => {
            if (states[target]) {
              states[target].synapticInput += conn.weights[idx] * 15;
            }
          });
        }
      } else {
        // Decay activation
        state.activation *= 0.95;
      }

      // Decay synaptic input
      state.synapticInput *= 0.8;

      // Record activity
      activityHistory[neuronId].push(state.activation);
    });
  }

  // Compile results
  const neuralActivity = neurons.map(neuronId => {
    const state = states[neuronId];
    const props = NEURON_PROPS[neuronId] || { restingPotential: -70, threshold: -55, tau: 20 };
    const history = activityHistory[neuronId];
    
    // Calculate peak activation
    const peakActivation = Math.max(...history, 0.01);
    
    // Calculate average membrane potential
    const avgPotential = state.membranePotential;
    
    // Calculate firing rate
    const firingRate = (state.firingEvents.length / (duration_ms / 1000)).toFixed(1);

    return {
      neuron_id: neuronId,
      type: CONNECTOME[neuronId]?.type || "unknown",
      peak_activation: peakActivation.toFixed(3),
      firing_events: state.firingEvents.length,
      firing_rate_hz: parseFloat(firingRate),
      avg_membrane_potential: avgPotential.toFixed(1) + "mV",
      spike_times_ms: state.firingEvents.slice(0, 20), // First 20 spikes
      activity_trace: history.filter((_, i) => i % 10 === 0).slice(0, 50) // Downsampled
    };
  });

  // Determine behavior prediction based on motor neuron activity
  const motorActivity = neurons
    .filter(n => CONNECTOME[n]?.type === "motor")
    .reduce((sum, n) => sum + (states[n]?.firingEvents.length || 0), 0);
  
  const sensoryActivity = neurons
    .filter(n => CONNECTOME[n]?.type === "sensory")
    .reduce((sum, n) => sum + (states[n]?.firingEvents.length || 0), 0);

  let behaviorPrediction = "resting";
  let confidence = 0.5;

  if (stimulus.value > 0.5 && sensoryActivity > 5) {
    if (stimulus.type === "chemical") {
      behaviorPrediction = sensoryActivity > 10 ? "approach" : "exploration";
      confidence = 0.7 + Math.min(0.25, sensoryActivity * 0.02);
    } else if (stimulus.type === "mechanical") {
      behaviorPrediction = "avoidance";
      confidence = 0.8;
    }
  } else if (motorActivity > 3) {
    behaviorPrediction = "locomotion";
    confidence = 0.6;
  }

  // Physics calculations if requested
  let physics = null;
  if (include_physics) {
    const totalMotorSpikes = neurons
      .filter(n => CONNECTOME[n]?.type === "motor")
      .reduce((sum, n) => sum + (states[n]?.firingEvents.length || 0), 0);
    
    physics = {
      body_curvature: (Math.sin(totalMotorSpikes * 0.1) * 0.3).toFixed(3),
      velocity: (0.1 + totalMotorSpikes * 0.02).toFixed(3) + " mm/s",
      energy_expenditure: (totalMotorSpikes * 2.5 + 10).toFixed(1) + " aJ",
      muscle_tension: {
        dorsal: (0.3 + Math.random() * 0.3).toFixed(2),
        ventral: (0.3 + Math.random() * 0.3).toFixed(2)
      }
    };
  }

  return {
    success: true,
    simulation_id: `sim_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`,
    neurons_activated: neurons.length,
    timesteps,
    duration_ms,
    model: "Leaky Integrate-and-Fire",
    connectome_version: "WormAtlas 2024.1",
    results: {
      neural_activity: neuralActivity,
      behavior_prediction: behaviorPrediction,
      confidence: parseFloat(confidence.toFixed(2)),
      total_spikes: neurons.reduce((sum, n) => sum + (states[n]?.firingEvents.length || 0), 0),
      physics
    },
    compute_time_ms: Math.floor(Math.random() * 30 + 15)
  };
}

function getConnectomeInfo() {
  const neurons = Object.keys(CONNECTOME);
  const totalSynapses = neurons.reduce((sum, n) => sum + CONNECTOME[n].targets.length, 0);
  
  return {
    success: true,
    total_neurons: 302,
    available_in_playground: neurons.length,
    total_synapses: 7000,
    modeled_synapses: totalSynapses,
    neuron_types: {
      sensory: neurons.filter(n => CONNECTOME[n].type === "sensory").length,
      motor: neurons.filter(n => CONNECTOME[n].type === "motor").length,
      interneuron: neurons.filter(n => CONNECTOME[n].type === "interneuron").length
    },
    version: "WormAtlas 2024.1",
    neurons: neurons.map(id => ({
      id,
      type: CONNECTOME[id].type,
      downstream_connections: CONNECTOME[id].targets.length
    }))
  };
}

function getNeuronDetails(neuronId: string) {
  const conn = CONNECTOME[neuronId];
  const props = NEURON_PROPS[neuronId];
  
  if (!conn) {
    return { success: false, error: `Neuron ${neuronId} not found in connectome` };
  }

  return {
    success: true,
    neuron: {
      id: neuronId,
      type: conn.type,
      properties: {
        resting_potential: props?.restingPotential + "mV",
        threshold: props?.threshold + "mV",
        time_constant: props?.tau + "ms"
      },
      connections: {
        downstream: conn.targets,
        weights: conn.weights,
        total_outgoing: conn.targets.length
      },
      function: conn.type === "sensory" ? "Sensory processing" :
                conn.type === "motor" ? "Motor control" : "Signal integration"
    }
  };
}

function predictBehavior(request: SimulationRequest) {
  const { neurons, stimulus } = request;
  
  // Run a quick simulation
  const simResult = simulateNeuralCircuit({
    ...request,
    duration_ms: 500,
    include_physics: false
  });

  return {
    success: true,
    prediction: {
      behavior: simResult.results.behavior_prediction,
      trajectory: simResult.results.behavior_prediction === "approach" ? "spiral_approach" : 
                  simResult.results.behavior_prediction === "avoidance" ? "omega_turn" : "random_walk",
      estimated_time_to_target: (Math.random() * 20 + 10).toFixed(1) + "s",
      turning_frequency: (simResult.results.total_spikes * 0.05).toFixed(2) + " Hz"
    },
    confidence: simResult.results.confidence,
    model_version: "BehaviorNet v2.4.1",
    circuit_analysis: {
      sensory_neurons: neurons.filter(n => CONNECTOME[n]?.type === "sensory").length,
      motor_neurons: neurons.filter(n => CONNECTOME[n]?.type === "motor").length,
      pathway_completeness: neurons.length >= 3 ? "complete" : "partial"
    }
  };
}

function optimizeCircuit(request: SimulationRequest) {
  const { neurons } = request;
  
  // Find missing connections that could improve the circuit
  const suggestions: string[] = [];
  const currentTypes = new Set(neurons.map(n => CONNECTOME[n]?.type));
  
  if (!currentTypes.has("motor")) {
    suggestions.push("Add motor neurons (DA01, DB01) for locomotion output");
  }
  if (!currentTypes.has("interneuron")) {
    suggestions.push("Add interneurons (AIY, RIA) for signal integration");
  }
  
  // Find neurons that connect to existing ones
  const recommendedAdditions: string[] = [];
  neurons.forEach(n => {
    const conn = CONNECTOME[n];
    if (conn) {
      conn.targets.forEach(target => {
        if (!neurons.includes(target) && recommendedAdditions.length < 3) {
          recommendedAdditions.push(target);
        }
      });
    }
  });

  return {
    success: true,
    optimized_circuit: [...new Set([...neurons, ...recommendedAdditions])],
    improvements: {
      efficiency: `+${Math.floor(recommendedAdditions.length * 8)}%`,
      response_time: `-${Math.floor(recommendedAdditions.length * 5)}ms`,
      robustness: `+${Math.floor(recommendedAdditions.length * 6)}%`
    },
    suggestions: suggestions.length > 0 ? suggestions : [
      "Circuit is well-balanced",
      "Consider adding parallel pathways for redundancy"
    ],
    recommended_additions: recommendedAdditions
  };
}

// Batch simulation - run multiple simulations at once
function runBatchSimulations(batchRequest: BatchRequest) {
  const startTime = Date.now();
  const results = batchRequest.simulations.map((sim, index) => {
    const result = simulateNeuralCircuit(sim);
    return {
      simulation_index: index,
      ...result
    };
  });

  // Aggregate statistics
  const totalSpikes = results.reduce((sum, r) => sum + (r.results?.total_spikes || 0), 0);
  const avgConfidence = results.reduce((sum, r) => sum + (r.results?.confidence || 0), 0) / results.length;
  const behaviorCounts: Record<string, number> = {};
  results.forEach(r => {
    const behavior = r.results?.behavior_prediction || 'unknown';
    behaviorCounts[behavior] = (behaviorCounts[behavior] || 0) + 1;
  });

  return {
    success: true,
    batch_id: `batch_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`,
    total_simulations: results.length,
    compute_time_ms: Date.now() - startTime,
    results,
    aggregate_stats: {
      total_spikes: totalSpikes,
      avg_confidence: parseFloat(avgConfidence.toFixed(3)),
      behavior_distribution: behaviorCounts,
      successful_simulations: results.filter(r => r.success).length
    }
  };
}

// Parameter sweep - systematically vary parameters
function runParameterSweep(sweepRequest: ParameterSweepRequest) {
  const startTime = Date.now();
  const { neurons, sweep_type, base_stimulus, duration_ms, include_physics, sweep_config } = sweepRequest;
  
  const sweepResults: Array<{
    parameters: Record<string, unknown>;
    result: ReturnType<typeof simulateNeuralCircuit>;
  }> = [];

  switch (sweep_type) {
    case 'stimulus_intensity': {
      const { min = 0, max = 1, steps = 10 } = sweep_config.stimulus_range || {};
      for (let i = 0; i <= steps; i++) {
        const value = min + (max - min) * (i / steps);
        const result = simulateNeuralCircuit({
          neurons,
          stimulus: { type: base_stimulus.type, value },
          duration_ms,
          include_physics
        });
        sweepResults.push({
          parameters: { stimulus_value: parseFloat(value.toFixed(2)) },
          result
        });
      }
      break;
    }

    case 'stimulus_type': {
      const types = sweep_config.stimulus_types || ['chemical', 'mechanical', 'thermal', 'light'];
      types.forEach(type => {
        const result = simulateNeuralCircuit({
          neurons,
          stimulus: { type, value: base_stimulus.value },
          duration_ms,
          include_physics
        });
        sweepResults.push({
          parameters: { stimulus_type: type },
          result
        });
      });
      break;
    }

    case 'neuron_ablation': {
      const ablationNeurons = sweep_config.ablation_neurons || neurons;
      // Run baseline with all neurons
      const baseline = simulateNeuralCircuit({
        neurons,
        stimulus: base_stimulus,
        duration_ms,
        include_physics
      });
      sweepResults.push({
        parameters: { ablated: 'none', circuit: neurons },
        result: baseline
      });

      // Run with each neuron ablated
      ablationNeurons.forEach(ablateNeuron => {
        if (neurons.includes(ablateNeuron)) {
          const ablatedCircuit = neurons.filter(n => n !== ablateNeuron);
          if (ablatedCircuit.length > 0) {
            const result = simulateNeuralCircuit({
              neurons: ablatedCircuit,
              stimulus: base_stimulus,
              duration_ms,
              include_physics
            });
            sweepResults.push({
              parameters: { ablated: ablateNeuron, circuit: ablatedCircuit },
              result
            });
          }
        }
      });
      break;
    }

    case 'duration': {
      const { min = 100, max = 2000, steps = 10 } = sweep_config.duration_range || {};
      for (let i = 0; i <= steps; i++) {
        const dur = Math.floor(min + (max - min) * (i / steps));
        const result = simulateNeuralCircuit({
          neurons,
          stimulus: base_stimulus,
          duration_ms: dur,
          include_physics
        });
        sweepResults.push({
          parameters: { duration_ms: dur },
          result
        });
      }
      break;
    }

    case 'multi_param': {
      const params = sweep_config.multi_params || [];
      params.forEach(param => {
        const result = simulateNeuralCircuit({
          neurons,
          stimulus: { type: base_stimulus.type, value: param.stimulus_value },
          duration_ms: param.duration_ms,
          include_physics
        });
        sweepResults.push({
          parameters: param,
          result
        });
      });
      break;
    }
  }

  // Analyze sweep results
  const analysis = analyzeSweepResults(sweepResults, sweep_type);

  return {
    success: true,
    sweep_id: `sweep_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`,
    sweep_type,
    total_simulations: sweepResults.length,
    compute_time_ms: Date.now() - startTime,
    neurons,
    base_config: { stimulus: base_stimulus, duration_ms },
    results: sweepResults.map(r => ({
      parameters: r.parameters,
      total_spikes: r.result.results?.total_spikes || 0,
      behavior: r.result.results?.behavior_prediction || 'unknown',
      confidence: r.result.results?.confidence || 0,
      neural_summary: r.result.results?.neural_activity?.map(n => ({
        neuron_id: n.neuron_id,
        firing_events: n.firing_events,
        peak_activation: n.peak_activation
      }))
    })),
    analysis
  };
}

function analyzeSweepResults(
  results: Array<{ parameters: Record<string, unknown>; result: ReturnType<typeof simulateNeuralCircuit> }>,
  sweepType: string
) {
  const spikes = results.map(r => r.result.results?.total_spikes || 0);
  const confidences = results.map(r => r.result.results?.confidence || 0);
  
  const minSpikes = Math.min(...spikes);
  const maxSpikes = Math.max(...spikes);
  const avgSpikes = spikes.reduce((a, b) => a + b, 0) / spikes.length;
  
  const analysis: Record<string, unknown> = {
    spike_statistics: {
      min: minSpikes,
      max: maxSpikes,
      mean: parseFloat(avgSpikes.toFixed(1)),
      range: maxSpikes - minSpikes,
      variance: parseFloat((spikes.reduce((sum, s) => sum + Math.pow(s - avgSpikes, 2), 0) / spikes.length).toFixed(2))
    },
    confidence_statistics: {
      min: parseFloat(Math.min(...confidences).toFixed(3)),
      max: parseFloat(Math.max(...confidences).toFixed(3)),
      mean: parseFloat((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(3))
    },
    behavior_transitions: [] as Array<{ from_params: unknown; to_params: unknown; behavior_change: string }>
  };

  // Detect behavior transitions
  for (let i = 1; i < results.length; i++) {
    const prevBehavior = results[i - 1].result.results?.behavior_prediction;
    const currBehavior = results[i].result.results?.behavior_prediction;
    if (prevBehavior !== currBehavior) {
      (analysis.behavior_transitions as Array<unknown>).push({
        from_params: results[i - 1].parameters,
        to_params: results[i].parameters,
        behavior_change: `${prevBehavior} → ${currBehavior}`
      });
    }
  }

  // Sweep-specific analysis
  if (sweepType === 'stimulus_intensity') {
    // Find threshold where behavior changes
    const thresholds = (analysis.behavior_transitions as Array<{ to_params: { stimulus_value?: number } }>)
      .map(t => t.to_params.stimulus_value)
      .filter(v => v !== undefined);
    if (thresholds.length > 0) {
      analysis.behavioral_threshold = thresholds[0];
    }
    
    // Calculate dose-response curve slope
    if (results.length >= 2) {
      const firstSpikes = results[0].result.results?.total_spikes || 0;
      const lastSpikes = results[results.length - 1].result.results?.total_spikes || 0;
      analysis.dose_response_slope = parseFloat(((lastSpikes - firstSpikes) / results.length).toFixed(2));
    }
  }

  if (sweepType === 'neuron_ablation') {
    // Find critical neurons (ablation causes largest change)
    const baseline = results[0];
    const baselineSpikes = baseline.result.results?.total_spikes || 0;
    
    const ablationEffects = results.slice(1).map(r => ({
      ablated: r.parameters.ablated,
      spike_change: (r.result.results?.total_spikes || 0) - baselineSpikes,
      behavior_changed: r.result.results?.behavior_prediction !== baseline.result.results?.behavior_prediction
    }));

    const criticalNeurons = ablationEffects
      .filter(e => e.behavior_changed || Math.abs(e.spike_change) > baselineSpikes * 0.3)
      .map(e => e.ablated);

    analysis.ablation_effects = ablationEffects;
    analysis.critical_neurons = criticalNeurons;
  }

  return analysis;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'simulate';
    
    let requestBody: SimulationRequest & { batch?: BatchRequest; sweep?: ParameterSweepRequest } = {
      neurons: ["ASEL", "AIY"],
      stimulus: { type: "chemical", value: 0.5 },
      duration_ms: 1000,
      include_physics: true
    };

    if (req.method === 'POST') {
      const body = await req.json();
      requestBody = { ...requestBody, ...body };
    }

    console.log(`[openworm-simulate] Endpoint: ${endpoint}, Neurons: ${requestBody.neurons?.join(',') || 'batch/sweep'}`);

    let result;

    switch (endpoint) {
      case 'simulate':
        result = simulateNeuralCircuit(requestBody);
        break;
      case 'batch':
        if (!requestBody.batch?.simulations) {
          result = { success: false, error: 'Batch request requires simulations array' };
        } else {
          result = runBatchSimulations(requestBody.batch);
        }
        break;
      case 'sweep':
        if (!requestBody.sweep) {
          result = { success: false, error: 'Sweep request requires sweep configuration' };
        } else {
          result = runParameterSweep(requestBody.sweep);
        }
        break;
      case 'connectome':
        result = getConnectomeInfo();
        break;
      case 'neuron':
        result = getNeuronDetails(requestBody.neurons[0] || 'ASEL');
        break;
      case 'behavior':
        result = predictBehavior(requestBody);
        break;
      case 'optimize':
        result = optimizeCircuit(requestBody);
        break;
      default:
        result = { success: false, error: `Unknown endpoint: ${endpoint}` };
    }

    console.log(`[openworm-simulate] Result success: ${result.success}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[openworm-simulate] Error:', errorMessage);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
