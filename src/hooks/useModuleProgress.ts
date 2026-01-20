import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  completed_at: string;
  score: number;
  time_spent_seconds: number;
  steps_completed: number;
}

export function useModuleProgress() {
  const { user, isAuthenticated } = useAuth();
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState<Map<string, ModuleProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch progress on mount and when auth changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCompletedModules(new Set());
      setProgressData(new Map());
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('module_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const completed = new Set<string>();
        const progress = new Map<string, ModuleProgress>();

        data?.forEach((item) => {
          completed.add(item.module_id);
          progress.set(item.module_id, item as ModuleProgress);
        });

        setCompletedModules(completed);
        setProgressData(progress);
      } catch (error) {
        console.error('Error fetching module progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, isAuthenticated]);

  const completeModule = useCallback(async (
    moduleId: string, 
    score: number = 0, 
    stepsCompleted: number = 0,
    timeSpentSeconds: number = 0
  ) => {
    if (!user) {
      // For non-authenticated users, just update local state
      setCompletedModules(prev => new Set([...prev, moduleId]));
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          score,
          steps_completed: stepsCompleted,
          time_spent_seconds: timeSpentSeconds,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,module_id',
        })
        .select()
        .single();

      if (error) throw error;

      setCompletedModules(prev => new Set([...prev, moduleId]));
      if (data) {
        setProgressData(prev => new Map(prev).set(moduleId, data as ModuleProgress));
      }

      toast.success('Progress saved!');
      return { success: true, data };
    } catch (error) {
      console.error('Error saving module progress:', error);
      toast.error('Failed to save progress');
      return { success: false, error };
    }
  }, [user]);

  const resetProgress = useCallback(async (moduleId: string) => {
    if (!user) {
      setCompletedModules(prev => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('module_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      if (error) throw error;

      setCompletedModules(prev => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
      setProgressData(prev => {
        const next = new Map(prev);
        next.delete(moduleId);
        return next;
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting module progress:', error);
      return { success: false, error };
    }
  }, [user]);

  const getModuleProgress = useCallback((moduleId: string) => {
    return progressData.get(moduleId);
  }, [progressData]);

  const isModuleCompleted = useCallback((moduleId: string) => {
    return completedModules.has(moduleId);
  }, [completedModules]);

  const getTotalCompleted = useCallback(() => {
    return completedModules.size;
  }, [completedModules]);

  const getTotalScore = useCallback(() => {
    let total = 0;
    progressData.forEach(p => total += p.score);
    return total;
  }, [progressData]);

  return {
    completedModules,
    progressData,
    loading,
    completeModule,
    resetProgress,
    getModuleProgress,
    isModuleCompleted,
    getTotalCompleted,
    getTotalScore,
    isAuthenticated,
  };
}
