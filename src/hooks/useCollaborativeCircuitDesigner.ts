import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NeuronData, ConnectionData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  isActive: boolean;
}

interface CollaborativeState {
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
}

interface CircuitAction {
  type: string;
  userId: string;
  neuron?: PlacedNeuron;
  neuronId?: string;
  x?: number;
  y?: number;
  connection?: DesignerConnection;
  connectionId?: string;
  state?: CollaborativeState;
}

const COLLABORATOR_COLORS = [
  "hsl(217, 91%, 60%)", // Blue
  "hsl(142, 76%, 36%)", // Green
  "hsl(280, 65%, 50%)", // Purple
  "hsl(25, 95%, 53%)",  // Orange
  "hsl(340, 82%, 52%)", // Pink
  "hsl(45, 100%, 50%)", // Yellow
];

export function useCollaborativeCircuitDesigner(roomId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [sharedNeurons, setSharedNeurons] = useState<PlacedNeuron[]>([]);
  const [sharedConnections, setSharedConnections] = useState<DesignerConnection[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const colorIndexRef = useRef(0);

  // Generate a random user ID and name for this session
  useEffect(() => {
    const randomId = `user_${Math.random().toString(36).substr(2, 9)}`;
    const adjectives = ["Happy", "Swift", "Clever", "Bright", "Bold"];
    const nouns = ["Neuron", "Synapse", "Worm", "Circuit", "Signal"];
    const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    setCurrentUserId(randomId);
    setCurrentUserName(randomName);
  }, []);

  // Connect to collaborative room
  useEffect(() => {
    if (!roomId || !currentUserId) return;

    const channel = supabase.channel(`circuit-room-${roomId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channelRef.current = channel;

    // Handle presence sync
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users: Collaborator[] = [];
      
      Object.entries(state).forEach(([key, presences]) => {
        if (key !== currentUserId && presences.length > 0) {
          const presence = presences[0] as unknown as { name?: string; color?: string; cursor?: { x: number; y: number } };
          users.push({
            id: key,
            name: presence.name || "Anonymous",
            color: presence.color || COLLABORATOR_COLORS[0],
            cursor: presence.cursor || null,
            isActive: true,
          });
        }
      });
      
      setCollaborators(users);
    });

    // Handle presence join
    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      if (key !== currentUserId) {
        const presence = newPresences[0] as unknown as { name?: string };
        toast.info(`${presence?.name || "Someone"} joined the room`);
      }
    });

    // Handle presence leave
    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      const presence = leftPresences[0] as unknown as { name?: string };
      toast.info(`${presence?.name || "Someone"} left the room`);
    });

    // Handle broadcast messages (circuit actions)
    channel.on("broadcast", { event: "circuit_action" }, ({ payload }) => {
      const action = payload as CircuitAction;
      
      // Ignore our own actions
      if (action.userId === currentUserId) return;

      switch (action.type) {
        case "add_neuron":
          if (action.neuron) {
            setSharedNeurons(prev => {
              if (prev.find(n => n.id === action.neuron!.id)) return prev;
              return [...prev, action.neuron!];
            });
          }
          break;
          
        case "remove_neuron":
          if (action.neuronId) {
            setSharedNeurons(prev => prev.filter(n => n.id !== action.neuronId));
            setSharedConnections(prev => 
              prev.filter(c => c.from !== action.neuronId && c.to !== action.neuronId)
            );
          }
          break;
          
        case "move_neuron":
          if (action.neuronId && action.x !== undefined && action.y !== undefined) {
            setSharedNeurons(prev =>
              prev.map(n =>
                n.id === action.neuronId ? { ...n, x: action.x!, y: action.y! } : n
              )
            );
          }
          break;
          
        case "add_connection":
          if (action.connection) {
            setSharedConnections(prev => {
              if (prev.find(c => c.id === action.connection!.id)) return prev;
              return [...prev, action.connection!];
            });
          }
          break;
          
        case "remove_connection":
          if (action.connectionId) {
            setSharedConnections(prev => 
              prev.filter(c => c.id !== action.connectionId)
            );
          }
          break;
          
        case "cursor_move":
          if (action.x !== undefined && action.y !== undefined) {
            setCollaborators(prev =>
              prev.map(c =>
                c.id === action.userId
                  ? { ...c, cursor: { x: action.x!, y: action.y! } }
                  : c
              )
            );
          }
          break;
          
        case "sync_state":
          if (action.state) {
            setSharedNeurons(action.state.neurons);
            setSharedConnections(action.state.connections);
          }
          break;
      }
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        const userColor = COLLABORATOR_COLORS[colorIndexRef.current % COLLABORATOR_COLORS.length];
        colorIndexRef.current++;
        
        await channel.track({
          name: currentUserName,
          color: userColor,
          cursor: null,
          online_at: new Date().toISOString(),
        });
        
        toast.success(`Connected to collaborative room: ${roomId}`);
      }
    });

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [roomId, currentUserId, currentUserName]);

  // Broadcast action to other users
  const broadcastAction = useCallback((action: Omit<CircuitAction, "userId">) => {
    if (!channelRef.current || !isConnected) return;

    channelRef.current.send({
      type: "broadcast",
      event: "circuit_action",
      payload: { ...action, userId: currentUserId },
    });
  }, [isConnected, currentUserId]);

  // Add neuron (local + broadcast)
  const addNeuron = useCallback((neuron: PlacedNeuron) => {
    setSharedNeurons(prev => {
      if (prev.find(n => n.id === neuron.id)) return prev;
      return [...prev, neuron];
    });
    broadcastAction({ type: "add_neuron", neuron });
  }, [broadcastAction]);

  // Remove neuron (local + broadcast)
  const removeNeuron = useCallback((neuronId: string) => {
    setSharedNeurons(prev => prev.filter(n => n.id !== neuronId));
    setSharedConnections(prev => 
      prev.filter(c => c.from !== neuronId && c.to !== neuronId)
    );
    broadcastAction({ type: "remove_neuron", neuronId });
  }, [broadcastAction]);

  // Move neuron (local + broadcast)
  const moveNeuron = useCallback((neuronId: string, x: number, y: number) => {
    setSharedNeurons(prev =>
      prev.map(n => (n.id === neuronId ? { ...n, x, y } : n))
    );
    broadcastAction({ type: "move_neuron", neuronId, x, y });
  }, [broadcastAction]);

  // Add connection (local + broadcast)
  const addConnection = useCallback((connection: DesignerConnection) => {
    setSharedConnections(prev => {
      if (prev.find(c => c.id === connection.id)) return prev;
      return [...prev, connection];
    });
    broadcastAction({ type: "add_connection", connection });
  }, [broadcastAction]);

  // Remove connection (local + broadcast)
  const removeConnection = useCallback((connectionId: string) => {
    setSharedConnections(prev => prev.filter(c => c.id !== connectionId));
    broadcastAction({ type: "remove_connection", connectionId });
  }, [broadcastAction]);

  // Update cursor position
  const updateCursor = useCallback((x: number, y: number) => {
    if (!channelRef.current || !isConnected) return;
    
    channelRef.current.track({
      name: currentUserName,
      color: COLLABORATOR_COLORS[colorIndexRef.current % COLLABORATOR_COLORS.length],
      cursor: { x, y },
      online_at: new Date().toISOString(),
    });
  }, [isConnected, currentUserName]);

  // Sync full state to new joiners
  const syncState = useCallback(() => {
    broadcastAction({
      type: "sync_state",
      state: { neurons: sharedNeurons, connections: sharedConnections },
    });
  }, [sharedNeurons, sharedConnections, broadcastAction]);

  // Clear all
  const clearAll = useCallback(() => {
    setSharedNeurons([]);
    setSharedConnections([]);
    broadcastAction({ type: "sync_state", state: { neurons: [], connections: [] } });
  }, [broadcastAction]);

  // Set state from template
  const loadFromTemplate = useCallback((neurons: PlacedNeuron[], connections: DesignerConnection[]) => {
    setSharedNeurons(neurons);
    setSharedConnections(connections);
    broadcastAction({ type: "sync_state", state: { neurons, connections } });
  }, [broadcastAction]);

  return {
    isConnected,
    collaborators,
    neurons: sharedNeurons,
    connections: sharedConnections,
    currentUserId,
    currentUserName,
    addNeuron,
    removeNeuron,
    moveNeuron,
    addConnection,
    removeConnection,
    updateCursor,
    syncState,
    clearAll,
    loadFromTemplate,
    setNeurons: setSharedNeurons,
    setConnections: setSharedConnections,
  };
}
