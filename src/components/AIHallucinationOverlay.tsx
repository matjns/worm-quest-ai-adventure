import { AlertTriangle, X, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIHallucinationOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
  confidence: number;
  sources: string[];
  claim?: string;
  className?: string;
}

export function AIHallucinationOverlay({
  isVisible,
  onDismiss,
  confidence,
  sources,
  claim,
  className,
}: AIHallucinationOverlayProps) {
  const isHallucination = confidence < 0.7;
  const isVerified = confidence >= 0.9 && sources.length > 0;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "absolute top-0 left-0 right-0 z-50 p-4 rounded-t-lg border-b",
          isHallucination 
            ? "bg-destructive/10 border-destructive/30" 
            : isVerified
            ? "bg-green-500/10 border-green-500/30"
            : "bg-amber-500/10 border-amber-500/30",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isHallucination ? (
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
            ) : isVerified ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium text-sm",
                  isHallucination && "text-destructive",
                  isVerified && "text-green-600 dark:text-green-400",
                  !isHallucination && !isVerified && "text-amber-600 dark:text-amber-400"
                )}>
                  {isHallucination 
                    ? "⚠️ Potential Hallucination Detected" 
                    : isVerified
                    ? "✓ Verified Against owmeta"
                    : "⚡ Partially Verified"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {(confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {isHallucination 
                  ? "This response contains claims not verified in the OpenWorm/owmeta knowledge base. Cross-reference with primary sources."
                  : isVerified
                  ? "All claims validated against OpenWorm reference data."
                  : "Some claims could not be verified. Review sources below."}
              </p>

              {sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {sources.map((source, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {source}
                    </Badge>
                  ))}
                </div>
              )}

              {claim && isHallucination && (
                <div className="mt-2 p-2 bg-destructive/5 rounded text-xs border border-destructive/20">
                  <span className="font-medium">Flagged claim: </span>
                  <span className="text-muted-foreground">{claim}</span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for managing hallucination detection state
import { useState, useCallback } from "react";

interface HallucinationState {
  isVisible: boolean;
  confidence: number;
  sources: string[];
  claim?: string;
}

export function useHallucinationDetection() {
  const [state, setState] = useState<HallucinationState>({
    isVisible: false,
    confidence: 1,
    sources: [],
  });

  const checkResponse = useCallback((
    response: { validation?: { confidence: number; sources: string[] }; hallucination?: boolean },
    claim?: string
  ) => {
    if (response.hallucination || (response.validation?.confidence ?? 1) < 0.7) {
      setState({
        isVisible: true,
        confidence: response.validation?.confidence ?? 0.5,
        sources: response.validation?.sources ?? [],
        claim,
      });
    } else if (response.validation) {
      setState({
        isVisible: true,
        confidence: response.validation.confidence,
        sources: response.validation.sources,
      });
      // Auto-dismiss verified responses after 3 seconds
      if (response.validation.confidence >= 0.9) {
        setTimeout(() => dismiss(), 3000);
      }
    }
  }, []);

  const dismiss = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    ...state,
    checkResponse,
    dismiss,
  };
}
