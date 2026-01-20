import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Heart, MessageCircle, User, Clock, Zap, Tag, 
  Github, GitFork, Send, Loader2, ExternalLink, Download, FileJson, Image 
} from "lucide-react";
import { exportCircuitAsJSON, exportCircuitAsPNG } from "@/utils/circuitExport";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SharedCircuit, CircuitComment } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface CircuitDetailModalProps {
  circuit: SharedCircuit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLiked: boolean;
  onLike: () => void;
  onFork: () => void;
  onGeneratePR: () => void;
  fetchComments: (circuitId: string) => Promise<CircuitComment[]>;
  addComment: (circuitId: string, content: string) => Promise<{ error: unknown }>;
}

export function CircuitDetailModal({
  circuit,
  open,
  onOpenChange,
  isLiked,
  onLike,
  onFork,
  onGeneratePR,
  fetchComments,
  addComment,
}: CircuitDetailModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<CircuitComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const loadComments = useCallback(async () => {
    if (!circuit) return;
    setLoadingComments(true);
    const data = await fetchComments(circuit.id);
    setComments(data);
    setLoadingComments(false);
  }, [circuit, fetchComments]);

  useEffect(() => {
    if (open && circuit) {
      loadComments();
    }
  }, [open, circuit, loadComments]);

  const handleSubmitComment = async () => {
    if (!circuit || !newComment.trim()) return;
    setSubmittingComment(true);
    const { error } = await addComment(circuit.id, newComment.trim());
    if (!error) {
      setNewComment("");
      await loadComments();
    }
    setSubmittingComment(false);
  };

  if (!circuit) return null;

  const neurons = circuit.circuit_data?.neurons || [];
  const connections = circuit.circuit_data?.connections || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left: Circuit Visualization */}
          <div className="bg-muted/50 p-6 border-r border-border">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold uppercase flex items-center gap-2">
                {circuit.title}
                {circuit.is_featured && (
                  <Badge variant="default" className="text-xs">★ FEATURED</Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{circuit.profiles?.display_name || "Anonymous"}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(circuit.created_at), { addSuffix: true })}</span>
              </div>
            </DialogHeader>

            {/* Circuit Visualization */}
            <div className="bg-background border-2 border-foreground rounded-lg p-4 mb-4 relative h-64 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Draw connections */}
                {connections.map((conn, i) => {
                  const fromNeuron = neurons.find(n => n.id === conn.from);
                  const toNeuron = neurons.find(n => n.id === conn.to);
                  if (!fromNeuron || !toNeuron) return null;
                  
                  const x1 = (fromNeuron.x / 100) * 400;
                  const y1 = (fromNeuron.y / 100) * 200;
                  const x2 = (toNeuron.x / 100) * 400;
                  const y2 = (toNeuron.y / 100) * 200;
                  
                  return (
                    <motion.line
                      key={`conn-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={conn.type === "excitatory" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  );
                })}
                
                {/* Draw neurons */}
                {neurons.map((neuron, i) => {
                  const cx = (neuron.x / 100) * 400;
                  const cy = (neuron.y / 100) * 200;
                  
                  return (
                    <motion.g key={neuron.id}>
                      <motion.circle
                        cx={cx}
                        cy={cy}
                        r="16"
                        fill="hsl(var(--primary))"
                        stroke="hsl(var(--foreground))"
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      />
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="hsl(var(--primary-foreground))"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {neuron.id.slice(0, 4)}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Empty state */}
                {neurons.length === 0 && (
                  <text
                    x="200"
                    y="100"
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="14"
                  >
                    No visualization data available
                  </text>
                )}
              </svg>
            </div>

            {/* Circuit Info */}
            <div className="space-y-3">
              {circuit.description && (
                <p className="text-sm text-muted-foreground">{circuit.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <Zap className="w-3 h-3" />
                  {circuit.neurons_used.length} neurons
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {connections.length} connections
                </Badge>
                <Badge variant="secondary">{circuit.behavior}</Badge>
              </div>

              {circuit.tags && circuit.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {circuit.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Neurons List */}
              {circuit.neurons_used.length > 0 && (
                <div className="text-xs font-mono text-muted-foreground bg-muted/50 p-2 rounded">
                  <span className="font-bold">Neurons: </span>
                  {circuit.neurons_used.join(", ")}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={onLike}
                className="flex-1"
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                {circuit.likes_count} {circuit.likes_count === 1 ? "Like" : "Likes"}
              </Button>
              {circuit.user_id !== user?.id && (
                <Button variant="outline" size="sm" onClick={onFork}>
                  <GitFork className="w-4 h-4 mr-1" />
                  Fork
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => exportCircuitAsJSON(circuit)} title="Export as JSON">
                <FileJson className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCircuitAsPNG(circuit)} title="Export as PNG">
                <Image className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onGeneratePR}>
                <Github className="w-4 h-4 mr-1" />
                PR
              </Button>
              <SocialShareButtons
                circuitId={circuit.id}
                title={circuit.title}
                description={circuit.description || undefined}
                tags={circuit.tags || undefined}
                variant="inline"
              />
            </div>
          </div>

          {/* Right: Comments */}
          <div className="flex flex-col h-[80vh] md:h-auto">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold uppercase flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comments ({comments.length})
              </h3>
            </div>

            <ScrollArea className="flex-1 p-4">
              {loadingComments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <Avatar className="w-8 h-8 border-2 border-foreground">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {comment.profiles?.display_name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold truncate">
                            {comment.profiles?.display_name || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 break-words">{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator />

            {/* Add Comment */}
            <div className="p-4">
              {isAuthenticated ? (
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none border-2 border-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    size="icon"
                    className="h-auto"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-2">
                  <a href="/auth" className="text-primary hover:underline">Sign in</a> to leave a comment
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
