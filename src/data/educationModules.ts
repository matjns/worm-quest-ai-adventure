// Self-contained 2nd-person educational modules for each grade level
// Designed to be teacher-replicable with scripted content

export interface LearningObjective {
  id: string;
  text: string;
  ngssStandard?: string;
}

export interface ModuleStep {
  id: string;
  title: string;
  script: string; // 2nd-person teacher script
  interactionType: "observe" | "tap" | "drag" | "adjust" | "build" | "analyze";
  visualCue: string;
  successCriteria: string;
  hint: string;
}

export interface EducationModule {
  id: string;
  gradeLevel: "prek" | "k5" | "middle" | "high" | "public";
  title: string;
  subtitle: string;
  duration: string;
  objectives: LearningObjective[];
  vocabulary: { term: string; definition: string; emoji: string }[];
  warmUp: {
    question: string;
    discussion: string;
  };
  steps: ModuleStep[];
  wrapUp: {
    review: string;
    realWorldConnection: string;
    takeHome: string;
  };
  assessment: {
    formative: string[];
    summative: string;
  };
}

// Pre-K: Colors & Wiggling Focus
export const PREK_MODULES: EducationModule[] = [
  {
    id: "prek-worm-friend",
    gradeLevel: "prek",
    title: "Meet Your Worm Friend",
    subtitle: "Colors & Wiggling",
    duration: "15-20 minutes",
    objectives: [
      { id: "obj1", text: "You will identify that worms can move and wiggle" },
      { id: "obj2", text: "You will match colors to worm parts" },
      { id: "obj3", text: "You will understand that brains help worms move" },
    ],
    vocabulary: [
      { term: "Worm", definition: "A tiny animal that wiggles", emoji: "🐛" },
      { term: "Brain", definition: "The part that helps you think", emoji: "🧠" },
      { term: "Wiggle", definition: "Moving back and forth", emoji: "〰️" },
    ],
    warmUp: {
      question: "Have you ever seen a worm? What did it do?",
      discussion: "Worms are amazing little animals! They don't have legs like you do, but they can still move. Let's find out how!",
    },
    steps: [
      {
        id: "step1",
        title: "Say Hello!",
        script: "You see a friendly worm on your screen! Wave to say hello! This worm has a tiny brain, just like you have a brain in your head.",
        interactionType: "observe",
        visualCue: "Worm waves animation",
        successCriteria: "Child engages with worm character",
        hint: "Look at the wiggly worm!",
      },
      {
        id: "step2",
        title: "Make It Wiggle!",
        script: "You can make the worm dance! Tap on the worm and watch it wiggle. Every time you tap, you're sending a message to its brain!",
        interactionType: "tap",
        visualCue: "Worm wiggles with particle effects",
        successCriteria: "Child taps worm 3+ times",
        hint: "Try tapping the worm!",
      },
      {
        id: "step3",
        title: "Color Match",
        script: "You see different colors! Can you find the RED one? Tap the red circle. When you match colors, the worm does a happy wiggle!",
        interactionType: "tap",
        visualCue: "Color circles appear with target highlight",
        successCriteria: "Child matches 3 colors correctly",
        hint: "Look for the color that matches!",
      },
      {
        id: "step4",
        title: "Brain Lights",
        script: "You see tiny lights in the worm's brain! When you tap a light, it turns on and the worm moves. You are the worm wizard!",
        interactionType: "tap",
        visualCue: "Neuron dots glow when tapped",
        successCriteria: "Child activates 5 neurons",
        hint: "Tap the glowing dots!",
      },
    ],
    wrapUp: {
      review: "You learned that worms have tiny brains with little lights called neurons. When the lights turn on, the worm wiggles!",
      realWorldConnection: "Your brain has lights too! When you decide to wave your hand, your brain lights turn on and send a message to move!",
      takeHome: "Draw a picture of your worm friend and show someone how it wiggles!",
    },
    assessment: {
      formative: [
        "Can the child tap to make the worm move?",
        "Can the child identify colors correctly?",
        "Does the child understand that tapping lights makes movement?",
      ],
      summative: "Child demonstrates understanding that brain activity causes movement",
    },
  },
  {
    id: "prek-neuron-rainbow",
    gradeLevel: "prek",
    title: "Neuron Rainbow",
    subtitle: "Colors in Your Brain",
    duration: "15 minutes",
    objectives: [
      { id: "obj1", text: "You will match neuron colors" },
      { id: "obj2", text: "You will count neurons up to 5" },
      { id: "obj3", text: "You will make patterns with neurons" },
    ],
    vocabulary: [
      { term: "Neuron", definition: "A tiny light in your brain", emoji: "💡" },
      { term: "Pattern", definition: "Things that repeat", emoji: "🔄" },
      { term: "Signal", definition: "A message that travels", emoji: "⚡" },
    ],
    warmUp: {
      question: "What is your favorite color?",
      discussion: "Your brain uses different colors to send different messages! Let's see what happens with each color!",
    },
    steps: [
      {
        id: "step1",
        title: "Find the Colors",
        script: "You see red, blue, green, yellow, and purple neurons! Point to each color as I say it. You're learning neuron colors!",
        interactionType: "tap",
        visualCue: "Colorful neurons displayed in a row",
        successCriteria: "Child identifies all 5 colors",
        hint: "Listen for the color name!",
      },
      {
        id: "step2",
        title: "Count With Me",
        script: "You can count the neurons! Touch each one as we count together: one, two, three, four, five! You are a counting star!",
        interactionType: "tap",
        visualCue: "Neurons light up sequentially",
        successCriteria: "Child counts to 5",
        hint: "Touch each neuron one at a time!",
      },
      {
        id: "step3",
        title: "Make a Pattern",
        script: "You can make a pattern! Tap red, then blue, then red, then blue. See the pattern you made? The worm dances to your pattern!",
        interactionType: "tap",
        visualCue: "Pattern builder with worm reaction",
        successCriteria: "Child creates AB pattern",
        hint: "Red, blue, red, blue...",
      },
    ],
    wrapUp: {
      review: "You learned neuron colors and made patterns! Patterns help your brain remember things!",
      realWorldConnection: "You use patterns every day! Day and night is a pattern. Breakfast, lunch, dinner is a pattern!",
      takeHome: "Find patterns at home and tell someone about them!",
    },
    assessment: {
      formative: [
        "Can the child identify basic colors?",
        "Can the child count neurons to 5?",
        "Can the child create simple patterns?",
      ],
      summative: "Child demonstrates color recognition and simple patterning",
    },
  },
];

// K-5: Drag Quizzes Focus
export const K5_MODULES: EducationModule[] = [
  {
    id: "k5-brain-builder",
    gradeLevel: "k5",
    title: "Brain Builder Challenge",
    subtitle: "Connect the Neurons",
    duration: "25-30 minutes",
    objectives: [
      { id: "obj1", text: "You will identify sensory, motor, and interneurons", ngssStandard: "4-LS1-1" },
      { id: "obj2", text: "You will create connections between neurons" },
      { id: "obj3", text: "You will explain how signals travel through a circuit" },
    ],
    vocabulary: [
      { term: "Sensory Neuron", definition: "Detects things from outside", emoji: "👁️" },
      { term: "Motor Neuron", definition: "Makes muscles move", emoji: "💪" },
      { term: "Interneuron", definition: "Passes messages between neurons", emoji: "📨" },
      { term: "Circuit", definition: "A connected pathway", emoji: "🔄" },
    ],
    warmUp: {
      question: "When you touch something hot, what happens?",
      discussion: "Your brain quickly tells your hand to move away! Let's build a circuit that does the same thing!",
    },
    steps: [
      {
        id: "step1",
        title: "Meet the Neurons",
        script: "You see three types of neurons on your screen. The blue one senses things, the green one is a messenger, and the red one makes muscles move. Drag the labels to match each neuron!",
        interactionType: "drag",
        visualCue: "Three neurons with label drop zones",
        successCriteria: "Child correctly labels all neurons",
        hint: "Sensory neurons sense, motor neurons move!",
      },
      {
        id: "step2",
        title: "Connect the Path",
        script: "You need to build a path for the signal! Drag a line from the sensory neuron to the interneuron, then to the motor neuron. You're building a reflex arc!",
        interactionType: "drag",
        visualCue: "Connection lines with snap-to targets",
        successCriteria: "Child creates complete circuit",
        hint: "Start with the sensory neuron!",
      },
      {
        id: "step3",
        title: "Test Your Circuit",
        script: "You built your circuit! Now tap the sensory neuron to send a signal. Watch it travel through your circuit! The worm moves because you built its brain!",
        interactionType: "tap",
        visualCue: "Signal animation through circuit",
        successCriteria: "Signal travels and worm responds",
        hint: "Tap the first neuron to start!",
      },
      {
        id: "step4",
        title: "Quiz Time",
        script: "You're doing great! Now answer this: Which neuron makes the worm's muscles move? Drag your answer to the answer box!",
        interactionType: "drag",
        visualCue: "Quiz with draggable answers",
        successCriteria: "Child selects motor neuron",
        hint: "Think about what 'motor' means!",
      },
    ],
    wrapUp: {
      review: "You learned that neurons have different jobs! Sensory neurons detect, interneurons pass messages, and motor neurons make movement!",
      realWorldConnection: "When you touch a hot stove, sensory neurons in your hand tell your brain, and motor neurons make your hand move away super fast!",
      takeHome: "Draw your reflex arc circuit and explain it to someone at home!",
    },
    assessment: {
      formative: [
        "Can the child identify the three neuron types?",
        "Can the child create a complete circuit?",
        "Can the child explain the signal path?",
      ],
      summative: "Child demonstrates understanding of neural circuit structure",
    },
  },
  {
    id: "k5-worm-senses",
    gradeLevel: "k5",
    title: "Worm Senses",
    subtitle: "How Worms Detect the World",
    duration: "25 minutes",
    objectives: [
      { id: "obj1", text: "You will learn how worms sense touch, smell, and temperature" },
      { id: "obj2", text: "You will match senses to neuron types" },
      { id: "obj3", text: "You will design a circuit for a specific sense" },
    ],
    vocabulary: [
      { term: "Chemotaxis", definition: "Moving toward or away from chemicals", emoji: "👃" },
      { term: "Thermotaxis", definition: "Responding to temperature", emoji: "🌡️" },
      { term: "Mechanosensation", definition: "Feeling touch", emoji: "✋" },
    ],
    warmUp: {
      question: "How many senses do you have?",
      discussion: "You have five senses! Worms have senses too, but they're different. Let's explore how worms sense the world!",
    },
    steps: [
      {
        id: "step1",
        title: "Touch Sensors",
        script: "You see the worm's touch neurons! They're called mechanosensory neurons. Tap on the worm and watch the touch neurons light up!",
        interactionType: "tap",
        visualCue: "Touch neurons highlight on tap",
        successCriteria: "Child activates touch response",
        hint: "Tap gently on the worm's body!",
      },
      {
        id: "step2",
        title: "Smell Detectors",
        script: "You can drag food near the worm! The smell neurons in its nose (amphid) detect the food. Watch the worm turn toward the food!",
        interactionType: "drag",
        visualCue: "Food item draggable with scent particles",
        successCriteria: "Child triggers chemotaxis response",
        hint: "Drag the food close to the worm's head!",
      },
      {
        id: "step3",
        title: "Match the Sense",
        script: "You're a sense expert now! Drag each sense word to the correct neuron type. Touch goes with mechanosensory, smell with chemosensory!",
        interactionType: "drag",
        visualCue: "Matching activity with drop zones",
        successCriteria: "All senses correctly matched",
        hint: "Think about what each sense detects!",
      },
    ],
    wrapUp: {
      review: "You discovered that worms have special neurons for touch, smell, and temperature! Different neurons detect different things!",
      realWorldConnection: "Your skin has touch sensors, your nose has smell sensors, and your eyes have light sensors. You're full of sensors!",
      takeHome: "Make a list of all the senses you used today!",
    },
    assessment: {
      formative: [
        "Can the child describe worm senses?",
        "Can the child match senses to neuron types?",
        "Can the child explain chemotaxis?",
      ],
      summative: "Child demonstrates understanding of sensory processing",
    },
  },
];

// Middle School: Synapse Edits Focus
export const MIDDLE_MODULES: EducationModule[] = [
  {
    id: "middle-synapse-lab",
    gradeLevel: "middle",
    title: "Synapse Engineering Lab",
    subtitle: "Edit Neural Connections",
    duration: "35-40 minutes",
    objectives: [
      { id: "obj1", text: "You will adjust synaptic weights to change signal strength", ngssStandard: "MS-LS1-8" },
      { id: "obj2", text: "You will predict behavior changes based on synapse modifications" },
      { id: "obj3", text: "You will analyze the relationship between synapse strength and response" },
    ],
    vocabulary: [
      { term: "Synapse", definition: "The gap between two neurons where signals are transmitted", emoji: "🔗" },
      { term: "Synaptic Weight", definition: "How strong a connection is between neurons", emoji: "⚖️" },
      { term: "Excitatory", definition: "A synapse that increases activity", emoji: "➕" },
      { term: "Inhibitory", definition: "A synapse that decreases activity", emoji: "➖" },
      { term: "Plasticity", definition: "The brain's ability to change its connections", emoji: "🧩" },
    ],
    warmUp: {
      question: "What happens when you practice something a lot, like playing a video game?",
      discussion: "You get better! That's because the connections in your brain get stronger with practice. Let's see how this works in a worm!",
    },
    steps: [
      {
        id: "step1",
        title: "Explore the Synapse",
        script: "You're looking at a synapse between two neurons. See the gap? This is where neurotransmitters carry signals across. Hover over different parts to learn what they do.",
        interactionType: "observe",
        visualCue: "Interactive synapse diagram with tooltips",
        successCriteria: "Student explores all synapse components",
        hint: "Move your cursor over each labeled part!",
      },
      {
        id: "step2",
        title: "Adjust the Weight",
        script: "You can change how strong this connection is! Use the slider to adjust the synaptic weight. Higher weight = stronger signal. Lower weight = weaker signal. Watch what happens to the worm's movement!",
        interactionType: "adjust",
        visualCue: "Weight slider with real-time worm response",
        successCriteria: "Student tests at least 3 different weights",
        hint: "Try extreme values first to see big differences!",
      },
      {
        id: "step3",
        title: "Excitatory vs Inhibitory",
        script: "You can flip the synapse type! Click to switch between excitatory (+) and inhibitory (-). Excitatory synapses activate the next neuron. Inhibitory synapses suppress it. What happens to the worm?",
        interactionType: "tap",
        visualCue: "Toggle button with opposing effects",
        successCriteria: "Student observes both synapse types",
        hint: "Watch the motor neuron activity level!",
      },
      {
        id: "step4",
        title: "Design a Behavior",
        script: "You're the neural engineer now! Adjust multiple synapses to make the worm turn left when it senses food on the right. Think about which connections to strengthen and which to weaken.",
        interactionType: "build",
        visualCue: "Multi-synapse circuit editor",
        successCriteria: "Worm exhibits target behavior",
        hint: "Strengthen cross-connections, weaken same-side connections!",
      },
      {
        id: "step5",
        title: "Data Analysis",
        script: "You collected data from your experiments! Now analyze the graph showing synaptic weight vs. movement speed. What pattern do you see? Write your hypothesis about the relationship.",
        interactionType: "analyze",
        visualCue: "Interactive graph with data points",
        successCriteria: "Student identifies correlation",
        hint: "Look for whether the line goes up, down, or stays flat!",
      },
    ],
    wrapUp: {
      review: "You learned that synaptic weights control signal strength! By adjusting synapses, you can change how organisms behave. This is the basis of learning in all brains!",
      realWorldConnection: "When you learn to ride a bike, the synapses controlling balance get stronger. That's why you never forget!",
      takeHome: "Research 'long-term potentiation' and explain how it relates to what you learned today.",
    },
    assessment: {
      formative: [
        "Can the student explain what synaptic weight means?",
        "Can the student predict behavior changes from synapse adjustments?",
        "Can the student design a circuit for a target behavior?",
      ],
      summative: "Student demonstrates understanding of synaptic plasticity through circuit design",
    },
  },
  {
    id: "middle-hypothesis-testing",
    gradeLevel: "middle",
    title: "Scientific Method: Neural Edition",
    subtitle: "Hypothesis Testing with Circuits",
    duration: "40 minutes",
    objectives: [
      { id: "obj1", text: "You will form testable hypotheses about neural behavior", ngssStandard: "MS-LS1-8" },
      { id: "obj2", text: "You will design controlled experiments" },
      { id: "obj3", text: "You will analyze results and draw conclusions" },
    ],
    vocabulary: [
      { term: "Hypothesis", definition: "A testable prediction", emoji: "💭" },
      { term: "Variable", definition: "Something that can change in an experiment", emoji: "🔀" },
      { term: "Control", definition: "The unchanged comparison group", emoji: "📊" },
      { term: "Data", definition: "Information collected from experiments", emoji: "📈" },
    ],
    warmUp: {
      question: "What's the difference between a guess and a hypothesis?",
      discussion: "A hypothesis is a guess you can test! Today you'll form hypotheses about how worm neurons work and test them!",
    },
    steps: [
      {
        id: "step1",
        title: "Observe and Question",
        script: "You see a worm that sometimes moves fast and sometimes slow. Your job is to figure out why! Watch it for 30 seconds and write down what you notice.",
        interactionType: "observe",
        visualCue: "Variable-speed worm with data recording",
        successCriteria: "Student records observations",
        hint: "Look for patterns in when it speeds up!",
      },
      {
        id: "step2",
        title: "Form Your Hypothesis",
        script: "You observed the worm. Now make a hypothesis! Drag words to complete: 'If I [change something], then the worm will [do something], because [reason].'",
        interactionType: "drag",
        visualCue: "Hypothesis builder with word bank",
        successCriteria: "Student forms complete hypothesis",
        hint: "Use IF-THEN-BECAUSE format!",
      },
      {
        id: "step3",
        title: "Design Your Experiment",
        script: "You need to test your hypothesis! Choose what variable to change, what to measure, and what to keep the same. A good experiment only changes ONE thing at a time.",
        interactionType: "build",
        visualCue: "Experiment design interface",
        successCriteria: "Student creates valid experimental design",
        hint: "What will you change? What will you keep the same?",
      },
      {
        id: "step4",
        title: "Run and Collect",
        script: "You're ready to test! Run your experiment 5 times and record the data. Remember, scientists repeat experiments to make sure results are reliable!",
        interactionType: "tap",
        visualCue: "Experiment runner with data table",
        successCriteria: "Student collects 5 data points",
        hint: "Click 'Run' to test your hypothesis!",
      },
      {
        id: "step5",
        title: "Analyze and Conclude",
        script: "You have your data! Look at the average results. Did your hypothesis match what happened? Write your conclusion: Was your hypothesis supported or not?",
        interactionType: "analyze",
        visualCue: "Data analysis with conclusion prompt",
        successCriteria: "Student draws evidence-based conclusion",
        hint: "Compare your prediction to your actual results!",
      },
    ],
    wrapUp: {
      review: "You practiced the scientific method! You observed, questioned, hypothesized, experimented, and concluded. This is how real neuroscientists work!",
      realWorldConnection: "OpenWorm scientists use this exact method to understand the C. elegans brain. Your work contributes to real science!",
      takeHome: "Design a hypothesis about something in your daily life and test it this week!",
    },
    assessment: {
      formative: [
        "Can the student form a testable hypothesis?",
        "Can the student design a controlled experiment?",
        "Can the student draw conclusions from data?",
      ],
      summative: "Student demonstrates understanding of scientific method applied to neuroscience",
    },
  },
];

// High School: AI Optimization Focus
export const HIGH_MODULES: EducationModule[] = [
  {
    id: "high-ml-neural",
    gradeLevel: "high",
    title: "Machine Learning & Neural Networks",
    subtitle: "AI-Powered Optimization",
    duration: "45-50 minutes",
    objectives: [
      { id: "obj1", text: "You will design neural network architectures for behavior prediction", ngssStandard: "HS-LS1-2" },
      { id: "obj2", text: "You will train models using backpropagation" },
      { id: "obj3", text: "You will evaluate model performance and iterate" },
    ],
    vocabulary: [
      { term: "Neural Network", definition: "A computational model inspired by biological neurons", emoji: "🕸️" },
      { term: "Backpropagation", definition: "Algorithm for training neural networks by adjusting weights", emoji: "↩️" },
      { term: "Loss Function", definition: "Measures how wrong the model's predictions are", emoji: "📉" },
      { term: "Epoch", definition: "One complete pass through the training data", emoji: "🔄" },
      { term: "Overfitting", definition: "When a model memorizes training data instead of learning patterns", emoji: "🎯" },
    ],
    warmUp: {
      question: "How do you think self-driving cars learn to recognize stop signs?",
      discussion: "They use neural networks trained on millions of images! Today you'll train a neural network on real C. elegans data to predict behavior.",
    },
    steps: [
      {
        id: "step1",
        title: "Architecture Design",
        script: "You're designing a neural network to predict worm movement from sensory input. Add layers, adjust neuron counts, and choose activation functions. Consider: How many hidden layers do you need?",
        interactionType: "build",
        visualCue: "Network architecture builder",
        successCriteria: "Student creates valid network architecture",
        hint: "Start with 2-3 layers and adjust based on results!",
      },
      {
        id: "step2",
        title: "Configure Training",
        script: "You need to set hyperparameters. Choose your learning rate (too high = unstable, too low = slow), epochs, and batch size. These affect how your network learns.",
        interactionType: "adjust",
        visualCue: "Hyperparameter configuration panel",
        successCriteria: "Student configures reasonable hyperparameters",
        hint: "Start with learning rate 0.01 and adjust from there!",
      },
      {
        id: "step3",
        title: "Train and Monitor",
        script: "You're training your network! Watch the loss curve in real-time. If it plateaus, you might need to adjust hyperparameters. If it oscillates, your learning rate might be too high.",
        interactionType: "observe",
        visualCue: "Real-time training visualization with loss graph",
        successCriteria: "Student observes training dynamics",
        hint: "Look for a smoothly decreasing loss curve!",
      },
      {
        id: "step4",
        title: "Evaluate Performance",
        script: "You trained your model! Now test it on data it hasn't seen. Compare training accuracy to test accuracy. A big gap means overfitting. What's your model's performance?",
        interactionType: "analyze",
        visualCue: "Confusion matrix and accuracy metrics",
        successCriteria: "Student analyzes model performance",
        hint: "Good models have similar training and test accuracy!",
      },
      {
        id: "step5",
        title: "Iterate and Improve",
        script: "You analyzed your first model. Now improve it! Try adding dropout layers to prevent overfitting, or adjust your architecture based on the errors you saw. Can you beat your previous accuracy?",
        interactionType: "build",
        visualCue: "Model comparison interface",
        successCriteria: "Student improves model performance",
        hint: "Focus on the types of errors your model makes!",
      },
    ],
    wrapUp: {
      review: "You designed, trained, and evaluated a neural network using real biological data! You practiced the iterative process that AI researchers use daily.",
      realWorldConnection: "Companies like Google DeepMind use these exact techniques to understand brain function. Your model could contribute to real neuroscience!",
      takeHome: "Research 'Google DeepMind AlphaFold' and write a paragraph about how AI is transforming biology.",
    },
    assessment: {
      formative: [
        "Can the student design appropriate network architectures?",
        "Can the student interpret training dynamics?",
        "Can the student iterate on models based on performance?",
      ],
      summative: "Student demonstrates understanding of ML pipeline applied to biological data",
    },
  },
  {
    id: "high-openworm-contribution",
    gradeLevel: "high",
    title: "OpenWorm Contribution Project",
    subtitle: "Real Scientific Research",
    duration: "Multi-session project",
    objectives: [
      { id: "obj1", text: "You will analyze real OpenWorm simulation data" },
      { id: "obj2", text: "You will identify discrepancies between model and biology" },
      { id: "obj3", text: "You will propose and test improvements" },
    ],
    vocabulary: [
      { term: "Connectome", definition: "Complete map of neural connections", emoji: "🗺️" },
      { term: "Simulation", definition: "Computer model of a real system", emoji: "💻" },
      { term: "Validation", definition: "Checking if a model matches reality", emoji: "✅" },
      { term: "Parameter Fitting", definition: "Adjusting model values to match data", emoji: "🔧" },
    ],
    warmUp: {
      question: "What makes a good scientific model?",
      discussion: "A good model makes accurate predictions! But no model is perfect. Today you'll help improve the OpenWorm model by comparing it to real biological data.",
    },
    steps: [
      {
        id: "step1",
        title: "Load Real Data",
        script: "You have access to actual C. elegans behavioral data from scientific papers. Load the dataset and explore the movement patterns recorded from real worms.",
        interactionType: "analyze",
        visualCue: "Data loading and exploration interface",
        successCriteria: "Student explores dataset",
        hint: "Look at the velocity and turning patterns!",
      },
      {
        id: "step2",
        title: "Compare to Simulation",
        script: "You can run the OpenWorm simulation and compare its output to real worm data. Identify where the simulation matches and where it differs. Document the discrepancies.",
        interactionType: "analyze",
        visualCue: "Side-by-side comparison view",
        successCriteria: "Student identifies 3+ discrepancies",
        hint: "Pay attention to timing and magnitude of movements!",
      },
      {
        id: "step3",
        title: "Propose Improvements",
        script: "You found differences! Now hypothesize what could cause them. Is it a missing connection? Wrong synaptic weight? Write a research proposal for your improvement.",
        interactionType: "build",
        visualCue: "Proposal template interface",
        successCriteria: "Student creates research proposal",
        hint: "Be specific about what you'll change and why!",
      },
      {
        id: "step4",
        title: "Implement and Test",
        script: "You're ready to test your improvement! Modify the simulation parameters according to your proposal. Run the new simulation and compare to both the original and real data.",
        interactionType: "adjust",
        visualCue: "Parameter modification interface",
        successCriteria: "Student tests proposed improvement",
        hint: "Change one thing at a time!",
      },
      {
        id: "step5",
        title: "Document Findings",
        script: "You completed your research! Document your findings in a format suitable for the OpenWorm GitHub. Include your methodology, results, and interpretation. This could become a real contribution!",
        interactionType: "build",
        visualCue: "Research documentation template",
        successCriteria: "Student completes documentation",
        hint: "Be clear enough that another scientist could replicate your work!",
      },
    ],
    wrapUp: {
      review: "You participated in real scientific research! You analyzed data, identified problems, proposed solutions, and documented your work—exactly like professional researchers!",
      realWorldConnection: "Your findings could be submitted to the OpenWorm project. Student contributions have made it into the official codebase before!",
      takeHome: "Submit your proposal to the OpenWorm discussion forum and see if the community has feedback!",
    },
    assessment: {
      formative: [
        "Can the student analyze and compare datasets?",
        "Can the student form research proposals?",
        "Can the student document scientific work?",
      ],
      summative: "Student demonstrates ability to contribute to open-source scientific research",
    },
  },
];

// Public Mode: Open Challenges
export const PUBLIC_MODULES: EducationModule[] = [
  {
    id: "public-weekly-challenge",
    gradeLevel: "public",
    title: "Weekly Community Challenge",
    subtitle: "Open Exploration",
    duration: "Self-paced",
    objectives: [
      { id: "obj1", text: "You will explore neural circuits freely" },
      { id: "obj2", text: "You will share creations with the community" },
      { id: "obj3", text: "You will learn from others' approaches" },
    ],
    vocabulary: [],
    warmUp: {
      question: "What behavior do you want to create today?",
      discussion: "The sandbox is yours! Build whatever circuit you can imagine. This week's challenge: Create a worm that avoids light!",
    },
    steps: [
      {
        id: "step1",
        title: "Open Sandbox",
        script: "You have the full neuron palette available! Drag any neurons onto the canvas. Connect them however you want. There are no wrong answers in exploration!",
        interactionType: "build",
        visualCue: "Full sandbox with all tools",
        successCriteria: "User creates any circuit",
        hint: "Start with what interests you most!",
      },
      {
        id: "step2",
        title: "Test Your Creation",
        script: "You built something! Run the simulation and see what happens. Does it match what you expected? Science is full of surprises!",
        interactionType: "observe",
        visualCue: "Simulation viewer",
        successCriteria: "User runs simulation",
        hint: "Watch carefully for unexpected behaviors!",
      },
      {
        id: "step3",
        title: "Share with Community",
        script: "You can share your creation! Give it a name and description. Other users can like, comment, and even fork your circuit to build on it!",
        interactionType: "build",
        visualCue: "Sharing interface",
        successCriteria: "User shares creation",
        hint: "Good descriptions help others understand your design!",
      },
    ],
    wrapUp: {
      review: "You explored freely and contributed to the community! Check back to see if others have built on your work!",
      realWorldConnection: "Open-source science works the same way! Researchers share their work so others can build on it.",
      takeHome: "Check the community hub for interesting circuits to learn from!",
    },
    assessment: {
      formative: [
        "Did the user engage with the sandbox?",
        "Did the user share their creation?",
        "Did the user interact with community features?",
      ],
      summative: "User participates in community learning",
    },
  },
  {
    id: "public-speedrun",
    gradeLevel: "public",
    title: "Circuit Speedrun",
    subtitle: "Race Against Time",
    duration: "5-15 minutes",
    objectives: [
      { id: "obj1", text: "You will build functional circuits quickly" },
      { id: "obj2", text: "You will compete on the leaderboard" },
      { id: "obj3", text: "You will optimize for efficiency" },
    ],
    vocabulary: [],
    warmUp: {
      question: "Think you can build a working circuit in under 60 seconds?",
      discussion: "The timer starts when you click GO! Build the target behavior as fast as possible!",
    },
    steps: [
      {
        id: "step1",
        title: "Choose Challenge",
        script: "You see today's speedrun challenges! Pick your difficulty: Easy (forward movement), Medium (chemotaxis), Hard (avoidance behavior). Your time will be recorded!",
        interactionType: "tap",
        visualCue: "Challenge selection menu",
        successCriteria: "User selects challenge",
        hint: "Start easy to learn the mechanics!",
      },
      {
        id: "step2",
        title: "Build Fast!",
        script: "You're on the clock! Build the required behavior as fast as you can. Every second counts! Submit when you think it works!",
        interactionType: "build",
        visualCue: "Timed building interface with countdown",
        successCriteria: "User submits within time limit",
        hint: "Focus on function over aesthetics!",
      },
      {
        id: "step3",
        title: "Check Leaderboard",
        script: "You finished! See where you rank on the leaderboard. Can you beat the top time? Challenge yourself to improve!",
        interactionType: "observe",
        visualCue: "Leaderboard display",
        successCriteria: "User views results",
        hint: "Watch replays from top performers to learn tricks!",
      },
    ],
    wrapUp: {
      review: "You tested your speed and skill! Come back to beat your personal best!",
      realWorldConnection: "Scientists often have to work efficiently too! Quick iteration leads to faster discoveries!",
      takeHome: "Challenge a friend to beat your time!",
    },
    assessment: {
      formative: [
        "Did the user complete the challenge?",
        "Did the user create a functional circuit?",
        "Did the user engage with the leaderboard?",
      ],
      summative: "User demonstrates efficient circuit building",
    },
  },
];

// Get all modules for a specific grade level
export function getModulesByGrade(grade: EducationModule["gradeLevel"]): EducationModule[] {
  switch (grade) {
    case "prek":
      return PREK_MODULES;
    case "k5":
      return K5_MODULES;
    case "middle":
      return MIDDLE_MODULES;
    case "high":
      return HIGH_MODULES;
    case "public":
      return PUBLIC_MODULES;
    default:
      return [];
  }
}

// Get a specific module by ID
export function getModuleById(id: string): EducationModule | undefined {
  const allModules = [
    ...PREK_MODULES,
    ...K5_MODULES,
    ...MIDDLE_MODULES,
    ...HIGH_MODULES,
    ...PUBLIC_MODULES,
  ];
  return allModules.find((m) => m.id === id);
}

// Get the teacher script for a specific step
export function getStepScript(moduleId: string, stepId: string): string {
  const module = getModuleById(moduleId);
  const step = module?.steps.find((s) => s.id === stepId);
  return step?.script || "";
}
