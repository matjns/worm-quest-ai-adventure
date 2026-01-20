import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StudentAssignment {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  score: number;
  time_spent_seconds: number;
  assignment: {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    created_at: string;
  };
}

export function useStudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!user) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First, get the student record for this user
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, classroom_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      setStudentId(studentData.id);

      // Fetch assignment progress with assignment details
      const { data: progressData, error: progressError } = await supabase
        .from('student_assignment_progress')
        .select(`
          *,
          assignment:module_assignments(
            id,
            module_id,
            title,
            description,
            due_date,
            created_at
          )
        `)
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false });

      if (progressError) throw progressError;

      const formattedAssignments: StudentAssignment[] = (progressData || [])
        .filter(p => p.assignment) // Filter out any with missing assignments
        .map(p => ({
          id: p.id,
          assignment_id: p.assignment_id,
          student_id: p.student_id,
          status: p.status as 'pending' | 'in_progress' | 'completed',
          started_at: p.started_at,
          completed_at: p.completed_at,
          score: p.score || 0,
          time_spent_seconds: p.time_spent_seconds || 0,
          assignment: p.assignment as StudentAssignment['assignment'],
        }));

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const startAssignment = useCallback(async (progressId: string) => {
    try {
      const { error } = await supabase
        .from('student_assignment_progress')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', progressId);

      if (error) throw error;

      toast.success('Assignment started!');
      await fetchAssignments();
      return { success: true };
    } catch (error) {
      console.error('Error starting assignment:', error);
      toast.error('Failed to start assignment');
      return { success: false, error };
    }
  }, [fetchAssignments]);

  const completeAssignment = useCallback(async (
    progressId: string,
    score: number,
    timeSpentSeconds: number
  ) => {
    try {
      const { error } = await supabase
        .from('student_assignment_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score,
          time_spent_seconds: timeSpentSeconds,
        })
        .eq('id', progressId);

      if (error) throw error;

      toast.success('Assignment completed! 🎉');
      await fetchAssignments();
      return { success: true };
    } catch (error) {
      console.error('Error completing assignment:', error);
      toast.error('Failed to complete assignment');
      return { success: false, error };
    }
  }, [fetchAssignments]);

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  const overdueAssignments = pendingAssignments.filter(a => {
    if (!a.assignment.due_date) return false;
    return new Date(a.assignment.due_date) < new Date();
  });

  const upcomingAssignments = pendingAssignments.filter(a => {
    if (!a.assignment.due_date) return true;
    return new Date(a.assignment.due_date) >= new Date();
  });

  return {
    assignments,
    pendingAssignments,
    inProgressAssignments,
    completedAssignments,
    overdueAssignments,
    upcomingAssignments,
    loading,
    studentId,
    startAssignment,
    completeAssignment,
    refetch: fetchAssignments,
  };
}
