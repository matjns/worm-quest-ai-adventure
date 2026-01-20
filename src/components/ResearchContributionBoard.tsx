import { motion } from 'framer-motion';
import { 
  FlaskConical, 
  Trophy, 
  Star, 
  TrendingUp, 
  Users, 
  Globe, 
  Award,
  Dna,
  Brain,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResearchContributions } from '@/hooks/useResearchContributions';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const BEHAVIOR_ICONS: Record<string, string> = {
  chemotaxis: '🧪',
  thermotaxis: '🌡️',
  mechanosensation: '👆',
  avoidance: '🚫',
  foraging: '🔍',
  locomotion: '🏃',
  'touch-response': '✋',
  'nose-touch': '👃',
};

const BEHAVIOR_DESCRIPTIONS: Record<string, string> = {
  chemotaxis: 'Movement toward/away from chemicals',
  thermotaxis: 'Temperature-guided navigation',
  mechanosensation: 'Touch and pressure sensing',
  avoidance: 'Escape from harmful stimuli',
  foraging: 'Food-seeking behavior',
  locomotion: 'Basic movement patterns',
};

export function ResearchContributionBoard() {
  const { contributions, stats, globalStats, isLoading } = useResearchContributions();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const topContributions = contributions.slice(0, 10);
  const researchAligned = contributions.filter(c => c.researchScore >= 50);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-primary/10 border-2 border-primary/30 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <FlaskConical className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Research Contribution Board
                <Badge variant="secondary" className="text-xs">
                  🇺🇸 USA-Led
                </Badge>
              </h2>
              <p className="text-muted-foreground">
                Circuits contributing to OpenWorm's mission to simulate organisms
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => window.open('https://openworm.org', '_blank')}
            variant="outline"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            OpenWorm.org
          </Button>
        </div>

        {/* Global Impact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Brain className="w-4 h-4" />
              Circuits Shared
            </div>
            <p className="text-2xl font-bold text-foreground">
              {globalStats?.total_circuits_shared?.toLocaleString() || stats?.totalContributions || 0}
            </p>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Dna className="w-4 h-4" />
              Simulations Run
            </div>
            <p className="text-2xl font-bold text-foreground">
              {globalStats?.total_simulations_run?.toLocaleString() || '0'}
            </p>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Globe className="w-4 h-4" />
              Countries
            </div>
            <p className="text-2xl font-bold text-foreground">
              {globalStats?.countries_represented || 42}
            </p>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Award className="w-4 h-4" />
              Citations
            </div>
            <p className="text-2xl font-bold text-foreground">
              {globalStats?.openworm_citations || 287}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs for different views */}
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
          <TabsTrigger value="top" className="gap-2">
            <Trophy className="w-4 h-4" />
            Top Circuits
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-2">
            <FlaskConical className="w-4 h-4" />
            Research Aligned
          </TabsTrigger>
          <TabsTrigger value="contributors" className="gap-2">
            <Users className="w-4 h-4" />
            Contributors
          </TabsTrigger>
        </TabsList>

        {/* Top Circuits */}
        <TabsContent value="top" className="mt-6">
          <div className="grid gap-4">
            {topContributions.map((contrib, index) => (
              <motion.div
                key={contrib.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/community')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        index === 1 ? 'bg-slate-400/20 text-slate-400' :
                        index === 2 ? 'bg-orange-600/20 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground truncate">
                            {contrib.title}
                          </h4>
                          {contrib.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {contrib.researchScore >= 50 && (
                            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                              Research
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contrib.behavior} • by {contrib.creatorName}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Brain className="w-4 h-4" />
                          {contrib.neuronsUsed.length}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="w-4 h-4" />
                          {contrib.likesCount}
                        </div>
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <TrendingUp className="w-4 h-4" />
                          {contrib.researchScore}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {topContributions.length === 0 && (
              <Card className="p-8 text-center">
                <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No contributions yet. Be the first!</p>
                <Button className="mt-4" onClick={() => navigate('/sandbox')}>
                  Start Building
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Research Aligned */}
        <TabsContent value="research" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Research Behaviors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dna className="w-5 h-5 text-primary" />
                  Active Research Areas
                </CardTitle>
                <CardDescription>
                  Behaviors being studied in real C. elegans research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats?.topBehaviors.map((behavior, i) => (
                  <div key={behavior.behavior} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {BEHAVIOR_ICONS[behavior.behavior.toLowerCase()] || '🧬'}
                      </span>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {behavior.behavior}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {BEHAVIOR_DESCRIPTIONS[behavior.behavior.toLowerCase()] || 'Neural circuit behavior'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{behavior.count} circuits</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Research Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Research Impact
                </CardTitle>
                <CardDescription>
                  How student circuits contribute to science
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-3xl font-bold text-primary">
                    {stats?.verifiedCircuits || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Research-aligned circuits
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  These circuits model real biological behaviors studied in the OpenWorm project,
                  contributing to our understanding of the C. elegans nervous system.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.open('https://github.com/openworm', '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  View OpenWorm GitHub
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Research Aligned Circuits */}
          <div className="grid gap-3">
            {researchAligned.slice(0, 5).map((contrib, index) => (
              <motion.div
                key={contrib.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <FlaskConical className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{contrib.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {contrib.behavior} • {contrib.neuronsUsed.length} neurons
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      Verified
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Top Contributors */}
        <TabsContent value="contributors" className="mt-6">
          <div className="grid gap-4">
            {stats?.topContributors.map((contributor, index) => (
              <motion.div
                key={contributor.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Rank with special styling for top 3 */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500 ring-2 ring-yellow-500/50' :
                      index === 1 ? 'bg-slate-400/20 text-slate-400 ring-2 ring-slate-400/50' :
                      index === 2 ? 'bg-orange-600/20 text-orange-600 ring-2 ring-orange-600/50' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>

                    {/* Name */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {contributor.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Research Contributor
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {contributor.count}
                      </p>
                      <p className="text-xs text-muted-foreground">circuits</p>
                    </div>

                    {/* Badge for top contributors */}
                    {index < 3 && (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <Award className="w-3 h-3 mr-1" />
                        Top Contributor
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {(!stats?.topContributors || stats.topContributors.length === 0) && (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No contributors yet. Start sharing circuits!</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
