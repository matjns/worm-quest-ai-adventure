import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameModeCardProps {
  title: string;
  description: string;
  ageRange: string;
  icon: LucideIcon;
  href: string;
  color: "primary" | "accent" | "purple" | "gold";
  features: string[];
}

const colorClasses = {
  primary: "border-primary hover:shadow-[8px_8px_0px_hsl(var(--primary))]",
  accent: "border-accent hover:shadow-[8px_8px_0px_hsl(var(--accent))]",
  purple: "border-[hsl(280_65%_50%)] hover:shadow-[8px_8px_0px_hsl(280_65%_50%)]",
  gold: "border-[hsl(45_100%_50%)] hover:shadow-[8px_8px_0px_hsl(45_100%_50%)]",
};

const iconBgClasses = {
  primary: "bg-primary",
  accent: "bg-accent",
  purple: "bg-[hsl(280_65%_50%)]",
  gold: "bg-[hsl(45_100%_50%)]",
};

export function GameModeCard({
  title,
  description,
  ageRange,
  icon: Icon,
  href,
  color,
  features,
}: GameModeCardProps) {
  return (
    <div
      className={cn(
        "group bg-card border-2 border-foreground p-6 transition-all duration-300",
        "shadow-[4px_4px_0px_hsl(var(--foreground))] hover:translate-x-[-4px] hover:translate-y-[-4px]",
        colorClasses[color]
      )}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "w-14 h-14 flex items-center justify-center border-2 border-foreground",
            "shadow-[2px_2px_0px_hsl(var(--foreground))]",
            iconBgClasses[color]
          )}
        >
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight">{title}</h3>
          <span className="text-sm font-mono text-muted-foreground">{ageRange}</span>
        </div>
      </div>

      <p className="text-muted-foreground mb-4">{description}</p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 bg-foreground" />
            {feature}
          </li>
        ))}
      </ul>

      <Link to={href}>
        <Button variant="brutal" className="w-full group-hover:border-primary">
          Start Playing
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
}