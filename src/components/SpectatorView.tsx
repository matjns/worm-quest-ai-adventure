import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, Trophy, Flag, Timer, ArrowLeft, 
  Crown, Medal, Zap, Brain, Users, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RaceWorm } from "./RaceWorm";
import { RaceTrack } from "./RaceTrack";
import { NeuronFiringPanel } from "./NeuronFiringPanel";
import { useSpectateRace } from "@/hooks/useSpectateRace";
import { cn } from "@/lib/utils";

interface SpectatorViewProps {
  raceId: string;
  onExit?: () => void;
  className?: string;
}

const WORM_COLORS = [
  "#f472b6", "#60a5fa", "#4ade80", "#fbbf24", "#a78bfa", "#fb923c",
];

export function SpectatorView({ raceId, onExit, className }: SpectatorViewProps) {
  const { race, participants, loading } = useSpectateRace(raceId);
  const [raceTime, setRaceTime] = useState(0);
  const [showNeuronPanel, setShowNeuronPanel] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Track race time
  useEffect(() => {
    if (race?.status === "racing" && race.started_at) {
      const startTime = new Date(race.started_at).getTime();
      startTimeRef.current = startTime;

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setRaceTime(elapsed);
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [race?.status, race?.started_at]);

  // Sort participants by position
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.finish_rank && b.finish_rank) return a.finish_rank - b.finish_rank;
    if (a.finish_rank) return -1;
    if (b.finish_rank) return 1;
    return b.position - a.position;
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Medal className="w-4 h-4 text-amber-600" />;
      default: return <span className="text-xs text-muted-foreground">#{rank}</span>;
    }
  };

  const allFinished = participants.length > 0 && participants.every((p) => p.finished_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading race...</div>
      </div>
    );
  }

  if (!race) {
    return (
      <Card className={cn("border-2 border-foreground", className)}>
        <CardContent className="p-8 text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Race not found</p>
          <Button variant="outline" onClick={onExit} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Races
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Spectator Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Exit
          </Button>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              {race.name}
              <Badge variant="outline" className="ml-2">
                <Eye className="w-3 h-3 mr-1" />
                Spectating
              </Badge>
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              {raceTime.toFixed(1)}s
              <span className="mx-1">•</span>
              {race.race_distance}m race
              <span className="mx-1">•</span>
              <Users className="w-4 h-4" />
              {participants.length} racers
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={race.status === "racing" ? "default" : "secondary"}
            className={cn(race.status === "racing" && "animate-pulse")}
          >
            <Radio className="w-3 h-3 mr-1" />
            {race.status === "racing" ? "LIVE" : allFinished ? "Finished" : race.status}
          </Badge>
        </div>
      </div>

      {/* 3D Race View */}
      <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-foreground bg-background">
        {/* Live indicator */}
        {race.status === "racing" && !allFinished && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>
        )}

        {/* Race finished overlay */}
        <AnimatePresence>
          {allFinished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-2xl font-bold mb-2">Race Complete!</h3>
                <p className="text-muted-foreground">
                  Winner: {sortedParticipants[0]?.worm_name || "Unknown"}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, 5, -5]} intensity={0.5} color="#3b82f6" />
          
          <RaceTrack laneCount={participants.length || 1} raceDistance={race.race_distance} />
          
          {participants.map((participant, index) => (
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

      {/* Race Info Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress bars */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Race Progress
            </h3>
            {sortedParticipants.map((participant, index) => (
              <div key={participant.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: WORM_COLORS[participants.findIndex(p => p.id === participant.id) % WORM_COLORS.length] }}
                    />
                    <span>{participant.worm_name}</span>
                    {participant.user_id === race.host_id && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(participant.position)}%
                  </span>
                </div>
                <Progress value={participant.position} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Standings */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Live Standings
            </h3>
            {sortedParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                layout
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg bg-muted/50",
                  participant.finish_rank && "ring-1 ring-primary/50"
                )}
              >
                <div className="w-6 flex justify-center">
                  {participant.finish_rank ? getRankIcon(participant.finish_rank) : (
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  )}
                </div>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: WORM_COLORS[participants.findIndex(p => p.id === participant.id) % WORM_COLORS.length] }}
                />
                <div className="flex-1">
                  <span className="font-medium">{participant.worm_name}</span>
                  <div className="text-xs text-muted-foreground">
                    {participant.profiles?.display_name || "Anonymous"}
                  </div>
                </div>
                {participant.finish_rank && (
                  <Badge variant="secondary" className="text-xs">
                    Finished!
                  </Badge>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Neuron Activity Toggle */}
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNeuronPanel(!showNeuronPanel)}
          className="w-full"
        >
          <Brain className="w-4 h-4 mr-2" />
          {showNeuronPanel ? "Hide" : "Show"} Neuron Activity
        </Button>
        
        <AnimatePresence>
          {showNeuronPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {participants.map((participant, index) => (
                <NeuronFiringPanel
                  key={participant.id}
                  circuitData={participant.circuit_data}
                  position={participant.position}
                  speed={1}
                  wormName={participant.worm_name}
                  color={WORM_COLORS[index % WORM_COLORS.length]}
                  isPlayer={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
