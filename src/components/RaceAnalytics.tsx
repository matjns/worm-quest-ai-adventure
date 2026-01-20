import { useMemo } from "react";
import { 
  Trophy, Zap, Brain, TrendingUp, Clock, 
  Activity, GitBranch, Medal 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  BarChart, Bar, AreaChart, Area, ResponsiveContainer 
} from "recharts";
import { RaceRecording, RaceFrame } from "@/hooks/useRaceRecording";
import { cn } from "@/lib/utils";

interface RaceAnalyticsProps {
  recording: RaceRecording;
  currentUserId?: string;
  className?: string;
}

const WORM_COLORS = [
  "#f472b6", "#60a5fa", "#4ade80", "#fbbf24", "#a78bfa", "#fb923c"
];

const chartConfig = {
  speed: { label: "Speed", color: "hsl(var(--primary))" },
  position: { label: "Position", color: "hsl(var(--chart-1))" },
  neurons: { label: "Neuron Activity", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function RaceAnalytics({ recording, currentUserId, className }: RaceAnalyticsProps) {
  // Process speed data over time for all participants
  const speedOverTime = useMemo(() => {
    // Sample every 10th frame to reduce data points
    const sampledFrames = recording.frames.filter((_, i) => i % 10 === 0);
    
    return sampledFrames.map((frame) => {
      const dataPoint: Record<string, unknown> = {
        time: (frame.timestamp / 1000).toFixed(1),
      };
      
      frame.participants.forEach((p, idx) => {
        dataPoint[`speed_${idx}`] = p.speed.toFixed(2);
        dataPoint[`name_${idx}`] = p.worm_name;
      });
      
      return dataPoint;
    });
  }, [recording.frames]);

  // Process position progress over time
  const positionOverTime = useMemo(() => {
    const sampledFrames = recording.frames.filter((_, i) => i % 10 === 0);
    
    return sampledFrames.map((frame) => {
      const dataPoint: Record<string, unknown> = {
        time: (frame.timestamp / 1000).toFixed(1),
      };
      
      frame.participants.forEach((p, idx) => {
        dataPoint[`position_${idx}`] = p.position.toFixed(1);
        dataPoint[`name_${idx}`] = p.worm_name;
      });
      
      return dataPoint;
    });
  }, [recording.frames]);

  // Process neuron activity for the final frame
  const neuronActivityData = useMemo(() => {
    const lastFrame = recording.frames[recording.frames.length - 1];
    if (!lastFrame) return [];

    return lastFrame.participants.flatMap((p, pIdx) => 
      p.neuronActivity.map((activity, nIdx) => ({
        participant: p.worm_name,
        participantIdx: pIdx,
        neuron: `N${nIdx + 1}`,
        activity: (activity * 100).toFixed(1),
      }))
    );
  }, [recording.frames]);

  // Get sorted final results
  const sortedResults = useMemo(() => {
    return [...recording.finalResults].sort((a, b) => {
      if (a.finish_rank && b.finish_rank) return a.finish_rank - b.finish_rank;
      if (a.finish_rank) return -1;
      if (b.finish_rank) return 1;
      return b.avgSpeed - a.avgSpeed;
    });
  }, [recording.finalResults]);

  const participantCount = recording.frames[0]?.participants.length || 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Final Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Race Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedResults.map((result, index) => {
            const isCurrentUser = result.user_id === currentUserId;
            const colorIdx = recording.finalResults.findIndex(r => r.id === result.id);
            
            return (
              <div
                key={result.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg",
                  isCurrentUser ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/50"
                )}
              >
                <div className="w-8 flex justify-center">
                  {result.finish_rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                  {result.finish_rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                  {result.finish_rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                  {(!result.finish_rank || result.finish_rank > 3) && (
                    <span className="text-sm text-muted-foreground">#{result.finish_rank || "-"}</span>
                  )}
                </div>
                
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: WORM_COLORS[colorIdx % WORM_COLORS.length] }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", isCurrentUser && "font-bold")}>
                      {result.worm_name}
                    </span>
                    {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {result.finish_time ? `${(result.finish_time / 1000).toFixed(2)}s` : "DNF"}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Avg: {result.avgSpeed.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {result.neuronCount} neurons
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {result.connectionCount} connections
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono">
                    Max: {result.maxSpeed.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speed Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-primary" />
              Speed Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={speedOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}s`}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {Array.from({ length: participantCount }).map((_, idx) => (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={`speed_${idx}`}
                    name={speedOverTime[0]?.[`name_${idx}`] as string || `Worm ${idx + 1}`}
                    stroke={WORM_COLORS[idx % WORM_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Position Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              Race Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={positionOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}s`}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {Array.from({ length: participantCount }).map((_, idx) => (
                  <Area
                    key={idx}
                    type="monotone"
                    dataKey={`position_${idx}`}
                    name={positionOverTime[0]?.[`name_${idx}`] as string || `Worm ${idx + 1}`}
                    stroke={WORM_COLORS[idx % WORM_COLORS.length]}
                    fill={WORM_COLORS[idx % WORM_COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Neuron Activity Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-primary" />
            Neuron Activity Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedResults.map((result, idx) => {
              const colorIdx = recording.finalResults.findIndex(r => r.id === result.id);
              const lastFrame = recording.frames[recording.frames.length - 1];
              const participant = lastFrame?.participants.find(p => p.id === result.id);
              
              if (!participant || participant.neuronActivity.length === 0) {
                return (
                  <div key={result.id} className="text-sm text-muted-foreground">
                    {result.worm_name}: No neuron data
                  </div>
                );
              }

              return (
                <div key={result.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: WORM_COLORS[colorIdx % WORM_COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{result.worm_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.neuronCount} neurons
                    </Badge>
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {participant.neuronActivity.slice(0, 16).map((activity, nIdx) => (
                      <div key={nIdx} className="space-y-1">
                        <Progress 
                          value={activity * 100} 
                          className="h-8"
                          style={{ 
                            background: `linear-gradient(to top, ${WORM_COLORS[colorIdx % WORM_COLORS.length]}20, transparent)` 
                          }}
                        />
                        <span className="text-[10px] text-center block text-muted-foreground">
                          N{nIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Circuit Comparison Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-4 h-4 text-primary" />
            Circuit Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart 
              data={sortedResults.map((r, idx) => ({
                name: r.worm_name,
                neurons: r.neuronCount,
                connections: r.connectionCount,
                avgSpeed: r.avgSpeed,
                fill: WORM_COLORS[recording.finalResults.findIndex(rr => rr.id === r.id) % WORM_COLORS.length],
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="neurons" name="Neurons" fill="hsl(var(--chart-1))" />
              <Bar dataKey="connections" name="Connections" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
