import { useState, useCallback, useEffect, useMemo } from 'react';

export interface SandboxChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'creation' | 'connection' | 'pattern' | 'exploration';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  checkComplete: (state: CircuitState) => boolean;
}

interface CircuitState {
  neuronCount: number;
  connectionCount: number;
  colorCount: number;
  colors: string[];
  hasChain: boolean;
  maxChainLength: number;
  hasLoop: boolean;
  isolatedNeurons: number;
}

type AgeGroup = 'prek' | 'k5' | 'middle' | 'high';

const CHALLENGES: Record<AgeGroup, SandboxChallenge[]> = {
  prek: [
    {
      id: 'prek-first-neuron',
      title: 'First Brain Cell!',
      description: 'Tap to create your first neuron',
      emoji: '🌟',
      category: 'creation',
      difficulty: 'easy',
      xpReward: 10,
      checkComplete: (s) => s.neuronCount >= 1,
    },
    {
      id: 'prek-rainbow',
      title: 'Rainbow Brain',
      description: 'Use 3 different colors',
      emoji: '🌈',
      category: 'creation',
      difficulty: 'medium',
      xpReward: 20,
      checkComplete: (s) => s.colorCount >= 3,
    },
    {
      id: 'prek-friends',
      title: 'Make Friends',
      description: 'Connect two neurons together',
      emoji: '💕',
      category: 'connection',
      difficulty: 'easy',
      xpReward: 15,
      checkComplete: (s) => s.connectionCount >= 1,
    },
    {
      id: 'prek-party',
      title: 'Neuron Party',
      description: 'Create 5 neurons',
      emoji: '🎉',
      category: 'creation',
      difficulty: 'medium',
      xpReward: 25,
      checkComplete: (s) => s.neuronCount >= 5,
    },
  ],
  k5: [
    {
      id: 'k5-trio',
      title: 'Neuron Trio',
      description: 'Create 3 connected neurons',
      emoji: '🔗',
      category: 'connection',
      difficulty: 'easy',
      xpReward: 15,
      checkComplete: (s) => s.neuronCount >= 3 && s.connectionCount >= 2,
    },
    {
      id: 'k5-rainbow',
      title: 'Color Explorer',
      description: 'Use 4 different colors',
      emoji: '🎨',
      category: 'creation',
      difficulty: 'medium',
      xpReward: 25,
      checkComplete: (s) => s.colorCount >= 4,
    },
    {
      id: 'k5-chain',
      title: 'Signal Chain',
      description: 'Build a chain of 4 neurons',
      emoji: '⛓️',
      category: 'pattern',
      difficulty: 'medium',
      xpReward: 30,
      checkComplete: (s) => s.maxChainLength >= 4,
    },
    {
      id: 'k5-network',
      title: 'Mini Network',
      description: 'Create 6 neurons with 5 connections',
      emoji: '🕸️',
      category: 'connection',
      difficulty: 'hard',
      xpReward: 40,
      checkComplete: (s) => s.neuronCount >= 6 && s.connectionCount >= 5,
    },
  ],
  middle: [
    {
      id: 'middle-reflex',
      title: 'Reflex Arc',
      description: 'Build a chain of 5 connected neurons',
      emoji: '⚡',
      category: 'pattern',
      difficulty: 'medium',
      xpReward: 35,
      checkComplete: (s) => s.maxChainLength >= 5,
    },
    {
      id: 'middle-hub',
      title: 'Neural Hub',
      description: 'Create a neuron with 3+ connections',
      emoji: '🔀',
      category: 'pattern',
      difficulty: 'medium',
      xpReward: 30,
      checkComplete: (s) => s.connectionCount >= 3 && s.neuronCount >= 4,
    },
    {
      id: 'middle-diverse',
      title: 'Diverse Network',
      description: 'Use all 6 colors in your circuit',
      emoji: '🌈',
      category: 'exploration',
      difficulty: 'hard',
      xpReward: 45,
      checkComplete: (s) => s.colorCount >= 6,
    },
    {
      id: 'middle-complex',
      title: 'Complex Circuit',
      description: 'Build 10 neurons with 8+ connections',
      emoji: '🧠',
      category: 'connection',
      difficulty: 'hard',
      xpReward: 50,
      checkComplete: (s) => s.neuronCount >= 10 && s.connectionCount >= 8,
    },
  ],
  high: [
    {
      id: 'high-convergent',
      title: 'Convergent Pathway',
      description: 'Multiple inputs to single output (5+ neurons, 4+ connections)',
      emoji: '🎯',
      category: 'pattern',
      difficulty: 'medium',
      xpReward: 40,
      checkComplete: (s) => s.neuronCount >= 5 && s.connectionCount >= 4,
    },
    {
      id: 'high-network',
      title: 'Neural Network',
      description: 'Build an interconnected network (12+ neurons, 10+ connections)',
      emoji: '🕸️',
      category: 'connection',
      difficulty: 'hard',
      xpReward: 60,
      checkComplete: (s) => s.neuronCount >= 12 && s.connectionCount >= 10,
    },
    {
      id: 'high-efficient',
      title: 'Efficient Circuit',
      description: 'High connectivity ratio (connections ≥ neurons)',
      emoji: '📊',
      category: 'pattern',
      difficulty: 'hard',
      xpReward: 55,
      checkComplete: (s) => s.connectionCount >= s.neuronCount && s.neuronCount >= 6,
    },
    {
      id: 'high-master',
      title: 'Circuit Master',
      description: 'Build 15+ neurons with all colors connected',
      emoji: '🏆',
      category: 'exploration',
      difficulty: 'hard',
      xpReward: 75,
      checkComplete: (s) => s.neuronCount >= 15 && s.colorCount >= 5 && s.connectionCount >= 12,
    },
  ],
};

export function useSandboxChallenges(ageGroup: AgeGroup = 'k5') {
  const [activeChallenge, setActiveChallenge] = useState<SandboxChallenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem(`sandbox-challenges-${ageGroup}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [justCompleted, setJustCompleted] = useState<SandboxChallenge | null>(null);

  const availableChallenges = useMemo(() => {
    return CHALLENGES[ageGroup].filter(c => !completedChallenges.includes(c.id));
  }, [ageGroup, completedChallenges]);

  const allChallenges = useMemo(() => CHALLENGES[ageGroup], [ageGroup]);

  // Pick a random challenge when none is active
  const pickRandomChallenge = useCallback(() => {
    if (availableChallenges.length === 0) return;
    const random = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
    setActiveChallenge(random);
  }, [availableChallenges]);

  const selectChallenge = useCallback((challenge: SandboxChallenge) => {
    setActiveChallenge(challenge);
    setShowChallengeSelector(false);
  }, []);

  const dismissChallenge = useCallback(() => {
    setActiveChallenge(null);
  }, []);

  const checkProgress = useCallback((circuitState: CircuitState) => {
    if (!activeChallenge) return false;
    
    const isComplete = activeChallenge.checkComplete(circuitState);
    
    if (isComplete) {
      const newCompleted = [...completedChallenges, activeChallenge.id];
      setCompletedChallenges(newCompleted);
      localStorage.setItem(`sandbox-challenges-${ageGroup}`, JSON.stringify(newCompleted));
      setJustCompleted(activeChallenge);
      setActiveChallenge(null);
      
      // Clear celebration after animation
      setTimeout(() => setJustCompleted(null), 3000);
      
      return true;
    }
    
    return false;
  }, [activeChallenge, completedChallenges, ageGroup]);

  const resetProgress = useCallback(() => {
    setCompletedChallenges([]);
    localStorage.removeItem(`sandbox-challenges-${ageGroup}`);
    setActiveChallenge(null);
  }, [ageGroup]);

  // Auto-suggest a challenge after a delay if none active
  useEffect(() => {
    if (!activeChallenge && availableChallenges.length > 0) {
      const timer = setTimeout(() => {
        pickRandomChallenge();
      }, 5000); // Show a challenge suggestion after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [activeChallenge, availableChallenges.length, pickRandomChallenge]);

  return {
    activeChallenge,
    availableChallenges,
    allChallenges,
    completedChallenges,
    justCompleted,
    showChallengeSelector,
    setShowChallengeSelector,
    selectChallenge,
    dismissChallenge,
    checkProgress,
    pickRandomChallenge,
    resetProgress,
  };
}
