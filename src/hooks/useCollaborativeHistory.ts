import { useState, useCallback, useRef, useEffect } from "react";
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

interface CollaborativeHistoryEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
  timestamp: number;
}

interface CollaborativeHistoryOptions {
  maxHistory?: number;
  roomId: string | null;
  currentUserId: string;
  currentUserName: string;
  onStateRestore: (neurons: PlacedNeuron[], connections: DesignerConnection[]) => void;
}

export function useCollaborativeHistory({
  maxHistory = 30,
  roomId,
  currentUserId,
  currentUserName,
  onStateRestore,
}: CollaborativeHistoryOptions) {
  const [history, setHistory] = useState<CollaborativeHistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [pendingConflict, setPendingConflict] = useState<{
    localAction: CollaborativeHistoryEntry;
    remoteAction: CollaborativeHistoryEntry;
  } | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isRestoringRef = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Connect to history channel
  useEffect(() => {
    if (!roomId || !currentUserId) return;

    const channel = supabase.channel(`circuit-history-${roomId}`);
    channelRef.current = channel;

    // Listen for history broadcasts from other users
    channel.on("broadcast", { event: "history_action" }, ({ payload }) => {
      const entry = payload as CollaborativeHistoryEntry;
      
      // Ignore own actions
      if (entry.userId === currentUserId) return;

      // Check for conflict - if we have unsaved local changes at same index
      const localLatest = history[currentIndex];
      if (localLatest && localLatest.timestamp > entry.timestamp - 1000 && localLatest.userId === currentUserId) {
        // Potential conflict - let user decide
        setPendingConflict({
          localAction: localLatest,
          remoteAction: entry,
        });
        return;
      }

      // Add remote action to history
      setHistory(prev => {
        const newHistory = [...prev.slice(0, currentIndex + 1), entry];
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory);
        }
        return newHistory;
      });
      setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));

      toast.info(`${entry.userName} made changes: ${entry.action}`);
    });

    // Listen for undo/redo broadcasts
    channel.on("broadcast", { event: "history_navigate" }, ({ payload }) => {
      const { userId, userName, direction, targetIndex, state } = payload as {
        userId: string;
        userName: string;
        direction: "undo" | "redo";
        targetIndex: number;
        state: { neurons: PlacedNeuron[]; connections: DesignerConnection[] };
      };

      if (userId === currentUserId) return;

      // Apply the state from the undo/redo
      isRestoringRef.current = true;
      onStateRestore(state.neurons, state.connections);
      setCurrentIndex(targetIndex);
      
      toast.info(`${userName} performed ${direction}`);
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomId, currentUserId, currentIndex, history, maxHistory, onStateRestore]);

  // Push a new state to collaborative history
  const pushState = useCallback(
    (neurons: PlacedNeuron[], connections: DesignerConnection[], label: string) => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        return;
      }

      const entry: CollaborativeHistoryEntry = {
        id: `${currentUserId}-${Date.now()}`,
        userId: currentUserId,
        userName: currentUserName,
        action: label,
        neurons: JSON.parse(JSON.stringify(neurons)),
        connections: JSON.parse(JSON.stringify(connections)),
        timestamp: Date.now(),
      };

      setHistory(prev => {
        const newHistory = [...prev.slice(0, currentIndex + 1), entry];
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory);
        }
        return newHistory;
      });
      setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));

      // Broadcast to others
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "history_action",
          payload: entry,
        });
      }
    },
    [currentUserId, currentUserName, currentIndex, maxHistory]
  );

  // Initialize with empty state
  const initHistory = useCallback(
    (neurons: PlacedNeuron[], connections: DesignerConnection[]) => {
      const entry: CollaborativeHistoryEntry = {
        id: `${currentUserId}-init`,
        userId: currentUserId,
        userName: currentUserName,
        action: "Initial state",
        neurons: JSON.parse(JSON.stringify(neurons)),
        connections: JSON.parse(JSON.stringify(connections)),
        timestamp: Date.now(),
      };
      setHistory([entry]);
      setCurrentIndex(0);
    },
    [currentUserId, currentUserName]
  );

  // Undo
  const undo = useCallback(() => {
    if (!canUndo) return null;

    const newIndex = currentIndex - 1;
    const targetState = history[newIndex];

    isRestoringRef.current = true;
    setCurrentIndex(newIndex);

    // Broadcast undo to others
    if (channelRef.current && roomId) {
      channelRef.current.send({
        type: "broadcast",
        event: "history_navigate",
        payload: {
          userId: currentUserId,
          userName: currentUserName,
          direction: "undo",
          targetIndex: newIndex,
          state: {
            neurons: targetState.neurons,
            connections: targetState.connections,
          },
        },
      });
    }

    return targetState;
  }, [canUndo, currentIndex, history, roomId, currentUserId, currentUserName]);

  // Redo
  const redo = useCallback(() => {
    if (!canRedo) return null;

    const newIndex = currentIndex + 1;
    const targetState = history[newIndex];

    isRestoringRef.current = true;
    setCurrentIndex(newIndex);

    // Broadcast redo to others
    if (channelRef.current && roomId) {
      channelRef.current.send({
        type: "broadcast",
        event: "history_navigate",
        payload: {
          userId: currentUserId,
          userName: currentUserName,
          direction: "redo",
          targetIndex: newIndex,
          state: {
            neurons: targetState.neurons,
            connections: targetState.connections,
          },
        },
      });
    }

    return targetState;
  }, [canRedo, currentIndex, history, roomId, currentUserId, currentUserName]);

  // Jump to specific state
  const jumpToState = useCallback(
    (index: number) => {
      if (index < 0 || index >= history.length) return null;

      const targetState = history[index];
      isRestoringRef.current = true;
      setCurrentIndex(index);

      // Broadcast jump to others
      if (channelRef.current && roomId) {
        channelRef.current.send({
          type: "broadcast",
          event: "history_navigate",
          payload: {
            userId: currentUserId,
            userName: currentUserName,
            direction: index < currentIndex ? "undo" : "redo",
            targetIndex: index,
            state: {
              neurons: targetState.neurons,
              connections: targetState.connections,
            },
          },
        });
      }

      return targetState;
    },
    [history, roomId, currentUserId, currentUserName, currentIndex]
  );

  // Resolve conflict
  const resolveConflict = useCallback(
    (keepLocal: boolean) => {
      if (!pendingConflict) return;

      if (keepLocal) {
        // Keep local changes, ignore remote
        toast.info("Kept your changes");
      } else {
        // Accept remote changes
        const remote = pendingConflict.remoteAction;
        setHistory(prev => [...prev.slice(0, currentIndex + 1), remote]);
        setCurrentIndex(prev => prev + 1);
        onStateRestore(remote.neurons, remote.connections);
        toast.info(`Applied ${remote.userName}'s changes`);
      }

      setPendingConflict(null);
    },
    [pendingConflict, currentIndex, onStateRestore]
  );

  // Get timeline data for display
  const getTimeline = useCallback(() => {
    return history.map((entry, index) => ({
      id: entry.id,
      action: entry.action,
      userName: entry.userName,
      userId: entry.userId,
      timestamp: entry.timestamp,
      neuronCount: entry.neurons.length,
      connectionCount: entry.connections.length,
      isCurrent: index === currentIndex,
      isOwn: entry.userId === currentUserId,
    }));
  }, [history, currentIndex, currentUserId]);

  return {
    pushState,
    initHistory,
    undo,
    redo,
    jumpToState,
    canUndo,
    canRedo,
    history,
    currentIndex,
    getTimeline,
    pendingConflict,
    resolveConflict,
    historyLength: history.length,
  };
}
