import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, ChevronLeft, ChevronRight, Clock, Users,
  Brain, Gamepad2, Shield, Award, Sparkles, Globe, Code,
  GraduationCap, Zap, Target, FileText, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ScriptSection {
  id: string;
  title: string;
  duration: number; // seconds
  icon: React.ReactNode;
  content: string;
  bullets: string[];
  demoActions: string[];
  rubricPoints: string[];
}

const DEMO_SCRIPT: ScriptSection[] = [
  {
    id: 'intro',
    title: 'Opening Hook',
    duration: 20,
    icon: <Sparkles className="w-5 h-5" />,
    content: "What if a worm could teach America's kids about AI? Meet WormQuest—where 302 neurons spark a revolution in STEM education.",
    bullets: [
      'C. elegans: first fully mapped brain (302 neurons, 7,000 connections)',
      'OpenWorm: real scientific data powering gameplay',
      'Age-adaptive: Pre-K crayons to High School PyTorch',
    ],
    demoActions: ['Show homepage hero animation', 'Display real-time global stats counter'],
    rubricPoints: ['National importance', 'AI literacy gap solution'],
  },
  {
    id: 'prek-demo',
    title: 'Pre-K & K-5 Experience',
    duration: 40,
    icon: <Gamepad2 className="w-5 h-5" />,
    content: "Watch a 4-year-old trace neurons with their finger while an AI narrator explains 'this is how worms feel touch!'",
    bullets: [
      'WormWiggleTouchGame: ventral cord tracing with haptic feedback',
      'ColorConnectQuiz: ion channel colors validated against NeuroML',
      'StorytimeModule: AI-generated bedtime stories about neurons',
      'Accessibility: ARIA labels, high-contrast, screen reader support',
    ],
    demoActions: [
      'Demo touch game on tablet',
      'Show color validation with 95% accuracy badge',
      'Play audio narration sample',
    ],
    rubricPoints: ['Age-appropriate design', 'WCAG compliance', 'Multimodal learning'],
  },
  {
    id: 'middle-demo',
    title: 'Middle School Lab',
    duration: 45,
    icon: <Brain className="w-5 h-5" />,
    content: "Students become junior scientists: tweaking synaptic weights, running experiments, and debating AI ethics.",
    bullets: [
      'NeuralNetBuilderActivity: c302 simulation with Q-learning optimization',
      'MutationMazeGame: owmeta RDF validation catches AI hallucinations',
      'GroupDebateApp: "Is the worm conscious?" multiplayer AI debates',
      'Hypothesis testing with statistical feedback',
    ],
    demoActions: [
      'Adjust synapse weight → show behavior change',
      'Trigger hallucination detection overlay',
      'Show AI-generated debate arguments',
    ],
    rubricPoints: ['Scientific rigor', 'AI safety education', 'Collaborative learning'],
  },
  {
    id: 'high-demo',
    title: 'High School Advanced',
    duration: 50,
    icon: <Code className="w-5 h-5" />,
    content: "Future researchers: genetic algorithms, VR exports, and Python coding challenges with AI debugging.",
    bullets: [
      'EvolutionaryAlgoLab: bifurcation diagrams, chaos theory',
      'VRSimPresentation: Three.js → Oculus with glia validation',
      'CodingChallengeModule: Sibernetic SPH + PyTorch neural nets',
      'NeuroML export pipeline for OpenWorm contribution',
    ],
    demoActions: [
      'Run evolution → show fitness landscape',
      'Export VR file for Meta Quest',
      'Debug Python code with AI assistant',
    ],
    rubricPoints: ['Research contribution', 'Industry-ready skills', 'Open source ethos'],
  },
  {
    id: 'ai-features',
    title: 'AI Integration Showcase',
    duration: 35,
    icon: <Zap className="w-5 h-5" />,
    content: "Every feature is AI-enhanced: adaptive difficulty, hallucination detection, and real-time coaching.",
    bullets: [
      'Lovable AI Gateway: Gemini/GPT-5 via edge functions',
      '98% accuracy target with owmeta RDF cross-validation',
      'Adaptive learning: entropy-based difficulty adjustment',
      'AI Circuit Coach: real-time suggestions during building',
    ],
    demoActions: [
      'Ask Neural Q&A a question → show confidence score',
      'Trigger discovery hint bubble',
      'Show AI hallucination overlay with correction',
    ],
    rubricPoints: ['Responsible AI', 'Accuracy validation', 'Personalization'],
  },
  {
    id: 'teacher-tools',
    title: 'Educator Dashboard',
    duration: 30,
    icon: <GraduationCap className="w-5 h-5" />,
    content: "Teachers get superpowers: AI lesson planning, real-time analytics, and parent-friendly report generation.",
    bullets: [
      'Classroom management with join codes',
      'Module assignment system with due dates',
      'AI-generated lesson scripts (2nd person)',
      'Weekly progress reports exportable as PDF',
    ],
    demoActions: [
      'Create classroom → show join code',
      'Assign module to students',
      'Generate AI teacher script',
    ],
    rubricPoints: ['Teacher empowerment', 'Assessment tools', 'Parent engagement'],
  },
  {
    id: 'impact',
    title: 'Measurable Impact',
    duration: 20,
    icon: <Target className="w-5 h-5" />,
    content: "95% retention goal, 50,000+ simulations, contributions flowing back to OpenWorm research.",
    bullets: [
      'Engagement entropy tracking for retention metrics',
      'Global impact counter: simulations, researchers, countries',
      'GitHub PR bot for student research contributions',
      'Pilot feedback loop with NPS scoring',
    ],
    demoActions: [
      'Show admin analytics dashboard',
      'Display real-time engagement metrics',
      'Show community contribution board',
    ],
    rubricPoints: ['Evidence of impact', 'Iterative improvement', 'Open science'],
  },
  {
    id: 'close',
    title: 'Closing Vision',
    duration: 20,
    icon: <Globe className="w-5 h-5" />,
    content: "From Pre-K finger traces to PhD-level research—one worm, 302 neurons, infinite possibilities for American AI education.",
    bullets: [
      'Scalable: works in Title I schools to gifted programs',
      'Sustainable: open source, community-driven',
      'Patriotic: US data sovereignty, American innovation',
      'Call to action: visit worm-quest-ai-adventure.lovable.app',
    ],
    demoActions: [
      'Show published URL',
      'Display micro-credential certificate',
      'End on hero animation',
    ],
    rubricPoints: ['Scalability', 'Sustainability', 'National pride'],
  },
];

export function DemoScript() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const totalDuration = DEMO_SCRIPT.reduce((acc, s) => acc + s.duration, 0);
  const section = DEMO_SCRIPT[currentSection];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToSection = (index: number) => {
    setCurrentSection(Math.max(0, Math.min(DEMO_SCRIPT.length - 1, index)));
    setElapsedTime(DEMO_SCRIPT.slice(0, index).reduce((acc, s) => acc + s.duration, 0));
  };

  const exportScript = () => {
    let markdown = `# WormQuest Demo Script - Track III(b)\n\n`;
    markdown += `**Total Duration:** ${formatTime(totalDuration)} (4 minutes)\n\n`;
    markdown += `---\n\n`;

    DEMO_SCRIPT.forEach((s, i) => {
      markdown += `## ${i + 1}. ${s.title} (${s.duration}s)\n\n`;
      markdown += `> ${s.content}\n\n`;
      markdown += `### Key Points\n`;
      s.bullets.forEach(b => markdown += `- ${b}\n`);
      markdown += `\n### Demo Actions\n`;
      s.demoActions.forEach(a => markdown += `- [ ] ${a}\n`);
      markdown += `\n### Rubric Alignment\n`;
      s.rubricPoints.forEach(r => markdown += `- ✓ ${r}\n`);
      markdown += `\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wormquest-demo-script.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = (elapsedTime / totalDuration) * 100;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>White House AI Challenge Demo Script</CardTitle>
              <CardDescription>
                Track III(b) • 4-Minute Presentation Guide
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(totalDuration)}
            </Badge>
            <Button variant="outline" size="sm" onClick={exportScript}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{formatTime(elapsedTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Section navigation */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {DEMO_SCRIPT.map((s, i) => (
            <Button
              key={s.id}
              variant={currentSection === i ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToSection(i)}
              className="flex-shrink-0"
            >
              <span className="mr-1">{i + 1}</span>
              {s.title.split(' ')[0]}
            </Button>
          ))}
        </div>
        
        {/* Current section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Section {currentSection + 1} of {DEMO_SCRIPT.length} • {section.duration}s
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {formatTime(section.duration)}
              </Badge>
            </div>
            
            {/* Script content */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border">
              <p className="text-xl font-medium italic leading-relaxed">
                "{section.content}"
              </p>
            </div>
            
            {/* Details grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Key points */}
              <div className="bg-card rounded-lg p-4 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {section.bullets.map((bullet, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Demo actions */}
              <div className="bg-card rounded-lg p-4 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-accent" />
                  Demo Actions
                </h3>
                <ul className="space-y-2">
                  {section.demoActions.map((action, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <input type="checkbox" className="mt-1 rounded" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Rubric alignment */}
              <div className="bg-card rounded-lg p-4 border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Rubric Alignment
                </h3>
                <ul className="space-y-2">
                  {section.rubricPoints.map((point, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <Shield className="w-3 h-3 text-green-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => goToSection(currentSection - 1)}
                disabled={currentSection === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={isPlaying ? 'secondary' : 'default'}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Practice
                    </>
                  )}
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => goToSection(currentSection + 1)}
                disabled={currentSection === DEMO_SCRIPT.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
