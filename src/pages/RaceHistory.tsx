import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { 
  Trophy, Medal, Crown, Star, Brain, Zap, TrendingUp, TrendingDown,
  Calendar, Clock, Users, Target, Flame, History, ChevronRight,
  BarChart3, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRaceHistory, RaceHistoryEntry } from "@/hooks/useRaceHistory";
import { RaceAchievements } from "@/components/RaceAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "react-router-dom";

const getRankIcon = (rank: number | null) => {
  if (!rank) return null;
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="font-mono text-sm text-muted-foreground">#{rank}</span>;
  }
};

const getRankBg = (rank: number | null) => {
  if (!rank) return "bg-muted/30";
  switch (rank) {
    case 1:
      return "bg-yellow-500/10 border-yellow-500/30";
    case 2:
      return "bg-gray-400/10 border-gray-400/30";
    case 3:
      return "bg-amber-600/10 border-amber-600/30";
    default:
      return "bg-card border-border";
  }
};

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  trend,
  className
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null
              )}
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RaceHistoryRow({ race, index }: { race: RaceHistoryEntry; index: number }) {
  const neurons = (race.circuit_data?.neurons as unknown[]) || [];
  const connections = (race.circuit_data?.connections as unknown[]) || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "border-2 p-4 rounded-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]",
        getRankBg(race.finish_rank),
        race.finish_rank && race.finish_rank <= 3 && "shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="w-10 flex justify-center">
          {getRankIcon(race.finish_rank)}
        </div>

        {/* Race Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold truncate">{race.race_name}</p>
            <Badge variant="outline" className="text-xs">
              {race.race_distance}m
            </Badge>
            {race.race_status === "racing" && (
              <Badge className="bg-emerald-500 text-xs animate-pulse">Live</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {race.finished_at 
                ? formatDistanceToNow(new Date(race.finished_at), { addSuffix: true })
                : formatDistanceToNow(new Date(race.created_at), { addSuffix: true })
              }
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {race.participant_count} racers
            </span>
          </div>
        </div>

        {/* Worm Info */}
        <div className="hidden sm:block text-right">
          <p className="font-medium">{race.worm_name}</p>
          <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {neurons.length}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {connections.length}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="text-right">
          {race.finish_rank ? (
            <Badge variant={race.finish_rank === 1 ? "default" : "secondary"}>
              {race.finish_rank === 1 ? "Winner!" : `#${race.finish_rank}`}
            </Badge>
          ) : race.race_status === "racing" ? (
            <Badge variant="outline">Racing...</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">DNF</Badge>
          )}
        </div>
      </div>
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
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RaceHistoryPage() {
  const { history, stats, trends, loading, error } = useRaceHistory();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">Race #{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-muted-foreground">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <History className="w-8 h-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                  Race History
                </h1>
              </div>
              <p className="text-muted-foreground">
                Track your racing journey and performance over time
              </p>
            </div>
            <Link to="/leaderboard">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                View Leaderboard
                <ChevronRight className="w-3 h-3 ml-1" />
              </Badge>
            </Link>
          </motion.div>

          {/* Stats Overview */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
            >
              <StatCard 
                icon={Trophy} 
                label="Total Races" 
                value={stats.totalRaces} 
              />
              <StatCard 
                icon={Crown} 
                label="Wins" 
                value={stats.totalWins}
                className="bg-yellow-500/5 border-yellow-500/20"
              />
              <StatCard 
                icon={Medal} 
                label="Podiums" 
                value={stats.totalPodiums} 
              />
              <StatCard 
                icon={Target} 
                label="Win Rate" 
                value={`${stats.winRate.toFixed(1)}%`} 
                trend={stats.winRate > 30 ? "up" : stats.winRate > 0 ? "neutral" : undefined}
              />
              <StatCard 
                icon={Flame} 
                label="Best Streak" 
                value={stats.bestStreak} 
              />
              <StatCard 
                icon={Activity} 
                label="Avg Position" 
                value={stats.avgFinishPosition.toFixed(1)} 
              />
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Race History</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Performance Trends</span>
                <span className="sm:hidden">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Badges</span>
              </TabsTrigger>
            </TabsList>

            {/* Race History Tab */}
            <TabsContent value="history">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : error ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-destructive">{error}</p>
                      </CardContent>
                    </Card>
                  ) : history.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No races yet</p>
                        <p className="text-sm text-muted-foreground">
                          Join a race to start building your history!
                        </p>
                        <Link to="/race">
                          <Badge className="mt-4 cursor-pointer">Go to Races</Badge>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    history.map((race, index) => (
                      <RaceHistoryRow key={race.id} race={race} index={index} />
                    ))
                  )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                  {/* Quick Stats */}
                  {stats && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Quick Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total Distance</span>
                            <span className="font-bold">{stats.totalDistance}m</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Avg Neurons</span>
                            <span className="font-bold">{stats.avgNeuronCount.toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Avg Connections</span>
                            <span className="font-bold">{stats.avgConnectionCount.toFixed(1)}</span>
                          </div>
                        </div>
                        {stats.favoriteWormName && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Favorite Worm</span>
                              <span className="font-bold truncate max-w-[120px]">
                                {stats.favoriteWormName}
                              </span>
                            </div>
                          </div>
                        )}
                        {stats.currentStreak > 0 && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">
                                {stats.currentStreak} win streak!
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Win Rate Progress */}
                  {stats && stats.totalRaces > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Win Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative pt-2">
                          <Progress value={stats.winRate} className="h-3" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{stats.totalWins} wins</span>
                            <span>{stats.winRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Performance Trends Tab */}
            <TabsContent value="trends">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Finish Position Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Finish Position Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trends.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Complete races to see trends
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trends}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis 
                            dataKey="raceIndex" 
                            className="text-xs" 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            reversed 
                            domain={[1, 'dataMax']} 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="finishPosition" 
                            name="Position"
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary) / 0.2)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Circuit Complexity Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Circuit Complexity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trends.length === 0 ? (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        Complete races to see trends
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={trends}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis 
                            dataKey="raceIndex" 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="neuronCount" 
                            name="Neurons"
                            fill="hsl(var(--primary))" 
                          />
                          <Bar 
                            dataKey="connectionCount" 
                            name="Connections"
                            fill="hsl(var(--primary) / 0.5)" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                {stats && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Performance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-3xl font-bold text-primary">{stats.totalWins}</p>
                          <p className="text-xs text-muted-foreground">1st Place Finishes</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-3xl font-bold">{stats.totalPodiums - stats.totalWins}</p>
                          <p className="text-xs text-muted-foreground">Other Podiums</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-3xl font-bold">{stats.bestStreak}</p>
                          <p className="text-xs text-muted-foreground">Best Win Streak</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <p className="text-3xl font-bold">{stats.avgNeuronCount.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Avg Circuit Size</p>
                        </div>
                      </div>

                      {trends.length > 1 && (
                        <div className="mt-6 p-4 rounded-lg border bg-card">
                          <h4 className="font-medium mb-2">Trend Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const recent = trends.slice(-5);
                              const older = trends.slice(0, -5);
                              if (recent.length === 0 || older.length === 0) return "Keep racing to unlock trend analysis!";
                              
                              const recentAvg = recent.reduce((sum, t) => sum + t.finishPosition, 0) / recent.length;
                              const olderAvg = older.reduce((sum, t) => sum + t.finishPosition, 0) / older.length;
                              
                              if (recentAvg < olderAvg) {
                                return `🚀 Great improvement! Your average position improved from ${olderAvg.toFixed(1)} to ${recentAvg.toFixed(1)} in recent races.`;
                              } else if (recentAvg > olderAvg) {
                                return `📊 Your recent average position is ${recentAvg.toFixed(1)}. Consider optimizing your circuit design!`;
                              }
                              return `📈 Consistent performance! Your average position is ${recentAvg.toFixed(1)}.`;
                            })()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <RaceAchievements showStats={true} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
