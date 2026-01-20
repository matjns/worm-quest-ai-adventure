import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Collaborator {
  odid: string;
  odname: string;
  color: string;
  odcursor: { x: number; y: number } | null;
  odavatar?: string;
}

export interface SyncedNeuron {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  connections: string[];
  createdBy: string;
}

interface CollaborativeState {
  neurons: SyncedNeuron[];
  version: number;
}

const COLLABORATOR_COLORS = [
  'hsl(340, 80%, 60%)', // Pink
  'hsl(200, 80%, 60%)', // Blue
  'hsl(140, 70%, 50%)', // Green
  'hsl(280, 70%, 60%)', // Purple
  'hsl(30, 90%, 55%)',  // Orange
  'hsl(180, 70%, 50%)', // Cyan
];

const getRandomName = () => {
  const adjectives = ['Curious', 'Clever', 'Creative', 'Brilliant', 'Swift', 'Wise'];
  const nouns = ['Neuron', 'Synapse', 'Explorer', 'Builder', 'Scientist', 'Thinker'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

export function useCollaborativeSandbox(roomId: string) {
  const [collaborators, setCollaborators] = useState<Map<string, Collaborator>>(new Map());
  const [neurons, setNeurons] = useState<SyncedNeuron[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [myId] = useState(() => crypto.randomUUID());
  const [myName] = useState(() => getRandomName());
  const [myColor] = useState(() => COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)]);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateVersionRef = useRef(0);

  // Initialize channel and presence
  useEffect(() => {
    const channel = supabase.channel(`collab-sandbox-${roomId}`, {
      config: {
        presence: { key: myId },
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const newCollaborators = new Map<string, Collaborator>();
      
      Object.entries(state).forEach(([odid, presences]) => {
        const presence = (presences as any[])[0];
        if (presence && odid !== myId) {
          newCollaborators.set(odid, {
            odid,
            odname: presence.odname || 'Anonymous',
            color: presence.color || COLLABORATOR_COLORS[0],
            odcursor: presence.odcursor || null,
            odavatar: presence.odavatar,
          });
        }
      });
      
      setCollaborators(newCollaborators);
    });

    // Handle join
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      if (key !== myId) {
        const presence = newPresences[0] as any;
        toast.info(`${presence?.odname || 'Someone'} joined the sandbox! 🧠`);
      }
    });

    // Handle leave
    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      const presence = leftPresences[0] as any;
      if (key !== myId) {
        toast.info(`${presence?.odname || 'Someone'} left the sandbox`);
      }
    });

    // Handle neuron broadcasts
    channel.on('broadcast', { event: 'neuron-add' }, ({ payload }) => {
      setNeurons(prev => {
        if (prev.some(n => n.id === payload.neuron.id)) return prev;
        return [...prev, payload.neuron];
      });
    });

    channel.on('broadcast', { event: 'neuron-remove' }, ({ payload }) => {
      setNeurons(prev => prev.filter(n => n.id !== payload.neuronId));
    });

    channel.on('broadcast', { event: 'neuron-connect' }, ({ payload }) => {
      setNeurons(prev => prev.map(n => {
        if (n.id === payload.fromId && !n.connections.includes(payload.toId)) {
          return { ...n, connections: [...n.connections, payload.toId] };
        }
        return n;
      }));
    });

    channel.on('broadcast', { event: 'state-sync' }, ({ payload }) => {
      if (payload.version > stateVersionRef.current) {
        stateVersionRef.current = payload.version;
        setNeurons(payload.neurons);
      }
    });

    channel.on('broadcast', { event: 'clear-canvas' }, () => {
      setNeurons([]);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        await channel.track({
          odname: myName,
          color: myColor,
          odcursor: null,
          joined_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, myId, myName, myColor]);

  // Update cursor position
  const updateCursor = useCallback(async (x: number, y: number) => {
    if (!channelRef.current) return;
    
    await channelRef.current.track({
      odname: myName,
      color: myColor,
      odcursor: { x, y },
    });
  }, [myName, myColor]);

  // Add neuron
  const addNeuron = useCallback((neuron: Omit<SyncedNeuron, 'createdBy'>) => {
    const newNeuron: SyncedNeuron = { ...neuron, createdBy: myId };
    
    setNeurons(prev => [...prev, newNeuron]);
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'neuron-add',
      payload: { neuron: newNeuron },
    });
  }, [myId]);

  // Remove neuron
  const removeNeuron = useCallback((neuronId: string) => {
    setNeurons(prev => prev.filter(n => n.id !== neuronId));
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'neuron-remove',
      payload: { neuronId },
    });
  }, []);

  // Connect neurons
  const connectNeurons = useCallback((fromId: string, toId: string) => {
    setNeurons(prev => prev.map(n => {
      if (n.id === fromId && !n.connections.includes(toId)) {
        return { ...n, connections: [...n.connections, toId] };
      }
      return n;
    }));
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'neuron-connect',
      payload: { fromId, toId },
    });
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    setNeurons([]);
    
    channelRef.current?.send({
      type: 'broadcast',
      event: 'clear-canvas',
      payload: {},
    });
  }, []);

  // Request state sync (for new joiners)
  const requestSync = useCallback(() => {
    stateVersionRef.current += 1;
    channelRef.current?.send({
      type: 'broadcast',
      event: 'state-sync',
      payload: { neurons, version: stateVersionRef.current },
    });
  }, [neurons]);

  return {
    collaborators,
    neurons,
    isConnected,
    myId,
    myName,
    myColor,
    updateCursor,
    addNeuron,
    removeNeuron,
    connectNeurons,
    clearCanvas,
    requestSync,
  };
}
