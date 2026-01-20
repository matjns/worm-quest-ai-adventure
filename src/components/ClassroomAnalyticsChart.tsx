import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Zap,
  Brain,
  Activity
} from 'lucide-react';

interface AnalyticsDataPoint {
  date: string;
  active_students: number;
  missions_completed: number;
  avg_accuracy: number;
  total_xp_earned: number;
  ai_interactions: number;
}

interface ClassroomAnalyticsChartProps {
  data: AnalyticsDataPoint[];
  className?: string;
}

export function ClassroomAnalyticsChart({ data, className }: ClassroomAnalyticsChartProps) {
  const chartData = useMemo(() => {
    // Format dates and ensure we have the last 7 days
    return data.slice(0, 7).reverse().map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      avg_accuracy: Math.round(d.avg_accuracy || 0)
    }));
  }, [data]);

  const totals = useMemo(() => ({
    students: Math.max(...data.map(d => d.active_students || 0)),
    missions: data.reduce((sum, d) => sum + (d.missions_completed || 0), 0),
    xp: data.reduce((sum, d) => sum + (d.total_xp_earned || 0), 0),
    avgAccuracy: data.length > 0 
      ? Math.round(data.reduce((sum, d) => sum + (d.avg_accuracy || 0), 0) / data.length)
      : 0,
    aiInteractions: data.reduce((sum, d) => sum + (d.ai_interactions || 0), 0)
  }), [data]);

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Classroom Analytics
          </CardTitle>
          <CardDescription>Student activity and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No analytics data yet.</p>
          <p className="text-sm text-muted-foreground">Data will appear as students complete missions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Classroom Analytics
            </CardTitle>
            <CardDescription>Student activity and performance metrics</CardDescription>
          </div>
          <Badge variant="secondary">
            <TrendingUp className="w-3 h-3 mr-1" />
            Last 7 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xl font-bold">{totals.students}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-xl font-bold">{totals.missions}</p>
            <p className="text-xs text-muted-foreground">Missions</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <p className="text-xl font-bold">{totals.xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Activity className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xl font-bold">{totals.avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Brain className="w-5 h-5 mx-auto mb-1 text-pink-500" />
            <p className="text-xl font-bold">{totals.aiInteractions}</p>
            <p className="text-xs text-muted-foreground">AI Chats</p>
          </div>
        </div>

        {/* Activity Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3">Daily Activity</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="left"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="missions_completed" 
                  name="Missions" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="active_students" 
                  name="Students" 
                  fill="hsl(var(--accent))" 
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avg_accuracy" 
                  name="Accuracy %" 
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Trend */}
        <div>
          <h4 className="text-sm font-medium mb-3">XP Earned</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="total_xp_earned" 
                  name="XP" 
                  fill="hsl(45 100% 50%)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
