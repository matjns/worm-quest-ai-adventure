import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Github, 
  Trophy,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExOStats {
  circuitsShared: number;
  totalLikes: number;
  commentsGiven: number;
  commentsReceived: number;
  githubContributions: number;
  communityRank: number;
  impactScore: number;
}

interface ExOMetricsProps {
  className?: string;
  compact?: boolean;
}

// ExO level thresholds
const EXO_LEVELS = [
  { level: 1, name: 'Observer', minImpact: 0, icon: '🔬' },
  { level: 2, name: 'Contributor', minImpact: 10, icon: '🧬' },
  { level: 3, name: 'Collaborator', minImpact: 50, icon: '🧠' },
  { level: 4, name: 'Innovator', minImpact: 150, icon: '⚡' },
  { level: 5, name: 'Pioneer', minImpact: 500, icon: '🚀' },
];

function getExOLevel(impactScore: number) {
  for (let i = EXO_LEVELS.length - 1; i >= 0; i--) {
    if (impactScore >= EXO_LEVELS[i].minImpact) {
      return EXO_LEVELS[i];
    }
  }
  return EXO_LEVELS[0];
}

function getNextLevel(impactScore: number) {
  for (const level of EXO_LEVELS) {
    if (impactScore < level.minImpact) {
      return level;
    }
  }
  return null;
}

export function ExOMetrics({ className, compact = false }: ExOMetricsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ExOStats>({
    circuitsShared: 0,
    totalLikes: 0,
    commentsGiven: 0,
    commentsReceived: 0,
    githubContributions: 0,
    communityRank: 0,
    impactScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user's profile for circuits_shared and total_likes
        const { data: profile } = await supabase
          .from('profiles')
          .select('circuits_shared, total_likes')
          .eq('user_id', user.id)
          .single();

        // Fetch comments given by user
        const { count: commentsGiven } = await supabase
          .from('circuit_comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch user's circuits to count comments received
        const { data: userCircuits } = await supabase
          .from('shared_circuits')
          .select('id')
          .eq('user_id', user.id);

        let commentsReceived = 0;
        if (userCircuits && userCircuits.length > 0) {
          const circuitIds = userCircuits.map(c => c.id);
          const { count } = await supabase
            .from('circuit_comments')
            .select('*', { count: 'exact', head: true })
            .in('circuit_id', circuitIds)
            .neq('user_id', user.id);
          commentsReceived = count || 0;
        }

        // Calculate impact score
        const circuitsShared = profile?.circuits_shared || 0;
        const totalLikes = profile?.total_likes || 0;
        const impactScore = 
          (circuitsShared * 10) + // 10 points per circuit shared
          (totalLikes * 5) + // 5 points per like received
          ((commentsGiven || 0) * 2) + // 2 points per comment given
          (commentsReceived * 3); // 3 points per comment received

        setStats({
          circuitsShared,
          totalLikes,
          commentsGiven: commentsGiven || 0,
          commentsReceived,
          githubContributions: 0, // Would need GitHub API integration
          communityRank: 0, // Would need global ranking calculation
          impactScore
        });
      } catch (error) {
        console.error('Error fetching ExO metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  const currentLevel = getExOLevel(stats.impactScore);
  const nextLevel = getNextLevel(stats.impactScore);
  const progressToNext = nextLevel 
    ? ((stats.impactScore - currentLevel.minImpact) / (nextLevel.minImpact - currentLevel.minImpact)) * 100
    : 100;

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{currentLevel.icon}</div>
              <div>
                <p className="font-semibold">{currentLevel.name}</p>
                <p className="text-xs text-muted-foreground">{stats.impactScore} Impact</p>
              </div>
            </div>
            <div className="flex gap-3 text-center">
              <div>
                <p className="font-bold text-primary">{stats.circuitsShared}</p>
                <p className="text-xs text-muted-foreground">Shared</p>
              </div>
              <div>
                <p className="font-bold text-pink-500">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Community Impact (ExO)
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Level {currentLevel.level}
          </Badge>
        </div>
        <CardDescription>
          Your contributions to the OpenWorm community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ExO Level Card */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentLevel.icon}</span>
              <div>
                <p className="font-bold text-lg">{currentLevel.name}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.impactScore} Impact Points
                </p>
              </div>
            </div>
            {nextLevel && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next: {nextLevel.name}</p>
                <p className="text-sm font-medium">
                  {nextLevel.minImpact - stats.impactScore} pts to go
                </p>
              </div>
            )}
          </div>
          {nextLevel && (
            <Progress value={progressToNext} className="h-2" />
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Circuits Shared</span>
            </div>
            <p className="text-2xl font-bold">{stats.circuitsShared}</p>
            <p className="text-xs text-muted-foreground">+10 pts each</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Likes Received</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalLikes}</p>
            <p className="text-xs text-muted-foreground">+5 pts each</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Comments Given</span>
            </div>
            <p className="text-2xl font-bold">{stats.commentsGiven}</p>
            <p className="text-xs text-muted-foreground">+2 pts each</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Comments Received</span>
            </div>
            <p className="text-2xl font-bold">{stats.commentsReceived}</p>
            <p className="text-xs text-muted-foreground">+3 pts each</p>
          </div>
        </div>

        {/* Contribution CTA */}
        {stats.circuitsShared === 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Start Contributing!</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Share your first circuit to earn 10 Impact Points and unlock the Contributor level.
                </p>
                <Link to="/community">
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Visit Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* All Levels Preview */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">ExO Levels</p>
          <div className="flex justify-between">
            {EXO_LEVELS.map((level) => (
              <div 
                key={level.level} 
                className={`text-center ${stats.impactScore >= level.minImpact ? 'opacity-100' : 'opacity-40'}`}
              >
                <span className="text-lg">{level.icon}</span>
                <p className="text-xs">{level.name}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
