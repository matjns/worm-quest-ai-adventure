import { type NeuronData, type ConnectionData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

export interface MergeConflict {
  type: "duplicate_neuron" | "duplicate_connection" | "position_overlap";
  description: string;
  existingId: string;
  incomingId: string;
}

export interface MergeResult {
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
  conflicts: MergeConflict[];
  stats: {
    neuronsAdded: number;
    neuronsSkipped: number;
    connectionsAdded: number;
    connectionsSkipped: number;
    connectionsMerged: number;
  };
}

export type MergeStrategy = "skip" | "replace" | "offset";

export interface MergeOptions {
  neuronConflictStrategy: MergeStrategy;
  connectionConflictStrategy: "skip" | "replace";
  positionOffset: { x: number; y: number };
  autoOffset: boolean;
}

const DEFAULT_OPTIONS: MergeOptions = {
  neuronConflictStrategy: "skip",
  connectionConflictStrategy: "skip",
  positionOffset: { x: 50, y: 50 },
  autoOffset: true,
};

/**
 * Detects position overlaps between neurons
 */
function detectPositionOverlap(
  existing: PlacedNeuron[],
  incoming: PlacedNeuron,
  threshold: number = 40
): PlacedNeuron | null {
  return existing.find(
    (n) =>
      Math.abs(n.x - incoming.x) < threshold &&
      Math.abs(n.y - incoming.y) < threshold &&
      n.id !== incoming.id
  ) || null;
}

/**
 * Finds an available position that doesn't overlap with existing neurons
 */
function findNonOverlappingPosition(
  existing: PlacedNeuron[],
  incoming: PlacedNeuron,
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = 40
): { x: number; y: number } {
  let x = incoming.x;
  let y = incoming.y;
  let attempts = 0;
  const maxAttempts = 20;
  const offsetStep = 50;

  while (attempts < maxAttempts) {
    const hasOverlap = existing.some(
      (n) => Math.abs(n.x - x) < threshold && Math.abs(n.y - y) < threshold
    );

    if (!hasOverlap) {
      return { x, y };
    }

    // Spiral outward pattern
    const angle = (attempts * 137.5 * Math.PI) / 180; // Golden angle
    const radius = offsetStep * Math.sqrt(attempts);
    x = incoming.x + radius * Math.cos(angle);
    y = incoming.y + radius * Math.sin(angle);

    // Clamp to canvas bounds
    x = Math.max(30, Math.min(canvasWidth - 30, x));
    y = Math.max(30, Math.min(canvasHeight - 30, y));

    attempts++;
  }

  // Fallback: offset by fixed amount
  return {
    x: Math.min(canvasWidth - 30, incoming.x + 60),
    y: Math.min(canvasHeight - 30, incoming.y + 60),
  };
}

/**
 * Creates a unique connection ID
 */
function createConnectionId(from: string, to: string, existingIds: Set<string>): string {
  let baseId = `${from}-${to}`;
  let id = baseId;
  let counter = 0;

  while (existingIds.has(id)) {
    counter++;
    id = `${baseId}-${counter}`;
  }

  return id;
}

/**
 * Analyzes circuits for potential merge conflicts
 */
export function analyzeCircuitsForMerge(
  existingNeurons: PlacedNeuron[],
  existingConnections: DesignerConnection[],
  incomingNeurons: PlacedNeuron[],
  incomingConnections: DesignerConnection[]
): {
  duplicateNeurons: string[];
  duplicateConnections: Array<{ from: string; to: string }>;
  positionOverlaps: Array<{ incoming: string; existing: string }>;
  uniqueNeurons: number;
  uniqueConnections: number;
} {
  const existingNeuronIds = new Set(existingNeurons.map((n) => n.id));
  const existingConnKeys = new Set(
    existingConnections.map((c) => `${c.from}->${c.to}`)
  );

  const duplicateNeurons: string[] = [];
  const uniqueNeurons: string[] = [];

  incomingNeurons.forEach((n) => {
    if (existingNeuronIds.has(n.id)) {
      duplicateNeurons.push(n.id);
    } else {
      uniqueNeurons.push(n.id);
    }
  });

  const duplicateConnections: Array<{ from: string; to: string }> = [];
  let uniqueConnectionCount = 0;

  incomingConnections.forEach((c) => {
    const key = `${c.from}->${c.to}`;
    if (existingConnKeys.has(key)) {
      duplicateConnections.push({ from: c.from, to: c.to });
    } else {
      uniqueConnectionCount++;
    }
  });

  const positionOverlaps: Array<{ incoming: string; existing: string }> = [];
  incomingNeurons.forEach((incoming) => {
    if (!existingNeuronIds.has(incoming.id)) {
      const overlap = detectPositionOverlap(existingNeurons, incoming);
      if (overlap) {
        positionOverlaps.push({ incoming: incoming.id, existing: overlap.id });
      }
    }
  });

  return {
    duplicateNeurons,
    duplicateConnections,
    positionOverlaps,
    uniqueNeurons: uniqueNeurons.length,
    uniqueConnections: uniqueConnectionCount,
  };
}

/**
 * Merges incoming circuit with existing circuit
 */
export function mergeCircuits(
  existingNeurons: PlacedNeuron[],
  existingConnections: DesignerConnection[],
  incomingNeurons: PlacedNeuron[],
  incomingConnections: DesignerConnection[],
  canvasWidth: number = 600,
  canvasHeight: number = 400,
  options: Partial<MergeOptions> = {}
): MergeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const conflicts: MergeConflict[] = [];

  const stats = {
    neuronsAdded: 0,
    neuronsSkipped: 0,
    connectionsAdded: 0,
    connectionsSkipped: 0,
    connectionsMerged: 0,
  };

  // Start with existing neurons
  const mergedNeurons = [...existingNeurons];
  const existingNeuronIds = new Set(existingNeurons.map((n) => n.id));
  const existingConnectionKeys = new Set(
    existingConnections.map((c) => `${c.from}->${c.to}`)
  );
  const connectionIdSet = new Set(existingConnections.map((c) => c.id));

  // Process incoming neurons
  incomingNeurons.forEach((incoming) => {
    if (existingNeuronIds.has(incoming.id)) {
      // Duplicate neuron found
      conflicts.push({
        type: "duplicate_neuron",
        description: `Neuron "${incoming.id}" already exists on canvas`,
        existingId: incoming.id,
        incomingId: incoming.id,
      });

      switch (opts.neuronConflictStrategy) {
        case "replace":
          // Replace existing neuron with incoming
          const idx = mergedNeurons.findIndex((n) => n.id === incoming.id);
          if (idx !== -1) {
            mergedNeurons[idx] = { ...incoming };
          }
          stats.neuronsAdded++;
          break;
        case "skip":
        default:
          stats.neuronsSkipped++;
          break;
      }
    } else {
      // New neuron - check for position overlap
      let finalPosition = { x: incoming.x, y: incoming.y };

      if (opts.autoOffset) {
        const overlap = detectPositionOverlap(mergedNeurons, incoming);
        if (overlap) {
          conflicts.push({
            type: "position_overlap",
            description: `Neuron "${incoming.id}" overlaps with "${overlap.id}" - auto-repositioning`,
            existingId: overlap.id,
            incomingId: incoming.id,
          });
          finalPosition = findNonOverlappingPosition(
            mergedNeurons,
            incoming,
            canvasWidth,
            canvasHeight
          );
        }
      } else if (opts.positionOffset.x !== 0 || opts.positionOffset.y !== 0) {
        finalPosition = {
          x: Math.min(canvasWidth - 30, incoming.x + opts.positionOffset.x),
          y: Math.min(canvasHeight - 30, incoming.y + opts.positionOffset.y),
        };
      }

      mergedNeurons.push({
        ...incoming,
        x: finalPosition.x,
        y: finalPosition.y,
      });
      existingNeuronIds.add(incoming.id);
      stats.neuronsAdded++;
    }
  });

  // Start with existing connections
  const mergedConnections = [...existingConnections];

  // Process incoming connections
  incomingConnections.forEach((incoming) => {
    const key = `${incoming.from}->${incoming.to}`;

    // Only add connection if both neurons exist in merged set
    if (!existingNeuronIds.has(incoming.from) || !existingNeuronIds.has(incoming.to)) {
      return; // Skip orphan connections
    }

    if (existingConnectionKeys.has(key)) {
      // Duplicate connection
      conflicts.push({
        type: "duplicate_connection",
        description: `Connection "${incoming.from} → ${incoming.to}" already exists`,
        existingId: key,
        incomingId: key,
      });

      switch (opts.connectionConflictStrategy) {
        case "replace":
          const idx = mergedConnections.findIndex(
            (c) => c.from === incoming.from && c.to === incoming.to
          );
          if (idx !== -1) {
            mergedConnections[idx] = {
              ...incoming,
              id: mergedConnections[idx].id,
            };
            stats.connectionsMerged++;
          }
          break;
        case "skip":
        default:
          stats.connectionsSkipped++;
          break;
      }
    } else {
      // New connection
      const newId = createConnectionId(incoming.from, incoming.to, connectionIdSet);
      connectionIdSet.add(newId);
      existingConnectionKeys.add(key);

      mergedConnections.push({
        ...incoming,
        id: newId,
      });
      stats.connectionsAdded++;
    }
  });

  return {
    neurons: mergedNeurons,
    connections: mergedConnections,
    conflicts,
    stats,
  };
}
