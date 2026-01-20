import { motion } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface CircuitNeuron {
  id: string;
  x: number;
  y: number;
  type?: string;
}

interface CircuitConnection {
  from: string;
  to: string;
  type?: string;
}

interface CircuitPreviewProps {
  children: React.ReactNode;
  circuitData?: {
    neurons?: CircuitNeuron[];
    connections?: CircuitConnection[];
  };
  title: string;
  behavior: string;
  neuronsUsed: string[];
}

export function CircuitPreviewTooltip({
  children,
  circuitData,
  title,
  behavior,
  neuronsUsed,
}: CircuitPreviewProps) {
  const neurons = circuitData?.neurons || [];
  const connections = circuitData?.connections || [];

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start" 
        className="w-72 p-0 border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border">
          <h4 className="font-bold text-sm uppercase truncate">{title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">{behavior}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {neuronsUsed.length} neurons
            </span>
          </div>
        </div>
        
        {/* Mini Circuit Visualization */}
        <div className="bg-muted/30 p-2">
          <svg 
            className="w-full h-32 rounded" 
            viewBox="0 0 200 100"
            style={{ background: "hsl(var(--background))" }}
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="miniGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path 
                  d="M 20 0 L 0 0 0 20" 
                  fill="none" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth="0.3"
                  strokeOpacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="200" height="100" fill="url(#miniGrid)" />

            {/* Draw connections */}
            {connections.map((conn, i) => {
              const fromNeuron = neurons.find((n) => n.id === conn.from);
              const toNeuron = neurons.find((n) => n.id === conn.to);
              if (!fromNeuron || !toNeuron) return null;

              const x1 = (fromNeuron.x / 100) * 180 + 10;
              const y1 = (fromNeuron.y / 100) * 80 + 10;
              const x2 = (toNeuron.x / 100) * 180 + 10;
              const y2 = (toNeuron.y / 100) * 80 + 10;

              return (
                <motion.line
                  key={`conn-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={conn.type === "excitatory" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                />
              );
            })}

            {/* Draw neurons */}
            {neurons.map((neuron, i) => {
              const cx = (neuron.x / 100) * 180 + 10;
              const cy = (neuron.y / 100) * 80 + 10;

              return (
                <motion.g key={neuron.id}>
                  {/* Glow effect */}
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="hsl(var(--primary))"
                    fillOpacity="0.3"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.2 
                    }}
                  />
                  {/* Neuron */}
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r="5"
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  />
                </motion.g>
              );
            })}

            {/* Empty state */}
            {neurons.length === 0 && (
              <text
                x="100"
                y="50"
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
              >
                No preview available
              </text>
            )}
          </svg>
        </div>

        {/* Neuron list */}
        {neuronsUsed.length > 0 && (
          <div className="p-2 border-t border-border">
            <p className="text-xs text-muted-foreground font-mono truncate">
              {neuronsUsed.slice(0, 5).join(", ")}
              {neuronsUsed.length > 5 && ` +${neuronsUsed.length - 5} more`}
            </p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
