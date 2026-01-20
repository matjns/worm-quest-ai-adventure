import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MissionResult {
  missionId: string;
  xpEarned: number;
  accuracy: number;
  skillsUsed: string[];
  success: boolean;
}

interface ProgressData {
  missions_completed: number;
  total_xp: number;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
}

export function useProgressTracker() {
  const { user } = useAuth();

  const updateProgress = useCallback(async (result: MissionResult): Promise<boolean> => {
    if (!user?.id) {
      console.log('No user logged in, progress not saved');
      return false;
    }

    try {
      // Get student record
      const { data: student, error: fetchError } = await supabase
        .from('students')
        .select('id, classroom_id, progress_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!student) {
        console.log('No student record found, progress not saved to classroom');
        return false;
      }

      const currentProgress = (student.progress_data as unknown as ProgressData) || {
        missions_completed: 0,
        total_xp: 0,
        accuracy: 0,
        strengths: [],
        weaknesses: []
      };

      // Calculate new stats
      const newMissionsCompleted = currentProgress.missions_completed + (result.success ? 1 : 0);
      const newTotalXP = currentProgress.total_xp + result.xpEarned;
      
      // Rolling average for accuracy
      const newAccuracy = currentProgress.missions_completed > 0
        ? Math.round(((currentProgress.accuracy * currentProgress.missions_completed) + result.accuracy) / (currentProgress.missions_completed + 1))
        : result.accuracy;

      // Update strengths (skills with good performance)
      const newStrengths = [...new Set([...currentProgress.strengths, ...result.skillsUsed.filter(s => result.accuracy >= 70)])].slice(0, 5);
      
      // Update weaknesses (skills with poor performance)
      const newWeaknesses = result.accuracy < 60 
        ? [...new Set([...currentProgress.weaknesses, ...result.skillsUsed])].slice(0, 5)
        : currentProgress.weaknesses;

      const updatedProgress: ProgressData = {
        missions_completed: newMissionsCompleted,
        total_xp: newTotalXP,
        accuracy: newAccuracy,
        strengths: newStrengths,
        weaknesses: newWeaknesses.filter(w => !newStrengths.includes(w)) // Remove from weaknesses if now a strength
      };

      // Update student record
      const { error: updateError } = await supabase
        .from('students')
        .update({ 
          progress_data: updatedProgress as unknown as Record<string, never>,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id);

      if (updateError) throw updateError;

      // Also update classroom analytics for today
      await updateClassroomAnalytics(student.classroom_id, result);

      console.log('Progress updated:', updatedProgress);
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }, [user?.id]);

  const updateClassroomAnalytics = async (classroomId: string, result: MissionResult) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      // Try to get existing analytics for today
      const { data: existing } = await supabase
        .from('classroom_analytics')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from('classroom_analytics')
          .update({
            missions_completed: (existing.missions_completed || 0) + (result.success ? 1 : 0),
            total_xp_earned: (existing.total_xp_earned || 0) + result.xpEarned,
            active_students: existing.active_students || 1,
            avg_accuracy: existing.avg_accuracy 
              ? ((existing.avg_accuracy + result.accuracy) / 2) 
              : result.accuracy
          })
          .eq('id', existing.id);
      } else {
        // Create new record for today
        await supabase
          .from('classroom_analytics')
          .insert({
            classroom_id: classroomId,
            date: today,
            missions_completed: result.success ? 1 : 0,
            total_xp_earned: result.xpEarned,
            active_students: 1,
            avg_accuracy: result.accuracy
          });
      }
    } catch (error) {
      console.error('Error updating classroom analytics:', error);
    }
  };

  const awardXP = useCallback(async (xp: number, reason: string): Promise<boolean> => {
    return updateProgress({
      missionId: `bonus_${Date.now()}`,
      xpEarned: xp,
      accuracy: 100,
      skillsUsed: [],
      success: true
    });
  }, [updateProgress]);

  return {
    updateProgress,
    awardXP
  };
}