import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { CircuitBuilder } from "@/components/CircuitBuilder";
import { WormSimulator3D } from "@/components/WormSimulator3D";
import { AITutor } from "@/components/AITutor";
import { MissionBriefing } from "@/components/MissionBriefing";
import { MissionComplete } from "@/components/MissionComplete";
import { ProgressTracker } from "@/components/ProgressTracker";
import { SkillDashboard } from "@/components/SkillDashboard";
import { useGameStore } from "@/stores/gameStore";
import { useLearningStore } from "@/stores/learningStore";
import { MISSIONS, getMissionById, isMissionComplete } from "@/data/missionData";
import { simulateCircuit, ConnectionData, WormBehavior } from "@/data/neuronData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Play, 
  Lock, 
  CheckCircle2, 
  Zap,
  RotateCcw,
  FlaskConical,
  TrendingUp,
  Sparkles
} from "lucide-react";

type GamePhase = "select" | "briefing" | "playing" | "complete";

interface PlacedNeuron {
  id: string;
  canvasX: number;
  canvasY: number;
}

export default function NeuroQuestPage() {
  const { level, xp, xpToNext, totalPoints, achievements, completedLessons, addXp, addPoints, completeLesson } = useGameStore();
  const { profile, recordAttempt, getAdaptedMissionConfig, startSession, generateLearningPath } = useLearningStore();
  
  const [phase, setPhase] = useState<GamePhase>("select");
  const [currentMissionId, setCurrentMissionId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [missionStartTime, setMissionStartTime] = useState<number>(0);
  const [errorsBeforeSuccess, setErrorsBeforeSuccess] = useState(0);
  
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
  
  // Start session on mount
  useEffect(() => {
    startSession();
  }, [startSession]);
  
  // Get adaptive config for current mission
  const adaptiveConfig = currentMissionId ? getAdaptedMissionConfig(currentMissionId) : null;
  const recommendedPath = generateLearningPath();

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
                  Become a Worm Brain Detective! Solve neuroscience mysteries by building neural circuits.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {MISSIONS.map((mission) => {
                      const unlocked = isMissionUnlocked(mission);
                      const completed = completedMissionIds.includes(mission.id);
                      
                      return (
                        <motion.div
                          key={mission.id}
                          whileHover={unlocked ? { scale: 1.02 } : {}}
                          className={`
                            relative p-5 rounded-xl border-2 transition-all
                            ${completed 
                              ? "bg-primary/10 border-primary" 
                              : unlocked 
                                ? "bg-card border-foreground hover:shadow-lg cursor-pointer" 
                                : "bg-muted/50 border-muted-foreground/30 opacity-60"
                            }
                          `}
                          onClick={() => unlocked && selectMission(mission.id)}
                        >
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
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {mission.xpReward} XP
                            </span>
                            <span>Difficulty: {mission.difficulty}/5</span>
                            {recommendedPath.includes(mission.id) && (
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
                  solutionHint={currentMission.hints[0]}
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
