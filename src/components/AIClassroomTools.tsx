import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LearningStyleDetector } from '@/components/LearningStyleDetector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sparkles,
  Brain,
  Users,
  Target,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Play,
  ExternalLink,
  Loader2,
  Lightbulb,
  GraduationCap,
  Microscope,
  Video,
  BookOpen,
  Zap,
  TrendingUp,
  Eye,
} from 'lucide-react';

interface StudentProfile {
  id: string;
  name: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  skillLevel: number;
  strengths: string[];
  struggles: string[];
  recentAccuracy: number;
}

interface ValidationResult {
  validation_score: number;
  anatomical_accuracy: string;
  functional_plausibility: string;
  scientific_accuracy: string;
  discrepancies: string[];
  corrections: { issue: string; fix: string }[];
  praise: string[];
  openworm_references: string[];
}

interface PersonalizationResult {
  adapted_content: string;
  scaffolding: string[];
  extensions: string[];
  differentiation_notes: string;
  estimated_difficulty: number;
  success_prediction: number;
}

// Demo videos for different features
const DEMO_VIDEOS = [
  {
    id: 'intro',
    title: 'NeuroQuest Platform Overview',
    duration: '4:12',
    description: 'Complete walkthrough of the AI-powered neuroscience learning platform',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
  },
  {
    id: 'personalization',
    title: 'AI Lesson Personalization',
    duration: '3:45',
    description: 'How AI adapts lessons to individual student needs',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'validation',
    title: 'OpenWorm Ground Truth Validation',
    duration: '4:02',
    description: 'Validating student circuits against real C. elegans data',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'classroom',
    title: 'Teacher Dashboard Tutorial',
    duration: '3:58',
    description: 'Managing classrooms and tracking student progress',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

interface AIClassroomToolsProps {
  classroomId: string;
  gradeLevel: string;
  students: StudentProfile[];
}

export function AIClassroomTools({ classroomId, gradeLevel, students }: AIClassroomToolsProps) {
  const [activeTab, setActiveTab] = useState('personalize');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [lessonContent, setLessonContent] = useState('');
  const [simulationData, setSimulationData] = useState('');
  const [personalizationResult, setPersonalizationResult] = useState<PersonalizationResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handlePersonalize = async () => {
    if (!selectedStudent || !lessonContent) {
      toast.error('Please select a student and enter lesson content');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'personalize_lesson',
          gradeLevel,
          lessonContent: { content: lessonContent },
          studentProfile: {
            name: student.name,
            learning_style: student.learningStyle,
            skill_level: student.skillLevel,
            strengths: student.strengths,
            struggles: student.struggles,
            recent_accuracy: student.recentAccuracy,
          },
        },
      });

      if (error) throw error;

      setPersonalizationResult(data.result);
      toast.success('Lesson personalized successfully!');
    } catch (error) {
      console.error('Personalization error:', error);
      toast.error('Failed to personalize lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!simulationData) {
      toast.error('Please enter simulation data to validate');
      return;
    }

    setLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(simulationData);
      } catch {
        parsedData = { description: simulationData };
      }

      const { data, error } = await supabase.functions.invoke('teacher-ai', {
        body: {
          type: 'validate_simulation',
          gradeLevel,
          simulationData: parsedData,
        },
      });

      if (error) throw error;

      setValidationResult(data.result);
      toast.success('Simulation validated against OpenWorm data!');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Classroom Tools</CardTitle>
                <CardDescription>
                  AI-powered personalization, validation, and analytics
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Brain className="w-3 h-3" />
              Powered by Lovable AI
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="styles" className="gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Styles</span>
          </TabsTrigger>
          <TabsTrigger value="personalize" className="gap-2">
            <Wand2 className="w-4 h-4" />
            <span className="hidden sm:inline">Personalize</span>
          </TabsTrigger>
          <TabsTrigger value="validate" className="gap-2">
            <Microscope className="w-4 h-4" />
            <span className="hidden sm:inline">Validate</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="demos" className="gap-2">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Demos</span>
          </TabsTrigger>
        </TabsList>

        {/* Learning Styles Tab */}
        <TabsContent value="styles" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Learning Style Detection
              </CardTitle>
              <CardDescription>
                Automatically analyze student behavior to detect visual, auditory, reading, or kinesthetic preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Student to Analyze</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center gap-2">
                          <span>{student.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {student.skillLevel}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <LearningStyleDetector
                  studentId={selectedStudent}
                  studentName={students.find(s => s.id === selectedStudent)?.name || 'Student'}
                  gradeLevel={gradeLevel}
                  onStyleDetected={(style) => {
                    toast.success(`Detected: ${style.primary_style} learner (${style.confidence}% confidence)`);
                  }}
                />
              )}

              {!selectedStudent && (
                <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a student above to analyze their learning style</p>
                  <p className="text-sm mt-1">
                    The AI will analyze their behavior patterns across videos, simulations, reading, and hands-on activities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Class Overview */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Class Learning Style Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {(['visual', 'auditory', 'reading', 'kinesthetic'] as const).map(style => {
                  const count = students.filter(s => s.learningStyle === style).length;
                  const percent = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                  return (
                    <div key={style} className="text-center p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{percent}%</p>
                      <p className="text-xs capitalize text-muted-foreground">{style}</p>
                      <p className="text-xs text-muted-foreground">({count} students)</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalize Tab */}
        <TabsContent value="personalize" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Auto-Personalize Lessons
              </CardTitle>
              <CardDescription>
                AI adapts lesson content to individual student learning profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Student</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          <div className="flex items-center gap-2">
                            <span>{student.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {student.learningStyle}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudent && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-sm font-medium">Student Profile</p>
                    {(() => {
                      const student = students.find(s => s.id === selectedStudent);
                      if (!student) return null;
                      return (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Skill Level:</span>
                            <span>{student.skillLevel}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recent Accuracy:</span>
                            <span>{student.recentAccuracy}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Strengths: </span>
                            <span>{student.strengths.join(', ') || 'Not yet identified'}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson Content</label>
                <Textarea
                  placeholder="Paste or type the lesson content you want to personalize..."
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={handlePersonalize} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Personalize for Student
              </Button>

              {/* Results */}
              <AnimatePresence>
                {personalizationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 pt-4 border-t"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Personalization Complete
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-primary" />
                          <span>Difficulty: {personalizationResult.estimated_difficulty}/10</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>Predicted Success: {personalizationResult.success_prediction}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-green-500/30 bg-green-500/5">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-500" />
                            Scaffolding Supports
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <ul className="text-sm space-y-1">
                            {personalizationResult.scaffolding.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-500">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-500/30 bg-purple-500/5">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-500" />
                            Extension Challenges
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <ul className="text-sm space-y-1">
                            {personalizationResult.extensions.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-purple-500">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-1">Teacher Notes:</p>
                      <p className="text-sm text-muted-foreground">
                        {personalizationResult.differentiation_notes}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validate Tab */}
        <TabsContent value="validate" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-primary" />
                OpenWorm Ground Truth Validation
              </CardTitle>
              <CardDescription>
                Validate student circuits against real C. elegans connectome data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm flex items-start gap-2">
                  <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Validation uses OpenWorm's published connectome data including 302 neurons, 
                    ~7,000 synaptic connections, and documented behavioral circuits.
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Simulation Data</label>
                <Textarea
                  placeholder="Paste the student's circuit configuration or describe the neural circuit they built..."
                  value={simulationData}
                  onChange={(e) => setSimulationData(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Enter JSON circuit data or a text description of the student's neural circuit
                </p>
              </div>

              <Button onClick={handleValidate} disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Validate Against OpenWorm Data
              </Button>

              {/* Validation Results */}
              <AnimatePresence>
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4 pt-4 border-t"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        {validationResult.validation_score >= 70 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        Validation Score: {validationResult.validation_score}%
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Anatomical Accuracy</p>
                        <p className="text-sm font-medium">{validationResult.anatomical_accuracy}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Functional Plausibility</p>
                        <p className="text-sm font-medium">{validationResult.functional_plausibility}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Scientific Accuracy</p>
                        <p className="text-sm font-medium">{validationResult.scientific_accuracy}</p>
                      </div>
                    </div>

                    {validationResult.praise.length > 0 && (
                      <Card className="border-green-500/30 bg-green-500/5">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm text-green-600">What They Got Right</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <ul className="text-sm space-y-1">
                            {validationResult.praise.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {validationResult.corrections.length > 0 && (
                      <Card className="border-yellow-500/30 bg-yellow-500/5">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm text-yellow-600">Suggested Corrections</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <ul className="text-sm space-y-2">
                            {validationResult.corrections.map((item, i) => (
                              <li key={i} className="space-y-1">
                                <p className="font-medium">{item.issue}</p>
                                <p className="text-muted-foreground">{item.fix}</p>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {validationResult.openworm_references.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-2">OpenWorm Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {validationResult.openworm_references.map((ref, i) => (
                            <Badge key={i} variant="secondary" className="gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Class Learning Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Visual Learners</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Kinesthetic Learners</span>
                    <span className="text-sm font-medium">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auditory Learners</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reading/Writing</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm font-medium text-green-600 mb-1">Working Well</p>
                  <p className="text-sm">Hands-on simulation activities showing 85%+ engagement</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm font-medium text-yellow-600 mb-1">Needs Attention</p>
                  <p className="text-sm">Neural terminology retention dropping after week 2</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-600 mb-1">Suggested Action</p>
                  <p className="text-sm">Add vocabulary review game before each simulation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demo Videos Tab */}
        <TabsContent value="demos" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Platform Demo Videos
              </CardTitle>
              <CardDescription>
                4-minute tutorials demonstrating AI features and classroom tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {DEMO_VIDEOS.map((video) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <Card className="border-2 overflow-hidden hover:border-primary/50 transition-colors">
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                            <Play className="w-8 h-8 text-primary-foreground ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute bottom-2 right-2 bg-black/70">
                          {video.duration}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-1">{video.title}</h3>
                        <p className="text-xs text-muted-foreground">{video.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OpenWorm Resources */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                OpenWorm Scientific Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="https://github.com/openworm/c302"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border-2 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-medium">c302 Model</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Computational model of C. elegans nervous system
                  </p>
                </a>
                <a
                  href="https://github.com/openworm/sibernetic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border-2 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope className="w-5 h-5 text-primary" />
                    <span className="font-medium">Sibernetic</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Physics simulation of worm movement
                  </p>
                </a>
                <a
                  href="https://github.com/openworm/CElegansNeuroML"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border-2 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-medium">NeuroML Models</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete neural connectivity data
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}