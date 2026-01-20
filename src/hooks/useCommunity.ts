import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export interface SharedCircuit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  circuit_data: {
    neurons: Array<{ id: string; x: number; y: number }>;
    connections: Array<{ from: string; to: string; type: string }>;
  };
  behavior: string;
  neurons_used: string[];
  tags: string[] | null;
  likes_count: number;
  views_count: number;
  is_featured: boolean;
  github_pr_url: string | null;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export interface CircuitComment {
  id: string;
  user_id: string;
  circuit_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function useCommunity() {
  const { user } = useAuth();
  const [circuits, setCircuits] = useState<SharedCircuit[]>([]);
  const [featuredCircuits, setFeaturedCircuits] = useState<SharedCircuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  // Fetch all shared circuits
  const fetchCircuits = useCallback(async () => {
    try {
      const { data: circuitsData, error: circuitsError } = await supabase
        .from("shared_circuits")
        .select("*")
        .order("created_at", { ascending: false });

      if (circuitsError) throw circuitsError;
      
      // Fetch profiles separately
      const userIds = [...new Set(circuitsData?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }]) || []
      );

      const typedData = (circuitsData || []).map(item => ({
        ...item,
        circuit_data: item.circuit_data as SharedCircuit['circuit_data'],
        profiles: profilesMap.get(item.user_id) || { display_name: 'Unknown', avatar_url: null }
      }));
      
      setCircuits(typedData);
      setFeaturedCircuits(typedData.filter((c) => c.is_featured));
    } catch (error) {
      console.error("Error fetching circuits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's likes
  const fetchUserLikes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("circuit_likes")
        .select("circuit_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserLikes(new Set(data?.map((l) => l.circuit_id) || []));
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchCircuits();
  }, [fetchCircuits]);

  useEffect(() => {
    fetchUserLikes();
  }, [fetchUserLikes]);

  // Share a circuit
  const shareCircuit = async (circuit: {
    title: string;
    description?: string;
    circuit_data: SharedCircuit['circuit_data'];
    behavior: string;
    neurons_used: string[];
    tags?: string[];
    forked_from?: string;
  }) => {
    if (!user) {
      toast.error("Please sign in to share circuits");
      return { error: new Error("Not authenticated") };
    }

    try {
      const { data, error } = await supabase
        .from("shared_circuits")
        .insert({
          user_id: user.id,
          title: circuit.title,
          description: circuit.description,
          circuit_data: circuit.circuit_data,
          behavior: circuit.behavior,
          neurons_used: circuit.neurons_used,
          tags: circuit.tags,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Circuit shared with the community! 🎉");
      await fetchCircuits();
      return { data, error: null };
    } catch (error) {
      toast.error("Failed to share circuit");
      return { error };
    }
  };

  // Fork a circuit to create your own version
  const forkCircuit = async (circuitId: string) => {
    if (!user) {
      toast.error("Please sign in to fork circuits");
      return { error: new Error("Not authenticated"), data: null };
    }

    try {
      // Find the original circuit
      const original = circuits.find(c => c.id === circuitId);
      if (!original) {
        toast.error("Circuit not found");
        return { error: new Error("Circuit not found"), data: null };
      }

      // Create a forked copy
      const { data, error } = await supabase
        .from("shared_circuits")
        .insert({
          user_id: user.id,
          title: `${original.title} (Fork)`,
          description: `Forked from ${original.profiles?.display_name || 'Unknown'}'s creation.\n\n${original.description || ''}`,
          circuit_data: original.circuit_data,
          behavior: original.behavior,
          neurons_used: original.neurons_used,
          tags: [...(original.tags || []), 'forked'],
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Circuit forked! You can now edit your own copy.");
      await fetchCircuits();
      return { data, error: null };
    } catch (error) {
      console.error("Error forking circuit:", error);
      toast.error("Failed to fork circuit");
      return { error, data: null };
    }
  };

  // Update an existing circuit
  const updateCircuit = async (
    circuitId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      circuit_data?: SharedCircuit['circuit_data'];
      behavior?: string;
      neurons_used?: string[];
    }
  ) => {
    if (!user) {
      toast.error("Please sign in to update circuits");
      return { error: new Error("Not authenticated"), data: null };
    }

    try {
      // Verify ownership
      const circuit = circuits.find(c => c.id === circuitId);
      if (!circuit || circuit.user_id !== user.id) {
        toast.error("You can only edit your own circuits");
        return { error: new Error("Not authorized"), data: null };
      }

      const { data, error } = await supabase
        .from("shared_circuits")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", circuitId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Circuit updated successfully!");
      await fetchCircuits();
      return { data, error: null };
    } catch (error) {
      console.error("Error updating circuit:", error);
      toast.error("Failed to update circuit");
      return { error, data: null };
    }
  };

  // Delete a circuit
  const deleteCircuit = async (circuitId: string) => {
    if (!user) {
      toast.error("Please sign in to delete circuits");
      return { error: new Error("Not authenticated") };
    }

    try {
      const { error } = await supabase
        .from("shared_circuits")
        .delete()
        .eq("id", circuitId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Circuit deleted");
      await fetchCircuits();
      return { error: null };
    } catch (error) {
      console.error("Error deleting circuit:", error);
      toast.error("Failed to delete circuit");
      return { error };
    }
  };

  // Like a circuit
  const likeCircuit = async (circuitId: string) => {
    if (!user) {
      toast.error("Please sign in to like circuits");
      return;
    }

    const isLiked = userLikes.has(circuitId);

    try {
      if (isLiked) {
        await supabase
          .from("circuit_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("circuit_id", circuitId);

        setUserLikes((prev) => {
          const next = new Set(prev);
          next.delete(circuitId);
          return next;
        });
      } else {
        await supabase.from("circuit_likes").insert({
          user_id: user.id,
          circuit_id: circuitId,
        });

        setUserLikes((prev) => new Set(prev).add(circuitId));
      }

      // Refresh to get updated counts
      await fetchCircuits();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Add a comment
  const addComment = async (circuitId: string, content: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      return { error: new Error("Not authenticated") };
    }

    try {
      const { error } = await supabase.from("circuit_comments").insert({
        user_id: user.id,
        circuit_id: circuitId,
        content,
      });

      if (error) throw error;
      toast.success("Comment added!");
      return { error: null };
    } catch (error) {
      toast.error("Failed to add comment");
      return { error };
    }
  };

  // Fetch comments for a circuit
  const fetchComments = async (circuitId: string): Promise<CircuitComment[]> => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("circuit_comments")
        .select("*")
        .eq("circuit_id", circuitId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch profiles separately
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }]) || []
      );

      return (commentsData || []).map(item => ({
        ...item,
        profiles: profilesMap.get(item.user_id) || { display_name: 'Unknown', avatar_url: null }
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  // Generate GitHub PR template
  const generateGitHubPRTemplate = (circuit: SharedCircuit) => {
    const template = `## New Circuit Contribution: ${circuit.title}

### Description
${circuit.description || "A new neural circuit for C. elegans simulation."}

### Behavior
\`${circuit.behavior}\`

### Neurons Used
${circuit.neurons_used.map((n) => `- ${n}`).join("\n")}

### Circuit Data
\`\`\`json
${JSON.stringify(circuit.circuit_data, null, 2)}
\`\`\`

### Tested In
- [x] NeuroQuest Web Simulator
- [ ] OpenWorm c302
- [ ] Sibernetic

### Related Issues
<!-- Link any related issues here -->

---
*This circuit was created with NeuroQuest and contributed to the OpenWorm project.*
`;

    return template;
  };

  return {
    circuits,
    featuredCircuits,
    loading,
    userLikes,
    shareCircuit,
    forkCircuit,
    updateCircuit,
    deleteCircuit,
    likeCircuit,
    addComment,
    fetchComments,
    generateGitHubPRTemplate,
    refresh: fetchCircuits,
  };
}
