import { useState, useCallback, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { CircuitBuilder } from "@/components/CircuitBuilder";
import { WormSimulator3D } from "@/components/WormSimulator3D";
import { AITutor } from "@/components/AITutor";
import { MissionBriefing } from "@/components/MissionBriefing";
import { MissionComplete } from "@/components/MissionComplete";
import { ProgressTracker } from "@/components/ProgressTracker";
import { SkillDashboard } from "@/components/SkillDashboard";
import { AdaptiveSynapsePanel } from "@/components/AdaptiveSynapsePanel";
import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import { useEntropyAnalysis, ChallengeRemap } from "@/hooks/useEntropyAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { MISSIONS, getMissionById, isMissionComplete } from "@/data/missionData";
import { simulateCircuit, ConnectionData, WormBehavior } from "@/data/neuronData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Play, 
  Lock, 
  CheckCircle2, 
  Zap,
  RotateCcw,
  FlaskConical,
  TrendingUp,
  Sparkles,
  Brain,
  Target,
  AlertCircle,
  Lightbulb,
  ChevronRight
} from "lucide-react";

type GamePhase = "select" | "briefing" | "playing" | "complete";

interface PlacedNeuron {
  id: string;
  canvasX: number;
  canvasY: number;
}

interface AdaptiveMissionConfig {
  difficultyMultiplier: number;
  scaffoldingLevel: "none" | "light" | "medium" | "heavy";
  adaptedHints: string[];
  entropyScore: number;
  retentionPrediction: number;
  focusAreas: string[];
}

export default function NeuroQuestPage() {
  const { user } = useAuth();
  const { level, xp, xpToNext, totalPoints, achievements, completedLessons, addXp, addPoints, completeLesson } = useGameStore();
  const { profile, recordAttempt, getAdaptedMissionConfig, startSession, generateLearningPath } = useLearningStore();
  const { updateProgress } = useProgressTracker();
  const { isAnalyzing, lastAnalysis, analyzeEntropy, calculateLocalEntropy } = useEntropyAnalysis();
  
  const [phase, setPhase] = useState<GamePhase>("select");
  const [currentMissionId, setCurrentMissionId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [missionStartTime, setMissionStartTime] = useState<number>(0);
  const [errorsBeforeSuccess, setErrorsBeforeSuccess] = useState(0);
  const [showAdaptivePanel, setShowAdaptivePanel] = useState(false);
  const [adaptiveConfig, setAdaptiveConfig] = useState<AdaptiveMissionConfig | null>(null);
  
  // Circuit state
  const [placedNeurons, setPlacedNeurons] = useState<PlacedNeuron[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  
  // Simulation state
  const [behavior, setBehavior] = useState<WormBehavior>("no_movement");
  const [activeNeurons, setActiveNeurons] = useState<string[]>([]);
  const [signalPath, setSignalPath] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentMission = currentMissionId ? getMissionById(currentMissionId) : null;
  const completedMissionIds = completedLessons.map(l => parseInt(l.replace("mission-", "")));
  const localEntropy = calculateLocalEntropy();
  
  // Start session on mount and analyze entropy
  useEffect(() => {
    startSession();
    if (user) {
      analyzeEntropy(user.id, "middle", completedMissionIds.map(String), {}, "full");
    }
  }, [startSession, user]);
  
  // Generate adaptive mission recommendations from entropy analysis
  const adaptiveMissions = useMemo(() => {
    if (!lastAnalysis) return null;
    
    return lastAnalysis.result.recommendedChallenges.map(challenge => {
      // Map AI recommendations to actual missions
      const missionMatch = MISSIONS.find(m => 
        m.title.toLowerCase().includes(challenge.focusArea.toLowerCase()) ||
        challenge.focusArea.toLowerCase().includes(m.requiredNeurons[0]?.toLowerCase() || '')
      );
      return {
        ...challenge,
        missionId: missionMatch?.id || null,
        mission: missionMatch,
      };
    });
  }, [lastAnalysis]);
  
  // Get local adaptive config for current mission
  const localAdaptiveConfig = currentMissionId ? getAdaptedMissionConfig(currentMissionId) : null;
  const recommendedPath = generateLearningPath();

  // Calculate combined adaptive config
  useEffect(() => {
    if (currentMissionId && lastAnalysis) {
      const entropyBased = lastAnalysis.result;
      const localConfig = getAdaptedMissionConfig(currentMissionId);
      
      setAdaptiveConfig({
        difficultyMultiplier: 1 + entropyBased.difficultyAdjustment,
        scaffoldingLevel: entropyBased.scaffoldingLevel,
        adaptedHints: entropyBased.contentAdaptations,
        entropyScore: lastAnalysis.calculatedEntropy,
        retentionPrediction: entropyBased.entropyAnalysis.retentionPrediction,
        focusAreas: entropyBased.entropyAnalysis.knowledgeGaps,
      });
    }
  }, [currentMissionId, lastAnalysis, getAdaptedMissionConfig]);

  const handleCircuitChange = useCallback((neurons: PlacedNeuron[], conns: ConnectionData[]) => {
    setPlacedNeurons(neurons);
    setConnections(conns);
  }, []);

  const testCircuit = () => {
    if (!currentMission) return;
    
    setIsSimulating(true);
    setAttempts(prev => prev + 1);
    
    const result = simulateCircuit(
      connections,
      currentMission.stimulus,
      placedNeurons.map(n => n.id)
    );
    
    setBehavior(result.behavior);
    setActiveNeurons(result.activeNeurons);
    setSignalPath(result.signalPath);
    
    // Check if mission complete
    const isComplete = isMissionComplete(connections, currentMission, result.behavior);
    
    if (isComplete) {
      // Record successful attempt for adaptive learning
      const timeSpent = Math.round((Date.now() - missionStartTime) / 1000);
      recordAttempt({
        missionId: currentMission.id,
        timestamp: Date.now(),
        success: true,
        timeSpentSeconds: timeSpent,
        hintsUsed,
        neuronsPlaced: placedNeurons.length,
        connectionsCreated: connections.length,
        errorsBeforeSuccess,
      });
      
      // Calculate accuracy based on attempts and hints
      const accuracy = Math.max(0, Math.min(100, 100 - (errorsBeforeSuccess * 10) - (hintsUsed * 5)));
      
      // Update student progress in database
      updateProgress({
        missionId: `mission-${currentMission.id}`,
        xpEarned: currentMission.xpReward,
        accuracy,
        skillsUsed: currentMission.requiredNeurons || [],
        success: true
      }).then((saved) => {
        if (saved) {
          toast.success('Progress synced to classroom!', {
            description: `+${currentMission.xpReward} XP earned`
          });
        }
      });
      
      // Re-analyze entropy after completion
      if (user) {
        analyzeEntropy(user.id, "middle", [...completedMissionIds, currentMission.id].map(String), {}, "quick");
      }
      
      setTimeout(() => {
        setPhase("complete");
        addXp(currentMission.xpReward);
        addPoints(currentMission.xpReward * 2);
        completeLesson(`mission-${currentMission.id}`);
      }, 2000);
    } else {
      // Track failed attempts
      setErrorsBeforeSuccess(prev => prev + 1);
    }
    
    setTimeout(() => setIsSimulating(false), 3000);
  };
  
  const handleHintUsed = useCallback(() => {
    setHintsUsed(prev => prev + 1);
  }, []);

  const resetCircuit = () => {
    setPlacedNeurons([]);
    setConnections([]);
    setBehavior("no_movement");
    setActiveNeurons([]);
    setSignalPath([]);
    setIsSimulating(false);
  };

  const selectMission = (missionId: number) => {
    setCurrentMissionId(missionId);
    setPhase("briefing");
    setAttempts(0);
    setHintsUsed(0);
    setErrorsBeforeSuccess(0);
    resetCircuit();
  };

  const startMission = () => {
    setPhase("playing");
    setMissionStartTime(Date.now());
  };

  const nextMission = () => {
    // Use entropy-based recommendation for next mission
    if (lastAnalysis && lastAnalysis.result.recommendedChallenges.length > 0) {
      const nextRecommended = adaptiveMissions?.find(am => 
        am.missionId && !completedMissionIds.includes(am.missionId)
      );
      if (nextRecommended?.missionId) {
        selectMission(nextRecommended.missionId);
        return;
      }
    }
    
    // Fallback to sequential
    if (currentMissionId && currentMissionId < MISSIONS.length) {
      selectMission(currentMissionId + 1);
    } else {
      setPhase("select");
    }
  };

  const isMissionUnlocked = (mission: typeof MISSIONS[0]) => {
    if (mission.unlockRequirement === 0) return true;
    return completedMissionIds.includes(mission.unlockRequirement);
  };

  const getEntropyColor = (entropy: number) => {
    if (entropy < 0.3) return "text-green-500";
    if (entropy < 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const getMissionPriority = (missionId: number): "high" | "medium" | "low" | null => {
    if (!adaptiveMissions) return null;
    const match = adaptiveMissions.find(am => am.missionId === missionId);
    if (!match) return null;
    if (match.difficulty < 0.4) return "low";
    if (match.difficulty > 0.7) return "high";
    return "medium";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Back button */}
          {phase !== "select" && (
            <Button
              variant="ghost"
              onClick={() => setPhase("select")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Missions
            </Button>
          )}

          {/* Mission Select */}
          {phase === "select" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">
                  <span className="text-primary">Neuro</span>Quest
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Become a Worm Brain Detective! Challenges auto-adapt to your learning profile.
                </p>
              </div>

              {/* Entropy-Based Adaptive Banner */}
              {lastAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          Adaptive Synapses Active
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </Badge>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Entropy: <span className={getEntropyColor(lastAnalysis.calculatedEntropy)}>
                            {lastAnalysis.calculatedEntropy.toFixed(3)}
                          </span> | 
                          Predicted Retention: <span className="text-green-500">
                            {lastAnalysis.result.entropyAnalysis.retentionPrediction}%
                          </span> |
                          Scaffolding: <span className="capitalize">{lastAnalysis.result.scaffoldingLevel}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {lastAnalysis.result.entropyAnalysis.knowledgeGaps.slice(0, 2).map((gap, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {gap}
                        </Badge>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdaptivePanel(!showAdaptivePanel)}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {showAdaptivePanel ? "Hide" : "Details"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Collapsible Adaptive Panel */}
              <AnimatePresence>
                {showAdaptivePanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <AdaptiveSynapsePanel
                      onChallengeSelect={(challenge) => {
                        const match = MISSIONS.find(m => 
                          m.title.toLowerCase().includes(challenge.title.toLowerCase().split(' ')[0])
                        );
                        if (match && isMissionUnlocked(match)) {
                          selectMission(match.id);
                        }
                      }}
                      defaultAgeGroup="middle"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  {/* AI Recommended Next */}
                  {adaptiveMissions && adaptiveMissions.length > 0 && (
                    <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          AI-Recommended Next Challenge
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {adaptiveMissions.filter(am => am.mission && isMissionUnlocked(am.mission) && !completedMissionIds.includes(am.missionId!)).slice(0, 1).map((rec) => (
                          <div
                            key={rec.id}
                            className="p-4 rounded-lg border border-primary/30 bg-background/50 cursor-pointer hover:bg-primary/5 transition-colors"
                            onClick={() => rec.missionId && selectMission(rec.missionId)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <Badge variant="default" className="mb-2">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Optimal for Your Profile
                                </Badge>
                                <h3 className="font-bold text-lg">{rec.mission?.title}</h3>
                              </div>
                              <ChevronRight className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{rec.rationale}</p>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {rec.mission?.xpReward} XP
                              </span>
                              <span>Difficulty: {Math.round((rec.difficulty || 0.5) * 100)}%</span>
                              <Badge variant="outline">Focus: {rec.focusArea}</Badge>
                            </div>
                          </div>
                        ))}
                        {adaptiveMissions.filter(am => am.mission && isMissionUnlocked(am.mission) && !completedMissionIds.includes(am.missionId!)).length === 0 && (
                          <p className="text-muted-foreground text-center py-4">
                            Complete more missions to unlock AI recommendations!
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Mission Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {MISSIONS.map((mission) => {
                      const unlocked = isMissionUnlocked(mission);
                      const completed = completedMissionIds.includes(mission.id);
                      const priority = getMissionPriority(mission.id);
                      const isRecommended = recommendedPath.includes(mission.id);
                      
                      return (
                        <motion.div
                          key={mission.id}
                          whileHover={unlocked ? { scale: 1.02 } : {}}
                          className={`
                            relative p-5 rounded-xl border-2 transition-all
                            ${completed 
                              ? "bg-primary/10 border-primary" 
                              : unlocked 
                                ? priority === "high"
                                  ? "bg-card border-yellow-500/50 hover:shadow-lg cursor-pointer ring-2 ring-yellow-500/20"
                                  : "bg-card border-foreground hover:shadow-lg cursor-pointer" 
                                : "bg-muted/50 border-muted-foreground/30 opacity-60"
                            }
                          `}
                          onClick={() => unlocked && selectMission(mission.id)}
                        >
                          {/* Priority indicator */}
                          {priority === "high" && !completed && (
                            <div className="absolute -top-2 -right-2">
                              <Badge className="bg-yellow-500 text-yellow-950">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Priority
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant={completed ? "default" : "secondary"}>
                              Mission {mission.id}
                            </Badge>
                            {completed && <CheckCircle2 className="w-5 h-5 text-primary" />}
                            {!unlocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          
                          <h3 className="font-bold text-lg mb-2">{mission.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {mission.goal}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {mission.xpReward} XP
                            </span>
                            <span>Difficulty: {mission.difficulty}/5</span>
                            {isRecommended && (
                              <Badge variant="outline" className="text-xs text-primary border-primary/50">
                                <Sparkles className="w-2 h-2 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Entropy Summary Card */}
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Learning Entropy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Knowledge Consistency</span>
                            <span className={getEntropyColor(localEntropy)}>
                              {((1 - localEntropy) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={(1 - localEntropy) * 100} className="h-2" />
                        </div>
                        {lastAnalysis && (
                          <>
                            <div className="text-xs text-muted-foreground">
                              Scaffolding: <span className="capitalize font-medium">{lastAnalysis.result.scaffoldingLevel}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => user && analyzeEntropy(user.id, "middle", completedMissionIds.map(String), {}, "full")}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? "Analyzing..." : "Refresh Analysis"}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <SkillDashboard />
                  <ProgressTracker
                    level={level}
                    xp={xp}
                    xpToNext={xpToNext}
                    totalPoints={totalPoints}
                    achievements={achievements}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Mission Briefing */}
          {phase === "briefing" && currentMission && (
            <div className="max-w-2xl mx-auto">
              {/* Adaptive Context Banner */}
              {adaptiveConfig && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium">Adaptive Mode:</span>
                    <Badge variant="outline" className="capitalize">{adaptiveConfig.scaffoldingLevel} scaffolding</Badge>
                    <span className="text-muted-foreground">
                      | Difficulty: {(adaptiveConfig.difficultyMultiplier * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              )}
              <MissionBriefing
                mission={currentMission}
                onStartMission={startMission}
              />
            </div>
          )}

          {/* Playing */}
          {phase === "playing" && currentMission && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Circuit Builder */}
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">{currentMission.subtitle}</Badge>
                    <h2 className="text-xl font-bold">{currentMission.title}</h2>
                    {adaptiveConfig && adaptiveConfig.scaffoldingLevel !== "none" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <Lightbulb className="w-3 h-3 inline mr-1" />
                        Hint: {adaptiveConfig.adaptedHints[0] || currentMission.hints[0]}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetCircuit}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                    <Button onClick={testCircuit} disabled={isSimulating || connections.length === 0}>
                      <FlaskConical className="w-4 h-4 mr-1" />
                      Test Circuit
                    </Button>
                  </div>
                </div>
                
                <CircuitBuilder
                  onCircuitChange={handleCircuitChange}
                  activeNeurons={activeNeurons}
                  recommendedNeurons={currentMission.recommendedNeurons}
                />
              </div>

              {/* Right: Worm + Tutor */}
              <div className="space-y-4">
                <div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-lg">
                  <h3 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Worm Simulator
                  </h3>
                  <WormSimulator3D
                    behavior={behavior}
                    activeNeurons={activeNeurons}
                    signalPath={signalPath}
                    isSimulating={isSimulating}
                  />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Stimulus: {currentMission.stimulus.replace("_", " ")}
                  </p>
                </div>

                <AITutor
                  missionContext={currentMission.description}
                  userCircuit={JSON.stringify(connections.slice(0, 5))}
                  solutionHint={adaptiveConfig?.adaptedHints[0] || currentMission.hints[0]}
                  ageGroup="middle"
                  className="h-[300px]"
                />
              </div>
            </div>
          )}

          {/* Complete */}
          {phase === "complete" && currentMission && (
            <div className="max-w-2xl mx-auto">
              <MissionComplete
                mission={currentMission}
                attempts={attempts}
                activeNeurons={activeNeurons}
                onNextMission={nextMission}
                onBackToMissions={() => setPhase("select")}
                hasNextMission={currentMissionId !== null && currentMissionId < MISSIONS.length}
              />
              
              {/* Post-mission entropy update */}
              {lastAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-primary/10 border border-green-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium">Entropy Reduced!</p>
                      <p className="text-sm text-muted-foreground">
                        Your knowledge consistency improved. Next challenge optimized for maximum retention.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
