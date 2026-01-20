import { useState, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Flag, Timer, ArrowLeft, 
  Crown, Medal, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { RaceWorm } from "./RaceWorm";
import { RaceTrack } from "./RaceTrack";
import { PostRaceResults } from "./PostRaceResults";
import { useWormRace, RaceParticipant } from "@/hooks/useWormRace";
import { useRaceRecording } from "@/hooks/useRaceRecording";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface RaceGameplayProps {
  raceId: string;
  onExit?: () => void;
  onPlayAgain?: () => void;
  className?: string;
}

// Worm colors for different lanes
const WORM_COLORS = [
  "#f472b6", // pink
  "#60a5fa", // blue
  "#4ade80", // green
  "#fbbf24", // yellow
  "#a78bfa", // purple
  "#fb923c", // orange
];

export function RaceGameplay({ raceId, onExit, onPlayAgain, className }: RaceGameplayProps) {
  const { user } = useAuth();
  const { 
    race, 
    participants, 
    myParticipant, 
    updatePosition, 
    finishRace 
  } = useWormRace(raceId);
  
  const {
    isRecording,
    recording,
    startRecording,
    recordFrame,
    stopRecording,
  } = useRaceRecording();
  
  const [countdown, setCountdown] = useState<number | null>(3);
  const [raceTime, setRaceTime] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [allFinished, setAllFinished] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const speedMapRef = useRef<Map<string, number>>(new Map());

  // Simulate worm movement based on circuit configuration
  const simulateWormSpeed = useCallback((circuitData: Record<string, unknown>): number => {
    const neurons = (circuitData?.neurons as unknown[]) || [];
    const connections = (circuitData?.connections as unknown[]) || [];
    
    // Base speed + bonus from circuit complexity
    const neuronBonus = neurons.length * 0.5;
    const connectionBonus = connections.length * 0.3;
    const randomVariation = (Math.random() - 0.5) * 0.5;
    
    return 0.8 + neuronBonus + connectionBonus + randomVariation;
  }, []);

  // Race countdown and start recording
  useEffect(() => {
    if (race?.status !== "racing") return;
    
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(countdownInterval);
        startTimeRef.current = Date.now();
        // Start recording when race begins
        startRecording(raceId, race.name, race.race_distance);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [race?.status, raceId, race?.name, race?.race_distance, startRecording]);

  // Race simulation loop
  useEffect(() => {
    if (race?.status !== "racing" || countdown !== null || hasFinished) return;

    const raceDistance = race.race_distance;
    let currentPosition = myParticipant?.position || 0;
    const speed = simulateWormSpeed(myParticipant?.circuit_data || {});

    // Track speed for all participants
    participants.forEach((p) => {
      speedMapRef.current.set(p.id, simulateWormSpeed(p.circuit_data));
    });

    const animate = () => {
      if (!startTimeRef.current) return;
      
      // Update race time
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setRaceTime(elapsed);
      
      // Move worm forward
      currentPosition = Math.min(currentPosition + speed * 0.5, 100);
      updatePosition(currentPosition);
      
      // Record frame for replay
      if (isRecording) {
        recordFrame(participants, speedMapRef.current);
      }
      
      // Check if finished
      if (currentPosition >= 100 && !hasFinished) {
        setHasFinished(true);
        finishRace();
        return;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [race?.status, countdown, hasFinished, myParticipant, participants, updatePosition, finishRace, simulateWormSpeed, isRecording, recordFrame]);

  // Check if all participants finished and stop recording
  useEffect(() => {
    if (!race || race.status !== "racing") return;
    
    const allDone = participants.length > 0 && participants.every((p) => p.finished_at);
    
    if (allDone && !allFinished) {
      setAllFinished(true);
      const finalRecording = stopRecording(participants);
      if (finalRecording) {
        // Small delay to show final positions before results
        setTimeout(() => {
          setShowResults(true);
        }, 1500);
      }
    }
  }, [participants, race, allFinished, stopRecording]);

  // Sort participants by position for leaderboard
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.finish_rank && b.finish_rank) return a.finish_rank - b.finish_rank;
    if (a.finish_rank) return -1;
    if (b.finish_rank) return 1;
    return b.position - a.position;
  });

  // Get rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Medal className="w-4 h-4 text-amber-600" />;
      default: return <span className="text-xs text-muted-foreground">#{rank}</span>;
    }
  };

  if (!race) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading race...</div>
      </div>
    );
  }

  // Show post-race results with replay and analytics
  if (showResults && recording) {
    return (
      <PostRaceResults
        recording={recording}
        currentUserId={user?.id}
        onPlayAgain={onPlayAgain}
        onExit={onExit}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
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
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="w-4 h-4" />
              {raceTime.toFixed(1)}s
              <span className="mx-1">•</span>
              {race.race_distance}m race
            </div>
          </div>
        </div>
        <Badge variant={hasFinished ? "default" : "secondary"}>
          {hasFinished ? `Finished #${myParticipant?.finish_rank}` : "Racing"}
        </Badge>
      </div>

      {/* 3D Race View */}
      <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-foreground bg-background">
        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.span
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-8xl font-bold text-primary"
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={50} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, 5, -5]} intensity={0.5} color="#3b82f6" />
          
          <RaceTrack laneCount={participants.length} raceDistance={race.race_distance} />
          
          {participants.map((participant, index) => (
            <RaceWorm
              key={participant.id}
              position={participant.position}
              laneIndex={index}
              wormName={participant.worm_name}
              color={WORM_COLORS[index % WORM_COLORS.length]}
              circuitData={participant.circuit_data}
              isPlayer={participant.user_id === user?.id}
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

      {/* Leaderboard */}
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
                    <span className={cn(
                      participant.user_id === user?.id && "font-bold"
                    )}>
                      {participant.worm_name}
                    </span>
                    {participant.user_id === user?.id && (
                      <Badge variant="outline" className="text-xs py-0">You</Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {Math.round(participant.position)}%
                  </span>
                </div>
                <Progress 
                  value={participant.position} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Standings */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Standings
            </h3>
            {sortedParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                layout
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg",
                  participant.user_id === user?.id ? "bg-primary/10" : "bg-muted/50",
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
                  <span className={cn(
                    "font-medium",
                    participant.user_id === user?.id && "font-bold"
                  )}>
                    {participant.worm_name}
                  </span>
                  {participant.user_id === race.host_id && (
                    <Crown className="w-3 h-3 inline ml-1 text-yellow-500" />
                  )}
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
    </div>
  );
}
