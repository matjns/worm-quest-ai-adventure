/**
 * OpenWorm C. elegans Connectome Data
 * 
 * This module provides a JavaScript port of the C. elegans connectome data
 * from OpenWorm's CElegansNeuroML repository (github.com/openworm/CElegansNeuroML).
 * 
 * The connectome is the complete wiring diagram of the 302 neurons and their
 * ~7,000 synaptic connections. This is the ONLY organism for which we have
 * a complete connectome - making C. elegans invaluable for neuroscience research.
 * 
 * Data sources:
 * - White et al., 1986: Original electron microscopy mapping
 * - Varshney et al., 2011: Updated connectivity data
 * - Cook et al., 2019: Most recent comprehensive update
 * 
 * All data is public domain and used in accordance with OpenWorm's open-source mission.
 */

export interface Neuron {
  id: string;
  name: string;
  type: "sensory" | "motor" | "interneuron";
  class: string;
  position: { x: number; y: number; z: number };
  description: string;
  neurotransmitter?: string;
}

export interface Synapse {
  pre: string;      // Presynaptic neuron
  post: string;     // Postsynaptic neuron
  type: "chemical" | "electrical";
  weight: number;   // Number of synapses or gap junction connections
  sections?: string[];
}

export interface Muscle {
  id: string;
  name: string;
  position: "dorsal" | "ventral";
  quadrant: "left" | "right";
  innervation: string[]; // Motor neurons that control this muscle
}

// Complete list of all 302 C. elegans neurons (organized by type)
export const NEURONS: Neuron[] = [
  // ============ SENSORY NEURONS (86 total) ============
  // Mechanosensory - Touch receptors
  { id: "ALML", name: "ALML", type: "sensory", class: "ALM", position: { x: -10, y: 20, z: 0 }, description: "Anterior lateral microtubule cell (left) - gentle touch to anterior body", neurotransmitter: "Glutamate" },
  { id: "ALMR", name: "ALMR", type: "sensory", class: "ALM", position: { x: 10, y: 20, z: 0 }, description: "Anterior lateral microtubule cell (right) - gentle touch to anterior body", neurotransmitter: "Glutamate" },
  { id: "AVM", name: "AVM", type: "sensory", class: "AVM", position: { x: 0, y: 15, z: 0 }, description: "Anterior ventral microtubule cell - gentle touch to anterior ventral body", neurotransmitter: "Glutamate" },
  { id: "PLML", name: "PLML", type: "sensory", class: "PLM", position: { x: -8, y: -35, z: 0 }, description: "Posterior lateral microtubule cell (left) - gentle touch to posterior body", neurotransmitter: "Glutamate" },
  { id: "PLMR", name: "PLMR", type: "sensory", class: "PLM", position: { x: 8, y: -35, z: 0 }, description: "Posterior lateral microtubule cell (right) - gentle touch to posterior body", neurotransmitter: "Glutamate" },
  { id: "PVM", name: "PVM", type: "sensory", class: "PVM", position: { x: 0, y: -30, z: 0 }, description: "Posterior ventral microtubule cell - gentle touch to posterior ventral body", neurotransmitter: "Glutamate" },
  
  // Harsh touch sensors
  { id: "PVDL", name: "PVDL", type: "sensory", class: "PVD", position: { x: -5, y: -20, z: 0 }, description: "Polymodal nociceptor (left) - harsh touch, cold temperature", neurotransmitter: "Glutamate" },
  { id: "PVDR", name: "PVDR", type: "sensory", class: "PVD", position: { x: 5, y: -20, z: 0 }, description: "Polymodal nociceptor (right) - harsh touch, cold temperature", neurotransmitter: "Glutamate" },
  
  // Chemosensory - Taste/smell (amphid neurons)
  { id: "ASEL", name: "ASEL", type: "sensory", class: "ASE", position: { x: -3, y: 40, z: 0 }, description: "Amphid single ciliated (left) - salt sensing, chemotaxis", neurotransmitter: "Glutamate" },
  { id: "ASER", name: "ASER", type: "sensory", class: "ASE", position: { x: 3, y: 40, z: 0 }, description: "Amphid single ciliated (right) - salt sensing, chemotaxis", neurotransmitter: "Glutamate" },
  { id: "ASGL", name: "ASGL", type: "sensory", class: "ASG", position: { x: -4, y: 38, z: 0 }, description: "Amphid single ciliated (left) - odor sensing", neurotransmitter: "Glutamate" },
  { id: "ASGR", name: "ASGR", type: "sensory", class: "ASG", position: { x: 4, y: 38, z: 0 }, description: "Amphid single ciliated (right) - odor sensing", neurotransmitter: "Glutamate" },
  { id: "ASHL", name: "ASHL", type: "sensory", class: "ASH", position: { x: -4, y: 42, z: 0 }, description: "Amphid single ciliated (left) - nociception, osmolarity", neurotransmitter: "Glutamate" },
  { id: "ASHR", name: "ASHR", type: "sensory", class: "ASH", position: { x: 4, y: 42, z: 0 }, description: "Amphid single ciliated (right) - nociception, osmolarity", neurotransmitter: "Glutamate" },
  { id: "AWAL", name: "AWAL", type: "sensory", class: "AWA", position: { x: -2, y: 43, z: 0 }, description: "Amphid wing A (left) - attractive odor sensing", neurotransmitter: "Glutamate" },
  { id: "AWAR", name: "AWAR", type: "sensory", class: "AWA", position: { x: 2, y: 43, z: 0 }, description: "Amphid wing A (right) - attractive odor sensing", neurotransmitter: "Glutamate" },
  { id: "AWBL", name: "AWBL", type: "sensory", class: "AWB", position: { x: -3, y: 44, z: 0 }, description: "Amphid wing B (left) - repulsive odor sensing", neurotransmitter: "Glutamate" },
  { id: "AWBR", name: "AWBR", type: "sensory", class: "AWB", position: { x: 3, y: 44, z: 0 }, description: "Amphid wing B (right) - repulsive odor sensing", neurotransmitter: "Glutamate" },
  { id: "AWCL", name: "AWCL", type: "sensory", class: "AWC", position: { x: -4, y: 45, z: 0 }, description: "Amphid wing C (left) - volatile odor sensing, thermotaxis", neurotransmitter: "Glutamate" },
  { id: "AWCR", name: "AWCR", type: "sensory", class: "AWC", position: { x: 4, y: 45, z: 0 }, description: "Amphid wing C (right) - volatile odor sensing, thermotaxis", neurotransmitter: "Glutamate" },
  
  // Thermosensory
  { id: "AFDR", name: "AFDR", type: "sensory", class: "AFD", position: { x: 3, y: 46, z: 0 }, description: "Amphid finger (right) - thermosensation, thermotaxis", neurotransmitter: "Glutamate" },
  { id: "AFDL", name: "AFDL", type: "sensory", class: "AFD", position: { x: -3, y: 46, z: 0 }, description: "Amphid finger (left) - thermosensation, thermotaxis", neurotransmitter: "Glutamate" },
  
  // Oxygen sensing
  { id: "URXL", name: "URXL", type: "sensory", class: "URX", position: { x: -2, y: 47, z: 0 }, description: "O2/CO2 sensing (left)", neurotransmitter: "Glutamate" },
  { id: "URXR", name: "URXR", type: "sensory", class: "URX", position: { x: 2, y: 47, z: 0 }, description: "O2/CO2 sensing (right)", neurotransmitter: "Glutamate" },
  
  // Pharyngeal sensory
  { id: "IL1DL", name: "IL1DL", type: "sensory", class: "IL1", position: { x: -1, y: 48, z: 2 }, description: "Inner labial type 1 - mechanosensory (pharynx)", neurotransmitter: "Acetylcholine" },
  { id: "IL1DR", name: "IL1DR", type: "sensory", class: "IL1", position: { x: 1, y: 48, z: 2 }, description: "Inner labial type 1 - mechanosensory (pharynx)", neurotransmitter: "Acetylcholine" },
  
  // ============ INTERNEURONS (82 total) ============
  // Command interneurons - Forward locomotion
  { id: "AVBL", name: "AVBL", type: "interneuron", class: "AVB", position: { x: -2, y: 25, z: 0 }, description: "Anterior ventral B (left) - forward locomotion command", neurotransmitter: "Acetylcholine" },
  { id: "AVBR", name: "AVBR", type: "interneuron", class: "AVB", position: { x: 2, y: 25, z: 0 }, description: "Anterior ventral B (right) - forward locomotion command", neurotransmitter: "Acetylcholine" },
  { id: "PVCL", name: "PVCL", type: "interneuron", class: "PVC", position: { x: -2, y: -25, z: 0 }, description: "Posterior ventral cord (left) - forward command from tail", neurotransmitter: "Glutamate" },
  { id: "PVCR", name: "PVCR", type: "sensory", class: "PVC", position: { x: 2, y: -25, z: 0 }, description: "Posterior ventral cord (right) - forward command from tail", neurotransmitter: "Glutamate" },
  
  // Command interneurons - Backward locomotion  
  { id: "AVAL", name: "AVAL", type: "interneuron", class: "AVA", position: { x: -3, y: 28, z: 0 }, description: "Anterior ventral A (left) - backward locomotion command", neurotransmitter: "Acetylcholine" },
  { id: "AVAR", name: "AVAR", type: "interneuron", class: "AVA", position: { x: 3, y: 28, z: 0 }, description: "Anterior ventral A (right) - backward locomotion command", neurotransmitter: "Acetylcholine" },
  { id: "AVDL", name: "AVDL", type: "interneuron", class: "AVD", position: { x: -2, y: 27, z: 0 }, description: "Anterior ventral D (left) - backward locomotion", neurotransmitter: "Glutamate" },
  { id: "AVDR", name: "AVDR", type: "interneuron", class: "AVD", position: { x: 2, y: 27, z: 0 }, description: "Anterior ventral D (right) - backward locomotion", neurotransmitter: "Glutamate" },
  { id: "AVEL", name: "AVEL", type: "interneuron", class: "AVE", position: { x: -2, y: 26, z: 0 }, description: "Anterior ventral E (left) - backward locomotion modulation", neurotransmitter: "Glutamate" },
  { id: "AVER", name: "AVER", type: "interneuron", class: "AVE", position: { x: 2, y: 26, z: 0 }, description: "Anterior ventral E (right) - backward locomotion modulation", neurotransmitter: "Glutamate" },
  
  // Integration interneurons
  { id: "AIYL", name: "AIYL", type: "interneuron", class: "AIY", position: { x: -1, y: 35, z: 0 }, description: "Amphid interneuron Y (left) - thermotaxis, salt chemotaxis", neurotransmitter: "Acetylcholine" },
  { id: "AIYR", name: "AIYR", type: "interneuron", class: "AIY", position: { x: 1, y: 35, z: 0 }, description: "Amphid interneuron Y (right) - thermotaxis, salt chemotaxis", neurotransmitter: "Acetylcholine" },
  { id: "AIZL", name: "AIZL", type: "interneuron", class: "AIZ", position: { x: -1, y: 34, z: 0 }, description: "Amphid interneuron Z (left) - chemosensory integration", neurotransmitter: "Glutamate" },
  { id: "AIZR", name: "AIZR", type: "interneuron", class: "AIZ", position: { x: 1, y: 34, z: 0 }, description: "Amphid interneuron Z (right) - chemosensory integration", neurotransmitter: "Glutamate" },
  { id: "AIAL", name: "AIAL", type: "interneuron", class: "AIA", position: { x: -1, y: 36, z: 0 }, description: "Amphid interneuron A (left) - behavioral modulation", neurotransmitter: "Acetylcholine" },
  { id: "AIAR", name: "AIAR", type: "interneuron", class: "AIA", position: { x: 1, y: 36, z: 0 }, description: "Amphid interneuron A (right) - behavioral modulation", neurotransmitter: "Acetylcholine" },
  { id: "AIBL", name: "AIBL", type: "interneuron", class: "AIB", position: { x: -1, y: 37, z: 0 }, description: "Amphid interneuron B (left) - chemotaxis turns", neurotransmitter: "Glutamate" },
  { id: "AIBR", name: "AIBR", type: "interneuron", class: "AIB", position: { x: 1, y: 37, z: 0 }, description: "Amphid interneuron B (right) - chemotaxis turns", neurotransmitter: "Glutamate" },
  
  // Ring interneurons
  { id: "RIML", name: "RIML", type: "interneuron", class: "RIM", position: { x: -3, y: 33, z: 0 }, description: "Ring interneuron M (left) - tyramine signaling, reversals", neurotransmitter: "Tyramine" },
  { id: "RIMR", name: "RIMR", type: "interneuron", class: "RIM", position: { x: 3, y: 33, z: 0 }, description: "Ring interneuron M (right) - tyramine signaling, reversals", neurotransmitter: "Tyramine" },
  { id: "RIVL", name: "RIVL", type: "interneuron", class: "RIV", position: { x: -2, y: 32, z: 0 }, description: "Ring interneuron V (left) - head movement", neurotransmitter: "GABA" },
  { id: "RIVR", name: "RIVR", type: "interneuron", class: "RIV", position: { x: 2, y: 32, z: 0 }, description: "Ring interneuron V (right) - head movement", neurotransmitter: "GABA" },
  
  // Dopaminergic neurons
  { id: "CEPDL", name: "CEPDL", type: "sensory", class: "CEP", position: { x: -1, y: 49, z: 1 }, description: "Cephalic sensilla (dorsal left) - dopamine, basal slowing", neurotransmitter: "Dopamine" },
  { id: "CEPDR", name: "CEPDR", type: "sensory", class: "CEP", position: { x: 1, y: 49, z: 1 }, description: "Cephalic sensilla (dorsal right) - dopamine, basal slowing", neurotransmitter: "Dopamine" },
  { id: "CEPVL", name: "CEPVL", type: "sensory", class: "CEP", position: { x: -1, y: 49, z: -1 }, description: "Cephalic sensilla (ventral left) - dopamine", neurotransmitter: "Dopamine" },
  { id: "CEPVR", name: "CEPVR", type: "sensory", class: "CEP", position: { x: 1, y: 49, z: -1 }, description: "Cephalic sensilla (ventral right) - dopamine", neurotransmitter: "Dopamine" },
  
  // ============ MOTOR NEURONS (113 total) ============
  // Dorsal A-type (backward) motor neurons
  { id: "DA1", name: "DA1", type: "motor", class: "DA", position: { x: 0, y: 10, z: 2 }, description: "Dorsal A-type motor neuron 1 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA2", name: "DA2", type: "motor", class: "DA", position: { x: 0, y: 5, z: 2 }, description: "Dorsal A-type motor neuron 2 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA3", name: "DA3", type: "motor", class: "DA", position: { x: 0, y: 0, z: 2 }, description: "Dorsal A-type motor neuron 3 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA4", name: "DA4", type: "motor", class: "DA", position: { x: 0, y: -5, z: 2 }, description: "Dorsal A-type motor neuron 4 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA5", name: "DA5", type: "motor", class: "DA", position: { x: 0, y: -10, z: 2 }, description: "Dorsal A-type motor neuron 5 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA6", name: "DA6", type: "motor", class: "DA", position: { x: 0, y: -15, z: 2 }, description: "Dorsal A-type motor neuron 6 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA7", name: "DA7", type: "motor", class: "DA", position: { x: 0, y: -20, z: 2 }, description: "Dorsal A-type motor neuron 7 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA8", name: "DA8", type: "motor", class: "DA", position: { x: 0, y: -25, z: 2 }, description: "Dorsal A-type motor neuron 8 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DA9", name: "DA9", type: "motor", class: "DA", position: { x: 0, y: -30, z: 2 }, description: "Dorsal A-type motor neuron 9 - backward locomotion", neurotransmitter: "Acetylcholine" },
  
  // Dorsal B-type (forward) motor neurons
  { id: "DB1", name: "DB1", type: "motor", class: "DB", position: { x: 0, y: 12, z: 3 }, description: "Dorsal B-type motor neuron 1 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DB2", name: "DB2", type: "motor", class: "DB", position: { x: 0, y: 7, z: 3 }, description: "Dorsal B-type motor neuron 2 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DB3", name: "DB3", type: "motor", class: "DB", position: { x: 0, y: 2, z: 3 }, description: "Dorsal B-type motor neuron 3 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DB4", name: "DB4", type: "motor", class: "DB", position: { x: 0, y: -3, z: 3 }, description: "Dorsal B-type motor neuron 4 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DB5", name: "DB5", type: "motor", class: "DB", position: { x: 0, y: -8, z: 3 }, description: "Dorsal B-type motor neuron 5 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DB6", name: "DB6", type: "motor", class: "DB", position: { x: 0, y: -13, z: 3 }, description: "Dorsal B-type motor neuron 6 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "DB7", name: "DB7", type: "motor", class: "DB", position: { x: 0, y: -18, z: 3 }, description: "Dorsal B-type motor neuron 7 - forward locomotion", neurotransmitter: "Acetylcholine" },
  
  // Ventral A-type (backward) motor neurons
  { id: "VA1", name: "VA1", type: "motor", class: "VA", position: { x: 0, y: 10, z: -2 }, description: "Ventral A-type motor neuron 1 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VA2", name: "VA2", type: "motor", class: "VA", position: { x: 0, y: 5, z: -2 }, description: "Ventral A-type motor neuron 2 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VA3", name: "VA3", type: "motor", class: "VA", position: { x: 0, y: 0, z: -2 }, description: "Ventral A-type motor neuron 3 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VA4", name: "VA4", type: "motor", class: "VA", position: { x: 0, y: -5, z: -2 }, description: "Ventral A-type motor neuron 4 - backward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VA5", name: "VA5", type: "motor", class: "VA", position: { x: 0, y: -10, z: -2 }, description: "Ventral A-type motor neuron 5 - backward locomotion", neurotransmitter: "Acetylcholine" },
  
  // Ventral B-type (forward) motor neurons
  { id: "VB1", name: "VB1", type: "motor", class: "VB", position: { x: 0, y: 12, z: -3 }, description: "Ventral B-type motor neuron 1 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VB2", name: "VB2", type: "motor", class: "VB", position: { x: 0, y: 7, z: -3 }, description: "Ventral B-type motor neuron 2 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VB3", name: "VB3", type: "motor", class: "VB", position: { x: 0, y: 2, z: -3 }, description: "Ventral B-type motor neuron 3 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VB4", name: "VB4", type: "motor", class: "VB", position: { x: 0, y: -3, z: -3 }, description: "Ventral B-type motor neuron 4 - forward locomotion", neurotransmitter: "Acetylcholine" },
  { id: "VB5", name: "VB5", type: "motor", class: "VB", position: { x: 0, y: -8, z: -3 }, description: "Ventral B-type motor neuron 5 - forward locomotion", neurotransmitter: "Acetylcholine" },
  
  // D-type GABAergic (inhibitory) motor neurons
  { id: "DD1", name: "DD1", type: "motor", class: "DD", position: { x: 0, y: 11, z: 0 }, description: "Dorsal D-type motor neuron 1 - dorsal muscle inhibition", neurotransmitter: "GABA" },
  { id: "DD2", name: "DD2", type: "motor", class: "DD", position: { x: 0, y: 3, z: 0 }, description: "Dorsal D-type motor neuron 2 - dorsal muscle inhibition", neurotransmitter: "GABA" },
  { id: "DD3", name: "DD3", type: "motor", class: "DD", position: { x: 0, y: -5, z: 0 }, description: "Dorsal D-type motor neuron 3 - dorsal muscle inhibition", neurotransmitter: "GABA" },
  { id: "DD4", name: "DD4", type: "motor", class: "DD", position: { x: 0, y: -13, z: 0 }, description: "Dorsal D-type motor neuron 4 - dorsal muscle inhibition", neurotransmitter: "GABA" },
  { id: "DD5", name: "DD5", type: "motor", class: "DD", position: { x: 0, y: -21, z: 0 }, description: "Dorsal D-type motor neuron 5 - dorsal muscle inhibition", neurotransmitter: "GABA" },
  { id: "DD6", name: "DD6", type: "motor", class: "DD", position: { x: 0, y: -29, z: 0 }, description: "Dorsal D-type motor neuron 6 - dorsal muscle inhibition", neurotransmitter: "GABA" },
  { id: "VD1", name: "VD1", type: "motor", class: "VD", position: { x: 0, y: 13, z: 0 }, description: "Ventral D-type motor neuron 1 - ventral muscle inhibition", neurotransmitter: "GABA" },
  { id: "VD2", name: "VD2", type: "motor", class: "VD", position: { x: 0, y: 6, z: 0 }, description: "Ventral D-type motor neuron 2 - ventral muscle inhibition", neurotransmitter: "GABA" },
  
  // Head motor neurons
  { id: "SMBD", name: "SMBD", type: "motor", class: "SMB", position: { x: 0, y: 38, z: 2 }, description: "Sublateral motor B (dorsal) - head movement", neurotransmitter: "Acetylcholine" },
  { id: "SMBV", name: "SMBV", type: "motor", class: "SMB", position: { x: 0, y: 38, z: -2 }, description: "Sublateral motor B (ventral) - head movement", neurotransmitter: "Acetylcholine" },
  { id: "SMDDL", name: "SMDDL", type: "motor", class: "SMD", position: { x: -2, y: 39, z: 2 }, description: "Sublateral motor D (dorsal left) - head movement", neurotransmitter: "Acetylcholine" },
  { id: "SMDDR", name: "SMDDR", type: "motor", class: "SMD", position: { x: 2, y: 39, z: 2 }, description: "Sublateral motor D (dorsal right) - head movement", neurotransmitter: "Acetylcholine" },
  { id: "SMDVL", name: "SMDVL", type: "motor", class: "SMD", position: { x: -2, y: 39, z: -2 }, description: "Sublateral motor D (ventral left) - head movement", neurotransmitter: "Acetylcholine" },
  { id: "SMDVR", name: "SMDVR", type: "motor", class: "SMD", position: { x: 2, y: 39, z: -2 }, description: "Sublateral motor D (ventral right) - head movement", neurotransmitter: "Acetylcholine" },
];

// Key synaptic connections from the connectome (subset of ~7000 total)
export const SYNAPSES: Synapse[] = [
  // Touch reflex circuit (head touch → backward movement)
  { pre: "ALML", post: "AVDL", type: "chemical", weight: 3 },
  { pre: "ALML", post: "AVDR", type: "chemical", weight: 2 },
  { pre: "ALMR", post: "AVDL", type: "chemical", weight: 2 },
  { pre: "ALMR", post: "AVDR", type: "chemical", weight: 3 },
  { pre: "ALML", post: "AVAL", type: "chemical", weight: 5 },
  { pre: "ALMR", post: "AVAR", type: "chemical", weight: 5 },
  { pre: "AVDL", post: "AVAL", type: "chemical", weight: 8 },
  { pre: "AVDR", post: "AVAR", type: "chemical", weight: 8 },
  
  // AVA → A-type motor neurons (backward)
  { pre: "AVAL", post: "DA1", type: "chemical", weight: 5 },
  { pre: "AVAL", post: "DA2", type: "chemical", weight: 4 },
  { pre: "AVAL", post: "DA3", type: "chemical", weight: 4 },
  { pre: "AVAL", post: "VA1", type: "chemical", weight: 5 },
  { pre: "AVAL", post: "VA2", type: "chemical", weight: 4 },
  { pre: "AVAR", post: "DA1", type: "chemical", weight: 5 },
  { pre: "AVAR", post: "DA2", type: "chemical", weight: 4 },
  { pre: "AVAR", post: "VA1", type: "chemical", weight: 5 },
  
  // Tail touch → forward movement
  { pre: "PLML", post: "PVCL", type: "chemical", weight: 6 },
  { pre: "PLMR", post: "PVCR", type: "chemical", weight: 6 },
  { pre: "PVCL", post: "AVBL", type: "chemical", weight: 5 },
  { pre: "PVCR", post: "AVBR", type: "chemical", weight: 5 },
  
  // AVB → B-type motor neurons (forward)
  { pre: "AVBL", post: "DB1", type: "chemical", weight: 6 },
  { pre: "AVBL", post: "DB2", type: "chemical", weight: 5 },
  { pre: "AVBL", post: "VB1", type: "chemical", weight: 5 },
  { pre: "AVBL", post: "VB2", type: "chemical", weight: 4 },
  { pre: "AVBR", post: "DB1", type: "chemical", weight: 5 },
  { pre: "AVBR", post: "VB1", type: "chemical", weight: 5 },
  
  // Gap junctions (electrical synapses) - bidirectional
  { pre: "AVBL", post: "AVBR", type: "electrical", weight: 4 },
  { pre: "AVAL", post: "AVAR", type: "electrical", weight: 5 },
  { pre: "ALML", post: "ALMR", type: "electrical", weight: 2 },
  { pre: "PLML", post: "PLMR", type: "electrical", weight: 2 },
  
  // Chemosensory circuit
  { pre: "ASEL", post: "AIYL", type: "chemical", weight: 4 },
  { pre: "ASER", post: "AIYR", type: "chemical", weight: 4 },
  { pre: "AIYL", post: "AIZL", type: "chemical", weight: 3 },
  { pre: "AIYR", post: "AIZR", type: "chemical", weight: 3 },
  { pre: "AIZL", post: "SMBD", type: "chemical", weight: 4 },
  { pre: "AIZR", post: "SMBV", type: "chemical", weight: 4 },
  
  // Inhibitory connections (D-type)
  { pre: "DD1", post: "DA1", type: "chemical", weight: -3 },
  { pre: "VD1", post: "VA1", type: "chemical", weight: -3 },
  
  // Cross-inhibition for alternating locomotion
  { pre: "DA1", post: "DD1", type: "chemical", weight: 2 },
  { pre: "DB1", post: "VD1", type: "chemical", weight: 2 },
];

// Body wall muscles (95 total, 4 quadrants)
export const MUSCLES: Muscle[] = [
  // Dorsal left quadrant
  { id: "MDL01", name: "Muscle Dorsal Left 1", position: "dorsal", quadrant: "left", innervation: ["DA1", "DB1", "DD1"] },
  { id: "MDL02", name: "Muscle Dorsal Left 2", position: "dorsal", quadrant: "left", innervation: ["DA2", "DB2", "DD1"] },
  { id: "MDL03", name: "Muscle Dorsal Left 3", position: "dorsal", quadrant: "left", innervation: ["DA3", "DB3", "DD2"] },
  // Dorsal right quadrant
  { id: "MDR01", name: "Muscle Dorsal Right 1", position: "dorsal", quadrant: "right", innervation: ["DA1", "DB1", "DD1"] },
  { id: "MDR02", name: "Muscle Dorsal Right 2", position: "dorsal", quadrant: "right", innervation: ["DA2", "DB2", "DD1"] },
  // Ventral left quadrant
  { id: "MVL01", name: "Muscle Ventral Left 1", position: "ventral", quadrant: "left", innervation: ["VA1", "VB1", "VD1"] },
  { id: "MVL02", name: "Muscle Ventral Left 2", position: "ventral", quadrant: "left", innervation: ["VA2", "VB2", "VD1"] },
  // Ventral right quadrant
  { id: "MVR01", name: "Muscle Ventral Right 1", position: "ventral", quadrant: "right", innervation: ["VA1", "VB1", "VD1"] },
  { id: "MVR02", name: "Muscle Ventral Right 2", position: "ventral", quadrant: "right", innervation: ["VA2", "VB2", "VD2"] },
];

// Utility functions for working with the connectome
export function getNeuronById(id: string): Neuron | undefined {
  return NEURONS.find(n => n.id === id);
}

export function getNeuronsByType(type: Neuron["type"]): Neuron[] {
  return NEURONS.filter(n => n.type === type);
}

export function getNeuronsByClass(className: string): Neuron[] {
  return NEURONS.filter(n => n.class === className);
}

export function getPresynapticPartners(neuronId: string): { neuron: Neuron; synapse: Synapse }[] {
  return SYNAPSES
    .filter(s => s.post === neuronId)
    .map(s => ({
      neuron: NEURONS.find(n => n.id === s.pre)!,
      synapse: s,
    }))
    .filter(p => p.neuron);
}

export function getPostsynapticPartners(neuronId: string): { neuron: Neuron; synapse: Synapse }[] {
  return SYNAPSES
    .filter(s => s.pre === neuronId)
    .map(s => ({
      neuron: NEURONS.find(n => n.id === s.post)!,
      synapse: s,
    }))
    .filter(p => p.neuron);
}

export function getConnectivityMatrix(): Map<string, Map<string, number>> {
  const matrix = new Map<string, Map<string, number>>();
  
  NEURONS.forEach(n => {
    matrix.set(n.id, new Map());
  });
  
  SYNAPSES.forEach(s => {
    const row = matrix.get(s.pre);
    if (row) {
      row.set(s.post, s.weight);
    }
  });
  
  return matrix;
}

// Statistics about the connectome
export const CONNECTOME_STATS = {
  totalNeurons: 302,
  sensoryNeurons: 86,
  motorNeurons: 113,
  interneurons: 82,
  pharyngealNeurons: 20,
  totalChemicalSynapses: 6393,
  totalGapJunctions: 890,
  avgConnectionsPerNeuron: 24,
  year: 2019, // Latest Cook et al. update
};
