import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  X,
  Loader2,
  Users,
  Wifi,
  WifiOff,
  AtSign,
  CheckCircle2,
  Circle,
  CheckCheck,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MentionInput, parseMentions } from "./MentionInput";
import { findMentionedUserIds, notifyMentionedUsers } from "@/utils/mentionNotifications";
import { AnnotationThread } from "./AnnotationThread";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Annotation {
  id: string;
  circuit_id: string;
  neuron_id: string;
  content: string;
  x_offset: number;
  y_offset: number;
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

interface PresenceUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
  selectedNeuron: string | null;
  online_at: string;
}

interface Neuron {
  id: string;
  x: number;
  y: number;
  type?: string;
}

interface CircuitAnnotationsProps {
  circuitId: string;
  circuitOwnerId?: string;
  neurons: Neuron[];
  viewBox: { width: number; height: number };
  padding?: number;
  readOnly?: boolean;
  className?: string;
}

const annotationColors = [
  { id: "default", color: "hsl(var(--primary))", label: "Default" },
  { id: "info", color: "hsl(var(--chart-1))", label: "Info" },
  { id: "warning", color: "hsl(var(--chart-4))", label: "Warning" },
  { id: "success", color: "hsl(var(--chart-2))", label: "Success" },
  { id: "question", color: "hsl(var(--chart-3))", label: "Question" },
];

// Generate consistent color for user based on their ID
const getUserColor = (userId: string) => {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function CircuitAnnotations({
  circuitId,
  circuitOwnerId,
  neurons,
  viewBox,
  padding = 30,
  readOnly = false,
  className,
}: CircuitAnnotationsProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNeuron, setSelectedNeuron] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [newColor, setNewColor] = useState("default");
  const [saving, setSaving] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hideResolved, setHideResolved] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [lastResolvedIds, setLastResolvedIds] = useState<string[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  // Fetch annotations with profile data
  const fetchAnnotations = useCallback(async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?circuit_id=eq.${circuitId}&select=*,profiles(display_name,avatar_url)`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch annotations');
      
      const data: Annotation[] = await response.json();
      setAnnotations(data || []);
    } catch (error) {
      console.error("Error fetching annotations:", error);
    } finally {
      setLoading(false);
    }
  }, [circuitId]);

  // Set up real-time subscription for annotations
  useEffect(() => {
    fetchAnnotations();

    // Subscribe to annotation changes
    const channel = supabase
      .channel(`annotations:${circuitId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circuit_annotations',
          filter: `circuit_id=eq.${circuitId}`,
        },
        async (payload) => {
          console.log('Realtime annotation change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new annotation with profile data
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
            
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=eq.${payload.new.id}&select=*,profiles(display_name,avatar_url)`,
              {
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            if (response.ok) {
              const [newAnnotation] = await response.json();
              if (newAnnotation) {
                setAnnotations((prev) => {
                  // Avoid duplicates
                  if (prev.some((a) => a.id === newAnnotation.id)) return prev;
                  return [...prev, newAnnotation];
                });
                
                // Show toast for other users' annotations
                if (newAnnotation.user_id !== user?.id) {
                  toast({
                    title: "New Annotation",
                    description: `${newAnnotation.profiles?.display_name || 'Someone'} added a note to ${newAnnotation.neuron_id}`,
                  });
                }
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            setAnnotations((prev) =>
              prev.map((a) =>
                a.id === payload.new.id
                  ? { ...a, ...payload.new }
                  : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAnnotations((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        console.log('Annotation channel status:', status);
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [circuitId, fetchAnnotations, toast, user?.id]);

  // Set up presence channel for collaborative editing
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const presenceChannel = supabase.channel(`presence:${circuitId}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.values(state).forEach((presences) => {
          (presences as unknown as PresenceUser[]).forEach((presence) => {
            if (presence.id && presence.id !== user.id) {
              users.push(presence);
            }
          });
        });
        
        setPresenceUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', user.id)
            .single();

          await presenceChannel.track({
            id: user.id,
            display_name: profile?.display_name || 'Anonymous',
            avatar_url: profile?.avatar_url,
            selectedNeuron: null,
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [circuitId, isAuthenticated, user]);

  // Update presence when selected neuron changes
  useEffect(() => {
    if (!presenceChannelRef.current || !user) return;

    const updatePresence = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      await presenceChannelRef.current?.track({
        id: user.id,
        display_name: profile?.display_name || 'Anonymous',
        avatar_url: profile?.avatar_url,
        selectedNeuron,
        online_at: new Date().toISOString(),
      });
    };

    updatePresence();
  }, [selectedNeuron, user]);

  // Initial fetch
  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const handleAddAnnotation = async (neuronId: string) => {
    if (!newContent.trim() || !user) return;

    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            circuit_id: circuitId,
            neuron_id: neuronId,
            content: newContent.trim(),
            color: newColor,
            user_id: user.id,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to add annotation');

      // Parse mentions and notify users
      const mentions = parseMentions(newContent);
      if (mentions.length > 0) {
        const mentionedUsers = await findMentionedUserIds(mentions);
        
        // Get current user's display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        await notifyMentionedUsers({
          mentionedUserIds: mentionedUsers,
          actorId: user.id,
          actorName: profile?.display_name || 'Someone',
          circuitId,
          neuronId,
          annotationPreview: newContent.trim(),
        });
      }

      toast({
        title: "Annotation Added",
        description: mentions.length > 0 
          ? `Note added and ${mentions.length} user(s) notified`
          : `Note added to neuron ${neuronId}`,
      });

      setNewContent("");
      setNewColor("default");
      setSelectedNeuron(null);
      await fetchAnnotations();
    } catch (error) {
      console.error("Error adding annotation:", error);
      toast({
        title: "Error",
        description: "Failed to add annotation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle adding a reply to an annotation
  const handleAddReply = async (parentId: string, content: string) => {
    if (!content.trim() || !user) return;

    // Find the parent annotation to get neuron_id
    const parentAnnotation = annotations.find((a) => a.id === parentId);
    if (!parentAnnotation) return;

    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            circuit_id: circuitId,
            neuron_id: parentAnnotation.neuron_id,
            content: content.trim(),
            color: parentAnnotation.color, // Inherit parent color
            user_id: user.id,
            parent_id: parentId,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to add reply');

      // Get current user's display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const actorName = profile?.display_name || 'Someone';
      let notifiedCount = 0;

      // Notify the parent annotation author if different from current user
      if (parentAnnotation.user_id !== user.id) {
        const truncatedPreview = content.length > 50 ? content.slice(0, 50) + '...' : content;
        
        await supabase.from('notifications').insert({
          user_id: parentAnnotation.user_id,
          type: 'reply',
          title: `${actorName} replied to your annotation`,
          message: `On neuron ${parentAnnotation.neuron_id}: "${truncatedPreview}"`,
          circuit_id: circuitId,
          actor_id: user.id,
          read: false,
        });
        notifiedCount++;
      }

      // Parse mentions and notify mentioned users (excluding the parent author to avoid double notification)
      const mentions = parseMentions(content);
      
      if (mentions.length > 0) {
        const mentionedUsers = await findMentionedUserIds(mentions);
        // Filter out the parent author from mentions to avoid double notification
        const filteredMentionedUsers = mentionedUsers.filter(
          (u) => u.userId !== parentAnnotation.user_id
        );
        
        if (filteredMentionedUsers.length > 0) {
          await notifyMentionedUsers({
            mentionedUserIds: filteredMentionedUsers,
            actorId: user.id,
            actorName,
            circuitId,
            neuronId: parentAnnotation.neuron_id,
            annotationPreview: content.trim(),
          });
          notifiedCount += filteredMentionedUsers.length;
        }
      }

      toast({
        title: "Reply Added",
        description: notifiedCount > 0 
          ? `Reply added and ${notifiedCount} user(s) notified`
          : "Reply added successfully",
      });

      await fetchAnnotations();
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAnnotation = async (annotationId: string, content: string) => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=eq.${annotationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: content.trim() }),
        }
      );

      if (!response.ok) throw new Error('Failed to update annotation');

      toast({ title: "Annotation Updated" });
      await fetchAnnotations();
    } catch (error) {
      console.error("Error updating annotation:", error);
      toast({
        title: "Error",
        description: "Failed to update annotation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=eq.${annotationId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete annotation');

      toast({ title: "Annotation Deleted" });
      await fetchAnnotations();
    } catch (error) {
      console.error("Error deleting annotation:", error);
      toast({
        title: "Error",
        description: "Failed to delete annotation",
        variant: "destructive",
      });
    }
  };

  // Handle pinning/unpinning an annotation
  const handleTogglePin = async (annotationId: string, currentlyPinned: boolean) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=eq.${annotationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_pinned: !currentlyPinned }),
        }
      );

      if (!response.ok) throw new Error('Failed to update pin status');

      toast({ title: currentlyPinned ? "Annotation Unpinned" : "Annotation Pinned" });
      await fetchAnnotations();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast({
        title: "Error",
        description: "Failed to update pin status",
        variant: "destructive",
      });
    }
  };

  // Handle resolving/reopening an annotation thread
  const handleToggleResolve = async (annotationId: string, currentlyResolved: boolean) => {
    if (!user) return;
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const updateData = currentlyResolved
        ? { is_resolved: false, resolved_at: null, resolved_by: null }
        : { is_resolved: true, resolved_at: new Date().toISOString(), resolved_by: user.id };
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=eq.${annotationId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error('Failed to update resolve status');

      // Notify participants when resolving (not when reopening)
      if (!currentlyResolved) {
        const annotation = annotations.find((a) => a.id === annotationId);
        if (annotation) {
          // Get all replies to find participants
          const replies = annotations.filter((a) => a.parent_id === annotationId);
          
          // Collect unique participant IDs (author + repliers), excluding resolver
          const participantIds = new Set<string>();
          participantIds.add(annotation.user_id);
          replies.forEach((r) => participantIds.add(r.user_id));
          participantIds.delete(user.id); // Don't notify self
          
          // Get current user's display name
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .maybeSingle();
          
          const actorName = profile?.display_name || 'Someone';
          const truncatedContent = annotation.content.length > 40 
            ? annotation.content.slice(0, 40) + '...' 
            : annotation.content;
          
          // Create notifications for all participants
          if (participantIds.size > 0) {
            const notifications = Array.from(participantIds).map((participantId) => ({
              user_id: participantId,
              type: 'resolved',
              title: `${actorName} resolved a thread`,
              message: `"${truncatedContent}" on neuron ${annotation.neuron_id}`,
              circuit_id: circuitId,
              actor_id: user.id,
              read: false,
            }));
            
            await supabase.from('notifications').insert(notifications);
          }
        }
      }

      toast({ 
        title: currentlyResolved ? "Thread Reopened" : "Thread Resolved",
        description: currentlyResolved ? "This thread is now active again" : "This thread has been marked as resolved"
      });
      await fetchAnnotations();
    } catch (error) {
      console.error("Error toggling resolve:", error);
      toast({
        title: "Error",
        description: "Failed to update resolve status",
        variant: "destructive",
      });
    }
  };

  // Handle resolving all unresolved annotation threads (circuit owner only)
  const handleResolveAll = async () => {
    if (!user) return;
    
    const unresolvedIds = annotations
      .filter((a) => !a.parent_id && !a.is_resolved)
      .map((a) => a.id);
    
    if (unresolvedIds.length === 0) return;

    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      // Update all unresolved annotations
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=in.(${unresolvedIds.join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_resolved: true,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to resolve all threads');

      // Store IDs for undo and show undo option
      setLastResolvedIds(unresolvedIds);
      setShowUndo(true);
      
      // Clear any existing timeout
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      
      // Hide undo after 10 seconds
      undoTimeoutRef.current = setTimeout(() => {
        setShowUndo(false);
        setLastResolvedIds([]);
      }, 10000);

      toast({ 
        title: "All Threads Resolved",
        description: `${unresolvedIds.length} thread${unresolvedIds.length !== 1 ? 's' : ''} marked as resolved`
      });
      await fetchAnnotations();
    } catch (error) {
      console.error("Error resolving all:", error);
      toast({
        title: "Error",
        description: "Failed to resolve all threads",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Undo bulk resolve
  const handleUndoResolveAll = async () => {
    if (lastResolvedIds.length === 0 || !user) return;

    setSaving(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?id=in.(${lastResolvedIds.join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_resolved: false,
            resolved_at: null,
            resolved_by: null,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to undo resolve');

      // Clear undo state
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      setShowUndo(false);
      setLastResolvedIds([]);

      toast({ 
        title: "Undo Successful",
        description: `${lastResolvedIds.length} thread${lastResolvedIds.length !== 1 ? 's' : ''} reopened`
      });
      await fetchAnnotations();
    } catch (error) {
      console.error("Error undoing resolve:", error);
      toast({
        title: "Error",
        description: "Failed to undo resolve",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const getNeuronPosition = (neuron: Neuron) => ({
    x: (neuron.x / 100) * (viewBox.width - padding * 2) + padding,
    y: (neuron.y / 100) * (viewBox.height - padding * 2) + padding,
  });

  // Get top-level annotations for a neuron (no parent), sorted: unresolved pinned first, then unresolved, then resolved
  // Optionally filter out resolved based on hideResolved state
  const getAnnotationsForNeuron = useCallback((neuronId: string) =>
    annotations
      .filter((a) => a.neuron_id === neuronId && !a.parent_id)
      .filter((a) => !hideResolved || !a.is_resolved)
      .sort((a, b) => {
        // Resolved at end
        if (a.is_resolved && !b.is_resolved) return 1;
        if (!a.is_resolved && b.is_resolved) return -1;
        // Pinned first (among same resolved status)
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        // Then by date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }), [annotations, hideResolved]);

  // Count of resolved annotations (for badge display)
  const resolvedCount = useMemo(() => 
    annotations.filter((a) => !a.parent_id && a.is_resolved).length,
    [annotations]
  );

  const activeCount = useMemo(() => 
    annotations.filter((a) => !a.parent_id && !a.is_resolved).length,
    [annotations]
  );

  // Get replies for a specific annotation
  const getRepliesForAnnotation = (annotationId: string) =>
    annotations.filter((a) => a.parent_id === annotationId);

  const getColorValue = (colorId: string) =>
    annotationColors.find((c) => c.id === colorId)?.color || annotationColors[0].color;

  // Get users currently looking at a specific neuron
  const getUsersOnNeuron = (neuronId: string) =>
    presenceUsers.filter((u) => u.selectedNeuron === neuronId);

  return (
    <div className={cn("relative", className)}>
      {/* Header with controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        {/* Connection status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  isConnected
                    ? "bg-green-500/20 text-green-700 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isConnected
                ? "Real-time updates active"
                : "Connecting to live updates..."}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Active users */}
        {presenceUsers.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                  <Users className="w-3 h-3" />
                  <span>{presenceUsers.length}</span>
                  <div className="flex -space-x-2 ml-1">
                    {presenceUsers.slice(0, 3).map((u) => (
                      <Avatar
                        key={u.id}
                        className="w-5 h-5 border-2 border-background"
                      >
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback
                          className="text-[8px]"
                          style={{ backgroundColor: getUserColor(u.id) }}
                        >
                          {u.display_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {presenceUsers.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] border-2 border-background">
                        +{presenceUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium mb-1">Collaborators online:</p>
                <ul className="text-xs space-y-1">
                  {presenceUsers.map((u) => (
                    <li key={u.id} className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getUserColor(u.id) }}
                      />
                      {u.display_name}
                      {u.selectedNeuron && (
                        <span className="text-muted-foreground">
                          → {u.selectedNeuron}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Toggle button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showAnnotations ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
                className="gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                {activeCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showAnnotations ? "Hide annotations" : "Show annotations"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Resolved filter toggle */}
        {resolvedCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={hideResolved ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => setHideResolved(!hideResolved)}
                  className="gap-1"
                >
                  {hideResolved ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span className="text-xs">{resolvedCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {hideResolved 
                  ? `Show ${resolvedCount} resolved thread${resolvedCount !== 1 ? 's' : ''}`
                  : `Hide ${resolvedCount} resolved thread${resolvedCount !== 1 ? 's' : ''}`
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Mark all as resolved button - only for circuit owner when there are active threads */}
        {circuitOwnerId === user?.id && activeCount > 1 && !showUndo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolveAll}
                  disabled={saving}
                  className="gap-1"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline text-xs">Resolve All</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Resolve all {activeCount} active threads
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Undo button - shows temporarily after bulk resolve */}
        <AnimatePresence>
          {showUndo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleUndoResolveAll}
                      disabled={saving}
                      className="gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-400 border-amber-500/30"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Undo2 className="w-4 h-4" />
                      )}
                      <span className="text-xs">Undo</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Undo: Reopen {lastResolvedIds.length} thread{lastResolvedIds.length !== 1 ? 's' : ''}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SVG Overlay for annotation markers */}
      <AnimatePresence>
        {showAnnotations && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 5 }}
          >
            {neurons.map((neuron) => {
              const pos = getNeuronPosition(neuron);
              const neuronAnnotations = getAnnotationsForNeuron(neuron.id);
              const hasAnnotations = neuronAnnotations.length > 0;
              const usersOnNeuron = getUsersOnNeuron(neuron.id);

              return (
                <g key={`annotation-marker-${neuron.id}`} className="pointer-events-auto">
                  {/* Other users' cursors/presence on this neuron */}
                  {usersOnNeuron.length > 0 && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {/* Pulsing ring to show active editing */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={28}
                        fill="transparent"
                        stroke={getUserColor(usersOnNeuron[0].id)}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                      />
                      {/* User avatars around the neuron */}
                      {usersOnNeuron.slice(0, 3).map((u, idx) => {
                        const angle = (idx * 120 - 90) * (Math.PI / 180);
                        const avatarX = pos.x + Math.cos(angle) * 35;
                        const avatarY = pos.y + Math.sin(angle) * 35;
                        return (
                          <g key={u.id}>
                            <circle
                              cx={avatarX}
                              cy={avatarY}
                              r={10}
                              fill={getUserColor(u.id)}
                              stroke="hsl(var(--background))"
                              strokeWidth={2}
                            />
                            <text
                              x={avatarX}
                              y={avatarY + 3}
                              textAnchor="middle"
                              fill="hsl(var(--background))"
                              fontSize="8"
                              fontWeight="bold"
                            >
                              {u.display_name?.charAt(0).toUpperCase() || "?"}
                            </text>
                          </g>
                        );
                      })}
                    </motion.g>
                  )}

                  {/* Annotation indicator */}
                  {hasAnnotations && (
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <circle
                        cx={pos.x + 12}
                        cy={pos.y - 12}
                        r={10}
                        fill={getColorValue(neuronAnnotations[0].color)}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                      <text
                        x={pos.x + 12}
                        y={pos.y - 8}
                        textAnchor="middle"
                        fill="hsl(var(--background))"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {neuronAnnotations.length}
                      </text>
                    </motion.g>
                  )}

                  {/* Clickable area for adding annotations */}
                  {!readOnly && isAuthenticated && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={20}
                      fill="transparent"
                      className="cursor-pointer hover:fill-primary/10"
                      onClick={() => setSelectedNeuron(neuron.id)}
                    />
                  )}
                </g>
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Annotation popover for selected neuron */}
      {selectedNeuron && (
        <div
          className="absolute z-20"
          style={{
            left: `${((neurons.find((n) => n.id === selectedNeuron)?.x || 50) / 100) * 100}%`,
            top: `${((neurons.find((n) => n.id === selectedNeuron)?.y || 50) / 100) * 100}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-foreground rounded-lg shadow-lg p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Neuron: {selectedNeuron}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setSelectedNeuron(null);
                  setNewContent("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Existing annotations for this neuron */}
            {getAnnotationsForNeuron(selectedNeuron).length > 0 && (
              <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                {getAnnotationsForNeuron(selectedNeuron).map((annotation) => (
                  <AnnotationThread
                    key={annotation.id}
                    annotation={annotation}
                    replies={getRepliesForAnnotation(annotation.id)}
                    currentUserId={user?.id}
                    circuitOwnerId={circuitOwnerId}
                    isAuthenticated={isAuthenticated}
                    readOnly={readOnly}
                    getColorValue={getColorValue}
                    onEdit={handleUpdateAnnotation}
                    onDelete={handleDeleteAnnotation}
                    onReply={handleAddReply}
                    onTogglePin={handleTogglePin}
                    onToggleResolve={handleToggleResolve}
                    saving={saving}
                  />
                ))}
              </div>
            )}

            {/* Add new annotation */}
            {isAuthenticated && !readOnly && (
              <div className="space-y-2">
                <div className="relative">
                  <MentionInput
                    value={newContent}
                    onChange={setNewContent}
                    placeholder="Add a note... Use @ to mention users"
                    className="text-sm pr-8"
                  />
                  <AtSign className="absolute right-2 top-2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Color picker */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-1">Color:</span>
                  {annotationColors.map((color) => (
                    <TooltipProvider key={color.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "w-5 h-5 rounded-full border-2 transition-transform",
                              newColor === color.id
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: color.color }}
                            onClick={() => setNewColor(color.id)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{color.label}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>

                <Button
                  onClick={() => handleAddAnnotation(selectedNeuron)}
                  disabled={!newContent.trim() || saving}
                  className="w-full"
                  size="sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Plus className="w-4 h-4 mr-1" />
                  )}
                  Add Note
                </Button>
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground text-center">
                <a href="/auth" className="text-primary hover:underline">
                  Sign in
                </a>{" "}
                to add annotations
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
