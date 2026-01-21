import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LearningPathStep {
  id: string;
  module: string;
  activity: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scaffolding: string[];
  objective: string;
}

export interface InterventionPlan {
  id: string;
  student_id: string;
  classroom_id: string;
  teacher_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  learning_style: string | null;
  initial_entropy: number | null;
  target_entropy: number | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  steps: LearningPathStep[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  // Joined data
  student_name?: string;
  classroom_name?: string;
  progress?: InterventionProgress[];
  snapshots?: InterventionSnapshot[];
}

export interface InterventionProgress {
  id: string;
  plan_id: string;
  step_index: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  time_spent_seconds: number;
  teacher_notes: string | null;
}

export interface InterventionSnapshot {
  id: string;
  plan_id: string;
  entropy_value: number;
  steps_completed: number;
  snapshot_date: string;
  notes: string | null;
  created_at: string;
}

export function useInterventionPlans(classroomId?: string) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<InterventionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('intervention_plans')
        .select(`
          *,
          progress:intervention_progress(*),
          snapshots:intervention_snapshots(*)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (classroomId) {
        query = query.eq('classroom_id', classroomId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get student and classroom names
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map(p => p.student_id))];
        const classroomIds = [...new Set(data.map(p => p.classroom_id))];

        const [studentsRes, classroomsRes] = await Promise.all([
          supabase.from('students').select('id, display_name').in('id', studentIds),
          supabase.from('classrooms').select('id, name').in('id', classroomIds),
        ]);

        const studentMap = new Map(studentsRes.data?.map(s => [s.id, s.display_name]) || []);
        const classroomMap = new Map(classroomsRes.data?.map(c => [c.id, c.name]) || []);

        const enrichedPlans: InterventionPlan[] = data.map(plan => ({
          ...plan,
          priority: plan.priority as 'low' | 'medium' | 'high' | 'urgent',
          status: plan.status as 'active' | 'paused' | 'completed' | 'cancelled',
          initial_entropy: plan.initial_entropy ? Number(plan.initial_entropy) : null,
          target_entropy: plan.target_entropy ? Number(plan.target_entropy) : null,
          steps: (plan.steps as unknown as LearningPathStep[]) || [],
          progress: (plan.progress as InterventionProgress[]) || [],
          snapshots: ((plan.snapshots as unknown as InterventionSnapshot[]) || []).map(s => ({
            ...s,
            entropy_value: Number(s.entropy_value),
          })),
          student_name: studentMap.get(plan.student_id) || 'Unknown',
          classroom_name: classroomMap.get(plan.classroom_id) || 'Unknown',
        }));

        setPlans(enrichedPlans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching intervention plans:', error);
      toast.error('Failed to load intervention plans');
    } finally {
      setLoading(false);
    }
  }, [user?.id, classroomId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (
    studentId: string,
    classroomId: string,
    priority: string,
    learningStyle: string,
    initialEntropy: number | null,
    targetEntropy: number | null,
    steps: LearningPathStep[],
    notes: string
  ): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const insertData = {
        student_id: studentId,
        classroom_id: classroomId,
        teacher_id: user.id,
        priority,
        learning_style: learningStyle,
        initial_entropy: initialEntropy,
        target_entropy: targetEntropy,
        steps: steps as unknown as object,
        notes,
      };

      const { data, error } = await supabase
        .from('intervention_plans')
        .insert(insertData as any)
        .select('id')
        .single();

      if (error) throw error;

      // Create progress entries for each step
      if (data?.id && steps.length > 0) {
        const progressEntries = steps.map((_, index) => ({
          plan_id: data.id,
          step_index: index,
          status: 'pending',
        }));

        await supabase.from('intervention_progress').insert(progressEntries);

        // Create initial snapshot
        if (initialEntropy !== null) {
          await supabase.from('intervention_snapshots').insert({
            plan_id: data.id,
            entropy_value: initialEntropy,
            steps_completed: 0,
            notes: 'Initial baseline',
          });
        }
      }

      toast.success('Intervention plan created successfully');
      await fetchPlans();
      return data?.id || null;
    } catch (error) {
      console.error('Error creating intervention plan:', error);
      toast.error('Failed to create intervention plan');
      return null;
    }
  }, [user?.id, fetchPlans]);

  const updatePlanStatus = useCallback(async (
    planId: string,
    status: 'active' | 'paused' | 'completed' | 'cancelled'
  ): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('intervention_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;

      toast.success(`Plan ${status}`);
      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast.error('Failed to update plan');
      return false;
    }
  }, [fetchPlans]);

  const updateStepProgress = useCallback(async (
    progressId: string,
    updates: Partial<InterventionProgress>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('intervention_progress')
        .update(updates)
        .eq('id', progressId);

      if (error) throw error;

      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error updating step progress:', error);
      toast.error('Failed to update progress');
      return false;
    }
  }, [fetchPlans]);

  const startStep = useCallback(async (progressId: string): Promise<boolean> => {
    return updateStepProgress(progressId, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
  }, [updateStepProgress]);

  const completeStep = useCallback(async (
    progressId: string,
    score?: number,
    timeSpentSeconds?: number,
    notes?: string
  ): Promise<boolean> => {
    return updateStepProgress(progressId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      score,
      time_spent_seconds: timeSpentSeconds,
      teacher_notes: notes,
    });
  }, [updateStepProgress]);

  const addSnapshot = useCallback(async (
    planId: string,
    entropyValue: number,
    stepsCompleted: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('intervention_snapshots')
        .insert({
          plan_id: planId,
          entropy_value: entropyValue,
          steps_completed: stepsCompleted,
          notes,
        });

      if (error) throw error;

      toast.success('Progress snapshot saved');
      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error adding snapshot:', error);
      toast.error('Failed to save snapshot');
      return false;
    }
  }, [fetchPlans]);

  const deletePlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('intervention_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast.success('Intervention plan deleted');
      await fetchPlans();
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
      return false;
    }
  }, [fetchPlans]);

  // Calculate plan statistics
  const getPlanStats = useCallback((plan: InterventionPlan) => {
    const progress = plan.progress || [];
    const completed = progress.filter(p => p.status === 'completed').length;
    const total = progress.length;
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

    const snapshots = plan.snapshots || [];
    const latestSnapshot = snapshots.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const entropyReduction = latestSnapshot && plan.initial_entropy
      ? plan.initial_entropy - latestSnapshot.entropy_value
      : 0;

    return {
      stepsCompleted: completed,
      totalSteps: total,
      percentComplete,
      currentEntropy: latestSnapshot?.entropy_value ?? plan.initial_entropy,
      entropyReduction,
      onTrack: plan.target_entropy 
        ? (latestSnapshot?.entropy_value ?? plan.initial_entropy ?? 0) <= (plan.target_entropy + 0.2)
        : true,
    };
  }, []);

  return {
    plans,
    loading,
    createPlan,
    updatePlanStatus,
    updateStepProgress,
    startStep,
    completeStep,
    addSnapshot,
    deletePlan,
    getPlanStats,
    refetch: fetchPlans,
  };
}
