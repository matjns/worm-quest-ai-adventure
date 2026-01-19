import { cn } from "@/lib/utils";
import { Sparkles, Brain, Zap } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-primary" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-primary",
  titleClassName = "text-primary",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between border-2 border-foreground bg-card px-4 py-3 transition-all duration-500 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-primary hover:translate-x-1 hover:-translate-y-1 [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        "shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_hsl(var(--primary))]",
        className
      )}
    >
      <div>
        <span className={cn("relative inline-block rounded-none border-2 border-foreground bg-primary p-1", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-lg font-bold uppercase tracking-tight", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-lg font-medium">{description}</p>
      <p className="text-muted-foreground font-mono text-sm">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      icon: <Brain className="size-4 text-primary-foreground" />,
      title: "302 Neurons",
      description: "Simulating C. elegans brain",
      date: "Neural Network Active",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-full before:outline-1 before:rounded-none before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Zap className="size-4 text-primary-foreground" />,
      title: "AI Powered",
      description: "Real-time learning adaptation",
      date: "Grok Integration",
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-full before:outline-1 before:rounded-none before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Sparkles className="size-4 text-primary-foreground" />,
      title: "OpenWorm",
      description: "Open-source neuroscience",
      date: "Community Driven",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}