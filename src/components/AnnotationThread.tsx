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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MentionInput, renderMentionText } from "./MentionInput";
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
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface AnnotationThreadProps {
  annotation: Annotation;
  replies: Annotation[];
  currentUserId?: string;
  isAuthenticated: boolean;
  readOnly: boolean;
  getColorValue: (colorId: string) => string;
  onEdit: (annotationId: string, content: string) => Promise<void>;
  onDelete: (annotationId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
  saving: boolean;
}

export function AnnotationThread({
  annotation,
  replies,
  currentUserId,
  isAuthenticated,
  readOnly,
  getColorValue,
  onEdit,
  onDelete,
  onReply,
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

  const renderAnnotationContent = (ann: Annotation, isReply = false) => (
    <div
      key={ann.id}
      className={cn(
        "bg-muted/50 rounded p-2 text-sm",
        isReply && "ml-4 border-l-2 border-muted-foreground/20"
      )}
      style={{ borderLeft: isReply ? undefined : `3px solid ${getColorValue(ann.color)}` }}
    >
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
          <p className="text-xs mb-2">{renderMentionText(ann.content)}</p>
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
              {/* Reply button - only for top-level annotations */}
              {!isReply && isAuthenticated && !readOnly && (
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
              {ann.user_id === currentUserId && (
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
