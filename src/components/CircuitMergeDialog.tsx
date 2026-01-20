import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Merge, Zap, ArrowRight, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SharedCircuit } from "@/hooks/useCommunity";
import { toast } from "sonner";

interface CircuitMergeDialogProps {
  circuits: SharedCircuit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerge: (mergedCircuit: {
    title: string;
    description?: string;
    behavior: string;
    neurons_used: string[];
    tags: string[];
    circuit_data: {
      neurons: Array<{ id: string; x: number; y: number }>;
      connections: Array<{ from: string; to: string; type: string }>;
    };
  }) => Promise<void>;
}

interface MergedCircuitData {
  neurons: Array<{ id: string; x: number; y: number; source: "A" | "B" | "both" }>;
  connections: Array<{ from: string; to: string; type: string; source: "A" | "B" | "both" }>;
  neuronsUsed: string[];
  tags: string[];
  conflicts: string[];
}

function mergeCircuits(
  circuitA: SharedCircuit | null,
  circuitB: SharedCircuit | null
): MergedCircuitData {
  if (!circuitA || !circuitB) {
    return { neurons: [], connections: [], neuronsUsed: [], tags: [], conflicts: [] };
  }

  const neuronsA = circuitA.circuit_data?.neurons || [];
  const neuronsB = circuitB.circuit_data?.neurons || [];
  const connectionsA = circuitA.circuit_data?.connections || [];
  const connectionsB = circuitB.circuit_data?.connections || [];

  const conflicts: string[] = [];
  const mergedNeuronsMap = new Map<string, { id: string; x: number; y: number; source: "A" | "B" | "both" }>();

  // Add neurons from A
  neuronsA.forEach((n) => {
    mergedNeuronsMap.set(n.id, { ...n, source: "A" });
  });

  // Add/merge neurons from B
  neuronsB.forEach((n) => {
    if (mergedNeuronsMap.has(n.id)) {
      const existing = mergedNeuronsMap.get(n.id)!;
      // Check for position conflict
      if (existing.x !== n.x || existing.y !== n.y) {
        conflicts.push(`Neuron "${n.id}" has different positions - using Circuit A's position`);
      }
      mergedNeuronsMap.set(n.id, { ...existing, source: "both" });
    } else {
      // Offset position slightly to avoid overlap
      const offsetX = Math.min(100, n.x + 5);
      const offsetY = Math.min(100, n.y + 5);
      mergedNeuronsMap.set(n.id, { id: n.id, x: offsetX, y: offsetY, source: "B" });
    }
  });

  // Merge connections
  const connectionKey = (c: { from: string; to: string }) => `${c.from}->${c.to}`;
  const mergedConnectionsMap = new Map<string, { from: string; to: string; type: string; source: "A" | "B" | "both" }>();

  connectionsA.forEach((c) => {
    mergedConnectionsMap.set(connectionKey(c), { ...c, source: "A" });
  });

  connectionsB.forEach((c) => {
    const key = connectionKey(c);
    if (mergedConnectionsMap.has(key)) {
      const existing = mergedConnectionsMap.get(key)!;
      if (existing.type !== c.type) {
        conflicts.push(`Connection "${c.from} → ${c.to}" has different types - using Circuit A's type`);
      }
      mergedConnectionsMap.set(key, { ...existing, source: "both" });
    } else {
      mergedConnectionsMap.set(key, { ...c, source: "B" });
    }
  });

  // Merge neurons_used arrays
  const neuronsUsedSet = new Set([
    ...(circuitA.neurons_used || []),
    ...(circuitB.neurons_used || []),
  ]);

  // Merge tags
  const tagsSet = new Set([
    ...(circuitA.tags || []),
    ...(circuitB.tags || []),
  ]);

  return {
    neurons: Array.from(mergedNeuronsMap.values()),
    connections: Array.from(mergedConnectionsMap.values()),
    neuronsUsed: Array.from(neuronsUsedSet),
    tags: Array.from(tagsSet),
    conflicts,
  };
}

function MergedVisualization({ data }: { data: MergedCircuitData }) {
  const neurons = data.neurons;
  const connections = data.connections;

  return (
    <svg
      className="w-full h-40 rounded-lg border-2 border-foreground"
      viewBox="0 0 200 100"
      style={{ background: "hsl(var(--background))" }}
    >
      <defs>
        <pattern id="merge-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.2"
            strokeOpacity="0.3"
          />
        </pattern>
      </defs>
      <rect width="200" height="100" fill="url(#merge-grid)" />

      {/* Connections */}
      {connections.map((conn, i) => {
        const fromNeuron = neurons.find((n) => n.id === conn.from);
        const toNeuron = neurons.find((n) => n.id === conn.to);
        if (!fromNeuron || !toNeuron) return null;

        const x1 = (fromNeuron.x / 100) * 180 + 10;
        const y1 = (fromNeuron.y / 100) * 80 + 10;
        const x2 = (toNeuron.x / 100) * 180 + 10;
        const y2 = (toNeuron.y / 100) * 80 + 10;

        const color =
          conn.source === "A"
            ? "hsl(var(--primary))"
            : conn.source === "B"
            ? "hsl(142 76% 36%)"
            : "hsl(45 93% 47%)";

        return (
          <motion.line
            key={`conn-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
          />
        );
      })}

      {/* Neurons */}
      {neurons.map((neuron, i) => {
        const cx = (neuron.x / 100) * 180 + 10;
        const cy = (neuron.y / 100) * 80 + 10;

        const fillColor =
          neuron.source === "A"
            ? "hsl(var(--primary))"
            : neuron.source === "B"
            ? "hsl(142 76% 36%)"
            : "hsl(45 93% 47%)";

        return (
          <motion.circle
            key={neuron.id}
            cx={cx}
            cy={cy}
            r="5"
            fill={fillColor}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
          />
        );
      })}

      {neurons.length === 0 && (
        <text
          x="100"
          y="50"
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize="10"
        >
          Select circuits to merge
        </text>
      )}
    </svg>
  );
}

export function CircuitMergeDialog({
  circuits,
  open,
  onOpenChange,
  onMerge,
}: CircuitMergeDialogProps) {
  const [circuitAId, setCircuitAId] = useState<string | null>(null);
  const [circuitBId, setCircuitBId] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const circuitA = circuits.find((c) => c.id === circuitAId) || null;
  const circuitB = circuits.find((c) => c.id === circuitBId) || null;

  const mergedData = useMemo(() => mergeCircuits(circuitA, circuitB), [circuitA, circuitB]);

  const canMerge = circuitA && circuitB && title.trim();

  // Auto-generate title when circuits are selected
  const generateTitle = () => {
    if (circuitA && circuitB) {
      setTitle(`${circuitA.title} + ${circuitB.title}`);
    }
  };

  const handleMerge = async () => {
    if (!canMerge) return;

    setMerging(true);
    try {
      await onMerge({
        title: title.trim(),
        description: description.trim() || undefined,
        behavior: `merged (${circuitA!.behavior} + ${circuitB!.behavior})`,
        neurons_used: mergedData.neuronsUsed,
        tags: [...mergedData.tags, "merged"],
        circuit_data: {
          neurons: mergedData.neurons.map((n) => ({ id: n.id, x: n.x, y: n.y })),
          connections: mergedData.connections.map((c) => ({ from: c.from, to: c.to, type: c.type })),
        },
      });
      toast.success("Circuits merged successfully!");
      onOpenChange(false);
      // Reset state
      setCircuitAId(null);
      setCircuitBId(null);
      setTitle("");
      setDescription("");
    } catch {
      toast.error("Failed to merge circuits");
    } finally {
      setMerging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="w-5 h-5" />
            Merge Circuits
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Circuit Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground">Circuit A</Label>
                <Select
                  value={circuitAId || ""}
                  onValueChange={(v) => {
                    setCircuitAId(v || null);
                    if (v && circuitBId) generateTitle();
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select first circuit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {circuits.map((c) => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === circuitBId}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs uppercase text-muted-foreground">Circuit B</Label>
                <Select
                  value={circuitBId || ""}
                  onValueChange={(v) => {
                    setCircuitBId(v || null);
                    if (circuitAId && v) generateTitle();
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select second circuit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {circuits.map((c) => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === circuitAId}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Legend */}
            {circuitA && circuitB && (
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>From {circuitA.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(142 76% 36%)" }} />
                  <span>From {circuitB.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(45 93% 47%)" }} />
                  <span>Shared</span>
                </div>
              </div>
            )}

            {/* Merged Preview */}
            <div>
              <Label className="text-xs uppercase text-muted-foreground mb-2 block">
                Merged Preview
              </Label>
              <MergedVisualization data={mergedData} />
            </div>

            {/* Stats */}
            {circuitA && circuitB && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/50 rounded border">
                  <p className="text-lg font-bold">{mergedData.neurons.length}</p>
                  <p className="text-xs text-muted-foreground">Neurons</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded border">
                  <p className="text-lg font-bold">{mergedData.connections.length}</p>
                  <p className="text-xs text-muted-foreground">Connections</p>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded border">
                  <p className="text-lg font-bold">{mergedData.tags.length}</p>
                  <p className="text-xs text-muted-foreground">Tags</p>
                </div>
              </div>
            )}

            {/* Conflicts Warning */}
            {mergedData.conflicts.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Merge conflicts resolved:</p>
                  <ul className="text-xs list-disc list-inside">
                    {mergedData.conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* New Circuit Details */}
            {circuitA && circuitB && (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-bold text-sm uppercase">New Merged Circuit</h4>
                
                <div>
                  <Label htmlFor="merge-title">Title *</Label>
                  <Input
                    id="merge-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title for merged circuit"
                    maxLength={100}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="merge-description">Description</Label>
                  <Textarea
                    id="merge-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    maxLength={500}
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {mergedData.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {mergedData.tags.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{mergedData.tags.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={!canMerge || merging}>
            <Merge className="w-4 h-4 mr-2" />
            {merging ? "Merging..." : "Merge & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
