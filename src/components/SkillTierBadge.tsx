import { cn } from "@/lib/utils";
import { type SkillTier, TIER_CONFIG } from "@/hooks/useMatchmaking";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SkillTierBadgeProps {
  tier: SkillTier;
  elo?: number;
  size?: "sm" | "md" | "lg";
  showElo?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function SkillTierBadge({ 
  tier, 
  elo, 
  size = "md",
  showElo = false,
  showTooltip = true,
  className 
}: SkillTierBadgeProps) {
  const config = TIER_CONFIG[tier];
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1 font-medium border-2 transition-all",
        sizeClasses[size],
        config.color,
        tier === "grandmaster" && "border-red-500/50 bg-red-500/10 animate-pulse",
        tier === "master" && "border-purple-500/50 bg-purple-500/10",
        tier === "diamond" && "border-blue-400/50 bg-blue-400/10",
        tier === "platinum" && "border-cyan-400/50 bg-cyan-400/10",
        tier === "gold" && "border-yellow-500/50 bg-yellow-500/10",
        tier === "silver" && "border-slate-400/50 bg-slate-400/10",
        tier === "bronze" && "border-amber-700/50 bg-amber-700/10",
        className
      )}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      <span>{config.name}</span>
      {showElo && elo !== undefined && (
        <span className="opacity-70">({elo})</span>
      )}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{config.name} Tier</p>
            <p className="text-xs text-muted-foreground">
              ELO Range: {config.minElo} - {config.maxElo === 9999 ? "∞" : config.maxElo}
            </p>
            {elo !== undefined && (
              <p className="text-xs mt-1">Current: {elo} ELO</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
