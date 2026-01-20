import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLearningStyleDetection, LearningStyleResult } from '@/hooks/useLearningStyleDetection';
import { formatDistanceToNow } from 'date-fns';
import {
  Brain,
  Eye,
  Ear,
  BookOpen,
  Hand,
  Sparkles,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Loader2,
  CheckCircle2,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react';

const styleIcons = {
  visual: Eye,
  auditory: Ear,
  reading: BookOpen,
  kinesthetic: Hand,
};

const styleColors = {
  visual: 'text-blue-500',
  auditory: 'text-purple-500',
  reading: 'text-green-500',
  kinesthetic: 'text-orange-500',
};

const styleBgColors = {
  visual: 'bg-blue-500/10 border-blue-500/30',
  auditory: 'bg-purple-500/10 border-purple-500/30',
  reading: 'bg-green-500/10 border-green-500/30',
  kinesthetic: 'bg-orange-500/10 border-orange-500/30',
};

const styleDescriptions = {
  visual: 'Learns best through diagrams, charts, videos, and visual demonstrations',
  auditory: 'Learns best through listening, discussion, and verbal explanations',
  reading: 'Learns best through reading, writing, and text-based materials',
  kinesthetic: 'Learns best through hands-on activities, simulations, and experiments',
};

interface LearningStyleDetectorProps {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  onStyleDetected?: (style: LearningStyleResult) => void;
}

export function LearningStyleDetector({
  studentId,
  studentName,
  gradeLevel,
  onStyleDetected,
}: LearningStyleDetectorProps) {
  const {
    behaviorData,
    learningStyle,
    analyzing,
    lastAnalyzed,
    analyzeLearningStyle,
    getQuickStyleEstimate,
    resetBehaviorData,
  } = useLearningStyleDetection(studentId);

  const [showDetails, setShowDetails] = useState(false);
  const quickEstimate = getQuickStyleEstimate();

  const handleAnalyze = async () => {
    const result = await analyzeLearningStyle(gradeLevel);
    if (result && onStyleDetected) {
      onStyleDetected(result);
    }
  };

  // Calculate total interactions for progress
  const totalInteractions = 
    behaviorData.simulationInteractions + 
    behaviorData.diagramInteractions + 
    behaviorData.audioPlayCount +
    behaviorData.notesTaken +
    Math.floor(behaviorData.videoWatchTime / 60);
  
  const minInteractionsNeeded = 5;
  const dataProgress = Math.min(100, (totalInteractions / minInteractionsNeeded) * 100);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Learning Style Detection</CardTitle>
              <CardDescription>
                AI-powered analysis for {studentName}
              </CardDescription>
            </div>
          </div>
          {learningStyle && (
            <Badge className={styleBgColors[learningStyle.primary_style]}>
              {(() => {
                const Icon = styleIcons[learningStyle.primary_style];
                return <Icon className="w-3 h-3 mr-1" />;
              })()}
              {learningStyle.primary_style.charAt(0).toUpperCase() + learningStyle.primary_style.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Collection Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Behavior Data Collection</span>
            <span className="font-medium">{totalInteractions} / {minInteractionsNeeded} interactions</span>
          </div>
          <Progress value={dataProgress} className="h-2" />
          {dataProgress < 100 && (
            <p className="text-xs text-muted-foreground">
              Student needs more interactions before accurate detection
            </p>
          )}
        </div>

        {/* Quick Estimate (always visible) */}
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(quickEstimate) as [keyof typeof styleIcons, number][]).map(([style, percent]) => {
            const Icon = styleIcons[style];
            return (
              <div
                key={style}
                className={`p-2 rounded-lg text-center border ${
                  learningStyle?.primary_style === style 
                    ? styleBgColors[style] 
                    : 'bg-muted/50'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${styleColors[style]}`} />
                <p className="text-lg font-bold">{percent}%</p>
                <p className="text-xs capitalize text-muted-foreground">{style}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || dataProgress < 100}
            className="flex-1"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {learningStyle ? 'Re-analyze' : 'Detect Style'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetBehaviorData}
            title="Reset behavior data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {lastAnalyzed && (
          <p className="text-xs text-center text-muted-foreground">
            Last analyzed {formatDistanceToNow(lastAnalyzed, { addSuffix: true })}
          </p>
        )}

        {/* Detailed Results */}
        <AnimatePresence>
          {learningStyle && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t"
            >
              {/* Primary Style */}
              <div className={`p-4 rounded-lg border-2 ${styleBgColors[learningStyle.primary_style]}`}>
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = styleIcons[learningStyle.primary_style];
                    return <Icon className={`w-6 h-6 ${styleColors[learningStyle.primary_style]}`} />;
                  })()}
                  <div>
                    <p className="font-semibold capitalize">
                      {learningStyle.primary_style} Learner
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {learningStyle.confidence}% confidence
                    </p>
                  </div>
                </div>
                <p className="text-sm">{styleDescriptions[learningStyle.primary_style]}</p>
              </div>

              {/* Secondary Style */}
              {learningStyle.secondary_style && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = styleIcons[learningStyle.secondary_style];
                      return <Icon className={`w-4 h-4 ${styleColors[learningStyle.secondary_style]}`} />;
                    })()}
                    <span className="text-sm">
                      Secondary preference: <strong className="capitalize">{learningStyle.secondary_style}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs for details */}
              <Tabs defaultValue="evidence" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="evidence" className="text-xs">Evidence</TabsTrigger>
                  <TabsTrigger value="recommendations" className="text-xs">Tips</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="evidence" className="mt-3 space-y-2">
                  {learningStyle.behavioral_evidence.slice(0, 5).map((evidence, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{evidence}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="recommendations" className="mt-3 space-y-2">
                  {learningStyle.recommendations.slice(0, 5).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="content" className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {learningStyle.content_preferences.map((pref, i) => (
                      <Badge key={i} variant="secondary">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Adaptation Tips */}
              {learningStyle.adaptation_tips.length > 0 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Adaptation Tips
                  </p>
                  <ul className="text-sm space-y-1">
                    {learningStyle.adaptation_tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Zap className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Behavior Data Preview */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowDetails(!showDetails)}
        >
          <BarChart3 className="w-3 h-3 mr-1" />
          {showDetails ? 'Hide' : 'Show'} Raw Behavior Data
        </Button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-muted/50 text-xs space-y-1 font-mono"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>Video time: {Math.round(behaviorData.videoWatchTime)}s</div>
                <div>Simulation clicks: {behaviorData.simulationInteractions}</div>
                <div>Reading time: {Math.round(behaviorData.textReadingTime)}s</div>
                <div>Diagram clicks: {behaviorData.diagramInteractions}</div>
                <div>Audio plays: {behaviorData.audioPlayCount}</div>
                <div>Notes taken: {behaviorData.notesTaken}</div>
                <div>Tasks completed: {behaviorData.handsonTasksCompleted}</div>
                <div>Replays: {behaviorData.replayCount}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}