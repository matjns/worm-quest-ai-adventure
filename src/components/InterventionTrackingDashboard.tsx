import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInterventionPlans, InterventionPlan } from '@/hooks/useInterventionPlans';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Route, CheckCircle2, Clock, Play, Pause, X, Trash2,
  TrendingDown, AlertTriangle, Target, Award, Calendar,
  BarChart3, RefreshCw, ChevronRight, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface InterventionTrackingDashboardProps {
  classroomId?: string;
  className?: string;
}

export function InterventionTrackingDashboard({ classroomId, className }: InterventionTrackingDashboardProps) {
  const {
    plans,
    loading,
    updatePlanStatus,
    startStep,
    completeStep,
    addSnapshot,
    deletePlan,
    getPlanStats,
    refetch,
  } = useInterventionPlans(classroomId);

  const [selectedPlan, setSelectedPlan] = useState<InterventionPlan | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snapshotDialog, setSnapshotDialog] = useState<{ planId: string; open: boolean } | null>(null);
  const [newEntropyValue, setNewEntropyValue] = useState('');
  const [snapshotNotes, setSnapshotNotes] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSaveSnapshot = async () => {
    if (!snapshotDialog?.planId || !newEntropyValue) return;
    
    const plan = plans.find(p => p.id === snapshotDialog.planId);
    if (!plan) return;

    const stats = getPlanStats(plan);
    await addSnapshot(
      snapshotDialog.planId,
      parseFloat(newEntropyValue),
      stats.stepsCompleted,
      snapshotNotes
    );
    
    setSnapshotDialog(null);
    setNewEntropyValue('');
    setSnapshotNotes('');
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-green-500/10 text-green-500',
    medium: 'bg-blue-500/10 text-blue-500',
    high: 'bg-amber-500/10 text-amber-500',
    urgent: 'bg-red-500/10 text-red-500',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-500',
    paused: 'bg-amber-500/10 text-amber-500',
    completed: 'bg-blue-500/10 text-blue-500',
    cancelled: 'bg-muted text-muted-foreground',
  };

  const activePlans = plans.filter(p => p.status === 'active');
  const completedPlans = plans.filter(p => p.status === 'completed');

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              Intervention Tracking
            </CardTitle>
            <CardDescription>
              Monitor and track student intervention plans
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <Route className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-1">No intervention plans yet</h3>
            <p className="text-sm text-muted-foreground">
              Create plans from the Entropy Leaderboard to start tracking
            </p>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="gap-2">
                <Play className="w-4 h-4" />
                Active ({activePlans.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedPlans.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activePlans.map((plan) => {
                    const stats = getPlanStats(plan);
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        stats={stats}
                        priorityColors={priorityColors}
                        statusColors={statusColors}
                        onSelect={() => setSelectedPlan(plan)}
                        onPause={() => updatePlanStatus(plan.id, 'paused')}
                        onSnapshot={() => setSnapshotDialog({ planId: plan.id, open: true })}
                      />
                    );
                  })}
                  {activePlans.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No active intervention plans
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {completedPlans.map((plan) => {
                    const stats = getPlanStats(plan);
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        stats={stats}
                        priorityColors={priorityColors}
                        statusColors={statusColors}
                        onSelect={() => setSelectedPlan(plan)}
                      />
                    );
                  })}
                  {completedPlans.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No completed intervention plans
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {/* Plan Detail Dialog */}
      {selectedPlan && (
        <PlanDetailDialog
          plan={selectedPlan}
          stats={getPlanStats(selectedPlan)}
          onClose={() => setSelectedPlan(null)}
          onStartStep={startStep}
          onCompleteStep={completeStep}
          onComplete={() => updatePlanStatus(selectedPlan.id, 'completed')}
          onDelete={() => {
            deletePlan(selectedPlan.id);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* Snapshot Dialog */}
      <Dialog open={snapshotDialog?.open} onOpenChange={() => setSnapshotDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Record Progress Snapshot
            </DialogTitle>
            <DialogDescription>
              Record the student's current entropy level to track progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Current Entropy Value</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="3"
                placeholder="e.g., 0.8"
                value={newEntropyValue}
                onChange={(e) => setNewEntropyValue(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Observations about student progress..."
                value={snapshotNotes}
                onChange={(e) => setSnapshotNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSnapshotDialog(null)}>Cancel</Button>
            <Button onClick={handleSaveSnapshot} disabled={!newEntropyValue}>
              Save Snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface PlanCardProps {
  plan: InterventionPlan;
  stats: ReturnType<ReturnType<typeof useInterventionPlans>['getPlanStats']>;
  priorityColors: Record<string, string>;
  statusColors: Record<string, string>;
  onSelect: () => void;
  onPause?: () => void;
  onSnapshot?: () => void;
}

function PlanCard({ plan, stats, priorityColors, statusColors, onSelect, onPause, onSnapshot }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold truncate">{plan.student_name}</span>
            <Badge className={priorityColors[plan.priority]}>{plan.priority}</Badge>
            <Badge className={statusColors[plan.status]}>{plan.status}</Badge>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {plan.classroom_name} • Created {format(new Date(plan.created_at), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Progress value={stats.percentComplete} className="h-2 max-w-[150px]" />
              <span className="text-xs text-muted-foreground">
                {stats.stepsCompleted}/{stats.totalSteps} steps
              </span>
            </div>
            {stats.entropyReduction > 0 && (
              <Badge variant="outline" className="text-green-500 gap-1">
                <TrendingDown className="w-3 h-3" />
                -{stats.entropyReduction.toFixed(2)}
              </Badge>
            )}
            {!stats.onTrack && plan.status === 'active' && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Off Track
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {onSnapshot && (
            <Button variant="ghost" size="icon" onClick={onSnapshot}>
              <Camera className="w-4 h-4" />
            </Button>
          )}
          {onPause && (
            <Button variant="ghost" size="icon" onClick={onPause}>
              <Pause className="w-4 h-4" />
            </Button>
          )}
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

interface PlanDetailDialogProps {
  plan: InterventionPlan;
  stats: ReturnType<ReturnType<typeof useInterventionPlans>['getPlanStats']>;
  onClose: () => void;
  onStartStep: (progressId: string) => Promise<boolean>;
  onCompleteStep: (progressId: string, score?: number, timeSpent?: number, notes?: string) => Promise<boolean>;
  onComplete: () => void;
  onDelete: () => void;
}

function PlanDetailDialog({ plan, stats, onClose, onStartStep, onCompleteStep, onComplete, onDelete }: PlanDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'progress'>('steps');

  const chartData = plan.snapshots?.map(s => ({
    date: format(new Date(s.created_at), 'MMM d'),
    entropy: s.entropy_value,
    steps: s.steps_completed,
  })) || [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            {plan.student_name}'s Intervention Plan
          </DialogTitle>
          <DialogDescription>
            Created {format(new Date(plan.created_at), 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          <Badge variant="outline" className="gap-1">
            <Target className="w-3 h-3" />
            Target: {plan.target_entropy?.toFixed(2)}
          </Badge>
          <Badge variant="outline" className="gap-1">
            Current: {stats.currentEntropy?.toFixed(2) ?? 'N/A'}
          </Badge>
          <Badge variant="outline">{stats.percentComplete}% Complete</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="progress">Progress Chart</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="steps" className="mt-0 space-y-3">
              {plan.steps.map((step, index) => {
                const progress = plan.progress?.find(p => p.step_index === index);
                const isCompleted = progress?.status === 'completed';
                const isInProgress = progress?.status === 'in_progress';

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "p-4 border rounded-lg",
                      isCompleted && "bg-green-500/5 border-green-500/20",
                      isInProgress && "bg-blue-500/5 border-blue-500/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0",
                        isCompleted ? "bg-green-500 text-white" :
                        isInProgress ? "bg-blue-500 text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium capitalize">{step.module}: {step.activity}</div>
                        <div className="text-sm text-muted-foreground">{step.objective}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {progress?.score && (
                          <Badge variant="secondary">{progress.score}%</Badge>
                        )}
                        {!isCompleted && progress && plan.status === 'active' && (
                          <>
                            {!isInProgress ? (
                              <Button size="sm" variant="outline" onClick={() => onStartStep(progress.id)}>
                                <Play className="w-3 h-3 mr-1" />
                                Start
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => onCompleteStep(progress.id, 85, 900)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Complete
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              {chartData.length > 1 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 2]} className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="entropy"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        name="Entropy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Not enough data points for a chart yet.</p>
                  <p className="text-sm">Add more snapshots to visualize progress.</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {plan.notes && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <strong>Notes:</strong> {plan.notes}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>Close</Button>
          {plan.status === 'active' && stats.percentComplete === 100 && (
            <Button onClick={onComplete}>
              <Award className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
