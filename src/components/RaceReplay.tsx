import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import { 
  Play, Pause, RotateCcw, FastForward, Rewind,
  SkipBack, SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RaceWorm } from "./RaceWorm";
import { RaceTrack } from "./RaceTrack";
import { RaceRecording } from "@/hooks/useRaceRecording";
import { cn } from "@/lib/utils";

interface RaceReplayProps {
  recording: RaceRecording;
  onClose?: () => void;
  className?: string;
}

const WORM_COLORS = [
  "#f472b6", "#60a5fa", "#4ade80", "#fbbf24", "#a78bfa", "#fb923c"
];

export function RaceReplay({ recording, onClose, className }: RaceReplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Find the frame closest to current time
  const currentFrame = recording.frames.reduce((closest, frame) => {
    if (Math.abs(frame.timestamp - currentTime) < Math.abs(closest.timestamp - currentTime)) {
      return frame;
    }
    return closest;
  }, recording.frames[0]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    lastTimeRef.current = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTimeRef.current) * playbackSpeed;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= recording.duration) {
          setIsPlaying(false);
          return recording.duration;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, recording.duration]);

  const handleRestart = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const handleSkipBack = useCallback(() => {
    setCurrentTime((prev) => Math.max(0, prev - 5000));
  }, []);

  const handleSkipForward = useCallback(() => {
    setCurrentTime((prev) => Math.min(recording.duration, prev + 5000));
  }, [recording.duration]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const decimals = Math.floor((ms % 1000) / 100);
    return `${seconds}.${decimals}s`;
  };

  if (!currentFrame) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Race Replay</h3>
          <p className="text-sm text-muted-foreground">{recording.raceName}</p>
        </div>
        <Badge variant="secondary">
          {formatTime(currentTime)} / {formatTime(recording.duration)}
        </Badge>
      </div>

      {/* 3D Replay View */}
      <div className="relative h-[300px] rounded-xl overflow-hidden border-2 border-foreground bg-background">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, 5, -5]} intensity={0.5} color="#3b82f6" />
          
          <RaceTrack laneCount={currentFrame.participants.length} raceDistance={recording.raceDistance} />
          
          {currentFrame.participants.map((participant, index) => (
            <RaceWorm
              key={participant.id}
              position={participant.position}
              laneIndex={index}
              wormName={participant.worm_name}
              color={WORM_COLORS[index % WORM_COLORS.length]}
              circuitData={participant.circuit_data}
              isPlayer={false}
            />
          ))}
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={8}
            maxDistance={25}
          />
          <Environment preset="night" />
        </Canvas>
      </div>

      {/* Playback Controls */}
      <div className="mt-4 space-y-3">
        {/* Timeline */}
        <Slider
          value={[currentTime]}
          min={0}
          max={recording.duration}
          step={100}
          onValueChange={([value]) => {
            setCurrentTime(value);
            setIsPlaying(false);
          }}
          className="cursor-pointer"
        />

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRestart}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleSkipBack}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPlaybackSpeed(Math.max(0.25, playbackSpeed - 0.25))}>
            <Rewind className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPlaybackSpeed(Math.min(4, playbackSpeed + 0.25))}>
            <FastForward className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleSkipForward}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="ml-2">
            {playbackSpeed}x
          </Badge>
        </div>
      </div>
    </div>
  );
}
