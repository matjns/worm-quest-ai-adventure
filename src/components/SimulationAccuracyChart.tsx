import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface AccuracyDataPoint {
  date: string;
  accuracy: number;
  missions: number;
}

interface SimulationAccuracyChartProps {
  data?: AccuracyDataPoint[];
  currentAccuracy: number;
  className?: string;
}

// Generate mock historical data based on current accuracy
function generateHistoricalData(currentAccuracy: number): AccuracyDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const baseAccuracy = Math.max(40, currentAccuracy - 15);
  
  return days.map((day, i) => {
    const progress = i / (days.length - 1);
    const randomVariance = (Math.random() - 0.5) * 10;
    const accuracy = Math.min(100, Math.max(0, 
      baseAccuracy + (currentAccuracy - baseAccuracy) * progress + randomVariance
    ));
    
    return {
      date: day,
      accuracy: Math.round(accuracy),
      missions: Math.floor(Math.random() * 3) + 1
    };
  });
}

export function SimulationAccuracyChart({ 
  data, 
  currentAccuracy,
  className 
}: SimulationAccuracyChartProps) {
  const chartData = useMemo(() => 
    data || generateHistoricalData(currentAccuracy), 
    [data, currentAccuracy]
  );
  
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.accuracy, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.accuracy, 0) / secondHalf.length;
    return secondAvg - firstAvg;
  }, [chartData]);

  const isImproving = trend > 0;
  const totalMissions = chartData.reduce((sum, d) => sum + d.missions, 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Simulation Accuracy
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={isImproving ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}
          >
            {isImproving ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {isImproving ? '+' : ''}{trend.toFixed(1)}% this week
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
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
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#accuracyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{currentAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalMissions}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {Math.round(chartData.reduce((sum, d) => sum + d.accuracy, 0) / chartData.length)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
