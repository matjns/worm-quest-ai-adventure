import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Loader2, Zap, Target, TrendingUp, 
  Trophy, Swords, Timer, RefreshCw, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SkillTierBadge } from "./SkillTierBadge";
import { useMatchmaking, TIER_ORDER, TIER_CONFIG, type SkillTier } from "@/hooks/useMatchmaking";
import { useWormRace, type RaceSession } from "@/hooks/useWormRace";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MatchmakingPanelProps {
  onJoinRace?: (raceId: string) => void;
  className?: string;
}

export function MatchmakingPanel({ onJoinRace, className }: MatchmakingPanelProps) {
  const { isAuthenticated } = useAuth();
  const { playerRating, loading, findMatchingRaces, calculateMatchQuality, refetch } = useMatchmaking();
  const { fetchAvailableRaces } = useWormRace();
  
  const [matchingRaces, setMatchingRaces] = useState<RaceSession[]>([]);
  const [allRaces, setAllRaces] = useState<RaceSession[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("ranked");

  const searchForMatches = async () => {
    setSearching(true);
    try {
      const [matched, all] = await Promise.all([
        findMatchingRaces(),
        fetchAvailableRaces()
      ]);
      setMatchingRaces(matched as RaceSession[]);
      setAllRaces(all);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && playerRating) {
      searchForMatches();
    }
  }, [isAuthenticated, playerRating]);

  if (!isAuthenticated) {
    return (
      <Card className={cn("border-2 border-foreground", className)}>
        <CardContent className="p-6 text-center">
          <Swords className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Sign in to access skill-based matchmaking!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={cn("border-2 border-foreground", className)}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const tierIndex = playerRating ? TIER_ORDER.indexOf(playerRating.tier) : 0;
  const nextTier = tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : null;
  const progressToNextTier = playerRating && nextTier 
    ? ((playerRating.elo_rating - TIER_CONFIG[playerRating.tier].minElo) / 
       (TIER_CONFIG[nextTier].minElo - TIER_CONFIG[playerRating.tier].minElo)) * 100
    : 100;

  return (
    <Card className={cn("border-2 border-foreground", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Matchmaking
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={searchForMatches}
            disabled={searching}
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Stats */}
        {playerRating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SkillTierBadge 
                tier={playerRating.tier} 
                elo={playerRating.elo_rating}
                size="lg"
                showElo
              />
              <div className="text-right">
                <div className="text-sm font-medium">
                  {playerRating.wins}W - {playerRating.losses}L
                </div>
                <div className="text-xs text-muted-foreground">
                  {playerRating.total_races > 0 
                    ? `${Math.round((playerRating.wins / playerRating.total_races) * 100)}% WR`
                    : "No races yet"
                  }
                </div>
              </div>
            </div>

            {/* Progress to next tier */}
            {nextTier && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress to {TIER_CONFIG[nextTier].name}</span>
                  <span className="font-medium">
                    {playerRating.elo_rating} / {TIER_CONFIG[nextTier].minElo}
                  </span>
                </div>
                <Progress value={progressToNextTier} className="h-2" />
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <div className="text-xs font-medium">{playerRating.wins}</div>
                <div className="text-[10px] text-muted-foreground">Wins</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Zap className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <div className="text-xs font-medium">{playerRating.win_streak}</div>
                <div className="text-[10px] text-muted-foreground">Streak</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <div className="text-xs font-medium">{playerRating.best_streak}</div>
                <div className="text-[10px] text-muted-foreground">Best</div>
              </div>
            </div>
          </div>
        )}

        {/* Race Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="ranked" className="flex-1 gap-1">
              <Target className="w-3 h-3" />
              Ranked
            </TabsTrigger>
            <TabsTrigger value="open" className="flex-1 gap-1">
              <Users className="w-3 h-3" />
              Open
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ranked" className="mt-3">
            {searching ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <Search className="w-8 h-8 animate-pulse text-primary" />
                <span className="text-sm text-muted-foreground">
                  Finding fair matches...
                </span>
              </div>
            ) : matchingRaces.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No ranked races at your skill level</p>
                <p className="text-xs mt-1">Create one to start matchmaking!</p>
              </div>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  <AnimatePresence>
                    {matchingRaces.map((race, index) => (
                      <RaceListItem
                        key={race.id}
                        race={race}
                        index={index}
                        playerElo={playerRating?.elo_rating}
                        onJoin={() => onJoinRace?.(race.id)}
                        calculateMatchQuality={calculateMatchQuality}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="open" className="mt-3">
            {allRaces.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No open races available</p>
              </div>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  <AnimatePresence>
                    {allRaces.map((race, index) => (
                      <RaceListItem
                        key={race.id}
                        race={race}
                        index={index}
                        onJoin={() => onJoinRace?.(race.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface RaceListItemProps {
  race: RaceSession;
  index: number;
  playerElo?: number;
  onJoin: () => void;
  calculateMatchQuality?: (elos: number[]) => number;
}

function RaceListItem({ race, index, playerElo, onJoin, calculateMatchQuality }: RaceListItemProps) {
  const isRanked = race.is_ranked;
  const matchQuality = playerElo && calculateMatchQuality && isRanked
    ? calculateMatchQuality([playerElo, (race.min_elo + race.max_elo) / 2])
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{race.name}</span>
          {isRanked && (
            <Badge variant="outline" className="text-[10px] bg-primary/10">
              Ranked
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>0/{race.max_players}</span>
          <Timer className="w-3 h-3 ml-1" />
          <span>{race.race_distance}m</span>
          {matchQuality !== null && (
            <>
              <Target className="w-3 h-3 ml-1" />
              <span className={cn(
                matchQuality >= 80 && "text-green-500",
                matchQuality >= 50 && matchQuality < 80 && "text-yellow-500",
                matchQuality < 50 && "text-red-500"
              )}>
                {matchQuality}% match
              </span>
            </>
          )}
        </div>
      </div>
      <Button size="sm" onClick={onJoin}>
        Join
      </Button>
    </motion.div>
  );
}
