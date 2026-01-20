import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  BarChart,
  Bar,
  Legend,
  ReferenceLine
} from "recharts";
import { Activity, Zap, Brain, TrendingUp } from "lucide-react";

interface NeuralActivityData {
  neuron_id: string;
  type: string;
  peak_activation: string;
  firing_events: number;
  firing_rate_hz: number;
  avg_membrane_potential: string;
  spike_times_ms: number[];
  activity_trace: number[];
}

interface SimulationResponse {
  success: boolean;
  results?: {
    neural_activity?: NeuralActivityData[];
    behavior_prediction?: string;
    confidence?: number;
    total_spikes?: number;
    physics?: {
      body_curvature: string;
      velocity: string;
      energy_expenditure: string;
      muscle_tension?: {
        dorsal: string;
        ventral: string;
      };
    };
  };
  duration_ms?: number;
  timesteps?: number;
  [key: string]: unknown;
}

interface NeuralActivityChartsProps {
  response: SimulationResponse;
  duration: number;
}

const NEURON_COLORS: Record<string, string> = {
  sensory: "hsl(142, 76%, 36%)",    // green
  motor: "hsl(0, 84%, 60%)",         // red
  interneuron: "hsl(217, 91%, 60%)", // blue
  unknown: "hsl(280, 68%, 60%)"      // purple
};

export function NeuralActivityCharts({ response, duration }: NeuralActivityChartsProps) {
  const neuralActivity = response.results?.neural_activity;
  
  if (!neuralActivity || neuralActivity.length === 0) {
    return null;
  }

  // Prepare activity trace data for line chart
  const activityTraceData = useMemo(() => {
    const maxLength = Math.max(...neuralActivity.map(n => n.activity_trace?.length || 0));
    const data: Array<Record<string, number>> = [];
    
    for (let i = 0; i < maxLength; i++) {
      const point: Record<string, number> = { time: i * 10 }; // 10ms per sample
      neuralActivity.forEach(neuron => {
        if (neuron.activity_trace && neuron.activity_trace[i] !== undefined) {
          point[neuron.neuron_id] = neuron.activity_trace[i];
        }
      });
      data.push(point);
    }
    return data;
  }, [neuralActivity]);

  // Prepare spike raster data
  const spikeRasterData = useMemo(() => {
    const data: Array<{ time: number; neuron: string; neuronIndex: number; type: string }> = [];
    
    neuralActivity.forEach((neuron, neuronIndex) => {
      if (neuron.spike_times_ms) {
        neuron.spike_times_ms.forEach(time => {
          data.push({
            time,
            neuron: neuron.neuron_id,
            neuronIndex: neuronIndex + 1,
            type: neuron.type
          });
        });
      }
    });
    
    return data;
  }, [neuralActivity]);

  // Prepare firing rate comparison data
  const firingRateData = useMemo(() => {
    return neuralActivity.map(neuron => ({
      neuron: neuron.neuron_id,
      firing_rate: neuron.firing_rate_hz,
      firing_events: neuron.firing_events,
      peak_activation: parseFloat(neuron.peak_activation),
      type: neuron.type
    }));
  }, [neuralActivity]);

  // Summary statistics
  const stats = useMemo(() => {
    const totalSpikes = neuralActivity.reduce((sum, n) => sum + n.firing_events, 0);
    const avgFiringRate = neuralActivity.reduce((sum, n) => sum + n.firing_rate_hz, 0) / neuralActivity.length;
    const maxFiringRate = Math.max(...neuralActivity.map(n => n.firing_rate_hz));
    const activeNeurons = neuralActivity.filter(n => n.firing_events > 0).length;
    
    return { totalSpikes, avgFiringRate, maxFiringRate, activeNeurons };
  }, [neuralActivity]);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="border-2 border-foreground/20">
          <CardContent className="p-3 text-center">
            <Zap className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-lg font-black">{stats.totalSpikes}</p>
            <p className="text-xs text-muted-foreground">Total Spikes</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-foreground/20">
          <CardContent className="p-3 text-center">
            <Activity className="w-4 h-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-black">{stats.avgFiringRate.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg Hz</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-foreground/20">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-black">{stats.maxFiringRate}</p>
            <p className="text-xs text-muted-foreground">Peak Hz</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-foreground/20">
          <CardContent className="p-3 text-center">
            <Brain className="w-4 h-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-black">{stats.activeNeurons}/{neuralActivity.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Behavior Prediction */}
      {response.results?.behavior_prediction && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border-2 border-primary/30">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-bold">Predicted Behavior:</span>
            <Badge variant="default" className="uppercase">
              {response.results.behavior_prediction}
            </Badge>
          </div>
          <Badge variant="outline">
            {((response.results.confidence || 0) * 100).toFixed(0)}% confidence
          </Badge>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="raster" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="raster" className="text-xs">Spike Raster</TabsTrigger>
          <TabsTrigger value="trace" className="text-xs">Activity Trace</TabsTrigger>
          <TabsTrigger value="compare" className="text-xs">Firing Rates</TabsTrigger>
        </TabsList>

        {/* Spike Raster Plot */}
        <TabsContent value="raster">
          <Card className="border-2 border-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Spike Raster Plot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      type="number" 
                      dataKey="time" 
                      name="Time" 
                      unit="ms"
                      domain={[0, duration]}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Time (ms)', position: 'bottom', fontSize: 10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="neuronIndex" 
                      name="Neuron"
                      domain={[0.5, neuralActivity.length + 0.5]}
                      ticks={neuralActivity.map((_, i) => i + 1)}
                      tickFormatter={(value) => neuralActivity[value - 1]?.neuron_id || ''}
                      tick={{ fontSize: 10 }}
                      width={50}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border-2 border-foreground/20 rounded p-2 text-xs">
                              <p className="font-bold">{data.neuron}</p>
                              <p>Spike at {data.time}ms</p>
                              <p className="text-muted-foreground capitalize">{data.type}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={spikeRasterData} shape="circle">
                      {spikeRasterData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={NEURON_COLORS[entry.type] || NEURON_COLORS.unknown}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Sensory
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Interneuron
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Motor
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Trace */}
        <TabsContent value="trace">
          <Card className="border-2 border-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                Neural Activity Trace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityTraceData} margin={{ top: 10, right: 10, bottom: 20, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Time (ms)', position: 'bottom', fontSize: 10 }}
                    />
                    <YAxis 
                      domain={[0, 1.1]}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Activation', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border-2 border-foreground/20 rounded p-2 text-xs">
                              <p className="font-bold mb-1">{label}ms</p>
                              {payload.map((p, i) => (
                                <p key={i} style={{ color: p.color }}>
                                  {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={0.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    {neuralActivity.map((neuron, index) => (
                      <Line
                        key={neuron.neuron_id}
                        type="monotone"
                        dataKey={neuron.neuron_id}
                        stroke={NEURON_COLORS[neuron.type] || NEURON_COLORS.unknown}
                        strokeWidth={2}
                        dot={false}
                        name={neuron.neuron_id}
                      />
                    ))}
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firing Rate Comparison */}
        <TabsContent value="compare">
          <Card className="border-2 border-foreground/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Firing Rate Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={firingRateData} margin={{ top: 10, right: 10, bottom: 20, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis 
                      dataKey="neuron" 
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Firing Rate (Hz)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border-2 border-foreground/20 rounded p-2 text-xs">
                              <p className="font-bold">{data.neuron}</p>
                              <p>Rate: {data.firing_rate} Hz</p>
                              <p>Events: {data.firing_events}</p>
                              <p>Peak: {data.peak_activation.toFixed(3)}</p>
                              <p className="text-muted-foreground capitalize">{data.type}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="firing_rate" name="Firing Rate (Hz)">
                      {firingRateData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={NEURON_COLORS[entry.type] || NEURON_COLORS.unknown}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Physics Info */}
      {response.results?.physics && (
        <Card className="border-2 border-foreground/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Physics Simulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Body Curvature</p>
                <p className="font-mono font-bold">{response.results.physics.body_curvature}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Velocity</p>
                <p className="font-mono font-bold">{response.results.physics.velocity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="font-mono font-bold">{response.results.physics.energy_expenditure}</p>
              </div>
              {response.results.physics.muscle_tension && (
                <div>
                  <p className="text-xs text-muted-foreground">Muscle Tension</p>
                  <p className="font-mono font-bold text-xs">
                    D: {response.results.physics.muscle_tension.dorsal} / V: {response.results.physics.muscle_tension.ventral}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
