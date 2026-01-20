import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Play, Plus, Trophy, Loader2, LogOut, 
  Crown, Timer, Flag, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWormRace, RaceSession } from "@/hooks/useWormRace";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface WormRaceLobbyProps {
  raceId?: string;
  onRaceStart?: () => void;
  onJoinRace?: (raceId: string) => void;
  className?: string;
}

export function WormRaceLobby({ 
  raceId, 
  onRaceStart, 
  onJoinRace,
  className 
}: WormRaceLobbyProps) {
  const { isAuthenticated, user } = useAuth();
  const { 
    race, 
    participants, 
    loading, 
    isHost, 
    myParticipant,
    createRace, 
    joinRace, 
    leaveRace, 
    startRace,
    fetchAvailableRaces 
  } = useWormRace(raceId);
  
  const [availableRaces, setAvailableRaces] = useState<RaceSession[]>([]);
  const [newRaceName, setNewRaceName] = useState("");
  const [wormName, setWormName] = useState("Speedy");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch available races on mount
  useEffect(() => {
    if (!raceId) {
      fetchAvailableRaces().then(setAvailableRaces);
    }
  }, [raceId, fetchAvailableRaces]);

  // Handle race status changes
  useEffect(() => {
    if (race?.status === "racing" && onRaceStart) {
      onRaceStart();
    }
  }, [race?.status, onRaceStart]);

  const handleCreateRace = async () => {
    if (!newRaceName.trim()) return;
    
    setIsCreating(true);
    const id = await createRace(newRaceName.trim());
    setIsCreating(false);
    setShowCreateDialog(false);
    
    if (id && onJoinRace) {
      onJoinRace(id);
    }
  };

  const handleJoinRace = async (targetRaceId: string) => {
    if (onJoinRace) {
      onJoinRace(targetRaceId);
    }
  };

  const handleJoinAsParticipant = async () => {
    // TODO: Get circuit data from current circuit builder
    const mockCircuitData = { neurons: [], connections: [] };
    await joinRace(mockCircuitData, wormName);
  };

  if (!isAuthenticated) {
    return (
      <Card className={cn("border-2 border-foreground", className)}>
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Sign in to join multiplayer worm races!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show race lobby if we have a race ID
  if (raceId && race) {
    return (
      <Card className={cn("border-2 border-foreground", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              {race.name}
            </CardTitle>
            <Badge variant={race.status === "waiting" ? "secondary" : "default"}>
              {race.status === "waiting" ? "Waiting" : race.status === "racing" ? "Racing!" : "Finished"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Participants list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Racers ({participants.length}/{race.max_players})
              </span>
              {race.status === "waiting" && (
                <span className="text-xs text-muted-foreground">
                  Waiting for host to start...
                </span>
              )}
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg bg-muted/50",
                      participant.user_id === race.host_id && "ring-1 ring-primary"
                    )}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {participant.worm_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {participant.worm_name}
                        </span>
                        {participant.user_id === race.host_id && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {participant.profiles?.display_name || "Anonymous"}
                      </span>
                    </div>
                    {participant.finish_rank && (
                      <Badge variant="outline">
                        #{participant.finish_rank}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Join or leave */}
          {race.status === "waiting" && (
            <div className="flex gap-2">
              {!myParticipant ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Worm name..."
                    value={wormName}
                    onChange={(e) => setWormName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleJoinAsParticipant}>
                    <Zap className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={leaveRace} className="flex-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Race
                </Button>
              )}
            </div>
          )}

          {/* Start button (host only) */}
          {isHost && race.status === "waiting" && participants.length >= 2 && (
            <Button 
              onClick={startRace} 
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Race!
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show race browser
  return (
    <Card className={cn("border-2 border-foreground", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Worm Races
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create Race
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Race</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Race name..."
                  value={newRaceName}
                  onChange={(e) => setNewRaceName(e.target.value)}
                />
                <Button 
                  onClick={handleCreateRace} 
                  disabled={!newRaceName.trim() || isCreating}
                  className="w-full"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Flag className="w-4 h-4 mr-2" />
                  )}
                  Create Race
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableRaces.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No active races</p>
            <p className="text-sm">Create one to get started!</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {availableRaces.map((race) => (
                <motion.div
                  key={race.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <span className="font-medium">{race.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>0/{race.max_players}</span>
                      <Timer className="w-3 h-3 ml-2" />
                      <span>{race.race_distance}m</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleJoinRace(race.id)}>
                    Join
                  </Button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
