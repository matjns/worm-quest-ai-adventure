// NeuroML Import Utility
// Parses NeuroML 2.x files and converts them to internal circuit format

import { NEURON_PALETTE, type NeuronData, type ConnectionData } from "@/data/neuronData";

interface ImportedNeuron {
  id: string;
  type: NeuronData["type"];
  x: number;
  y: number;
  notes?: string;
  neurotransmitter?: string;
  function?: string;
}

interface ImportedConnection {
  from: string;
  to: string;
  type: "chemical" | "electrical";
  weight: number;
}

export interface ImportResult {
  success: boolean;
  neurons: ImportedNeuron[];
  connections: ImportedConnection[];
  metadata: {
    title: string;
    notes?: string;
    networkId?: string;
    neuronCount: number;
    connectionCount: number;
  };
  warnings: string[];
  errors: string[];
}

// Cell type to neuron type mapping (reverse of export)
const CELL_TYPE_MAP: Record<string, NeuronData["type"]> = {
  GenericNeuronCell: "sensory",
  GenericMotorNeuron: "motor",
  GenericInterneuron: "interneuron",
  GenericCommandNeuron: "command",
};

// Known neuron IDs and their types from the palette
const KNOWN_NEURONS = new Map<string, NeuronData["type"]>(
  NEURON_PALETTE.map(n => [n.id, n.type])
);

/**
 * Parse NeuroML 2.x XML content
 */
export function parseNeuroML(xmlContent: string): ImportResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const neurons: ImportedNeuron[] = [];
  const connections: ImportedConnection[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, "application/xml");

    // Check for parsing errors
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      return {
        success: false,
        neurons: [],
        connections: [],
        metadata: { title: "", neuronCount: 0, connectionCount: 0 },
        warnings: [],
        errors: ["Invalid XML format: " + parseError.textContent?.slice(0, 100)],
      };
    }

    // Get root neuroml element
    const neuroml = doc.querySelector("neuroml");
    if (!neuroml) {
      return {
        success: false,
        neurons: [],
        connections: [],
        metadata: { title: "", neuronCount: 0, connectionCount: 0 },
        warnings: [],
        errors: ["No <neuroml> root element found"],
      };
    }

    // Extract metadata
    const networkId = neuroml.getAttribute("id") || "imported_circuit";
    const notesElement = neuroml.querySelector(":scope > notes");
    const notes = notesElement?.textContent || undefined;

    // Parse cells (neuron definitions)
    const cells = doc.querySelectorAll("cell");
    const cellIds = new Set<string>();
    
    cells.forEach((cell) => {
      const cellId = cell.getAttribute("id");
      if (!cellId) return;
      
      cellIds.add(cellId);

      // Try to determine neuron type from annotations or known neurons
      let neuronType: NeuronData["type"] = "interneuron";
      let neurotransmitter: string | undefined;
      let neuronFunction: string | undefined;

      // Check annotations
      const properties = cell.querySelectorAll("annotation property");
      properties.forEach((prop) => {
        const tag = prop.getAttribute("tag");
        const value = prop.getAttribute("value");
        if (tag === "neuronType" && value) {
          if (value in CELL_TYPE_MAP || ["sensory", "motor", "interneuron", "command"].includes(value)) {
            neuronType = (CELL_TYPE_MAP[value] || value) as NeuronData["type"];
          }
        }
        if (tag === "neurotransmitter") {
          neurotransmitter = value || undefined;
        }
        if (tag === "function") {
          neuronFunction = value || undefined;
        }
      });

      // Override with known neuron type if available
      if (KNOWN_NEURONS.has(cellId)) {
        neuronType = KNOWN_NEURONS.get(cellId)!;
      }

      const cellNotes = cell.querySelector("notes")?.textContent || undefined;

      neurons.push({
        id: cellId,
        type: neuronType,
        x: 0, // Will be set later
        y: 0,
        notes: cellNotes,
        neurotransmitter,
        function: neuronFunction,
      });
    });

    // Parse populations (can also define neurons)
    const populations = doc.querySelectorAll("population");
    populations.forEach((pop) => {
      const popId = pop.getAttribute("id");
      const component = pop.getAttribute("component");
      
      if (!popId) return;
      
      // Extract base neuron ID from population ID (e.g., "AVAL_pop" -> "AVAL")
      const baseId = popId.replace(/_pop$/, "");
      
      // If this neuron wasn't defined as a cell, add it
      if (!cellIds.has(baseId) && !cellIds.has(component || "")) {
        const neuronId = component || baseId;
        
        let neuronType: NeuronData["type"] = "interneuron";
        if (KNOWN_NEURONS.has(neuronId)) {
          neuronType = KNOWN_NEURONS.get(neuronId)!;
        }

        // Check for location in instances
        let x = 0, y = 0;
        const location = pop.querySelector("instance location");
        if (location) {
          x = parseFloat(location.getAttribute("x") || "0");
          y = parseFloat(location.getAttribute("y") || "0");
        }

        if (!neurons.find(n => n.id === neuronId)) {
          neurons.push({
            id: neuronId,
            type: neuronType,
            x,
            y,
          });
        }
      }

      // Update positions from instances
      const instances = pop.querySelectorAll("instance");
      instances.forEach((inst) => {
        const location = inst.querySelector("location");
        if (location) {
          const x = parseFloat(location.getAttribute("x") || "0");
          const y = parseFloat(location.getAttribute("y") || "0");
          const baseId = popId.replace(/_pop$/, "");
          const neuron = neurons.find(n => n.id === baseId);
          if (neuron) {
            neuron.x = x;
            neuron.y = y;
          }
        }
      });
    });

    // Parse projections (connections/synapses)
    const projections = doc.querySelectorAll("projection");
    projections.forEach((proj) => {
      const prePop = proj.getAttribute("presynapticPopulation");
      const postPop = proj.getAttribute("postsynapticPopulation");
      const synapse = proj.getAttribute("synapse") || "";
      
      if (!prePop || !postPop) return;
      
      const fromId = prePop.replace(/_pop$/, "");
      const toId = postPop.replace(/_pop$/, "");
      
      // Determine connection type
      const isElectrical = synapse.toLowerCase().includes("gap") || 
                           synapse.toLowerCase().includes("electrical");
      
      // Try to get weight from annotations
      let weight = 8; // Default weight
      const weightProp = proj.querySelector("annotation property[tag='weight']");
      if (weightProp) {
        const weightValue = parseFloat(weightProp.getAttribute("value") || "0.8");
        weight = Math.round(weightValue * 10); // Convert back to 0-15 scale
      }

      connections.push({
        from: fromId,
        to: toId,
        type: isElectrical ? "electrical" : "chemical",
        weight: Math.max(1, Math.min(15, weight)),
      });
    });

    // Parse electrical projections separately
    const electricalProjections = doc.querySelectorAll("electricalProjection");
    electricalProjections.forEach((proj) => {
      const prePop = proj.getAttribute("presynapticPopulation");
      const postPop = proj.getAttribute("postsynapticPopulation");
      
      if (!prePop || !postPop) return;
      
      const fromId = prePop.replace(/_pop$/, "");
      const toId = postPop.replace(/_pop$/, "");

      connections.push({
        from: fromId,
        to: toId,
        type: "electrical",
        weight: 5,
      });
    });

    // Validate and warn about unknown neurons
    const allNeuronIds = new Set(neurons.map(n => n.id));
    connections.forEach(conn => {
      if (!allNeuronIds.has(conn.from)) {
        warnings.push(`Connection references unknown neuron: ${conn.from}`);
      }
      if (!allNeuronIds.has(conn.to)) {
        warnings.push(`Connection references unknown neuron: ${conn.to}`);
      }
    });

    // Warn about neurons not in the palette
    neurons.forEach(n => {
      if (!KNOWN_NEURONS.has(n.id)) {
        warnings.push(`Neuron "${n.id}" is not in the standard palette - type guessed as "${n.type}"`);
      }
    });

    return {
      success: true,
      neurons,
      connections,
      metadata: {
        title: networkId.replace(/_/g, " "),
        notes,
        networkId,
        neuronCount: neurons.length,
        connectionCount: connections.length,
      },
      warnings,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      neurons: [],
      connections: [],
      metadata: { title: "", neuronCount: 0, connectionCount: 0 },
      warnings: [],
      errors: [`Failed to parse NeuroML: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

/**
 * Arrange neurons in a logical layout based on their types
 */
export function arrangeNeuronsForCanvas(
  neurons: ImportedNeuron[],
  canvasWidth: number,
  canvasHeight: number
): ImportedNeuron[] {
  // Group neurons by type
  const groups: Record<NeuronData["type"], ImportedNeuron[]> = {
    sensory: [],
    interneuron: [],
    command: [],
    motor: [],
  };

  neurons.forEach(n => {
    groups[n.type].push(n);
  });

  // Layout constants
  const padding = 60;
  const rowHeights = {
    sensory: 0.15,
    interneuron: 0.35,
    command: 0.55,
    motor: 0.8,
  };

  const arranged: ImportedNeuron[] = [];

  // Arrange each group horizontally at its row height
  Object.entries(groups).forEach(([type, groupNeurons]) => {
    if (groupNeurons.length === 0) return;
    
    const y = rowHeights[type as NeuronData["type"]] * canvasHeight;
    const spacing = (canvasWidth - 2 * padding) / Math.max(groupNeurons.length, 1);
    
    groupNeurons.forEach((neuron, idx) => {
      // Use existing position if valid, otherwise calculate new one
      let x = neuron.x;
      if (x === 0 || x > canvasWidth) {
        x = padding + (idx + 0.5) * spacing;
      } else if (x < 1) {
        // Assume it's a percentage
        x = x * canvasWidth;
      }
      
      arranged.push({
        ...neuron,
        x: Math.max(padding, Math.min(x, canvasWidth - padding)),
        y: y + (Math.random() - 0.5) * 30, // Small random offset for visual variety
      });
    });
  });

  return arranged;
}

/**
 * Read a NeuroML file from a File object
 */
export async function readNeuroMLFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file);
  });
}

/**
 * Validate a NeuroML file before import
 */
export function validateNeuroMLContent(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (!content.trim()) {
    errors.push("File is empty");
    return { valid: false, errors };
  }

  if (!content.includes("<?xml") && !content.includes("<neuroml")) {
    errors.push("File does not appear to be XML or NeuroML format");
    return { valid: false, errors };
  }

  if (!content.includes("<neuroml") && !content.includes("<Lems")) {
    errors.push("No NeuroML or LEMS root element found");
    return { valid: false, errors };
  }

  // Check for common NeuroML elements
  const hasNeurons = content.includes("<cell") || content.includes("<population");
  const hasConnections = content.includes("<projection") || content.includes("<electricalProjection");

  if (!hasNeurons) {
    errors.push("No neuron definitions (cells or populations) found");
  }

  if (!hasConnections) {
    errors.push("No connections (projections) found - circuit may be incomplete");
  }

  return { valid: errors.length === 0 || (hasNeurons && !hasConnections), errors };
}
