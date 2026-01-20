import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  History,
  Clock,
  User,
  Brain,
  Zap,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Bookmark,
  BookmarkPlus,
  GitCompare,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NEURON_COLORS, type NeuronData } from "@/data/neuronData";
import { HistoryCompareDialog, type HistoryState } from "./HistoryCompareDialog";

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

interface TimelineEntry {
  id: string;
  index: number;
  action: string;
  userName?: string;
  userId?: string;
  timestamp: number;
  neuronCount: number;
  connectionCount: number;
  isCurrent: boolean;
  isOwn?: boolean;
  neurons?: PlacedNeuron[];
  connections?: DesignerConnection[];
  isBookmarked?: boolean;
  bookmarkName?: string;
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
  onToggleBookmark?: (stateId: string, name?: string) => void;
  onRenameBookmark?: (stateId: string, name: string) => void;
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
  onToggleBookmark,
  onRenameBookmark,
}: HistoryTimelinePanelProps) {
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareSelection, setCompareSelection] = useState<{
    left: number | null;
    right: number | null;
  }>({ left: null, right: null });
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [bookmarkNameInput, setBookmarkNameInput] = useState("");
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const currentIndex = useMemo(
    () => entries.findIndex((e) => e.isCurrent),
    [entries]
  );

  const bookmarks = useMemo(
    () => entries.filter((e) => e.isBookmarked),
    [entries]
  );

  const displayedEntries = showBookmarksOnly
    ? entries.filter((e) => e.isBookmarked)
    : entries;

  const groupedByTime = useMemo(() => {
    const groups: { label: string; entries: TimelineEntry[] }[] = [];
    const now = Date.now();

    displayedEntries.forEach((entry) => {
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
        existing.entries.push(entry);
      } else {
        groups.push({ label, entries: [entry] });
      }
    });

    return groups;
  }, [displayedEntries]);

  // Convert entries to HistoryState format for compare dialog
  const historyStates: HistoryState[] = useMemo(
    () =>
      entries.map((e) => ({
        id: e.id,
        label: e.action,
        neurons: e.neurons || [],
        connections: e.connections || [],
        timestamp: e.timestamp,
        isBookmarked: e.isBookmarked,
        bookmarkName: e.bookmarkName,
      })),
    [entries]
  );

  const startCompareSelection = (index: number) => {
    if (compareSelection.left === null) {
      setCompareSelection({ left: index, right: null });
    } else if (compareSelection.right === null && compareSelection.left !== index) {
      setCompareSelection((prev) => ({ ...prev, right: index }));
      // Open compare dialog
      setCompareOpen(true);
    } else {
      // Reset
      setCompareSelection({ left: index, right: null });
    }
  };

  const handleBookmarkSave = (stateId: string) => {
    if (onRenameBookmark && bookmarkNameInput.trim()) {
      onRenameBookmark(stateId, bookmarkNameInput.trim());
    }
    setEditingBookmarkId(null);
    setBookmarkNameInput("");
  };

  return (
    <>
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

          {/* Compare & Bookmarks Filter */}
          <div className="flex gap-2 pb-4">
            <Button
              variant={compareSelection.left !== null ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (compareSelection.left !== null) {
                  setCompareSelection({ left: null, right: null });
                } else if (entries.length >= 2) {
                  setCompareSelection({ left: currentIndex > 0 ? currentIndex - 1 : 0, right: null });
                }
              }}
              className="flex-1 gap-1"
              disabled={entries.length < 2}
            >
              <GitCompare className="w-3 h-3" />
              {compareSelection.left !== null ? "Cancel" : "Compare"}
            </Button>
            <Button
              variant={showBookmarksOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className="flex-1 gap-1"
              disabled={bookmarks.length === 0}
            >
              <Bookmark className="w-3 h-3" />
              Bookmarks ({bookmarks.length})
            </Button>
          </div>

          {compareSelection.left !== null && (
            <div className="bg-primary/10 p-2 rounded-lg mb-3 text-xs text-center">
              {compareSelection.right === null
                ? "Click another state to compare"
                : "Opening comparison..."}
            </div>
          )}

          <Separator />

          {/* Timeline */}
          <ScrollArea className="flex-1 -mx-2 px-2">
            {displayedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {showBookmarksOnly ? "No bookmarks yet" : "No history yet"}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {showBookmarksOnly
                    ? "Bookmark states to save them here"
                    : "Make changes to see them here"}
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
                                  : entry.isBookmarked
                                  ? "bg-primary/50 border-primary"
                                  : entry.index < currentIndex
                                  ? "bg-muted-foreground/30 border-muted-foreground/30"
                                  : "bg-background border-muted-foreground/50",
                                compareSelection.left === entry.index &&
                                  "ring-2 ring-primary ring-offset-2"
                              )}
                            />

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      if (compareSelection.left !== null) {
                                        startCompareSelection(entry.index);
                                      } else if (!entry.isCurrent) {
                                        onJumpTo(entry.index);
                                      }
                                    }}
                                    className={cn(
                                      "w-full text-left p-3 rounded-lg border transition-all",
                                      entry.isCurrent
                                        ? "bg-primary/10 border-primary/30"
                                        : "bg-card hover:bg-muted/50 border-border hover:border-primary/30",
                                      hoveredIndex === entry.index &&
                                        !entry.isCurrent &&
                                        "ring-2 ring-primary/20",
                                      compareSelection.left === entry.index &&
                                        "border-primary bg-primary/5"
                                    )}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-sm font-medium line-clamp-1">
                                            {entry.bookmarkName || entry.action}
                                          </p>
                                          {entry.isBookmarked && (
                                            <Bookmark className="w-3 h-3 text-primary fill-primary shrink-0" />
                                          )}
                                        </div>
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
                                      <div className="flex items-center gap-1">
                                        {entry.isCurrent && (
                                          <Badge className="text-xs">Current</Badge>
                                        )}
                                        {/* Bookmark toggle */}
                                        {onToggleBookmark && (
                                          <Popover
                                            open={editingBookmarkId === entry.id}
                                            onOpenChange={(o) => {
                                              if (!o) {
                                                setEditingBookmarkId(null);
                                                setBookmarkNameInput("");
                                              }
                                            }}
                                          >
                                            <PopoverTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (entry.isBookmarked) {
                                                    setEditingBookmarkId(entry.id);
                                                    setBookmarkNameInput(
                                                      entry.bookmarkName || entry.action
                                                    );
                                                  } else {
                                                    onToggleBookmark(entry.id, entry.action);
                                                  }
                                                }}
                                              >
                                                {entry.isBookmarked ? (
                                                  <Bookmark className="w-3 h-3 fill-primary text-primary" />
                                                ) : (
                                                  <BookmarkPlus className="w-3 h-3" />
                                                )}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                              className="w-64 p-3"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="space-y-2">
                                                <p className="text-xs font-medium">
                                                  Bookmark Name
                                                </p>
                                                <Input
                                                  value={bookmarkNameInput}
                                                  onChange={(e) =>
                                                    setBookmarkNameInput(e.target.value)
                                                  }
                                                  placeholder="Enter bookmark name..."
                                                  className="h-8"
                                                />
                                                <div className="flex gap-2">
                                                  <Button
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleBookmarkSave(entry.id)}
                                                  >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Save
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                      onToggleBookmark(entry.id)
                                                    }
                                                  >
                                                    <X className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        )}
                                      </div>
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

                                    {entry.neurons &&
                                      hoveredIndex === entry.index && (
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
                                  {compareSelection.left !== null ? (
                                    compareSelection.left === entry.index ? (
                                      <p>Selected as base</p>
                                    ) : (
                                      <p className="flex items-center gap-1">
                                        <GitCompare className="w-3 h-3" />
                                        Compare with this
                                      </p>
                                    )
                                  ) : entry.isCurrent ? (
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
                {bookmarks.length > 0 && ` • ${bookmarks.length} bookmarked`}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Compare Dialog */}
      <HistoryCompareDialog
        states={historyStates}
        initialLeftIndex={compareSelection.left ?? undefined}
        initialRightIndex={compareSelection.right ?? undefined}
        open={compareOpen}
        onOpenChange={(o) => {
          setCompareOpen(o);
          if (!o) {
            setCompareSelection({ left: null, right: null });
          }
        }}
        onRestoreState={(index) => {
          onJumpTo(index);
          setCompareOpen(false);
          setCompareSelection({ left: null, right: null });
        }}
      />
    </>
  );
}
