import { motion, AnimatePresence } from "framer-motion";
import { AtSign, MessageSquare, ExternalLink, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMentionsInbox } from "@/hooks/useMentionsInbox";
import { renderMentionText } from "./MentionInput";
import { cn } from "@/lib/utils";

interface MentionsInboxProps {
  onNavigateToCircuit?: (circuitId: string) => void;
  className?: string;
}

export function MentionsInbox({ onNavigateToCircuit, className }: MentionsInboxProps) {
  const { mentions, loading, refresh } = useMentionsInbox();

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (mentions.length === 0) {
    return (
      <div className={cn("text-center py-12 px-4", className)}>
        <AtSign className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No mentions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          You'll see annotations here when someone mentions you with @{"{"}your name{"}"}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[400px]", className)}>
      <AnimatePresence mode="popLayout">
        {mentions.map((mention) => (
          <motion.div
            key={mention.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-3 border-b border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={mention.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {mention.profiles?.display_name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {mention.profiles?.display_name || "Someone"}
                  </span>
                  <span className="text-xs text-muted-foreground">mentioned you</span>
                </div>
                
                <div 
                  className="text-xs bg-muted/50 rounded p-2 mb-2"
                  style={{ borderLeft: `3px solid hsl(var(--primary))` }}
                >
                  {renderMentionText(mention.content)}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] h-5">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {mention.neuron_id}
                    </Badge>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(mention.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {mention.shared_circuits && onNavigateToCircuit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => onNavigateToCircuit(mention.circuit_id)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
                
                {mention.shared_circuits && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    In: {mention.shared_circuits.title}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
}
