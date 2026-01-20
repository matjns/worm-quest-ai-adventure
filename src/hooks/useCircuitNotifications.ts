import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Heart, MessageCircle } from "lucide-react";
import { createElement } from "react";

interface LikePayload {
  id: string;
  circuit_id: string;
  user_id: string;
  created_at: string;
}

interface CommentPayload {
  id: string;
  circuit_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function useCircuitNotifications() {
  const { user } = useAuth();
  const userCircuitIds = useRef<Set<string>>(new Set());

  // Fetch user's circuit IDs
  const fetchUserCircuits = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("shared_circuits")
      .select("id")
      .eq("user_id", user.id);

    if (!error && data) {
      userCircuitIds.current = new Set(data.map((c) => c.id));
    }
  }, [user]);

  // Get user profile for notification
  const getUserDisplayName = useCallback(async (userId: string): Promise<string> => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();

    return data?.display_name || "Someone";
  }, []);

  // Get circuit title for notification
  const getCircuitTitle = useCallback(async (circuitId: string): Promise<string> => {
    const { data } = await supabase
      .from("shared_circuits")
      .select("title")
      .eq("id", circuitId)
      .maybeSingle();

    return data?.title || "your circuit";
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchUserCircuits();

    // Subscribe to likes on user's circuits
    const likesChannel = supabase
      .channel("circuit-likes-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "circuit_likes",
        },
        async (payload) => {
          const like = payload.new as LikePayload;
          
          // Only notify if it's for user's circuit and not from themselves
          if (userCircuitIds.current.has(like.circuit_id) && like.user_id !== user.id) {
            const [userName, circuitTitle] = await Promise.all([
              getUserDisplayName(like.user_id),
              getCircuitTitle(like.circuit_id),
            ]);

            toast.success(`${userName} liked "${circuitTitle}"`, {
              icon: createElement(Heart, { className: "w-4 h-4 fill-primary text-primary" }),
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to comments on user's circuits
    const commentsChannel = supabase
      .channel("circuit-comments-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "circuit_comments",
        },
        async (payload) => {
          const comment = payload.new as CommentPayload;
          
          // Only notify if it's for user's circuit and not from themselves
          if (userCircuitIds.current.has(comment.circuit_id) && comment.user_id !== user.id) {
            const [userName, circuitTitle] = await Promise.all([
              getUserDisplayName(comment.user_id),
              getCircuitTitle(comment.circuit_id),
            ]);

            toast.success(`${userName} commented on "${circuitTitle}"`, {
              description: comment.content.length > 50 
                ? comment.content.slice(0, 50) + "..." 
                : comment.content,
              icon: createElement(MessageCircle, { className: "w-4 h-4 text-primary" }),
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, fetchUserCircuits, getUserDisplayName, getCircuitTitle]);

  // Refresh circuit IDs when circuits change
  const refreshCircuits = useCallback(() => {
    fetchUserCircuits();
  }, [fetchUserCircuits]);

  return { refreshCircuits };
}
