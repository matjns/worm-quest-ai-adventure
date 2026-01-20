import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ScatterChart, Scatter, Cell, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  TrendingUp, 
  Scissors, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Brain,
  Target
} from "lucide-react";

interface SweepVisualizationProps {
  results: any;
  sweepType: string;
  mode: "batch" | "sweep";
}

export function SweepVisualization({ results, sweepType, mode }: SweepVisualizationProps) {
  if (!results) return null;

  // Process results for visualization
  const processIntensitySweep = () => {
    if (!results.sweep_results) return [];
    return results.sweep_results.map((r: any, i: number) => ({
      intensity: r.stimulus_value?.toFixed(2) || (i * 0.1).toFixed(2),
      spikes: r.total_spikes || 0,
      firingRate: r.avg_firing_rate || 0,
      behavior: r.behavior === "approach" ? 1 : r.behavior === "avoid" ? -1 : 0,
      confidence: (r.confidence || 0) * 100
    }));
  };

  const processAblationResults = () => {
    if (!results.analysis?.ablation_effects) return [];
    return results.analysis.ablation_effects.map((effect: any) => ({
      neuron: effect.ablated,
      spikeChange: effect.spike_change_percent || 0,
      behaviorChanged: effect.behavior_changed ? 100 : 0,
      isCritical: Math.abs(effect.spike_change_percent || 0) > 30
    }));
  };

  const processBatchResults = () => {
    if (!results.results) return [];
    return results.results.map((r: any, i: number) => ({
      simulation: `Sim ${i + 1}`,
      totalSpikes: r.total_spikes || 0,
      avgFiring: r.avg_firing_rate || 0,
      behavior: r.behavior_prediction || "unknown",
      confidence: (r.confidence || 0) * 100
    }));
  };

  const processStimTypeSweep = () => {
    if (!results.sweep_results) return [];
    return results.sweep_results.map((r: any) => ({
      type: r.stimulus_type || "unknown",
      spikes: r.total_spikes || 0,
      firingRate: r.avg_firing_rate || 0,
      behavior: r.behavior || "resting"
    }));
  };

  // Color helpers
  const getBehaviorColor = (behavior: string) => {
    switch (behavior) {
      case "approach": return "hsl(142, 76%, 36%)";
      case "avoid": return "hsl(0, 84%, 60%)";
      case "turning": return "hsl(45, 93%, 47%)";
      default: return "hsl(215, 20%, 65%)";
    }
  };

  const getCriticalColor = (isCritical: boolean) => 
    isCritical ? "hsl(0, 84%, 60%)" : "hsl(142, 76%, 36%)";

  return (
    <div className="space-y-4">
      {mode === "batch" ? (
        // Batch Results View
        <Card className="border-2 border-foreground/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Batch Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="text-2xl font-black">{results.summary?.total_simulations || 0}</div>
                <div className="text-xs text-muted-foreground">Simulations</div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <div className="text-2xl font-black">{results.summary?.total_spikes || 0}</div>
                <div className="text-xs text-muted-foreground">Total Spikes</div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                <div className="text-2xl font-black">
                  {Object.keys(results.summary?.behavior_distribution || {}).length}
                </div>
                <div className="text-xs text-muted-foreground">Behavior Types</div>
              </div>
            </div>

            {/* Comparison Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processBatchResults()}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="simulation" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalSpikes" name="Total Spikes" fill="hsl(var(--primary))" />
                  <Bar dataKey="confidence" name="Confidence %" fill="hsl(142, 76%, 36%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Behavior Distribution */}
            {results.summary?.behavior_distribution && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(results.summary.behavior_distribution).map(([behavior, count]) => (
                  <Badge 
                    key={behavior} 
                    variant="outline"
                    style={{ borderColor: getBehaviorColor(behavior), color: getBehaviorColor(behavior) }}
                  >
                    {behavior}: {count as number}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Sweep Results View
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">
              <TrendingUp className="w-4 h-4 mr-1" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <Brain className="w-4 h-4 mr-1" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Target className="w-4 h-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            {/* Intensity Sweep - Dose Response Curve */}
            {sweepType === "stimulus_intensity" && (
              <Card className="border-2 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Dose-Response Curve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processIntensitySweep()}>
                        <defs>
                          <linearGradient id="colorSpikes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="intensity" 
                          label={{ value: 'Stimulus Intensity', position: 'bottom', offset: -5 }}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="spikes" 
                          name="Total Spikes"
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorSpikes)" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="firingRate" 
                          name="Firing Rate (Hz)"
                          stroke="hsl(45, 93%, 47%)" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ablation Study - Impact Heatmap */}
            {sweepType === "neuron_ablation" && (
              <Card className="border-2 border-red-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-red-500" />
                    Ablation Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processAblationResults()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          type="number" 
                          domain={[-100, 100]}
                          label={{ value: 'Spike Change %', position: 'bottom', offset: -5 }}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis 
                          dataKey="neuron" 
                          type="category" 
                          tick={{ fontSize: 12, fontWeight: 'bold' }}
                          width={60}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--popover))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)}%`,
                            name === "spikeChange" ? "Impact on Output" : name
                          ]}
                        />
                        <Legend />
                        <Bar 
                          dataKey="spikeChange" 
                          name="Spike Change %"
                        >
                          {processAblationResults().map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getCriticalColor(entry.isCritical)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Critical Neurons Legend */}
                  <div className="flex items-center gap-4 mt-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-xs">Critical (&gt;30% impact)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs">Non-critical</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stimulus Type Comparison */}
            {sweepType === "stimulus_type" && (
              <Card className="border-2 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    Stimulus Modality Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={processStimTypeSweep()}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="type" tick={{ fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fontSize: 10 }} />
                        <Radar
                          name="Spikes"
                          dataKey="spikes"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.5}
                        />
                        <Radar
                          name="Firing Rate"
                          dataKey="firingRate"
                          stroke="hsl(45, 93%, 47%)"
                          fill="hsl(45, 93%, 47%)"
                          fillOpacity={0.3}
                        />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Duration Sweep */}
            {sweepType === "duration" && (
              <Card className="border-2 border-green-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Temporal Dynamics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processIntensitySweep()}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="intensity" 
                          label={{ value: 'Duration (ms)', position: 'bottom', offset: -5 }}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="spikes" 
                          name="Accumulated Spikes"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="firingRate" 
                          name="Avg Firing Rate"
                          stroke="hsl(142, 76%, 36%)" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {results.analysis && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Behavioral Transitions */}
                {results.analysis.behavioral_transitions?.length > 0 && (
                  <Card className="border-2 border-foreground/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        Behavioral Transitions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.analysis.behavioral_transitions.map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" style={{ borderColor: getBehaviorColor(t.from) }}>
                              {t.from}
                            </Badge>
                            <ArrowRight className="w-4 h-4" />
                            <Badge variant="outline" style={{ borderColor: getBehaviorColor(t.to) }}>
                              {t.to}
                            </Badge>
                            <span className="text-muted-foreground">@ {t.at_value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Critical Neurons */}
                {results.analysis.critical_neurons?.length > 0 && (
                  <Card className="border-2 border-red-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Critical Neurons Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {results.analysis.critical_neurons.map((n: string) => (
                          <Badge key={n} variant="destructive">
                            {n}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        These neurons have greater than 30% impact on circuit output when ablated
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Dose-Response Metrics */}
                {results.analysis.dose_response_slope !== undefined && (
                  <Card className="border-2 border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Dose-Response Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Slope</span>
                          <span className="font-mono font-bold">
                            {results.analysis.dose_response_slope.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Peak Response</span>
                          <span className="font-mono font-bold">
                            {results.analysis.peak_response?.toFixed(1)} spikes
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Threshold</span>
                          <span className="font-mono font-bold">
                            ~{results.analysis.threshold?.toFixed(2) || "0.3"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card className="border-2 border-foreground/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.analysis?.key_findings?.map((finding: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{finding}</p>
                  </div>
                )) || (
                  <>
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        Circuit shows {results.summary?.total_spikes > 50 ? "robust" : "moderate"} 
                        {" "}response across tested parameters
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        {sweepType === "neuron_ablation" 
                          ? `Identified ${results.analysis?.critical_neurons?.length || 0} critical neurons for circuit function`
                          : "Behavioral transitions detected at key parameter thresholds"
                        }
                      </p>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">
                        Data suitable for publication-quality dose-response analysis
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
