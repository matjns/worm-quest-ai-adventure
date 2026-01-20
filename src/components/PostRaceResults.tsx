import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, BarChart3, PlayCircle, Share2, 
  ArrowLeft, Download, Sparkles, Award, Twitter, Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RaceReplay } from "./RaceReplay";
import { RaceAnalytics } from "./RaceAnalytics";
import { SocialShareButtons } from "./SocialShareButtons";
import { RaceRecording } from "@/hooks/useRaceRecording";
import { useRaceAchievements, RaceResult } from "@/hooks/useRaceAchievements";
import { useEngagementStore } from "@/stores/engagementStore";
import { shareToTwitter, shareToLinkedIn } from "@/utils/socialShare";
import { cn } from "@/lib/utils";

interface PostRaceResultsProps {
  recording: RaceRecording;
  currentUserId?: string;
  onPlayAgain?: () => void;
  onExit?: () => void;
  className?: string;
  isHost?: boolean;
}

export function PostRaceResults({
  recording,
  currentUserId,
  onPlayAgain,
  onExit,
  className,
  isHost = false,
}: PostRaceResultsProps) {
  const [activeTab, setActiveTab] = useState<string>("results");
  const [showShare, setShowShare] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const { processRaceResult } = useRaceAchievements();
  const { badges } = useEngagementStore();

  // Find current user's result
  const userResult = recording.finalResults.find(r => r.user_id === currentUserId);
  const isWinner = userResult?.finish_rank === 1;

  // Process achievements when component mounts
  useEffect(() => {
    if (!userResult || !currentUserId) return;

    const badgesBefore = badges.filter(b => b.unlockedAt).map(b => b.id);

    const raceResult: RaceResult = {
      finishRank: userResult.finish_rank || 999,
      totalParticipants: recording.finalResults.length,
      raceTimeSeconds: recording.duration / 1000,
      neuronCount: userResult.neuronCount || 0,
      wasInLead: true, // Simplified - would need tracking
      wasInLastPlace: false, // Simplified - would need tracking
      isHost,
    };

    processRaceResult(raceResult);

    // Check for newly unlocked badges (after processing)
    setTimeout(() => {
      const badgesAfter = badges.filter(b => b.unlockedAt).map(b => b.id);
      const newlyUnlocked = badgesAfter.filter(id => !badgesBefore.includes(id));
      if (newlyUnlocked.length > 0) {
        setNewBadges(newlyUnlocked);
      }
    }, 100);
  }, [userResult, currentUserId, recording, isHost, processRaceResult, badges]);

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

  // Get newly unlocked badge details
  const unlockedBadgeDetails = newBadges.map(id => badges.find(b => b.id === id)).filter(Boolean);

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

      {/* New badges earned */}
      {unlockedBadgeDetails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-bold">New Achievements Unlocked!</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {unlockedBadgeDetails.map((badge) => (
                  <Badge
                    key={badge!.id}
                    className={cn(
                      "animate-pulse",
                      badge!.rarity === "legendary" && "bg-gradient-to-r from-amber-400 to-amber-600",
                      badge!.rarity === "epic" && "bg-gradient-to-r from-purple-400 to-purple-600",
                      badge!.rarity === "rare" && "bg-gradient-to-r from-blue-400 to-blue-600"
                    )}
                  >
                    {badge!.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
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

      {/* Quick social share buttons for viral races */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick share:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => shareToTwitter({
            title: isWinner ? `🏆 I won the Worm Race!` : `Just raced in NeuroQuest!`,
            description: shareText,
            url: `${window.location.origin}/race`,
            tags: ["NeuroQuest", "OpenWorm", "WormRace", "Neuroscience"],
          })}
          className="gap-2"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => shareToLinkedIn({
            title: `NeuroQuest Worm Race Achievement`,
            url: `${window.location.origin}/race`,
          })}
          className="gap-2"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
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
