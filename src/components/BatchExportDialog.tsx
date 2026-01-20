import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  FileCode,
  FileJson,
  Image,
  Package,
  CheckCircle2,
  XCircle,
  Brain,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { exportToNeuroML } from "@/utils/neuromlExport";
import { type NeuronData, type ConnectionData, NEURON_COLORS } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

type ExportFormat = "neuroml" | "json" | "png";

interface ExportTask {
  format: ExportFormat;
  status: "pending" | "exporting" | "done" | "error";
  fileName?: string;
  error?: string;
}

interface BatchExportDialogProps {
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
  trigger?: React.ReactNode;
}

function generateCircuitSVG(
  neurons: PlacedNeuron[],
  connections: DesignerConnection[],
  width: number,
  height: number
): string {
  const padding = 40;
  
  // Calculate bounds
  const minX = Math.min(...neurons.map((n) => n.x), 0);
  const maxX = Math.max(...neurons.map((n) => n.x), 100);
  const minY = Math.min(...neurons.map((n) => n.y), 0);
  const maxY = Math.max(...neurons.map((n) => n.y), 100);
  
  const scaleX = (x: number) => ((x - minX) / (maxX - minX + 1)) * (width - padding * 2) + padding;
  const scaleY = (y: number) => ((y - minY) / (maxY - minY + 1)) * (height - padding * 2) + padding;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="#1a1a2e"/>`;
  
  // Grid pattern
  svg += `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a2a4a" stroke-width="0.5"/>
  </pattern></defs>`;
  svg += `<rect width="${width}" height="${height}" fill="url(#grid)"/>`;

  // Connections
  connections.forEach((conn) => {
    const fromN = neurons.find((n) => n.id === conn.from);
    const toN = neurons.find((n) => n.id === conn.to);
    if (!fromN || !toN) return;

    const x1 = scaleX(fromN.x);
    const y1 = scaleY(fromN.y);
    const x2 = scaleX(toN.x);
    const y2 = scaleY(toN.y);

    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6366f1" stroke-width="2" opacity="0.6"/>`;
    
    // Arrow
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowX = x2 - 15 * Math.cos(angle);
    const arrowY = y2 - 15 * Math.sin(angle);
    svg += `<polygon points="-6,-4 0,0 -6,4" fill="#6366f1" transform="translate(${arrowX},${arrowY}) rotate(${angle * 180 / Math.PI})"/>`;
  });

  // Neurons
  neurons.forEach((neuron) => {
    const cx = scaleX(neuron.x);
    const cy = scaleY(neuron.y);
    const color = NEURON_COLORS[neuron.type];

    svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    svg += `<text x="${cx}" y="${cy - 18}" text-anchor="middle" fill="#fff" font-size="10" font-family="monospace">${neuron.id}</text>`;
  });

  // Title
  svg += `<text x="${width / 2}" y="25" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Neural Circuit</text>`;
  svg += `<text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="#888" font-size="10">${neurons.length} neurons • ${connections.length} connections</text>`;

  svg += `</svg>`;
  return svg;
}

async function svgToPng(svgString: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert to PNG"));
        }
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG"));
    };

    img.src = url;
  });
}

export function BatchExportDialog({
  neurons,
  connections,
  trigger,
}: BatchExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [baseName, setBaseName] = useState("circuit");
  const [selectedFormats, setSelectedFormats] = useState<Set<ExportFormat>>(
    new Set(["neuroml", "json"])
  );
  const [exportTasks, setExportTasks] = useState<ExportTask[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [neuromlTitle, setNeuromlTitle] = useState("Exported Circuit");
  const [neuromlAuthor, setNeuromlAuthor] = useState("");

  const totalTasks = exportTasks.length;
  const completedTasks = exportTasks.filter(
    (t) => t.status === "done" || t.status === "error"
  ).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleFormat = (format: ExportFormat) => {
    setSelectedFormats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(format)) {
        newSet.delete(format);
      } else {
        newSet.add(format);
      }
      return newSet;
    });
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runExport = useCallback(async () => {
    if (selectedFormats.size === 0) {
      toast.error("Select at least one format");
      return;
    }

    if (neurons.length === 0) {
      toast.error("No neurons to export");
      return;
    }

    setIsExporting(true);

    // Initialize tasks
    const tasks: ExportTask[] = Array.from(selectedFormats).map((format) => ({
      format,
      status: "pending",
    }));
    setExportTasks(tasks);

    // Process each format
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // Update status to exporting
      setExportTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: "exporting" } : t))
      );

      try {
        let blob: Blob;
        let fileName: string;

        switch (task.format) {
          case "neuroml": {
            const neuromlNeurons = neurons.map((n) => ({
              id: n.id,
              type: n.type,
              x: n.x,
              y: n.y,
            }));
            const xml = exportToNeuroML(neuromlNeurons, connections, {
              title: neuromlTitle,
              author: neuromlAuthor || undefined,
              includePositions: true,
            });
            blob = new Blob([xml], { type: "application/xml" });
            fileName = `${baseName}.nml`;
            break;
          }

          case "json": {
            const data = {
              title: baseName,
              exportedAt: new Date().toISOString(),
              neurons: neurons.map((n) => ({
                id: n.id,
                type: n.type,
                function: n.function,
                x: n.x,
                y: n.y,
              })),
              connections: connections.map((c) => ({
                from: c.from,
                to: c.to,
                type: c.type,
                weight: c.weight,
              })),
              stats: {
                neuronCount: neurons.length,
                connectionCount: connections.length,
              },
            };
            blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            fileName = `${baseName}.json`;
            break;
          }

          case "png": {
            const svgString = generateCircuitSVG(neurons, connections, 800, 600);
            blob = await svgToPng(svgString, 800, 600);
            fileName = `${baseName}.png`;
            break;
          }

          default:
            throw new Error(`Unknown format: ${task.format}`);
        }

        // Download
        downloadBlob(blob, fileName);

        // Update status to done
        setExportTasks((prev) =>
          prev.map((t, idx) =>
            idx === i ? { ...t, status: "done", fileName } : t
          )
        );
      } catch (error) {
        setExportTasks((prev) =>
          prev.map((t, idx) =>
            idx === i
              ? {
                  ...t,
                  status: "error",
                  error: error instanceof Error ? error.message : "Export failed",
                }
              : t
          )
        );
      }

      // Small delay between exports
      await new Promise((r) => setTimeout(r, 200));
    }

    setIsExporting(false);
    toast.success("Batch export complete!");
  }, [selectedFormats, neurons, connections, baseName, neuromlTitle, neuromlAuthor]);

  const resetAndClose = () => {
    setOpen(false);
    setExportTasks([]);
    setIsExporting(false);
  };

  const formatConfig: Record<ExportFormat, { icon: typeof FileCode; label: string; description: string }> = {
    neuroml: {
      icon: FileCode,
      label: "NeuroML",
      description: "Research simulation format",
    },
    json: {
      icon: FileJson,
      label: "JSON",
      description: "Portable data format",
    },
    png: {
      icon: Image,
      label: "PNG Image",
      description: "Visual circuit diagram",
    },
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isExporting) resetAndClose();
      else if (isOpen) setOpen(true);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Package className="w-4 h-4" />
            Batch Export
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Batch Export
          </DialogTitle>
          <DialogDescription>
            Export your circuit to multiple formats at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Circuit Summary */}
          <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            <Badge variant="secondary" className="gap-1">
              <Brain className="w-3 h-3" />
              {neurons.length} neurons
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              {connections.length} connections
            </Badge>
          </div>

          {/* Base Name */}
          <div className="space-y-2">
            <Label htmlFor="base-name">File Name</Label>
            <Input
              id="base-name"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
              placeholder="circuit"
              disabled={isExporting}
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Formats</Label>
            <div className="grid gap-2">
              {(Object.keys(formatConfig) as ExportFormat[]).map((format) => {
                const config = formatConfig[format];
                const Icon = config.icon;
                const isSelected = selectedFormats.has(format);

                return (
                  <label
                    key={format}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${isSelected ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50"}
                      ${isExporting ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleFormat(format)}
                      disabled={isExporting}
                    />
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-muted-foreground">
                        {baseName}.{format === "neuroml" ? "nml" : format}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* NeuroML Options */}
          {selectedFormats.has("neuroml") && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <Label className="text-xs text-muted-foreground">NeuroML Options</Label>
              <Input
                placeholder="Circuit title"
                value={neuromlTitle}
                onChange={(e) => setNeuromlTitle(e.target.value)}
                disabled={isExporting}
              />
              <Input
                placeholder="Author (optional)"
                value={neuromlAuthor}
                onChange={(e) => setNeuromlAuthor(e.target.value)}
                disabled={isExporting}
              />
            </div>
          )}

          {/* Export Progress */}
          {exportTasks.length > 0 && (
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />

              <ScrollArea className="max-h-[120px]">
                <div className="space-y-2">
                  {exportTasks.map((task, i) => {
                    const config = formatConfig[task.format];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={task.format}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-2 rounded bg-muted/30"
                      >
                        {task.status === "exporting" ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : task.status === "done" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : task.status === "error" ? (
                          <XCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm flex-1">{config.label}</span>
                        {task.fileName && (
                          <span className="text-xs text-muted-foreground">
                            {task.fileName}
                          </span>
                        )}
                        {task.error && (
                          <span className="text-xs text-destructive">
                            {task.error}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Cancel"}
          </Button>
          <Button
            onClick={runExport}
            disabled={selectedFormats.size === 0 || neurons.length === 0 || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {selectedFormats.size} Format{selectedFormats.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
