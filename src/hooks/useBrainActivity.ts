import { useState, useCallback } from 'react';

type ActivityType = 'reading' | 'watching' | 'thinking' | 'answering' | 'learning' | 'building' | 'quiz';

interface BrainActivityState {
  isVisible: boolean;
  activity: ActivityType;
  ageGroup: 'prek' | 'k5' | 'middle' | 'high';
}

export function useBrainActivity(defaultAgeGroup: 'prek' | 'k5' | 'middle' | 'high' = 'k5') {
  const [state, setState] = useState<BrainActivityState>({
    isVisible: false,
    activity: 'reading',
    ageGroup: defaultAgeGroup,
  });

  const showBrainActivity = useCallback((activity: ActivityType) => {
    setState((prev) => ({ ...prev, isVisible: true, activity }));
  }, []);

  const hideBrainActivity = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const toggleBrainActivity = useCallback(() => {
    setState((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  const setActivity = useCallback((activity: ActivityType) => {
    setState((prev) => ({ ...prev, activity }));
  }, []);

  const setAgeGroup = useCallback((ageGroup: 'prek' | 'k5' | 'middle' | 'high') => {
    setState((prev) => ({ ...prev, ageGroup }));
  }, []);

  return {
    ...state,
    showBrainActivity,
    hideBrainActivity,
    toggleBrainActivity,
    setActivity,
    setAgeGroup,
  };
}

export default useBrainActivity;
