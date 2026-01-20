import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GitMerge, Check, X, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type NeuronData, NEURON_COLORS } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection {
  id: string;
  from: string;
  to: string;
  type: string;
  weight: number;
}

interface HistoryState {
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
  timestamp: number;
  label?: string;
  isBookmarked?: boolean;
  bookmarkName?: string;
  userId?: string;
}

interface MergeConflict {
  type: "neuron_position" | "neuron_exists" | "connection_weight" | "connection_exists";
  neuronId?: string;
  connectionId?: string;
  baseValue: unknown;
  branchAValue: unknown;
  branchBValue: unknown;
  resolution?: "base" | "branchA" | "branchB" | "combined";
}

interface ThreeWayMergeDialogProps {
  historyStates: HistoryState[];
  currentState: { neurons: PlacedNeuron[]; connections: DesignerConnection[] };
  onMerge: (mergedNeurons: PlacedNeuron[], mergedConnections: DesignerConnection[]) => void;
  trigger: React.ReactNode;
}

export function ThreeWayMergeDialog({
  historyStates,
  currentState,
  onMerge,
  trigger,
}: ThreeWayMergeDialogProps) {
  const [open, setOpen] = useState(false);
  const [baseIndex, setBaseIndex] = useState<number | null>(null);
  const [branchAIndex, setBranchAIndex] = useState<number | null>(null);
  const [branchBIndex, setBranchBIndex] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<MergeConflict[]>([]);
  const [autoResolve, setAutoResolve] = useState(true);

  const baseState = baseIndex !== null ? historyStates[baseIndex] : null;
  const branchAState = branchAIndex !== null ? historyStates[branchAIndex] : null;
  const branchBState = branchBIndex !== null ? historyStates[branchBIndex] : null;

  // Analyze conflicts between three states
  const analyzeConflicts = useMemo(() => {
    if (!baseState || !branchAState || !branchBState) return [];

    const foundConflicts: MergeConflict[] = [];
    const baseNeuronMap = new Map(baseState.neurons.map(n => [n.id, n]));
    const branchANeuronMap = new Map(branchAState.neurons.map(n => [n.id, n]));
    const branchBNeuronMap = new Map(branchBState.neurons.map(n => [n.id, n]));

    // Check neuron conflicts
    const allNeuronIds = new Set([
      ...baseState.neurons.map(n => n.id),
      ...branchAState.neurons.map(n => n.id),
      ...branchBState.neurons.map(n => n.id),
    ]);

    allNeuronIds.forEach(id => {
      const base = baseNeuronMap.get(id);
      const a = branchANeuronMap.get(id);
      const b = branchBNeuronMap.get(id);

      // Position conflict: both branches moved the neuron differently
      if (base && a && b) {
        const aMovedX = Math.abs(a.x - base.x) > 5;
        const aMovedY = Math.abs(a.y - base.y) > 5;
        const bMovedX = Math.abs(b.x - base.x) > 5;
        const bMovedY = Math.abs(b.y - base.y) > 5;

        if ((aMovedX || aMovedY) && (bMovedX || bMovedY)) {
          if (Math.abs(a.x - b.x) > 5 || Math.abs(a.y - b.y) > 5) {
            foundConflicts.push({
              type: "neuron_position",
              neuronId: id,
              baseValue: { x: base.x, y: base.y },
              branchAValue: { x: a.x, y: a.y },
              branchBValue: { x: b.x, y: b.y },
              resolution: autoResolve ? "branchA" : undefined,
            });
          }
        }
      }

      // Existence conflict: added in one, deleted in other
      if (!base && a && !b) {
        foundConflicts.push({
          type: "neuron_exists",
          neuronId: id,
          baseValue: null,
          branchAValue: a,
          branchBValue: null,
          resolution: autoResolve ? "branchA" : undefined,
        });
      }
      if (!base && !a && b) {
        foundConflicts.push({
          type: "neuron_exists",
          neuronId: id,
          baseValue: null,
          branchAValue: null,
          branchBValue: b,
          resolution: autoResolve ? "branchB" : undefined,
        });
      }
    });

    // Check connection conflicts
    const baseConnMap = new Map(baseState.connections.map(c => [c.id, c]));
    const aConnMap = new Map(branchAState.connections.map(c => [c.id, c]));
    const bConnMap = new Map(branchBState.connections.map(c => [c.id, c]));

    const allConnIds = new Set([
      ...baseState.connections.map(c => c.id),
      ...branchAState.connections.map(c => c.id),
      ...branchBState.connections.map(c => c.id),
    ]);

    allConnIds.forEach(id => {
      const base = baseConnMap.get(id);
      const a = aConnMap.get(id);
      const b = bConnMap.get(id);

      // Weight conflict
      if (base && a && b && (a.weight !== b.weight)) {
        foundConflicts.push({
          type: "connection_weight",
          connectionId: id,
          baseValue: base.weight,
          branchAValue: a.weight,
          branchBValue: b.weight,
          resolution: autoResolve ? "branchA" : undefined,
        });
      }
    });

    return foundConflicts;
  }, [baseState, branchAState, branchBState, autoResolve]);

  // Compute merged result
  const mergedResult = useMemo(() => {
    if (!baseState || !branchAState || !branchBState) return null;

    const mergedNeurons: PlacedNeuron[] = [];
    const mergedConnections: DesignerConnection[] = [];

    const baseNeuronMap = new Map(baseState.neurons.map(n => [n.id, n]));
    const branchANeuronMap = new Map(branchAState.neurons.map(n => [n.id, n]));
    const branchBNeuronMap = new Map(branchBState.neurons.map(n => [n.id, n]));

    const allNeuronIds = new Set([
      ...branchAState.neurons.map(n => n.id),
      ...branchBState.neurons.map(n => n.id),
    ]);

    // Merge neurons
    allNeuronIds.forEach(id => {
      const a = branchANeuronMap.get(id);
      const b = branchBNeuronMap.get(id);
      const conflict = analyzeConflicts.find(c => c.neuronId === id);

      if (conflict?.type === "neuron_position") {
        const resolution = conflict.resolution || "branchA";
        if (resolution === "branchA" && a) mergedNeurons.push(a);
        else if (resolution === "branchB" && b) mergedNeurons.push(b);
        else if (resolution === "combined" && a && b) {
          mergedNeurons.push({
            ...a,
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2,
          });
        }
      } else if (a && b) {
        // Both have it, use A (or whichever changed from base)
        const base = baseNeuronMap.get(id);
        if (!base || (Math.abs(a.x - base.x) > 5 || Math.abs(a.y - base.y) > 5)) {
          mergedNeurons.push(a);
        } else {
          mergedNeurons.push(b);
        }
      } else if (a) {
        mergedNeurons.push(a);
      } else if (b) {
        mergedNeurons.push(b);
      }
    });

    // Merge connections
    const allConnIds = new Set([
      ...branchAState.connections.map(c => c.id),
      ...branchBState.connections.map(c => c.id),
    ]);

    const aConnMap = new Map(branchAState.connections.map(c => [c.id, c]));
    const bConnMap = new Map(branchBState.connections.map(c => [c.id, c]));

    allConnIds.forEach(id => {
      const a = aConnMap.get(id);
      const b = bConnMap.get(id);
      const conflict = analyzeConflicts.find(c => c.connectionId === id);

      if (conflict?.type === "connection_weight" && a && b) {
        const resolution = conflict.resolution || "branchA";
        if (resolution === "branchA") mergedConnections.push(a);
        else if (resolution === "branchB") mergedConnections.push(b);
        else mergedConnections.push({ ...a, weight: Math.round((a.weight + b.weight) / 2) });
      } else if (a && b) {
        mergedConnections.push(a);
      } else if (a) {
        mergedConnections.push(a);
      } else if (b) {
        mergedConnections.push(b);
      }
    });

    return { neurons: mergedNeurons, connections: mergedConnections };
  }, [baseState, branchAState, branchBState, analyzeConflicts]);

  const handleResolve = (conflictIndex: number, resolution: "base" | "branchA" | "branchB" | "combined") => {
    setConflicts(prev => {
      const updated = [...prev];
      if (updated[conflictIndex]) {
        updated[conflictIndex] = { ...updated[conflictIndex], resolution };
      }
      return updated;
    });
  };

  const handleMerge = () => {
    if (mergedResult) {
      onMerge(mergedResult.neurons, mergedResult.connections);
      setOpen(false);
    }
  };

  const renderMiniPreview = (state: HistoryState | null, label: string, color: string) => {
    if (!state) return (
      <div className="w-full h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Select {label}</span>
      </div>
    );

    const neurons = state.neurons;
    const minX = Math.min(...neurons.map(n => n.x), 0);
    const maxX = Math.max(...neurons.map(n => n.x), 100);
    const minY = Math.min(...neurons.map(n => n.y), 0);
    const maxY = Math.max(...neurons.map(n => n.y), 100);
    const width = Math.max(maxX - minX, 50);
    const height = Math.max(maxY - minY, 50);

    return (
      <div className={cn("w-full rounded-lg border-2 overflow-hidden", color)}>
        <div className="px-2 py-1 text-xs font-bold border-b" style={{ borderColor: "inherit" }}>
          {label} • {neurons.length}N / {state.connections.length}C
        </div>
        <svg viewBox="0 0 100 60" className="w-full h-20 bg-background/50">
          {state.connections.map(conn => {
            const from = neurons.find(n => n.id === conn.from);
            const to = neurons.find(n => n.id === conn.to);
            if (!from || !to) return null;
            const x1 = ((from.x - minX) / width) * 90 + 5;
            const y1 = ((from.y - minY) / height) * 50 + 5;
            const x2 = ((to.x - minX) / width) * 90 + 5;
            const y2 = ((to.y - minY) / height) * 50 + 5;
            return (
              <line
                key={conn.id}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.5"
                strokeOpacity={0.4}
              />
            );
          })}
          {neurons.map(n => {
            const x = ((n.x - minX) / width) * 90 + 5;
            const y = ((n.y - minY) / height) * 50 + 5;
            return (
              <circle
                key={n.id}
                cx={x} cy={y} r="3"
                fill={NEURON_COLORS[n.type]}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-primary" />
            3-Way Merge
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* State Selectors */}
          <div className="grid grid-cols-3 gap-4">
            {/* Base */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Base (Common Ancestor)</Label>
              <select
                className="w-full p-2 text-sm rounded-md border bg-background"
                value={baseIndex ?? ""}
                onChange={e => setBaseIndex(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select base...</option>
                {historyStates.map((s, i) => (
                  <option key={i} value={i}>
                    {s.bookmarkName || s.label || `State ${i + 1}`}
                  </option>
                ))}
              </select>
              {renderMiniPreview(baseState, "Base", "border-muted")}
            </div>

            {/* Branch A */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Branch A</Label>
              <select
                className="w-full p-2 text-sm rounded-md border bg-background"
                value={branchAIndex ?? ""}
                onChange={e => setBranchAIndex(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select branch A...</option>
                {historyStates.map((s, i) => (
                  <option key={i} value={i}>
                    {s.bookmarkName || s.label || `State ${i + 1}`}
                  </option>
                ))}
              </select>
              {renderMiniPreview(branchAState, "Branch A", "border-blue-500")}
            </div>

            {/* Branch B */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Branch B</Label>
              <select
                className="w-full p-2 text-sm rounded-md border bg-background"
                value={branchBIndex ?? ""}
                onChange={e => setBranchBIndex(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select branch B...</option>
                {historyStates.map((s, i) => (
                  <option key={i} value={i}>
                    {s.bookmarkName || s.label || `State ${i + 1}`}
                  </option>
                ))}
              </select>
              {renderMiniPreview(branchBState, "Branch B", "border-green-500")}
            </div>
          </div>

          {/* Merge Preview & Conflicts */}
          {baseState && branchAState && branchBState && (
            <>
              <div className="flex items-center justify-center gap-2 py-2">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="gap-1">
                  <GitMerge className="w-3 h-3" />
                  Merged Result
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Merged Preview */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground">Merge Result</Label>
                  {mergedResult && (
                    <div className="border-2 border-primary rounded-lg overflow-hidden">
                      <div className="px-2 py-1 text-xs font-bold bg-primary/10 border-b border-primary">
                        Merged • {mergedResult.neurons.length}N / {mergedResult.connections.length}C
                      </div>
                      <svg viewBox="0 0 200 120" className="w-full h-32 bg-background">
                        {mergedResult.neurons.length > 0 && (() => {
                          const neurons = mergedResult.neurons;
                          const minX = Math.min(...neurons.map(n => n.x));
                          const maxX = Math.max(...neurons.map(n => n.x));
                          const minY = Math.min(...neurons.map(n => n.y));
                          const maxY = Math.max(...neurons.map(n => n.y));
                          const width = Math.max(maxX - minX, 50);
                          const height = Math.max(maxY - minY, 50);

                          return (
                            <>
                              {mergedResult.connections.map(conn => {
                                const from = neurons.find(n => n.id === conn.from);
                                const to = neurons.find(n => n.id === conn.to);
                                if (!from || !to) return null;
                                const x1 = ((from.x - minX) / width) * 180 + 10;
                                const y1 = ((from.y - minY) / height) * 100 + 10;
                                const x2 = ((to.x - minX) / width) * 180 + 10;
                                const y2 = ((to.y - minY) / height) * 100 + 10;
                                return (
                                  <line
                                    key={conn.id}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="1"
                                    strokeOpacity={0.6}
                                  />
                                );
                              })}
                              {neurons.map(n => {
                                const x = ((n.x - minX) / width) * 180 + 10;
                                const y = ((n.y - minY) / height) * 100 + 10;
                                return (
                                  <motion.circle
                                    key={n.id}
                                    cx={x} cy={y} r="5"
                                    fill={NEURON_COLORS[n.type]}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  />
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}
                </div>

                {/* Conflicts */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    Conflicts ({analyzeConflicts.length})
                  </Label>
                  <ScrollArea className="h-40 border rounded-lg p-2">
                    {analyzeConflicts.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        No conflicts detected
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {analyzeConflicts.map((conflict, i) => (
                          <div key={i} className="p-2 bg-muted/50 rounded-md text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">
                                {conflict.type.replace(/_/g, " ")}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {conflict.neuronId || conflict.connectionId}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={conflict.resolution === "branchA" ? "default" : "outline"}
                                className="h-6 text-[10px] px-2"
                                onClick={() => handleResolve(i, "branchA")}
                              >
                                Use A
                              </Button>
                              <Button
                                size="sm"
                                variant={conflict.resolution === "branchB" ? "default" : "outline"}
                                className="h-6 text-[10px] px-2"
                                onClick={() => handleResolve(i, "branchB")}
                              >
                                Use B
                              </Button>
                              {conflict.type === "neuron_position" && (
                                <Button
                                  size="sm"
                                  variant={conflict.resolution === "combined" ? "default" : "outline"}
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => handleResolve(i, "combined")}
                                >
                                  Average
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-4 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="auto-resolve"
                    checked={autoResolve}
                    onCheckedChange={(c) => setAutoResolve(!!c)}
                  />
                  <Label htmlFor="auto-resolve" className="text-sm">
                    Auto-resolve conflicts (prefer Branch A)
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!mergedResult}
            className="gap-2"
          >
            <GitMerge className="w-4 h-4" />
            Apply Merge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
