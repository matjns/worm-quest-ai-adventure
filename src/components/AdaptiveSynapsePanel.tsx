import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEntropyAnalysis, AgeGroup, ChallengeRemap } from "@/hooks/useEntropyAnalysis";
import { useProfileBuilder, SimulationProfile } from "@/hooks/useProfileBuilder";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Loader2,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Network,
  Dna,
  BookOpen,
  GraduationCap,
} from "lucide-react";

interface AdaptiveSynapsePanelProps {
  onChallengeSelect?: (challenge: { id: string; title: string; difficulty: number }) => void;
  onSimulationGenerate?: (profile: SimulationProfile) => void;
  defaultAgeGroup?: AgeGroup;
}

const ageGroupLabels: Record<AgeGroup, string> = {
  "pre-k": "Pre-K (3-5)",
  "k5": "K-5 (5-10)",
  "middle": "Middle School (11-14)",
  "high": "High School (14-18)",
  "college": "College (18-22)",
  "phd": "Graduate/PhD",
};

export function AdaptiveSynapsePanel({
  onChallengeSelect,
  onSimulationGenerate,
  defaultAgeGroup = "middle",
}: AdaptiveSynapsePanelProps) {
  const { user } = useAuth();
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(defaultAgeGroup);
  const [promptInput, setPromptInput] = useState("");
  
  const {
    isAnalyzing,
    lastAnalysis,
    analyzeEntropy,
    calculateLocalEntropy,
  } = useEntropyAnalysis();
  
  const {
    isBuilding,
    lastProfile,
    buildProfile,
    suggestPrompts,
  } = useProfileBuilder();

  const localEntropy = calculateLocalEntropy();
  const suggestions = suggestPrompts(ageGroup);

  const handleAnalyzeEntropy = async () => {
    if (!user) {
      toast.error("Please sign in to use adaptive learning");
      return;
    }
    await analyzeEntropy(user.id, ageGroup, [], {}, "full");
  };

  const handleBuildProfile = async () => {
    if (!promptInput.trim()) {
      toast.error("Please enter a simulation prompt");
      return;
    }
    const profile = await buildProfile(promptInput, ageGroup);
    if (profile && onSimulationGenerate) {
      onSimulationGenerate(profile);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPromptInput(suggestion);
  };

  const getEntropyColor = (entropy: number) => {
    if (entropy < 0.3) return "text-green-500";
    if (entropy < 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const getEntropyLabel = (entropy: number) => {
    if (entropy < 0.3) return "Low (Consistent)";
    if (entropy < 0.6) return "Medium (Learning)";
    return "High (Variable)";
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Adaptive Synapses
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </Badge>
              </CardTitle>
              <CardDescription>
                Personalized learning via entropy analysis & RL challenge remapping
              </CardDescription>
            </div>
          </div>
          <Select value={ageGroup} onValueChange={(v) => setAgeGroup(v as AgeGroup)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ageGroupLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="entropy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entropy" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Entropy Analysis
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Dna className="w-4 h-4" />
              Profile Builder
            </TabsTrigger>
          </TabsList>

          {/* Entropy Analysis Tab */}
          <TabsContent value="entropy" className="space-y-4 mt-4">
            {/* Current Entropy Display */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Current Knowledge Entropy</span>
                <span className={`font-bold ${getEntropyColor(localEntropy)}`}>
                  {getEntropyLabel(localEntropy)}
                </span>
              </div>
              <Progress 
                value={localEntropy * 100} 
                className="h-3"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Entropy Score: {localEntropy.toFixed(3)} — {localEntropy < 0.4 ? "Ready for advanced challenges" : "Focus on consistency"}
              </p>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyzeEntropy} 
              disabled={isAnalyzing || !user}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Learning Patterns...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze & Remap Challenges
                </>
              )}
            </Button>

            {/* Analysis Results */}
            <AnimatePresence>
              {lastAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Entropy Insights */}
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Entropy Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/80">
                        <p className="text-xs text-muted-foreground">Calculated Entropy</p>
                        <p className={`text-xl font-bold ${getEntropyColor(lastAnalysis.calculatedEntropy)}`}>
                          {lastAnalysis.calculatedEntropy.toFixed(3)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/80">
                        <p className="text-xs text-muted-foreground">Retention Prediction</p>
                        <p className="text-xl font-bold text-green-500">
                          {lastAnalysis.result.entropyAnalysis.retentionPrediction}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mt-3 text-muted-foreground">
                      Optimal Zone: {lastAnalysis.result.entropyAnalysis.optimalChallengeZone}
                    </p>
                  </div>

                  {/* Knowledge Gaps & Strengths */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg border">
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-3 h-3" />
                        Knowledge Gaps
                      </h5>
                      <div className="space-y-1">
                        {lastAnalysis.result.entropyAnalysis.knowledgeGaps.slice(0, 3).map((gap, i) => (
                          <Badge key={i} variant="outline" className="text-xs mr-1">
                            {gap}
                          </Badge>
                        ))}
                        {lastAnalysis.result.entropyAnalysis.knowledgeGaps.length === 0 && (
                          <p className="text-xs text-muted-foreground">No significant gaps!</p>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Strengths
                      </h5>
                      <div className="space-y-1">
                        {lastAnalysis.result.entropyAnalysis.strengthAreas.slice(0, 3).map((strength, i) => (
                          <Badge key={i} variant="secondary" className="text-xs mr-1">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Challenges */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      AI-Remapped Challenges
                    </h4>
                    {lastAnalysis.result.recommendedChallenges.map((challenge, i) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => onChallengeSelect?.(challenge)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{challenge.title}</span>
                          <Badge variant="outline">
                            {Math.round(challenge.difficulty * 100)}% difficulty
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{challenge.rationale}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Focus: {challenge.focusArea}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>

                  {/* Content Adaptations */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h5 className="text-sm font-medium mb-2">Active Adaptations</h5>
                    <div className="flex flex-wrap gap-1">
                      <Badge>Scaffolding: {lastAnalysis.result.scaffoldingLevel}</Badge>
                      {lastAnalysis.result.contentAdaptations.map((adaptation, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {adaptation}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Profile Builder Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Describe your simulation
                </label>
                <Textarea
                  placeholder="e.g., 'Mutate AVA for chemotaxis?' or 'Build a touch reflex circuit'"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Suggested prompts for {ageGroupLabels[ageGroup]}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleBuildProfile}
                disabled={isBuilding || !promptInput.trim()}
                className="w-full"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Building Simulation Profile...
                  </>
                ) : (
                  <>
                    <Network className="w-4 h-4 mr-2" />
                    Generate c302-Validated Simulation
                  </>
                )}
              </Button>
            </div>

            {/* Generated Profile */}
            <AnimatePresence>
              {lastProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Validation Status */}
                  <div className={`p-3 rounded-lg border ${
                    lastProfile.validationStatus.c302Compatible 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-yellow-500/10 border-yellow-500/30"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {lastProfile.validationStatus.c302Compatible ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="font-medium">
                        c302 NeuroML Validation: {Math.round(lastProfile.validationStatus.neuromlFidelity * 100)}% Fidelity
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lastProfile.validationStatus.biologicalAccuracy}
                    </p>
                  </div>

                  {/* Circuit Summary */}
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Dna className="w-4 h-4 text-primary" />
                      Generated Circuit
                    </h4>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="text-xl font-bold">{lastProfile.neurons.length}</p>
                        <p className="text-xs text-muted-foreground">Neurons</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="text-xl font-bold">{lastProfile.connections.length}</p>
                        <p className="text-xs text-muted-foreground">Connections</p>
                      </div>
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="text-xl font-bold">{lastProfile.simulationParams.duration}ms</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Behavior: </span>
                      {lastProfile.behavior}
                    </p>
                  </div>

                  {/* Neurons */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Neurons in Circuit</h5>
                    <div className="flex flex-wrap gap-2">
                      {lastProfile.neurons.map((neuron) => (
                        <Badge
                          key={neuron.id}
                          variant={
                            neuron.type === "sensory" ? "default" :
                            neuron.type === "motor" ? "secondary" :
                            neuron.type === "command" ? "destructive" : "outline"
                          }
                          className="gap-1"
                        >
                          {neuron.name}
                          <span className="opacity-70">({neuron.type})</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Learning Objectives */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Learning Objectives
                    </h5>
                    <ul className="space-y-1">
                      {lastProfile.learningObjectives.map((obj, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h5 className="text-sm font-medium mb-1">AI Explanation</h5>
                    <p className="text-sm text-muted-foreground">{lastProfile.explanation}</p>
                  </div>

                  <Button
                    onClick={() => onSimulationGenerate?.(lastProfile)}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Load Simulation
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
