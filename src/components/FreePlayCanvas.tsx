import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Wand2, Eraser, RotateCcw, Volume2, VolumeX, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ShareCreationDialog } from './ShareCreationDialog';
import { DiscoveryHintBubble } from './DiscoveryHintBubble';
import { useDiscoveryHints } from '@/hooks/useDiscoveryHints';

interface Neuron {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  pulseSpeed: number;
  connections: string[];
}

interface FreePlayCanvasProps {
  onCreationSaved?: (creation: { neurons: Neuron[]; name: string }) => void;
  ageGroup?: 'prek' | 'k5' | 'middle' | 'high';
}

const NEURON_COLORS = [
  { name: 'Pink', value: 'hsl(330, 100%, 70%)', emoji: '🌸' },
  { name: 'Blue', value: 'hsl(200, 100%, 60%)', emoji: '💙' },
  { name: 'Green', value: 'hsl(140, 70%, 50%)', emoji: '🌿' },
  { name: 'Yellow', value: 'hsl(50, 100%, 60%)', emoji: '⭐' },
  { name: 'Purple', value: 'hsl(280, 80%, 60%)', emoji: '💜' },
  { name: 'Orange', value: 'hsl(30, 100%, 60%)', emoji: '🧡' },
];

export function FreePlayCanvas({ onCreationSaved, ageGroup = 'k5' }: FreePlayCanvasProps) {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [selectedColor, setSelectedColor] = useState(NEURON_COLORS[0]);
  const [neuronSize, setNeuronSize] = useState([40]);
  const [isErasing, setIsErasing] = useState(false);
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { currentHint, isLoading, isVisible, getHint, dismissHint, clearHints } = useDiscoveryHints(ageGroup);

  const getCreationData = () => ({
    type: 'canvas' as const,
    neurons: neurons.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      color: n.color,
      connections: n.connections,
    })),
  });

  const playSound = (type: 'pop' | 'connect' | 'magic') => {
    if (!soundEnabled) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'pop') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'connect') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'magic') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isErasing || connectingFrom) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newNeuron: Neuron = {
      id: `neuron-${Date.now()}`,
      x,
      y,
      color: selectedColor.value,
      size: neuronSize[0],
      pulseSpeed: isMagicMode ? Math.random() * 2 + 0.5 : 1,
      connections: [],
    };
    
    setNeurons(prev => [...prev, newNeuron]);
    playSound(isMagicMode ? 'magic' : 'pop');
  };

  const handleNeuronClick = (e: React.MouseEvent, neuronId: string) => {
    e.stopPropagation();
    
    if (isErasing) {
      setNeurons(prev => prev.filter(n => n.id !== neuronId));
      playSound('pop');
      return;
    }
    
    if (connectingFrom) {
      if (connectingFrom !== neuronId) {
        setNeurons(prev => prev.map(n => {
          if (n.id === connectingFrom && !n.connections.includes(neuronId)) {
            return { ...n, connections: [...n.connections, neuronId] };
          }
          return n;
        }));
        playSound('connect');
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(neuronId);
    }
  };

  const clearCanvas = () => {
    setNeurons([]);
    setConnectingFrom(null);
    clearHints();
  };

  const getCircuitState = () => ({
    neurons: neurons.map(n => ({
      id: n.id,
      color: n.color,
      size: n.size,
      x: n.x,
      y: n.y,
    })),
    connections: neurons.flatMap(n => 
      n.connections.map(targetId => ({ from: n.id, to: targetId }))
    ),
  });

  const handleGetHint = () => {
    getHint(getCircuitState());
  };

  const addMagicNeurons = () => {
    const newNeurons: Neuron[] = [];
    for (let i = 0; i < 5; i++) {
      const randomColor = NEURON_COLORS[Math.floor(Math.random() * NEURON_COLORS.length)];
      newNeurons.push({
        id: `magic-${Date.now()}-${i}`,
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
        color: randomColor.value,
        size: Math.random() * 30 + 20,
        pulseSpeed: Math.random() * 2 + 0.5,
        connections: [],
      });
    }
    setNeurons(prev => [...prev, ...newNeurons]);
    playSound('magic');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 rounded-xl border-2 border-border">
        {/* Color Picker */}
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-muted-foreground" />
          {NEURON_COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                selectedColor.name === color.name ? 'border-primary scale-110' : 'border-border'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              <span className="sr-only">{color.name}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Size Slider */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="text-xs text-muted-foreground">Size:</span>
          <Slider
            value={neuronSize}
            onValueChange={setNeuronSize}
            min={20}
            max={80}
            step={5}
            className="w-20"
          />
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Tool Buttons */}
        <Button
          variant={isErasing ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setIsErasing(!isErasing); setConnectingFrom(null); }}
        >
          <Eraser className="w-4 h-4 mr-1" />
          Eraser
        </Button>

        <Button
          variant={isMagicMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsMagicMode(!isMagicMode)}
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Magic
        </Button>

        <Button variant="outline" size="sm" onClick={addMagicNeurons}>
          <Wand2 className="w-4 h-4 mr-1" />
          Add Magic
        </Button>

        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>

        <div className="w-px h-8 bg-border" />

        {/* Discovery Hint Button */}
        <DiscoveryHintBubble
          hint={currentHint}
          isVisible={isVisible}
          isLoading={isLoading}
          onDismiss={dismissHint}
          onGetHint={handleGetHint}
        />

        {neurons.length > 0 && (
          <ShareCreationDialog creationData={getCreationData()} canvasRef={canvasRef}>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </ShareCreationDialog>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`relative w-full h-[400px] bg-gradient-to-br from-background via-card to-background rounded-xl border-4 border-dashed border-border overflow-hidden cursor-crosshair ${
          isErasing ? 'cursor-not-allowed' : ''
        }`}
      >
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {neurons.map(neuron =>
            neuron.connections.map(targetId => {
              const target = neurons.find(n => n.id === targetId);
              if (!target) return null;
              return (
                <motion.line
                  key={`${neuron.id}-${targetId}`}
                  x1={neuron.x}
                  y1={neuron.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })
          )}
          {/* Connecting line preview */}
          {connectingFrom && (
            <motion.circle
              cx={neurons.find(n => n.id === connectingFrom)?.x}
              cy={neurons.find(n => n.id === connectingFrom)?.y}
              r="8"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
          )}
        </svg>

        {/* Neurons */}
        <AnimatePresence>
          {neurons.map(neuron => (
            <motion.button
              key={neuron.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
              }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => handleNeuronClick(e, neuron.id)}
              className={`absolute rounded-full shadow-lg cursor-pointer ${
                connectingFrom === neuron.id ? 'ring-4 ring-primary' : ''
              }`}
              style={{
                left: neuron.x - neuron.size / 2,
                top: neuron.y - neuron.size / 2,
                width: neuron.size,
                height: neuron.size,
                backgroundColor: neuron.color,
                boxShadow: `0 0 ${neuron.size / 2}px ${neuron.color}`,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: neuron.color }}
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: neuron.pulseSpeed,
                }}
              />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {neurons.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-4xl">🧠✨</p>
              <p className="text-lg font-medium text-muted-foreground">
                Tap anywhere to create neurons!
              </p>
              <p className="text-sm text-muted-foreground">
                Click neurons to connect them together
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>🧠 Neurons: {neurons.length}</span>
        <span>🔗 Connections: {neurons.reduce((sum, n) => sum + n.connections.length, 0)}</span>
        {connectingFrom && <span className="text-primary animate-pulse">Click another neuron to connect!</span>}
      </div>
    </div>
  );
}
