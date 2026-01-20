// localStorage persistence for synaptic weights and experiment data
// Supports JSON export for OpenWorm contributions

export interface SynapticState {
  weights: Record<string, number>;
  channels: Record<string, number>;
  timestamp: number;
  version: string;
}

export interface ExperimentState {
  hypothesis: string[];
  trials: Array<{ weight: number; speed: number; timestamp: number }>;
  layers?: Array<{ neurons: number; activation: string }>;
  learningRate?: number;
  epochs?: number;
}

const STORAGE_KEYS = {
  MIDDLE_SCHOOL: 'neuroquest_middle_school_state',
  HIGH_SCHOOL: 'neuroquest_high_school_state',
  SYNAPTIC_WEIGHTS: 'neuroquest_synaptic_weights',
  ADJACENCY_MATRIX: 'neuroquest_adjacency_matrix',
};

// Save synaptic weight state
export function saveSynapticState(state: SynapticState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SYNAPTIC_WEIGHTS, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save synaptic state:', e);
  }
}

// Load synaptic weight state
export function loadSynapticState(): SynapticState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SYNAPTIC_WEIGHTS);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to load synaptic state:', e);
    return null;
  }
}

// Save experiment state for Middle School
export function saveMiddleSchoolState(state: ExperimentState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MIDDLE_SCHOOL, JSON.stringify({
      ...state,
      savedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save middle school state:', e);
  }
}

// Load experiment state for Middle School
export function loadMiddleSchoolState(): ExperimentState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MIDDLE_SCHOOL);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to load middle school state:', e);
    return null;
  }
}

// Save neural network state for High School
export function saveHighSchoolState(state: ExperimentState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCHOOL, JSON.stringify({
      ...state,
      savedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save high school state:', e);
  }
}

// Load neural network state for High School
export function loadHighSchoolState(): ExperimentState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCHOOL);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('Failed to load high school state:', e);
    return null;
  }
}

// Save adjacency matrix for 3D interactions
export function saveAdjacencyMatrix(matrix: number[][]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADJACENCY_MATRIX, JSON.stringify({
      matrix,
      savedAt: Date.now(),
    }));
  } catch (e) {
    console.warn('Failed to save adjacency matrix:', e);
  }
}

// Load adjacency matrix
export function loadAdjacencyMatrix(): number[][] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ADJACENCY_MATRIX);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.matrix;
  } catch (e) {
    console.warn('Failed to load adjacency matrix:', e);
    return null;
  }
}

// Export state as OpenWorm-compatible JSON
export function exportForOpenWorm(
  type: 'experiment' | 'network',
  state: ExperimentState
): string {
  const exportData = {
    format: 'OpenWorm-NeuroQuest-v1',
    type,
    exportedAt: new Date().toISOString(),
    source: 'NeuroQuest Educational Platform',
    license: 'CC-BY-4.0',
    data: state,
    metadata: {
      platform: 'NeuroQuest',
      version: '1.0.0',
      compatibleWith: ['c302', 'CElegansNeuroML'],
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

// Download JSON export
export function downloadExport(
  type: 'experiment' | 'network',
  state: ExperimentState,
  filename?: string
): void {
  const json = exportForOpenWorm(type, state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `neuroquest-${type}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Clear all stored state
export function clearAllState(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
