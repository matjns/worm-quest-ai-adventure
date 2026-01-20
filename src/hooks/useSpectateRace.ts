import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { RaceSession, RaceParticipant } from "./useWormRace";

export function useSpectateRace(raceId?: string) {
  const [race, setRace] = useState<RaceSession | null>(null);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRaces, setActiveRaces] = useState<RaceSession[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const participantsChannelRef = useRef<RealtimeChannel | null>(null);

  // Fetch race data for spectating
  const fetchRace = async () => {
    if (!raceId) return;

    try {
      const { data: raceData, error: raceError } = await supabase
        .from("race_sessions")
        .select("*")
        .eq("id", raceId)
        .maybeSingle();

      if (raceError) throw raceError;
      if (raceData) {
        setRace(raceData as RaceSession);
      }

      // Fetch participants with profiles
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/race_participants?race_id=eq.${raceId}&select=*,profiles(display_name,avatar_url)`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      
      if (response.ok) {
        const participantsData = await response.json();
        setParticipants(participantsData || []);
      }
    } catch (error) {
      console.error("Error fetching race for spectating:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set up realtime subscriptions for spectating
  useEffect(() => {
    if (!raceId) return;

    fetchRace();

    // Subscribe to race session changes
    const raceChannel = supabase
      .channel(`spectate-race:${raceId}`)
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

    // Subscribe to participants changes for real-time positions
    const participantsChannel = supabase
      .channel(`spectate-participants:${raceId}`)
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
  }, [raceId]);

  // Fetch active races that can be spectated (racing status)
  const fetchActiveRaces = async (): Promise<RaceSession[]> => {
    try {
      const { data, error } = await supabase
        .from("race_sessions")
        .select("*")
        .eq("status", "racing")
        .order("started_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      const races = (data as RaceSession[]) || [];
      setActiveRaces(races);
      return races;
    } catch (error) {
      console.error("Error fetching active races:", error);
      return [];
    }
  };

  // Subscribe to new racing sessions for spectator list
  useEffect(() => {
    fetchActiveRaces();

    const channel = supabase
      .channel('active-races-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'race_sessions',
        },
        () => {
          fetchActiveRaces();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    race,
    participants,
    loading,
    activeRaces,
    fetchActiveRaces,
    refetch: fetchRace,
  };
}
