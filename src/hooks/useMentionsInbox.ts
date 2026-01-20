import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface MentionAnnotation {
  id: string;
  circuit_id: string;
  neuron_id: string;
  content: string;
  color: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  } | null;
  shared_circuits: {
    id: string;
    title: string;
  } | null;
}

export function useMentionsInbox() {
  const { user } = useAuth();
  const [mentions, setMentions] = useState<MentionAnnotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentions = useCallback(async () => {
    if (!user) {
      setMentions([]);
      setLoading(false);
      return;
    }

    try {
      // Get user's display name to search for mentions
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      if (!profile?.display_name) {
        setMentions([]);
        setLoading(false);
        return;
      }

      // Search for annotations that mention this user
      // Using ilike to find @username patterns
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/circuit_annotations?content=ilike.*@${encodeURIComponent(profile.display_name)}*&select=*,profiles(display_name,avatar_url),shared_circuits(id,title)&order=created_at.desc&limit=50`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch mentions');
      
      const data: MentionAnnotation[] = await response.json();
      
      // Filter to only include annotations from other users
      const filteredData = data.filter(m => m.user_id !== user.id);
      setMentions(filteredData);
    } catch (error) {
      console.error("Error fetching mentions:", error);
      setMentions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("mentions-inbox")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "circuit_annotations",
        },
        () => {
          // Refetch when new annotations are added
          fetchMentions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMentions]);

  return {
    mentions,
    loading,
    refresh: fetchMentions,
  };
}
