import { useState, useRef } from "react";
import { Upload, FileJson, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { z } from "zod";

// Schema for validating imported circuit data
const circuitDataSchema = z.object({
  neurons: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    type: z.string().optional(),
  })).default([]),
  connections: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.string().default("excitatory"),
  })).default([]),
});

const importedCircuitSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional().nullable(),
  behavior: z.string().min(1, "Behavior is required").max(50, "Behavior too long"),
  neurons_used: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  circuit_data: circuitDataSchema.optional().default({ neurons: [], connections: [] }),
  // Optional metadata from export
  exported_at: z.string().optional(),
  source: z.string().optional(),
  author: z.string().optional(),
});

type ImportedCircuit = z.infer<typeof importedCircuitSchema>;

interface ImportCircuitDialogProps {
  onImport: (circuit: {
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
  children?: React.ReactNode;
}

export function ImportCircuitDialog({ onImport, children }: ImportCircuitDialogProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedCircuit, setParsedCircuit] = useState<ImportedCircuit | null>(null);
  const [editableTitle, setEditableTitle] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [editableTags, setEditableTags] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setError(null);
    setParsedCircuit(null);
    setEditableTitle("");
    setEditableDescription("");
    setEditableTags("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsedCircuit(null);

    // Validate file type
    if (!file.name.endsWith(".json")) {
      setError("Please select a JSON file");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError("File too large. Maximum size is 1MB");
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Validate against schema
      const result = importedCircuitSchema.safeParse(json);
      
      if (!result.success) {
        const issues = result.error.issues.map(i => i.message).join(", ");
        setError(`Invalid circuit format: ${issues}`);
        return;
      }

      setParsedCircuit(result.data);
      setEditableTitle(result.data.title);
      setEditableDescription(result.data.description || "");
      setEditableTags(result.data.tags?.join(", ") || "");
    } catch {
      setError("Failed to parse JSON file. Please check the file format.");
    }
  };

  const handleImport = async () => {
    if (!parsedCircuit) return;

    // Validate title
    if (!editableTitle.trim()) {
      setError("Title is required");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const neurons = (parsedCircuit.circuit_data.neurons || []).map(n => ({
        id: n.id,
        x: n.x,
        y: n.y,
      }));
      const connections = (parsedCircuit.circuit_data.connections || []).map(c => ({
        from: c.from,
        to: c.to,
        type: c.type || "excitatory",
      }));

      await onImport({
        title: editableTitle.trim(),
        description: editableDescription.trim() || undefined,
        behavior: parsedCircuit.behavior,
        neurons_used: parsedCircuit.neurons_used,
        tags: editableTags.split(",").map(t => t.trim()).filter(Boolean),
        circuit_data: { neurons, connections },
      });

      toast.success("Circuit imported successfully!");
      setOpen(false);
      resetState();
    } catch (err) {
      setError("Failed to import circuit. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Circuit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Import Circuit from JSON
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <Label htmlFor="circuit-file">Select JSON File</Label>
            <Input
              ref={fileInputRef}
              id="circuit-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="mt-1 cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Import a circuit previously exported from NeuroQuest
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Parsed Circuit Preview */}
          {parsedCircuit && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                Circuit parsed successfully
              </div>

              {/* Preview Stats */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {parsedCircuit.circuit_data.neurons?.length || 0} neurons
                </Badge>
                <Badge variant="outline">
                  {parsedCircuit.circuit_data.connections?.length || 0} connections
                </Badge>
                <Badge variant="secondary">{parsedCircuit.behavior}</Badge>
              </div>

              {/* Editable Fields */}
              <div>
                <Label htmlFor="import-title">Title</Label>
                <Input
                  id="import-title"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  placeholder="Circuit title"
                  maxLength={100}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="import-description">Description</Label>
                <Textarea
                  id="import-description"
                  value={editableDescription}
                  onChange={(e) => setEditableDescription(e.target.value)}
                  placeholder="Optional description"
                  maxLength={500}
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="import-tags">Tags (comma separated)</Label>
                <Input
                  id="import-tags"
                  value={editableTags}
                  onChange={(e) => setEditableTags(e.target.value)}
                  placeholder="chemotaxis, sensory, movement"
                  className="mt-1"
                />
              </div>

              {/* Original Metadata */}
              {parsedCircuit.author && (
                <p className="text-xs text-muted-foreground">
                  Originally created by: {parsedCircuit.author}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!parsedCircuit || importing}
          >
            {importing ? "Importing..." : "Import Circuit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
