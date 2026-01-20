import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RaceSession {
  id: string;
  host_id: string;
  name: string;
  status: "waiting" | "racing" | "finished";
  max_players: number;
  race_distance: number;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface RaceParticipant {
  id: string;
  race_id: string;
  user_id: string;
  circuit_data: Record<string, unknown>;
  worm_name: string;
  position: number;
  finished_at: string | null;
  finish_rank: number | null;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function useWormRace(raceId?: string) {
  const { user } = useAuth();
  const [race, setRace] = useState<RaceSession | null>(null);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [myParticipant, setMyParticipant] = useState<RaceParticipant | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const participantsChannelRef = useRef<RealtimeChannel | null>(null);

  // Fetch race data
  const fetchRace = useCallback(async () => {
    if (!raceId) return;

    try {
      // Fetch race session
      const { data: raceData, error: raceError } = await supabase
        .from("race_sessions")
        .select("*")
        .eq("id", raceId)
        .maybeSingle();

      if (raceError) throw raceError;
      if (raceData) {
        setRace(raceData as RaceSession);
        setIsHost(raceData.host_id === user?.id);
      }

      // Fetch participants with profiles
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/race_participants?race_id=eq.${raceId}&select=*,profiles(display_name,avatar_url)`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const participantsData = await response.json();
        setParticipants(participantsData || []);
        
        const mine = participantsData?.find((p: RaceParticipant) => p.user_id === user?.id);
        setMyParticipant(mine || null);
      }
    } catch (error) {
      console.error("Error fetching race:", error);
    } finally {
      setLoading(false);
    }
  }, [raceId, user?.id]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!raceId) return;

    fetchRace();

    // Subscribe to race session changes
    const raceChannel = supabase
      .channel(`race:${raceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'race_sessions',
          filter: `id=eq.${raceId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRace(payload.new as RaceSession);
          }
        }
      )
      .subscribe();

    channelRef.current = raceChannel;

    // Subscribe to participants changes
    const participantsChannel = supabase
      .channel(`race-participants:${raceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'race_participants',
          filter: `race_id=eq.${raceId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Re-fetch to get profile data
            await fetchRace();
          } else if (payload.eventType === 'DELETE') {
            setParticipants((prev) => 
              prev.filter((p) => p.id !== (payload.old as RaceParticipant).id)
            );
          }
        }
      )
      .subscribe();

    participantsChannelRef.current = participantsChannel;

    return () => {
      raceChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  }, [raceId, fetchRace]);

  // Create a new race
  const createRace = async (name: string, maxPlayers: number = 4): Promise<string | null> => {
    if (!user) {
      toast.error("Please sign in to create a race");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("race_sessions")
        .insert({
          host_id: user.id,
          name,
          max_players: maxPlayers,
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Race created!");
      return data.id;
    } catch (error) {
      console.error("Error creating race:", error);
      toast.error("Failed to create race");
      return null;
    }
  };

  // Join a race
  const joinRace = async (circuitData: Record<string, unknown>, wormName: string) => {
    if (!user || !raceId) {
      toast.error("Please sign in to join a race");
      return false;
    }

    try {
      const { error } = await supabase
        .from("race_participants")
        .insert({
          race_id: raceId,
          user_id: user.id,
          circuit_data: circuitData,
          worm_name: wormName,
        } as any);

      if (error) throw error;
      
      toast.success("Joined race!");
      await fetchRace();
      return true;
    } catch (error) {
      console.error("Error joining race:", error);
      toast.error("Failed to join race");
      return false;
    }
  };

  // Leave a race
  const leaveRace = async () => {
    if (!user || !raceId) return;

    try {
      const { error } = await supabase
        .from("race_participants")
        .delete()
        .eq("race_id", raceId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setMyParticipant(null);
      toast.success("Left race");
    } catch (error) {
      console.error("Error leaving race:", error);
      toast.error("Failed to leave race");
    }
  };

  // Start the race (host only)
  const startRace = async () => {
    if (!user || !raceId || !isHost) return;

    try {
      const { error } = await supabase
        .from("race_sessions")
        .update({ 
          status: "racing",
          started_at: new Date().toISOString()
        })
        .eq("id", raceId);

      if (error) throw error;
      
      toast.success("Race started!");
    } catch (error) {
      console.error("Error starting race:", error);
      toast.error("Failed to start race");
    }
  };

  // Update position during race
  const updatePosition = async (position: number) => {
    if (!user || !raceId || !myParticipant) return;

    try {
      await supabase
        .from("race_participants")
        .update({ position })
        .eq("id", myParticipant.id);
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  // Finish race
  const finishRace = async () => {
    if (!user || !raceId || !myParticipant) return;

    try {
      // Get current finish rank
      const finishedCount = participants.filter((p) => p.finished_at).length;
      
      await supabase
        .from("race_participants")
        .update({ 
          finished_at: new Date().toISOString(),
          finish_rank: finishedCount + 1
        })
        .eq("id", myParticipant.id);

      toast.success(`You finished in position ${finishedCount + 1}!`);
    } catch (error) {
      console.error("Error finishing race:", error);
    }
  };

  // Fetch available races
  const fetchAvailableRaces = async (): Promise<RaceSession[]> => {
    try {
      const { data, error } = await supabase
        .from("race_sessions")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data as RaceSession[]) || [];
    } catch (error) {
      console.error("Error fetching races:", error);
      return [];
    }
  };

  return {
    race,
    participants,
    loading,
    isHost,
    myParticipant,
    createRace,
    joinRace,
    leaveRace,
    startRace,
    updatePosition,
    finishRace,
    fetchAvailableRaces,
    refetch: fetchRace,
  };
}
