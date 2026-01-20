import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Zap, 
  Star, 
  Lightbulb, 
  Play,
  BookOpen,
  Trophy,
  Loader2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Mission } from "@/data/missionData";
import { supabase } from "@/integrations/supabase/client";

interface MissionBriefingProps {
  mission: Mission;
  onStartMission: () => void;
  isLoading?: boolean;
  className?: string;
}

export function MissionBriefing({
  mission,
  onStartMission,
  isLoading = false,
  className,
}: MissionBriefingProps) {
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoadingBriefing(true);
      try {
        const { data, error } = await supabase.functions.invoke("ai-challenge", {
          body: {
            type: "generate_challenge",
            ageGroup: "middle",
            topic: mission.title,
            difficulty: mission.difficulty,
            context: mission.description,
          },
        });

        if (!error && data?.result?.description) {
          setAiBriefing(data.result.description);
        }
      } catch (err) {
        console.error("Failed to fetch AI briefing:", err);
      } finally {
        setLoadingBriefing(false);
      }
    };

    fetchBriefing();
  }, [mission.id]);

  const difficultyStars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        "w-4 h-4",
        i < mission.difficulty ? "fill-primary text-primary" : "text-muted-foreground"
      )}
    />
  ));

  return (
    <div className={cn("bg-card border-2 border-foreground rounded-xl shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-6 border-b-2 border-foreground">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge variant="outline" className="mb-2">
              {mission.subtitle}
            </Badge>
            <h2 className="text-2xl font-bold">{mission.title}</h2>
          </div>
          <div className="flex items-center gap-1">{difficultyStars}</div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-primary" />
            <span>{mission.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-accent" />
            <span>{mission.badge.name}</span>
          </div>
        </div>
      </div>

      {/* Briefing Content */}
      <div className="p-6 space-y-6">
        {/* AI-Generated or Default Briefing */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold uppercase text-sm">Mission Briefing</h3>
            {!loadingBriefing && aiBriefing && (
              <Badge variant="secondary" className="text-xs ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 border-2 border-foreground/10">
            {loadingBriefing ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Generating briefing...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">
                {aiBriefing || mission.description}
              </p>
            )}
          </div>
        </div>

        {/* Objective */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-accent" />
            <h3 className="font-bold uppercase text-sm">Your Objective</h3>
          </div>
          <div className="bg-accent/10 rounded-lg p-4 border-2 border-accent/30">
            <p className="font-medium">{mission.goal}</p>
          </div>
        </div>

        {/* Required Neurons */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold uppercase text-sm">Recommended Neurons</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {mission.recommendedNeurons.map(neuron => (
              <Badge key={neuron} variant="outline" className="font-mono">
                {neuron}
              </Badge>
            ))}
          </div>
        </div>

        {/* Fun Fact */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border-2 border-foreground/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                Science Fun Fact
              </p>
              <p className="text-sm">{mission.funFact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="p-6 border-t-2 border-foreground bg-muted/30">
        <Button
          onClick={onStartMission}
          disabled={isLoading}
          className="w-full rounded-lg"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Mission
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
