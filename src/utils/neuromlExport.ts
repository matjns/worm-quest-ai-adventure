// NeuroML Export Utility
// Exports user circuits to NeuroML 2.x format compatible with OpenWorm tools

import { NEURON_PALETTE, type ConnectionData } from "@/data/neuronData";

interface PlacedNeuron {
  id: string;
  type: string;
  x?: number;
  y?: number;
}

interface ExportOptions {
  title: string;
  description?: string;
  author?: string;
  includePositions?: boolean;
}

// NeuroML neuron type mapping
const NEUROML_CELL_TYPES: Record<string, string> = {
  sensory: "GenericNeuronCell",
  motor: "GenericMotorNeuron", 
  interneuron: "GenericInterneuron",
  command: "GenericCommandNeuron",
};

// Neurotransmitter mapping based on OpenWorm data
const NEUROTRANSMITTER_MAP: Record<string, string> = {
  ALML: "glutamate",
  ALMR: "glutamate",
  PLML: "glutamate",
  PLMR: "glutamate",
  AVM: "glutamate",
  ASEL: "glutamate",
  ASER: "glutamate",
  AWC: "glutamate",
  AVAL: "acetylcholine",
  AVAR: "acetylcholine",
  AVBL: "acetylcholine",
  AVBR: "acetylcholine",
  AVDL: "glutamate",
  AVDR: "glutamate",
  AIYL: "acetylcholine",
  AIYR: "acetylcholine",
  AIZL: "glutamate",
  AIZR: "glutamate",
  RIM: "tyramine",
  DA1: "acetylcholine",
  DA2: "acetylcholine",
  DB1: "acetylcholine",
  DB2: "acetylcholine",
  VA1: "acetylcholine",
  VB1: "acetylcholine",
  SMBD: "acetylcholine",
  SMBV: "acetylcholine",
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Export circuit to NeuroML 2.x format
 */
export function exportToNeuroML(
  neurons: PlacedNeuron[],
  connections: ConnectionData[],
  options: ExportOptions
): string {
  const { title, description, author, includePositions } = options;
  const networkId = title.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  
  // Build cell definitions
  const cellDefinitions = neurons.map(neuron => {
    const neuronData = NEURON_PALETTE.find(n => n.id === neuron.id);
    const cellType = NEUROML_CELL_TYPES[neuron.type] || "GenericNeuronCell";
    const neurotransmitter = NEUROTRANSMITTER_MAP[neuron.id] || "acetylcholine";
    
    return `    <!-- ${escapeXml(neuronData?.description || neuron.id)} -->
    <cell id="${neuron.id}">
      <notes>${escapeXml(neuronData?.description || `${neuron.type} neuron`)}</notes>
      <annotation>
        <property tag="neuronType" value="${neuron.type}"/>
        <property tag="neurotransmitter" value="${neurotransmitter}"/>
        <property tag="function" value="${escapeXml(neuronData?.function || "unknown")}"/>
      </annotation>
      <morphology id="${neuron.id}_morphology">
        <segment id="0" name="soma">
          <proximal x="0" y="0" z="0" diameter="5"/>
          <distal x="0" y="0" z="0" diameter="5"/>
        </segment>
      </morphology>
      <biophysicalProperties id="${neuron.id}_properties">
        <membraneProperties>
          <channelDensity condDensity="0.3mS_per_cm2" id="leak" ionChannel="pas" erev="-65mV"/>
          <specificCapacitance value="1.0uF_per_cm2"/>
          <initMembPotential value="-65mV"/>
        </membraneProperties>
        <intracellularProperties>
          <resistivity value="100ohm_cm"/>
        </intracellularProperties>
      </biophysicalProperties>
    </cell>`;
  }).join("\n\n");

  // Build population entries
  const populations = neurons.map((neuron, idx) => {
    const position = includePositions && neuron.x !== undefined && neuron.y !== undefined
      ? `\n        <instance id="0">
          <location x="${neuron.x}" y="${neuron.y}" z="0"/>
        </instance>`
      : "";
    
    return `      <population id="${neuron.id}_pop" component="${neuron.id}" size="1" type="populationList">${position}
      </population>`;
  }).join("\n\n");

  // Build synaptic projections
  const projections = connections.map((conn, idx) => {
    const preNt = NEUROTRANSMITTER_MAP[conn.from] || "acetylcholine";
    const synapseType = conn.type === "electrical" ? "gapJunction" : `${preNt}Synapse`;
    const weight = conn.weight / 10; // Normalize weight to 0-1.5 range
    
    return `      <projection id="proj_${conn.from}_to_${conn.to}" presynapticPopulation="${conn.from}_pop" postsynapticPopulation="${conn.to}_pop" synapse="${synapseType}">
        <connection id="0" preCellId="../${conn.from}_pop/0" postCellId="../${conn.to}_pop/0"/>
        <annotation>
          <property tag="weight" value="${weight.toFixed(2)}"/>
          <property tag="synapseType" value="${conn.type}"/>
        </annotation>
      </projection>`;
  }).join("\n\n");

  // Build synapse type definitions
  const synapseTypes = new Set<string>();
  connections.forEach(conn => {
    const nt = NEUROTRANSMITTER_MAP[conn.from] || "acetylcholine";
    if (conn.type === "electrical") {
      synapseTypes.add("gapJunction");
    } else {
      synapseTypes.add(`${nt}Synapse`);
    }
  });

  const synapseDefinitions = Array.from(synapseTypes).map(synType => {
    if (synType === "gapJunction") {
      return `    <gapJunction id="gapJunction" conductance="10pS"/>`;
    }
    const nt = synType.replace("Synapse", "");
    const erev = nt === "GABA" ? "-80mV" : "0mV";
    return `    <expTwoSynapse id="${synType}" gbase="1nS" erev="${erev}" tauRise="0.5ms" tauDecay="10ms"/>`;
  }).join("\n");

  // Assemble full NeuroML document
  const neuroml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  NeuroML 2.x Export from OpenWorm Circuit Designer
  Generated: ${formatDate()}
  ${author ? `Author: ${escapeXml(author)}` : ""}
  
  This file can be imported into:
  - OpenWorm c302 framework
  - NEURON simulator (via jNeuroML)
  - Brian2 (via NeuroML import)
  - NetPyNE
  - MOOSE
  
  For more information: https://neuroml.org
-->
<neuroml xmlns="http://www.neuroml.org/schema/neuroml2"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.neuroml.org/schema/neuroml2 https://raw.githubusercontent.com/NeuroML/NeuroML2/master/Schemas/NeuroML2/NeuroML_v2.3.xsd"
         id="${networkId}">

  <notes>${escapeXml(description || `Neural circuit: ${title}`)}</notes>

  <!-- ============================================ -->
  <!-- Ion Channels                                 -->
  <!-- ============================================ -->
  
  <ionChannelHH id="pas" conductance="10pS">
    <notes>Passive leak channel</notes>
  </ionChannelHH>

  <!-- ============================================ -->
  <!-- Synapse Types                                -->
  <!-- ============================================ -->

${synapseDefinitions}

  <!-- ============================================ -->
  <!-- Cell Definitions                             -->
  <!-- Based on OpenWorm C. elegans connectome      -->
  <!-- ============================================ -->

${cellDefinitions}

  <!-- ============================================ -->
  <!-- Network Definition                           -->
  <!-- ============================================ -->
  
  <network id="${networkId}_network" type="networkWithTemperature" temperature="20degC">
    <notes>
      Neural circuit exported from OpenWorm Circuit Designer.
      Contains ${neurons.length} neurons and ${connections.length} synaptic connections.
      Based on the C. elegans connectome from the OpenWorm project.
    </notes>

    <!-- Neuron Populations -->
${populations}

    <!-- Synaptic Projections -->
${projections}

  </network>

  <!-- ============================================ -->
  <!-- Simulation Configuration                     -->
  <!-- ============================================ -->
  
  <Simulation id="${networkId}_sim" length="1000ms" step="0.025ms" target="${networkId}_network">
    <OutputFile id="output" fileName="${networkId}_results.dat">
${neurons.map(n => `      <OutputColumn id="${n.id}_v" quantity="${n.id}_pop/0/${n.id}/0/v"/>`).join("\n")}
    </OutputFile>
  </Simulation>

</neuroml>`;

  return neuroml;
}

/**
 * Export circuit to LEMS simulation file (companion to NeuroML)
 */
export function exportToLEMS(
  networkId: string,
  duration: number = 1000,
  stepSize: number = 0.025
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  LEMS Simulation File for ${networkId}
  Use with jNeuroML: jnml ${networkId}.xml
-->
<Lems>
  <Include file="${networkId}.nml"/>
  
  <Target component="${networkId}_sim"/>
  
  <Display id="display" title="Membrane Potentials" timeScale="1ms" xmin="0" xmax="${duration}" ymin="-80" ymax="50">
    <!-- Add traces for each neuron -->
  </Display>
</Lems>`;
}

/**
 * Download NeuroML file
 */
export function downloadNeuroML(
  neurons: PlacedNeuron[],
  connections: ConnectionData[],
  options: ExportOptions
): void {
  const neuroml = exportToNeuroML(neurons, connections, options);
  const filename = `${options.title.replace(/\s+/g, "_").toLowerCase()}.nml`;
  
  const blob = new Blob([neuroml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validate circuit for NeuroML export
 */
export function validateForExport(
  neurons: PlacedNeuron[],
  connections: ConnectionData[]
): { valid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (neurons.length === 0) {
    errors.push("Circuit must have at least one neuron");
  }

  if (neurons.length > 0 && connections.length === 0) {
    warnings.push("Circuit has no connections - simulation may not produce interesting results");
  }

  // Check for orphan neurons (no connections)
  const connectedNeurons = new Set<string>();
  connections.forEach(c => {
    connectedNeurons.add(c.from);
    connectedNeurons.add(c.to);
  });
  
  const orphans = neurons.filter(n => !connectedNeurons.has(n.id));
  if (orphans.length > 0) {
    warnings.push(`${orphans.length} neuron(s) have no connections: ${orphans.map(n => n.id).join(", ")}`);
  }

  // Check for missing neurons in connections
  const neuronIds = new Set(neurons.map(n => n.id));
  connections.forEach(c => {
    if (!neuronIds.has(c.from)) {
      errors.push(`Connection references missing neuron: ${c.from}`);
    }
    if (!neuronIds.has(c.to)) {
      errors.push(`Connection references missing neuron: ${c.to}`);
    }
  });

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
