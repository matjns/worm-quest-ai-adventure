import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Eraser, RotateCcw, Volume2, VolumeX, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LiveCursors } from './LiveCursors';
import { CollaboratorsList } from './CollaboratorsList';
import { useCollaborativeSandbox, SyncedNeuron } from '@/hooks/useCollaborativeSandbox';
import { toast } from 'sonner';

const NEURON_COLORS = [
  { name: 'Pink', value: 'hsl(330, 100%, 70%)' },
  { name: 'Blue', value: 'hsl(200, 100%, 60%)' },
  { name: 'Green', value: 'hsl(140, 70%, 50%)' },
  { name: 'Yellow', value: 'hsl(50, 100%, 60%)' },
  { name: 'Purple', value: 'hsl(280, 80%, 60%)' },
  { name: 'Orange', value: 'hsl(30, 100%, 60%)' },
];

interface CollaborativeSandboxProps {
  roomId: string;
}

export function CollaborativeSandbox({ roomId }: CollaborativeSandboxProps) {
  const {
    collaborators,
    neurons,
    isConnected,
    myId,
    myName,
    myColor,
    updateCursor,
    addNeuron,
    removeNeuron,
    connectNeurons,
    clearCanvas,
  } = useCollaborativeSandbox(roomId);

  const [selectedColor, setSelectedColor] = useState(NEURON_COLORS[0]);
  const [neuronSize, setNeuronSize] = useState([40]);
  const [isErasing, setIsErasing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}/collab/${roomId}`;

  const playSound = useCallback((type: 'pop' | 'connect') => {
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
    }
  }, [soundEnabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateCursor(x, y);
  }, [updateCursor]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isErasing || connectingFrom) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newNeuron: Omit<SyncedNeuron, 'createdBy'> = {
      id: `neuron-${Date.now()}-${myId.slice(0, 8)}`,
      x,
      y,
      color: selectedColor.value,
      size: neuronSize[0],
      connections: [],
    };
    
    addNeuron(newNeuron);
    playSound('pop');
  }, [isErasing, connectingFrom, myId, selectedColor, neuronSize, addNeuron, playSound]);

  const handleNeuronClick = useCallback((e: React.MouseEvent, neuronId: string) => {
    e.stopPropagation();
    
    if (isErasing) {
      removeNeuron(neuronId);
      playSound('pop');
      return;
    }
    
    if (connectingFrom) {
      if (connectingFrom !== neuronId) {
        connectNeurons(connectingFrom, neuronId);
        playSound('connect');
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(neuronId);
    }
  }, [isErasing, connectingFrom, removeNeuron, connectNeurons, playSound]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied! Share it with friends to collaborate.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    clearCanvas();
    setConnectingFrom(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with collaborators */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-card/50 rounded-xl border-2 border-border">
        <CollaboratorsList
          collaborators={collaborators}
          myName={myName}
          myColor={myColor}
          isConnected={isConnected}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Invite Link'}
        </Button>
      </div>

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
            />
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

        {/* Tools */}
        <Button
          variant={isErasing ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setIsErasing(!isErasing); setConnectingFrom(null); }}
        >
          <Eraser className="w-4 h-4 mr-1" />
          Eraser
        </Button>

        <Button variant="outline" size="sm" onClick={handleClear}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear All
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Collaborative Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className={`relative w-full h-[500px] bg-gradient-to-br from-background via-card to-background rounded-xl border-4 border-primary/30 overflow-hidden cursor-crosshair ${
          isErasing ? 'cursor-not-allowed' : ''
        }`}
      >
        {/* Live cursors */}
        <LiveCursors collaborators={collaborators} />

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
              animate={{ scale: 1, rotate: 0 }}
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
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {neurons.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
            <div className="space-y-2">
              <p className="text-4xl">🧠👥✨</p>
              <p className="text-lg font-medium text-muted-foreground">
                Build together in real-time!
              </p>
              <p className="text-sm text-muted-foreground">
                Tap to create neurons • Click neurons to connect
              </p>
            </div>
          </div>
        )}

        {/* Room indicator */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-card/80 backdrop-blur-sm rounded-lg border border-border text-xs text-muted-foreground">
          Room: <span className="font-mono text-foreground">{roomId}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>🧠 Neurons: {neurons.length}</span>
        <span>🔗 Connections: {neurons.reduce((sum, n) => sum + n.connections.length, 0)}</span>
        <span>👥 Collaborators: {collaborators.size + 1}</span>
        {connectingFrom && <span className="text-primary animate-pulse">Click another neuron to connect!</span>}
      </div>
    </div>
  );
}
