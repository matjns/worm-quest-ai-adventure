import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Medal, Crown, Star, Brain, Zap, TrendingUp, 
  Users, Activity, Clock, Sparkles, Flag, BarChart3, Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/gameStore";
import { useRaceLeaderboard, RacerStats, CircuitStats } from "@/hooks/useRaceLeaderboard";
import { RaceAchievements } from "@/components/RaceAchievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="font-mono text-lg text-muted-foreground">#{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500/10 border-yellow-500/50";
    case 2:
      return "bg-gray-400/10 border-gray-400/50";
    case 3:
      return "bg-amber-600/10 border-amber-600/50";
    default:
      return "bg-card border-border";
  }
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RacerRow({ racer, rank }: { racer: RacerStats; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={cn(
        "border-2 p-4 rounded-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]",
        getRankBg(rank),
        rank <= 3 && "shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-10 flex justify-center">
          {getRankIcon(rank)}
        </div>

        {/* Avatar & Name */}
        <Avatar className="w-10 h-10 border-2 border-foreground">
          <AvatarImage src={racer.avatar_url || undefined} />
          <AvatarFallback>{racer.worm_name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{racer.worm_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            by {racer.display_name}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-primary">{racer.wins}</p>
            <p className="text-xs text-muted-foreground">Wins</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{racer.podiums}</p>
            <p className="text-xs text-muted-foreground">Podiums</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{racer.win_rate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>

        {/* Races */}
        <div className="text-right">
          <p className="text-lg font-bold">{racer.races_participated}</p>
          <p className="text-xs text-muted-foreground">Races</p>
        </div>
      </div>
    </motion.div>
  );
}

function CircuitRow({ circuit, rank }: { circuit: CircuitStats; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={cn(
        "border-2 p-4 rounded-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]",
        getRankBg(rank),
        rank <= 3 && "shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-10 flex justify-center">
          {getRankIcon(rank)}
        </div>

        {/* Circuit Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">{circuit.worm_name}'s Circuit</p>
            <p className="text-xs text-muted-foreground truncate">
              by {circuit.display_name}
            </p>
          </div>
        </div>

        {/* Circuit Stats */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-primary" />
              <span className="font-bold">{circuit.neuron_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Neurons</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="font-bold">{circuit.connection_count}</span>
            </div>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
        </div>

        {/* Wins & Avg Position */}
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{circuit.wins_with_circuit}</p>
          <p className="text-xs text-muted-foreground">
            Avg #{circuit.avg_position.toFixed(1)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function RecentWinnerCard({ winner, index }: { 
  winner: { 
    id: string; 
    worm_name: string; 
    display_name: string; 
    race_name: string; 
    finished_at: string; 
  }; 
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
    >
      <Trophy className="w-5 h-5 text-yellow-500" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{winner.worm_name}</p>
        <p className="text-xs text-muted-foreground truncate">
          Won {winner.race_name}
        </p>
      </div>
      <Badge variant="outline" className="text-xs">
        {winner.finished_at ? formatDistanceToNow(new Date(winner.finished_at), { addSuffix: true }) : "Recently"}
      </Badge>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-2 border-border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { level, totalPoints } = useGameStore();
  const { leaderboard, loading, error } = useRaceLeaderboard();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Race Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Top neural engineers and their winning worm circuits
            </p>
          </motion.div>

          {/* Global Stats */}
          {leaderboard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <StatCard 
                icon={Flag} 
                label="Total Races" 
                value={leaderboard.totalStats.totalRaces} 
              />
              <StatCard 
                icon={Users} 
                label="Race Entries" 
                value={leaderboard.totalStats.totalParticipants} 
              />
              <StatCard 
                icon={Activity} 
                label="Avg per Race" 
                value={leaderboard.totalStats.avgParticipantsPerRace.toFixed(1)} 
              />
              <StatCard 
                icon={Crown} 
                label="Top Winner" 
                value={leaderboard.topWinners[0]?.worm_name || "—"} 
                subtext={leaderboard.topWinners[0] ? `${leaderboard.topWinners[0].wins} wins` : undefined}
              />
            </motion.div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="winners" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="winners" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Top Winners</span>
                <span className="sm:hidden">Winners</span>
              </TabsTrigger>
              <TabsTrigger value="circuits" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Best Circuits</span>
                <span className="sm:hidden">Circuits</span>
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Most Active</span>
                <span className="sm:hidden">Active</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Badges</span>
              </TabsTrigger>
            </TabsList>

            {/* Top Winners Tab */}
            <TabsContent value="winners">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : leaderboard?.topWinners.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No race winners yet</p>
                        <p className="text-sm text-muted-foreground">
                          Be the first to win a race!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    leaderboard?.topWinners.map((racer, i) => (
                      <RacerRow key={racer.id} racer={racer} rank={i + 1} />
                    ))
                  )}
                </div>

                {/* Recent Winners Sidebar */}
                <div>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Winners
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {loading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : leaderboard?.recentWinners.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent races
                        </p>
                      ) : (
                        leaderboard?.recentWinners.map((winner, i) => (
                          <RecentWinnerCard key={winner.id} winner={winner} index={i} />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Best Circuits Tab */}
            <TabsContent value="circuits">
              <div className="space-y-3">
                {loading ? (
                  <LoadingSkeleton />
                ) : leaderboard?.fastestCircuits.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No circuit data yet</p>
                      <p className="text-sm text-muted-foreground">
                        Build a circuit and join a race!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  leaderboard?.fastestCircuits.map((circuit, i) => (
                    <CircuitRow key={circuit.circuit_id} circuit={circuit} rank={i + 1} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Most Active Tab */}
            <TabsContent value="active">
              <div className="space-y-3">
                {loading ? (
                  <LoadingSkeleton />
                ) : leaderboard?.mostActive.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No race activity yet</p>
                      <p className="text-sm text-muted-foreground">
                        Join races to climb the leaderboard!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  leaderboard?.mostActive.map((racer, i) => (
                    <RacerRow key={racer.id} racer={racer} rank={i + 1} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <RaceAchievements showStats={true} />
            </TabsContent>
          </Tabs>

          {/* Weekly Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="border-2 border-accent">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent/20">
                    <Star className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Weekly Race Challenge</h3>
                    <p className="text-sm text-muted-foreground">Complete to earn bonus XP</p>
                  </div>
                </div>
                <p className="text-lg mb-4">
                  <strong>This Week:</strong> Win a race using only 5 neurons or fewer. 
                  Prove that efficiency beats complexity!
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Challenge ends Sunday</span>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">+1000 XP Reward</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
