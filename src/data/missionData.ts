// NeuroQuest Mission Definitions
// 5 missions for middle school level (grades 6-8)

import { WormBehavior } from "./neuronData";

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  goal: string;
  stimulus: "touch_head" | "touch_tail" | "smell_food" | "none";
  correctBehavior: WormBehavior;
  requiredNeurons: string[];
  recommendedNeurons: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  hints: string[];
  funFact: string;
  unlockRequirement: number; // previous mission ID that must be completed
  xpReward: number;
  badge: {
    name: string;
    icon: "trophy" | "star" | "zap" | "target" | "brain";
  };
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "The Lost Wiggle",
    subtitle: "Mission 1: Motor Basics",
    description: "Dr. Wormstein's C. elegans has forgotten how to move forward! The motor neurons are disconnected. Your mission: rebuild the basic movement circuit.",
    goal: "Connect motor neurons to make the worm move forward",
    stimulus: "none",
    correctBehavior: "move_forward",
    requiredNeurons: ["AVBL", "DB1"],
    recommendedNeurons: ["AVBL", "AVBR", "DB1", "VB1"],
    difficulty: 1,
    hints: [
      "Motor neurons need a signal from command neurons to work!",
      "The 'B-type' motor neurons (like DB1) control forward movement.",
      "Try connecting AVBL (forward command) to DB1 (forward motor)."
    ],
    funFact: "C. elegans has exactly 302 neurons - scientists have mapped every single one! That's called the 'connectome'.",
    unlockRequirement: 0,
    xpReward: 100,
    badge: { name: "Motor Master", icon: "zap" }
  },
  {
    id: 2,
    title: "Touch Detective",
    subtitle: "Mission 2: Sensory Reflex",
    description: "The worm ignores head-pokes! A touch to the head should trigger a backward escape response. Wire the touch circuit to restore this vital reflex.",
    goal: "Wire touch sensors so the worm reverses when touched on the head",
    stimulus: "touch_head",
    correctBehavior: "move_backward",
    requiredNeurons: ["ALML", "AVAL", "DA1"],
    recommendedNeurons: ["ALML", "ALMR", "AVAL", "AVAR", "DA1", "VA1"],
    difficulty: 2,
    hints: [
      "Touch neurons (ALM) detect the touch, but they can't directly control muscles.",
      "You need an interneuron between the sensor and motor!",
      "The AVA neurons are 'command' interneurons that tell the worm to go backward.",
      "Connect: touch sensor → command interneuron → backward motor"
    ],
    funFact: "This touch reflex helps C. elegans escape from predators in milliseconds - faster than you can blink!",
    unlockRequirement: 1,
    xpReward: 150,
    badge: { name: "Touch Reflex Pro", icon: "target" }
  },
  {
    id: 3,
    title: "Tail Escape",
    subtitle: "Mission 3: Opposite Reflex",
    description: "When touched on the tail, the worm should move FORWARD to escape. But currently it's frozen! Complete the posterior touch circuit.",
    goal: "Wire touch sensors so the worm moves forward when touched on the tail",
    stimulus: "touch_tail",
    correctBehavior: "move_forward",
    requiredNeurons: ["PLML", "AVBL", "DB1"],
    recommendedNeurons: ["PLML", "PLMR", "AVBL", "AVBR", "DB1", "VB1"],
    difficulty: 2,
    hints: [
      "Tail touch uses different sensory neurons than head touch (PLM instead of ALM).",
      "For forward movement, you need the 'B-type' command and motor neurons.",
      "Notice the pattern: sensory → command → motor, just like Mission 2!"
    ],
    funFact: "Head touch → backward. Tail touch → forward. This makes biological sense - always move AWAY from the threat!",
    unlockRequirement: 2,
    xpReward: 150,
    badge: { name: "Escape Artist", icon: "star" }
  },
  {
    id: 4,
    title: "Food Finder",
    subtitle: "Mission 4: Chemotaxis",
    description: "The worm can smell food but can't navigate toward it! Chemosensory neurons detect chemicals, but the processing circuit is broken.",
    goal: "Build a circuit that makes the worm navigate toward food smells",
    stimulus: "smell_food",
    correctBehavior: "head_wiggle",
    requiredNeurons: ["ASEL", "AIYL", "AIZL", "SMBD"],
    recommendedNeurons: ["ASEL", "ASER", "AIYL", "AIYR", "AIZL", "AIZR", "SMBD", "SMBV"],
    difficulty: 3,
    hints: [
      "Chemosensory neurons (ASE) can detect salt and other chemicals.",
      "Integration interneurons (AIY) help process the sensory information.",
      "Processing interneurons (AIZ) connect to head motor neurons.",
      "Head movements help the worm 'scan' for the strongest smell direction."
    ],
    funFact: "C. elegans can smell over 1,000 different odors! Scientists use them to study how brains process smells.",
    unlockRequirement: 3,
    xpReward: 200,
    badge: { name: "Chemical Detective", icon: "brain" }
  },
  {
    id: 5,
    title: "The Complete Worm",
    subtitle: "Mission 5: Integration Challenge",
    description: "Final challenge! Build a circuit that can respond to BOTH head touch AND tail touch correctly. Show you understand how the nervous system integrates multiple signals.",
    goal: "Create a circuit that moves backward on head touch AND forward on tail touch",
    stimulus: "touch_head", // Will test both stimuli
    correctBehavior: "move_backward",
    requiredNeurons: ["ALML", "PLML", "AVAL", "AVBL", "DA1", "DB1"],
    recommendedNeurons: ["ALML", "ALMR", "PLML", "PLMR", "AVAL", "AVAR", "AVBL", "AVBR", "DA1", "VA1", "DB1", "VB1"],
    difficulty: 5,
    hints: [
      "This circuit combines Missions 2 and 3!",
      "You need BOTH the backward AND forward pathways.",
      "The key is that different sensory neurons activate different command neurons.",
      "Make sure head touch → backward path, tail touch → forward path."
    ],
    funFact: "You've just built a simplified version of what took scientists decades to map. The full C. elegans connectome was completed in 2019!",
    unlockRequirement: 4,
    xpReward: 500,
    badge: { name: "Connectome Champion", icon: "trophy" }
  }
];

export const getMissionById = (id: number): Mission | undefined => {
  return MISSIONS.find(m => m.id === id);
};

export const getUnlockedMissions = (completedMissions: number[]): Mission[] => {
  return MISSIONS.filter(m => 
    m.unlockRequirement === 0 || completedMissions.includes(m.unlockRequirement)
  );
};

export const isMissionComplete = (
  userConnections: { from: string; to: string; weight: number }[],
  mission: Mission,
  behavior: WormBehavior
): boolean => {
  if (behavior !== mission.correctBehavior) return false;
  
  // Check that all required neurons are connected
  const connectedNeurons = new Set<string>();
  userConnections.forEach(c => {
    connectedNeurons.add(c.from);
    connectedNeurons.add(c.to);
  });
  
  return mission.requiredNeurons.every(n => connectedNeurons.has(n));
};
