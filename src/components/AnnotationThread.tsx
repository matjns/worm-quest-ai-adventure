import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Reply,
  Edit2,
  Trash2,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  AtSign,
  Pin,
  PinOff,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MentionInput, renderMentionText } from "./MentionInput";
import { AnnotationReactions } from "./AnnotationReactions";
import { cn } from "@/lib/utils";

interface Annotation {
  id: string;
  circuit_id: string;
  neuron_id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_id: string | null;
  is_pinned: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface AnnotationThreadProps {
  annotation: Annotation;
  replies: Annotation[];
  currentUserId?: string;
  circuitOwnerId?: string;
  isAuthenticated: boolean;
  readOnly: boolean;
  getColorValue: (colorId: string) => string;
  onEdit: (annotationId: string, content: string) => Promise<void>;
  onDelete: (annotationId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
  onTogglePin?: (annotationId: string, currentlyPinned: boolean) => Promise<void>;
  onToggleResolve?: (annotationId: string, currentlyResolved: boolean) => Promise<void>;
  saving: boolean;
}

export function AnnotationThread({
  annotation,
  replies,
  currentUserId,
  circuitOwnerId,
  isAuthenticated,
  readOnly,
  getColorValue,
  onEdit,
  onDelete,
  onReply,
  onTogglePin,
  onToggleResolve,
  saving,
}: AnnotationThreadProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(replies.length <= 2);

  const handleSaveEdit = async (annotationId: string) => {
    const textarea = document.getElementById(`edit-${annotationId}`) as HTMLTextAreaElement;
    if (textarea?.value.trim()) {
      await onEdit(annotationId, textarea.value.trim());
      setEditingId(null);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (replyContent.trim()) {
      await onReply(parentId, replyContent.trim());
      setReplyContent("");
      setReplyingTo(null);
      setShowReplies(true);
    }
  };

  // Check if user can pin (annotation author or circuit owner)
  const canPin = (ann: Annotation) => 
    !ann.parent_id && (ann.user_id === currentUserId || circuitOwnerId === currentUserId);

  // Check if user can resolve (annotation author, circuit owner, or any authenticated user)
  const canResolve = (ann: Annotation) =>
    !ann.parent_id && isAuthenticated && !readOnly;

  const renderAnnotationContent = (ann: Annotation, isReply = false) => (
    <div
      key={ann.id}
      className={cn(
        "bg-muted/50 rounded p-2 text-sm relative transition-opacity",
        isReply && "ml-4 border-l-2 border-muted-foreground/20",
        ann.is_pinned && !isReply && "ring-1 ring-primary/30 bg-primary/5",
        ann.is_resolved && !isReply && "opacity-60 bg-muted/30"
      )}
      style={{ borderLeft: isReply ? undefined : `3px solid ${ann.is_resolved ? 'hsl(var(--muted-foreground))' : getColorValue(ann.color)}` }}
    >
      {/* Resolved indicator */}
      {ann.is_resolved && !isReply && (
        <div className="absolute -top-1.5 -left-1.5 bg-green-500 text-white rounded-full p-0.5">
          <CheckCircle2 className="w-2.5 h-2.5" />
        </div>
      )}
      {/* Pinned indicator */}
      {ann.is_pinned && !isReply && !ann.is_resolved && (
        <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
          <Pin className="w-2.5 h-2.5" />
        </div>
      )}
      {editingId === ann.id ? (
        <div className="space-y-2">
          <Textarea
            defaultValue={ann.content}
            className="min-h-[60px] text-xs"
            id={`edit-${ann.id}`}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              disabled={saving}
              onClick={() => handleSaveEdit(ann.id)}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs mb-1">{renderMentionText(ann.content)}</p>
          
          {/* Emoji reactions */}
          <AnnotationReactions annotationId={ann.id} compact className="mb-1" />
          
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Avatar className="w-4 h-4">
                <AvatarImage src={ann.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-[8px]">
                  {ann.profiles?.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[60px]">
                {ann.profiles?.display_name || "Anonymous"}
              </span>
              <span>•</span>
              <span className="whitespace-nowrap">
                {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex gap-0.5">
              {/* Resolve button - only for top-level annotations */}
              {canResolve(ann) && onToggleResolve && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-5 w-5", ann.is_resolved && "text-green-500")}
                  onClick={() => onToggleResolve(ann.id, ann.is_resolved)}
                  title={ann.is_resolved ? "Reopen thread" : "Resolve thread"}
                >
                  {ann.is_resolved ? <RotateCcw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                </Button>
              )}
              {/* Pin button - only for top-level annotations, visible to author or circuit owner */}
              {canPin(ann) && onTogglePin && !readOnly && !ann.is_resolved && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-5 w-5", ann.is_pinned && "text-primary")}
                  onClick={() => onTogglePin(ann.id, ann.is_pinned)}
                  title={ann.is_pinned ? "Unpin" : "Pin to top"}
                >
                  {ann.is_pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                </Button>
              )}
              {/* Reply button - only for top-level annotations, not resolved */}
              {!isReply && isAuthenticated && !readOnly && !ann.is_resolved && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setReplyingTo(replyingTo === ann.id ? null : ann.id)}
                  title="Reply"
                >
                  <Reply className="w-3 h-3" />
                </Button>
              )}
              {ann.user_id === currentUserId && !ann.is_resolved && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setEditingId(ann.id)}
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive"
                    onClick={() => onDelete(ann.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-1">
      {/* Main annotation */}
      {renderAnnotationContent(annotation)}

      {/* Reply count toggle */}
      {replies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs ml-4 text-muted-foreground"
          onClick={() => setShowReplies(!showReplies)}
        >
          {showReplies ? (
            <ChevronUp className="w-3 h-3 mr-1" />
          ) : (
            <ChevronDown className="w-3 h-3 mr-1" />
          )}
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </Button>
      )}

      {/* Replies */}
      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 overflow-hidden"
          >
            {replies.map((reply) => renderAnnotationContent(reply, true))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply input */}
      <AnimatePresence>
        {replyingTo === annotation.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-4 space-y-2 overflow-hidden"
          >
            <div className="relative">
              <MentionInput
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Write a reply... Use @ to mention"
                className="text-xs min-h-[50px]"
              />
              <AtSign className="absolute right-2 top-2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="default"
                className="h-6 text-xs"
                disabled={!replyContent.trim() || saving}
                onClick={() => handleSubmitReply(annotation.id)}
              >
                {saving ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Reply className="w-3 h-3 mr-1" />
                )}
                Reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
