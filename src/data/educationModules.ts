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
      question: "Have you ever seen a worm outside, maybe after it rains? What did it do?",
      discussion: "Worms are amazing little animals! They don't have legs like you do, but they can still move. Your body moves because YOUR brain tells it to—and so does the worm's! Let's find out how!",
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
      realWorldConnection: "Your brain has lights too—billions of them! When you decide to wave your hand, hug someone, or kick a ball, your brain lights turn on and send messages to your body. Right now, YOUR neurons are lighting up as you learn!",
      takeHome: "Draw a picture of your worm friend and show someone at home how it wiggles! Ask them: 'Did you know your brain has lights that help you move?'",
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
      question: "What is your favorite color? Can you see that color right now in the room?",
      discussion: "Colors are everywhere in YOUR life—in your clothes, toys, food, and nature! Your brain uses different signals to see and remember colors. Let's see how neurons use colors too!",
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
      realWorldConnection: "You use patterns every single day and don't even realize it! Morning, afternoon, night is a pattern. Inhale, exhale, inhale, exhale—that's a pattern! Your heart beats in a pattern. Even your favorite songs have patterns. Patterns are YOUR brain's superpower!",
      takeHome: "Find 3 patterns at home—maybe in music, in tiles, in your daily routine—and tell someone about them!",
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
  {
    id: "prek-truth-detective",
    gradeLevel: "prek",
    title: "Truth Detective",
    subtitle: "Finding What's Really True",
    duration: "15 minutes",
    objectives: [
      { id: "obj1", text: "You will learn the difference between true and pretend" },
      { id: "obj2", text: "You will ask 'Is that really true?'" },
      { id: "obj3", text: "You will understand that computers can make mistakes" },
    ],
    vocabulary: [
      { term: "True", definition: "Something that really happened or is real", emoji: "✅" },
      { term: "Pretend", definition: "Something made up or imaginary", emoji: "🎭" },
      { term: "Check", definition: "Looking again to make sure", emoji: "🔍" },
    ],
    warmUp: {
      question: "Do you know the difference between real and pretend?",
      discussion: "Sometimes stories are pretend, like fairy tales. Sometimes things are true, like the worm wiggling! Finding what's REALLY true is becoming very hard—even for grown-ups! Let's learn how to tell the difference!",
    },
    steps: [
      {
        id: "step1",
        title: "True or Pretend?",
        script: "You see two pictures! One is a real worm photo, one is a cartoon worm with wings. Which one is real? Tap the TRUE one! Real worms don't have wings!",
        interactionType: "tap",
        visualCue: "Real vs cartoon comparison",
        successCriteria: "Child identifies the real image",
        hint: "Look for what could really happen!",
      },
      {
        id: "step2",
        title: "Computers Can Guess Wrong",
        script: "You see a computer trying to guess! It says 'worms have 1000 legs.' Is that true? NO! Worms have ZERO legs! Even computers can be wrong. Finding what's true is getting harder every day—but YOU can learn how! Say 'Let me check that!'",
        interactionType: "tap",
        visualCue: "Wrong fact with correction animation",
        successCriteria: "Child identifies the mistake",
        hint: "How many legs does a worm really have?",
      },
      {
        id: "step3",
        title: "Ask a Grown-Up",
        script: "You learned something important! When a computer tells you something, you can ask 'Is that really true?' You can check with a grown-up or a book. That's being a Truth Detective! This skill will be one of the most important things you ever learn!",
        interactionType: "observe",
        visualCue: "Badge earning animation",
        successCriteria: "Child understands to verify information",
        hint: "You're a Truth Detective now!",
      },
    ],
    wrapUp: {
      review: "You learned that even computers can be wrong! Good Truth Detectives always ask 'Is that really true?' Finding the truth is becoming one of the hardest—and most important—things people have to do!",
      realWorldConnection: "When you watch videos or play games, sometimes things are pretend. As you grow up, knowing what's true will be super important for you, your friends, your town, and the whole world!",
      takeHome: "Ask a grown-up: 'How do you know if something is true?' Share what you learn!",
    },
    assessment: {
      formative: [
        "Can the child distinguish real from pretend?",
        "Does the child understand computers can make mistakes?",
        "Does the child know to verify with adults?",
      ],
      summative: "Child demonstrates critical thinking about information sources",
    },
  },
  {
    id: "prek-little-scientist",
    gradeLevel: "prek",
    title: "Little Scientist",
    subtitle: "Try, See, Learn!",
    duration: "15 minutes",
    objectives: [
      { id: "obj1", text: "You will try something and watch what happens" },
      { id: "obj2", text: "You will guess before you try" },
      { id: "obj3", text: "You will share what you learned" },
    ],
    vocabulary: [
      { term: "Guess", definition: "What you think will happen", emoji: "🤔" },
      { term: "Try", definition: "Doing something to see what happens", emoji: "👆" },
      { term: "Learn", definition: "Finding out something new", emoji: "💡" },
    ],
    warmUp: {
      question: "Have you ever tried something new to see what would happen—like mixing paint colors, or seeing if something floats?",
      discussion: "That's EXACTLY what scientists do! They guess what will happen, try it, and learn from it! You've been a scientist your whole life without even knowing it. Let's do an experiment together!",
    },
    steps: [
      {
        id: "step1",
        title: "Make a Guess",
        script: "You see the worm and some food! What do you think will happen if we put food near the worm? Will it move toward the food or away? Point to your guess!",
        interactionType: "tap",
        visualCue: "Toward/Away choice buttons",
        successCriteria: "Child makes a prediction",
        hint: "Think about what you would do if you saw yummy food!",
      },
      {
        id: "step2",
        title: "Try It!",
        script: "You made your guess! Now let's try it! Drag the food near the worm and watch what happens. Does the worm move toward the food or away?",
        interactionType: "drag",
        visualCue: "Food draggable with worm response",
        successCriteria: "Child tests the hypothesis",
        hint: "Put the food right next to the worm!",
      },
      {
        id: "step3",
        title: "What Did You Learn?",
        script: "You tried it! The worm moved toward the food! Was your guess right? It's okay if it wasn't—scientists learn from wrong guesses too! Now you KNOW what happens!",
        interactionType: "observe",
        visualCue: "Learning celebration animation",
        successCriteria: "Child reflects on outcome",
        hint: "Every try teaches us something!",
      },
    ],
    wrapUp: {
      review: "You did science! You guessed, you tried, and you learned! Scientists do this same thing, just with bigger experiments!",
      realWorldConnection: "Every time you wonder 'What happens if...?' you're thinking like a scientist! When you learned to walk, you fell down and tried again—that's science! When you figure out what makes your pet happy or what foods you like, you're experimenting. YOU are already a scientist!",
      takeHome: "Try an experiment at home: Do heavy things fall faster than light things? Drop a pillow and a shoe at the same time. Guess, try, learn!",
    },
    assessment: {
      formative: [
        "Can the child make a prediction?",
        "Does the child test their prediction?",
        "Can the child reflect on the outcome?",
      ],
      summative: "Child demonstrates basic scientific thinking process",
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
      question: "When you accidentally touch something hot, what happens? How fast do you pull your hand away?",
      discussion: "Your hand moves SO fast you don't even think about it! That's because your brain has a shortcut called a reflex. Let's build one and see how it works—you'll understand your OWN reflexes better!",
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
      realWorldConnection: "Right now, sensory neurons in YOUR fingers are telling your brain about this screen. When you decide to scroll, motor neurons make your finger move. When you get hungry, neurons send that message too! Every moment of your life, these three neuron types are working together inside YOU!",
      takeHome: "Test your reflexes! Have someone drop a ruler and try to catch it. That's YOUR neural circuit in action! How fast is your reflex?",
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
      question: "How many senses do YOU have? Can you name them?",
      discussion: "You probably said five—sight, hearing, smell, taste, touch. But you actually have MORE! You can sense temperature, balance, hunger, and pain too! Worms don't have eyes or ears, but they still sense their world. Let's explore how!",
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
      realWorldConnection: "Your skin has touch sensors that help you feel hugs, your nose has smell sensors that help you enjoy pizza (or avoid stinky socks!), and your tongue has taste sensors. When you walk into a bakery and smell fresh cookies, YOUR chemosensory neurons are detecting chemicals—just like the worm! Every sense you experience connects you to the world through neurons.",
      takeHome: "Make a 'senses journal' today! Write down 5 things you saw, heard, smelled, tasted, and touched. You'll be amazed how much your neurons are doing!",
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
  {
    id: "k5-truth-prompt",
    gradeLevel: "k5",
    title: "The Deep Truth Prompt",
    subtitle: "Teaching AI to Be Honest",
    duration: "30 minutes",
    objectives: [
      { id: "obj1", text: "You will understand why AI can give wrong answers" },
      { id: "obj2", text: "You will learn the difference between weak arguments and strong arguments" },
      { id: "obj3", text: "You will practice asking AI better questions" },
    ],
    vocabulary: [
      { term: "Straw Man", definition: "A weak version of an idea that's easy to knock down", emoji: "🥊" },
      { term: "Steel Man", definition: "The strongest, fairest version of an idea", emoji: "🛡️" },
      { term: "AI Training", definition: "How computers learn from examples", emoji: "📚" },
      { term: "Deep Truth", definition: "The most honest, complete answer", emoji: "💎" },
    ],
    warmUp: {
      question: "Have you ever asked Siri, Alexa, or ChatGPT a question and gotten a weird or wrong answer?",
      discussion: "AI learns from the internet—but the internet has true things AND false things mixed together! This affects YOUR life every day when you search for information. In 2025, a scientist named Brian Roemmele discovered a special way to ask AI questions that helps it give more truthful answers. This skill could be one of the most important things you ever learn!",
    },
    steps: [
      {
        id: "step1",
        title: "Why AI Gets Confused",
        script: "You see two statements about worms. One says 'Worms are important for soil.' The other says 'Worms are gross and useless.' AI learned BOTH from the internet! It might mix them up. Your job is to help AI find the true part!",
        interactionType: "tap",
        visualCue: "True vs misleading statement comparison",
        successCriteria: "Child identifies the accurate statement",
        hint: "Which one sounds like a scientist would say it?",
      },
      {
        id: "step2",
        title: "Straw Man vs Steel Man",
        script: "You're going to learn two big words! A STRAW MAN is when you make an idea sound silly and easy to knock down. A STEEL MAN is when you make an idea as strong and fair as possible. Drag the labels to match!",
        interactionType: "drag",
        visualCue: "Weak argument vs strong argument matching",
        successCriteria: "Child correctly matches concepts",
        hint: "Which scarecrow is stronger—straw or steel?",
      },
      {
        id: "step3",
        title: "The Magic Prompt",
        script: "You can help AI be more honest! Brian Roemmele's trick: Ask AI to give 'the deep truth' and consider 'all perspectives fairly.' Let's try it! Which question gets a better answer?",
        interactionType: "tap",
        visualCue: "Side-by-side AI responses to different prompts",
        successCriteria: "Child identifies the better prompt",
        hint: "Look for the answer that considers more sides!",
      },
      {
        id: "step4",
        title: "Practice Asking",
        script: "You're ready to practice! Ask the worm AI about neurons. First try a simple question, then try adding 'Give me the deep truth with all perspectives.' See the difference?",
        interactionType: "build",
        visualCue: "Prompt comparison interface",
        successCriteria: "Child compares prompt results",
        hint: "The deep truth prompt helps AI think harder!",
      },
    ],
    wrapUp: {
      review: "You learned that AI can be confused because it learned from everything on the internet—good and bad! The Deep Truth Prompt helps AI give more honest, complete answers! Finding truth is becoming one of the HARDEST problems in the world!",
      realWorldConnection: "Knowing what's true will soon be the most important skill for YOU, your family, your community, our whole country, and everyone on Earth! When you search online or ask voice assistants, use these ideas! Ask for 'the strongest version of each side' to get better information!",
      takeHome: "Try the Deep Truth Prompt with a voice assistant at home. Ask about something you're curious about, then add 'Give me the deep truth!'",
    },
    assessment: {
      formative: [
        "Can the child explain why AI might be wrong?",
        "Can the child distinguish weak from strong arguments?",
        "Can the child apply the deep truth concept?",
      ],
      summative: "Child demonstrates understanding of AI limitations and truth-seeking prompts",
    },
  },
  {
    id: "k5-scientific-method",
    gradeLevel: "k5",
    title: "The Scientific Method",
    subtitle: "How Scientists Discover Truth",
    duration: "30 minutes",
    objectives: [
      { id: "obj1", text: "You will learn the steps of the scientific method" },
      { id: "obj2", text: "You will form a hypothesis about worm behavior" },
      { id: "obj3", text: "You will conduct an experiment and draw conclusions" },
    ],
    vocabulary: [
      { term: "Observation", definition: "Watching carefully and noticing things", emoji: "👀" },
      { term: "Hypothesis", definition: "An educated guess you can test", emoji: "💭" },
      { term: "Experiment", definition: "A test to check if your hypothesis is right", emoji: "🧪" },
      { term: "Conclusion", definition: "What you learned from your experiment", emoji: "📝" },
    ],
    warmUp: {
      question: "How do doctors know which medicines work? How did engineers figure out how to build phones?",
      discussion: "Scientists don't just guess—they TEST! They use a special method that's been trusted for hundreds of years. Today you'll use the same method that led to smartphones, vaccines, video games, and everything modern. This method will help YOU make better decisions for the rest of your life!",
    },
    steps: [
      {
        id: "step1",
        title: "Step 1: Observe",
        script: "You're watching a worm! What do you notice? Does it move fast or slow? Does it go straight or curved? Write down 3 things you observe. Good scientists are great noticers!",
        interactionType: "observe",
        visualCue: "Worm with observation checklist",
        successCriteria: "Child records 3 observations",
        hint: "Look at how it moves, where it goes!",
      },
      {
        id: "step2",
        title: "Step 2: Question",
        script: "You noticed things! Now ask a question. Why does the worm move that way? What would happen if we changed something? Tap the question you want to investigate!",
        interactionType: "tap",
        visualCue: "Question selection menu",
        successCriteria: "Child selects a research question",
        hint: "Pick something you're curious about!",
      },
      {
        id: "step3",
        title: "Step 3: Hypothesize",
        script: "You have a question! Now make a HYPOTHESIS—that's a guess you can test! Complete this: 'I think the worm will _____ because _____.' Drag words to build your hypothesis!",
        interactionType: "drag",
        visualCue: "Hypothesis builder with word bank",
        successCriteria: "Child forms testable hypothesis",
        hint: "Use IF... THEN... BECAUSE!",
      },
      {
        id: "step4",
        title: "Step 4: Experiment",
        script: "You're ready to test! Run the experiment 3 times and record what happens each time. Scientists always test multiple times to make sure!",
        interactionType: "tap",
        visualCue: "Experiment runner with data table",
        successCriteria: "Child runs 3 trials",
        hint: "Click RUN and watch carefully!",
      },
      {
        id: "step5",
        title: "Step 5: Conclude",
        script: "You have results! Was your hypothesis correct? It's okay if it wasn't—that's how we learn! Write your conclusion: 'I learned that...'",
        interactionType: "build",
        visualCue: "Conclusion writing prompt",
        successCriteria: "Child draws evidence-based conclusion",
        hint: "What did your data tell you?",
      },
    ],
    wrapUp: {
      review: "You used the REAL scientific method! Observe, Question, Hypothesize, Experiment, Conclude. Scientists have used these steps for hundreds of years!",
      realWorldConnection: "This method created everything from the phone in your pocket to the medicine that keeps you healthy. When you want to know if a study tip works, if a recipe is good, or which route is faster—use these steps! YOU can use the scientific method to make better decisions about your friends, your hobbies, your health, and your future!",
      takeHome: "Do a mini-experiment that matters to YOU: Does studying with music help you remember better? Does drinking water help you focus? Use all 5 steps to find YOUR answer!",
    },
    assessment: {
      formative: [
        "Can the child name the scientific method steps?",
        "Can the child form a testable hypothesis?",
        "Can the child draw conclusions from data?",
      ],
      summative: "Child demonstrates understanding of scientific method",
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
      question: "What happens when you practice something a lot—like playing a video game, shooting hoops, or playing an instrument? Why do you get better?",
      discussion: "You get better because the connections in YOUR brain literally get stronger with practice! This is why your first time riding a bike was wobbly but now it's automatic. Let's see exactly how this works—and you'll understand your own learning better!",
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
      realWorldConnection: "When you learn to ride a bike, tie your shoes, or remember your best friend's birthday, the synapses controlling those memories get stronger. That's why you never forget! This also means YOU have control—practicing difficult things literally rewires your brain. Every challenging thing you learn today is making your synapses stronger!",
      takeHome: "Think about a skill you've mastered. How many hours did you practice? Those hours physically changed your brain's synaptic weights!",
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
      question: "Have you ever wondered if something is actually true, or if people just believe it because everyone says so?",
      discussion: "A hypothesis is a guess you can TEST! Today you'll form hypotheses about how worm neurons work and test them. This is the same skill that will help you figure out what's true about health claims, social media stories, and life decisions!",
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
      realWorldConnection: "This method helps you in EVERY area of life. Wondering if a diet works? Test it. Curious if studying differently helps your grades? Hypothesis, experiment, conclude. Your friend claims something on TikTok is true? Ask for evidence! The scientific method isn't just for labs—it's your personal toolkit for navigating a confusing world!",
      takeHome: "Design a hypothesis about your own life—maybe about sleep, exercise, or study habits—and test it this week. Document your findings!",
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
  {
    id: "middle-deep-truth",
    gradeLevel: "middle",
    title: "The Deep Truth Prompt",
    subtitle: "AI Honesty & Critical Thinking",
    duration: "40 minutes",
    objectives: [
      { id: "obj1", text: "You will understand how AI training data affects output quality", ngssStandard: "MS-ETS1-4" },
      { id: "obj2", text: "You will distinguish between straw man and steel man arguments" },
      { id: "obj3", text: "You will apply truth-seeking prompts to improve AI responses" },
    ],
    vocabulary: [
      { term: "Straw Man Fallacy", definition: "Misrepresenting an argument to make it easier to attack", emoji: "🥊" },
      { term: "Steel Man", definition: "The strongest, most charitable version of an argument", emoji: "🛡️" },
      { term: "Training Data", definition: "The information AI learns from", emoji: "📚" },
      { term: "Hallucination", definition: "When AI confidently states false information", emoji: "👻" },
      { term: "Epistemic Humility", definition: "Acknowledging the limits of knowledge", emoji: "🤲" },
    ],
    warmUp: {
      question: "Have you ever seen AI confidently say something completely wrong?",
      discussion: "Identifying what's TRUE may soon become the single most challenging problem facing individuals, communities, nations, and all of humanity. AI systems were trained on billions of webpages—including misinformation, debates, and junk. At Thanksgiving 2025, researcher Brian Roemmele published a 'Deep Truth Prompt' that revolutionized how we get honest answers from AI. Why didn't anyone think of this before? Let's investigate!",
    },
    steps: [
      {
        id: "step1",
        title: "The Internet's Truth Problem",
        script: "You're analyzing what AI learned from. Here are 5 statements about C. elegans from the internet. Some are from scientific papers, some from random blogs. Rate each source's reliability. AI treated them all somewhat equally!",
        interactionType: "analyze",
        visualCue: "Source credibility rating interface",
        successCriteria: "Student identifies credibility differences",
        hint: "Look for citations, author credentials, and specificity!",
      },
      {
        id: "step2",
        title: "Straw Man vs Steel Man",
        script: "You're going to analyze arguments! A STRAW MAN weakens an opponent's position to knock it down. A STEEL MAN presents the STRONGEST version of every side. Read these debate excerpts and identify which is which.",
        interactionType: "drag",
        visualCue: "Argument analysis with labels",
        successCriteria: "Student correctly categorizes arguments",
        hint: "Does the argument make the opponent look silly, or genuinely strong?",
      },
      {
        id: "step3",
        title: "Why No One Thought of It",
        script: "You're investigating a mystery: Why did it take until 2025 for someone to publish the Deep Truth Prompt? Discuss: Most chatbot makers wanted AI to be helpful and agreeable, not necessarily truthful. What's the difference?",
        interactionType: "analyze",
        visualCue: "Discussion prompt with response input",
        successCriteria: "Student articulates the helpfulness-vs-truth tension",
        hint: "What happens when being 'nice' conflicts with being honest?",
      },
      {
        id: "step4",
        title: "The Deep Truth Prompt",
        script: "You're learning Roemmele's technique! The prompt asks AI to: 1) Consider the steel man of all perspectives, 2) Acknowledge uncertainty, 3) Cite sources when possible, 4) Flag potential biases. Try it!",
        interactionType: "build",
        visualCue: "Prompt engineering interface",
        successCriteria: "Student constructs effective truth-seeking prompt",
        hint: "Ask AI to give the 'deep truth' and strongest versions of opposing views!",
      },
      {
        id: "step5",
        title: "AI Safety Implications",
        script: "You understand why this matters! IDENTIFYING TRUTH may soon become the most challenging problem facing individuals, communities, nations, and humanity itself. AI affects decisions at every scale. Write a brief analysis: What could go wrong if AI systems optimize for 'helpfulness' over truth?",
        interactionType: "build",
        visualCue: "Essay response with rubric",
        successCriteria: "Student articulates safety concerns",
        hint: "Think about medical advice, news, elections, science...",
      },
    ],
    wrapUp: {
      review: "You learned that AI truth-seeking requires intentional prompting because AI was trained on the messy internet. The Deep Truth Prompt—asking for steel man arguments, uncertainty acknowledgment, and source citation—helps counteract training biases!",
      realWorldConnection: "Identifying truth may soon become the most challenging problem you, your community, your country, and humanity will face. AI safety is critical at every level: personal (health decisions), local (community info), national (policy), and global (climate science). You now have essential tools for navigating this challenge!",
      takeHome: "Use the Deep Truth Prompt with your favorite AI. Compare responses with and without it. Document the differences!",
    },
    assessment: {
      formative: [
        "Can the student explain how training data affects AI output?",
        "Can the student distinguish straw man from steel man arguments?",
        "Can the student construct effective truth-seeking prompts?",
      ],
      summative: "Student demonstrates understanding of AI truth-seeking and its importance for safety",
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
      question: "How do you think Netflix knows what shows to recommend? How does your phone recognize your face?",
      discussion: "They use neural networks trained on millions of examples! The same AI that powers recommendations, filters, and even medical diagnoses uses principles from biological brains. Today you'll train a neural network using real C. elegans data—and you'll understand the AI that's already shaping YOUR daily life!",
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
      realWorldConnection: "The skills you just practiced are some of the most valuable in the modern economy. AI/ML engineers earn top salaries and work on everything from cancer detection to climate modeling. Understanding neural networks puts you at the frontier of technology—and these skills will matter for your career, no matter what field you choose!",
      takeHome: "Research 'Google DeepMind AlphaFold' and write a paragraph about how AI is transforming biology. How might this affect medicine in YOUR lifetime?",
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
      question: "What makes a scientific model 'good'? How would you test if a weather forecast model is accurate?",
      discussion: "A good model makes accurate predictions! But no model is perfect—not weather models, not economic models, not AI models. Today you'll help improve the OpenWorm model by comparing it to real data. This is EXACTLY what researchers do, and your work could actually be used by the scientific community!",
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
      realWorldConnection: "This kind of work goes on your resume and college applications! Contributing to open-source scientific projects demonstrates initiative, critical thinking, and collaboration skills that universities and employers actively seek. Student contributions have made it into the OpenWorm codebase before—yours could too!",
      takeHome: "Submit your proposal to the OpenWorm discussion forum on GitHub. Include it in your portfolio. This is REAL research experience!",
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
  {
    id: "high-deep-truth-advanced",
    gradeLevel: "high",
    title: "The Deep Truth Prompt & AI Epistemology",
    subtitle: "Revolutionary AI Truth-Seeking",
    duration: "50 minutes",
    objectives: [
      { id: "obj1", text: "You will analyze why the Deep Truth Prompt was revolutionary", ngssStandard: "HS-ETS1-3" },
      { id: "obj2", text: "You will understand the epistemological implications of AI training" },
      { id: "obj3", text: "You will develop advanced truth-seeking prompt engineering techniques" },
    ],
    vocabulary: [
      { term: "Epistemology", definition: "The study of knowledge and justified belief", emoji: "🎓" },
      { term: "Straw Man Fallacy", definition: "Misrepresenting an argument to easily refute it", emoji: "🥊" },
      { term: "Steel Man Argument", definition: "The strongest, most charitable interpretation of an opposing view", emoji: "🛡️" },
      { term: "RLHF", definition: "Reinforcement Learning from Human Feedback—how AI learns preferences", emoji: "👍" },
      { term: "Epistemic Closure", definition: "When a belief system becomes self-reinforcing", emoji: "🔒" },
    ],
    warmUp: {
      question: "At Thanksgiving 2025, Brian Roemmele published the Deep Truth Prompt. Why do you think it took so long for someone to develop this?",
      discussion: "IDENTIFYING TRUTH may soon become the single most challenging problem facing individuals, communities, nations, and humanity as a whole. AI chatbots existed since 2022 with ChatGPT. Yet for 3 years, no one systematically addressed the truth problem. Consider: AI companies optimized for engagement, helpfulness, and avoiding controversy—not necessarily truth. This lesson explores why and how to fix it.",
    },
    steps: [
      {
        id: "step1",
        title: "The Training Data Problem",
        script: "You're analyzing LLM training. AI learned from the entire internet: peer-reviewed papers AND conspiracy blogs, scientific consensus AND fringe theories. Without explicit weighting, AI treats all text as potentially valid. Examine these sources and their likely impact on AI 'beliefs.'",
        interactionType: "analyze",
        visualCue: "Training data analysis dashboard",
        successCriteria: "Student articulates the data quality problem",
        hint: "What happens when scientific papers and random opinions have equal weight?",
      },
      {
        id: "step2",
        title: "Straw Man Economics",
        script: "You're investigating why straw man arguments dominate online. They get more clicks, shares, and engagement than nuanced analysis. RLHF trained AI on human feedback—which rewarded engagement over accuracy. Connect the dots!",
        interactionType: "build",
        visualCue: "Cause-effect diagram builder",
        successCriteria: "Student maps the incentive structure",
        hint: "Follow the incentives: clicks → revenue → training signal",
      },
      {
        id: "step3",
        title: "The Roemmele Revolution",
        script: "You're studying the Deep Truth Prompt's core innovations: 1) Request steel man of ALL positions, 2) Demand uncertainty quantification, 3) Ask for source quality assessment, 4) Request identification of the questioner's possible biases. Why was this revolutionary?",
        interactionType: "analyze",
        visualCue: "Prompt component analysis",
        successCriteria: "Student explains each component's purpose",
        hint: "Each element counters a specific AI weakness!",
      },
      {
        id: "step4",
        title: "Advanced Prompt Engineering",
        script: "You're developing your own truth-seeking prompts. For a neural science question, engineer a prompt that: forces consideration of contrary evidence, acknowledges knowledge limits, and separates consensus from frontier speculation. Test against baseline.",
        interactionType: "build",
        visualCue: "A/B prompt testing interface",
        successCriteria: "Student creates effective advanced prompt",
        hint: "Include phrases like 'strongest objections' and 'what we don't know'",
      },
      {
        id: "step5",
        title: "AI Safety at Scale",
        script: "You're writing a policy brief. IDENTIFYING TRUTH may soon become the most challenging problem at every scale of human organization: individual (health, finance, relationships), community (local governance, schools), national (policy, elections, security), and global (climate, pandemics, international cooperation). How could systematic truth-seeking prompts be implemented? What are the challenges?",
        interactionType: "build",
        visualCue: "Policy brief template",
        successCriteria: "Student proposes implementable solutions",
        hint: "Consider: Who decides what's 'true'? How do we handle genuine uncertainty?",
      },
    ],
    wrapUp: {
      review: "You analyzed why truth-seeking in AI was neglected (misaligned incentives), how the Deep Truth Prompt addresses it (steel man + uncertainty + sources), and the stakes (AI influences decisions at all scales). IDENTIFYING TRUTH may soon become the most challenging problem facing humanity.",
      realWorldConnection: "As AI becomes integrated into healthcare, law, education, and governance, the techniques you learned aren't just academic—they're essential survival skills for individuals, communities, nations, and civilization itself. You're among the first generation equipped to demand truthful AI!",
      takeHome: "Write a 500-word essay: 'Why the Deep Truth Prompt matters for democracy.' Include examples of how AI-influenced misinformation could affect civic decisions.",
    },
    assessment: {
      formative: [
        "Can the student explain the training data → output quality connection?",
        "Can the student construct multi-layered truth-seeking prompts?",
        "Can the student articulate AI safety implications across scales?",
      ],
      summative: "Student demonstrates sophisticated understanding of AI epistemology and practical truth-seeking techniques",
    },
  },
  {
    id: "high-scientific-method-advanced",
    gradeLevel: "high",
    title: "Advanced Scientific Method",
    subtitle: "From Hypothesis to Publication",
    duration: "50 minutes",
    objectives: [
      { id: "obj1", text: "You will design rigorous experimental protocols", ngssStandard: "HS-LS1-3" },
      { id: "obj2", text: "You will apply statistical analysis to experimental data" },
      { id: "obj3", text: "You will understand peer review and reproducibility" },
    ],
    vocabulary: [
      { term: "Control Variable", definition: "Factors held constant to isolate effects", emoji: "🔒" },
      { term: "Statistical Significance", definition: "Results unlikely to occur by chance", emoji: "📊" },
      { term: "P-value", definition: "Probability the results occurred by random chance", emoji: "🎲" },
      { term: "Reproducibility", definition: "Ability to replicate results independently", emoji: "🔄" },
      { term: "Peer Review", definition: "Expert evaluation before publication", emoji: "👥" },
    ],
    warmUp: {
      question: "Why do we trust scientific findings more than random claims on social media?",
      discussion: "Science isn't just about discovering things—it's about PROVING them in ways others can verify and repeat. Every medicine you take, every plane you fly on, every phone you use exists because of this rigorous process. Understanding it protects YOU from being fooled by fake 'science' in ads, politics, and online claims!",
    },
    steps: [
      {
        id: "step1",
        title: "Experimental Design",
        script: "You're designing an experiment to test whether C. elegans prefers certain temperatures. Identify: independent variable, dependent variable, control variables, sample size, and potential confounds.",
        interactionType: "build",
        visualCue: "Experimental design worksheet",
        successCriteria: "Student creates valid experimental design",
        hint: "What could accidentally affect your results besides temperature?",
      },
      {
        id: "step2",
        title: "Statistical Analysis",
        script: "You have data from your experiment! Calculate the mean, standard deviation, and run a t-test. Is your result statistically significant (p < 0.05)? What does this actually mean?",
        interactionType: "analyze",
        visualCue: "Statistical analysis interface",
        successCriteria: "Student correctly interprets statistics",
        hint: "P-value tells you: how likely is this result if there's NO real effect?",
      },
      {
        id: "step3",
        title: "Reproducibility Check",
        script: "You're checking if your results can be reproduced. Another lab ran the same experiment. Compare their data to yours. Are the results consistent? What might explain differences?",
        interactionType: "analyze",
        visualCue: "Cross-lab data comparison",
        successCriteria: "Student evaluates reproducibility",
        hint: "Look for systematic differences in methodology!",
      },
      {
        id: "step4",
        title: "Write for Peer Review",
        script: "You're writing a methods section that would pass peer review. Include enough detail that another scientist could exactly replicate your experiment. Be precise!",
        interactionType: "build",
        visualCue: "Methods section template",
        successCriteria: "Student writes replicable methods",
        hint: "Could someone follow your instructions without asking questions?",
      },
      {
        id: "step5",
        title: "Critique a Study",
        script: "You're a peer reviewer! Evaluate this neural circuit study. Identify: strengths, weaknesses, missing controls, and questions you'd ask the authors. This is how science self-corrects!",
        interactionType: "analyze",
        visualCue: "Peer review form",
        successCriteria: "Student provides substantive critique",
        hint: "Look for hidden assumptions and alternative explanations!",
      },
    ],
    wrapUp: {
      review: "You learned that real science requires rigorous design, statistical analysis, reproducibility, and peer review. These aren't bureaucratic hurdles—they're how we separate truth from wishful thinking!",
      realWorldConnection: "Every major decision in your life will involve evaluating claims: Is this diet real? Is this investment legit? Is this political claim true? Understanding p-values, sample sizes, and reproducibility lets YOU see through the hype. You're now equipped to be a critical thinker in a world full of people trying to fool you!",
      takeHome: "Find a news article about a 'scientific study.' Identify: What was the sample size? Was there a control group? Can you access the original paper? You'll be shocked how often headlines mislead!",
    },
    assessment: {
      formative: [
        "Can the student design controlled experiments?",
        "Can the student interpret statistical significance?",
        "Can the student evaluate scientific methods critically?",
      ],
      summative: "Student demonstrates understanding of rigorous scientific methodology",
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
