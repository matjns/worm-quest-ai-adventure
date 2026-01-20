import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
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
import {
  GitCompare,
  Plus,
  Minus,
  Equal,
  Brain,
  Zap,
  Bookmark,
} from "lucide-react";
import { NEURON_COLORS, type NeuronData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
}

interface DesignerConnection {
  id: string;
  from: string;
  to: string;
  type: string;
  weight: number;
}

export interface HistoryState {
  id: string;
  label: string;
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
  timestamp: number;
  isBookmarked?: boolean;
  bookmarkName?: string;
}

interface DiffResult {
  addedNeurons: string[];
  removedNeurons: string[];
  commonNeurons: string[];
  movedNeurons: Array<{ id: string; dx: number; dy: number }>;
  addedConnections: Array<{ from: string; to: string }>;
  removedConnections: Array<{ from: string; to: string }>;
  commonConnections: Array<{ from: string; to: string }>;
}

function compareStates(stateA: HistoryState | null, stateB: HistoryState | null): DiffResult {
  const neuronsA = new Map((stateA?.neurons || []).map(n => [n.id, n]));
  const neuronsB = new Map((stateB?.neurons || []).map(n => [n.id, n]));

  const neuronIdsA = new Set(neuronsA.keys());
  const neuronIdsB = new Set(neuronsB.keys());

  const commonIds = [...neuronIdsA].filter(id => neuronIdsB.has(id));
  const movedNeurons = commonIds
    .map(id => {
      const a = neuronsA.get(id)!;
      const b = neuronsB.get(id)!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        return { id, dx, dy };
      }
      return null;
    })
    .filter(Boolean) as Array<{ id: string; dx: number; dy: number }>;

  const connectionsA = (stateA?.connections || []).map(c => `${c.from}->${c.to}`);
  const connectionsB = (stateB?.connections || []).map(c => `${c.from}->${c.to}`);
  const connSetA = new Set(connectionsA);
  const connSetB = new Set(connectionsB);

  return {
    addedNeurons: [...neuronIdsB].filter(n => !neuronIdsA.has(n)),
    removedNeurons: [...neuronIdsA].filter(n => !neuronIdsB.has(n)),
    commonNeurons: commonIds,
    movedNeurons,
    addedConnections: [...connSetB]
      .filter(c => !connSetA.has(c))
      .map(c => {
        const [from, to] = c.split("->");
        return { from, to };
      }),
    removedConnections: [...connSetA]
      .filter(c => !connSetB.has(c))
      .map(c => {
        const [from, to] = c.split("->");
        return { from, to };
      }),
    commonConnections: [...connSetA]
      .filter(c => connSetB.has(c))
      .map(c => {
        const [from, to] = c.split("->");
        return { from, to };
      }),
  };
}

function StateVisualization({
  state,
  diff,
  isLeft,
}: {
  state: HistoryState | null;
  diff: DiffResult;
  isLeft: boolean;
}) {
  if (!state) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
        <p className="text-muted-foreground text-sm">Select a state</p>
      </div>
    );
  }

  const highlightedNeurons = isLeft
    ? new Set(diff.removedNeurons)
    : new Set(diff.addedNeurons);
  const movedNeuronIds = new Set(diff.movedNeurons.map(m => m.id));
  const highlightedConns = isLeft
    ? new Set(diff.removedConnections.map(c => `${c.from}->${c.to}`))
    : new Set(diff.addedConnections.map(c => `${c.from}->${c.to}`));

  const neurons = state.neurons;
  const connections = state.connections;

  // Calculate bounds
  const minX = neurons.length > 0 ? Math.min(...neurons.map(n => n.x)) - 20 : 0;
  const maxX = neurons.length > 0 ? Math.max(...neurons.map(n => n.x)) + 20 : 200;
  const minY = neurons.length > 0 ? Math.min(...neurons.map(n => n.y)) - 20 : 0;
  const maxY = neurons.length > 0 ? Math.max(...neurons.map(n => n.y)) + 20 : 120;
  const width = Math.max(maxX - minX, 100);
  const height = Math.max(maxY - minY, 60);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-sm truncate max-w-[150px]">
            {state.bookmarkName || state.label}
          </h4>
          {state.isBookmarked && (
            <Bookmark className="w-3 h-3 text-primary fill-primary" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(state.timestamp, { addSuffix: true })}
        </span>
      </div>

      <svg
        className="w-full h-48 rounded-lg border-2 border-foreground"
        viewBox={`0 0 ${width} ${height}`}
        style={{ background: "hsl(var(--background))" }}
      >
        {/* Grid */}
        <defs>
          <pattern
            id={`grid-compare-${isLeft ? "left" : "right"}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.2"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>
        <rect
          width={width}
          height={height}
          fill={`url(#grid-compare-${isLeft ? "left" : "right"})`}
        />

        {/* Connections */}
        {connections.map((conn, i) => {
          const fromNeuron = neurons.find(n => n.id === conn.from);
          const toNeuron = neurons.find(n => n.id === conn.to);
          if (!fromNeuron || !toNeuron) return null;

          const x1 = fromNeuron.x - minX;
          const y1 = fromNeuron.y - minY;
          const x2 = toNeuron.x - minX;
          const y2 = toNeuron.y - minY;

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
          const cx = neuron.x - minX;
          const cy = neuron.y - minY;
          const isHighlighted = highlightedNeurons.has(neuron.id);
          const isMoved = movedNeuronIds.has(neuron.id);

          let fillColor = NEURON_COLORS[neuron.type] || "hsl(var(--primary))";
          let strokeColor = "hsl(var(--foreground))";
          let strokeWidth = 1;

          if (isHighlighted) {
            fillColor = isLeft ? "hsl(var(--destructive))" : "hsl(142 76% 36%)";
            strokeWidth = 2;
          } else if (isMoved) {
            strokeColor = "hsl(45 100% 50%)";
            strokeWidth = 2;
          }

          return (
            <motion.g key={neuron.id}>
              <motion.circle
                cx={cx}
                cy={cy}
                r={isHighlighted || isMoved ? 8 : 6}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              />
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="6"
                fontFamily="monospace"
              >
                {neuron.id.slice(0, 5)}
              </text>
            </motion.g>
          );
        })}

        {neurons.length === 0 && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="10"
          >
            Empty state
          </text>
        )}
      </svg>

      <div className="flex flex-wrap gap-1 text-xs">
        <Badge variant="outline" className="gap-1">
          <Brain className="w-3 h-3" />
          {neurons.length} neurons
        </Badge>
        <Badge variant="outline">
          <Zap className="w-3 h-3 mr-1" />
          {connections.length} connections
        </Badge>
      </div>
    </div>
  );
}

interface HistoryCompareDialogProps {
  states: HistoryState[];
  initialLeftIndex?: number;
  initialRightIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestoreState?: (index: number) => void;
}

export function HistoryCompareDialog({
  states,
  initialLeftIndex,
  initialRightIndex,
  open,
  onOpenChange,
  onRestoreState,
}: HistoryCompareDialogProps) {
  const [leftIndex, setLeftIndex] = useState<number | null>(initialLeftIndex ?? null);
  const [rightIndex, setRightIndex] = useState<number | null>(initialRightIndex ?? null);

  const leftState = leftIndex !== null ? states[leftIndex] : null;
  const rightState = rightIndex !== null ? states[rightIndex] : null;

  const diff = useMemo(
    () => compareStates(leftState, rightState),
    [leftState, rightState]
  );

  const hasComparison = leftState && rightState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Compare History States
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* State Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
                Base State (Before)
              </label>
              <Select
                value={leftIndex?.toString() ?? ""}
                onValueChange={v => setLeftIndex(v ? parseInt(v, 10) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s, i) => (
                    <SelectItem
                      key={s.id}
                      value={i.toString()}
                      disabled={i === rightIndex}
                    >
                      <div className="flex items-center gap-2">
                        {s.isBookmarked && (
                          <Bookmark className="w-3 h-3 text-primary fill-primary" />
                        )}
                        <span className="truncate">
                          {s.bookmarkName || s.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
                Compare State (After)
              </label>
              <Select
                value={rightIndex?.toString() ?? ""}
                onValueChange={v => setRightIndex(v ? parseInt(v, 10) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s, i) => (
                    <SelectItem
                      key={s.id}
                      value={i.toString()}
                      disabled={i === leftIndex}
                    >
                      <div className="flex items-center gap-2">
                        {s.isBookmarked && (
                          <Bookmark className="w-3 h-3 text-primary fill-primary" />
                        )}
                        <span className="truncate">
                          {s.bookmarkName || s.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Side-by-Side Visualization */}
          <div className="grid grid-cols-2 gap-4">
            <StateVisualization state={leftState} diff={diff} isLeft={true} />
            <StateVisualization state={rightState} diff={diff} isLeft={false} />
          </div>

          {/* Diff Summary */}
          {hasComparison && (
            <ScrollArea className="h-40 border-2 border-foreground rounded-lg p-4">
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase">Changes</h4>

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
                          {diff.commonNeurons.length} unchanged
                        </span>
                      </div>
                    )}
                    {diff.movedNeurons.length > 0 && (
                      <Badge variant="outline" className="text-xs gap-1 border-yellow-500 text-yellow-600">
                        ↔ {diff.movedNeurons.length} moved
                      </Badge>
                    )}
                    {diff.removedNeurons.map(n => (
                      <Badge key={`rem-${n}`} variant="destructive" className="text-xs gap-1">
                        <Minus className="w-3 h-3" />
                        {n}
                      </Badge>
                    ))}
                    {diff.addedNeurons.map(n => (
                      <Badge
                        key={`add-${n}`}
                        className="text-xs gap-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        <Plus className="w-3 h-3" />
                        {n}
                      </Badge>
                    ))}
                    {diff.addedNeurons.length === 0 &&
                      diff.removedNeurons.length === 0 &&
                      diff.movedNeurons.length === 0 && (
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
                          {diff.commonConnections.length} unchanged
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
                    <p className="text-lg font-bold text-yellow-600">
                      ~{diff.movedNeurons.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Moved</p>
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
              <p className="text-sm">Select two states to compare</p>
            </div>
          )}

          {/* Restore Buttons */}
          {hasComparison && onRestoreState && (
            <div className="flex justify-center gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (leftIndex !== null) {
                    onRestoreState(leftIndex);
                    onOpenChange(false);
                  }
                }}
              >
                Restore Base State
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (rightIndex !== null) {
                    onRestoreState(rightIndex);
                    onOpenChange(false);
                  }
                }}
              >
                Restore Compare State
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
