import { useState, useCallback, useRef, useEffect } from "react";
import { CelebrationEvent, CelebrationIcon } from "@/components/CelebrationOverlay";

// Sound effect URLs - using base64 encoded short sounds
const SOUNDS = {
  achievement: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAoAQJzh/NtvFgA/oOX8zWIZAEGh5frJYBkAQKHl+ctgGQBBoeX6yWAZAECh5fnLYBkAQaHl+slgGQBAoeX5y2AZAA==",
  levelUp: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAoAQJzh/NtvFgA/oOX8zWIZAEGh5frJYBkAQKHl+ctgGQBBoeX6yWAZAECh5fnLYBkAQaHl+slgGQBAoeX5y2AZAEGh5frJYBkAQKHl+ctgGQA=",
  legendary: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAoAQJzh/NtvFgA/oOX8zWIZAEGh5frJYBkAQKHl+ctgGQBBoeX6yWAZAECh5fnLYBkAQaHl+slgGQBAoeX5y2AZAEGh5frJYBkAQKHl+ctgGQBBoeX6yWAZAA==",
};

interface CelebrationQueue {
  events: CelebrationEvent[];
  isPlaying: boolean;
}

export function useCelebration() {
  const [currentEvent, setCurrentEvent] = useState<CelebrationEvent | null>(null);
  const queueRef = useRef<CelebrationQueue>({ events: [], isPlaying: false });
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play sound effect
  const playSound = useCallback(async (type: "achievement" | "levelUp" | "legendary") => {
    try {
      const ctx = initAudio();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Create oscillator-based sound for better browser compatibility
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different sound profiles for different events
      switch (type) {
        case "legendary":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
          oscillator.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.6);
          break;
        
        case "levelUp":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
          oscillator.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08); // C#5
          oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16); // E5
          oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.24); // A5
          gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.5);
          break;
        
        default: // achievement
          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(392, ctx.currentTime); // G4
          oscillator.frequency.setValueAtTime(523.25, ctx.currentTime + 0.1); // C5
          gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
          break;
      }
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  }, [initAudio]);

  // Process queue
  const processQueue = useCallback(() => {
    if (queueRef.current.isPlaying || queueRef.current.events.length === 0) {
      return;
    }

    queueRef.current.isPlaying = true;
    const nextEvent = queueRef.current.events.shift()!;
    setCurrentEvent(nextEvent);

    // Play appropriate sound
    if (nextEvent.rarity === "legendary") {
      playSound("legendary");
    } else if (nextEvent.type === "level-up" || nextEvent.type === "evolution") {
      playSound("levelUp");
    } else {
      playSound("achievement");
    }
  }, [playSound]);

  // Handle celebration complete
  const handleComplete = useCallback(() => {
    setCurrentEvent(null);
    queueRef.current.isPlaying = false;
    
    // Process next in queue after a short delay
    setTimeout(() => {
      processQueue();
    }, 500);
  }, [processQueue]);

  // Trigger a celebration
  const celebrate = useCallback((event: Omit<CelebrationEvent, "id">) => {
    const fullEvent: CelebrationEvent = {
      ...event,
      id: `celebration-${Date.now()}-${Math.random()}`,
    };
    
    queueRef.current.events.push(fullEvent);
    processQueue();
  }, [processQueue]);

  // Convenience methods
  const celebrateAchievement = useCallback((
    name: string, 
    description?: string, 
    icon?: CelebrationIcon,
    rarity?: "common" | "rare" | "epic" | "legendary"
  ) => {
    celebrate({
      type: "achievement",
      title: name,
      subtitle: description,
      icon: icon || "trophy",
      rarity: rarity || "common",
    });
  }, [celebrate]);

  const celebrateLevelUp = useCallback((newLevel: number) => {
    celebrate({
      type: "level-up",
      title: `Level ${newLevel}`,
      subtitle: "You've grown stronger!",
      icon: "star",
      rarity: newLevel >= 25 ? "epic" : newLevel >= 10 ? "rare" : "common",
    });
  }, [celebrate]);

  const celebrateEvolution = useCallback((evolutionName: string, emoji: string) => {
    celebrate({
      type: "evolution",
      title: evolutionName,
      subtitle: `Your worm evolved! ${emoji}`,
      icon: "rocket",
      rarity: "epic",
    });
  }, [celebrate]);

  const celebrateBadge = useCallback((
    name: string, 
    description?: string,
    icon?: CelebrationIcon,
    rarity?: "common" | "rare" | "epic" | "legendary"
  ) => {
    celebrate({
      type: "badge",
      title: name,
      subtitle: description,
      icon: icon || "star",
      rarity: rarity || "rare",
    });
  }, [celebrate]);

  const celebrateStreak = useCallback((days: number) => {
    celebrate({
      type: "streak",
      title: `${days} Day Streak!`,
      subtitle: "Keep up the great work!",
      icon: "flame",
      rarity: days >= 30 ? "legendary" : days >= 7 ? "epic" : "rare",
    });
  }, [celebrate]);

  const celebrateQuestComplete = useCallback((questName: string, xpReward: number) => {
    celebrate({
      type: "quest",
      title: questName,
      subtitle: `+${xpReward} XP`,
      icon: "target",
      rarity: xpReward >= 500 ? "epic" : xpReward >= 200 ? "rare" : "common",
    });
  }, [celebrate]);

  return {
    currentEvent,
    handleComplete,
    celebrate,
    celebrateAchievement,
    celebrateLevelUp,
    celebrateEvolution,
    celebrateBadge,
    celebrateStreak,
    celebrateQuestComplete,
  };
}
