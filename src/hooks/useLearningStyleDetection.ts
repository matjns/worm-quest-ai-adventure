import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BehaviorData {
  videoWatchTime: number;
  videoCompletionRate: number;
  simulationInteractions: number;
  simulationTimeSpent: number;
  textReadingTime: number;
  scrollSpeed: number;
  clickPatterns: string[];
  preferredContentTypes: string[];
  quizResponseTimes: number[];
  hintUsageRate: number;
  pauseFrequency: number;
  replayCount: number;
  handsonTasksCompleted: number;
  diagramInteractions: number;
  audioPlayCount: number;
  notesTaken: number;
}

export interface LearningStyleResult {
  primary_style: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  secondary_style: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | null;
  confidence: number;
  style_breakdown: {
    visual: number;
    auditory: number;
    reading: number;
    kinesthetic: number;
  };
  behavioral_evidence: string[];
  recommendations: string[];
  content_preferences: string[];
  adaptation_tips: string[];
}

interface BehaviorTracker {
  // Track video watching
  trackVideoPlay: () => void;
  trackVideoComplete: () => void;
  trackVideoPause: () => void;
  trackVideoReplay: () => void;
  
  // Track simulation interactions
  trackSimulationClick: () => void;
  trackSimulationDrag: () => void;
  trackSimulationComplete: () => void;
  
  // Track reading behavior
  trackTextView: (duration: number) => void;
  trackScroll: (speed: number) => void;
  trackNoteTaken: () => void;
  
  // Track audio
  trackAudioPlay: () => void;
  
  // Track diagrams/visuals
  trackDiagramInteraction: () => void;
  
  // Track quiz behavior
  trackQuizResponse: (responseTimeMs: number) => void;
  trackHintUsed: () => void;
  
  // Track hands-on tasks
  trackHandsOnTaskComplete: () => void;
  
  // Track content preference
  trackContentTypeUsed: (type: string) => void;
}

const initialBehaviorData: BehaviorData = {
  videoWatchTime: 0,
  videoCompletionRate: 0,
  simulationInteractions: 0,
  simulationTimeSpent: 0,
  textReadingTime: 0,
  scrollSpeed: 0,
  clickPatterns: [],
  preferredContentTypes: [],
  quizResponseTimes: [],
  hintUsageRate: 0,
  pauseFrequency: 0,
  replayCount: 0,
  handsonTasksCompleted: 0,
  diagramInteractions: 0,
  audioPlayCount: 0,
  notesTaken: 0,
};

export function useLearningStyleDetection(studentId?: string) {
  const [behaviorData, setBehaviorData] = useState<BehaviorData>(initialBehaviorData);
  const [learningStyle, setLearningStyle] = useState<LearningStyleResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  
  const videoStartTime = useRef<number>(0);
  const simulationStartTime = useRef<number>(0);
  const videosStarted = useRef<number>(0);
  const videosCompleted = useRef<number>(0);
  const hintsTotal = useRef<number>(0);
  const hintsUsed = useRef<number>(0);
  const scrollSpeeds = useRef<number[]>([]);

  // Load cached learning style from localStorage
  useEffect(() => {
    if (studentId) {
      const cached = localStorage.getItem(`learning_style_${studentId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setLearningStyle(parsed.result);
          setLastAnalyzed(new Date(parsed.analyzedAt));
        } catch {
          // Ignore parse errors
        }
      }
      
      // Load cached behavior data
      const cachedBehavior = localStorage.getItem(`behavior_data_${studentId}`);
      if (cachedBehavior) {
        try {
          setBehaviorData(JSON.parse(cachedBehavior));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [studentId]);

  // Persist behavior data
  useEffect(() => {
    if (studentId) {
      localStorage.setItem(`behavior_data_${studentId}`, JSON.stringify(behaviorData));
    }
  }, [behaviorData, studentId]);

  // Behavior tracking functions
  const tracker: BehaviorTracker = {
    trackVideoPlay: useCallback(() => {
      videoStartTime.current = Date.now();
      videosStarted.current += 1;
    }, []),
    
    trackVideoComplete: useCallback(() => {
      videosCompleted.current += 1;
      const watchTime = (Date.now() - videoStartTime.current) / 1000;
      setBehaviorData(prev => ({
        ...prev,
        videoWatchTime: prev.videoWatchTime + watchTime,
        videoCompletionRate: videosStarted.current > 0 
          ? (videosCompleted.current / videosStarted.current) * 100 
          : 0,
      }));
    }, []),
    
    trackVideoPause: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        pauseFrequency: prev.pauseFrequency + 1,
      }));
    }, []),
    
    trackVideoReplay: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        replayCount: prev.replayCount + 1,
      }));
    }, []),
    
    trackSimulationClick: useCallback(() => {
      if (simulationStartTime.current === 0) {
        simulationStartTime.current = Date.now();
      }
      setBehaviorData(prev => ({
        ...prev,
        simulationInteractions: prev.simulationInteractions + 1,
        clickPatterns: [...prev.clickPatterns.slice(-99), 'simulation_click'],
      }));
    }, []),
    
    trackSimulationDrag: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        simulationInteractions: prev.simulationInteractions + 1,
        clickPatterns: [...prev.clickPatterns.slice(-99), 'simulation_drag'],
      }));
    }, []),
    
    trackSimulationComplete: useCallback(() => {
      const timeSpent = simulationStartTime.current > 0 
        ? (Date.now() - simulationStartTime.current) / 1000 
        : 0;
      simulationStartTime.current = 0;
      setBehaviorData(prev => ({
        ...prev,
        simulationTimeSpent: prev.simulationTimeSpent + timeSpent,
      }));
    }, []),
    
    trackTextView: useCallback((duration: number) => {
      setBehaviorData(prev => ({
        ...prev,
        textReadingTime: prev.textReadingTime + duration,
      }));
    }, []),
    
    trackScroll: useCallback((speed: number) => {
      scrollSpeeds.current.push(speed);
      const avgSpeed = scrollSpeeds.current.reduce((a, b) => a + b, 0) / scrollSpeeds.current.length;
      setBehaviorData(prev => ({
        ...prev,
        scrollSpeed: avgSpeed,
      }));
    }, []),
    
    trackNoteTaken: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        notesTaken: prev.notesTaken + 1,
      }));
    }, []),
    
    trackAudioPlay: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        audioPlayCount: prev.audioPlayCount + 1,
      }));
    }, []),
    
    trackDiagramInteraction: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        diagramInteractions: prev.diagramInteractions + 1,
      }));
    }, []),
    
    trackQuizResponse: useCallback((responseTimeMs: number) => {
      setBehaviorData(prev => ({
        ...prev,
        quizResponseTimes: [...prev.quizResponseTimes.slice(-49), responseTimeMs],
      }));
    }, []),
    
    trackHintUsed: useCallback(() => {
      hintsUsed.current += 1;
      hintsTotal.current += 1;
      setBehaviorData(prev => ({
        ...prev,
        hintUsageRate: hintsTotal.current > 0 
          ? (hintsUsed.current / hintsTotal.current) * 100 
          : 0,
      }));
    }, []),
    
    trackHandsOnTaskComplete: useCallback(() => {
      setBehaviorData(prev => ({
        ...prev,
        handsonTasksCompleted: prev.handsonTasksCompleted + 1,
      }));
    }, []),
    
    trackContentTypeUsed: useCallback((type: string) => {
      setBehaviorData(prev => ({
        ...prev,
        preferredContentTypes: [...prev.preferredContentTypes.slice(-99), type],
      }));
    }, []),
  };

  // Analyze behavior data with AI
  const analyzeLearningStyle = useCallback(async (gradeLevel: string = '6-8') => {
    // Check if we have enough data
    const totalInteractions = 
      behaviorData.simulationInteractions + 
      behaviorData.diagramInteractions + 
      behaviorData.audioPlayCount +
      behaviorData.notesTaken +
      Math.floor(behaviorData.videoWatchTime / 60);

    if (totalInteractions < 5) {
      toast.error('Not enough behavior data yet. Student needs more interactions.');
      return null;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'detect_learning_style',
          gradeLevel,
          behaviorData,
        },
      });

      if (error) throw error;

      const result = data.result as LearningStyleResult;
      setLearningStyle(result);
      setLastAnalyzed(new Date());

      // Cache the result
      if (studentId) {
        localStorage.setItem(`learning_style_${studentId}`, JSON.stringify({
          result,
          analyzedAt: new Date().toISOString(),
        }));
      }

      toast.success('Learning style detected!', {
        description: `Primary style: ${result.primary_style} (${result.confidence}% confidence)`,
      });

      return result;
    } catch (error) {
      console.error('Learning style detection error:', error);
      toast.error('Failed to analyze learning style');
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [behaviorData, studentId]);

  // Quick heuristic-based detection (no AI call)
  const getQuickStyleEstimate = useCallback((): LearningStyleResult['style_breakdown'] => {
    const visual = behaviorData.diagramInteractions * 2 + 
                   behaviorData.videoWatchTime / 60 +
                   (behaviorData.videoCompletionRate / 10);
    
    const auditory = behaviorData.audioPlayCount * 3 + 
                     behaviorData.replayCount * 2 +
                     behaviorData.pauseFrequency * 0.5;
    
    const reading = behaviorData.textReadingTime / 60 + 
                    behaviorData.notesTaken * 3 +
                    (behaviorData.scrollSpeed < 100 ? 5 : 0); // Slow scroll = careful reading
    
    const kinesthetic = behaviorData.simulationInteractions + 
                        behaviorData.handsonTasksCompleted * 5 +
                        (behaviorData.simulationTimeSpent / 60);
    
    const total = visual + auditory + reading + kinesthetic || 1;
    
    return {
      visual: Math.round((visual / total) * 100),
      auditory: Math.round((auditory / total) * 100),
      reading: Math.round((reading / total) * 100),
      kinesthetic: Math.round((kinesthetic / total) * 100),
    };
  }, [behaviorData]);

  // Reset behavior data
  const resetBehaviorData = useCallback(() => {
    setBehaviorData(initialBehaviorData);
    if (studentId) {
      localStorage.removeItem(`behavior_data_${studentId}`);
    }
  }, [studentId]);

  return {
    behaviorData,
    learningStyle,
    analyzing,
    lastAnalyzed,
    tracker,
    analyzeLearningStyle,
    getQuickStyleEstimate,
    resetBehaviorData,
  };
}