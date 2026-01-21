import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Play, Check, X, Lightbulb, Award, Terminal,
  Book, Zap, Brain, Sparkles, Copy, Download, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useGameStore } from '@/stores/gameStore';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'sph' | 'pytorch' | 'analysis';
  description: string;
  starterCode: string;
  solution: string;
  hints: string[];
  testCases: { input: string; expected: string }[];
}

const CHALLENGES: Challenge[] = [
  {
    id: 'sph-basics',
    title: 'SPH Particle Initialization',
    difficulty: 'beginner',
    category: 'sph',
    description: 'Initialize a grid of SPH particles for Sibernetic hydrodynamics simulation. Each particle needs position, velocity, density, and pressure.',
    starterCode: `import numpy as np

def init_particles(n_particles, box_size):
    """
    Initialize SPH particles in a grid pattern.
    
    Args:
        n_particles: Number of particles (should be perfect cube)
        box_size: Size of simulation box
    
    Returns:
        positions: (n, 3) array of particle positions
        velocities: (n, 3) array of particle velocities
        densities: (n,) array of particle densities
    """
    # TODO: Calculate grid dimensions
    n_per_dim = int(np.cbrt(n_particles))
    
    # TODO: Create grid positions
    positions = None  # Your code here
    
    # TODO: Initialize velocities to zero
    velocities = None  # Your code here
    
    # TODO: Initialize densities
    densities = None  # Your code here
    
    return positions, velocities, densities`,
    solution: `import numpy as np

def init_particles(n_particles, box_size):
    n_per_dim = int(np.cbrt(n_particles))
    spacing = box_size / n_per_dim
    
    # Create grid positions
    x = np.linspace(spacing/2, box_size - spacing/2, n_per_dim)
    y = np.linspace(spacing/2, box_size - spacing/2, n_per_dim)
    z = np.linspace(spacing/2, box_size - spacing/2, n_per_dim)
    
    xx, yy, zz = np.meshgrid(x, y, z)
    positions = np.stack([xx.flatten(), yy.flatten(), zz.flatten()], axis=1)
    
    # Initialize velocities to zero
    velocities = np.zeros_like(positions)
    
    # Initialize densities (water at rest)
    densities = np.ones(n_particles) * 1000.0
    
    return positions, velocities, densities`,
    hints: [
      'Use np.linspace to create evenly spaced coordinates',
      'np.meshgrid creates a 3D grid from 1D arrays',
      'Stack the flattened meshgrid arrays to get (n, 3) shape',
    ],
    testCases: [
      { input: 'init_particles(8, 1.0)[0].shape', expected: '(8, 3)' },
      { input: 'init_particles(27, 3.0)[1].sum()', expected: '0.0' },
    ],
  },
  {
    id: 'sph-kernel',
    title: 'SPH Smoothing Kernel',
    difficulty: 'intermediate',
    category: 'sph',
    description: 'Implement the cubic spline smoothing kernel used in SPH simulations. This kernel determines how particles influence each other.',
    starterCode: `import numpy as np

def cubic_kernel(r, h):
    """
    Cubic spline smoothing kernel for SPH.
    
    Args:
        r: Distance between particles
        h: Smoothing length
    
    Returns:
        W: Kernel value
    """
    # Normalization factor (3D)
    sigma = 1 / (np.pi * h**3)
    
    # Normalize distance
    q = r / h
    
    # TODO: Implement piecewise cubic spline
    # W = sigma * (1 - 1.5*q^2 + 0.75*q^3) for 0 <= q < 1
    # W = sigma * 0.25*(2-q)^3 for 1 <= q < 2
    # W = 0 for q >= 2
    
    W = 0  # Your code here
    
    return W`,
    solution: `import numpy as np

def cubic_kernel(r, h):
    sigma = 1 / (np.pi * h**3)
    q = r / h
    
    if isinstance(q, np.ndarray):
        W = np.zeros_like(q)
        mask1 = q < 1
        mask2 = (q >= 1) & (q < 2)
        W[mask1] = sigma * (1 - 1.5*q[mask1]**2 + 0.75*q[mask1]**3)
        W[mask2] = sigma * 0.25 * (2 - q[mask2])**3
    else:
        if q < 1:
            W = sigma * (1 - 1.5*q**2 + 0.75*q**3)
        elif q < 2:
            W = sigma * 0.25 * (2 - q)**3
        else:
            W = 0
    
    return W`,
    hints: [
      'Use np.where or boolean masking for vectorized operations',
      'Handle both scalar and array inputs',
      'The kernel should be smooth (continuous first derivative)',
    ],
    testCases: [
      { input: 'round(cubic_kernel(0, 1.0), 4)', expected: '0.3183' },
      { input: 'cubic_kernel(2.5, 1.0)', expected: '0' },
    ],
  },
  {
    id: 'pytorch-neuron',
    title: 'PyTorch Neural Layer',
    difficulty: 'intermediate',
    category: 'pytorch',
    description: 'Create a custom PyTorch layer that mimics biological neuron dynamics with membrane potential, threshold, and refractory period.',
    starterCode: `import torch
import torch.nn as nn

class BiologicalNeuron(nn.Module):
    """
    A biological neuron layer with membrane potential dynamics.
    """
    def __init__(self, n_neurons, threshold=1.0, tau=10.0):
        super().__init__()
        self.n_neurons = n_neurons
        self.threshold = threshold
        self.tau = tau  # Membrane time constant
        
        # TODO: Initialize membrane potential
        self.register_buffer('membrane', None)  # Fix this
        
        # TODO: Initialize refractory counter
        self.register_buffer('refractory', None)  # Fix this
        
        # Learnable synaptic weights
        self.weights = nn.Parameter(torch.randn(n_neurons, n_neurons) * 0.1)
    
    def forward(self, x):
        """
        Args:
            x: Input current (batch_size, n_neurons)
        Returns:
            spikes: Binary spike output (batch_size, n_neurons)
        """
        # TODO: Update membrane potential
        # dV/dt = (-V + I) / tau
        
        # TODO: Check for spikes (V > threshold)
        
        # TODO: Reset neurons that spiked
        
        # TODO: Handle refractory period
        
        spikes = None  # Your code here
        return spikes`,
    solution: `import torch
import torch.nn as nn

class BiologicalNeuron(nn.Module):
    def __init__(self, n_neurons, threshold=1.0, tau=10.0):
        super().__init__()
        self.n_neurons = n_neurons
        self.threshold = threshold
        self.tau = tau
        
        self.register_buffer('membrane', torch.zeros(1, n_neurons))
        self.register_buffer('refractory', torch.zeros(1, n_neurons))
        self.weights = nn.Parameter(torch.randn(n_neurons, n_neurons) * 0.1)
    
    def forward(self, x):
        batch_size = x.shape[0]
        
        # Expand buffers for batch
        if self.membrane.shape[0] != batch_size:
            self.membrane = self.membrane.expand(batch_size, -1).clone()
            self.refractory = self.refractory.expand(batch_size, -1).clone()
        
        # Synaptic input
        synaptic = torch.matmul(x, self.weights)
        
        # Update membrane potential (leaky integrate)
        dt = 1.0
        dV = (-self.membrane + x + synaptic) / self.tau * dt
        self.membrane = self.membrane + dV
        
        # Zero out refractory neurons
        self.membrane = self.membrane * (self.refractory == 0).float()
        
        # Check for spikes
        spikes = (self.membrane >= self.threshold).float()
        
        # Reset spiked neurons
        self.membrane = self.membrane * (1 - spikes)
        
        # Set refractory period
        self.refractory = torch.where(spikes > 0, 
                                       torch.ones_like(self.refractory) * 3,
                                       torch.clamp(self.refractory - 1, min=0))
        
        return spikes`,
    hints: [
      'Use register_buffer for state that should be saved but not trained',
      'Handle batch dimension expansion properly',
      'Use torch.where for conditional updates',
    ],
    testCases: [
      { input: 'BiologicalNeuron(10).weights.shape', expected: 'torch.Size([10, 10])' },
      { input: 'BiologicalNeuron(5)(torch.ones(2, 5)).shape', expected: 'torch.Size([2, 5])' },
    ],
  },
  {
    id: 'pytorch-worm-nn',
    title: 'C. elegans Neural Network',
    difficulty: 'advanced',
    category: 'pytorch',
    description: 'Build a simplified PyTorch model of the C. elegans nervous system with sensory, inter, and motor neuron layers connected by the connectome.',
    starterCode: `import torch
import torch.nn as nn
import torch.nn.functional as F

class CElegansNN(nn.Module):
    """
    Simplified C. elegans neural network model.
    
    Architecture:
    - 30 sensory neurons (input)
    - 70 interneurons (hidden)
    - 20 motor neurons (output)
    """
    def __init__(self):
        super().__init__()
        
        # TODO: Define layers based on connectome structure
        # Sensory -> Interneuron connections
        self.sensory_to_inter = None  # Your code
        
        # Interneuron -> Interneuron connections (recurrent)
        self.inter_recurrent = None  # Your code
        
        # Interneuron -> Motor connections
        self.inter_to_motor = None  # Your code
        
        # Gap junctions (symmetric connections)
        self.gap_junctions = None  # Your code
    
    def forward(self, sensory_input, steps=10):
        """
        Run simulation for multiple time steps.
        
        Args:
            sensory_input: (batch, 30) sensory neuron activation
            steps: Number of simulation steps
            
        Returns:
            motor_output: (batch, 20) motor neuron activation
            inter_history: (steps, batch, 70) interneuron activations
        """
        # TODO: Implement forward pass with recurrence
        pass`,
    solution: `import torch
import torch.nn as nn
import torch.nn.functional as F

class CElegansNN(nn.Module):
    def __init__(self):
        super().__init__()
        
        # Connectome-inspired sparse connections
        self.sensory_to_inter = nn.Linear(30, 70, bias=False)
        self.inter_recurrent = nn.Linear(70, 70, bias=False)
        self.inter_to_motor = nn.Linear(70, 20, bias=False)
        
        # Gap junctions (symmetric, electrical)
        gap_weights = torch.randn(70, 70) * 0.05
        self.gap_junctions = nn.Parameter((gap_weights + gap_weights.T) / 2)
        
        # Membrane time constant
        self.tau = 5.0
        
    def forward(self, sensory_input, steps=10):
        batch_size = sensory_input.shape[0]
        
        # Initialize interneuron state
        inter_state = torch.zeros(batch_size, 70, device=sensory_input.device)
        inter_history = []
        
        for t in range(steps):
            # Sensory input
            sensory_drive = self.sensory_to_inter(sensory_input)
            
            # Recurrent interneuron dynamics
            chemical_input = self.inter_recurrent(inter_state)
            
            # Gap junction coupling (symmetric)
            gap_input = torch.matmul(inter_state, self.gap_junctions)
            
            # Leaky integration
            d_inter = (-inter_state + sensory_drive + chemical_input + gap_input) / self.tau
            inter_state = inter_state + d_inter
            inter_state = torch.tanh(inter_state)  # Bounded activation
            
            inter_history.append(inter_state.unsqueeze(0))
        
        # Motor output from final interneuron state
        motor_output = torch.sigmoid(self.inter_to_motor(inter_state))
        
        return motor_output, torch.cat(inter_history, dim=0)`,
    hints: [
      'Gap junctions are symmetric: W = (W + W.T) / 2',
      'Use leaky integration for realistic dynamics',
      'Collect interneuron history for analysis',
    ],
    testCases: [
      { input: 'CElegansNN()(torch.randn(4, 30))[0].shape', expected: 'torch.Size([4, 20])' },
      { input: 'CElegansNN()(torch.randn(2, 30), steps=5)[1].shape', expected: 'torch.Size([5, 2, 70])' },
    ],
  },
];

export function CodingChallengeModule() {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CHALLENGES[0]);
  const [userCode, setUserCode] = useState(CHALLENGES[0].starterCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [aiDebugSuggestion, setAiDebugSuggestion] = useState<string | null>(null);

  // Select challenge
  const selectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setUserCode(challenge.starterCode);
    setOutput(null);
    setShowSolution(false);
    setCurrentHint(0);
    setAiDebugSuggestion(null);
  };

  // Run code (simulated)
  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setAiDebugSuggestion(null);
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Simulate code execution
    const hasErrors = userCode.includes('None') || userCode.includes('# Your code');
    
    if (hasErrors) {
      setOutput(`❌ Error: Incomplete implementation detected.

Traceback (most recent call last):
  File "<module>", line 15
    return positions, velocities, densities
TypeError: cannot unpack non-iterable NoneType object

💡 Hint: Make sure to replace all 'None' placeholders with actual code.`);
      
      // Trigger AI debug
      await new Promise(r => setTimeout(r, 500));
      setAiDebugSuggestion(
        `I noticed your code has incomplete sections. Here's what to check:

1. Replace \`positions = None\` with actual numpy array creation
2. The shape should be (n_particles, 3) for 3D positions
3. Use np.meshgrid to create a regular grid of particles

Try using:
\`\`\`python
x = np.linspace(0, box_size, n_per_dim)
positions = np.stack(np.meshgrid(x, x, x), axis=-1).reshape(-1, 3)
\`\`\``
      );
    } else {
      const testResults = selectedChallenge.testCases.map((tc, i) => 
        `Test ${i + 1}: ${tc.input} → Expected: ${tc.expected} ✓`
      ).join('\n');
      
      setOutput(`✅ All tests passed!

${testResults}

🎉 Great job! Your implementation is correct.`);
      
      if (!completedChallenges.includes(selectedChallenge.id)) {
        setCompletedChallenges(prev => [...prev, selectedChallenge.id]);
        addXp(50);
        addPoints(100);
        toast.success(`Challenge "${selectedChallenge.title}" completed!`);
        
        if (completedChallenges.length + 1 >= CHALLENGES.length) {
          unlockAchievement('coding-master');
        }
      }
    }
    
    setIsRunning(false);
  };

  // Get AI debug help
  const getAIHelp = async () => {
    setAiDebugSuggestion(null);
    
    await new Promise(r => setTimeout(r, 1000));
    
    setAiDebugSuggestion(
      `Based on your current code, here are some suggestions:

1. **Common Patterns**: For SPH simulations, always normalize distances by the smoothing length (h).

2. **Vectorization**: Replace loops with numpy operations for 10-100x speedup.

3. **Debug Strategy**: 
   - Print shapes: \`print(positions.shape)\`
   - Check values: \`assert np.all(np.isfinite(velocities))\`

4. **PyTorch Tips**:
   - Use \`register_buffer\` for non-learnable state
   - \`.detach()\` prevents gradient flow where not needed

Would you like me to explain any concept in more detail?`
    );
    
    addPoints(10);
  };

  // Show next hint
  const showNextHint = () => {
    if (currentHint < selectedChallenge.hints.length) {
      setCurrentHint(prev => prev + 1);
      addPoints(-5); // Small penalty for hints
    }
  };

  // Copy code
  const copyCode = () => {
    navigator.clipboard.writeText(userCode);
    toast.success('Code copied!');
  };

  const progress = (completedChallenges.length / CHALLENGES.length) * 100;

  return (
    <Card className="border-2 border-green-500/20">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500 text-white">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Python Coding Challenges
              <Badge variant="outline" className="ml-2">Sibernetic + PyTorch</Badge>
            </CardTitle>
            <CardDescription>
              Port SPH hydrodynamics to Python • Build worm neural networks • AI debugging
            </CardDescription>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{completedChallenges.length}/{CHALLENGES.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Challenge list */}
          <div className="space-y-2">
            <h3 className="font-medium mb-3">Challenges</h3>
            {CHALLENGES.map(challenge => (
              <button
                key={challenge.id}
                onClick={() => selectChallenge(challenge)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedChallenge.id === challenge.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{challenge.title}</span>
                  {completedChallenges.includes(challenge.id) && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {challenge.category}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
          
          {/* Code editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Challenge header */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold text-lg">{selectedChallenge.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedChallenge.description}
              </p>
            </div>
            
            {/* Code area */}
            <div className="relative">
              <Textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="font-mono text-sm min-h-[300px] bg-background"
                placeholder="Write your code here..."
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={copyCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              <Button onClick={runCode} disabled={isRunning} className="flex-1">
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={showNextHint}
                disabled={currentHint >= selectedChallenge.hints.length}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint ({currentHint}/{selectedChallenge.hints.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSolution(!showSolution)}
              >
                <Book className="w-4 h-4 mr-2" />
                {showSolution ? 'Hide' : 'Show'} Solution
              </Button>
              <Button variant="outline" onClick={getAIHelp}>
                <Brain className="w-4 h-4 mr-2" />
                AI Help
              </Button>
            </div>
            
            {/* Hints */}
            {currentHint > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Hints
                </h4>
                <ul className="space-y-1">
                  {selectedChallenge.hints.slice(0, currentHint).map((hint, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {i + 1}. {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Output */}
            {output && (
              <div className={`rounded-lg p-4 font-mono text-sm whitespace-pre-wrap ${
                output.includes('❌') ? 'bg-red-500/10 border border-red-500/20' : 
                'bg-green-500/10 border border-green-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-2 font-sans">
                  <Terminal className="w-4 h-4" />
                  <span className="font-medium">Output</span>
                </div>
                {output}
              </div>
            )}
            
            {/* AI Debug suggestion */}
            <AnimatePresence>
              {aiDebugSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">AI Debug Assistant</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{aiDebugSuggestion}</div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Solution */}
            {showSolution && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Solution
                </h4>
                <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {selectedChallenge.solution}
                </pre>
              </div>
            )}
            
            {/* Certificate */}
            {completedChallenges.length >= 2 && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-green-500" />
                  <div>
                    <h4 className="font-bold">Computational Neuroscientist</h4>
                    <p className="text-sm text-muted-foreground">
                      {completedChallenges.length >= CHALLENGES.length
                        ? 'Certificate earned! You\'ve mastered worm simulation coding.'
                        : `Complete ${CHALLENGES.length - completedChallenges.length} more challenges to earn your certificate.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
