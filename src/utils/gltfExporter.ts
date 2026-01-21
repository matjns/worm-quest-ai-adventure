import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface ExportOptions {
  binary: boolean;
  includeAnimations: boolean;
  embedImages: boolean;
  maxTextureSize: number;
  onProgress?: (progress: number) => void;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  size: number;
}

/**
 * Creates a C. elegans worm 3D model for VR export
 */
export function createWormModel(
  activeNeurons: boolean[] = [],
  signalStrength: number = 0.7
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'C_elegans_Model';

  // Create worm body segments
  const numSegments = 20;
  const segmentRadius = 0.15;
  const wormLength = 4;

  // Create spline path for worm body
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const x = (t - 0.5) * wormLength;
    const y = Math.sin(t * Math.PI * 2) * 0.2; // Subtle wave
    const z = Math.cos(t * Math.PI * 2) * 0.1;
    points.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(points);

  // Create tube geometry for body
  const bodyGeometry = new THREE.TubeGeometry(curve, 64, segmentRadius, 16, false);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5deb3,
    roughness: 0.6,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.name = 'Body';
  group.add(body);

  // Create neuron spheres along the body
  const neuronGroup = new THREE.Group();
  neuronGroup.name = 'Neurons';

  const neuronPositions = [
    { name: 'ASEL', pos: [-1.8, 0.1, 0.05], type: 'sensory' },
    { name: 'ASER', pos: [-1.8, 0.1, -0.05], type: 'sensory' },
    { name: 'AWC', pos: [-1.6, 0.15, 0], type: 'sensory' },
    { name: 'AIY', pos: [-1.2, 0.1, 0.03], type: 'interneuron' },
    { name: 'AIZ', pos: [-1.2, 0.1, -0.03], type: 'interneuron' },
    { name: 'RIA', pos: [-0.8, 0.05, 0], type: 'interneuron' },
    { name: 'AVA', pos: [-0.4, 0, 0.02], type: 'command' },
    { name: 'AVB', pos: [-0.4, 0, -0.02], type: 'command' },
    { name: 'DA', pos: [0.5, -0.1, 0.05], type: 'motor' },
    { name: 'DB', pos: [0.5, -0.1, -0.05], type: 'motor' },
  ];

  neuronPositions.forEach((neuron, idx) => {
    const isActive = activeNeurons[idx] ?? false;
    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: isActive ? 0x00ff88 : getNeuronColor(neuron.type),
      emissive: isActive ? 0x00ff44 : 0x000000,
      emissiveIntensity: isActive ? signalStrength * 0.5 : 0,
      roughness: 0.4,
      metalness: 0.3,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...neuron.pos as [number, number, number]);
    mesh.name = neuron.name;
    mesh.userData = { type: neuron.type, index: idx };
    neuronGroup.add(mesh);
  });

  group.add(neuronGroup);

  // Create synaptic connections
  const connectionsGroup = new THREE.Group();
  connectionsGroup.name = 'Synapses';

  const connections = [
    [0, 3], // ASEL -> AIY
    [1, 4], // ASER -> AIZ
    [2, 3], // AWC -> AIY
    [3, 5], // AIY -> RIA
    [4, 5], // AIZ -> RIA
    [5, 6], // RIA -> AVA
    [5, 7], // RIA -> AVB
    [6, 8], // AVA -> DA
    [7, 9], // AVB -> DB
  ];

  connections.forEach(([from, to]) => {
    const fromPos = neuronPositions[from].pos;
    const toPos = neuronPositions[to].pos;
    
    const points = [
      new THREE.Vector3(...fromPos as [number, number, number]),
      new THREE.Vector3(...toPos as [number, number, number]),
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x4488ff,
      linewidth: 1,
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.name = `Synapse_${neuronPositions[from].name}_${neuronPositions[to].name}`;
    connectionsGroup.add(line);
  });

  group.add(connectionsGroup);

  // Add metadata
  group.userData = {
    species: 'Caenorhabditis elegans',
    neuronCount: neuronPositions.length,
    synapseCount: connections.length,
    source: 'OpenWorm Project',
    exportDate: new Date().toISOString(),
  };

  return group;
}

function getNeuronColor(type: string): number {
  switch (type) {
    case 'sensory': return 0xff6b6b;
    case 'interneuron': return 0x4ecdc4;
    case 'command': return 0xffe66d;
    case 'motor': return 0x95e1d3;
    default: return 0xcccccc;
  }
}

/**
 * Export Three.js scene/object to GLTF/GLB format
 */
export async function exportToGLTF(
  object: THREE.Object3D,
  options: ExportOptions = {
    binary: true,
    includeAnimations: true,
    embedImages: true,
    maxTextureSize: 2048,
  }
): Promise<ExportResult> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();

    const exportOptions = {
      binary: options.binary,
      includeCustomExtensions: true,
      animations: options.includeAnimations ? [] : undefined,
      onlyVisible: true,
      maxTextureSize: options.maxTextureSize,
    };

    options.onProgress?.(10);

    exporter.parse(
      object,
      (result) => {
        options.onProgress?.(80);

        let blob: Blob;
        let extension: string;

        if (result instanceof ArrayBuffer) {
          blob = new Blob([result], { type: 'model/gltf-binary' });
          extension = 'glb';
        } else {
          const json = JSON.stringify(result, null, 2);
          blob = new Blob([json], { type: 'model/gltf+json' });
          extension = 'gltf';
        }

        options.onProgress?.(100);

        resolve({
          blob,
          filename: `c-elegans-model.${extension}`,
          size: blob.size,
        });
      },
      (error) => {
        reject(error);
      },
      exportOptions
    );
  });
}

/**
 * Download the exported model
 */
export function downloadModel(result: ExportResult, customFilename?: string): void {
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = customFilename || result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get VR platform-specific export settings
 */
export function getVRPlatformSettings(platform: string): {
  maxTextureSize: number;
  binary: boolean;
  notes: string;
} {
  switch (platform) {
    case 'oculus':
      return {
        maxTextureSize: 2048,
        binary: true, // GLB preferred for Quest
        notes: 'Optimized for Meta Quest. Use GLB format for best performance.',
      };
    case 'htc':
      return {
        maxTextureSize: 4096,
        binary: true,
        notes: 'HTC Vive supports higher texture resolution. GLB recommended.',
      };
    case 'pico':
      return {
        maxTextureSize: 2048,
        binary: true,
        notes: 'Pico VR compatible. Use compressed textures for best performance.',
      };
    case 'universal':
    default:
      return {
        maxTextureSize: 2048,
        binary: false, // GLTF for maximum compatibility
        notes: 'Universal format compatible with most VR/AR platforms.',
      };
  }
}
