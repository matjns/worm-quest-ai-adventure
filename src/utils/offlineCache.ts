/**
 * Offline Cache for Sibernetic Hydrodynamics Data
 * 
 * Provides low-bandwidth access to critical simulation data
 * with progressive loading and IndexedDB persistence.
 */

// Core sibernetic data structures for offline use
export interface SiberneticParticle {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  density: number;
  pressure: number;
  bodyId: number;
}

export interface MuscleSegment {
  id: string;
  name: string;
  particles: number[];
  activationLevel: number;
  neuronInputs: string[];
}

export interface HydrodynamicsConfig {
  particleCount: number;
  timeStep: number;
  viscosity: number;
  stiffness: number;
  restDensity: number;
  smoothingRadius: number;
}

export interface CachedSimulationData {
  version: string;
  timestamp: number;
  config: HydrodynamicsConfig;
  muscleSegments: MuscleSegment[];
  neuronMappings: Record<string, string[]>;
  sphKernels: {
    poly6: number[];
    spiky: number[];
    viscosity: number[];
  };
}

const DB_NAME = "neuroquest-offline";
const DB_VERSION = 1;
const STORE_NAME = "sibernetic-cache";

// Default SPH config based on OpenWorm Sibernetic
const DEFAULT_CONFIG: HydrodynamicsConfig = {
  particleCount: 3200,
  timeStep: 0.0001,
  viscosity: 0.01,
  stiffness: 3.0,
  restDensity: 1000,
  smoothingRadius: 0.01,
};

// Pre-computed muscle segments from OpenWorm data
const DEFAULT_MUSCLE_SEGMENTS: MuscleSegment[] = [
  { id: "VL1", name: "Ventral Left 1", particles: [], activationLevel: 0, neuronInputs: ["VA1", "VB1"] },
  { id: "VL2", name: "Ventral Left 2", particles: [], activationLevel: 0, neuronInputs: ["VA2", "VB2"] },
  { id: "VR1", name: "Ventral Right 1", particles: [], activationLevel: 0, neuronInputs: ["VA1", "VB1"] },
  { id: "VR2", name: "Ventral Right 2", particles: [], activationLevel: 0, neuronInputs: ["VA2", "VB2"] },
  { id: "DL1", name: "Dorsal Left 1", particles: [], activationLevel: 0, neuronInputs: ["DA1", "DB1"] },
  { id: "DL2", name: "Dorsal Left 2", particles: [], activationLevel: 0, neuronInputs: ["DA2", "DB2"] },
  { id: "DR1", name: "Dorsal Right 1", particles: [], activationLevel: 0, neuronInputs: ["DA1", "DB1"] },
  { id: "DR2", name: "Dorsal Right 2", particles: [], activationLevel: 0, neuronInputs: ["DA2", "DB2"] },
];

// Neuron to muscle mappings (simplified from OpenWorm data)
const DEFAULT_NEURON_MAPPINGS: Record<string, string[]> = {
  AVA: ["VA1", "VA2", "VA3", "VA4", "VA5"],
  AVB: ["VB1", "VB2", "VB3", "VB4", "VB5"],
  AVD: ["DA1", "DA2", "DA3", "DA4"],
  AVE: ["DB1", "DB2", "DB3", "DB4"],
  RMD: ["DL1", "DR1", "VL1", "VR1"],
  SMD: ["DL2", "DR2", "VL2", "VR2"],
};

// Pre-computed SPH kernels for performance
function computeSPHKernels(smoothingRadius: number): CachedSimulationData["sphKernels"] {
  const h = smoothingRadius;
  const poly6: number[] = [];
  const spiky: number[] = [];
  const viscosity: number[] = [];
  
  // Pre-compute kernel values for 100 distance steps
  for (let i = 0; i <= 100; i++) {
    const r = (i / 100) * h;
    const q = r / h;
    
    // Poly6 kernel
    if (q <= 1) {
      poly6.push(Math.pow(1 - q * q, 3));
    } else {
      poly6.push(0);
    }
    
    // Spiky kernel (for pressure)
    if (q <= 1) {
      spiky.push(Math.pow(1 - q, 3));
    } else {
      spiky.push(0);
    }
    
    // Viscosity kernel
    if (q <= 1) {
      viscosity.push(1 - q);
    } else {
      viscosity.push(0);
    }
  }
  
  return { poly6, spiky, viscosity };
}

/**
 * Open IndexedDB connection
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "version" });
      }
    };
  });
}

/**
 * Save simulation data to IndexedDB
 */
export async function cacheSimulationData(data: CachedSimulationData): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Load simulation data from IndexedDB
 */
export async function loadCachedSimulationData(): Promise<CachedSimulationData | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("v1.0.0");
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.warn("Failed to load cached data:", error);
    return null;
  }
}

/**
 * Initialize offline cache with default data
 */
export async function initializeOfflineCache(): Promise<CachedSimulationData> {
  // Try to load existing cache
  let cached = await loadCachedSimulationData();
  
  if (cached) {
    // Check if cache is recent (less than 7 days old)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (cached.timestamp > weekAgo) {
      return cached;
    }
  }
  
  // Create new cache
  const data: CachedSimulationData = {
    version: "v1.0.0",
    timestamp: Date.now(),
    config: DEFAULT_CONFIG,
    muscleSegments: DEFAULT_MUSCLE_SEGMENTS,
    neuronMappings: DEFAULT_NEURON_MAPPINGS,
    sphKernels: computeSPHKernels(DEFAULT_CONFIG.smoothingRadius),
  };
  
  // Save to IndexedDB
  await cacheSimulationData(data);
  
  return data;
}

/**
 * Check if offline data is available
 */
export async function isOfflineDataAvailable(): Promise<boolean> {
  try {
    const data = await loadCachedSimulationData();
    return data !== null;
  } catch {
    return false;
  }
}

/**
 * Get cache size in bytes
 */
export async function getCacheSize(): Promise<number> {
  const data = await loadCachedSimulationData();
  if (!data) return 0;
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Clear offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get muscle activation for given neuron inputs
 */
export function computeMuscleActivation(
  muscleSegments: MuscleSegment[],
  neuronActivations: Record<string, number>,
  neuronMappings: Record<string, string[]>
): MuscleSegment[] {
  return muscleSegments.map(segment => {
    // Sum activation from connected motor neurons
    let totalActivation = 0;
    let inputCount = 0;
    
    segment.neuronInputs.forEach(neuronId => {
      // Find neurons that connect to this motor neuron
      Object.entries(neuronMappings).forEach(([command, motors]) => {
        if (motors.includes(neuronId) && neuronActivations[command] !== undefined) {
          totalActivation += neuronActivations[command];
          inputCount++;
        }
      });
    });
    
    const activation = inputCount > 0 ? totalActivation / inputCount : 0;
    
    return {
      ...segment,
      activationLevel: Math.max(0, Math.min(1, activation)),
    };
  });
}

/**
 * Interpolate SPH kernel value
 */
export function interpolateKernel(
  kernelValues: number[],
  distance: number,
  smoothingRadius: number
): number {
  const normalizedDist = Math.min(1, distance / smoothingRadius);
  const index = Math.floor(normalizedDist * 100);
  const fraction = (normalizedDist * 100) - index;
  
  if (index >= 99) return kernelValues[99] || 0;
  
  // Linear interpolation
  return kernelValues[index] + fraction * (kernelValues[index + 1] - kernelValues[index]);
}
