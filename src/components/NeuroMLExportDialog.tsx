import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileCode,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { type ConnectionData } from "@/data/neuronData";
import { downloadNeuroML, exportToNeuroML, validateForExport } from "@/utils/neuromlExport";
import { toast } from "sonner";

interface PlacedNeuron {
  id: string;
  type: string;
  x?: number;
  y?: number;
}

interface NeuroMLExportDialogProps {
  neurons: PlacedNeuron[];
  connections: ConnectionData[];
  trigger?: React.ReactNode;
}

export function NeuroMLExportDialog({
  neurons,
  connections,
  trigger,
}: NeuroMLExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("My Circuit");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [includePositions, setIncludePositions] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const validation = validateForExport(neurons, connections);

  const handleExport = () => {
    if (!validation.valid) {
      toast.error("Please fix errors before exporting");
      return;
    }

    downloadNeuroML(neurons, connections, {
      title,
      description,
      author,
      includePositions,
    });

    toast.success("NeuroML file downloaded!");
    setOpen(false);
  };

  const handleCopyToClipboard = () => {
    const neuroml = exportToNeuroML(neurons, connections, {
      title,
      description,
      author,
      includePositions,
    });
    navigator.clipboard.writeText(neuroml);
    setCopied(true);
    toast.success("NeuroML copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const previewContent = showPreview
    ? exportToNeuroML(neurons, connections, {
        title,
        description,
        author,
        includePositions,
      })
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileCode className="w-4 h-4" />
            Export NeuroML
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary" />
            Export to NeuroML 2.x
            <Badge variant="secondary" className="ml-2">OpenWorm Compatible</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Validation Status */}
          {!validation.valid && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {validation.errors.map((e, i) => (
                  <div key={i}>{e}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {validation.warnings.length > 0 && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription className="text-sm">
                {validation.warnings.map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Export Info */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{neurons.length}</div>
              <div className="text-xs text-muted-foreground">Neurons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{connections.length}</div>
              <div className="text-xs text-muted-foreground">Synapses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">2.3</div>
              <div className="text-xs text-muted-foreground">NeuroML Version</div>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="title">Circuit Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Touch Reflex Circuit"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the circuit's function..."
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name (optional)"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="positions"
                checked={includePositions}
                onCheckedChange={(c) => setIncludePositions(c as boolean)}
              />
              <Label htmlFor="positions" className="text-sm font-normal cursor-pointer">
                Include neuron positions from canvas
              </Label>
            </div>
          </div>

          {/* Compatible Tools */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Compatible Tools:</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "OpenWorm c302", url: "https://github.com/openworm/c302" },
                { name: "jNeuroML", url: "https://github.com/NeuroML/jNeuroML" },
                { name: "NEURON", url: "https://neuron.yale.edu" },
                { name: "NetPyNE", url: "http://netpyne.org" },
                { name: "Brian2", url: "https://brian2.readthedocs.io" },
              ].map((tool) => (
                <a
                  key={tool.name}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md hover:bg-muted/80 transition-colors"
                >
                  {tool.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Preview Toggle */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full"
            >
              {showPreview ? "Hide Preview" : "Show XML Preview"}
            </Button>

            {showPreview && (
              <div className="relative">
                <ScrollArea className="h-[200px] rounded-md border bg-muted/20">
                  <pre className="p-3 text-xs font-mono whitespace-pre overflow-x-auto">
                    {previewContent}
                  </pre>
                </ScrollArea>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyToClipboard}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!validation.valid || !title.trim()}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download .nml File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
