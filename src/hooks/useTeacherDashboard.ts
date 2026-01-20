import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Classroom {
  id: string;
  name: string;
  grade_level: string;
  school_name: string | null;
  school_district: string | null;
  student_count: number;
  join_code: string | null;
  created_at: string;
}

export interface StudentProgressData {
  missions_completed: number;
  total_xp: number;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Student {
  id: string;
  classroom_id: string;
  user_id: string | null;
  display_name: string;
  progress_data: StudentProgressData;
}

export interface LessonPlan {
  id: string;
  classroom_id: string;
  title: string;
  grade_level: string;
  objectives: string[];
  standards: string[];
  duration_minutes: number;
  lesson_content: Json;
  ai_generated: boolean;
  status: 'draft' | 'published' | 'archived';
  week_number: number | null;
  day_of_week: number | null;
  created_at: string;
}

export interface ClassroomAnalytics {
  id: string;
  classroom_id: string;
  date: string;
  active_students: number;
  missions_completed: number;
  avg_accuracy: number;
  total_xp_earned: number;
  community_contributions: number;
  ai_interactions: number;
}

export interface ClassroomSponsorship {
  id: string;
  classroom_id: string;
  donor_name: string | null;
  amount_cents: number;
  compute_credits_granted: number;
  message: string | null;
  is_anonymous: boolean;
  status: string;
  created_at: string;
}

export function useTeacherDashboard() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [analytics, setAnalytics] = useState<ClassroomAnalytics[]>([]);
  const [sponsorships, setSponsorships] = useState<ClassroomSponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch all teacher data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch classrooms
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (classroomsError) throw classroomsError;
      setClassrooms(classroomsData || []);

      if (classroomsData && classroomsData.length > 0) {
        const classroomIds = classroomsData.map(c => c.id);

        // Fetch students, lesson plans, analytics, sponsorships in parallel
        const [studentsRes, lessonsRes, analyticsRes, sponsorshipsRes] = await Promise.all([
          supabase
            .from('students')
            .select('*')
            .in('classroom_id', classroomIds),
          supabase
            .from('lesson_plans')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('classroom_analytics')
            .select('*')
            .in('classroom_id', classroomIds)
            .order('date', { ascending: false })
            .limit(30),
          supabase
            .from('classroom_sponsorships')
            .select('*')
            .in('classroom_id', classroomIds)
            .order('created_at', { ascending: false })
        ]);

        if (studentsRes.data) setStudents(studentsRes.data as unknown as Student[]);
        if (lessonsRes.data) setLessonPlans(lessonsRes.data as unknown as LessonPlan[]);
        if (analyticsRes.data) setAnalytics(analyticsRes.data as unknown as ClassroomAnalytics[]);
        if (sponsorshipsRes.data) setSponsorships(sponsorshipsRes.data as unknown as ClassroomSponsorship[]);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create a new classroom
  const createClassroom = async (data: Omit<Classroom, 'id' | 'created_at' | 'student_count'>) => {
    if (!user?.id) return null;

    try {
      const { data: newClassroom, error } = await supabase
        .from('classrooms')
        .insert({
          ...data,
          teacher_id: user.id,
          student_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setClassrooms(prev => [newClassroom, ...prev]);
      toast.success('Classroom created!');
      return newClassroom;
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast.error('Failed to create classroom');
      return null;
    }
  };

  // Add a student to a classroom
  const addStudent = async (classroomId: string, displayName: string) => {
    try {
      const { data: newStudent, error } = await supabase
        .from('students')
        .insert({
          classroom_id: classroomId,
          display_name: displayName,
          progress_data: {
            missions_completed: 0,
            total_xp: 0,
            accuracy: 0,
            strengths: [],
            weaknesses: []
          }
        })
        .select()
        .single();

      if (error) throw error;

      setStudents(prev => [...prev, newStudent as unknown as Student]);
      
      // Update classroom student count
      await supabase
        .from('classrooms')
        .update({ student_count: students.filter(s => s.classroom_id === classroomId).length + 1 })
        .eq('id', classroomId);

      toast.success('Student added!');
      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      return null;
    }
  };

  // Generate lesson plan with AI
  const generateLessonPlan = async (
    classroomId: string,
    gradeLevel: string,
    topic: string,
    standards?: string[]
  ): Promise<LessonPlan | null> => {
    if (!user?.id) return null;

    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'generate_lesson',
          gradeLevel,
          topic,
          standards
        }
      });

      if (response.error) throw response.error;

      const lessonContent = response.data.result;

      // Save to database
      const { data: savedLesson, error } = await supabase
        .from('lesson_plans')
        .insert({
          classroom_id: classroomId,
          teacher_id: user.id,
          title: lessonContent.title || topic,
          grade_level: gradeLevel,
          objectives: lessonContent.objectives || [],
          standards: lessonContent.standards || standards || [],
          duration_minutes: lessonContent.duration_minutes || 45,
          lesson_content: lessonContent,
          ai_generated: true,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      setLessonPlans(prev => [savedLesson as unknown as LessonPlan, ...prev]);
      toast.success('Lesson plan generated!');
      return savedLesson as unknown as LessonPlan;
    } catch (error) {
      console.error('Error generating lesson:', error);
      toast.error('Failed to generate lesson plan');
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  // Generate weekly curriculum
  const generateWeeklyCurriculum = async (
    classroomId: string,
    gradeLevel: string,
    topic: string,
    weekNumber: number
  ): Promise<LessonPlan[] | null> => {
    if (!user?.id) return null;

    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'generate_week',
          gradeLevel,
          topic,
          weekNumber
        }
      });

      if (response.error) throw response.error;

      const weeklyPlan = response.data.result;

      // Save all 5 days to database
      const lessonsToInsert = (Array.isArray(weeklyPlan) ? weeklyPlan : []).map((day: Record<string, unknown>, index: number) => ({
        classroom_id: classroomId,
        teacher_id: user.id,
        title: String(day.title || `Day ${index + 1}`),
        grade_level: gradeLevel,
        objectives: [String(day.objective || '')],
        standards: [] as string[],
        duration_minutes: 45,
        lesson_content: day as Json,
        ai_generated: true,
        status: 'draft',
        week_number: weekNumber,
        day_of_week: index + 1
      }));

      const { data: savedLessons, error } = await supabase
        .from('lesson_plans')
        .insert(lessonsToInsert)
        .select();

      if (error) throw error;

      setLessonPlans(prev => [...(savedLessons as unknown as LessonPlan[]), ...prev]);
      toast.success('Weekly curriculum generated!');
      return savedLessons as unknown as LessonPlan[];
    } catch (error) {
      console.error('Error generating weekly curriculum:', error);
      toast.error('Failed to generate weekly curriculum');
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  // Grade a submission with AI
  const gradeSubmission = async (
    submissionId: string,
    gradeLevel: string,
    submissionData: Record<string, unknown>
  ) => {
    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'grade_submission',
          gradeLevel,
          submissionData
        }
      });

      if (response.error) throw response.error;

      const feedback = response.data.result;

      // Update submission with AI feedback
      await supabase
        .from('student_submissions')
        .update({
          ai_feedback: feedback,
          score: feedback.score,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      toast.success('Submission graded!');
      return feedback;
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  // Analyze class performance
  const analyzeClass = async (classroomId: string, gradeLevel: string) => {
    const classStudents = students.filter(s => s.classroom_id === classroomId);
    const classAnalytics = analytics.filter(a => a.classroom_id === classroomId);

    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'analyze_class',
          gradeLevel,
          classData: {
            students: classStudents.map(s => ({
              name: s.display_name,
              ...s.progress_data
            })),
            recentAnalytics: classAnalytics.slice(0, 7)
          }
        }
      });

      if (response.error) throw response.error;

      return response.data.result;
    } catch (error) {
      console.error('Error analyzing class:', error);
      toast.error('Failed to analyze class');
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  // Generate progress report for a student
  const generateProgressReport = async (
    student: Student,
    classroomName: string,
    weekNumber: number = 1
  ) => {
    setAiLoading(true);
    try {
      const classroom = classrooms.find(c => c.id === student.classroom_id);
      
      const response = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'generate_progress_report',
          gradeLevel: classroom?.grade_level || 'unknown',
          studentData: {
            name: student.display_name,
            classroom: classroomName,
            weekNumber,
            ...student.progress_data,
            weekly_stats: {
              xp_gained: Math.floor(student.progress_data.total_xp * 0.2), // Estimate
              missions_this_week: Math.floor(student.progress_data.missions_completed * 0.15),
              accuracy_change: (Math.random() * 10 - 3).toFixed(1),
              level_ups: Math.floor(student.progress_data.total_xp / 100) > 0 ? 1 : 0
            }
          }
        }
      });

      if (response.error) throw response.error;
      
      const result = response.data.result;
      return {
        ai_summary: result.summary || '',
        ai_recommendations: result.home_activities || [],
        highlights: result.highlights || [],
        growth_areas: result.growth_areas || [],
        encouragement: result.encouragement || ''
      };
    } catch (error) {
      console.error('Error generating progress report:', error);
      toast.error('Failed to generate progress report');
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  // Calculate dashboard stats
  const stats = {
    totalStudents: students.length,
    totalClassrooms: classrooms.length,
    totalLessons: lessonPlans.length,
    totalXpEarned: analytics.reduce((sum, a) => sum + (a.total_xp_earned || 0), 0),
    avgAccuracy: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + (a.avg_accuracy || 0), 0) / analytics.length 
      : 0,
    totalSponsored: sponsorships
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.amount_cents, 0) / 100,
    computeCredits: sponsorships
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.compute_credits_granted, 0)
  };

  return {
    // Data
    classrooms,
    students,
    lessonPlans,
    analytics,
    sponsorships,
    stats,
    
    // Loading states
    loading,
    aiLoading,
    
    // Actions
    fetchData,
    createClassroom,
    addStudent,
    generateLessonPlan,
    generateWeeklyCurriculum,
    gradeSubmission,
    analyzeClass,
    generateProgressReport
  };
}