import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Rocket,
  Star,
  Trophy,
  Zap,
  Brain,
  Target,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface ActivityItem {
  id: string;
  studentName: string;
  type: 'mission' | 'level_up' | 'achievement' | 'xp_gain' | 'accuracy';
  message: string;
  timestamp: Date;
  value?: number;
}

interface ActivityFeedProps {
  classroomId: string;
  currentUserId?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'mission': return <Rocket className="w-4 h-4 text-primary" />;
    case 'level_up': return <Star className="w-4 h-4 text-yellow-500" />;
    case 'achievement': return <Trophy className="w-4 h-4 text-amber-500" />;
    case 'xp_gain': return <Zap className="w-4 h-4 text-green-500" />;
    case 'accuracy': return <Target className="w-4 h-4 text-blue-500" />;
    default: return <Brain className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActivityBadge = (type: ActivityItem['type']) => {
  switch (type) {
    case 'mission': return { label: 'Mission', className: 'bg-primary/20 text-primary' };
    case 'level_up': return { label: 'Level Up', className: 'bg-yellow-500/20 text-yellow-600' };
    case 'achievement': return { label: 'Achievement', className: 'bg-amber-500/20 text-amber-600' };
    case 'xp_gain': return { label: 'XP', className: 'bg-green-500/20 text-green-600' };
    case 'accuracy': return { label: 'Accuracy', className: 'bg-blue-500/20 text-blue-600' };
    default: return { label: 'Activity', className: 'bg-muted' };
  }
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

interface StudentProgress {
  missions_completed: number;
  total_xp: number;
  accuracy: number;
  strengths: string[];
  weaknesses: string[];
}

export function ActivityFeed({ classroomId, currentUserId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Generate activity from student update
  const generateActivityFromUpdate = (
    studentName: string, 
    oldProgress: StudentProgress | null, 
    newProgress: StudentProgress,
    isCurrentUser: boolean
  ): ActivityItem[] => {
    const items: ActivityItem[] = [];
    const displayName = isCurrentUser ? 'You' : studentName;

    // Check for mission completion
    if (oldProgress && newProgress.missions_completed > oldProgress.missions_completed) {
      items.push({
        id: `mission-${Date.now()}-${Math.random()}`,
        studentName: displayName,
        type: 'mission',
        message: `${displayName} completed a mission!`,
        timestamp: new Date(),
        value: newProgress.missions_completed
      });
    }

    // Check for XP gain
    if (oldProgress && newProgress.total_xp > oldProgress.total_xp) {
      const xpGained = newProgress.total_xp - oldProgress.total_xp;
      items.push({
        id: `xp-${Date.now()}-${Math.random()}`,
        studentName: displayName,
        type: 'xp_gain',
        message: `${displayName} earned ${xpGained} XP!`,
        timestamp: new Date(),
        value: xpGained
      });

      // Check for level up
      const oldLevel = Math.floor(oldProgress.total_xp / 100) + 1;
      const newLevel = Math.floor(newProgress.total_xp / 100) + 1;
      if (newLevel > oldLevel) {
        items.push({
          id: `level-${Date.now()}-${Math.random()}`,
          studentName: displayName,
          type: 'level_up',
          message: `${displayName} reached Level ${newLevel}!`,
          timestamp: new Date(),
          value: newLevel
        });
      }
    }

    // Check for accuracy milestone
    if (oldProgress && newProgress.accuracy >= 80 && oldProgress.accuracy < 80) {
      items.push({
        id: `accuracy-${Date.now()}-${Math.random()}`,
        studentName: displayName,
        type: 'achievement',
        message: `${displayName} achieved 80%+ accuracy!`,
        timestamp: new Date(),
        value: newProgress.accuracy
      });
    }

    return items;
  };

  // Track previous progress for comparison
  const [progressCache, setProgressCache] = useState<Map<string, StudentProgress>>(new Map());

  // Initial load - fetch recent activity based on current state
  useEffect(() => {
    const fetchInitialActivity = async () => {
      const { data: students } = await supabase
        .from('students')
        .select('id, display_name, progress_data, user_id, updated_at')
        .eq('classroom_id', classroomId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (students) {
        const initialActivities: ActivityItem[] = [];
        const cache = new Map<string, StudentProgress>();

        students.forEach(student => {
          const progress = student.progress_data as unknown as StudentProgress;
          cache.set(student.id, progress);

          if (progress?.missions_completed > 0) {
            initialActivities.push({
              id: `init-${student.id}`,
              studentName: student.user_id === currentUserId ? 'You' : student.display_name,
              type: 'mission',
              message: `${student.user_id === currentUserId ? 'You' : student.display_name} completed ${progress.missions_completed} mission${progress.missions_completed > 1 ? 's' : ''}`,
              timestamp: new Date(student.updated_at),
              value: progress.missions_completed
            });
          }
        });

        setProgressCache(cache);
        setActivities(initialActivities.slice(0, 5));
      }
    };

    fetchInitialActivity();
  }, [classroomId, currentUserId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!classroomId) return;

    const channel = supabase
      .channel(`activity-feed-${classroomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
          filter: `classroom_id=eq.${classroomId}`
        },
        async (payload) => {
          const updatedStudent = payload.new as {
            id: string;
            display_name: string;
            progress_data: StudentProgress;
            user_id: string;
          };

          const oldProgress = progressCache.get(updatedStudent.id);
          const newProgress = updatedStudent.progress_data;
          const isCurrentUser = updatedStudent.user_id === currentUserId;

          const newActivities = generateActivityFromUpdate(
            updatedStudent.display_name,
            oldProgress,
            newProgress,
            isCurrentUser
          );

          if (newActivities.length > 0) {
            setActivities(prev => [...newActivities, ...prev].slice(0, 20));
            setIsLive(true);
            setTimeout(() => setIsLive(false), 2000);
          }

          // Update cache
          setProgressCache(prev => {
            const updated = new Map(prev);
            updated.set(updatedStudent.id, newProgress);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classroomId, currentUserId, progressCache]);

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Class Activity
          </CardTitle>
          {isLive && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 inline-block" />
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Complete missions to see updates here!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => {
                const badge = getActivityBadge(activity.type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 p-2.5 rounded-lg ${
                      activity.studentName === 'You' 
                        ? 'bg-primary/5 border border-primary/20' 
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-background border">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={`text-xs ${badge.className}`}>
                          {badge.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    {activity.value && activity.type === 'xp_gain' && (
                      <div className="text-sm font-bold text-green-500">
                        +{activity.value}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
