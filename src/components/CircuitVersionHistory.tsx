import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Clock,
  RotateCcw,
  Eye,
  Loader2,
  GitBranch,
  Zap,
  Check,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CircuitSimulationPreview } from "@/components/CircuitSimulationPreview";

interface CircuitVersion {
  id: string;
  circuit_id: string;
  version_number: number;
  title: string;
  description: string | null;
  circuit_data: {
    neurons: Array<{ id: string; x: number; y: number; type?: string }>;
    connections: Array<{ from: string; to: string; type: string }>;
  };
  neurons_used: string[];
  behavior: string;
  change_summary: string | null;
  created_at: string;
  created_by: string;
}

interface CircuitVersionHistoryProps {
  circuitId: string;
  circuitTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (version: CircuitVersion) => Promise<void>;
  isOwner: boolean;
}

export function CircuitVersionHistory({
  circuitId,
  circuitTitle,
  open,
  onOpenChange,
  onRestore,
  isOwner,
}: CircuitVersionHistoryProps) {
  const [versions, setVersions] = useState<CircuitVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<CircuitVersion | null>(null);
  const [previewVersion, setPreviewVersion] = useState<CircuitVersion | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { toast } = useToast();

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    try {
      // Use direct REST API call since the types file may not be updated yet
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_versions?circuit_id=eq.${circuitId}&order=version_number.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      
      const data: CircuitVersion[] = await response.json();
      setVersions(data || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast({
        title: "Error",
        description: "Failed to load version history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [circuitId, toast]);

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, fetchVersions]);

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setRestoring(true);
    try {
      await onRestore(selectedVersion);
      toast({
        title: "Version Restored",
        description: `Restored to version ${selectedVersion.version_number}`,
      });
      setRestoreDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const latestVersion = versions[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History: {circuitTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 h-[70vh]">
            {/* Version List */}
            <div className="flex flex-col border-2 border-foreground rounded-lg overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {versions.length} version{versions.length !== 1 ? "s" : ""}
                  </span>
                  <Badge variant="outline" className="text-xs gap-1">
                    <GitBranch className="w-3 h-3" />
                    Latest: v{latestVersion?.version_number || 1}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No version history available</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {versions.map((version, index) => (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          previewVersion?.id === version.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setPreviewVersion(version)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={index === 0 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              v{version.version_number}
                            </Badge>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                Latest
                              </Badge>
                            )}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(version.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {format(new Date(version.created_at), "PPpp")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <p className="text-sm font-medium truncate mb-1">
                          {version.title}
                        </p>

                        {version.change_summary && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {version.change_summary}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs gap-1">
                            <Zap className="w-3 h-3" />
                            {version.neurons_used.length}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {version.behavior}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Preview Panel */}
            <div className="flex flex-col border-2 border-foreground rounded-lg overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/50">
                <span className="text-sm font-medium">
                  {previewVersion
                    ? `Preview: Version ${previewVersion.version_number}`
                    : "Select a version to preview"}
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {previewVersion ? (
                    <motion.div
                      key={previewVersion.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Version Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold">{previewVersion.title}</h4>
                        {previewVersion.description && (
                          <p className="text-sm text-muted-foreground">
                            {previewVersion.description}
                          </p>
                        )}
                      </div>

                      {/* Circuit Preview */}
                      <CircuitSimulationPreview
                        circuit={previewVersion.circuit_data}
                        height={200}
                        showControls={true}
                      />

                      {/* Stats Comparison */}
                      {latestVersion && previewVersion.id !== latestVersion.id && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            Compared to latest
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Neurons:</span>
                              <span
                                className={
                                  previewVersion.neurons_used.length !==
                                  latestVersion.neurons_used.length
                                    ? "text-yellow-600"
                                    : ""
                                }
                              >
                                {previewVersion.neurons_used.length} →{" "}
                                {latestVersion.neurons_used.length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Connections:</span>
                              <span
                                className={
                                  previewVersion.circuit_data.connections.length !==
                                  latestVersion.circuit_data.connections.length
                                    ? "text-yellow-600"
                                    : ""
                                }
                              >
                                {previewVersion.circuit_data.connections.length} →{" "}
                                {latestVersion.circuit_data.connections.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Neurons List */}
                      <div className="text-xs font-mono bg-muted/30 p-2 rounded">
                        <span className="font-bold">Neurons: </span>
                        {previewVersion.neurons_used.join(", ")}
                      </div>

                      {/* Restore Button */}
                      {isOwner && previewVersion.id !== latestVersion?.id && (
                        <Button
                          onClick={() => {
                            setSelectedVersion(previewVersion);
                            setRestoreDialogOpen(true);
                          }}
                          className="w-full gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Restore Version {previewVersion.version_number}
                        </Button>
                      )}

                      {previewVersion.id === latestVersion?.id && (
                        <div className="text-center py-2">
                          <Badge variant="outline" className="gap-1">
                            <Check className="w-3 h-3" />
                            This is the current version
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-muted-foreground"
                    >
                      <Eye className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-sm">Click a version to preview</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore your circuit to version {selectedVersion?.version_number}. The
              current version will be saved in history before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={restoring}>
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
