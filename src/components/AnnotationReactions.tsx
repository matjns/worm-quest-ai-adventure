import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const AVAILABLE_EMOJIS = [
  { emoji: "👍", label: "Thumbs up" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "🎉", label: "Celebration" },
  { emoji: "🧠", label: "Brain" },
  { emoji: "💡", label: "Idea" },
  { emoji: "✅", label: "Check" },
];

interface Reaction {
  id: string;
  annotation_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface ReactionCount {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface AnnotationReactionsProps {
  annotationId: string;
  className?: string;
  compact?: boolean;
}

export function AnnotationReactions({
  annotationId,
  className,
  compact = false,
}: AnnotationReactionsProps) {
  const { user, isAuthenticated } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Fetch reactions for this annotation
  const fetchReactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("annotation_reactions")
        .select("*")
        .eq("annotation_id", annotationId);

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  }, [annotationId]);

  useEffect(() => {
    fetchReactions();

    // Subscribe to real-time reaction updates
    const channel = supabase
      .channel(`reactions:${annotationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "annotation_reactions",
          filter: `annotation_id=eq.${annotationId}`,
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [annotationId, fetchReactions]);

  // Get reaction counts with user's reaction status
  const getReactionCounts = (): ReactionCount[] => {
    const counts: Record<string, { count: number; hasReacted: boolean }> = {};

    reactions.forEach((r) => {
      if (!counts[r.emoji]) {
        counts[r.emoji] = { count: 0, hasReacted: false };
      }
      counts[r.emoji].count++;
      if (user && r.user_id === user.id) {
        counts[r.emoji].hasReacted = true;
      }
    });

    return Object.entries(counts).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: data.hasReacted,
    }));
  };

  // Toggle reaction
  const toggleReaction = async (emoji: string) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const existingReaction = reactions.find(
        (r) => r.user_id === user.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from("annotation_reactions")
          .delete()
          .eq("id", existingReaction.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from("annotation_reactions")
          .insert({
            annotation_id: annotationId,
            user_id: user.id,
            emoji,
          });

        if (error) throw error;
      }

      setShowPicker(false);
      await fetchReactions();
    } catch (error) {
      console.error("Error toggling reaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const reactionCounts = getReactionCounts();

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {/* Existing reactions */}
      <AnimatePresence mode="popLayout">
        {reactionCounts.map(({ emoji, count, hasReacted }) => (
          <motion.div
            key={emoji}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 px-1.5 text-xs gap-1",
                      hasReacted && "bg-primary/10 text-primary border border-primary/20",
                      !isAuthenticated && "cursor-default"
                    )}
                    onClick={() => isAuthenticated && toggleReaction(emoji)}
                    disabled={loading || !isAuthenticated}
                  >
                    <span className="text-sm">{emoji}</span>
                    <span className="text-[10px] font-medium">{count}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {hasReacted ? "Click to remove" : isAuthenticated ? "Click to react" : "Sign in to react"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add reaction button */}
      {isAuthenticated && (
        <Popover open={showPicker} onOpenChange={setShowPicker}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0",
                compact && reactionCounts.length === 0 && "opacity-0 group-hover:opacity-100 transition-opacity"
              )}
              disabled={loading}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex gap-1">
              {AVAILABLE_EMOJIS.map(({ emoji, label }) => {
                const hasReacted = reactions.some(
                  (r) => r.user_id === user?.id && r.emoji === emoji
                );
                return (
                  <TooltipProvider key={emoji}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 text-lg hover:scale-110 transition-transform",
                            hasReacted && "bg-primary/10"
                          )}
                          onClick={() => toggleReaction(emoji)}
                        >
                          {emoji}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
