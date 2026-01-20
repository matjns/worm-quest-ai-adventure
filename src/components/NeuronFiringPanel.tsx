import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NeuronData {
  id: string;
  name: string;
  type: "sensory" | "inter" | "motor";
  activity: number;
  isFiring: boolean;
}

interface NeuronFiringPanelProps {
  circuitData: Record<string, unknown>;
  position: number;
  speed: number;
  wormName: string;
  color: string;
  isPlayer?: boolean;
  className?: string;
}

// Neuron type colors
const NEURON_TYPE_COLORS = {
  sensory: "hsl(var(--chart-1))",
  inter: "hsl(var(--chart-2))",
  motor: "hsl(var(--chart-3))",
};

const NEURON_TYPE_LABELS = {
  sensory: "Sensory",
  inter: "Inter",
  motor: "Motor",
};

export function NeuronFiringPanel({
  circuitData,
  position,
  speed,
  wormName,
  color,
  isPlayer = false,
  className,
}: NeuronFiringPanelProps) {
  const [neurons, setNeurons] = useState<NeuronData[]>([]);
  const [firingHistory, setFiringHistory] = useState<number[]>([]);

  // Parse circuit data to get neurons
  const parsedNeurons = useMemo(() => {
    const neuronList = (circuitData?.neurons as { id?: string; name?: string; type?: string }[]) || [];
    
    return neuronList.map((n, idx) => ({
      id: n.id || `neuron-${idx}`,
      name: n.name || `N${idx + 1}`,
      type: (n.type as "sensory" | "inter" | "motor") || 
        (idx < 2 ? "sensory" : idx < neuronList.length - 2 ? "inter" : "motor"),
    }));
  }, [circuitData]);

  // Simulate neuron activity based on position and speed
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedNeurons = parsedNeurons.map((neuron, idx) => {
        // Different firing patterns based on neuron type
        let baseActivity = 0;
        let firingThreshold = 0.7;
        
        switch (neuron.type) {
          case "sensory":
            // Sensory neurons fire more at the start and during acceleration
            baseActivity = Math.sin(Date.now() / 300 + idx) * 0.3 + 0.5;
            baseActivity += speed * 0.1;
            break;
          case "inter":
            // Interneurons process signals with phase delays
            baseActivity = Math.sin(Date.now() / 400 + idx * 1.5) * 0.4 + 0.5;
            baseActivity += (position / 100) * 0.2;
            break;
          case "motor":
            // Motor neurons fire rhythmically for movement
            baseActivity = Math.abs(Math.sin(Date.now() / 200 + idx * 0.5)) * 0.6 + 0.3;
            baseActivity += speed * 0.15;
            break;
        }
        
        // Add noise
        baseActivity += (Math.random() - 0.5) * 0.2;
        baseActivity = Math.max(0, Math.min(1, baseActivity));
        
        return {
          ...neuron,
          activity: baseActivity,
          isFiring: baseActivity > firingThreshold,
        };
      });
      
      setNeurons(updatedNeurons);
      
      // Track firing history for sparkline
      const firingCount = updatedNeurons.filter(n => n.isFiring).length;
      setFiringHistory(prev => [...prev.slice(-20), firingCount]);
    }, 100);

    return () => clearInterval(interval);
  }, [parsedNeurons, position, speed]);

  // Count neurons by type
  const neuronCounts = useMemo(() => {
    return neurons.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [neurons]);

  // Active neuron count
  const activeCount = neurons.filter(n => n.isFiring).length;
  const totalCount = neurons.length;

  if (neurons.length === 0) {
    return (
      <Card className={cn("bg-card/80 backdrop-blur-sm", className)}>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          No neuron data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-card/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
            <span className={cn(isPlayer && "font-bold")}>{wormName}</span>
            {isPlayer && <Badge variant="outline" className="text-[10px] py-0">You</Badge>}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3" />
            {activeCount}/{totalCount}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        {/* Neuron Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          <AnimatePresence mode="sync">
            {neurons.slice(0, 12).map((neuron) => (
              <motion.div
                key={neuron.id}
                initial={false}
                animate={{
                  scale: neuron.isFiring ? 1.1 : 1,
                  opacity: neuron.isFiring ? 1 : 0.6,
                }}
                transition={{ duration: 0.1 }}
                className={cn(
                  "relative aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium border transition-colors",
                  neuron.isFiring 
                    ? "border-primary bg-primary/20" 
                    : "border-border bg-muted/30"
                )}
              >
                {/* Firing glow */}
                {neuron.isFiring && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.5, 1, 0.5], scale: 1 }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: `radial-gradient(circle, ${NEURON_TYPE_COLORS[neuron.type]}40 0%, transparent 70%)`,
                    }}
                  />
                )}
                
                {/* Activity indicator */}
                <div 
                  className="w-2 h-2 rounded-full mb-0.5"
                  style={{ 
                    backgroundColor: NEURON_TYPE_COLORS[neuron.type],
                    opacity: 0.3 + neuron.activity * 0.7,
                    boxShadow: neuron.isFiring 
                      ? `0 0 8px ${NEURON_TYPE_COLORS[neuron.type]}` 
                      : "none"
                  }}
                />
                <span className="text-foreground/80 relative z-10">{neuron.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Activity Bars by Type */}
        <div className="space-y-1.5">
          {(["sensory", "inter", "motor"] as const).map((type) => {
            const typeNeurons = neurons.filter(n => n.type === type);
            const avgActivity = typeNeurons.length > 0
              ? typeNeurons.reduce((sum, n) => sum + n.activity, 0) / typeNeurons.length
              : 0;
            
            return (
              <div key={type} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{NEURON_TYPE_LABELS[type]}</span>
                  <span 
                    className="font-medium"
                    style={{ color: NEURON_TYPE_COLORS[type] }}
                  >
                    {(avgActivity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${avgActivity * 100}%` }}
                    transition={{ duration: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: NEURON_TYPE_COLORS[type] }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Firing Rate Sparkline */}
        <div className="pt-1 border-t border-border">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Firing Rate
            </span>
            <span>{activeCount} active</span>
          </div>
          <div className="flex items-end gap-0.5 h-4">
            {firingHistory.map((count, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${(count / Math.max(totalCount, 1)) * 100}%` }}
                className="flex-1 rounded-sm bg-primary/60"
                style={{
                  opacity: 0.3 + (idx / firingHistory.length) * 0.7,
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
