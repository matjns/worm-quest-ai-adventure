import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useParentPortal } from '@/hooks/useParentPortal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Link2, 
  Target, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Award,
  BookOpen,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ParentPortal() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    linkedStudents,
    loading,
    linkingCode,
    setLinkingCode,
    linkWithCode,
    getStudentPlans,
    getPlanProgress,
    getPlanSnapshots,
    refresh
  } = useParentPortal();
  
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkChild = async () => {
    if (!linkingCode.trim()) return;
    setIsLinking(true);
    await linkWithCode(linkingCode);
    setLinkingCode('');
    setIsLinking(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Parent Portal</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to view your child's learning progress and intervention plans.
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeStudent = selectedStudent 
    ? linkedStudents.find(s => s.id === selectedStudent)
    : linkedStudents[0];

  const studentPlans = activeStudent ? getStudentPlans(activeStudent.id) : [];
  const activePlan = studentPlans.find(p => p.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Parent Portal</h1>
            <p className="text-muted-foreground">
              Track your child's learning journey and intervention progress
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {linkedStudents.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Link Your Child
              </CardTitle>
              <CardDescription>
                Enter the invite code provided by your child's teacher to connect your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter invite code (e.g., ABC12345)"
                  value={linkingCode}
                  onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                  className="uppercase"
                  maxLength={8}
                />
                <Button onClick={handleLinkChild} disabled={isLinking || !linkingCode.trim()}>
                  {isLinking ? 'Linking...' : 'Link'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask your child's teacher for an invite code to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Student Selector Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  My Children
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {linkedStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      (selectedStudent || linkedStudents[0]?.id) === student.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{student.display_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.progress_data.total_xp} XP earned
                    </div>
                  </button>
                ))}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Link another child</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Code"
                      value={linkingCode}
                      onChange={(e) => setLinkingCode(e.target.value.toUpperCase())}
                      className="uppercase text-sm"
                      maxLength={8}
                    />
                    <Button size="sm" onClick={handleLinkChild} disabled={isLinking}>
                      <Link2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {activeStudent && (
                <>
                  {/* Stats Overview */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {activeStudent.progress_data.total_xp}
                            </div>
                            <div className="text-sm text-muted-foreground">Total XP</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {activeStudent.progress_data.missions_completed}
                            </div>
                            <div className="text-sm text-muted-foreground">Missions Done</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Target className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">
                              {Math.round(activeStudent.progress_data.accuracy)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Accuracy</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Intervention Plans */}
                  <Tabs defaultValue="active">
                    <TabsList>
                      <TabsTrigger value="active" className="gap-2">
                        <Activity className="w-4 h-4" />
                        Active Plan
                      </TabsTrigger>
                      <TabsTrigger value="history" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        History
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-4">
                      {activePlan ? (
                        <InterventionPlanView
                          plan={activePlan}
                          progress={getPlanProgress(activePlan.id)}
                          snapshots={getPlanSnapshots(activePlan.id)}
                        />
                      ) : (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="font-medium mb-2">No Active Intervention Plan</h3>
                            <p className="text-sm text-muted-foreground">
                              Your child doesn't have an active learning intervention at this time.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Plan History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {studentPlans.length > 0 ? (
                            <ScrollArea className="h-[400px]">
                              <div className="space-y-3">
                                {studentPlans.map(plan => {
                                  const planProgress = getPlanProgress(plan.id);
                                  const completedSteps = planProgress.filter(p => p.status === 'completed').length;
                                  const totalSteps = plan.steps.length;
                                  
                                  return (
                                    <div
                                      key={plan.id}
                                      className="p-4 rounded-lg border bg-card"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                            {plan.status}
                                          </Badge>
                                          <Badge variant="outline" className="ml-2">
                                            {plan.priority} priority
                                          </Badge>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                          {format(new Date(plan.created_at), 'MMM d, yyyy')}
                                        </span>
                                      </div>
                                      
                                      <div className="mt-3">
                                        <div className="flex justify-between text-sm mb-1">
                                          <span>Progress</span>
                                          <span>{completedSteps}/{totalSteps} steps</span>
                                        </div>
                                        <Progress value={(completedSteps / totalSteps) * 100} />
                                      </div>

                                      {plan.learning_style && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          Learning style: {plan.learning_style}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          ) : (
                            <p className="text-muted-foreground text-center py-8">
                              No intervention plans have been created yet.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface InterventionPlanViewProps {
  plan: {
    id: string;
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
  };
  progress: Array<{
    step_index: number;
    status: string;
    score: number | null;
    time_spent_seconds: number | null;
    completed_at: string | null;
  }>;
  snapshots: Array<{
    entropy_value: number;
    steps_completed: number;
    snapshot_date: string;
  }>;
}

function InterventionPlanView({ plan, progress, snapshots }: InterventionPlanViewProps) {
  const completedSteps = progress.filter(p => p.status === 'completed').length;
  const totalSteps = plan.steps.length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const chartData = snapshots.map(s => ({
    date: format(new Date(s.snapshot_date), 'MMM d'),
    entropy: s.entropy_value,
    steps: s.steps_completed
  }));

  // Add initial point if we have initial entropy
  if (plan.initial_entropy && chartData.length === 0) {
    chartData.unshift({
      date: format(new Date(plan.created_at), 'MMM d'),
      entropy: plan.initial_entropy,
      steps: 0
    });
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Current Intervention Plan
              </CardTitle>
              <CardDescription>
                Started {format(new Date(plan.created_at), 'MMMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge>{plan.priority} priority</Badge>
              {plan.learning_style && (
                <Badge variant="outline">{plan.learning_style} learner</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Progress</span>
                <span>{completedSteps} of {totalSteps} steps completed</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {plan.initial_entropy && plan.target_entropy && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Starting Entropy</div>
                    <div className="font-semibold">{plan.initial_entropy.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Target Entropy</div>
                    <div className="font-semibold">{plan.target_entropy.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entropy Reduction Over Time</CardTitle>
            <CardDescription>
              Lower entropy indicates more focused, confident learning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="entropy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan.steps.map((step, index) => {
              const stepProgress = progress.find(p => p.step_index === index);
              const isCompleted = stepProgress?.status === 'completed';
              const isInProgress = stepProgress?.status === 'in_progress';

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors ${
                    isCompleted 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : isInProgress 
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isInProgress
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{step.title}</h4>
                        {isInProgress && (
                          <Badge variant="secondary" className="text-xs">In Progress</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {step.activity_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.duration_minutes} min
                        </span>
                        {stepProgress?.score !== null && (
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Score: {stepProgress.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    {isCompleted && stepProgress?.completed_at && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(stepProgress.completed_at), 'MMM d')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}