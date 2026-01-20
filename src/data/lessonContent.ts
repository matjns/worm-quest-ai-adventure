// Comprehensive lesson content with real OpenWorm data and questions
// Sources: OpenWorm GitHub repos (c302, sibernetic, CElegansNeuroML), WormAtlas.org

export interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  points: number;
}

export interface LessonSection {
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  funFact?: string;
}

export interface LessonContent {
  id: string;
  module: string;
  title: string;
  description: string;
  duration: string;
  xp: number;
  sections: LessonSection[];
  questions: Question[];
  openWormConnection: string;
}

export const LESSON_CONTENT: LessonContent[] = [
  {
    id: "intro-worm",
    module: "Introduction",
    title: "Meet C. elegans",
    description: "Discover the tiny worm that changed neuroscience forever.",
    duration: "5 min",
    xp: 50,
    sections: [
      {
        title: "What is C. elegans?",
        content: "C. elegans (Caenorhabditis elegans) is a tiny, transparent roundworm about 1mm long — roughly the width of a pencil tip. Despite being smaller than a grain of rice, this microscopic creature has taught scientists more about how brains work than almost any other organism on Earth!",
        funFact: "C. elegans lives in soil and eats bacteria. You could fit 10 of them on your fingernail!"
      },
      {
        title: "Why Scientists Love This Worm",
        content: "In the 1960s, scientist Sydney Brenner chose C. elegans as the perfect 'model organism' for studying biology. Why? It's transparent (you can see inside!), reproduces quickly (300 babies every 3 days), and has a simple body with exactly 959 cells in adults. Most importantly, every C. elegans has exactly 302 neurons — and scientists have mapped every single one!",
        videoUrl: "https://www.youtube.com/embed/o-JHNW7kUCw",
        funFact: "Sydney Brenner won the Nobel Prize in 2002 partly for his work with C. elegans!"
      },
      {
        title: "The Worm's Superpower: Simplicity",
        content: "Your brain has about 86 billion neurons. That's way too many to study one by one! But C. elegans has only 302 neurons, making it the ONLY organism where scientists have mapped every neuron and every connection. This complete 'wiring diagram' is called the connectome. OpenWorm is building the world's first digital version of this worm!"
      }
    ],
    questions: [
      {
        id: "q1",
        text: "How many neurons does C. elegans have?",
        options: [
          { id: "a", text: "30 neurons" },
          { id: "b", text: "302 neurons" },
          { id: "c", text: "3,020 neurons" },
          { id: "d", text: "86 billion neurons" }
        ],
        correctId: "b",
        explanation: "C. elegans has exactly 302 neurons — the only animal whose complete nervous system has been mapped!",
        points: 10
      },
      {
        id: "q2",
        text: "Why did scientists choose C. elegans for research?",
        options: [
          { id: "a", text: "It's the largest worm species" },
          { id: "b", text: "It's transparent, simple, and reproduces quickly" },
          { id: "c", text: "It can fly" },
          { id: "d", text: "It has the most complex brain" }
        ],
        correctId: "b",
        explanation: "C. elegans is transparent (so scientists can watch its cells), has a simple body, and reproduces every 3 days!",
        points: 10
      },
      {
        id: "q3",
        text: "What is a 'connectome'?",
        options: [
          { id: "a", text: "A type of worm food" },
          { id: "b", text: "A complete map of all neural connections" },
          { id: "c", text: "A worm's outer shell" },
          { id: "d", text: "A laboratory tool" }
        ],
        correctId: "b",
        explanation: "A connectome is a complete wiring diagram showing every neuron and connection in a nervous system. C. elegans is the only animal with a fully mapped connectome!",
        points: 10
      }
    ],
    openWormConnection: "OpenWorm uses real data from WormAtlas.org and the original C. elegans connectome paper to build its digital worm."
  },
  {
    id: "neurons-101",
    module: "Introduction", 
    title: "What Are Neurons?",
    description: "Learn about the building blocks of all brains.",
    duration: "8 min",
    xp: 75,
    sections: [
      {
        title: "Neurons: The Brain's Messengers",
        content: "Neurons are special cells that carry messages through your body using electricity and chemicals. Think of them like a relay race — one neuron passes a message to the next, then the next, until the message reaches its destination. In C. elegans, just 302 neurons control EVERYTHING: movement, eating, mating, sensing touch, smell, and more!",
        funFact: "A single neuron can connect to thousands of other neurons!"
      },
      {
        title: "Types of Neurons in C. elegans",
        content: "The worm's 302 neurons come in three main types:\n\n• SENSORY NEURONS (86): Detect the environment — touch, temperature, chemicals, light\n• MOTOR NEURONS (113): Control muscle movements — make the worm wiggle, eat, lay eggs\n• INTERNEURONS (103): Process information — the 'thinking' neurons that connect sensors to motors",
        funFact: "The worm has 95 different types of neurons, more variety than you might expect for such a simple brain!"
      },
      {
        title: "How Neurons Talk: Synapses",
        content: "Neurons communicate at junctions called synapses. When a neuron fires, it releases chemicals (neurotransmitters) that trigger the next neuron. C. elegans has about 7,000 chemical synapses and 600 electrical synapses. OpenWorm's c302 project models all of these to simulate realistic worm behavior!"
      }
    ],
    questions: [
      {
        id: "q1",
        text: "What are the three main types of neurons?",
        options: [
          { id: "a", text: "Red, green, and blue neurons" },
          { id: "b", text: "Sensory, motor, and interneurons" },
          { id: "c", text: "Fast, medium, and slow neurons" },
          { id: "d", text: "Brain, heart, and stomach neurons" }
        ],
        correctId: "b",
        explanation: "Sensory neurons detect the environment, motor neurons control movement, and interneurons process information between them.",
        points: 15
      },
      {
        id: "q2",
        text: "What is a synapse?",
        options: [
          { id: "a", text: "A type of worm" },
          { id: "b", text: "A junction where neurons communicate" },
          { id: "c", text: "A neuron's tail" },
          { id: "d", text: "A brain disease" }
        ],
        correctId: "b",
        explanation: "A synapse is the connection point between neurons where chemical or electrical signals pass from one neuron to another.",
        points: 15
      },
      {
        id: "q3",
        text: "How many synapses does C. elegans have approximately?",
        options: [
          { id: "a", text: "About 300" },
          { id: "b", text: "About 7,600 (chemical + electrical)" },
          { id: "c", text: "About 86 billion" },
          { id: "d", text: "Just 1" }
        ],
        correctId: "b",
        explanation: "C. elegans has about 7,000 chemical synapses and 600 electrical (gap junction) synapses, totaling around 7,600 connections!",
        points: 15
      }
    ],
    openWormConnection: "OpenWorm's c302 project (github.com/openworm/c302) models every single synapse to create realistic neural simulations."
  },
  {
    id: "connectome",
    module: "Neural Networks",
    title: "The Connectome",
    description: "Explore how 302 neurons connect to create behavior.",
    duration: "10 min",
    xp: 100,
    sections: [
      {
        title: "Mapping Every Connection",
        content: "In the 1970s-80s, scientists John White, Eileen Southgate, and colleagues spent over a decade slicing a worm into 20,000 ultra-thin sections and photographing each one with an electron microscope. They traced every neuron and connection by hand — a heroic feat that created the first complete connectome!",
        funFact: "The original connectome paper was published in 1986 and is still cited in research today!"
      },
      {
        title: "Connectome Structure",
        content: "The connectome shows that C. elegans' brain isn't random — it has organized circuits for specific behaviors:\n\n• TOUCH CIRCUIT: ALM/AVM neurons → AVA/AVD interneurons → DA/VA motor neurons\n• FOOD SENSING: ASE chemosensory → AIY/AIZ → head movement\n• LOCOMOTION: AVB command → B-type motors (forward) or AVA command → A-type motors (backward)\n\nThese circuits are what you'll build in NeuroQuest missions!",
        funFact: "The touch reflex circuit involves only about 10 neurons but produces complex escape behavior!"
      },
      {
        title: "From Worm to Human",
        content: "Scientists study the worm connectome to understand principles that apply to ALL brains, including humans. Many diseases (Alzheimer's, Parkinson's) involve broken neural connections. By understanding how the simple worm brain works, we get clues about fixing human brain disorders!"
      }
    ],
    questions: [
      {
        id: "q1",
        text: "How was the C. elegans connectome originally created?",
        options: [
          { id: "a", text: "Using a computer simulation" },
          { id: "b", text: "By slicing the worm and tracing neurons in microscope photos" },
          { id: "c", text: "By watching worms move" },
          { id: "d", text: "Using X-rays" }
        ],
        correctId: "b",
        explanation: "Scientists sliced the worm into thousands of thin sections, photographed each with an electron microscope, and traced every neuron by hand over 10+ years!",
        points: 20
      },
      {
        id: "q2",
        text: "What does the touch circuit typically involve?",
        options: [
          { id: "a", text: "Only motor neurons" },
          { id: "b", text: "Sensory neurons → interneurons → motor neurons" },
          { id: "c", text: "Only one neuron" },
          { id: "d", text: "Muscles directly" }
        ],
        correctId: "b",
        explanation: "The touch circuit follows a path: touch sensor neurons detect touch, interneurons process the signal, and motor neurons trigger the escape response.",
        points: 20
      },
      {
        id: "q3",
        text: "Why is studying the worm connectome relevant to human health?",
        options: [
          { id: "a", text: "Worms get the same diseases as humans" },
          { id: "b", text: "It reveals principles of neural circuits that apply to all brains" },
          { id: "c", text: "Humans evolved from worms" },
          { id: "d", text: "It's not relevant to humans" }
        ],
        correctId: "b",
        explanation: "The worm reveals fundamental principles of how neural circuits work, which helps scientists understand brain diseases and develop treatments.",
        points: 20
      }
    ],
    openWormConnection: "OpenWorm uses the complete 2019 connectome dataset (CElegansNeuroML) to build accurate circuit models."
  },
  {
    id: "synapses",
    module: "Neural Networks",
    title: "Synapses & Signals",
    description: "Understand how neurons communicate with each other.",
    duration: "12 min", 
    xp: 100,
    sections: [
      {
        title: "Chemical vs Electrical Synapses",
        content: "C. elegans uses two types of synapses:\n\n• CHEMICAL SYNAPSES (~7,000): One neuron releases neurotransmitter chemicals that the next neuron detects. These have a clear direction (one-way) and can amplify or reduce signals.\n\n• ELECTRICAL SYNAPSES (~600): Direct electrical connections called 'gap junctions' that let signals pass in both directions. These are faster but can't amplify signals.",
        funFact: "Your heart also uses electrical synapses to beat in rhythm!"
      },
      {
        title: "Signal Strength: Synaptic Weights",
        content: "Not all connections are equal! Some synapses are 'stronger' than others, meaning they pass signals more effectively. In the connectome, we measure this as 'weight' — the number of synaptic contacts between two neurons. A connection with weight 20 is much stronger than one with weight 2. This is exactly like 'weights' in artificial neural networks!",
        funFact: "OpenWorm's Sibernetic project simulates how these weights affect worm movement in real-time 3D!"
      },
      {
        title: "Excitation and Inhibition",
        content: "Synapses can either excite (activate) or inhibit (quiet down) the next neuron:\n\n• EXCITATORY: 'Wake up! Pass this message!'\n• INHIBITORY: 'Stay calm, don't fire.'\n\nThe worm's brain balances these to produce smooth, controlled movements. Too much excitation = seizures. Too much inhibition = paralysis."
      }
    ],
    questions: [
      {
        id: "q1",
        text: "What's the difference between chemical and electrical synapses?",
        options: [
          { id: "a", text: "Chemical use neurotransmitters; electrical are direct connections" },
          { id: "b", text: "They're the same thing" },
          { id: "c", text: "Chemical are faster" },
          { id: "d", text: "Electrical only exist in worms" }
        ],
        correctId: "a",
        explanation: "Chemical synapses release neurotransmitter chemicals, while electrical synapses (gap junctions) allow direct electrical current flow.",
        points: 20
      },
      {
        id: "q2",
        text: "What does 'synaptic weight' represent?",
        options: [
          { id: "a", text: "How heavy a synapse is" },
          { id: "b", text: "The strength/effectiveness of a connection" },
          { id: "c", text: "The color of the synapse" },
          { id: "d", text: "How old the synapse is" }
        ],
        correctId: "b",
        explanation: "Synaptic weight measures connection strength — higher weight means the signal passes more effectively between neurons.",
        points: 20
      },
      {
        id: "q3",
        text: "What happens if you have too much neural excitation with no inhibition?",
        options: [
          { id: "a", text: "The worm moves smoothly" },
          { id: "b", text: "The worm falls asleep" },
          { id: "c", text: "Uncontrolled firing, like seizures" },
          { id: "d", text: "Nothing happens" }
        ],
        correctId: "c",
        explanation: "Without inhibitory balance, neurons fire uncontrollably — this is what happens during epileptic seizures!",
        points: 20
      }
    ],
    openWormConnection: "OpenWorm's c302 framework models both chemical and electrical synapses with realistic weights from the published connectome."
  },
  {
    id: "sensory",
    module: "Worm Systems",
    title: "Sensory Neurons",
    description: "How the worm senses its environment.",
    duration: "15 min",
    xp: 125,
    sections: [
      {
        title: "The Worm's Senses",
        content: "C. elegans can detect touch, temperature, chemicals (smell/taste), oxygen levels, and even light — all with just 86 sensory neurons! The worm's 'nose' is at its head, where specialized amphid neurons detect chemicals in the environment. This helps the worm find food and avoid danger.",
        funFact: "C. elegans can smell over 1,000 different odors!"
      },
      {
        title: "Touch Neurons: ALM, AVM, PLM",
        content: "The worm has 6 touch receptor neurons:\n\n• ALM (left/right): Detect gentle touch on the anterior (head) end\n• AVM: Detects ventral (belly-side) touch\n• PLM (left/right): Detect touch on the posterior (tail) end\n• PVM: Detects additional posterior touch\n\nWhen touched on the head, the worm reverses. When touched on the tail, it moves forward. This is the escape reflex you'll wire in NeuroQuest!",
        funFact: "Touch neurons are among the largest cells in the worm's body!"
      },
      {
        title: "Chemical Sensing: ASE Neurons",
        content: "The ASE neurons (left and right) are the worm's main 'taste' sensors for salt and other chemicals. Interestingly, ASEL and ASER have DIFFERENT functions:\n\n• ASEL: Responds to increasing salt concentration (attraction)\n• ASER: Responds to decreasing salt concentration (avoidance)\n\nThis asymmetry helps the worm navigate chemical gradients to find food — a behavior called chemotaxis."
      }
    ],
    questions: [
      {
        id: "q1",
        text: "What happens when C. elegans is touched on the head?",
        options: [
          { id: "a", text: "It moves forward" },
          { id: "b", text: "It reverses (moves backward)" },
          { id: "c", text: "It curls up" },
          { id: "d", text: "Nothing" }
        ],
        correctId: "b",
        explanation: "Head touch activates ALM/AVM neurons, which trigger the backward escape reflex — moving away from potential danger!",
        points: 25
      },
      {
        id: "q2",
        text: "What's special about the ASEL and ASER neurons?",
        options: [
          { id: "a", text: "They're identical" },
          { id: "b", text: "One responds to increasing, one to decreasing chemical concentration" },
          { id: "c", text: "They control movement" },
          { id: "d", text: "They detect light" }
        ],
        correctId: "b",
        explanation: "ASEL responds to increasing salt (attraction), while ASER responds to decreasing salt (avoidance) — asymmetry for gradient navigation!",
        points: 25
      },
      {
        id: "q3",
        text: "What is chemotaxis?",
        options: [
          { id: "a", text: "A type of neuron" },
          { id: "b", text: "Movement in response to chemical gradients" },
          { id: "c", text: "A worm disease" },
          { id: "d", text: "The worm's skin" }
        ],
        correctId: "b",
        explanation: "Chemotaxis is the behavior of moving toward or away from chemical signals — how worms navigate to find food!",
        points: 25
      }
    ],
    openWormConnection: "OpenWorm's Sibernetic simulator includes chemotaxis behavior models based on ASE neuron responses to chemical gradients."
  },
  {
    id: "motor",
    module: "Worm Systems",
    title: "Motor Control",
    description: "From signal to movement — how worms wiggle.",
    duration: "15 min",
    xp: 125,
    sections: [
      {
        title: "The Worm's Movement System",
        content: "C. elegans moves by creating waves along its body — like a swimming snake. This requires precise coordination of 95 body wall muscles controlled by 113 motor neurons. The worm can move forward, backward, turn, and even swim (when in liquid)!",
        funFact: "The worm moves faster backward than forward — useful for escape!"
      },
      {
        title: "A-type vs B-type Motor Neurons",
        content: "Motor neurons come in two main classes:\n\n• A-TYPE (DA, VA): Control BACKWARD movement\n  - Activated by AVA/AVD command interneurons\n  - Fire when worm needs to reverse/escape\n\n• B-TYPE (DB, VB): Control FORWARD movement\n  - Activated by AVB command interneurons\n  - Fire during normal forward locomotion\n\nD = dorsal (back), V = ventral (belly). The numbers (1, 2, 3...) indicate position along the body.",
        funFact: "The worm can switch from forward to backward in under 1 second!"
      },
      {
        title: "Command Interneurons: The Decision Makers",
        content: "Five pairs of command interneurons control the entire locomotion system:\n\n• AVA: Backward command (drives A-type motors)\n• AVB: Forward command (drives B-type motors)\n• AVD: Backward reinforcement\n• PVC: Forward reinforcement\n• AVE: Additional backward control\n\nThese are the neurons you connect to motor neurons in NeuroQuest to make the worm move!"
      }
    ],
    questions: [
      {
        id: "q1",
        text: "Which motor neuron type controls forward movement?",
        options: [
          { id: "a", text: "A-type (DA, VA)" },
          { id: "b", text: "B-type (DB, VB)" },
          { id: "c", text: "C-type" },
          { id: "d", text: "All of them equally" }
        ],
        correctId: "b",
        explanation: "B-type motor neurons (DB, VB) control forward locomotion, while A-type (DA, VA) control backward movement.",
        points: 25
      },
      {
        id: "q2",
        text: "What do command interneurons like AVA and AVB do?",
        options: [
          { id: "a", text: "Directly move muscles" },
          { id: "b", text: "Sense touch" },
          { id: "c", text: "Decide between forward and backward movement" },
          { id: "d", text: "Digest food" }
        ],
        correctId: "c",
        explanation: "Command interneurons are 'decision makers' that activate motor neurons — AVA for backward, AVB for forward movement.",
        points: 25
      },
      {
        id: "q3",
        text: "Why is the worm faster at moving backward?",
        options: [
          { id: "a", text: "It has more muscles in the tail" },
          { id: "b", text: "It's an adaptation for quick escape from danger" },
          { id: "c", text: "It's actually slower backward" },
          { id: "d", text: "Scientists don't know" }
        ],
        correctId: "b",
        explanation: "Fast backward movement is an escape adaptation — when touched on the head, the worm needs to reverse quickly to avoid predators!",
        points: 25
      }
    ],
    openWormConnection: "OpenWorm's Sibernetic project simulates the fluid dynamics of worm movement with all 95 muscle cells."
  },
  {
    id: "ai-basics",
    module: "AI & Neuroscience",
    title: "Neural Networks in AI",
    description: "How artificial neural networks mimic real brains.",
    duration: "20 min",
    xp: 150,
    sections: [
      {
        title: "From Worms to Computers",
        content: "Artificial Neural Networks (ANNs) are computer programs inspired by biological brains! Just like the worm's neurons pass signals through synapses, artificial neurons pass numbers through weighted connections. The same principles that make C. elegans work are behind ChatGPT, image recognition, and self-driving cars!",
        funFact: "The first artificial neuron was invented in 1943 — before the first computer!"
      },
      {
        title: "How Artificial Neurons Work",
        content: "An artificial neuron:\n1. Receives inputs (like sensory signals)\n2. Multiplies each input by a weight (like synaptic strength)\n3. Adds them up\n4. Applies an 'activation function' (decides whether to fire)\n5. Outputs a value to the next layer\n\nThis is EXACTLY what real neurons do! The worm's touch reflex is a simple neural network: touch input → weighted connections → motor output.",
        funFact: "Modern AI language models have billions of artificial neurons — but started from understanding simple systems like C. elegans!"
      },
      {
        title: "Learning = Changing Weights",
        content: "Both biological and artificial networks learn by changing connection weights:\n\n• In REAL brains: Synapses get stronger with use (Hebbian learning)\n• In AI: Weights adjust to reduce errors (backpropagation)\n\nWhen you 'train' an AI, you're adjusting millions of weights until it gives correct answers — just like how the worm's brain was shaped by millions of years of evolution!"
      }
    ],
    questions: [
      {
        id: "q1",
        text: "What do artificial neural networks have in common with C. elegans' brain?",
        options: [
          { id: "a", text: "Nothing — they're completely different" },
          { id: "b", text: "Both use weighted connections between nodes/neurons" },
          { id: "c", text: "Both are made of cells" },
          { id: "d", text: "Both can move" }
        ],
        correctId: "b",
        explanation: "Both biological and artificial neural networks process information through weighted connections — the fundamental principle is the same!",
        points: 30
      },
      {
        id: "q2",
        text: "How do artificial neural networks 'learn'?",
        options: [
          { id: "a", text: "By reading books" },
          { id: "b", text: "By adjusting connection weights to reduce errors" },
          { id: "c", text: "By adding more neurons" },
          { id: "d", text: "They can't learn" }
        ],
        correctId: "b",
        explanation: "Neural networks learn by adjusting weights — when the network makes errors, weights change to produce better outputs next time.",
        points: 30
      },
      {
        id: "q3",
        text: "What is an 'activation function' in an artificial neuron?",
        options: [
          { id: "a", text: "A switch that turns the computer on" },
          { id: "b", text: "A mathematical function that decides if the neuron fires" },
          { id: "c", text: "A type of protein" },
          { id: "d", text: "The neuron's color" }
        ],
        correctId: "b",
        explanation: "The activation function determines whether and how strongly a neuron 'fires' based on its inputs — similar to a real neuron's threshold!",
        points: 30
      }
    ],
    openWormConnection: "OpenWorm's c302 framework lets you run actual worm neural simulations — the same principles power modern AI!"
  },
  {
    id: "train-model",
    module: "AI & Neuroscience",
    title: "Training Your First Model",
    description: "Use worm data to train a simple AI.",
    duration: "25 min",
    xp: 200,
    sections: [
      {
        title: "What Does Training Mean?",
        content: "Training an AI means showing it examples and letting it adjust its weights until it can make accurate predictions. For a worm brain model, we could train it to predict: 'Given this touch input, what motor output should happen?' The AI learns the relationship between sensory input and behavioral output — just like the real worm learned through evolution!",
        funFact: "Training GPT-4 required looking at trillions of words!"
      },
      {
        title: "OpenWorm's Approach",
        content: "OpenWorm doesn't train the worm brain from scratch — instead, it uses the real connectome weights! By setting artificial neuron connections to match real synaptic weights from the biological data, the simulated worm behaves like the real one. This is called 'biologically constrained' modeling.\n\nYou can see this in action at github.com/openworm/c302!",
        funFact: "OpenWorm's Sibernetic simulation runs the worm in a realistic virtual fluid environment!"
      },
      {
        title: "The Future: Digital Life",
        content: "OpenWorm's Massive Transformational Purpose: 'Digitize Life.' Starting with C. elegans, the goal is to simulate every organism to decode biology's code. Why? Because digital organisms can:\n\n• Test drugs without real animals\n• Model diseases like Alzheimer's\n• Accelerate brain-computer interface development\n• Democratize biological knowledge\n\nYou're learning the foundation of a revolution in biology and AI!"
      }
    ],
    questions: [
      {
        id: "q1",
        text: "What does it mean to 'train' an AI model?",
        options: [
          { id: "a", text: "Make it run faster" },
          { id: "b", text: "Show it examples so it adjusts weights to make accurate predictions" },
          { id: "c", text: "Give it a name" },
          { id: "d", text: "Connect it to the internet" }
        ],
        correctId: "b",
        explanation: "Training means showing the model many examples and adjusting weights until it learns to predict correctly.",
        points: 40
      },
      {
        id: "q2",
        text: "How does OpenWorm create its worm simulation?",
        options: [
          { id: "a", text: "By training from scratch with random data" },
          { id: "b", text: "By using real connectome weights from biological data" },
          { id: "c", text: "By copying other AI models" },
          { id: "d", text: "By guessing" }
        ],
        correctId: "b",
        explanation: "OpenWorm uses 'biologically constrained' modeling — setting connection weights based on real measurements from the actual worm!",
        points: 40
      },
      {
        id: "q3",
        text: "What is OpenWorm's long-term goal?",
        options: [
          { id: "a", text: "To create a worm video game" },
          { id: "b", text: "To digitize life and simulate organisms for science and medicine" },
          { id: "c", text: "To replace real worms" },
          { id: "d", text: "To make worms extinct" }
        ],
        correctId: "b",
        explanation: "OpenWorm aims to 'Digitize Life' — creating accurate simulations to accelerate drug discovery, disease research, and biological understanding!",
        points: 40
      }
    ],
    openWormConnection: "OpenWorm is open-source! Anyone can contribute to building the world's first complete digital organism at github.com/openworm"
  }
];

export const getLessonById = (id: string): LessonContent | undefined => {
  return LESSON_CONTENT.find(l => l.id === id);
};

export const OPENWORM_RESOURCES = {
  github: "https://github.com/openworm",
  c302: "https://github.com/openworm/c302",
  sibernetic: "https://github.com/openworm/sibernetic",
  connectome: "https://github.com/openworm/CElegansNeuroML",
  website: "https://openworm.org",
  wormAtlas: "http://www.wormatlas.org",
  videos: {
    cElegansMovement: "https://www.youtube.com/embed/o-JHNW7kUCw",
    openWormIntro: "https://www.youtube.com/embed/vTk-gS5nP_0",
    sibernetic: "https://www.youtube.com/embed/3uV3yTmUlgo"
  },
  mtp: "OpenWorm's MTP: 'Digitize Life: Simulate Every Organism to Decode Biology's Code and Conquer the Brain.' Starts with C. elegans—1,000-cell nematode, full connectome mapped—as gateway to multiscale bio-sims. Accelerates reverse-engineering neural circuits, unlocks predictive models for neurodegeneration, drug discovery, and brain-machine interfaces. Open-source core democratizes data for global innovation."
};
