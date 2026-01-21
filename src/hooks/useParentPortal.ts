import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface LinkedStudent {
  id: string;
  display_name: string;
  classroom_id: string;
  classroom_name?: string;
  progress_data: {
    total_xp: number;
    accuracy: number;
    missions_completed: number;
  };
}

interface InterventionPlan {
  id: string;
  student_id: string;
  status: string;
  priority: string;
  learning_style: string | null;
  initial_entropy: number | null;
  target_entropy: number | null;
  steps: Array<{
    title: string;
    description: string;
    activity_type: string;
    duration_minutes: number;
  }>;
  created_at: string;
  updated_at: string;
}

interface InterventionProgress {
  id: string;
  plan_id: string;
  step_index: number;
  status: string;
  score: number | null;
  time_spent_seconds: number | null;
  completed_at: string | null;
}

interface InterventionSnapshot {
  id: string;
  plan_id: string;
  entropy_value: number;
  steps_completed: number;
  snapshot_date: string;
  notes: string | null;
}

export function useParentPortal() {
  const { user } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [interventionPlans, setInterventionPlans] = useState<InterventionPlan[]>([]);
  const [progress, setProgress] = useState<InterventionProgress[]>([]);
  const [snapshots, setSnapshots] = useState<InterventionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingCode, setLinkingCode] = useState('');

  useEffect(() => {
    if (user) {
      fetchLinkedStudents();
    }
  }, [user]);

  async function fetchLinkedStudents() {
    if (!user) return;

    setLoading(true);
    try {
      // Get linked students
      const { data: links, error: linksError } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id)
        .eq('verified', true);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        setLinkedStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = links.map(l => l.student_id);

      // Get student details
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, display_name, classroom_id, progress_data')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      const formattedStudents: LinkedStudent[] = (students || []).map(s => ({
        id: s.id,
        display_name: s.display_name,
        classroom_id: s.classroom_id,
        progress_data: s.progress_data as LinkedStudent['progress_data'] || {
          total_xp: 0,
          accuracy: 0,
          missions_completed: 0
        }
      }));

      setLinkedStudents(formattedStudents);

      // Fetch intervention plans for all linked students
      if (studentIds.length > 0) {
        await fetchInterventionData(studentIds);
      }
    } catch (error) {
      console.error('Error fetching linked students:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchInterventionData(studentIds: string[]) {
    try {
      // Get intervention plans
      const { data: plans, error: plansError } = await supabase
        .from('intervention_plans')
        .select('*')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      const formattedPlans: InterventionPlan[] = (plans || []).map(p => ({
        ...p,
        steps: (p.steps as InterventionPlan['steps']) || []
      }));

      setInterventionPlans(formattedPlans);

      if (plans && plans.length > 0) {
        const planIds = plans.map(p => p.id);

        // Get progress for all plans
        const { data: progressData, error: progressError } = await supabase
          .from('intervention_progress')
          .select('*')
          .in('plan_id', planIds);

        if (progressError) throw progressError;
        setProgress(progressData || []);

        // Get snapshots for all plans
        const { data: snapshotData, error: snapshotError } = await supabase
          .from('intervention_snapshots')
          .select('*')
          .in('plan_id', planIds)
          .order('snapshot_date', { ascending: true });

        if (snapshotError) throw snapshotError;
        setSnapshots(snapshotData || []);
      }
    } catch (error) {
      console.error('Error fetching intervention data:', error);
    }
  }

  async function linkWithCode(code: string) {
    if (!user) {
      toast.error('Please sign in first');
      return false;
    }

    try {
      // Find the invite
      const { data: invite, error: findError } = await supabase
        .from('parent_student_links')
        .select('id, student_id')
        .eq('invite_code', code.toUpperCase())
        .eq('verified', false)
        .single();

      if (findError || !invite) {
        toast.error('Invalid or expired invite code');
        return false;
      }

      // Update the link with parent_id and verify
      const { error: updateError } = await supabase
        .from('parent_student_links')
        .update({ 
          parent_id: user.id, 
          verified: true,
          invite_code: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      toast.success('Successfully linked to your child!');
      await fetchLinkedStudents();
      return true;
    } catch (error) {
      console.error('Error linking with code:', error);
      toast.error('Failed to link account');
      return false;
    }
  }

  function getStudentPlans(studentId: string) {
    return interventionPlans.filter(p => p.student_id === studentId);
  }

  function getPlanProgress(planId: string) {
    return progress.filter(p => p.plan_id === planId);
  }

  function getPlanSnapshots(planId: string) {
    return snapshots.filter(s => s.plan_id === planId);
  }

  return {
    linkedStudents,
    interventionPlans,
    progress,
    snapshots,
    loading,
    linkingCode,
    setLinkingCode,
    linkWithCode,
    getStudentPlans,
    getPlanProgress,
    getPlanSnapshots,
    refresh: fetchLinkedStudents
  };
}