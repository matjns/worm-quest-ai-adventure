import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  Trophy,
  Medal,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  School,
  Users,
  Rocket,
  Crown,
  Award,
  Loader2
} from 'lucide-react';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2: return <Medal className="w-5 h-5 text-gray-400" />;
    case 3: return <Medal className="w-5 h-5 text-amber-600" />;
    default: return <span className="text-sm font-bold">#{rank}</span>;
  }
};

const getRankBadge = (rank: number, total: number) => {
  const percentile = ((total - rank + 1) / total) * 100;
  if (percentile >= 90) return { label: 'Top 10%', color: 'bg-yellow-500' };
  if (percentile >= 75) return { label: 'Top 25%', color: 'bg-primary' };
  if (percentile >= 50) return { label: 'Top 50%', color: 'bg-accent' };
  return { label: 'Rising Star', color: 'bg-muted' };
};

export default function StudentDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    studentRecord,
    classroom,
    classmates,
    rank,
    level,
    xpInCurrentLevel,
    loading
  } = useStudentProgress();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-4">Your Progress</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your learning progress and stats.</p>
          <Link to="/auth">
            <Button variant="hero" size="lg">Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (!studentRecord) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 text-center">
          <School className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Join a Classroom</h1>
          <p className="text-muted-foreground mb-6">
            You haven't joined a classroom yet. Ask your teacher for a join code.
          </p>
          <Link to="/join">
            <Button variant="hero" size="lg">
              <Users className="w-4 h-4 mr-2" />
              Join Classroom
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const progress = studentRecord.progress_data;
  const rankBadge = getRankBadge(rank, classmates.length);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">
                    {studentRecord.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{studentRecord.display_name}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <School className="w-3 h-3" />
                    {classroom?.name || 'Unknown Classroom'}
                  </p>
                </div>
              </div>
            </div>
            <Link to="/neuroquest">
              <Button variant="hero">
                <Rocket className="w-4 h-4 mr-2" />
                Continue Quest
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Level & XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-2 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center">
                    <span className="text-3xl font-black text-primary">{level}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="text-2xl font-bold">Neural Explorer</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={xpInCurrentLevel} className="w-32 h-2" />
                      <span className="text-xs text-muted-foreground">{xpInCurrentLevel}/100 XP</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{progress.total_xp}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-accent">{progress.missions_completed}</p>
                    <p className="text-xs text-muted-foreground">Missions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-500">{progress.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Skills */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Current Streak', value: '3 days', icon: Zap, color: 'text-yellow-500' },
                  { label: 'Best Streak', value: '7 days', icon: Trophy, color: 'text-primary' },
                  { label: 'Class Rank', value: `#${rank}`, icon: Medal, color: 'text-accent' },
                  { label: 'Badges', value: '5', icon: Award, color: 'text-purple-500' },
                ].map((stat, i) => (
                  <Card key={stat.label} className="border-2">
                    <CardContent className="p-4 text-center">
                      <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Strengths & Weaknesses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 border-green-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {progress.strengths.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {progress.strengths.map((s, i) => (
                          <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-600">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Complete more missions to discover your strengths!</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {progress.weaknesses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {progress.weaknesses.map((w, i) => (
                          <Badge key={i} variant="secondary" className="bg-orange-500/10 text-orange-600">
                            {w}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Keep learning to identify areas for growth!</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'First Steps', desc: 'Complete first mission', unlocked: true },
                      { name: 'Brain Builder', desc: 'Build 5 circuits', unlocked: true },
                      { name: 'Quick Learner', desc: '80% accuracy', unlocked: progress.accuracy >= 80 },
                      { name: 'Neuroscientist', desc: 'Complete 10 missions', unlocked: progress.missions_completed >= 10 },
                    ].map((achievement) => (
                      <div 
                        key={achievement.name}
                        className={`p-3 rounded-lg text-center border-2 ${
                          achievement.unlocked 
                            ? 'border-yellow-500/50 bg-yellow-500/5' 
                            : 'border-muted opacity-50'
                        }`}
                      >
                        <Award className={`w-8 h-8 mx-auto mb-2 ${achievement.unlocked ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Class Ranking
                  </CardTitle>
                  <Badge className={rankBadge.color}>{rankBadge.label}</Badge>
                </div>
                <CardDescription>
                  You're #{rank} of {classmates.length} students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classmates.slice(0, 10).map((classmate, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        classmate.isCurrentUser 
                          ? 'bg-primary/10 border-2 border-primary/30' 
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${classmate.isCurrentUser ? 'text-primary' : ''}`}>
                            {classmate.display_name}
                            {classmate.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {classmate.missions_completed} missions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{classmate.total_xp}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </div>
                  ))}
                  
                  {classmates.length > 10 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      +{classmates.length - 10} more students
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}