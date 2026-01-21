import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentEntropyData } from '@/hooks/useClassroomEntropy';
import { 
  Route, Brain, Target, Zap, BookOpen, TrendingUp, AlertTriangle,
  Lightbulb, CheckCircle2, Clock, Sparkles, ArrowRight, Play,
  GraduationCap, Puzzle, Eye, Ear, Hand, FileText, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InterventionPlannerProps {
  student: StudentEntropyData;
  onClose: () => void;
  onSavePlan?: (plan: InterventionPlan) => void;
}

interface LearningPathStep {
  id: string;
  module: string;
  activity: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scaffolding: string[];
  objective: string;
}

interface InterventionPlan {
  studentId: string;
  studentName: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  learningStyle: string;
  targetEntropy: number;
  steps: LearningPathStep[];
  notes: string;
}

const LEARNING_STYLE_ICONS: Record<string, React.ReactNode> = {
  visual: <Eye className="w-4 h-4" />,
  auditory: <Ear className="w-4 h-4" />,
  kinesthetic: <Hand className="w-4 h-4" />,
  reading: <FileText className="w-4 h-4" />,
};

const MODULE_ACTIVITIES: Record<string, { name: string; activities: string[]; prerequisites: string[] }> = {
  neurons: {
    name: 'Neuron Basics',
    activities: ['Interactive Neuron Explorer', 'Neuron Types Quiz', 'Build-a-Neuron Game', '3D Neuron Visualization'],
    prerequisites: [],
  },
  synapses: {
    name: 'Synaptic Connections',
    activities: ['Synapse Simulator', 'Connection Mapping', 'Signal Transmission Game', 'Synapse Strength Lab'],
    prerequisites: ['neurons'],
  },
  connectome: {
    name: 'Connectome Mapping',
    activities: ['Full Connectome Explorer', 'Circuit Tracing Challenge', 'Neural Pathway Quiz', 'Worm Brain Builder'],
    prerequisites: ['neurons', 'synapses'],
  },
  behavior: {
    name: 'Behavioral Circuits',
    activities: ['Stimulus-Response Lab', 'Behavior Prediction Game', 'Circuit-to-Behavior Mapping', 'Worm Movement Analysis'],
    prerequisites: ['connectome'],
  },
  signals: {
    name: 'Signal Propagation',
    activities: ['Action Potential Simulator', 'Signal Race Game', 'Calcium Imaging Lab', 'Neural Network Trainer'],
    prerequisites: ['neurons', 'synapses'],
  },
};

export function InterventionPlanner({ student, onClose, onSavePlan }: InterventionPlannerProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'path' | 'plan'>('analysis');
  const [selectedPath, setSelectedPath] = useState<LearningPathStep[]>([]);
  const [planNotes, setPlanNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Analyze student's weaknesses
  const analyzeWeaknesses = () => {
    const weakModules: string[] = [];
    const strengths: string[] = [];

    // Check failed attempts
    Object.entries(student.failed_attempts).forEach(([module, count]) => {
      if (count >= 2) weakModules.push(module);
    });

    // Check skill metrics
    Object.entries(student.skill_metrics).forEach(([skill, score]) => {
      if (score < 50) weakModules.push(skill);
      else if (score >= 80) strengths.push(skill);
    });

    // Deduplicate
    return {
      weakModules: [...new Set(weakModules)],
      strengths: [...new Set(strengths)],
    };
  };

  // Detect learning style from profile
  const detectLearningStyle = (): string => {
    const style = student.learning_style as Record<string, number>;
    if (!style || Object.keys(style).length === 0) return 'mixed';
    
    const sorted = Object.entries(style).sort((a, b) => (b[1] as number) - (a[1] as number));
    return sorted[0]?.[0] || 'mixed';
  };

  // Generate recommended learning path
  const generateLearningPath = (): LearningPathStep[] => {
    const { weakModules } = analyzeWeaknesses();
    const learningStyle = detectLearningStyle();
    const path: LearningPathStep[] = [];

    // Sort weak modules by prerequisites
    const sortedModules = weakModules.sort((a, b) => {
      const aPrereqs = MODULE_ACTIVITIES[a]?.prerequisites.length || 0;
      const bPrereqs = MODULE_ACTIVITIES[b]?.prerequisites.length || 0;
      return aPrereqs - bPrereqs;
    });

    sortedModules.forEach((module, index) => {
      const moduleData = MODULE_ACTIVITIES[module];
      if (!moduleData) return;

      // Select activities based on learning style
      const activities = moduleData.activities;
      const selectedActivity = learningStyle === 'kinesthetic' 
        ? activities.find(a => a.includes('Game') || a.includes('Lab') || a.includes('Builder')) || activities[0]
        : learningStyle === 'visual'
          ? activities.find(a => a.includes('Visual') || a.includes('Explorer') || a.includes('Mapping')) || activities[0]
          : activities[0];

      // Determine difficulty based on failure count
      const failures = student.failed_attempts[module] || 0;
      const difficulty: 'easy' | 'medium' | 'hard' = 
        failures >= 3 ? 'easy' : failures >= 1 ? 'medium' : 'hard';

      // Generate scaffolding based on entropy and learning style
      const scaffolding: string[] = [];
      if (student.calculated_entropy && student.calculated_entropy > 1.0) {
        scaffolding.push('Provide step-by-step guided walkthrough');
        scaffolding.push('Break into smaller sub-tasks');
      }
      if (learningStyle === 'visual') {
        scaffolding.push('Include diagrams and animations');
        scaffolding.push('Use color-coded pathways');
      } else if (learningStyle === 'kinesthetic') {
        scaffolding.push('Hands-on interactive elements');
        scaffolding.push('Drag-and-drop building activities');
      } else if (learningStyle === 'auditory') {
        scaffolding.push('Add narrated explanations');
        scaffolding.push('Include discussion prompts');
      }
      if (failures >= 2) {
        scaffolding.push('Review prerequisite concepts first');
        scaffolding.push('Provide worked examples');
      }

      path.push({
        id: `step-${index}`,
        module,
        activity: selectedActivity,
        duration: difficulty === 'easy' ? '20-25 min' : difficulty === 'medium' ? '15-20 min' : '10-15 min',
        difficulty,
        scaffolding,
        objective: `Master ${moduleData.name} concepts with ${Math.round((1 - (failures * 0.1)) * 100)}% accuracy`,
      });
    });

    // If no weak modules, suggest advancement
    if (path.length === 0) {
      const completedModules = student.completed_modules || [];
      const allModules = Object.keys(MODULE_ACTIVITIES);
      const nextModule = allModules.find(m => !completedModules.includes(m));
      
      if (nextModule) {
        const moduleData = MODULE_ACTIVITIES[nextModule];
        path.push({
          id: 'step-advancement',
          module: nextModule,
          activity: moduleData.activities[0],
          duration: '15-20 min',
          difficulty: 'medium',
          scaffolding: ['Standard progression', 'Challenge mode available'],
          objective: `Advance to ${moduleData.name}`,
        });
      }
    }

    return path;
  };

  const { weakModules, strengths } = analyzeWeaknesses();
  const learningStyle = detectLearningStyle();
  const recommendedPath = generateLearningPath();

  const getPriorityLevel = (): 'low' | 'medium' | 'high' | 'urgent' => {
    if (!student.calculated_entropy) return 'low';
    if (student.calculated_entropy >= 1.5) return 'urgent';
    if (student.calculated_entropy >= 1.0) return 'high';
    if (student.calculated_entropy >= 0.5) return 'medium';
    return 'low';
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    
    const plan: InterventionPlan = {
      studentId: student.student_id,
      studentName: student.display_name,
      createdAt: new Date().toISOString(),
      priority: getPriorityLevel(),
      learningStyle,
      targetEntropy: Math.max(0.3, (student.calculated_entropy || 1) - 0.5),
      steps: selectedPath.length > 0 ? selectedPath : recommendedPath,
      notes: planNotes,
    };

    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (onSavePlan) {
      onSavePlan(plan);
    }
    
    toast.success(`Intervention plan created for ${student.display_name}`);
    setIsSaving(false);
    onClose();
  };

  const togglePathStep = (step: LearningPathStep) => {
    setSelectedPath(prev => {
      const exists = prev.find(s => s.id === step.id);
      if (exists) {
        return prev.filter(s => s.id !== step.id);
      }
      return [...prev, step];
    });
  };

  const priority = getPriorityLevel();
  const priorityColors = {
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    high: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Intervention Planner: {student.display_name}
          </DialogTitle>
          <DialogDescription>
            Create a personalized learning path based on entropy analysis
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          <Badge className={cn("border", priorityColors[priority])}>
            {priority.toUpperCase()} Priority
          </Badge>
          <Badge variant="outline" className="gap-1">
            {LEARNING_STYLE_ICONS[learningStyle]}
            {learningStyle.charAt(0).toUpperCase() + learningStyle.slice(1)} Learner
          </Badge>
          <Badge variant="secondary">
            Entropy: {student.calculated_entropy?.toFixed(2) ?? 'N/A'}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis" className="gap-2">
              <Brain className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="path" className="gap-2">
              <Route className="w-4 h-4" />
              Learning Path
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <FileText className="w-4 h-4" />
              Create Plan
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4 mt-0">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Weaknesses */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      Areas Needing Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {weakModules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No significant weaknesses detected!</p>
                    ) : (
                      <div className="space-y-2">
                        {weakModules.map(module => (
                          <div key={module} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                            <span className="font-medium capitalize">{module}</span>
                            <Badge variant="destructive" className="text-xs">
                              {student.failed_attempts[module] || 0} fails
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-green-500">
                      <TrendingUp className="w-4 h-4" />
                      Strengths to Leverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strengths.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Building foundational skills...</p>
                    ) : (
                      <div className="space-y-2">
                        {strengths.map(skill => (
                          <div key={skill} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="font-medium capitalize">{skill}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Learning Profile */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Learning Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {student.completed_modules.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Modules Done</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-500">
                        {student.streak_data.current}
                      </div>
                      <div className="text-xs text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {Math.round(student.average_completion_time / 60)}m
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Time</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold capitalize">
                        {student.scaffolding_level}
                      </div>
                      <div className="text-xs text-muted-foreground">Support Level</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Path Tab */}
            <TabsContent value="path" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI-Recommended Learning Path
                </h3>
                <Badge variant="outline">
                  {recommendedPath.length} steps
                </Badge>
              </div>

              <div className="space-y-3">
                {recommendedPath.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedPath.find(s => s.id === step.id) && "ring-2 ring-primary"
                      )}
                      onClick={() => togglePathStep(step)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0",
                            step.difficulty === 'easy' ? "bg-green-500" :
                            step.difficulty === 'medium' ? "bg-blue-500" : "bg-purple-500"
                          )}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold capitalize">{step.module}</span>
                              <Badge variant="secondary" className="text-xs">
                                {step.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs gap-1">
                                <Clock className="w-3 h-3" />
                                {step.duration}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {step.activity}
                            </p>
                            
                            <div className="flex items-center gap-1 text-xs text-primary mb-2">
                              <Target className="w-3 h-3" />
                              {step.objective}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {step.scaffolding.slice(0, 2).map((scaffold, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-primary/5">
                                  <Lightbulb className="w-3 h-3 mr-1" />
                                  {scaffold}
                                </Badge>
                              ))}
                              {step.scaffolding.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{step.scaffolding.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {selectedPath.find(s => s.id === step.id) ? (
                              <CheckCircle2 className="w-6 h-6 text-primary" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {recommendedPath.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <h3 className="font-semibold mb-1">Student is on track!</h3>
                      <p className="text-sm text-muted-foreground">
                        No specific interventions needed. Consider enrichment activities.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Create Plan Tab */}
            <TabsContent value="plan" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Intervention Steps</CardTitle>
                  <CardDescription>
                    {selectedPath.length === 0 
                      ? "No steps selected. All recommended steps will be included."
                      : `${selectedPath.length} custom steps selected`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(selectedPath.length > 0 ? selectedPath : recommendedPath).map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <span className="flex-1 capitalize">{step.module}: {step.activity}</span>
                      <Badge variant="outline">{step.duration}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Teacher Notes</CardTitle>
                  <CardDescription>Add context or specific instructions for this intervention</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g., Student responds well to visual examples. Consider pairing with a study buddy..."
                    value={planNotes}
                    onChange={(e) => setPlanNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Target Outcome</h4>
                      <p className="text-sm text-muted-foreground">
                        Reduce entropy from {student.calculated_entropy?.toFixed(2) ?? 'N/A'} to {Math.max(0.3, (student.calculated_entropy || 1) - 0.5).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Estimated Time</div>
                      <div className="font-semibold">
                        {(selectedPath.length > 0 ? selectedPath : recommendedPath).length * 20} min total
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSavePlan} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Create Intervention Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
