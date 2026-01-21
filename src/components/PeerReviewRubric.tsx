import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, Star, MessageSquare, ThumbsUp, ThumbsDown,
  Send, Users, Award, CheckCircle2, AlertTriangle, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGameStore } from '@/stores/gameStore';
import { toast } from 'sonner';

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  score: number | null;
  feedback: string;
}

interface CircuitToReview {
  id: string;
  title: string;
  author: string;
  description: string;
  neurons: number;
  connections: number;
  behavior: string;
  submittedAt: string;
}

const SAMPLE_CIRCUITS: CircuitToReview[] = [
  {
    id: 'c1',
    title: 'Chemotaxis Navigation Circuit',
    author: 'Alex T.',
    description: 'Circuit for detecting and navigating toward food sources using AWC and ASE neurons.',
    neurons: 6,
    connections: 8,
    behavior: 'chemotaxis',
    submittedAt: '2 hours ago',
  },
  {
    id: 'c2',
    title: 'Touch Avoidance Response',
    author: 'Sam K.',
    description: 'Implementation of the anterior touch reflex using ALM sensory neurons.',
    neurons: 5,
    connections: 6,
    behavior: 'avoidance',
    submittedAt: '5 hours ago',
  },
  {
    id: 'c3',
    title: 'Backward Locomotion CPG',
    author: 'Jordan L.',
    description: 'Central pattern generator for coordinated backward movement.',
    neurons: 8,
    connections: 12,
    behavior: 'locomotion',
    submittedAt: '1 day ago',
  },
];

const DEFAULT_RUBRIC: Omit<RubricCriterion, 'score' | 'feedback'>[] = [
  {
    id: 'accuracy',
    name: 'Biological Accuracy',
    description: 'Does the circuit match known C. elegans neuron connections?',
    maxScore: 5,
  },
  {
    id: 'completeness',
    name: 'Functional Completeness',
    description: 'Does the circuit achieve the stated behavioral goal?',
    maxScore: 5,
  },
  {
    id: 'documentation',
    name: 'Documentation Quality',
    description: 'Are neurons and connections clearly labeled and explained?',
    maxScore: 5,
  },
  {
    id: 'innovation',
    name: 'Scientific Innovation',
    description: 'Does the circuit show creative problem-solving or novel approaches?',
    maxScore: 5,
  },
  {
    id: 'efficiency',
    name: 'Circuit Efficiency',
    description: 'Is the circuit optimally designed without unnecessary components?',
    maxScore: 5,
  },
];

export function PeerReviewRubric() {
  const { addXp, addPoints, unlockAchievement } = useGameStore();
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitToReview | null>(null);
  const [rubric, setRubric] = useState<RubricCriterion[]>(
    DEFAULT_RUBRIC.map(c => ({ ...c, score: null, feedback: '' }))
  );
  const [overallFeedback, setOverallFeedback] = useState('');
  const [recommendation, setRecommendation] = useState<'approve' | 'revise' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewsCompleted, setReviewsCompleted] = useState(0);

  const totalScore = rubric.reduce((sum, c) => sum + (c.score || 0), 0);
  const maxScore = rubric.reduce((sum, c) => sum + c.maxScore, 0);
  const percentScore = Math.round((totalScore / maxScore) * 100);

  const updateCriterionScore = (id: string, score: number) => {
    setRubric(prev =>
      prev.map(c => c.id === id ? { ...c, score } : c)
    );
  };

  const updateCriterionFeedback = (id: string, feedback: string) => {
    setRubric(prev =>
      prev.map(c => c.id === id ? { ...c, feedback } : c)
    );
  };

  const allScored = rubric.every(c => c.score !== null);

  const submitReview = async () => {
    if (!allScored || !recommendation) {
      toast.error('Please complete all scores and select a recommendation');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(r => setTimeout(r, 1500));

      setReviewsCompleted(prev => prev + 1);
      addXp(75);
      addPoints(150);

      if (reviewsCompleted >= 2) {
        unlockAchievement('peer-reviewer');
      }

      toast.success('🎉 Review submitted! Thank you for contributing.');

      // Reset for next review
      setSelectedCircuit(null);
      setRubric(DEFAULT_RUBRIC.map(c => ({ ...c, score: null, feedback: '' })));
      setOverallFeedback('');
      setRecommendation(null);

    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedCircuit) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <ClipboardCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <CardTitle>Peer Review System</CardTitle>
                <CardDescription>Review and validate peer circuit designs</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">
              <Award className="w-3 h-3 mr-1" />
              {reviewsCompleted} Reviews
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Circuits Awaiting Review</h3>
          
          <div className="space-y-3">
            {SAMPLE_CIRCUITS.map((circuit, i) => (
              <motion.div
                key={circuit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedCircuit(circuit)}
                className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{circuit.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs">{circuit.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {circuit.author} • {circuit.submittedAt}
                    </div>
                  </div>
                  <Badge variant="outline">{circuit.behavior}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{circuit.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{circuit.neurons} neurons</span>
                  <span>{circuit.connections} connections</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Why Peer Review?</h4>
                <p className="text-xs text-muted-foreground">
                  Peer review ensures quality and accuracy before circuits are contributed to OpenWorm. 
                  Reviewers earn XP and badges for thoughtful feedback!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-2">{selectedCircuit.behavior}</Badge>
            <CardTitle>{selectedCircuit.title}</CardTitle>
            <CardDescription>
              by {selectedCircuit.author} • {selectedCircuit.neurons} neurons, {selectedCircuit.connections} connections
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedCircuit(null)}>
            ← Back
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Circuit Description */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Circuit Description
          </h4>
          <p className="text-sm text-muted-foreground">{selectedCircuit.description}</p>
        </div>

        {/* Score Overview */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Overall Score</span>
            <span className="text-2xl font-bold">{totalScore}/{maxScore}</span>
          </div>
          <Progress value={percentScore} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1 text-right">{percentScore}%</p>
        </div>

        {/* Rubric Criteria */}
        <div className="space-y-4">
          <h3 className="font-semibold">Evaluation Rubric</h3>
          
          {rubric.map((criterion) => (
            <div key={criterion.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">{criterion.name}</h4>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                </div>
                <Badge variant={criterion.score !== null ? "default" : "outline"}>
                  {criterion.score ?? '?'}/{criterion.maxScore}
                </Badge>
              </div>
              
              {/* Star Rating */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: criterion.maxScore }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateCriterionScore(criterion.id, i + 1)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        criterion.score && i < criterion.score
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback */}
              <Textarea
                placeholder="Add specific feedback for this criterion..."
                value={criterion.feedback}
                onChange={(e) => updateCriterionFeedback(criterion.id, e.target.value)}
                className="text-sm min-h-16"
              />
            </div>
          ))}
        </div>

        {/* Overall Feedback */}
        <div>
          <h3 className="font-semibold mb-2">Overall Feedback</h3>
          <Textarea
            placeholder="Provide constructive feedback for the circuit author..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            className="min-h-24"
          />
        </div>

        {/* Recommendation */}
        <div>
          <h3 className="font-semibold mb-3">Recommendation</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={recommendation === 'approve' ? 'default' : 'outline'}
              onClick={() => setRecommendation('approve')}
              className="h-auto py-4"
            >
              <div className="flex flex-col items-center gap-2">
                <ThumbsUp className={`w-6 h-6 ${recommendation === 'approve' ? 'text-white' : 'text-green-500'}`} />
                <span>Approve</span>
                <span className="text-xs opacity-75">Ready for contribution</span>
              </div>
            </Button>
            <Button
              variant={recommendation === 'revise' ? 'destructive' : 'outline'}
              onClick={() => setRecommendation('revise')}
              className="h-auto py-4"
            >
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className={`w-6 h-6 ${recommendation === 'revise' ? 'text-white' : 'text-amber-500'}`} />
                <span>Request Revision</span>
                <span className="text-xs opacity-75">Needs improvements</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitReview}
          disabled={isSubmitting || !allScored || !recommendation}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>Submitting Review...</>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Peer Review
            </>
          )}
        </Button>

        {(!allScored || !recommendation) && (
          <p className="text-sm text-amber-500 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Score all criteria and select a recommendation
          </p>
        )}
      </CardContent>
    </Card>
  );
}
