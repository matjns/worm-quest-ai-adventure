import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Brain, Palette, Sliders, Cpu, Sparkles,
  ChevronRight, Star, Trophy, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FreePlayCanvas } from './FreePlayCanvas';
import { SimulationTweaker } from './SimulationTweaker';
import { NeuralNetTrainer } from './NeuralNetTrainer';

type AgeMode = 'prek' | 'elementary' | 'middle' | 'high' | 'sandbox';

interface ModeConfig {
  id: AgeMode;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  component: React.ReactNode;
}

interface AutonomousPlaygroundProps {
  initialMode?: AgeMode;
  onModeChange?: (mode: AgeMode) => void;
}

export function AutonomousPlayground({ initialMode = 'sandbox', onModeChange }: AutonomousPlaygroundProps) {
  const [selectedMode, setSelectedMode] = useState<AgeMode>(initialMode);
  const [showModeSelector, setShowModeSelector] = useState(true);

  const modes: ModeConfig[] = [
    {
      id: 'prek',
      title: 'Creative Canvas',
      subtitle: 'Ages 3-5',
      description: 'Tap, draw, and explore neurons with colors and sounds!',
      icon: <Palette className="w-6 h-6" />,
      color: 'from-pink-500 to-purple-500',
      features: ['Tap to create neurons', 'Beautiful colors', 'Fun sounds', 'Connect with lines'],
      component: <FreePlayCanvas />,
    },
    {
      id: 'elementary',
      title: 'Neuron Explorer',
      subtitle: 'Grades K-5',
      description: 'Build simple brain circuits and watch them light up!',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500',
      features: ['Drag & drop neurons', 'Simple connections', 'Watch signals flow', 'Earn stars'],
      component: <FreePlayCanvas />,
    },
    {
      id: 'middle',
      title: 'Simulation Lab',
      subtitle: 'Grades 6-8',
      description: 'Tweak parameters and experiment with worm behavior!',
      icon: <Sliders className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      features: ['Adjust signal speed', 'Test hypotheses', 'Environmental controls', 'Save experiments'],
      component: <SimulationTweaker />,
    },
    {
      id: 'high',
      title: 'Neural Net Studio',
      subtitle: 'Grades 9-12',
      description: 'Design and train your own neural networks!',
      icon: <Cpu className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      features: ['Build architectures', 'Train models', 'Analyze metrics', 'Export models'],
      component: <NeuralNetTrainer />,
    },
    {
      id: 'sandbox',
      title: 'Free Play',
      subtitle: 'All Ages',
      description: 'No rules, no limits—just explore and create!',
      icon: <Gamepad2 className="w-6 h-6" />,
      color: 'from-violet-500 to-indigo-500',
      features: ['All tools unlocked', 'No guidance', 'Pure exploration', 'Community sharing'],
      component: (
        <Tabs defaultValue="canvas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="network">Neural Net</TabsTrigger>
          </TabsList>
          <TabsContent value="canvas" className="mt-4">
            <FreePlayCanvas />
          </TabsContent>
          <TabsContent value="simulation" className="mt-4">
            <SimulationTweaker />
          </TabsContent>
          <TabsContent value="network" className="mt-4">
            <NeuralNetTrainer />
          </TabsContent>
        </Tabs>
      ),
    },
  ];

  const currentMode = modes.find(m => m.id === selectedMode) || modes[4];

  const selectMode = (mode: AgeMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    onModeChange?.(mode);
  };

  if (showModeSelector) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
          >
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-semibold">Autonomous Playground</span>
          </motion.div>
          <h2 className="text-2xl font-bold">Choose Your Adventure</h2>
          <p className="text-muted-foreground">
            No rules, no wrong answers—just explore!
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group overflow-hidden"
                onClick={() => selectMode(mode.id)}
              >
                <div className={`h-2 bg-gradient-to-r ${mode.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${mode.color} text-white`}>
                      {mode.icon}
                    </div>
                    <Badge variant="secondary">{mode.subtitle}</Badge>
                  </div>
                  <CardTitle className="mt-2">{mode.title}</CardTitle>
                  <CardDescription>{mode.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {mode.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-3 h-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-4 group-hover:bg-primary"
                    variant="outline"
                  >
                    Start Exploring
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>12,345 explorers today</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>89,012 creations shared</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${currentMode.color} text-white`}>
            {currentMode.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{currentMode.title}</h2>
            <p className="text-sm text-muted-foreground">{currentMode.description}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowModeSelector(true)}
        >
          Change Mode
        </Button>
      </div>

      {/* Mode Component */}
      <motion.div
        key={selectedMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentMode.component}
      </motion.div>
    </div>
  );
}
