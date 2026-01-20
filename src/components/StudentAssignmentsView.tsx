import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ModuleLessonPlayer } from '@/components/ModuleLessonPlayer';
import { useStudentAssignments, StudentAssignment } from '@/hooks/useStudentAssignments';
import { getModuleById, type EducationModule } from '@/data/educationModules';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, isPast, isFuture, isToday } from 'date-fns';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trophy,
  Target,
  Calendar,
  Timer,
  ArrowRight,
  Loader2,
  FileText,
  Sparkles,
} from 'lucide-react';

interface AssignmentCardProps {
  assignment: StudentAssignment;
  onStart: (assignment: StudentAssignment) => void;
  onContinue: (assignment: StudentAssignment) => void;
}

function AssignmentCard({ assignment, onStart, onContinue }: AssignmentCardProps) {
  const module = getModuleById(assignment.assignment.module_id);
  const dueDate = assignment.assignment.due_date ? new Date(assignment.assignment.due_date) : null;
  const isOverdue = dueDate && isPast(dueDate) && assignment.status !== 'completed';
  const isDueToday = dueDate && isToday(dueDate);
  const isDueSoon = dueDate && isFuture(dueDate) && !isDueToday && 
    (new Date(dueDate).getTime() - new Date().getTime()) < 3 * 24 * 60 * 60 * 1000; // 3 days

  const getStatusBadge = () => {
    if (assignment.status === 'completed') {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Completed</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (assignment.status === 'in_progress') {
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">In Progress</Badge>;
    }
    if (isDueToday) {
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Due Today</Badge>;
    }
    if (isDueSoon) {
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30">Due Soon</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <Card className={`border-2 transition-all hover:shadow-lg ${
      isOverdue ? 'border-destructive/50 bg-destructive/5' : 
      assignment.status === 'completed' ? 'border-green-500/30 bg-green-500/5' :
      isDueToday ? 'border-yellow-500/30' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getStatusBadge()}
              {module && (
                <Badge variant="secondary" className="text-xs">
                  {module.gradeLevel.toUpperCase()}
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-lg truncate">{assignment.assignment.title}</h3>
            
            {assignment.assignment.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {assignment.assignment.description}
              </p>
            )}
            
            {module && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {module.title}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              {dueDate && (
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  {isOverdue ? 'Was due ' : 'Due '}
                  {formatDistanceToNow(dueDate, { addSuffix: true })}
                </span>
              )}
              
              {module && (
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {module.duration}
                </span>
              )}

              {assignment.status === 'completed' && (
                <>
                  <span className="flex items-center gap-1 text-green-600">
                    <Trophy className="w-3 h-3" />
                    Score: {assignment.score}%
                  </span>
                  {assignment.time_spent_seconds > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeSpent(assignment.time_spent_seconds)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {assignment.status === 'pending' && module && (
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => onStart(assignment)}
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
            
            {assignment.status === 'in_progress' && module && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onContinue(assignment)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {assignment.status === 'completed' && module && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onContinue(assignment)}
              >
                Review
              </Button>
            )}
          </div>
        </div>

        {assignment.status === 'in_progress' && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">In Progress</span>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentAssignmentsView() {
  const {
    pendingAssignments,
    inProgressAssignments,
    completedAssignments,
    overdueAssignments,
    loading,
    startAssignment,
    completeAssignment,
  } = useStudentAssignments();

  const [activeAssignment, setActiveAssignment] = useState<StudentAssignment | null>(null);
  const [activeModule, setActiveModule] = useState<EducationModule | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleStartAssignment = async (assignment: StudentAssignment) => {
    const module = getModuleById(assignment.assignment.module_id);
    if (!module) return;

    // Mark as in_progress if pending
    if (assignment.status === 'pending') {
      await startAssignment(assignment.id);
    }

    startTimeRef.current = Date.now();
    setActiveAssignment(assignment);
    setActiveModule(module);
  };

  const handleContinueAssignment = (assignment: StudentAssignment) => {
    const module = getModuleById(assignment.assignment.module_id);
    if (!module) return;

    startTimeRef.current = Date.now();
    setActiveAssignment(assignment);
    setActiveModule(module);
  };

  const handleCompleteModule = async (moduleId: string) => {
    if (!activeAssignment || !activeModule) return;

    const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const stepsCompleted = activeModule.steps.length;
    const score = Math.min(100, stepsCompleted * 10 + 50); // Base 50 + 10 per step, max 100

    await completeAssignment(activeAssignment.id, score, timeSpentSeconds);
    
    setActiveAssignment(null);
    setActiveModule(null);
  };

  const handleExitModule = () => {
    setActiveAssignment(null);
    setActiveModule(null);
  };

  // Show module player when active
  if (activeModule) {
    return (
      <ModuleLessonPlayer
        module={activeModule}
        onComplete={handleCompleteModule}
        onExit={handleExitModule}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const totalAssignments = pendingAssignments.length + inProgressAssignments.length + completedAssignments.length;
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments.length / totalAssignments) * 100) 
    : 0;

  const avgScore = completedAssignments.length > 0
    ? Math.round(completedAssignments.reduce((sum, a) => sum + a.score, 0) / completedAssignments.length)
    : 0;

  if (totalAssignments === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
          <p className="text-muted-foreground mb-4">
            Your teacher hasn't assigned any modules yet. Check back later!
          </p>
          <Link to="/education">
            <Button variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Explore Modules
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{pendingAssignments.length + inProgressAssignments.length}</p>
            <p className="text-xs text-muted-foreground">To Do</p>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{completedAssignments.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  You have {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Complete them as soon as possible to keep your progress on track.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assignments Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">To Do</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {pendingAssignments.length + inProgressAssignments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Completed</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {completedAssignments.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {inProgressAssignments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                In Progress ({inProgressAssignments.length})
              </h3>
              {inProgressAssignments.map((assignment, i) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AssignmentCard 
                    assignment={assignment} 
                    onStart={handleStartAssignment}
                    onContinue={handleContinueAssignment}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {pendingAssignments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending ({pendingAssignments.length})
              </h3>
              {pendingAssignments.map((assignment, i) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AssignmentCard 
                    assignment={assignment} 
                    onStart={handleStartAssignment}
                    onContinue={handleContinueAssignment}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {pendingAssignments.length === 0 && inProgressAssignments.length === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-500" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground">You have no pending assignments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAssignments.length > 0 ? (
            completedAssignments.map((assignment, i) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AssignmentCard 
                  assignment={assignment} 
                  onStart={handleStartAssignment}
                  onContinue={handleContinueAssignment}
                />
              </motion.div>
            ))
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="py-8 text-center">
                <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">No completed assignments yet</p>
                <p className="text-sm text-muted-foreground">Start working on your pending assignments!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {[...inProgressAssignments, ...pendingAssignments, ...completedAssignments].map((assignment, i) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <AssignmentCard 
                assignment={assignment} 
                onStart={handleStartAssignment}
                onContinue={handleContinueAssignment}
              />
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
