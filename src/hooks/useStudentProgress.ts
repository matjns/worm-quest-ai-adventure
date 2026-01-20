import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StudentProgress {
  missions_completed: number;
  total_xp: number;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
}

interface StudentRecord {
  id: string;
  classroom_id: string;
  display_name: string;
  progress_data: StudentProgress;
  created_at: string;
}

interface ClassroomInfo {
  id: string;
  name: string;
  grade_level: string;
  school_name: string | null;
}

interface ClassmateRanking {
  display_name: string;
  total_xp: number;
  missions_completed: number;
  isCurrentUser: boolean;
}

export function useStudentProgress() {
  const { user } = useAuth();
  const [studentRecord, setStudentRecord] = useState<StudentRecord | null>(null);
  const [classroom, setClassroom] = useState<ClassroomInfo | null>(null);
  const [classmates, setClassmates] = useState<ClassmateRanking[]>([]);
  const [rank, setRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get the student's record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        setLoading(false);
        return;
      }

      // Parse progress_data
      const progressData = studentData.progress_data as unknown as StudentProgress;
      const record: StudentRecord = {
        id: studentData.id,
        classroom_id: studentData.classroom_id,
        display_name: studentData.display_name,
        progress_data: progressData || {
          missions_completed: 0,
          total_xp: 0,
          accuracy: 0,
          strengths: [],
          weaknesses: []
        },
        created_at: studentData.created_at
      };
      setStudentRecord(record);

      // Get classroom info
      const { data: classroomData } = await supabase
        .from('classrooms')
        .select('id, name, grade_level, school_name')
        .eq('id', studentData.classroom_id)
        .maybeSingle();

      if (classroomData) {
        setClassroom(classroomData);
      }

      // Get all classmates for ranking
      const { data: classmatesData } = await supabase
        .from('students')
        .select('display_name, progress_data, user_id')
        .eq('classroom_id', studentData.classroom_id);

      if (classmatesData) {
        const rankings: ClassmateRanking[] = classmatesData
          .map(c => {
            const progress = c.progress_data as unknown as StudentProgress;
            return {
              display_name: c.display_name,
              total_xp: progress?.total_xp || 0,
              missions_completed: progress?.missions_completed || 0,
              isCurrentUser: c.user_id === user.id
            };
          })
          .sort((a, b) => b.total_xp - a.total_xp);

        setClassmates(rankings);

        // Find current user's rank
        const userRank = rankings.findIndex(c => c.isCurrentUser) + 1;
        setRank(userRank);
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to real-time updates for the student's record
  useEffect(() => {
    if (!studentRecord?.id) return;

    const channel = supabase
      .channel(`student-progress-${studentRecord.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
          filter: `id=eq.${studentRecord.id}`
        },
        (payload) => {
          console.log('Real-time progress update:', payload);
          const newData = payload.new as { progress_data: StudentProgress };
          if (newData.progress_data) {
            setStudentRecord(prev => prev ? {
              ...prev,
              progress_data: newData.progress_data
            } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentRecord?.id]);

  // Subscribe to classmate updates for live leaderboard
  useEffect(() => {
    if (!studentRecord?.classroom_id) return;

    const channel = supabase
      .channel(`classroom-leaderboard-${studentRecord.classroom_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students',
          filter: `classroom_id=eq.${studentRecord.classroom_id}`
        },
        () => {
          // Refetch classmates when any student in the classroom updates
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentRecord?.classroom_id, fetchData]);

  // Calculate level from XP (100 XP per level)
  const level = studentRecord 
    ? Math.floor(studentRecord.progress_data.total_xp / 100) + 1 
    : 1;
  
  const xpInCurrentLevel = studentRecord 
    ? studentRecord.progress_data.total_xp % 100 
    : 0;

  return {
    studentRecord,
    classroom,
    classmates,
    rank,
    level,
    xpInCurrentLevel,
    loading,
    refresh: fetchData
  };
}