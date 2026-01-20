import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ModuleAssignment {
  id: string;
  classroom_id: string;
  module_id: string;
  assigned_by: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentAssignmentProgress {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  score: number;
  time_spent_seconds: number;
  created_at: string;
  student?: {
    display_name: string;
    user_id: string | null;
  };
}

export interface AssignmentWithProgress extends ModuleAssignment {
  progress: StudentAssignmentProgress[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    avgScore: number;
  };
}

export function useModuleAssignments(classroomId?: string) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    if (!classroomId || !user) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch assignments for the classroom
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('module_assignments')
        .select('*')
        .eq('classroom_id', classroomId)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (assignmentsError) throw assignmentsError;

      // Fetch progress for all assignments
      const assignmentIds = assignmentsData?.map(a => a.id) || [];
      
      if (assignmentIds.length === 0) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const { data: progressData, error: progressError } = await supabase
        .from('student_assignment_progress')
        .select(`
          *,
          student:students(display_name, user_id)
        `)
        .in('assignment_id', assignmentIds);

      if (progressError) throw progressError;

      // Combine assignments with progress
      const assignmentsWithProgress: AssignmentWithProgress[] = (assignmentsData || []).map(assignment => {
        const progress = (progressData || [])
          .filter(p => p.assignment_id === assignment.id)
          .map(p => ({
            ...p,
            student: p.student as { display_name: string; user_id: string | null } | undefined,
          })) as StudentAssignmentProgress[];

        const completed = progress.filter(p => p.status === 'completed').length;
        const inProgress = progress.filter(p => p.status === 'in_progress').length;
        const pending = progress.filter(p => p.status === 'pending').length;
        const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);

        return {
          ...assignment,
          progress,
          stats: {
            total: progress.length,
            pending,
            inProgress,
            completed,
            avgScore: progress.length > 0 ? Math.round(totalScore / progress.length) : 0,
          },
        };
      });

      setAssignments(assignmentsWithProgress);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [classroomId, user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const createAssignment = useCallback(async (
    moduleId: string,
    title: string,
    description?: string,
    dueDate?: Date
  ) => {
    if (!classroomId || !user) {
      toast.error('Please select a classroom first');
      return { success: false };
    }

    try {
      // Create the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('module_assignments')
        .insert({
          classroom_id: classroomId,
          module_id: moduleId,
          assigned_by: user.id,
          title,
          description: description || null,
          due_date: dueDate?.toISOString() || null,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Fetch all students in the classroom
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('classroom_id', classroomId);

      if (studentsError) throw studentsError;

      // Create progress records for each student
      if (students && students.length > 0) {
        const progressRecords = students.map(student => ({
          assignment_id: assignment.id,
          student_id: student.id,
          status: 'pending' as const,
        }));

        const { error: progressError } = await supabase
          .from('student_assignment_progress')
          .insert(progressRecords);

        if (progressError) throw progressError;
      }

      toast.success('Assignment created!');
      await fetchAssignments();
      return { success: true, data: assignment };
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
      return { success: false, error };
    }
  }, [classroomId, user, fetchAssignments]);

  const updateAssignment = useCallback(async (
    assignmentId: string,
    updates: Partial<Pick<ModuleAssignment, 'title' | 'description' | 'due_date'>>
  ) => {
    try {
      const { error } = await supabase
        .from('module_assignments')
        .update(updates)
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment updated!');
      await fetchAssignments();
      return { success: true };
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
      return { success: false, error };
    }
  }, [fetchAssignments]);

  const deleteAssignment = useCallback(async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('module_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Assignment deleted');
      await fetchAssignments();
      return { success: true };
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
      return { success: false, error };
    }
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refetch: fetchAssignments,
  };
}
