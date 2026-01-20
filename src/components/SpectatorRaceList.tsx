import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Users, Timer, Radio, Trophy, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpectateRace } from "@/hooks/useSpectateRace";
import { cn } from "@/lib/utils";

interface SpectatorRaceListProps {
  onSelectRace: (raceId: string) => void;
  className?: string;
}

export function SpectatorRaceList({ onSelectRace, className }: SpectatorRaceListProps) {
  const { activeRaces, fetchActiveRaces } = useSpectateRace();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchActiveRaces();
    setLoading(false);
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveRaces();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchActiveRaces]);

  const getTimeSinceStart = (startedAt: string | null) => {
    if (!startedAt) return "Starting...";
    const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className={cn("border-2 border-foreground", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Races
            {activeRaces.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                {activeRaces.length} LIVE
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && activeRaces.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeRaces.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No live races to watch</p>
            <p className="text-sm">Check back soon or start your own!</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              <AnimatePresence>
                {activeRaces.map((race, index) => (
                  <motion.div
                    key={race.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="font-medium">{race.name}</span>
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            LIVE
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {race.max_players} racers
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {getTimeSinceStart(race.started_at)}
                          </span>
                          <span>
                            {race.race_distance}m
                          </span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => onSelectRace(race.id)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}

        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Spectator mode lets you watch races in real-time without affecting the outcome!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
