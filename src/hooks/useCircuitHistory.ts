import { useState, useCallback, useRef } from "react";
import { type NeuronData, type ConnectionData } from "@/data/neuronData";

interface PlacedNeuron extends NeuronData {
  x: number;
  y: number;
  isActive?: boolean;
}

interface DesignerConnection extends ConnectionData {
  id: string;
}

interface CircuitState {
  id: string;
  neurons: PlacedNeuron[];
  connections: DesignerConnection[];
  timestamp: number;
  label?: string;
  isBookmarked?: boolean;
  bookmarkName?: string;
}

interface UseCircuitHistoryOptions {
  maxHistory?: number;
}

export function useCircuitHistory(options: UseCircuitHistoryOptions = {}) {
  const { maxHistory = 50 } = options;
  
  const [history, setHistory] = useState<CircuitState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Generate unique ID for state
   */
  const generateId = () => `state_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  /**
   * Push a new state to history
   */
  const pushState = useCallback(
    (neurons: PlacedNeuron[], connections: DesignerConnection[], label?: string) => {
      // Skip if this is an undo/redo action
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      const newState: CircuitState = {
        id: generateId(),
        neurons: JSON.parse(JSON.stringify(neurons)),
        connections: JSON.parse(JSON.stringify(connections)),
        timestamp: Date.now(),
        label,
        isBookmarked: false,
      };

      setHistory((prev) => {
        // Remove any future states if we're not at the end
        const newHistory = prev.slice(0, currentIndex + 1);
        
        // Add new state
        newHistory.push(newState);
        
        // Trim history if it exceeds max
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory);
        }
        
        return newHistory;
      });

      setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [currentIndex, maxHistory]
  );

  /**
   * Initialize history with initial state
   */
  const initHistory = useCallback(
    (neurons: PlacedNeuron[], connections: DesignerConnection[]) => {
      const initialState: CircuitState = {
        id: generateId(),
        neurons: JSON.parse(JSON.stringify(neurons)),
        connections: JSON.parse(JSON.stringify(connections)),
        timestamp: Date.now(),
        label: "Initial state",
        isBookmarked: false,
      };
      setHistory([initialState]);
      setCurrentIndex(0);
    },
    []
  );

  /**
   * Undo to previous state
   */
  const undo = useCallback((): CircuitState | null => {
    if (!canUndo) return null;

    isUndoRedoAction.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    
    return history[newIndex];
  }, [canUndo, currentIndex, history]);

  /**
   * Redo to next state
   */
  const redo = useCallback((): CircuitState | null => {
    if (!canRedo) return null;

    isUndoRedoAction.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    
    return history[newIndex];
  }, [canRedo, currentIndex, history]);

  /**
   * Jump to specific state index
   */
  const jumpToState = useCallback((index: number): CircuitState | null => {
    if (index < 0 || index >= history.length) return null;
    
    isUndoRedoAction.current = true;
    setCurrentIndex(index);
    return history[index];
  }, [history]);

  /**
   * Get current state info
   */
  const getCurrentState = useCallback((): CircuitState | null => {
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex];
    }
    return null;
  }, [currentIndex, history]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  /**
   * Toggle bookmark on a state
   */
  const toggleBookmark = useCallback((stateId: string, name?: string) => {
    setHistory(prev => 
      prev.map(state => 
        state.id === stateId
          ? { 
              ...state, 
              isBookmarked: !state.isBookmarked,
              bookmarkName: !state.isBookmarked ? (name || state.label) : undefined
            }
          : state
      )
    );
  }, []);

  /**
   * Rename a bookmark
   */
  const renameBookmark = useCallback((stateId: string, name: string) => {
    setHistory(prev => 
      prev.map(state => 
        state.id === stateId && state.isBookmarked
          ? { ...state, bookmarkName: name }
          : state
      )
    );
  }, []);

  /**
   * Get all bookmarked states
   */
  const getBookmarks = useCallback(() => {
    return history
      .map((state, index) => ({ ...state, index }))
      .filter(state => state.isBookmarked);
  }, [history]);

  /**
   * Get all states formatted for timeline/comparison
   */
  const getAllStates = useCallback(() => {
    return history.map((state, index) => ({
      ...state,
      index,
      isCurrent: index === currentIndex,
    }));
  }, [history, currentIndex]);

  /**
   * Get history summary for display
   */
  const getHistorySummary = useCallback(() => {
    return {
      total: history.length,
      current: currentIndex + 1,
      canUndo,
      canRedo,
      bookmarkCount: history.filter(s => s.isBookmarked).length,
      recentActions: history.slice(Math.max(0, currentIndex - 4), currentIndex + 1).map((s, i) => ({
        id: s.id,
        label: s.label || `Action ${i + 1}`,
        neurons: s.neurons.length,
        connections: s.connections.length,
        isCurrent: i === Math.min(4, currentIndex),
        isBookmarked: s.isBookmarked,
        bookmarkName: s.bookmarkName,
      })),
    };
  }, [history, currentIndex, canUndo, canRedo]);

  return {
    pushState,
    initHistory,
    undo,
    redo,
    jumpToState,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentState,
    getAllStates,
    getHistorySummary,
    toggleBookmark,
    renameBookmark,
    getBookmarks,
    historyLength: history.length,
    currentIndex,
  };
}
