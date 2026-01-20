import { useState, useCallback, useRef, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileUp,
  Copy,
  Brain,
  Zap,
  Merge,
  Plus,
  Replace,
  SkipForward,
  ArrowRight,
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
  analyzeCircuitsForMerge,
  type MergeStrategy,
  type MergeOptions,
} from "@/utils/circuitMerge";
import { CircuitMergePreview } from "@/components/CircuitMergePreview";
import { type NeuronData, type ConnectionData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

interface ImportMergeDialogProps {
  existingNeurons: PlacedNeuron[];
  existingConnections: DesignerConnection[];
  onMerge: (neurons: PlacedNeuron[], connections: DesignerConnection[]) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  trigger?: React.ReactNode;
}

type ImportMode = "replace" | "merge";

export function ImportMergeDialog({
  existingNeurons,
  existingConnections,
  onMerge,
  canvasWidth = 600,
  canvasHeight = 400,
  trigger,
}: ImportMergeDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "configure" | "preview">("upload");
  const [importTab, setImportTab] = useState<"file" | "paste">("file");
  const [pastedContent, setPastedContent] = useState("");
  const [parseResult, setParseResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge configuration
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [neuronStrategy, setNeuronStrategy] = useState<MergeStrategy>("skip");
  const [connectionStrategy, setConnectionStrategy] = useState<"skip" | "replace">("skip");

  const hasExistingCircuit = existingNeurons.length > 0;

  // Analyze merge conflicts
  const mergeAnalysis = useMemo(() => {
    if (!parseResult?.success) return null;

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
      (c, i) => ({
        id: `import-${c.from}-${c.to}-${i}`,
        from: c.from,
        to: c.to,
        type: c.type,
        weight: c.weight,
      })
    );

    return {
      ...analyzeCircuitsForMerge(
        existingNeurons,
        existingConnections,
        incomingNeurons,
        incomingConnections
      ),
      incomingNeurons,
      incomingConnections,
    };
  }, [parseResult, existingNeurons, existingConnections, canvasWidth, canvasHeight]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const validExtensions = [".nml", ".xml", ".neuroml"];
      const hasValidExt = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExt) {
        toast.error("Please select a NeuroML file (.nml, .xml, or .neuroml)");
        return;
      }

      const content = await readNeuroMLFile(file);
      processContent(content);
    } catch (error) {
      toast.error("Failed to read file");
      console.error(error);
    }
  }, []);

  const processContent = useCallback((content: string) => {
    const validation = validateNeuroMLContent(content);
    if (!validation.valid && validation.errors.length > 0) {
      setParseResult({
        success: false,
        neurons: [],
        connections: [],
        metadata: { title: "", neuronCount: 0, connectionCount: 0 },
        warnings: [],
        errors: validation.errors,
      });
      return;
    }

    const result = parseNeuroML(content);
    setParseResult(result);

    if (result.success) {
      toast.success(
        `Parsed ${result.neurons.length} neurons and ${result.connections.length} connections`
      );
      // Auto-advance to configure step if we have existing neurons
      if (hasExistingCircuit) {
        setStep("configure");
      }
    }
  }, [hasExistingCircuit]);

  const handlePaste = useCallback(() => {
    if (!pastedContent.trim()) {
      toast.error("Please paste NeuroML content first");
      return;
    }
    processContent(pastedContent);
  }, [pastedContent, processContent]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleImport = useCallback(() => {
    if (!parseResult?.success || !mergeAnalysis) return;

    if (importMode === "replace" || !hasExistingCircuit) {
      // Replace mode: just use incoming circuit
      onMerge(mergeAnalysis.incomingNeurons, mergeAnalysis.incomingConnections);
      toast.success(`Imported circuit: ${parseResult.metadata.title}`);
    } else {
      // Merge mode
      const options: Partial<MergeOptions> = {
        neuronConflictStrategy: neuronStrategy,
        connectionConflictStrategy: connectionStrategy,
        autoOffset: true,
      };

      const result = mergeCircuits(
        existingNeurons,
        existingConnections,
        mergeAnalysis.incomingNeurons,
        mergeAnalysis.incomingConnections,
        canvasWidth,
        canvasHeight,
        options
      );

      onMerge(result.neurons, result.connections);

      const message = `Merged: +${result.stats.neuronsAdded} neurons, +${result.stats.connectionsAdded} connections`;
      if (result.conflicts.length > 0) {
        toast.success(message, {
          description: `${result.conflicts.length} conflicts resolved`,
        });
      } else {
        toast.success(message);
      }
    }

    resetAndClose();
  }, [
    parseResult,
    mergeAnalysis,
    importMode,
    hasExistingCircuit,
    neuronStrategy,
    connectionStrategy,
    existingNeurons,
    existingConnections,
    canvasWidth,
    canvasHeight,
    onMerge,
  ]);

  const resetAndClose = () => {
    setOpen(false);
    setStep("upload");
    setParseResult(null);
    setPastedContent("");
    setImportMode("merge");
    setNeuronStrategy("skip");
    setConnectionStrategy("skip");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const duplicateNeuronIds = useMemo(
    () => new Set(mergeAnalysis?.duplicateNeurons || []),
    [mergeAnalysis]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetAndClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "upload" && <FileCode className="w-5 h-5 text-primary" />}
            {step === "configure" && <Merge className="w-5 h-5 text-primary" />}
            {step === "preview" && <CheckCircle2 className="w-5 h-5 text-primary" />}
            {step === "upload" && "Import NeuroML Circuit"}
            {step === "configure" && "Configure Merge"}
            {step === "preview" && "Review & Import"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Import neural circuits from NeuroML 2.x files"}
            {step === "configure" &&
              "Choose how to handle conflicts with existing neurons"}
            {step === "preview" && "Review the merged circuit before importing"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <Tabs
                value={importTab}
                onValueChange={(v) => setImportTab(v as "file" | "paste")}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="file" className="flex-1 gap-2">
                    <FileUp className="w-4 h-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="flex-1 gap-2">
                    <Copy className="w-4 h-4" />
                    Paste XML
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-4">
                  <div
                    className={`
                      border-2 border-dashed rounded-xl p-8 text-center transition-colors
                      ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary/50"
                      }
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
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    <FileCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag & drop a NeuroML file here, or
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Supports .nml, .xml, and .neuroml files
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="paste" className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Paste NeuroML XML content here..."
                    className="min-h-[200px] font-mono text-sm"
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                  />
                  <Button onClick={handlePaste} className="w-full">
                    Parse NeuroML
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Parse Results */}
              {parseResult && (
                <div
                  className={`
                    p-4 rounded-lg border
                    ${
                      parseResult.success
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-destructive/10 border-destructive/30"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {parseResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="font-medium">
                      {parseResult.success
                        ? `Parsed: ${parseResult.metadata.title}`
                        : "Failed to parse NeuroML"}
                    </span>
                  </div>

                  {parseResult.success && (
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="gap-1">
                        <Brain className="w-3 h-3" />
                        {parseResult.metadata.neuronCount} neurons
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Zap className="w-3 h-3" />
                        {parseResult.metadata.connectionCount} connections
                      </Badge>
                    </div>
                  )}

                  {parseResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {parseResult.errors.map((error, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-sm text-destructive"
                        >
                          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show existing circuit info */}
              {hasExistingCircuit && parseResult?.success && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have {existingNeurons.length} neurons and{" "}
                    {existingConnections.length} connections on canvas. Choose
                    to merge or replace.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 2: Configure Merge */}
          {step === "configure" && mergeAnalysis && (
            <div className="space-y-6">
              {/* Import Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Import Mode</Label>
                <RadioGroup
                  value={importMode}
                  onValueChange={(v) => setImportMode(v as ImportMode)}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="mode-merge"
                    className={`
                      flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors
                      ${importMode === "merge" ? "border-primary bg-primary/5" : "border-border"}
                    `}
                  >
                    <RadioGroupItem value="merge" id="mode-merge" />
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <Merge className="w-4 h-4" />
                        Merge
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Combine with existing circuit
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="mode-replace"
                    className={`
                      flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors
                      ${importMode === "replace" ? "border-primary bg-primary/5" : "border-border"}
                    `}
                  >
                    <RadioGroupItem value="replace" id="mode-replace" />
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <Replace className="w-4 h-4" />
                        Replace
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Clear canvas, use imported
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {importMode === "merge" && (
                <>
                  {/* Conflict Analysis */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg border text-center">
                      <p className="text-2xl font-bold text-green-500">
                        +{mergeAnalysis.uniqueNeurons}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        New neurons
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg border text-center">
                      <p className="text-2xl font-bold text-green-500">
                        +{mergeAnalysis.uniqueConnections}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        New connections
                      </p>
                    </div>
                    {mergeAnalysis.duplicateNeurons.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-center">
                        <p className="text-2xl font-bold text-yellow-500">
                          {mergeAnalysis.duplicateNeurons.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duplicate neurons
                        </p>
                      </div>
                    )}
                    {mergeAnalysis.duplicateConnections.length > 0 && (
                      <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-center">
                        <p className="text-2xl font-bold text-yellow-500">
                          {mergeAnalysis.duplicateConnections.length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duplicate connections
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Duplicate Handling */}
                  {mergeAnalysis.duplicateNeurons.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Duplicate Neurons: {mergeAnalysis.duplicateNeurons.join(", ")}
                      </Label>
                      <RadioGroup
                        value={neuronStrategy}
                        onValueChange={(v) => setNeuronStrategy(v as MergeStrategy)}
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="neuron-skip"
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value="skip" id="neuron-skip" />
                          <SkipForward className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Keep existing</p>
                            <p className="text-xs text-muted-foreground">
                              Skip duplicate neurons from import
                            </p>
                          </div>
                        </Label>
                        <Label
                          htmlFor="neuron-replace"
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value="replace" id="neuron-replace" />
                          <Replace className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Use imported</p>
                            <p className="text-xs text-muted-foreground">
                              Replace existing with imported neurons
                            </p>
                          </div>
                        </Label>
                      </RadioGroup>
                    </div>
                  )}

                  {mergeAnalysis.duplicateConnections.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Duplicate Connections ({mergeAnalysis.duplicateConnections.length})
                      </Label>
                      <RadioGroup
                        value={connectionStrategy}
                        onValueChange={(v) =>
                          setConnectionStrategy(v as "skip" | "replace")
                        }
                        className="space-y-2"
                      >
                        <Label
                          htmlFor="conn-skip"
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value="skip" id="conn-skip" />
                          <SkipForward className="w-4 h-4 text-muted-foreground" />
                          <span>Keep existing connections</span>
                        </Label>
                        <Label
                          htmlFor="conn-replace"
                          className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value="replace" id="conn-replace" />
                          <Replace className="w-4 h-4 text-muted-foreground" />
                          <span>Use imported weights</span>
                        </Label>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Merge Preview</Label>
                    <CircuitMergePreview
                      existingNeurons={existingNeurons}
                      incomingNeurons={mergeAnalysis.incomingNeurons}
                      duplicateNeuronIds={duplicateNeuronIds}
                    />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border-2 border-foreground bg-muted" />
                        <span>Existing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-dashed"
                          style={{ borderColor: "hsl(142 76% 36%)" }}
                        />
                        <span>New</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border-2 border-dashed"
                          style={{ borderColor: "hsl(45 93% 47%)" }}
                        />
                        <span>Duplicate</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="pt-4 border-t">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={resetAndClose}>
                Cancel
              </Button>
              {parseResult?.success && hasExistingCircuit && (
                <Button onClick={() => setStep("configure")} className="gap-2">
                  Configure Merge
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {parseResult?.success && !hasExistingCircuit && (
                <Button onClick={handleImport} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import Circuit
                </Button>
              )}
            </>
          )}
          {step === "configure" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport} className="gap-2">
                {importMode === "merge" ? (
                  <>
                    <Merge className="w-4 h-4" />
                    Merge Circuits
                  </>
                ) : (
                  <>
                    <Replace className="w-4 h-4" />
                    Replace Circuit
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
