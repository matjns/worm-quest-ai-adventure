import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  parseNeuroML,
  readNeuroMLFile,
  validateNeuroMLContent,
  arrangeNeuronsForCanvas,
  type ImportResult,
} from "@/utils/neuromlImport";
import { type NeuronData, type ConnectionData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

interface NeuroMLImportDialogProps {
  onImport: (neurons: PlacedNeuron[], connections: DesignerConnection[]) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  trigger?: React.ReactNode;
}

export function NeuroMLImportDialog({
  onImport,
  canvasWidth = 600,
  canvasHeight = 400,
  trigger,
}: NeuroMLImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importTab, setImportTab] = useState<"file" | "paste">("file");
  const [pastedContent, setPastedContent] = useState("");
  const [parseResult, setParseResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // Validate file type
      const validExtensions = [".nml", ".xml", ".neuroml"];
      const hasValidExt = validExtensions.some(ext => 
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
      toast.success(`Parsed ${result.neurons.length} neurons and ${result.connections.length} connections`);
    }
  }, []);

  const handlePaste = useCallback(() => {
    if (!pastedContent.trim()) {
      toast.error("Please paste NeuroML content first");
      return;
    }
    processContent(pastedContent);
  }, [pastedContent, processContent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleImport = useCallback(() => {
    if (!parseResult?.success) return;

    // Arrange neurons on canvas
    const arrangedNeurons = arrangeNeuronsForCanvas(
      parseResult.neurons,
      canvasWidth,
      canvasHeight
    );

    // Convert to PlacedNeuron format
    const placedNeurons: PlacedNeuron[] = arrangedNeurons.map(n => ({
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

    // Convert connections with unique IDs
    const designerConnections: DesignerConnection[] = parseResult.connections.map((c, i) => ({
      id: `${c.from}-${c.to}-${i}`,
      from: c.from,
      to: c.to,
      type: c.type,
      weight: c.weight,
    }));

    onImport(placedNeurons, designerConnections);
    
    toast.success(`Imported circuit: ${parseResult.metadata.title}`);
    setOpen(false);
    setParseResult(null);
    setPastedContent("");
  }, [parseResult, canvasWidth, canvasHeight, onImport]);

  const resetState = () => {
    setParseResult(null);
    setPastedContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Upload className="w-4 h-4" />
            Import NeuroML
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary" />
            Import NeuroML Circuit
          </DialogTitle>
          <DialogDescription>
            Import neural circuits from NeuroML 2.x files exported from research tools like NEURON, NetPyNE, or OpenWorm c302
          </DialogDescription>
        </DialogHeader>

        <Tabs value={importTab} onValueChange={(v) => setImportTab(v as "file" | "paste")}>
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
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50"
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                Supports .nml, .xml, and .neuroml files (NeuroML 2.x format)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-4 space-y-3">
            <Textarea
              placeholder={`<?xml version="1.0"?>
<neuroml xmlns="http://www.neuroml.org/schema/neuroml2" id="my_circuit">
  <cell id="AVAL">
    <annotation>
      <property tag="neuronType" value="command"/>
    </annotation>
  </cell>
  <network id="my_network">
    <population id="AVAL_pop" component="AVAL" size="1"/>
    <projection id="proj_1" presynapticPopulation="AVAL_pop" .../>
  </network>
</neuroml>`}
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
          <div className="flex-1 mt-4 overflow-hidden flex flex-col">
            <div className={`
              p-4 rounded-lg border mb-4
              ${parseResult.success 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-destructive/10 border-destructive/30"
              }
            `}>
              <div className="flex items-center gap-2 mb-2">
                {parseResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium">
                  {parseResult.success 
                    ? `Successfully parsed: ${parseResult.metadata.title}` 
                    : "Failed to parse NeuroML"
                  }
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
            </div>

            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <ScrollArea className="flex-1 max-h-[150px] mb-4">
                <div className="space-y-2">
                  {parseResult.errors.map((error, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-destructive">
                      <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Warnings */}
            {parseResult.warnings.length > 0 && (
              <ScrollArea className="flex-1 max-h-[150px] mb-4">
                <div className="space-y-2">
                  {parseResult.warnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-500">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Neuron Preview */}
            {parseResult.success && parseResult.neurons.length > 0 && (
              <ScrollArea className="flex-1 max-h-[200px]">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Neurons to Import</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {parseResult.neurons.slice(0, 12).map(neuron => (
                      <div
                        key={neuron.id}
                        className="p-2 bg-muted/50 rounded-md text-sm flex items-center gap-2"
                      >
                        <Badge 
                          variant="outline" 
                          className={`
                            text-xs
                            ${neuron.type === "sensory" ? "border-blue-500/50 text-blue-500" : ""}
                            ${neuron.type === "motor" ? "border-green-500/50 text-green-500" : ""}
                            ${neuron.type === "interneuron" ? "border-purple-500/50 text-purple-500" : ""}
                            ${neuron.type === "command" ? "border-orange-500/50 text-orange-500" : ""}
                          `}
                        >
                          {neuron.type.slice(0, 3)}
                        </Badge>
                        <span className="font-mono">{neuron.id}</span>
                      </div>
                    ))}
                    {parseResult.neurons.length > 12 && (
                      <div className="p-2 text-sm text-muted-foreground italic">
                        +{parseResult.neurons.length - 12} more...
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parseResult?.success}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Circuit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
