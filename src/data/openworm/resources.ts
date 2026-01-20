/**
 * OpenWorm Research Resources & Educational Content
 * 
 * Curated collection of OpenWorm's publicly available research materials,
 * documentation, and educational resources for classroom use.
 */

// OpenWorm GitHub repositories with educational value
export const OPENWORM_REPOSITORIES = [
  {
    name: "OpenWorm",
    url: "https://github.com/openworm/OpenWorm",
    description: "Main repository coordinating the OpenWorm project",
    educationalValue: "Understanding open-source scientific collaboration",
    topics: ["project-management", "open-science", "collaboration"],
  },
  {
    name: "c302",
    url: "https://github.com/openworm/c302",
    description: "Framework for generating network models of C. elegans nervous system",
    educationalValue: "Learn how scientists model neural networks from connectome data",
    topics: ["neural-networks", "computational-biology", "python"],
    dataFormats: ["NeuroML", "LEMS", "Python"],
  },
  {
    name: "sibernetic",
    url: "https://github.com/openworm/sibernetic",
    description: "Physics engine for worm body simulation using SPH",
    educationalValue: "Understand fluid dynamics and biomechanics",
    topics: ["physics-simulation", "SPH", "C++", "CUDA"],
    dataFormats: ["C++", "OpenCL"],
  },
  {
    name: "CElegansNeuroML",
    url: "https://github.com/openworm/CElegansNeuroML",
    description: "NeuroML models of C. elegans neurons and networks",
    educationalValue: "Standard format for describing neural models",
    topics: ["neuroml", "connectome", "neurons"],
    dataFormats: ["NeuroML", "XML"],
  },
  {
    name: "muscle_model",
    url: "https://github.com/openworm/muscle_model",
    description: "Detailed models of C. elegans muscle cells",
    educationalValue: "Understanding how muscles work at cellular level",
    topics: ["muscle-physiology", "ion-channels", "electrophysiology"],
  },
  {
    name: "Blender2NeuroML",
    url: "https://github.com/openworm/Blender2NeuroML",
    description: "Tools to convert 3D models to NeuroML format",
    educationalValue: "Learn about 3D modeling in science",
    topics: ["3D-modeling", "blender", "visualization"],
  },
];

// Educational video resources
export const EDUCATIONAL_VIDEOS = [
  {
    id: "openworm-intro",
    title: "OpenWorm Project Overview",
    url: "https://www.youtube.com/watch?v=z6hNT8yyNVQ",
    duration: "10:32",
    description: "Introduction to the OpenWorm project and its goals",
    topics: ["introduction", "open-science"],
    gradeLevel: ["middle", "high"],
  },
  {
    id: "connectome-explained",
    title: "The Connectome: Mapping the Brain",
    url: "https://www.youtube.com/watch?v=HA7GwKXfJB0",
    duration: "5:21",
    description: "What is a connectome and why does it matter?",
    topics: ["connectome", "neuroscience"],
    gradeLevel: ["k5", "middle", "high"],
  },
  {
    id: "elegans-behavior",
    title: "C. elegans Behavior & Nervous System",
    url: "https://www.youtube.com/watch?v=4gQbKagRxwg",
    duration: "8:45",
    description: "How 302 neurons create complex behaviors",
    topics: ["behavior", "neurons", "biology"],
    gradeLevel: ["middle", "high"],
  },
  {
    id: "sibernetic-demo",
    title: "Sibernetic: Simulating the Worm Body",
    url: "https://www.youtube.com/watch?v=QV7CDmb0-2M",
    duration: "3:12",
    description: "See the physics engine that simulates worm movement",
    topics: ["physics", "simulation", "computer-science"],
    gradeLevel: ["high"],
  },
];

// Key scientific papers (simplified for education)
export const KEY_PAPERS = [
  {
    id: "white1986",
    title: "The Mind of a Worm",
    authors: "White et al.",
    year: 1986,
    journal: "Philosophical Transactions B",
    significance: "First complete connectome of any organism",
    simpleSummary: "Scientists spent 14 years mapping every single neuron and connection in C. elegans using electron microscopy. This paper is the foundation of everything we know about the worm's brain.",
    keyFinding: "C. elegans has exactly 302 neurons and ~7,000 synaptic connections",
    gradeLevel: "high",
  },
  {
    id: "varshney2011",
    title: "Structural Properties of the C. elegans Neuronal Network",
    authors: "Varshney et al.",
    year: 2011,
    journal: "PLoS Computational Biology",
    significance: "Updated connectome with network analysis",
    simpleSummary: "Researchers used modern computers to analyze the original connectome data and discover patterns - like how the brain is organized into modules for different functions.",
    keyFinding: "The connectome has 'small-world' network properties like the internet",
    gradeLevel: "high",
  },
  {
    id: "cook2019",
    title: "Whole-animal connectomes of both C. elegans sexes",
    authors: "Cook et al.",
    year: 2019,
    journal: "Nature",
    significance: "Most complete connectome with male and hermaphrodite",
    simpleSummary: "Using better technology, scientists mapped both types of C. elegans (male and hermaphrodite) and found differences in how their brains are wired for different behaviors.",
    keyFinding: "Sexual differences in brain wiring explain behavioral differences",
    gradeLevel: "high",
  },
  {
    id: "szigeti2014",
    title: "OpenWorm: an open-science approach to modeling C. elegans",
    authors: "Szigeti et al.",
    year: 2014,
    journal: "Frontiers in Computational Neuroscience",
    significance: "Describes the OpenWorm project methodology",
    simpleSummary: "This paper explains how scientists from around the world are working together, sharing their code and data openly, to create a complete digital worm.",
    keyFinding: "Open-source collaboration can accelerate scientific discovery",
    gradeLevel: "middle",
  },
];

// Classroom activities aligned with NGSS standards
export const CLASSROOM_ACTIVITIES = [
  {
    id: "circuit-detective",
    title: "Circuit Detective",
    duration: "45 minutes",
    gradeLevel: ["middle"],
    ngssStandards: ["MS-LS1-8", "MS-ETS1-4"],
    materials: ["Computer with NeuroQuest", "Worksheet"],
    objective: "Students will trace neural pathways to understand stimulus-response relationships",
    procedure: [
      "Introduce the concept of neural circuits using the touch reflex example",
      "Have students play Mission 1-3 in NeuroQuest",
      "Students document which neurons they used and why",
      "Class discussion: How is this similar to how your brain works?",
    ],
    assessment: "Students can correctly identify sensory, interneuron, and motor neuron roles",
  },
  {
    id: "data-scientist",
    title: "Be a Data Scientist",
    duration: "60 minutes",
    gradeLevel: ["high"],
    ngssStandards: ["HS-LS1-2", "HS-ETS1-4"],
    materials: ["Computer with spreadsheet", "Connectome data"],
    objective: "Students analyze real connectome data to identify patterns",
    procedure: [
      "Provide students with simplified connectome spreadsheet",
      "Students calculate: average connections per neuron, most connected neurons",
      "Create visualizations of connection patterns",
      "Compare student findings to published research",
    ],
    assessment: "Students can identify hub neurons and explain their importance",
  },
  {
    id: "design-challenge",
    title: "Engineer a Worm",
    duration: "90 minutes",
    gradeLevel: ["middle", "high"],
    ngssStandards: ["MS-ETS1-1", "MS-ETS1-2", "HS-ETS1-2"],
    materials: ["NeuroQuest", "Design journal"],
    objective: "Students apply engineering design process to create novel circuits",
    procedure: [
      "Present challenge: Design a circuit for a NEW behavior (e.g., following light)",
      "Students research which neurons might be involved",
      "Build and test circuits in NeuroQuest",
      "Iterate based on simulation feedback",
      "Present designs to class with scientific justification",
    ],
    assessment: "Students demonstrate iterative design and scientific reasoning",
  },
];

// NGSS alignment for the platform
export const NGSS_ALIGNMENT = {
  "MS-LS1-3": {
    standard: "Use argument supported by evidence for how the body is a system of interacting subsystems",
    howAddressed: "Students see how neurons, muscles, and sensory organs work together as a system",
  },
  "MS-LS1-8": {
    standard: "Gather and synthesize information that sensory receptors respond to stimuli",
    howAddressed: "Touch reflex missions show direct sensory-motor relationships",
  },
  "MS-ETS1-4": {
    standard: "Develop a model to generate data for iterative testing",
    howAddressed: "Circuit builder allows iterative model development and testing",
  },
  "HS-LS1-2": {
    standard: "Develop and use a model to illustrate hierarchical organization of systems",
    howAddressed: "Connectome explorer shows neurons → circuits → behaviors hierarchy",
  },
  "HS-ETS1-2": {
    standard: "Design a solution to a complex problem by breaking it down",
    howAddressed: "Complex behaviors are built from simple circuit modules",
  },
};

// Glossary for educational use
export const GLOSSARY = {
  connectome: {
    term: "Connectome",
    definition: "A complete map of all neural connections in a brain",
    simpleDefinition: "A wiring diagram of the brain showing how all neurons are connected",
    relatedTerms: ["synapse", "neuron", "neural network"],
  },
  synapse: {
    term: "Synapse",
    definition: "A junction between neurons where signals are transmitted",
    simpleDefinition: "The tiny gap where one neuron talks to another",
    relatedTerms: ["neurotransmitter", "action potential"],
  },
  neurotransmitter: {
    term: "Neurotransmitter",
    definition: "Chemical messengers that transmit signals across synapses",
    simpleDefinition: "Chemical messages neurons use to communicate",
    relatedTerms: ["synapse", "receptor", "acetylcholine"],
  },
  ganglion: {
    term: "Ganglion",
    definition: "A cluster of neuron cell bodies",
    simpleDefinition: "A group of neurons bundled together",
    relatedTerms: ["nerve ring", "nerve cord"],
  },
  chemotaxis: {
    term: "Chemotaxis",
    definition: "Movement in response to chemical gradients",
    simpleDefinition: "Moving toward or away from smells",
    relatedTerms: ["sensory neuron", "behavior"],
  },
  mechanosensation: {
    term: "Mechanosensation",
    definition: "Detection of mechanical stimuli like touch or pressure",
    simpleDefinition: "The sense of touch",
    relatedTerms: ["touch neuron", "reflex"],
  },
  gapJunction: {
    term: "Gap Junction",
    definition: "Electrical synapse allowing direct ion flow between neurons",
    simpleDefinition: "A direct electrical connection between neurons",
    relatedTerms: ["electrical synapse", "ion channel"],
  },
  actionPotential: {
    term: "Action Potential",
    definition: "The electrical signal that travels along a neuron",
    simpleDefinition: "The electrical 'spike' that carries information in neurons",
    relatedTerms: ["neuron", "ion channel", "depolarization"],
  },
};

// Fun facts for engagement
export const FUN_FACTS = [
  "C. elegans was the first multicellular organism to have its entire genome sequenced (1998).",
  "The worm has been to space! NASA sent C. elegans on the Space Shuttle Columbia in 2003.",
  "C. elegans can live for about 2-3 weeks, but some mutants can live 10x longer - helping us study aging.",
  "Every C. elegans hermaphrodite has exactly 959 cells. Scientists know the fate of every single cell!",
  "The worm can 'smell' in stereo - it compares chemical concentrations between its two nose-like structures.",
  "C. elegans can learn and remember! It can be trained to avoid certain smells for several hours.",
  "6 Nobel Prizes have been awarded for research done using C. elegans.",
  "OpenWorm is one of the first 'crowdsourced' science projects, with contributors from 30+ countries.",
  "The worm's 302 neurons create at least 15 distinct behaviors - more than many robots with millions of transistors!",
  "If you stretched out all the neurons in one worm, they would be about 1 meter long - 1000x the worm's body length.",
];
