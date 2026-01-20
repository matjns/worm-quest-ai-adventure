import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileStack,
  Upload,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  Zap,
  Merge,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  SkipForward,
  Replace,
} from "lucide-react";
import { toast } from "sonner";
import {
  parseNeuroML,
  readNeuroMLFile,
  validateNeuroMLContent,
  arrangeNeuronsForCanvas,
  type ImportResult,
} from "@/utils/neuromlImport";
import {
  mergeCircuits,
  type MergeStrategy,
  type MergeResult,
} from "@/utils/circuitMerge";
import { type NeuronData, type ConnectionData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

interface FileQueueItem {
  id: string;
  file: File;
  status: "pending" | "parsing" | "parsed" | "merging" | "done" | "error";
  parseResult?: ImportResult;
  mergeResult?: MergeResult;
  error?: string;
}

interface BatchImportDialogProps {
  existingNeurons: PlacedNeuron[];
  existingConnections: DesignerConnection[];
  onBatchMerge: (neurons: PlacedNeuron[], connections: DesignerConnection[]) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  trigger?: React.ReactNode;
}

export function BatchImportDialog({
  existingNeurons,
  existingConnections,
  onBatchMerge,
  canvasWidth = 600,
  canvasHeight = 400,
  trigger,
}: BatchImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge configuration
  const [neuronStrategy, setNeuronStrategy] = useState<MergeStrategy>("skip");
  const [connectionStrategy, setConnectionStrategy] = useState<"skip" | "replace">("skip");

  const totalFiles = fileQueue.length;
  const completedFiles = fileQueue.filter((f) => f.status === "done" || f.status === "error").length;
  const progress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  const addFiles = useCallback((files: FileList | File[]) => {
    const validExtensions = [".nml", ".xml", ".neuroml"];
    const newItems: FileQueueItem[] = [];

    Array.from(files).forEach((file) => {
      const hasValidExt = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (hasValidExt) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          status: "pending",
        });
      } else {
        toast.error(`Skipped ${file.name}: not a NeuroML file`);
      }
    });

    if (newItems.length > 0) {
      setFileQueue((prev) => [...prev, ...newItems]);
      toast.success(`Added ${newItems.length} file(s) to queue`);
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setFileQueue((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const moveFile = useCallback((id: string, direction: "up" | "down") => {
    setFileQueue((prev) => {
      const index = prev.findIndex((f) => f.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newQueue = [...prev];
      [newQueue[index], newQueue[newIndex]] = [newQueue[newIndex], newQueue[index]];
      return newQueue;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const processQueue = useCallback(async () => {
    if (fileQueue.length === 0) {
      toast.error("No files in queue");
      return;
    }

    setIsProcessing(true);

    // Start with existing circuit
    let currentNeurons = [...existingNeurons];
    let currentConnections = [...existingConnections];
    
    const totalStats = {
      neuronsAdded: 0,
      connectionsAdded: 0,
      conflicts: 0,
      errors: 0,
    };

    for (let i = 0; i < fileQueue.length; i++) {
      const item = fileQueue[i];

      try {
        // Update status to parsing
        setFileQueue((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: "parsing" } : f))
        );

        // Read and parse file
        const content = await readNeuroMLFile(item.file);
        const validation = validateNeuroMLContent(content);

        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        const parseResult = parseNeuroML(content);

        if (!parseResult.success) {
          throw new Error(parseResult.errors.join(", "));
        }

        // Update with parse result
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "merging", parseResult } : f
          )
        );

        // Arrange neurons for canvas
        const arrangedNeurons = arrangeNeuronsForCanvas(
          parseResult.neurons,
          canvasWidth,
          canvasHeight
        );

        const incomingNeurons: PlacedNeuron[] = arrangedNeurons.map((n) => ({
          id: n.id,
          name: n.id,
          type: n.type,
          function: n.function || "imported",
          description: n.notes || `Imported ${n.type} neuron`,
          position: { x: 0, y: 0 },
          x: n.x,
          y: n.y,
          isActive: false,
        }));

        const incomingConnections: DesignerConnection[] = parseResult.connections.map(
          (c, idx) => ({
            id: `batch-${item.id}-${c.from}-${c.to}-${idx}`,
            from: c.from,
            to: c.to,
            type: c.type,
            weight: c.weight,
          })
        );

        // Merge with accumulated state
        const mergeResult = mergeCircuits(
          currentNeurons,
          currentConnections,
          incomingNeurons,
          incomingConnections,
          canvasWidth,
          canvasHeight,
          {
            neuronConflictStrategy: neuronStrategy,
            connectionConflictStrategy: connectionStrategy,
            autoOffset: true,
          }
        );

        // Update accumulated state
        currentNeurons = mergeResult.neurons;
        currentConnections = mergeResult.connections;

        // Update stats
        totalStats.neuronsAdded += mergeResult.stats.neuronsAdded;
        totalStats.connectionsAdded += mergeResult.stats.connectionsAdded;
        totalStats.conflicts += mergeResult.conflicts.length;

        // Update status to done
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "done", mergeResult } : f
          )
        );
      } catch (error) {
        totalStats.errors++;
        setFileQueue((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "error", error: error instanceof Error ? error.message : "Unknown error" }
              : f
          )
        );
      }

      // Small delay between files for visual feedback
      await new Promise((r) => setTimeout(r, 100));
    }

    setIsProcessing(false);

    // Apply final merged result
    if (totalStats.errors < fileQueue.length) {
      onBatchMerge(currentNeurons, currentConnections);
      
      toast.success(
        `Batch import complete: +${totalStats.neuronsAdded} neurons, +${totalStats.connectionsAdded} connections`,
        {
          description: totalStats.conflicts > 0 
            ? `${totalStats.conflicts} conflicts resolved` 
            : undefined,
        }
      );
    } else {
      toast.error("All files failed to import");
    }
  }, [
    fileQueue,
    existingNeurons,
    existingConnections,
    canvasWidth,
    canvasHeight,
    neuronStrategy,
    connectionStrategy,
    onBatchMerge,
  ]);

  const resetAndClose = () => {
    setOpen(false);
    setFileQueue([]);
    setIsProcessing(false);
    setNeuronStrategy("skip");
    setConnectionStrategy("skip");
  };

  const getStatusIcon = (status: FileQueueItem["status"]) => {
    switch (status) {
      case "pending":
        return <FileCode className="w-4 h-4 text-muted-foreground" />;
      case "parsing":
      case "merging":
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: FileQueueItem["status"]) => {
    switch (status) {
      case "pending":
        return "Queued";
      case "parsing":
        return "Parsing...";
      case "merging":
        return "Merging...";
      case "done":
        return "Done";
      case "error":
        return "Failed";
      default:
        return status;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isProcessing) resetAndClose();
        else if (isOpen) setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <FileStack className="w-4 h-4" />
            Batch Import
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileStack className="w-5 h-5 text-primary" />
            Batch Import NeuroML Files
          </DialogTitle>
          <DialogDescription>
            Import multiple NeuroML files and merge them sequentially into your circuit
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-6 text-center transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
              ${isProcessing ? "opacity-50 pointer-events-none" : ""}
            `}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".nml,.xml,.neuroml"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop multiple NeuroML files, or
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              Browse Files
            </Button>
          </div>

          {/* File Queue */}
          {fileQueue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Import Queue ({fileQueue.length} files)
                </Label>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFileQueue([])}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {isProcessing && (
                <Progress value={progress} className="h-2" />
              )}

              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {fileQueue.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border
                          ${item.status === "done" ? "bg-green-500/5 border-green-500/30" : ""}
                          ${item.status === "error" ? "bg-destructive/5 border-destructive/30" : ""}
                          ${item.status === "pending" ? "bg-muted/30" : ""}
                          ${item.status === "parsing" || item.status === "merging" ? "bg-primary/5 border-primary/30" : ""}
                        `}
                      >
                        {getStatusIcon(item.status)}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{getStatusText(item.status)}</span>
                            {item.parseResult?.success && (
                              <>
                                <Badge variant="secondary" className="text-xs gap-1 px-1">
                                  <Brain className="w-2.5 h-2.5" />
                                  {item.parseResult.metadata.neuronCount}
                                </Badge>
                                <Badge variant="secondary" className="text-xs gap-1 px-1">
                                  <Zap className="w-2.5 h-2.5" />
                                  {item.parseResult.metadata.connectionCount}
                                </Badge>
                              </>
                            )}
                            {item.mergeResult && (
                              <span className="text-green-600">
                                +{item.mergeResult.stats.neuronsAdded} neurons
                              </span>
                            )}
                            {item.error && (
                              <span className="text-destructive truncate">{item.error}</span>
                            )}
                          </div>
                        </div>

                        {!isProcessing && item.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveFile(item.id, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => moveFile(item.id, "down")}
                              disabled={index === fileQueue.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => removeFile(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Merge Configuration */}
          {fileQueue.length > 0 && !isProcessing && (
            <div className="space-y-4 pt-3 border-t">
              <h4 className="text-sm font-medium">Conflict Resolution</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Duplicate Neurons</Label>
                  <RadioGroup
                    value={neuronStrategy}
                    onValueChange={(v) => setNeuronStrategy(v as MergeStrategy)}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="batch-neuron-skip"
                      className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 text-sm"
                    >
                      <RadioGroupItem value="skip" id="batch-neuron-skip" />
                      <SkipForward className="w-3 h-3" />
                      Keep existing
                    </Label>
                    <Label
                      htmlFor="batch-neuron-replace"
                      className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 text-sm"
                    >
                      <RadioGroupItem value="replace" id="batch-neuron-replace" />
                      <Replace className="w-3 h-3" />
                      Use imported
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Duplicate Connections</Label>
                  <RadioGroup
                    value={connectionStrategy}
                    onValueChange={(v) => setConnectionStrategy(v as "skip" | "replace")}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="batch-conn-skip"
                      className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 text-sm"
                    >
                      <RadioGroupItem value="skip" id="batch-conn-skip" />
                      <SkipForward className="w-3 h-3" />
                      Keep existing
                    </Label>
                    <Label
                      htmlFor="batch-conn-replace"
                      className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 text-sm"
                    >
                      <RadioGroupItem value="replace" id="batch-conn-replace" />
                      <Replace className="w-3 h-3" />
                      Use imported
                    </Label>
                  </RadioGroup>
                </div>
              </div>

              {existingNeurons.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Files will be merged sequentially with your existing {existingNeurons.length} neurons and {existingConnections.length} connections.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetAndClose}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Cancel"}
          </Button>
          <Button
            onClick={processQueue}
            disabled={fileQueue.length === 0 || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Processing {completedFiles}/{totalFiles}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Import {fileQueue.length} File{fileQueue.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
