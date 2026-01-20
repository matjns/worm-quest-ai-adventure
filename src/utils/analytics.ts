// Analytics utilities for engagement tracking
// Tracks user paths, interactions, and learning metrics

export interface EngagementEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
}

export interface LearningMetrics {
  timeOnTask: number;
  attemptsCount: number;
  successRate: number;
  hintsUsed: number;
  completionTime: number;
}

// Generate session ID
let currentSessionId: string | null = null;

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return currentSessionId;
}

// Event queue for batching
const eventQueue: EngagementEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

// Track engagement event
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  const event: EngagementEvent = {
    type: 'engagement',
    category,
    action,
    label,
    value,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };
  
  eventQueue.push(event);
  
  // Log locally for development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }
  
  // Batch flush events
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, 5000);
  }
}

// Flush events to storage/backend
function flushEvents(): void {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  flushTimer = null;
  
  // Store in localStorage for analysis
  try {
    const stored = localStorage.getItem('neuroquest_analytics') || '[]';
    const existing = JSON.parse(stored);
    const combined = [...existing, ...events].slice(-1000); // Keep last 1000 events
    localStorage.setItem('neuroquest_analytics', JSON.stringify(combined));
  } catch (e) {
    console.warn('Failed to store analytics:', e);
  }
}

// Pre-defined tracking functions
export const Analytics = {
  // Game interactions
  gameStart: (gameId: string, ageGroup?: string) => 
    trackEvent('game', 'start', ageGroup ? `${gameId}_${ageGroup}` : gameId),
  
  gameComplete: (gameId: string, score: number) => 
    trackEvent('game', 'complete', gameId, score),
  
  levelUp: (level: number) => 
    trackEvent('progression', 'level_up', undefined, level),
  
  // Learning interactions
  lessonStart: (lessonId: string) => 
    trackEvent('learning', 'lesson_start', lessonId),
  
  lessonComplete: (lessonId: string, score: number) => 
    trackEvent('learning', 'lesson_complete', lessonId, score),
  
  quizAttempt: (quizId: string, correct: boolean) => 
    trackEvent('learning', 'quiz_attempt', quizId, correct ? 1 : 0),
  
  hintUsed: (context: string) => 
    trackEvent('learning', 'hint_used', context),
  
  // Simulation interactions
  simulationRun: (type: string, params?: Record<string, unknown>) => 
    trackEvent('simulation', 'run', type, params ? Object.keys(params).length : 0),
  
  circuitBuilt: (neuronCount: number, connectionCount: number) => 
    trackEvent('simulation', 'circuit_built', undefined, neuronCount),
  
  experimentRun: (hypothesis: string, success?: boolean) => 
    trackEvent('experiment', 'run', hypothesis, success ? 1 : 0),
  
  // Engagement paths
  pageView: (path: string) => 
    trackEvent('navigation', 'page_view', path),
  
  featureUsed: (feature: string) => 
    trackEvent('engagement', 'feature_used', feature),
  
  exportData: (format: string) => 
    trackEvent('export', 'data_export', format),
  
  // Color matching specific
  colorMatch: (correct: boolean, targetColor: string) => 
    trackEvent('prek', 'color_match', targetColor, correct ? 1 : 0),
  
  countingAttempt: (correct: boolean, targetNumber: number) => 
    trackEvent('prek', 'counting_attempt', undefined, correct ? targetNumber : -targetNumber),
};

// Calculate entropy metric for rubric impact
export function calculateEngagementEntropy(): number {
  try {
    const stored = localStorage.getItem('neuroquest_analytics') || '[]';
    const events: EngagementEvent[] = JSON.parse(stored);
    
    if (events.length < 10) return 0;
    
    // Count unique action types
    const actionCounts = new Map<string, number>();
    events.forEach(e => {
      const key = `${e.category}_${e.action}`;
      actionCounts.set(key, (actionCounts.get(key) || 0) + 1);
    });
    
    // Calculate Shannon entropy
    const total = events.length;
    let entropy = 0;
    
    actionCounts.forEach(count => {
      const p = count / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });
    
    // Normalize to 0-100 scale
    const maxEntropy = Math.log2(actionCounts.size) || 1;
    return (entropy / maxEntropy) * 100;
  } catch (e) {
    return 0;
  }
}

// Get engagement summary
export function getEngagementSummary(): {
  totalEvents: number;
  uniqueActions: number;
  entropy: number;
  topCategories: Array<{ category: string; count: number }>;
} {
  try {
    const stored = localStorage.getItem('neuroquest_analytics') || '[]';
    const events: EngagementEvent[] = JSON.parse(stored);
    
    const categoryCounts = new Map<string, number>();
    const uniqueActions = new Set<string>();
    
    events.forEach(e => {
      categoryCounts.set(e.category, (categoryCounts.get(e.category) || 0) + 1);
      uniqueActions.add(`${e.category}_${e.action}`);
    });
    
    const topCategories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalEvents: events.length,
      uniqueActions: uniqueActions.size,
      entropy: calculateEngagementEntropy(),
      topCategories,
    };
  } catch (e) {
    return {
      totalEvents: 0,
      uniqueActions: 0,
      entropy: 0,
      topCategories: [],
    };
  }
}
