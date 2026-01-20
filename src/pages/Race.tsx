import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WormRaceLobby } from "@/components/WormRaceLobby";
import { RaceGameplay } from "@/components/RaceGameplay";
import { GlobalImpactCounter } from "@/components/GlobalImpactCounter";
import { useWormRace } from "@/hooks/useWormRace";

export default function Race() {
  const { raceId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeRaceId, setActiveRaceId] = useState<string | undefined>(raceId);
  const [showGameplay, setShowGameplay] = useState(false);
  
  const { race } = useWormRace(activeRaceId);

  // Sync URL param
  useEffect(() => {
    if (raceId) {
      setActiveRaceId(raceId);
    }
  }, [raceId]);

  // Watch for race start
  useEffect(() => {
    if (race?.status === "racing") {
      setShowGameplay(true);
    }
  }, [race?.status]);

  const handleJoinRace = (id: string) => {
    setActiveRaceId(id);
    navigate(`/race/${id}`, { replace: true });
  };

  const handleRaceStart = () => {
    setShowGameplay(true);
  };

  const handleExitRace = () => {
    setShowGameplay(false);
    setActiveRaceId(undefined);
    navigate("/race", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Multiplayer Worm Races
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Global Impact Counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlobalImpactCounter />
        </motion.div>

        {/* Race Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {showGameplay && activeRaceId ? (
            <RaceGameplay 
              raceId={activeRaceId} 
              onExit={handleExitRace}
            />
          ) : (
            <div className="max-w-2xl mx-auto">
              <WormRaceLobby
                raceId={activeRaceId}
                onRaceStart={handleRaceStart}
                onJoinRace={handleJoinRace}
              />
              
              {/* Instructions */}
              <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border">
                <h3 className="font-semibold mb-3">How to Race</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Create a race or join an existing one</li>
                  <li>2. Your worm's speed is determined by your neural circuit configuration</li>
                  <li>3. More neurons and connections = faster worm!</li>
                  <li>4. Wait for the host to start the race</li>
                  <li>5. Watch your worm race to the finish line!</li>
                </ol>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
