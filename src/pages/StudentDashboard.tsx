import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityFeed } from '@/components/ActivityFeed';
import { SimulationAccuracyChart } from '@/components/SimulationAccuracyChart';
import { ExOMetrics } from '@/components/ExOMetrics';
import { SkillDashboard } from '@/components/SkillDashboard';
import { StudentAssignmentsView } from '@/components/StudentAssignmentsView';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationsData } from '@/hooks/useNotificationsData';
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
  Loader2,
  Activity,
  BarChart3,
  FileText,
  ClipboardList
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    studentRecord,
    classroom,
    classmates,
    rank,
    level,
    xpInCurrentLevel,
    loading
  } = useStudentProgress();
  const { notifications } = useNotificationsData();
  
  // Count unread assignment notifications
  const unreadAssignmentCount = notifications.filter(
    n => n.type === 'assignment' && !n.read
  ).length;

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

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2 relative">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Assignments</span>
              {unreadAssignmentCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                  {unreadAssignmentCount > 9 ? '9+' : unreadAssignmentCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
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

                {/* Simulation Accuracy Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <SimulationAccuracyChart 
                    currentAccuracy={progress.accuracy} 
                    className="border-2"
                  />
                </motion.div>

                {/* Strengths & Weaknesses */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
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
              </div>

              {/* Activity Feed Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ActivityFeed 
                  classroomId={studentRecord.classroom_id} 
                  currentUserId={user?.id}
                />
              </motion.div>
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <StudentAssignmentsView />
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SkillDashboard className="border-2" />
              
              {/* Recent Achievements */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'First Steps', desc: 'Complete first mission', unlocked: true },
                      { name: 'Brain Builder', desc: 'Build 5 circuits', unlocked: true },
                      { name: 'Quick Learner', desc: '80% accuracy', unlocked: progress.accuracy >= 80 },
                      { name: 'Neuroscientist', desc: 'Complete 10 missions', unlocked: progress.missions_completed >= 10 },
                      { name: 'Perfect Score', desc: '100% on any mission', unlocked: false },
                      { name: 'Week Warrior', desc: '7-day streak', unlocked: false },
                      { name: 'Circuit Master', desc: 'Build 20 circuits', unlocked: false },
                      { name: 'Community Star', desc: 'Share a circuit', unlocked: false },
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
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ExOMetrics className="border-2" />
              
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Community Challenges
                  </CardTitle>
                  <CardDescription>Weekly community goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Share 3 Circuits', progress: 1, total: 3, xp: 50 },
                    { name: 'Give 5 Helpful Comments', progress: 2, total: 5, xp: 30 },
                    { name: 'Earn 10 Likes', progress: 0, total: 10, xp: 100 },
                  ].map((challenge) => (
                    <div key={challenge.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{challenge.name}</span>
                        <Badge variant="outline">+{challenge.xp} XP</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress 
                          value={(challenge.progress / challenge.total) * 100} 
                          className="flex-1 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <Link to="/community">
                    <Button variant="outline" className="w-full mt-4">
                      <Users className="w-4 h-4 mr-2" />
                      Visit Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card className="border-2">
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
                  {classmates.slice(0, 15).map((classmate, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
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
                          <p className={`font-medium ${classmate.isCurrentUser ? 'text-primary' : ''}`}>
                            {classmate.display_name}
                            {classmate.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {classmate.missions_completed} missions • Level {Math.floor(classmate.total_xp / 100) + 1}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{classmate.total_xp} XP</p>
                      </div>
                    </div>
                  ))}
                  
                  {classmates.length > 15 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      +{classmates.length - 15} more students
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}