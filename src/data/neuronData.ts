// OpenWorm-based C. elegans neuron data
// Source: WormAtlas.org and OpenWorm c302

export interface NeuronData {
  id: string;
  name: string;
  type: "sensory" | "motor" | "interneuron" | "command";
  function: string;
  description: string;
  position: { x: number; y: number };
}

export interface ConnectionData {
  from: string;
  to: string;
  type: "chemical" | "electrical";
  weight: number;
}

// Simplified neuron palette for game
export const NEURON_PALETTE: NeuronData[] = [
  // Sensory neurons (touch)
  { id: "ALML", name: "ALML", type: "sensory", function: "touch_anterior", description: "Left anterior touch receptor", position: { x: 0, y: 0 } },
  { id: "ALMR", name: "ALMR", type: "sensory", function: "touch_anterior", description: "Right anterior touch receptor", position: { x: 0, y: 0 } },
  { id: "AVM", name: "AVM", type: "sensory", function: "touch_ventral", description: "Ventral touch receptor", position: { x: 0, y: 0 } },
  { id: "PLML", name: "PLML", type: "sensory", function: "touch_posterior", description: "Left posterior touch receptor", position: { x: 0, y: 0 } },
  { id: "PLMR", name: "PLMR", type: "sensory", function: "touch_posterior", description: "Right posterior touch receptor", position: { x: 0, y: 0 } },
  
  // Chemosensory neurons
  { id: "ASEL", name: "ASEL", type: "sensory", function: "chemosensory", description: "Left amphid sensory neuron (salt attraction)", position: { x: 0, y: 0 } },
  { id: "ASER", name: "ASER", type: "sensory", function: "chemosensory", description: "Right amphid sensory neuron (salt avoidance)", position: { x: 0, y: 0 } },
  { id: "AWC", name: "AWC", type: "sensory", function: "olfactory", description: "Olfactory neuron for odor detection", position: { x: 0, y: 0 } },
  
  // Command interneurons
  { id: "AVAL", name: "AVAL", type: "command", function: "backward_command", description: "Left backward command interneuron", position: { x: 0, y: 0 } },
  { id: "AVAR", name: "AVAR", type: "command", function: "backward_command", description: "Right backward command interneuron", position: { x: 0, y: 0 } },
  { id: "AVBL", name: "AVBL", type: "command", function: "forward_command", description: "Left forward command interneuron", position: { x: 0, y: 0 } },
  { id: "AVBR", name: "AVBR", type: "command", function: "forward_command", description: "Right forward command interneuron", position: { x: 0, y: 0 } },
  { id: "AVDL", name: "AVDL", type: "command", function: "backward_command", description: "Left reversal interneuron", position: { x: 0, y: 0 } },
  { id: "AVDR", name: "AVDR", type: "command", function: "backward_command", description: "Right reversal interneuron", position: { x: 0, y: 0 } },
  
  // Processing interneurons
  { id: "AIYL", name: "AIYL", type: "interneuron", function: "integration", description: "Left integration interneuron", position: { x: 0, y: 0 } },
  { id: "AIYR", name: "AIYR", type: "interneuron", function: "integration", description: "Right integration interneuron", position: { x: 0, y: 0 } },
  { id: "AIZL", name: "AIZL", type: "interneuron", function: "processing", description: "Left processing interneuron", position: { x: 0, y: 0 } },
  { id: "AIZR", name: "AIZR", type: "interneuron", function: "processing", description: "Right processing interneuron", position: { x: 0, y: 0 } },
  { id: "RIM", name: "RIM", type: "interneuron", function: "locomotion", description: "Ring motor interneuron", position: { x: 0, y: 0 } },
  
  // Motor neurons
  { id: "DA1", name: "DA1", type: "motor", function: "backward_motion", description: "Dorsal A-type motor neuron 1 (backward)", position: { x: 0, y: 0 } },
  { id: "DA2", name: "DA2", type: "motor", function: "backward_motion", description: "Dorsal A-type motor neuron 2 (backward)", position: { x: 0, y: 0 } },
  { id: "DB1", name: "DB1", type: "motor", function: "forward_motion", description: "Dorsal B-type motor neuron 1 (forward)", position: { x: 0, y: 0 } },
  { id: "DB2", name: "DB2", type: "motor", function: "forward_motion", description: "Dorsal B-type motor neuron 2 (forward)", position: { x: 0, y: 0 } },
  { id: "VA1", name: "VA1", type: "motor", function: "backward_motion", description: "Ventral A-type motor neuron 1 (backward)", position: { x: 0, y: 0 } },
  { id: "VB1", name: "VB1", type: "motor", function: "forward_motion", description: "Ventral B-type motor neuron 1 (forward)", position: { x: 0, y: 0 } },
  { id: "SMBD", name: "SMBD", type: "motor", function: "head_motion", description: "Dorsal head motor neuron", position: { x: 0, y: 0 } },
  { id: "SMBV", name: "SMBV", type: "motor", function: "head_motion", description: "Ventral head motor neuron", position: { x: 0, y: 0 } },
];

// Reference connections from OpenWorm connectome
export const REFERENCE_CONNECTIONS: ConnectionData[] = [
  // Touch reflex pathway
  { from: "ALML", to: "AVAL", type: "chemical", weight: 8 },
  { from: "ALMR", to: "AVAR", type: "chemical", weight: 8 },
  { from: "ALML", to: "AVDL", type: "chemical", weight: 5 },
  { from: "ALMR", to: "AVDR", type: "chemical", weight: 5 },
  { from: "AVM", to: "AVAL", type: "chemical", weight: 7 },
  { from: "AVM", to: "AVAR", type: "chemical", weight: 7 },
  { from: "PLML", to: "AVBL", type: "chemical", weight: 6 },
  { from: "PLMR", to: "AVBR", type: "chemical", weight: 6 },
  
  // Command to motor
  { from: "AVAL", to: "DA1", type: "chemical", weight: 12 },
  { from: "AVAR", to: "DA1", type: "chemical", weight: 12 },
  { from: "AVAL", to: "VA1", type: "chemical", weight: 10 },
  { from: "AVAR", to: "VA1", type: "chemical", weight: 10 },
  { from: "AVBL", to: "DB1", type: "chemical", weight: 12 },
  { from: "AVBR", to: "VB1", type: "chemical", weight: 10 },
  
  // Chemosensory pathway
  { from: "ASEL", to: "AIYL", type: "chemical", weight: 8 },
  { from: "ASER", to: "AIYR", type: "chemical", weight: 8 },
  { from: "AIYL", to: "AIZL", type: "chemical", weight: 6 },
  { from: "AIYR", to: "AIZR", type: "chemical", weight: 6 },
  { from: "AIZL", to: "SMBD", type: "chemical", weight: 5 },
  { from: "AIZR", to: "SMBV", type: "chemical", weight: 5 },
  
  // Cross connections
  { from: "AVDL", to: "DA1", type: "chemical", weight: 8 },
  { from: "AVDR", to: "DA2", type: "chemical", weight: 8 },
  { from: "RIM", to: "AVAL", type: "electrical", weight: 4 },
  { from: "RIM", to: "AVAR", type: "electrical", weight: 4 },
];

export const NEURON_COLORS = {
  sensory: "hsl(217, 91%, 60%)", // Blue
  motor: "hsl(142, 76%, 36%)", // Green
  interneuron: "hsl(280, 65%, 50%)", // Purple
  command: "hsl(25, 95%, 53%)", // Orange
};

export type WormBehavior = 
  | "move_forward" 
  | "move_backward" 
  | "turn_left" 
  | "turn_right" 
  | "curl" 
  | "no_movement" 
  | "head_wiggle";

export interface SimulationResult {
  behavior: WormBehavior;
  activeNeurons: string[];
  signalPath: string[];
  isCorrect?: boolean;
}

// Simulation engine
export function simulateCircuit(
  userConnections: ConnectionData[],
  stimulus: "touch_head" | "touch_tail" | "smell_food" | "none",
  placedNeurons: string[]
): SimulationResult {
  const activeNeurons = new Set<string>();
  const signalPath: string[] = [];
  
  // 1. Activate input neurons based on stimulus
  if (stimulus === "touch_head") {
    if (placedNeurons.includes("ALML")) { activeNeurons.add("ALML"); signalPath.push("ALML"); }
    if (placedNeurons.includes("ALMR")) { activeNeurons.add("ALMR"); signalPath.push("ALMR"); }
    if (placedNeurons.includes("AVM")) { activeNeurons.add("AVM"); signalPath.push("AVM"); }
  } else if (stimulus === "touch_tail") {
    if (placedNeurons.includes("PLML")) { activeNeurons.add("PLML"); signalPath.push("PLML"); }
    if (placedNeurons.includes("PLMR")) { activeNeurons.add("PLMR"); signalPath.push("PLMR"); }
  } else if (stimulus === "smell_food") {
    if (placedNeurons.includes("ASEL")) { activeNeurons.add("ASEL"); signalPath.push("ASEL"); }
    if (placedNeurons.includes("ASER")) { activeNeurons.add("ASER"); signalPath.push("ASER"); }
    if (placedNeurons.includes("AWC")) { activeNeurons.add("AWC"); signalPath.push("AWC"); }
  }
  
  // 2. Propagate signals through connections (3 time steps)
  for (let t = 0; t < 3; t++) {
    const newActive = new Set<string>();
    
    activeNeurons.forEach(neuronId => {
      const outgoing = userConnections.filter(c => c.from === neuronId && c.weight >= 5);
      outgoing.forEach(conn => {
        if (placedNeurons.includes(conn.to)) {
          newActive.add(conn.to);
          if (!signalPath.includes(conn.to)) {
            signalPath.push(conn.to);
          }
        }
      });
    });
    
    newActive.forEach(n => activeNeurons.add(n));
  }
  
  // 3. Determine behavior based on active motor neurons
  const hasBackwardMotor = activeNeurons.has("DA1") || activeNeurons.has("DA2") || activeNeurons.has("VA1");
  const hasForwardMotor = activeNeurons.has("DB1") || activeNeurons.has("DB2") || activeNeurons.has("VB1");
  const hasHeadMotor = activeNeurons.has("SMBD") || activeNeurons.has("SMBV");
  
  let behavior: WormBehavior = "no_movement";
  
  if (hasBackwardMotor && !hasForwardMotor) {
    behavior = "move_backward";
  } else if (hasForwardMotor && !hasBackwardMotor) {
    behavior = "move_forward";
  } else if (hasHeadMotor) {
    behavior = "head_wiggle";
  } else if (hasBackwardMotor && hasForwardMotor) {
    behavior = "curl";
  }
  
  return {
    behavior,
    activeNeurons: Array.from(activeNeurons),
    signalPath,
  };
}
