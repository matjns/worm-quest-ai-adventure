import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  History,
  Clock,
  User,
  Brain,
  Zap,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NEURON_COLORS, type NeuronData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
}

interface TimelineEntry {
  id: string;
  action: string;
  userName?: string;
  userId?: string;
  timestamp: number;
  neuronCount: number;
  connectionCount: number;
  isCurrent: boolean;
  isOwn?: boolean;
  neurons?: PlacedNeuron[];
}

interface HistoryTimelinePanelProps {
  entries: TimelineEntry[];
  onJumpTo: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isCollaborative?: boolean;
  trigger?: React.ReactNode;
}

function MiniCircuitPreview({ neurons }: { neurons?: PlacedNeuron[] }) {
  if (!neurons || neurons.length === 0) {
    return (
      <div className="w-full h-16 rounded bg-muted/30 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Empty</span>
      </div>
    );
  }

  const minX = Math.min(...neurons.map((n) => n.x)) - 10;
  const maxX = Math.max(...neurons.map((n) => n.x)) + 10;
  const minY = Math.min(...neurons.map((n) => n.y)) - 10;
  const maxY = Math.max(...neurons.map((n) => n.y)) + 10;

  const width = Math.max(maxX - minX, 50);
  const height = Math.max(maxY - minY, 50);

  return (
    <svg
      className="w-full h-16 rounded bg-muted/30"
      viewBox={`0 0 100 50`}
      preserveAspectRatio="xMidYMid meet"
    >
      {neurons.map((neuron) => {
        const cx = ((neuron.x - minX) / width) * 90 + 5;
        const cy = ((neuron.y - minY) / height) * 40 + 5;

        return (
          <circle
            key={neuron.id}
            cx={cx}
            cy={cy}
            r="4"
            fill={NEURON_COLORS[neuron.type]}
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}

export function HistoryTimelinePanel({
  entries,
  onJumpTo,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isCollaborative = false,
  trigger,
}: HistoryTimelinePanelProps) {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentIndex = useMemo(
    () => entries.findIndex((e) => e.isCurrent),
    [entries]
  );

  const groupedByTime = useMemo(() => {
    const groups: { label: string; entries: (TimelineEntry & { index: number })[] }[] = [];
    const now = Date.now();

    entries.forEach((entry, index) => {
      const diff = now - entry.timestamp;
      let label: string;

      if (diff < 60000) {
        label = "Just now";
      } else if (diff < 3600000) {
        label = "Last hour";
      } else if (diff < 86400000) {
        label = "Today";
      } else {
        label = format(entry.timestamp, "MMM d");
      }

      const existing = groups.find((g) => g.label === label);
      if (existing) {
        existing.entries.push({ ...entry, index });
      } else {
        groups.push({ label, entries: [{ ...entry, index }] });
      }
    });

    return groups;
  }, [entries]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <History className="w-4 h-4" />
            History
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-[380px] sm:w-[420px] flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Circuit History
            {isCollaborative && (
              <Badge variant="secondary" className="text-xs">
                Live
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Quick Actions */}
        <div className="flex gap-2 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1 gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1 gap-1"
          >
            Redo
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        <Separator />

        {/* Timeline */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No history yet</p>
              <p className="text-xs text-muted-foreground/70">
                Make changes to see them here
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {groupedByTime.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {group.label}
                    </span>
                  </div>

                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />

                    <AnimatePresence mode="popLayout">
                      {group.entries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="relative pl-8 pb-4"
                          onMouseEnter={() => setHoveredIndex(entry.index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              "absolute left-1.5 top-1.5 w-4 h-4 rounded-full border-2 transition-colors",
                              entry.isCurrent
                                ? "bg-primary border-primary"
                                : entry.index < currentIndex
                                ? "bg-muted-foreground/30 border-muted-foreground/30"
                                : "bg-background border-muted-foreground/50"
                            )}
                          />

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    if (!entry.isCurrent) {
                                      onJumpTo(entry.index);
                                    }
                                  }}
                                  className={cn(
                                    "w-full text-left p-3 rounded-lg border transition-all",
                                    entry.isCurrent
                                      ? "bg-primary/10 border-primary/30"
                                      : "bg-card hover:bg-muted/50 border-border hover:border-primary/30",
                                    hoveredIndex === entry.index && !entry.isCurrent && "ring-2 ring-primary/20"
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium line-clamp-1">
                                        {entry.action}
                                      </p>
                                      {isCollaborative && entry.userName && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <User className="w-3 h-3 text-muted-foreground" />
                                          <span
                                            className={cn(
                                              "text-xs",
                                              entry.isOwn
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                            )}
                                          >
                                            {entry.isOwn ? "You" : entry.userName}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {entry.isCurrent && (
                                      <Badge className="text-xs">Current</Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Brain className="w-3 h-3" />
                                      {entry.neuronCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      {entry.connectionCount}
                                    </span>
                                    <span className="ml-auto">
                                      {formatDistanceToNow(entry.timestamp, {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  </div>

                                  {entry.neurons && hoveredIndex === entry.index && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      className="mt-2"
                                    >
                                      <MiniCircuitPreview neurons={entry.neurons} />
                                    </motion.div>
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                {entry.isCurrent ? (
                                  <p>Current state</p>
                                ) : (
                                  <p className="flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" />
                                    Click to restore
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Summary */}
        {entries.length > 0 && (
          <>
            <Separator />
            <div className="pt-4 text-center text-xs text-muted-foreground">
              {entries.length} state{entries.length !== 1 ? "s" : ""} •{" "}
              Position {currentIndex + 1} of {entries.length}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
