import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Activity, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NeuronActivity {
  id: string;
  name: string;
  region: 'sensory' | 'motor' | 'inter' | 'memory';
  x: number;
  y: number;
  activity: number;
  description: string;
}

interface BrainActivityOverlayProps {
  activity: string;
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
  ageGroup?: 'prek' | 'k5' | 'middle' | 'high';
}

const BRAIN_REGIONS = {
  sensory: { color: 'hsl(var(--chart-1))', label: 'Sensory', description: 'Processing what you see and hear' },
  motor: { color: 'hsl(var(--chart-2))', label: 'Motor', description: 'Planning movements' },
  inter: { color: 'hsl(var(--chart-3))', label: 'Processing', description: 'Thinking and connecting ideas' },
  memory: { color: 'hsl(var(--chart-4))', label: 'Memory', description: 'Storing what you learn' },
};

const ACTIVITY_NEURON_MAP: Record<string, NeuronActivity[]> = {
  reading: [
    { id: 'visual', name: 'Visual Cortex', region: 'sensory', x: 75, y: 35, activity: 95, description: 'Reading these words right now!' },
    { id: 'language', name: 'Language Center', region: 'inter', x: 35, y: 45, activity: 88, description: 'Understanding the meaning' },
    { id: 'memory', name: 'Hippocampus', region: 'memory', x: 50, y: 65, activity: 72, description: 'Connecting to what you already know' },
  ],
  watching: [
    { id: 'visual', name: 'Visual Cortex', region: 'sensory', x: 75, y: 35, activity: 98, description: 'Processing the video' },
    { id: 'auditory', name: 'Auditory Cortex', region: 'sensory', x: 85, y: 50, activity: 85, description: 'Listening to sounds' },
    { id: 'attention', name: 'Prefrontal Cortex', region: 'inter', x: 25, y: 30, activity: 78, description: 'Staying focused' },
  ],
  thinking: [
    { id: 'prefrontal', name: 'Prefrontal Cortex', region: 'inter', x: 25, y: 30, activity: 92, description: 'Deep thinking happening!' },
    { id: 'parietal', name: 'Parietal Lobe', region: 'inter', x: 60, y: 25, activity: 85, description: 'Connecting different ideas' },
    { id: 'memory', name: 'Hippocampus', region: 'memory', x: 50, y: 65, activity: 88, description: 'Searching your memories' },
  ],
  answering: [
    { id: 'prefrontal', name: 'Prefrontal Cortex', region: 'inter', x: 25, y: 30, activity: 95, description: 'Making a decision' },
    { id: 'motor', name: 'Motor Cortex', region: 'motor', x: 45, y: 20, activity: 75, description: 'Getting ready to click' },
    { id: 'language', name: 'Language Center', region: 'inter', x: 35, y: 45, activity: 82, description: 'Forming your answer' },
  ],
  learning: [
    { id: 'hippocampus', name: 'Hippocampus', region: 'memory', x: 50, y: 65, activity: 98, description: 'Creating new memories!' },
    { id: 'prefrontal', name: 'Prefrontal Cortex', region: 'inter', x: 25, y: 30, activity: 88, description: 'Understanding new concepts' },
    { id: 'reward', name: 'Reward Center', region: 'inter', x: 50, y: 55, activity: 75, description: 'Feeling good about learning!' },
  ],
  building: [
    { id: 'motor', name: 'Motor Cortex', region: 'motor', x: 45, y: 20, activity: 90, description: 'Moving your hands' },
    { id: 'spatial', name: 'Parietal Lobe', region: 'inter', x: 60, y: 25, activity: 92, description: 'Spatial reasoning' },
    { id: 'planning', name: 'Prefrontal Cortex', region: 'inter', x: 25, y: 30, activity: 85, description: 'Planning your design' },
  ],
  quiz: [
    { id: 'memory', name: 'Hippocampus', region: 'memory', x: 50, y: 65, activity: 95, description: 'Retrieving what you learned' },
    { id: 'decision', name: 'Prefrontal Cortex', region: 'inter', x: 25, y: 30, activity: 92, description: 'Evaluating options' },
    { id: 'stress', name: 'Amygdala', region: 'inter', x: 55, y: 58, activity: 45, description: 'Staying calm under pressure' },
  ],
};

export function BrainActivityOverlay({
  activity,
  isVisible = true,
  onClose,
  className,
  ageGroup = 'k5',
}: BrainActivityOverlayProps) {
  const [expanded, setExpanded] = useState(false);
  const [neurons, setNeurons] = useState<NeuronActivity[]>([]);
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronActivity | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const baseNeurons = ACTIVITY_NEURON_MAP[activity] || ACTIVITY_NEURON_MAP.reading;
    setNeurons(baseNeurons);
  }, [activity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((p) => (p + 1) % 100);
      setNeurons((prev) =>
        prev.map((n) => ({
          ...n,
          activity: Math.max(20, Math.min(100, n.activity + (Math.random() - 0.5) * 10)),
        }))
      );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getAgeAppropriateDescription = useCallback(
    (neuron: NeuronActivity) => {
      if (ageGroup === 'prek') {
        const simple: Record<string, string> = {
          'Visual Cortex': '👀 Your seeing brain!',
          'Language Center': '💬 Your talking brain!',
          Hippocampus: '🧠 Your remembering brain!',
          'Auditory Cortex': '👂 Your listening brain!',
          'Prefrontal Cortex': '🤔 Your thinking brain!',
          'Motor Cortex': '🏃 Your moving brain!',
          'Parietal Lobe': '🧩 Your puzzle brain!',
          'Reward Center': '⭐ Your happy brain!',
          Amygdala: '💪 Your brave brain!',
        };
        return simple[neuron.name] || neuron.description;
      }
      return neuron.description;
    },
    [ageGroup]
  );

  const totalActivity = neurons.reduce((sum, n) => sum + n.activity, 0) / neurons.length;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          'fixed z-50 bg-card/95 backdrop-blur-md border-2 border-primary/30 rounded-2xl shadow-xl overflow-hidden',
          expanded ? 'inset-4 md:inset-8' : 'bottom-4 right-4 w-80 md:w-96',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="w-5 h-5 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <span className="font-semibold text-sm">Your Brain Right Now</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Brain Visualization */}
        <div className={cn('relative', expanded ? 'h-[60vh]' : 'h-48')}>
          <svg viewBox="0 0 100 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Brain outline */}
            <defs>
              <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Brain shape */}
            <ellipse cx="50" cy="45" rx="35" ry="30" fill="url(#brainGlow)" stroke="hsl(var(--border))" strokeWidth="0.5" />

            {/* Brain folds */}
            <path
              d="M25,35 Q35,25 50,28 Q65,25 75,35"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.3"
              strokeOpacity="0.5"
            />
            <path
              d="M20,50 Q40,45 50,48 Q60,45 80,50"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.3"
              strokeOpacity="0.5"
            />

            {/* Connection lines between active neurons */}
            {neurons.map((n1, i) =>
              neurons.slice(i + 1).map((n2, j) => (
                <motion.line
                  key={`${n1.id}-${n2.id}`}
                  x1={n1.x}
                  y1={n1.y}
                  x2={n2.x}
                  y2={n2.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.3"
                  strokeOpacity={0.2 + ((n1.activity + n2.activity) / 400)}
                  animate={{
                    strokeOpacity: [0.1, 0.4, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: (i + j) * 0.3,
                  }}
                />
              ))
            )}

            {/* Neurons */}
            {neurons.map((neuron) => (
              <g
                key={neuron.id}
                onClick={() => setSelectedNeuron(selectedNeuron?.id === neuron.id ? null : neuron)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow effect */}
                <motion.circle
                  cx={neuron.x}
                  cy={neuron.y}
                  r={4 + neuron.activity / 25}
                  fill={BRAIN_REGIONS[neuron.region].color}
                  fillOpacity={0.3}
                  animate={{
                    r: [4 + neuron.activity / 25, 6 + neuron.activity / 20, 4 + neuron.activity / 25],
                    fillOpacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {/* Core */}
                <motion.circle
                  cx={neuron.x}
                  cy={neuron.y}
                  r={2.5}
                  fill={BRAIN_REGIONS[neuron.region].color}
                  filter="url(#glow)"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                {/* Activity indicator */}
                <text
                  x={neuron.x}
                  y={neuron.y - 6}
                  textAnchor="middle"
                  fontSize="3"
                  fill="hsl(var(--foreground))"
                  fontWeight="bold"
                >
                  {Math.round(neuron.activity)}%
                </text>
              </g>
            ))}
          </svg>

          {/* Signal animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${50 + Math.sin(pulsePhase / 10) * 20}% ${50 + Math.cos(pulsePhase / 10) * 15}%, hsl(var(--primary) / 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Info Panel */}
        <div className="p-3 border-t border-border space-y-3">
          {/* Activity meter */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary/50 to-primary"
                animate={{ width: `${totalActivity}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-mono">{Math.round(totalActivity)}%</span>
          </div>

          {/* Selected neuron info */}
          <AnimatePresence mode="wait">
            {selectedNeuron ? (
              <motion.div
                key={selectedNeuron.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-2 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" style={{ color: BRAIN_REGIONS[selectedNeuron.region].color }} />
                  <span className="font-semibold text-sm">{selectedNeuron.name}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {BRAIN_REGIONS[selectedNeuron.region].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{getAgeAppropriateDescription(selectedNeuron)}</p>
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground text-center"
              >
                👆 Tap a glowing area to see what that part of your brain is doing!
              </motion.p>
            )}
          </AnimatePresence>

          {/* Legend */}
          {expanded && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              {Object.entries(BRAIN_REGIONS).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: value.color }} />
                  <span className="text-xs">{value.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default BrainActivityOverlay;
