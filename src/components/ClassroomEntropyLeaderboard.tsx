import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useClassroomEntropy, StudentEntropyData } from '@/hooks/useClassroomEntropy';
import { InterventionPlanner } from '@/components/InterventionPlanner';
import { 
  TrendingDown, TrendingUp, AlertTriangle, Award, Users, 
  RefreshCw, Brain, Target, Flame, BookOpen, Route
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassroomEntropyLeaderboardProps {
  classrooms: Array<{ id: string; name: string }>;
  className?: string;
}

export function ClassroomEntropyLeaderboard({ classrooms, className }: ClassroomEntropyLeaderboardProps) {
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const { entropyData, loading, refetch, stats } = useClassroomEntropy(
    selectedClassroom === 'all' ? undefined : selectedClassroom
  );
  const chartRef = useRef<SVGSVGElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentEntropyData | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // D3 chart for module struggles
  useEffect(() => {
    if (!chartRef.current || !stats?.topStruggleModules.length) return;

    const svg = d3.select(chartRef.current);
    const width = 300;
    const height = 120;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const data = stats.topStruggleModules.slice(0, 4);
    const maxValue = Math.max(...data.map(d => d[1]), 1);
    const barHeight = 22;
    const gap = 6;

    // Bars
    svg.selectAll('rect.bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bg')
      .attr('x', 0)
      .attr('y', (_, i) => i * (barHeight + gap))
      .attr('width', width)
      .attr('height', barHeight)
      .attr('fill', 'hsl(var(--muted))')
      .attr('rx', 4);

    svg.selectAll('rect.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (_, i) => i * (barHeight + gap))
      .attr('width', d => (d[1] / maxValue) * width)
      .attr('height', barHeight)
      .attr('fill', (_, i) => i === 0 ? 'hsl(0, 84%, 60%)' : 'hsl(217, 91%, 60%)')
      .attr('rx', 4);

    svg.selectAll('text.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', 8)
      .attr('y', (_, i) => i * (barHeight + gap) + barHeight / 2 + 4)
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text(d => `${d[0]}: ${d[1]} fails`);
  }, [stats]);

  const getEntropyLevel = (entropy: number | null): { label: string; color: string; icon: React.ReactNode } => {
    if (entropy === null) return { label: 'No data', color: 'text-muted-foreground', icon: null };
    if (entropy < 0.5) return { label: 'Mastery', color: 'text-green-500', icon: <Award className="w-4 h-4" /> };
    if (entropy < 1.0) return { label: 'Proficient', color: 'text-blue-500', icon: <TrendingUp className="w-4 h-4" /> };
    if (entropy < 1.5) return { label: 'Developing', color: 'text-amber-500', icon: <Target className="w-4 h-4" /> };
    return { label: 'Needs Help', color: 'text-red-500', icon: <AlertTriangle className="w-4 h-4" /> };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-primary" />
              Knowledge Entropy Leaderboard
            </CardTitle>
            <CardDescription>
              Track student knowledge gaps and identify areas needing intervention
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select classroom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classrooms</SelectItem>
                {classrooms.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Total Students
                  </div>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Brain className="w-4 h-4" />
                    Avg Entropy
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.averageEntropy.toFixed(2)}
                  </div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-500 text-sm mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Need Attention
                  </div>
                  <div className="text-2xl font-bold text-red-500">{stats.needingAttention}</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-500 text-sm mb-1">
                    <Award className="w-4 h-4" />
                    Top Performers
                  </div>
                  <div className="text-2xl font-bold text-green-500">{stats.topPerformers}</div>
                </div>
              </div>
            )}

            {/* Top Struggle Modules */}
            {stats && stats.topStruggleModules.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  Modules Needing Class-Wide Review
                </h4>
                <svg ref={chartRef} className="w-full" />
              </div>
            )}

            {/* Student Leaderboard */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Student Entropy Rankings
              </h4>
              <ScrollArea className="h-[350px] border rounded-lg">
                <div className="divide-y">
                  {entropyData.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No student entropy data available yet.</p>
                      <p className="text-sm">Students will appear here once they complete activities.</p>
                    </div>
                  ) : (
                    entropyData.map((student, index) => {
                      const level = getEntropyLevel(student.calculated_entropy);
                      const entropyPercent = student.calculated_entropy !== null
                        ? Math.min((student.calculated_entropy / 2) * 100, 100)
                        : 0;

                      return (
                        <div key={student.student_id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              index === 0 && student.calculated_entropy !== null && student.calculated_entropy > 1.5 
                                ? "bg-red-500 text-white" 
                                : index < 3 && student.calculated_entropy !== null && student.calculated_entropy < 0.5
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                            )}>
                              {index + 1}
                            </div>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">{student.display_name}</span>
                                {selectedClassroom === 'all' && (
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {student.classroom_name}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress 
                                  value={100 - entropyPercent} 
                                  className="h-2 flex-1 max-w-[120px]" 
                                />
                                <span className="text-xs text-muted-foreground">
                                  {student.completed_modules.length} modules
                                </span>
                                {student.streak_data.current > 0 && (
                                  <span className="text-xs text-amber-500 flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    {student.streak_data.current}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Entropy Score & Actions */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className={cn("flex items-center gap-1 font-semibold", level.color)}>
                                  {level.icon}
                                  {student.calculated_entropy?.toFixed(2) ?? '—'}
                                </div>
                                <div className={cn("text-xs", level.color)}>{level.label}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                }}
                              >
                                <Route className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Failed modules detail */}
                          {Object.keys(student.failed_attempts).length > 0 && (
                            <div className="mt-2 ml-12 flex flex-wrap gap-1">
                              {Object.entries(student.failed_attempts).slice(0, 3).map(([module, count]) => (
                                <Badge 
                                  key={module} 
                                  variant="secondary" 
                                  className="text-xs bg-red-500/10 text-red-500"
                                >
                                  {module}: {count} fails
                                </Badge>
                              ))}
                              {Object.keys(student.failed_attempts).length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{Object.keys(student.failed_attempts).length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </CardContent>

      {/* Intervention Planner Dialog */}
      {selectedStudent && (
        <InterventionPlanner
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </Card>
  );
}
