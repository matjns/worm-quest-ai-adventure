// Circuit validation utility that compares user circuits to real OpenWorm connectome data
import { REFERENCE_CONNECTIONS, type ConnectionData, NEURON_PALETTE } from "@/data/neuronData";

export interface ValidationResult {
  overallScore: number; // 0-100
  accuracyScore: number; // How many connections match reference
  completenessScore: number; // How complete is the pathway
  pathwayScore: number; // Are correct pathways formed
  scientificValidation: {
    correctConnections: string[];
    missingConnections: string[];
    extraConnections: string[];
    biologicallyPlausible: boolean;
  };
  feedback: string[];
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  badges: string[];
}

export interface PlacedNeuronForValidation {
  id: string;
  type: string;
}

export interface ConnectionForValidation {
  from: string;
  to: string;
  weight: number;
}

// Biological pathway definitions based on OpenWorm research
const KNOWN_PATHWAYS = {
  touch_reflex_head: {
    name: "Anterior Touch Reflex",
    requiredNeurons: ["ALML", "ALMR", "AVM"],
    commandNeurons: ["AVAL", "AVAR", "AVDL", "AVDR"],
    motorNeurons: ["DA1", "DA2", "VA1"],
    expectedBehavior: "move_backward",
    description: "Touch to the head triggers backward movement via ALM/AVM sensory neurons",
  },
  touch_reflex_tail: {
    name: "Posterior Touch Reflex",
    requiredNeurons: ["PLML", "PLMR"],
    commandNeurons: ["AVBL", "AVBR"],
    motorNeurons: ["DB1", "VB1"],
    expectedBehavior: "move_forward",
    description: "Touch to the tail triggers forward movement via PLM sensory neurons",
  },
  chemotaxis: {
    name: "Chemotaxis Pathway",
    requiredNeurons: ["ASEL", "ASER", "AWC"],
    commandNeurons: ["AIYL", "AIYR", "AIZL", "AIZR"],
    motorNeurons: ["SMBD", "SMBV"],
    expectedBehavior: "head_wiggle",
    description: "Chemical detection guides movement toward food sources",
  },
  locomotion_forward: {
    name: "Forward Locomotion",
    requiredNeurons: [],
    commandNeurons: ["AVBL", "AVBR"],
    motorNeurons: ["DB1", "DB2", "VB1"],
    expectedBehavior: "move_forward",
    description: "Coordinated forward movement via B-type motor neurons",
  },
  locomotion_backward: {
    name: "Backward Locomotion",
    requiredNeurons: [],
    commandNeurons: ["AVAL", "AVAR"],
    motorNeurons: ["DA1", "DA2", "VA1"],
    expectedBehavior: "move_backward",
    description: "Coordinated backward movement via A-type motor neurons",
  },
};

// Get the reference connection weight between two neurons (0 if no connection)
function getReferenceWeight(from: string, to: string): number {
  const ref = REFERENCE_CONNECTIONS.find(c => c.from === from && c.to === to);
  return ref?.weight || 0;
}

// Check if a connection exists in reference data
function isReferenceConnection(from: string, to: string): boolean {
  return REFERENCE_CONNECTIONS.some(c => c.from === from && c.to === to);
}

// Check if neurons form a valid biological pathway
function detectPathway(neurons: string[]): string | null {
  for (const [pathwayId, pathway] of Object.entries(KNOWN_PATHWAYS)) {
    const hasSensory = pathway.requiredNeurons.length === 0 || 
      pathway.requiredNeurons.some(n => neurons.includes(n));
    const hasCommand = pathway.commandNeurons.some(n => neurons.includes(n));
    const hasMotor = pathway.motorNeurons.some(n => neurons.includes(n));
    
    if (hasSensory && hasCommand && hasMotor) {
      return pathwayId;
    }
  }
  return null;
}

// Validate a neural circuit against OpenWorm connectome data
export function validateCircuit(
  placedNeurons: PlacedNeuronForValidation[],
  connections: ConnectionForValidation[]
): ValidationResult {
  const neuronIds = placedNeurons.map(n => n.id);
  
  // 1. Find correct connections (matching reference data)
  const correctConnections: string[] = [];
  const extraConnections: string[] = [];
  
  for (const conn of connections) {
    if (isReferenceConnection(conn.from, conn.to)) {
      correctConnections.push(`${conn.from} → ${conn.to}`);
    } else {
      extraConnections.push(`${conn.from} → ${conn.to}`);
    }
  }
  
  // 2. Find missing connections (should exist based on placed neurons)
  const missingConnections: string[] = [];
  for (const ref of REFERENCE_CONNECTIONS) {
    if (neuronIds.includes(ref.from) && neuronIds.includes(ref.to)) {
      const hasConnection = connections.some(c => c.from === ref.from && c.to === ref.to);
      if (!hasConnection) {
        missingConnections.push(`${ref.from} → ${ref.to}`);
      }
    }
  }
  
  // 3. Calculate accuracy score (how many of user's connections are correct)
  const accuracyScore = connections.length > 0 
    ? Math.round((correctConnections.length / connections.length) * 100)
    : 0;
  
  // 4. Calculate completeness score (what % of expected connections are present)
  const expectedConnectionCount = REFERENCE_CONNECTIONS.filter(
    ref => neuronIds.includes(ref.from) && neuronIds.includes(ref.to)
  ).length;
  const completenessScore = expectedConnectionCount > 0
    ? Math.round((correctConnections.length / expectedConnectionCount) * 100)
    : 0;
  
  // 5. Pathway score - check if valid biological pathways are formed
  let pathwayScore = 0;
  const detectedPathway = detectPathway(neuronIds);
  if (detectedPathway) {
    const pathway = KNOWN_PATHWAYS[detectedPathway as keyof typeof KNOWN_PATHWAYS];
    
    // Check if connections form the pathway properly
    let pathwayConnectionCount = 0;
    for (const conn of connections) {
      const fromNeuronData = NEURON_PALETTE.find(n => n.id === conn.from);
      const toNeuronData = NEURON_PALETTE.find(n => n.id === conn.to);
      
      if (fromNeuronData && toNeuronData) {
        // Sensory → Command
        if (fromNeuronData.type === "sensory" && 
            (toNeuronData.type === "command" || toNeuronData.type === "interneuron")) {
          pathwayConnectionCount++;
        }
        // Command → Motor
        if ((fromNeuronData.type === "command" || fromNeuronData.type === "interneuron") && 
            toNeuronData.type === "motor") {
          pathwayConnectionCount++;
        }
        // Interneuron → Interneuron (processing)
        if (fromNeuronData.type === "interneuron" && toNeuronData.type === "interneuron") {
          pathwayConnectionCount += 0.5;
        }
      }
    }
    
    pathwayScore = Math.min(100, Math.round(pathwayConnectionCount * 25));
  }
  
  // 6. Check biological plausibility
  const biologicallyPlausible = extraConnections.length <= correctConnections.length * 2;
  
  // 7. Calculate overall score
  const overallScore = Math.round(
    (accuracyScore * 0.4) + 
    (completenessScore * 0.35) + 
    (pathwayScore * 0.25)
  );
  
  // 8. Determine grade
  let grade: ValidationResult["grade"];
  if (overallScore >= 95) grade = "A+";
  else if (overallScore >= 85) grade = "A";
  else if (overallScore >= 70) grade = "B";
  else if (overallScore >= 55) grade = "C";
  else if (overallScore >= 40) grade = "D";
  else grade = "F";
  
  // 9. Generate feedback
  const feedback: string[] = [];
  
  if (correctConnections.length > 0) {
    feedback.push(`✅ ${correctConnections.length} connection(s) match OpenWorm data`);
  }
  
  if (missingConnections.length > 0 && missingConnections.length <= 5) {
    feedback.push(`💡 Consider adding: ${missingConnections.slice(0, 3).join(", ")}`);
  }
  
  if (extraConnections.length > 0 && extraConnections.length <= 3) {
    feedback.push(`⚠️ Non-standard connections: ${extraConnections.slice(0, 2).join(", ")}`);
  } else if (extraConnections.length > 3) {
    feedback.push(`⚠️ ${extraConnections.length} connections not in reference data`);
  }
  
  if (detectedPathway) {
    const pathway = KNOWN_PATHWAYS[detectedPathway as keyof typeof KNOWN_PATHWAYS];
    feedback.push(`🧬 Detected pathway: ${pathway.name}`);
  }
  
  if (biologicallyPlausible) {
    feedback.push("🔬 Circuit is biologically plausible");
  }
  
  if (placedNeurons.length < 3) {
    feedback.push("📝 Add more neurons for a more complete circuit");
  }
  
  if (connections.length === 0) {
    feedback.push("📝 Create connections between neurons to form a circuit");
  }
  
  // 10. Award badges
  const badges: string[] = [];
  
  if (overallScore === 100) badges.push("🏆 Perfect Match");
  if (accuracyScore >= 90) badges.push("🎯 High Accuracy");
  if (completenessScore >= 90) badges.push("✨ Complete Circuit");
  if (detectedPathway) badges.push("🧬 Valid Pathway");
  if (correctConnections.length >= 10) badges.push("🔗 Connection Master");
  if (placedNeurons.length >= 10) badges.push("🧠 Complex Network");
  if (biologicallyPlausible && overallScore >= 70) badges.push("🔬 Scientifically Sound");
  
  return {
    overallScore,
    accuracyScore,
    completenessScore,
    pathwayScore,
    scientificValidation: {
      correctConnections,
      missingConnections,
      extraConnections,
      biologicallyPlausible,
    },
    feedback,
    grade,
    badges,
  };
}

// Get pathway suggestions based on current neurons
export function getPathwaySuggestions(neuronIds: string[]): {
  pathwayName: string;
  missingNeurons: string[];
  description: string;
}[] {
  const suggestions: {
    pathwayName: string;
    missingNeurons: string[];
    description: string;
  }[] = [];
  
  for (const [, pathway] of Object.entries(KNOWN_PATHWAYS)) {
    const allPathwayNeurons = [
      ...pathway.requiredNeurons,
      ...pathway.commandNeurons,
      ...pathway.motorNeurons,
    ];
    
    const presentNeurons = allPathwayNeurons.filter(n => neuronIds.includes(n));
    const missingNeurons = allPathwayNeurons.filter(n => !neuronIds.includes(n));
    
    // Only suggest if user has at least one neuron from this pathway
    if (presentNeurons.length > 0 && missingNeurons.length > 0 && missingNeurons.length <= 5) {
      suggestions.push({
        pathwayName: pathway.name,
        missingNeurons: missingNeurons.slice(0, 3),
        description: pathway.description,
      });
    }
  }
  
  return suggestions.slice(0, 3); // Max 3 suggestions
}

// Get recommended connections based on placed neurons
export function getRecommendedConnections(
  neuronIds: string[],
  existingConnections: ConnectionForValidation[]
): { from: string; to: string; weight: number; reason: string }[] {
  const recommendations: { from: string; to: string; weight: number; reason: string }[] = [];
  
  for (const ref of REFERENCE_CONNECTIONS) {
    if (neuronIds.includes(ref.from) && neuronIds.includes(ref.to)) {
      const exists = existingConnections.some(c => c.from === ref.from && c.to === ref.to);
      if (!exists) {
        const fromNeuron = NEURON_PALETTE.find(n => n.id === ref.from);
        const toNeuron = NEURON_PALETTE.find(n => n.id === ref.to);
        
        let reason = "OpenWorm reference data";
        if (fromNeuron && toNeuron) {
          if (fromNeuron.type === "sensory" && (toNeuron.type === "command" || toNeuron.type === "interneuron")) {
            reason = "Sensory → Processing pathway";
          } else if ((fromNeuron.type === "command" || fromNeuron.type === "interneuron") && toNeuron.type === "motor") {
            reason = "Processing → Motor pathway";
          }
        }
        
        recommendations.push({
          from: ref.from,
          to: ref.to,
          weight: ref.weight,
          reason,
        });
      }
    }
  }
  
  return recommendations.slice(0, 5); // Max 5 recommendations
}
