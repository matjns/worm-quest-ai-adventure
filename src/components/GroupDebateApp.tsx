import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, ThumbsUp, ThumbsDown, Lightbulb, 
  Brain, Send, Sparkles, Timer, Trophy, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGameStore } from '@/stores/gameStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DebateTopic {
  id: string;
  title: string;
  description: string;
  proPoints: string[];
  conPoints: string[];
  ethicsCategory: string;
}

const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: "consciousness",
    title: "Is C. elegans a valid consciousness proxy?",
    description: "Can a 302-neuron organism teach us anything meaningful about human consciousness?",
    proPoints: [
      "Emergent behavior from simple rules mirrors consciousness theories",
      "Decision-making circuits are well-mapped and testable",
      "Avoids ethical concerns of primate research",
      "Reveals fundamental computational principles"
    ],
    conPoints: [
      "Lacks the complexity needed for true consciousness",
      "No evidence of subjective experience",
      "Over-simplification may mislead AI development",
      "Human consciousness may require unique architecture"
    ],
    ethicsCategory: "AI Consciousness"
  },
  {
    id: "ai-worm",
    title: "Should we give AI systems 'pain' like ASH neurons?",
    description: "C. elegans has nociceptors that help it avoid harm. Should AI have similar protective mechanisms?",
    proPoints: [
      "Pain-like signals could improve AI safety",
      "Mimics biological survival mechanisms",
      "Could lead to more robust decision-making",
      "Aligns AI goals with avoiding damage"
    ],
    conPoints: [
      "Could create suffering in silicon",
      "May not be functionally necessary",
      "Ethical risks of creating sentient AI",
      "Better alternatives exist (reward shaping)"
    ],
    ethicsCategory: "AI Sentience"
  },
  {
    id: "simulation",
    title: "Is simulating a brain the same as creating one?",
    description: "If we perfectly simulate C. elegans, have we created a new worm?",
    proPoints: [
      "Functionally equivalent = ontologically equivalent",
      "Substrate independence theory supports this",
      "No difference in observable behavior",
      "Opens path to digital minds"
    ],
    conPoints: [
      "Simulation is not instantiation",
      "Missing physical embodiment matters",
      "A map of Paris is not Paris",
      "May lack genuine causal powers"
    ],
    ethicsCategory: "Digital Beings"
  },
];

interface AIArgument {
  side: 'pro' | 'con';
  argument: string;
  source: string;
}

export function GroupDebateApp() {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic | null>(null);
  const [userPosition, setUserPosition] = useState<'pro' | 'con' | null>(null);
  const [userArgument, setUserArgument] = useState('');
  const [aiArguments, setAiArguments] = useState<AIArgument[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [debatePhase, setDebatePhase] = useState<'select' | 'position' | 'argue' | 'summary'>('select');
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [contributions, setContributions] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (debatePhase === 'argue' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(t => t - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setDebatePhase('summary');
    }
    return () => clearInterval(interval);
  }, [debatePhase, timeRemaining]);

  const generateAIArgument = async (side: 'pro' | 'con') => {
    if (!selectedTopic) return;
    
    setIsGenerating(true);
    
    // Simulate AI response (in production, this would call the edge function)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const points = side === 'pro' ? selectedTopic.proPoints : selectedTopic.conPoints;
    const randomPoint = points[Math.floor(Math.random() * points.length)];
    
    const argument: AIArgument = {
      side,
      argument: randomPoint,
      source: "OpenWorm Research & AI Ethics Literature"
    };
    
    setAiArguments(prev => [...prev, argument]);
    setIsGenerating(false);
  };

  const submitArgument = () => {
    if (!userArgument.trim()) return;
    
    setContributions(c => c + 1);
    addXp(15);
    addPoints(20);
    
    // Add user argument to the debate
    const userEntry: AIArgument = {
      side: userPosition!,
      argument: userArgument,
      source: "Student Contribution"
    };
    setAiArguments(prev => [...prev, userEntry]);
    setUserArgument('');
    
    toast.success("Great argument! +15 XP");
    
    if (contributions >= 2) {
      unlockAchievement("debate-champion");
    }
  };

  const selectTopic = (topic: DebateTopic) => {
    setSelectedTopic(topic);
    setDebatePhase('position');
  };

  const selectPosition = (position: 'pro' | 'con') => {
    setUserPosition(position);
    setDebatePhase('argue');
    setTimeRemaining(120);
    
    // Generate initial AI arguments
    generateAIArgument('pro');
    setTimeout(() => generateAIArgument('con'), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (debatePhase === 'select') {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Users className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <CardTitle>AI Ethics Debate Arena</CardTitle>
              <CardDescription>Multiplayer prompts • Build AI ethics confidence</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Choose a Debate Topic:</h3>
          
          <div className="space-y-4">
            {DEBATE_TOPICS.map((topic) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => selectTopic(topic)}
                className="p-4 border-2 border-border rounded-lg hover:border-primary cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">{topic.title}</h4>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                  </div>
                  <Badge variant="secondary">{topic.ethicsCategory}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <ChevronRight className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">Start Debate</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (debatePhase === 'position') {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <Badge className="w-fit mb-2">{selectedTopic?.ethicsCategory}</Badge>
          <CardTitle>{selectedTopic?.title}</CardTitle>
          <CardDescription>{selectedTopic?.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <h3 className="font-semibold text-center mb-6">Choose Your Position:</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectPosition('pro')}
              className="p-6 border-2 border-green-500/50 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-600">PRO</span>
              </div>
              <ul className="space-y-2">
                {selectedTopic?.proPoints.slice(0, 2).map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectPosition('con')}
              className="p-6 border-2 border-red-500/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
            >
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-600">CON</span>
              </div>
              <ul className="space-y-2">
                {selectedTopic?.conPoints.slice(0, 2).map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setDebatePhase('select')}
            className="w-full mt-4"
          >
            ← Choose Different Topic
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (debatePhase === 'summary') {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Debate Complete!</h2>
            <Badge className="mb-4">{selectedTopic?.ethicsCategory}</Badge>
            
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">{contributions}</p>
                <p className="text-xs text-muted-foreground">Your Arguments</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {aiArguments.filter(a => a.side === 'pro').length}
                </p>
                <p className="text-xs text-muted-foreground">Pro Points</p>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {aiArguments.filter(a => a.side === 'con').length}
                </p>
                <p className="text-xs text-muted-foreground">Con Points</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Key Takeaway
              </h3>
              <p className="text-sm text-muted-foreground">
                AI ethics debates don't have "right" answers, but developing the ability to 
                articulate and defend positions builds the critical thinking needed to shape 
                responsible AI development.
              </p>
            </div>
            
            <Button onClick={() => {
              setDebatePhase('select');
              setSelectedTopic(null);
              setUserPosition(null);
              setAiArguments([]);
              setContributions(0);
            }}>
              Start New Debate
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-1">{selectedTopic?.ethicsCategory}</Badge>
            <CardTitle className="text-lg">{selectedTopic?.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className={`font-mono text-lg ${timeRemaining < 30 ? 'text-red-500' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <Progress value={(timeRemaining / 120) * 100} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Your Position */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Badge variant={userPosition === 'pro' ? 'default' : 'destructive'}>
            {userPosition === 'pro' ? <ThumbsUp className="w-3 h-3 mr-1" /> : <ThumbsDown className="w-3 h-3 mr-1" />}
            Your Position: {userPosition?.toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Contributions: {contributions}
          </span>
        </div>
        
        {/* Arguments Feed */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {aiArguments.map((arg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  arg.side === 'pro' 
                    ? 'border-green-500/30 bg-green-50 dark:bg-green-900/10' 
                    : 'border-red-500/30 bg-red-50 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={arg.side === 'pro' ? 'bg-green-500' : 'bg-red-500'}>
                      {arg.source === "Student Contribution" ? "You" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{arg.source}</span>
                      <Badge variant="outline" className="text-xs">
                        {arg.side.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm">{arg.argument}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isGenerating && (
            <div className="flex items-center gap-2 p-3 text-muted-foreground">
              <Brain className="w-4 h-4 animate-pulse" />
              <span className="text-sm">AI is formulating an argument...</span>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="space-y-2">
          <Textarea
            value={userArgument}
            onChange={(e) => setUserArgument(e.target.value)}
            placeholder={`Make your ${userPosition === 'pro' ? 'supporting' : 'opposing'} argument...`}
            className="min-h-20"
          />
          <div className="flex gap-2">
            <Button onClick={submitArgument} disabled={!userArgument.trim()} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Submit Argument
            </Button>
            <Button 
              variant="outline" 
              onClick={() => generateAIArgument(userPosition === 'pro' ? 'con' : 'pro')}
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Counter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
