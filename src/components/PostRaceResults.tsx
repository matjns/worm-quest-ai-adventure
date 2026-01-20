import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, BarChart3, PlayCircle, Share2, 
  ArrowLeft, Download, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RaceReplay } from "./RaceReplay";
import { RaceAnalytics } from "./RaceAnalytics";
import { SocialShareButtons } from "./SocialShareButtons";
import { RaceRecording } from "@/hooks/useRaceRecording";
import { cn } from "@/lib/utils";

interface PostRaceResultsProps {
  recording: RaceRecording;
  currentUserId?: string;
  onPlayAgain?: () => void;
  onExit?: () => void;
  className?: string;
}

export function PostRaceResults({
  recording,
  currentUserId,
  onPlayAgain,
  onExit,
  className,
}: PostRaceResultsProps) {
  const [activeTab, setActiveTab] = useState<string>("results");
  const [showShare, setShowShare] = useState(false);

  // Find current user's result
  const userResult = recording.finalResults.find(r => r.user_id === currentUserId);
  const isWinner = userResult?.finish_rank === 1;

  // Generate share text
  const shareText = userResult?.finish_rank
    ? `I finished #${userResult.finish_rank} in a NeuroQuest Worm Race! My worm "${userResult.worm_name}" had ${userResult.neuronCount} neurons and averaged ${userResult.avgSpeed.toFixed(2)} speed. 🧠🐛`
    : `Just watched an epic NeuroQuest Worm Race! The neural circuits were amazing! 🧠🐛`;

  const handleDownloadReplay = () => {
    const dataStr = JSON.stringify(recording, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `race-replay-${recording.raceId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-6", className)}
    >
      {/* Winner celebration */}
      {isWinner && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block"
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold mt-4 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            You Won!
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </h2>
          <p className="text-muted-foreground">
            Your neural circuit powered "{userResult?.worm_name}" to victory!
          </p>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={onExit}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
        <Button onClick={onPlayAgain}>
          <PlayCircle className="w-4 h-4 mr-2" />
          Race Again
        </Button>
        <Button variant="outline" onClick={() => setShowShare(!showShare)}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Results
        </Button>
        <Button variant="ghost" onClick={handleDownloadReplay}>
          <Download className="w-4 h-4 mr-2" />
          Download Replay
        </Button>
      </div>

      {/* Share buttons */}
      {showShare && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <SocialShareButtons
                circuitId={recording.raceId}
                title={shareText}
                description={`Race replay from NeuroQuest - ${recording.raceName}`}
                variant="inline"
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs for replay and analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="replay" className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Replay
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-4">
          <RaceAnalytics 
            recording={recording} 
            currentUserId={currentUserId}
          />
        </TabsContent>

        <TabsContent value="replay" className="mt-4">
          <RaceReplay recording={recording} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <RaceAnalytics 
            recording={recording} 
            currentUserId={currentUserId}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
