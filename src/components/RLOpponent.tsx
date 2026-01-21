import { useRef, useEffect, useCallback } from "react";

/**
 * RL Opponent - Reinforcement Learning Worm Opponent for Races
 * 
 * Uses a simple Q-learning inspired policy to adapt racing behavior
 * based on track position, competitor positions, and previous race history.
 */

interface RLState {
  position: number;
  velocity: number;
  distanceToFinish: number;
  nearestOpponentDist: number;
  energyLevel: number;
}

interface RLAction {
  type: "boost" | "cruise" | "conserve" | "sprint";
  modifier: number;
}

interface RLPolicy {
  weights: number[];
  bias: number;
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
}

interface RLOpponentConfig {
  name: string;
  personality: "aggressive" | "defensive" | "adaptive" | "erratic";
  skillLevel: number; // 1-10
  circuitEfficiency: number; // 0-1
}

const PERSONALITY_POLICIES: Record<string, Partial<RLPolicy>> = {
  aggressive: {
    weights: [0.8, 0.6, 0.3, 0.9, 0.4],
    bias: 0.2,
    explorationRate: 0.1,
  },
  defensive: {
    weights: [0.4, 0.3, 0.7, 0.5, 0.8],
    bias: -0.1,
    explorationRate: 0.05,
  },
  adaptive: {
    weights: [0.6, 0.5, 0.5, 0.6, 0.6],
    bias: 0,
    explorationRate: 0.2,
  },
  erratic: {
    weights: [0.5, 0.5, 0.5, 0.5, 0.5],
    bias: 0,
    explorationRate: 0.4,
  },
};

export function useRLOpponent(config: RLOpponentConfig) {
  const policyRef = useRef<RLPolicy>({
    weights: PERSONALITY_POLICIES[config.personality]?.weights || [0.5, 0.5, 0.5, 0.5, 0.5],
    bias: PERSONALITY_POLICIES[config.personality]?.bias || 0,
    learningRate: 0.1,
    discountFactor: 0.95,
    explorationRate: PERSONALITY_POLICIES[config.personality]?.explorationRate || 0.15,
  });

  const historyRef = useRef<{ state: RLState; action: RLAction; reward: number }[]>([]);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const energyRef = useRef(100);

  // Compute Q-value for state-action pair
  const computeQValue = useCallback((state: RLState, actionIdx: number): number => {
    const policy = policyRef.current;
    const stateVector = [
      state.position / 100,
      state.velocity / 10,
      state.distanceToFinish / 100,
      Math.min(1, state.nearestOpponentDist / 20),
      state.energyLevel / 100,
    ];
    
    const qValue = stateVector.reduce((sum, s, i) => sum + s * policy.weights[i], 0) + policy.bias;
    return qValue + actionIdx * 0.1; // Action preference offset
  }, []);

  // Select action using epsilon-greedy policy
  const selectAction = useCallback((state: RLState): RLAction => {
    const policy = policyRef.current;
    
    // Exploration
    if (Math.random() < policy.explorationRate) {
      const actions: RLAction[] = [
        { type: "boost", modifier: 1.5 + config.skillLevel * 0.1 },
        { type: "cruise", modifier: 1.0 + config.skillLevel * 0.05 },
        { type: "conserve", modifier: 0.7 },
        { type: "sprint", modifier: 2.0 + config.skillLevel * 0.15 },
      ];
      return actions[Math.floor(Math.random() * actions.length)];
    }
    
    // Exploitation - pick best action
    const actionConfigs = [
      { type: "boost" as const, modifier: 1.5 + config.skillLevel * 0.1 },
      { type: "cruise" as const, modifier: 1.0 + config.skillLevel * 0.05 },
      { type: "conserve" as const, modifier: 0.7 },
      { type: "sprint" as const, modifier: 2.0 + config.skillLevel * 0.15 },
    ];
    
    let bestAction = actionConfigs[0];
    let bestQ = computeQValue(state, 0);
    
    actionConfigs.forEach((action, i) => {
      const q = computeQValue(state, i);
      if (q > bestQ) {
        bestQ = q;
        bestAction = action;
      }
    });
    
    return bestAction;
  }, [computeQValue, config.skillLevel]);

  // Update position based on action
  const step = useCallback((opponentPositions: number[], raceDistance: number): number => {
    const currentState: RLState = {
      position: positionRef.current,
      velocity: velocityRef.current,
      distanceToFinish: raceDistance - positionRef.current,
      nearestOpponentDist: opponentPositions.length > 0 
        ? Math.min(...opponentPositions.map(p => Math.abs(p - positionRef.current)))
        : 100,
      energyLevel: energyRef.current,
    };
    
    const action = selectAction(currentState);
    
    // Apply action
    const baseSpeed = config.circuitEfficiency * config.skillLevel * 0.5;
    let speedModifier = action.modifier;
    
    // Energy management
    if (action.type === "sprint" || action.type === "boost") {
      energyRef.current = Math.max(0, energyRef.current - 2);
      if (energyRef.current < 20) {
        speedModifier *= 0.5; // Fatigue
      }
    } else if (action.type === "conserve") {
      energyRef.current = Math.min(100, energyRef.current + 1);
    }
    
    // Calculate new velocity with some randomness
    const noise = (Math.random() - 0.5) * 0.2;
    velocityRef.current = baseSpeed * speedModifier * (1 + noise);
    
    // Update position
    positionRef.current = Math.min(raceDistance, positionRef.current + velocityRef.current);
    
    // Calculate reward for learning
    const progressReward = velocityRef.current / baseSpeed;
    const positionReward = opponentPositions.filter(p => p < positionRef.current).length * 0.5;
    const energyReward = energyRef.current > 50 ? 0.1 : -0.1;
    const reward = progressReward + positionReward + energyReward;
    
    // Store experience
    historyRef.current.push({ state: currentState, action, reward });
    if (historyRef.current.length > 100) {
      historyRef.current.shift();
    }
    
    return positionRef.current;
  }, [selectAction, config.circuitEfficiency, config.skillLevel]);

  // Reset for new race
  const reset = useCallback(() => {
    positionRef.current = 0;
    velocityRef.current = 0;
    energyRef.current = 100;
  }, []);

  // Learn from race
  const learn = useCallback(() => {
    const policy = policyRef.current;
    const history = historyRef.current;
    
    if (history.length < 10) return;
    
    // Simple online learning update
    let totalReward = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const { state, reward } = history[i];
      totalReward = reward + policy.discountFactor * totalReward;
      
      // Update weights based on cumulative reward
      const stateVector = [
        state.position / 100,
        state.velocity / 10,
        state.distanceToFinish / 100,
        Math.min(1, state.nearestOpponentDist / 20),
        state.energyLevel / 100,
      ];
      
      stateVector.forEach((s, j) => {
        policy.weights[j] += policy.learningRate * totalReward * s * 0.01;
        policy.weights[j] = Math.max(-1, Math.min(1, policy.weights[j]));
      });
    }
    
    // Decay exploration
    policy.explorationRate = Math.max(0.05, policy.explorationRate * 0.99);
    
    historyRef.current = [];
  }, []);

  return {
    name: config.name,
    personality: config.personality,
    getPosition: () => positionRef.current,
    getVelocity: () => velocityRef.current,
    getEnergy: () => energyRef.current,
    step,
    reset,
    learn,
  };
}

// Generate random RL opponents for races
export function generateRLOpponents(count: number, playerSkill: number): RLOpponentConfig[] {
  const names = [
    "Neuro-Nex", "Synapse-7", "Cortex-Prime", "Axon-X", 
    "Dendrite-V", "MyeLinX", "Glial-Ghost", "Connectome-C",
    "Worminator", "Elegans-Elite", "Neural-Nova", "Synaptor",
  ];
  
  const personalities: RLOpponentConfig["personality"][] = ["aggressive", "defensive", "adaptive", "erratic"];
  
  return Array.from({ length: count }, (_, i) => {
    const skillVariance = (Math.random() - 0.5) * 4;
    const skillLevel = Math.max(1, Math.min(10, Math.round(playerSkill + skillVariance)));
    
    return {
      name: names[Math.floor(Math.random() * names.length)] + `-${i + 1}`,
      personality: personalities[Math.floor(Math.random() * personalities.length)],
      skillLevel,
      circuitEfficiency: 0.5 + Math.random() * 0.4,
    };
  });
}
