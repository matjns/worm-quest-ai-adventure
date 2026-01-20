import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLearningStore } from "@/stores/learningStore";
import { getEngagementSummary } from "@/utils/analytics";
import {
  Users,
  Lightbulb,
  TrendingUp,
  Share2,
  Trophy,
  Zap,
  Activity,
  Target,
  BarChart3,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { shareToTwitter, shareToLinkedIn, getCircuitShareUrl } from "@/utils/socialShare";
import { cn } from "@/lib/utils";

interface ExODashboardProps {
  className?: string;
}

// ExO attributes based on Exponential Organizations framework
const EXO_ATTRIBUTES = {
  SCALE: {
    name: "SCALE",
    description: "Staff on Demand, Community, Algorithms, Leveraged Assets, Engagement",
    metrics: ["crowdMods", "communitySize", "algorithmUsage", "sharedAssets"],
  },
  IDEAS: {
    name: "IDEAS",
    description: "Interfaces, Dashboards, Experimentation, Autonomy, Social",
    metrics: ["apiCalls", "dashboardViews", "experiments", "autonomousRuns", "socialShares"],
  },
};

export function ExODashboard({ className }: ExODashboardProps) {
  const { user } = useAuth();
  const { attemptHistory, profile } = useLearningStore();
  const [metrics, setMetrics] = useState({
    // SCALE metrics
    crowdMods: 0,
    communitySize: 0,
    algorithmUsage: 0,
    sharedAssets: 0,
    // IDEAS metrics
    apiCalls: 0,
    dashboardViews: 0,
    experiments: 0,
    autonomousRuns: 0,
    socialShares: 0,
    // Iteration tracking
    totalIterations: 0,
    improvementRate: 0,
  });
  const [recentShares, setRecentShares] = useState<{ id: string; title: string; likes: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch community data
        const { data: circuits } = await supabase
          .from("shared_circuits")
          .select("id, title, likes_count")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const { count: communitySize } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: totalCircuits } = await supabase
          .from("shared_circuits")
          .select("*", { count: "exact", head: true });

        // Get engagement summary from analytics
        const engagement = getEngagementSummary();

        // Calculate iteration metrics from attempt history
        const iterations = attemptHistory.length;
        const successfulAttempts = attemptHistory.filter((a) => a.success).length;
        const improvementRate = iterations > 0 ? (successfulAttempts / iterations) * 100 : 0;

        setMetrics({
          crowdMods: circuits?.length || 0,
          communitySize: communitySize || 0,
          algorithmUsage: engagement.totalEvents,
          sharedAssets: totalCircuits || 0,
          apiCalls: engagement.totalEvents,
          dashboardViews: engagement.uniqueActions,
          experiments: attemptHistory.filter((a) => a.neuronsPlaced > 3).length,
          autonomousRuns: attemptHistory.filter((a) => a.hintsUsed === 0).length,
          socialShares: 0, // Would track via analytics
          totalIterations: iterations,
          improvementRate,
        });

        setRecentShares(
          circuits?.map((c) => ({
            id: c.id,
            title: c.title,
            likes: c.likes_count,
          })) || []
        );
      } catch (error) {
        console.error("Error fetching ExO metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [user?.id, attemptHistory]);

  const scaleScore = Math.min(100, (metrics.crowdMods * 10 + metrics.communitySize * 0.1 + metrics.sharedAssets * 0.5));
  const ideasScore = Math.min(100, (metrics.experiments * 5 + metrics.autonomousRuns * 10 + metrics.dashboardViews));

  const handleShareRace = (title: string) => {
    const url = window.location.origin + "/race";
    shareToTwitter({
      title: `I just completed a Worm Race: ${title}`,
      description: "Challenge me in the neural circuit racing game!",
      url,
      tags: ["NeuroQuest", "OpenWorm", "WormRace"],
    });
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            ExO Dashboard
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Exponential Impact
          </Badge>
        </div>
        <CardDescription>
          Track your SCALE and IDEAS attributes for exponential growth
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="scale">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scale">SCALE</TabsTrigger>
            <TabsTrigger value="ideas">IDEAS</TabsTrigger>
            <TabsTrigger value="iterations">Iterations</TabsTrigger>
          </TabsList>

          <TabsContent value="scale" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SCALE Score</span>
              <span className="text-2xl font-bold text-primary">{scaleScore.toFixed(0)}</span>
            </div>
            <Progress value={scaleScore} className="h-2 mb-4" />

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<Users className="w-4 h-4" />}
                label="Community Size"
                value={metrics.communitySize}
                description="Active researchers"
              />
              <MetricCard
                icon={<Share2 className="w-4 h-4" />}
                label="Crowd Mods"
                value={metrics.crowdMods}
                description="Your shared circuits"
              />
              <MetricCard
                icon={<Zap className="w-4 h-4" />}
                label="Algorithm Usage"
                value={metrics.algorithmUsage}
                description="AI interactions"
              />
              <MetricCard
                icon={<Trophy className="w-4 h-4" />}
                label="Shared Assets"
                value={metrics.sharedAssets}
                description="Total community circuits"
              />
            </div>
          </TabsContent>

          <TabsContent value="ideas" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">IDEAS Score</span>
              <span className="text-2xl font-bold text-accent">{ideasScore.toFixed(0)}</span>
            </div>
            <Progress value={ideasScore} className="h-2 mb-4" />

            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={<Lightbulb className="w-4 h-4" />}
                label="Experiments"
                value={metrics.experiments}
                description="Complex circuits built"
              />
              <MetricCard
                icon={<Target className="w-4 h-4" />}
                label="Autonomy"
                value={metrics.autonomousRuns}
                description="No-hint completions"
              />
              <MetricCard
                icon={<BarChart3 className="w-4 h-4" />}
                label="Dashboard Views"
                value={metrics.dashboardViews}
                description="Unique actions"
              />
              <MetricCard
                icon={<ExternalLink className="w-4 h-4" />}
                label="Social Shares"
                value={metrics.socialShares}
                description="Viral reach"
              />
            </div>

            {/* Social sharing for races */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Share Your Achievements</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareRace("Neural Champion")}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Race Win
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    shareToLinkedIn({
                      title: "NeuroQuest Achievement",
                      url: window.location.origin,
                    });
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="iterations" className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Iterations</span>
                <span className="text-2xl font-bold">{metrics.totalIterations}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Each iteration provides process evidence for rubric scoring
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Improvement Rate</span>
                <Badge variant={metrics.improvementRate > 70 ? "default" : "secondary"}>
                  {metrics.improvementRate.toFixed(0)}%
                </Badge>
              </div>
              <Progress value={metrics.improvementRate} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Hints/Mission</span>
                <span className="text-sm font-medium">
                  {attemptHistory.length > 0
                    ? (attemptHistory.reduce((a, b) => a + b.hintsUsed, 0) / attemptHistory.length).toFixed(1)
                    : "0"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Skill Growth</span>
                <span className="text-sm font-medium">
                  {Object.values(profile.skills).reduce((a, b) => a + b, 0) / 5 > 50 ? "+" : ""}
                  {((Object.values(profile.skills).reduce((a, b) => a + b, 0) / 5) - 50).toFixed(0)} pts
                </span>
              </div>
            </div>

            {/* AI-suggested improvements */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                AI Bifurcation Suggestions
              </p>
              <div className="space-y-2">
                {profile.averageSuccessRate < 0.7 && (
                  <div className="bg-primary/5 rounded p-2 text-xs">
                    💡 Try focusing on single pathways before combining circuits
                  </div>
                )}
                {profile.learningStyle.usesHints > 0.6 && (
                  <div className="bg-accent/5 rounded p-2 text-xs">
                    💡 Challenge yourself with no-hint runs to boost autonomy score
                  </div>
                )}
                {metrics.experiments < 5 && (
                  <div className="bg-muted rounded p-2 text-xs">
                    💡 Build more complex circuits (4+ neurons) to increase experiment count
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
