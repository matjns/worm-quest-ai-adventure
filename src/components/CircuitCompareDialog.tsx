import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompare, X, Zap, ArrowRight, Plus, Minus, Equal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SharedCircuit } from "@/hooks/useCommunity";

interface CircuitCompareDialogProps {
  circuits: SharedCircuit[];
  initialCircuit?: SharedCircuit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiffResult {
  addedNeurons: string[];
  removedNeurons: string[];
  commonNeurons: string[];
  addedConnections: Array<{ from: string; to: string }>;
  removedConnections: Array<{ from: string; to: string }>;
  commonConnections: Array<{ from: string; to: string }>;
}

function compareCircuits(
  circuitA: SharedCircuit | null,
  circuitB: SharedCircuit | null
): DiffResult {
  const neuronsA = new Set(circuitA?.neurons_used || []);
  const neuronsB = new Set(circuitB?.neurons_used || []);

  const connectionsA = (circuitA?.circuit_data?.connections || []).map(
    (c) => `${c.from}->${c.to}`
  );
  const connectionsB = (circuitB?.circuit_data?.connections || []).map(
    (c) => `${c.from}->${c.to}`
  );
  const connSetA = new Set(connectionsA);
  const connSetB = new Set(connectionsB);

  return {
    addedNeurons: [...neuronsB].filter((n) => !neuronsA.has(n)),
    removedNeurons: [...neuronsA].filter((n) => !neuronsB.has(n)),
    commonNeurons: [...neuronsA].filter((n) => neuronsB.has(n)),
    addedConnections: [...connSetB]
      .filter((c) => !connSetA.has(c))
      .map((c) => {
        const [from, to] = c.split("->");
        return { from, to };
      }),
    removedConnections: [...connSetA]
      .filter((c) => !connSetB.has(c))
      .map((c) => {
        const [from, to] = c.split("->");
        return { from, to };
      }),
    commonConnections: [...connSetA]
      .filter((c) => connSetB.has(c))
      .map((c) => {
        const [from, to] = c.split("->");
        return { from, to };
      }),
  };
}

function CircuitVisualization({
  circuit,
  diff,
  isLeft,
}: {
  circuit: SharedCircuit | null;
  diff: DiffResult;
  isLeft: boolean;
}) {
  if (!circuit) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
        <p className="text-muted-foreground text-sm">Select a circuit</p>
      </div>
    );
  }

  const neurons = circuit.circuit_data?.neurons || [];
  const connections = circuit.circuit_data?.connections || [];

  // Determine which neurons/connections are different
  const highlightedNeurons = isLeft
    ? new Set(diff.removedNeurons)
    : new Set(diff.addedNeurons);
  const highlightedConns = isLeft
    ? new Set(diff.removedConnections.map((c) => `${c.from}->${c.to}`))
    : new Set(diff.addedConnections.map((c) => `${c.from}->${c.to}`));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm uppercase truncate">{circuit.title}</h4>
        <Badge variant="secondary" className="text-xs">
          {circuit.behavior}
        </Badge>
      </div>

      <svg
        className="w-full h-48 rounded-lg border-2 border-foreground"
        viewBox="0 0 200 120"
        style={{ background: "hsl(var(--background))" }}
      >
        {/* Grid */}
        <defs>
          <pattern id={`grid-${isLeft ? 'left' : 'right'}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.2"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="200" height="120" fill={`url(#grid-${isLeft ? 'left' : 'right'})`} />

        {/* Connections */}
        {connections.map((conn, i) => {
          const fromNeuron = neurons.find((n) => n.id === conn.from);
          const toNeuron = neurons.find((n) => n.id === conn.to);
          if (!fromNeuron || !toNeuron) return null;

          const x1 = (fromNeuron.x / 100) * 180 + 10;
          const y1 = (fromNeuron.y / 100) * 100 + 10;
          const x2 = (toNeuron.x / 100) * 180 + 10;
          const y2 = (toNeuron.y / 100) * 100 + 10;

          const connKey = `${conn.from}->${conn.to}`;
          const isHighlighted = highlightedConns.has(connKey);
          const color = isHighlighted
            ? isLeft
              ? "hsl(var(--destructive))"
              : "hsl(142 76% 36%)"
            : "hsl(var(--primary))";

          return (
            <motion.line
              key={`conn-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeOpacity={isHighlighted ? 1 : 0.5}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
            />
          );
        })}

        {/* Neurons */}
        {neurons.map((neuron, i) => {
          const cx = (neuron.x / 100) * 180 + 10;
          const cy = (neuron.y / 100) * 100 + 10;
          const isHighlighted = highlightedNeurons.has(neuron.id);
          const fillColor = isHighlighted
            ? isLeft
              ? "hsl(var(--destructive))"
              : "hsl(142 76% 36%)"
            : "hsl(var(--primary))";

          return (
            <motion.g key={neuron.id}>
              <motion.circle
                cx={cx}
                cy={cy}
                r={isHighlighted ? 7 : 5}
                fill={fillColor}
                stroke="hsl(var(--foreground))"
                strokeWidth="1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              />
              <text
                x={cx}
                y={cy + 12}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="5"
                fontFamily="monospace"
              >
                {neuron.id.slice(0, 4)}
              </text>
            </motion.g>
          );
        })}

        {/* Empty state */}
        {neurons.length === 0 && (
          <text
            x="100"
            y="60"
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
          >
            No visualization data
          </text>
        )}
      </svg>

      <div className="flex flex-wrap gap-1 text-xs">
        <Badge variant="outline" className="gap-1">
          <Zap className="w-3 h-3" />
          {circuit.neurons_used.length} neurons
        </Badge>
        <Badge variant="outline">
          {connections.length} connections
        </Badge>
      </div>
    </div>
  );
}

export function CircuitCompareDialog({
  circuits,
  initialCircuit,
  open,
  onOpenChange,
}: CircuitCompareDialogProps) {
  const [leftCircuitId, setLeftCircuitId] = useState<string | null>(
    initialCircuit?.id || null
  );
  const [rightCircuitId, setRightCircuitId] = useState<string | null>(null);

  const leftCircuit = circuits.find((c) => c.id === leftCircuitId) || null;
  const rightCircuit = circuits.find((c) => c.id === rightCircuitId) || null;

  const diff = useMemo(
    () => compareCircuits(leftCircuit, rightCircuit),
    [leftCircuit, rightCircuit]
  );

  const hasComparison = leftCircuit && rightCircuit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare Circuits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Circuit Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
                Circuit A (Base)
              </label>
              <Select
                value={leftCircuitId || ""}
                onValueChange={(v) => setLeftCircuitId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select circuit..." />
                </SelectTrigger>
                <SelectContent>
                  {circuits.map((c) => (
                    <SelectItem key={c.id} value={c.id} disabled={c.id === rightCircuitId}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
                Circuit B (Compare)
              </label>
              <Select
                value={rightCircuitId || ""}
                onValueChange={(v) => setRightCircuitId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select circuit..." />
                </SelectTrigger>
                <SelectContent>
                  {circuits.map((c) => (
                    <SelectItem key={c.id} value={c.id} disabled={c.id === leftCircuitId}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Side-by-Side Visualization */}
          <div className="grid grid-cols-2 gap-4">
            <CircuitVisualization circuit={leftCircuit} diff={diff} isLeft={true} />
            <CircuitVisualization circuit={rightCircuit} diff={diff} isLeft={false} />
          </div>

          {/* Diff Summary */}
          {hasComparison && (
            <ScrollArea className="h-48 border-2 border-foreground rounded-lg p-4">
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase">Differences</h4>

                {/* Neuron Changes */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase">
                    Neurons
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {diff.commonNeurons.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Equal className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {diff.commonNeurons.length} shared
                        </span>
                      </div>
                    )}
                    {diff.removedNeurons.map((n) => (
                      <Badge key={`rem-${n}`} variant="destructive" className="text-xs gap-1">
                        <Minus className="w-3 h-3" />
                        {n}
                      </Badge>
                    ))}
                    {diff.addedNeurons.map((n) => (
                      <Badge
                        key={`add-${n}`}
                        className="text-xs gap-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3" />
                        {n}
                      </Badge>
                    ))}
                    {diff.addedNeurons.length === 0 && diff.removedNeurons.length === 0 && (
                      <span className="text-xs text-muted-foreground">No changes</span>
                    )}
                  </div>
                </div>

                {/* Connection Changes */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase">
                    Connections
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {diff.commonConnections.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Equal className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {diff.commonConnections.length} shared
                        </span>
                      </div>
                    )}
                    {diff.removedConnections.map((c, i) => (
                      <Badge key={`rem-conn-${i}`} variant="destructive" className="text-xs gap-1">
                        <Minus className="w-3 h-3" />
                        {c.from} → {c.to}
                      </Badge>
                    ))}
                    {diff.addedConnections.map((c, i) => (
                      <Badge
                        key={`add-conn-${i}`}
                        className="text-xs gap-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3" />
                        {c.from} → {c.to}
                      </Badge>
                    ))}
                    {diff.addedConnections.length === 0 &&
                      diff.removedConnections.length === 0 && (
                        <span className="text-xs text-muted-foreground">No changes</span>
                      )}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold text-destructive">
                      -{diff.removedNeurons.length + diff.removedConnections.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Removed</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold text-muted-foreground">
                      {diff.commonNeurons.length + diff.commonConnections.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Shared</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold text-green-600">
                      +{diff.addedNeurons.length + diff.addedConnections.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Added</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {!hasComparison && (
            <div className="text-center py-8 text-muted-foreground">
              <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select two circuits to compare</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
