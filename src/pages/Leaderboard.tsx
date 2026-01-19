import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, Brain, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/stores/gameStore";

const leaderboardData = [
  { rank: 1, name: "NeuronMaster42", points: 125000, level: 47, streak: 30 },
  { rank: 2, name: "WormWhisperer", points: 98500, level: 38, streak: 22 },
  { rank: 3, name: "SynapseKing", points: 87200, level: 35, streak: 18 },
  { rank: 4, name: "BrainBuilder99", points: 76800, level: 32, streak: 15 },
  { rank: 5, name: "ConnectomeQueen", points: 65400, level: 29, streak: 12 },
  { rank: 6, name: "NeuroNinja", points: 54200, level: 26, streak: 10 },
  { rank: 7, name: "WormWizard", points: 43100, level: 23, streak: 8 },
  { rank: 8, name: "ScienceSquid", points: 32500, level: 20, streak: 7 },
  { rank: 9, name: "DataDragon", points: 21800, level: 17, streak: 5 },
  { rank: 10, name: "AIApprentice", points: 15400, level: 14, streak: 3 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-[hsl(45_100%_50%)]" />;
    case 2:
      return <Medal className="w-6 h-6 text-[hsl(0_0%_70%)]" />;
    case 3:
      return <Medal className="w-6 h-6 text-[hsl(30_70%_50%)]" />;
    default:
      return <span className="font-mono text-lg">#{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-[hsl(45_100%_50%_/_0.1)] border-[hsl(45_100%_50%)]";
    case 2:
      return "bg-[hsl(0_0%_70%_/_0.1)] border-[hsl(0_0%_70%)]";
    case 3:
      return "bg-[hsl(30_70%_50%_/_0.1)] border-[hsl(30_70%_50%)]";
    default:
      return "bg-card border-foreground";
  }
};

export default function LeaderboardPage() {
  const { level, totalPoints } = useGameStore();

  // Calculate user's rank
  const userRank = leaderboardData.findIndex((p) => p.points < totalPoints) + 1 || leaderboardData.length + 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Top neural explorers from around the world. Can you reach #1?
            </p>
          </motion.div>

          {/* Your Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary text-primary-foreground border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-foreground text-primary border-2 border-primary-foreground flex items-center justify-center">
                  <Brain className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-mono text-sm opacity-80">YOUR RANK</p>
                  <p className="text-3xl font-bold">#{userRank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm opacity-80">YOUR SCORE</p>
                <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="font-mono text-sm opacity-80">LEVEL</p>
                <p className="text-3xl font-bold">{level}</p>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {leaderboardData.map((player, i) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={cn(
                  "border-2 p-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  getRankBg(player.rank),
                  player.rank <= 3 && "shadow-[4px_4px_0px_hsl(var(--foreground))]"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-10 flex justify-center">
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-muted border-2 border-foreground flex items-center justify-center">
                      <span className="font-bold">{player.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold uppercase">{player.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">Level {player.level}</p>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="hidden sm:flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-[hsl(45_100%_50%)]" />
                    <span className="font-mono">{player.streak} day streak</span>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className="text-lg font-bold">{player.points.toLocaleString()}</p>
                    <p className="text-xs font-mono text-muted-foreground">POINTS</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Weekly Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 bg-accent/10 border-2 border-accent p-6 shadow-[4px_4px_0px_hsl(var(--accent))]"
          >
            <div className="flex items-center gap-4 mb-4">
              <Star className="w-8 h-8 text-accent" />
              <div>
                <h3 className="text-xl font-bold uppercase">Weekly Challenge</h3>
                <p className="text-sm text-muted-foreground">Complete to earn bonus XP</p>
              </div>
            </div>
            <p className="text-lg mb-4">
              <strong>This Week:</strong> Build a neural pathway that makes the worm 
              respond to exactly 3 different stimuli. Share your solution!
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="font-mono text-sm">1,247 participants</span>
              </div>
              <span className="font-bold text-accent">+500 XP Reward</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}