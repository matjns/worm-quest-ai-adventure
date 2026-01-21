import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface StudentEntropyData {
  student_id: string;
  user_id: string;
  display_name: string;
  classroom_id: string;
  classroom_name: string;
  calculated_entropy: number | null;
  skill_variance: number | null;
  scaffolding_level: string | null;
  completed_modules: string[];
  skill_metrics: Record<string, number>;
  failed_attempts: Record<string, number>;
  learning_style: Record<string, unknown>;
  average_completion_time: number;
  streak_data: { current: number; best: number };
}

export function useClassroomEntropy(classroomId?: string) {
  const { user } = useAuth();
  const [entropyData, setEntropyData] = useState<StudentEntropyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [classroomNames, setClassroomNames] = useState<Record<string, string>>({});

  const fetchEntropyData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First get the teacher's classrooms
      let classroomsQuery = supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', user.id);

      if (classroomId) {
        classroomsQuery = classroomsQuery.eq('id', classroomId);
      }

      const { data: classrooms, error: classroomsError } = await classroomsQuery;
      if (classroomsError) throw classroomsError;

      if (!classrooms || classrooms.length === 0) {
        setEntropyData([]);
        setLoading(false);
        return;
      }

      // Store classroom names
      const namesMap: Record<string, string> = {};
      classrooms.forEach(c => { namesMap[c.id] = c.name; });
      setClassroomNames(namesMap);

      const classroomIds = classrooms.map(c => c.id);

      // Get students in those classrooms
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, user_id, display_name, classroom_id')
        .in('classroom_id', classroomIds)
        .not('user_id', 'is', null);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        setEntropyData([]);
        setLoading(false);
        return;
      }

      // Get entropy profiles for these students
      const userIds = students.map(s => s.user_id).filter(Boolean) as string[];
      
      const { data: entropyProfiles, error: entropyError } = await supabase
        .from('learner_entropy_profiles')
        .select('*')
        .in('user_id', userIds);

      if (entropyError) throw entropyError;

      // Combine the data
      const combinedData: StudentEntropyData[] = students.map(student => {
        const profile = entropyProfiles?.find(p => p.user_id === student.user_id);
        
        return {
          student_id: student.id,
          user_id: student.user_id!,
          display_name: student.display_name,
          classroom_id: student.classroom_id,
          classroom_name: namesMap[student.classroom_id] || 'Unknown',
          calculated_entropy: profile?.calculated_entropy ? Number(profile.calculated_entropy) : null,
          skill_variance: profile?.skill_variance ? Number(profile.skill_variance) : null,
          scaffolding_level: profile?.scaffolding_level || 'medium',
          completed_modules: profile?.completed_modules || [],
          skill_metrics: (profile?.skill_metrics as Record<string, number>) || {},
          failed_attempts: (profile?.failed_attempts as Record<string, number>) || {},
          learning_style: (profile?.learning_style as Record<string, unknown>) || {},
          average_completion_time: profile?.average_completion_time || 0,
          streak_data: (profile?.streak_data as { current: number; best: number }) || { current: 0, best: 0 },
        };
      });

      // Sort by entropy (highest first = needs most attention)
      combinedData.sort((a, b) => {
        const aEntropy = a.calculated_entropy ?? 999;
        const bEntropy = b.calculated_entropy ?? 999;
        return bEntropy - aEntropy;
      });

      setEntropyData(combinedData);
    } catch (error) {
      console.error('Error fetching entropy data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, classroomId]);

  useEffect(() => {
    fetchEntropyData();
  }, [fetchEntropyData]);

  // Calculate classroom-wide stats
  const classroomStats = useCallback(() => {
    if (entropyData.length === 0) return null;

    const withEntropy = entropyData.filter(s => s.calculated_entropy !== null);
    const avgEntropy = withEntropy.length > 0
      ? withEntropy.reduce((sum, s) => sum + (s.calculated_entropy || 0), 0) / withEntropy.length
      : 0;

    // Aggregate failed attempts across all students
    const moduleFailures: Record<string, number> = {};
    entropyData.forEach(student => {
      Object.entries(student.failed_attempts).forEach(([module, count]) => {
        moduleFailures[module] = (moduleFailures[module] || 0) + count;
      });
    });

    // Sort modules by failure count
    const topStruggleModules = Object.entries(moduleFailures)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Students needing attention (high entropy)
    const needingAttention = entropyData.filter(s => 
      s.calculated_entropy !== null && s.calculated_entropy > 1.0
    );

    // Top performers (low entropy)
    const topPerformers = entropyData.filter(s => 
      s.calculated_entropy !== null && s.calculated_entropy < 0.5
    );

    return {
      totalStudents: entropyData.length,
      averageEntropy: avgEntropy,
      needingAttention: needingAttention.length,
      topPerformers: topPerformers.length,
      topStruggleModules,
      moduleFailures,
    };
  }, [entropyData]);

  return {
    entropyData,
    classroomNames,
    loading,
    refetch: fetchEntropyData,
    stats: classroomStats(),
  };
}
