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
  icon = <Sparkles className="size-4 text-primary-foreground" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-primary",
  titleClassName = "text-primary",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] select-none flex-col justify-between rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm px-5 py-4 transition-all duration-300 hover:border-primary/50 hover:translate-x-1 hover:-translate-y-1 [&>*]:flex [&>*]:items-center [&>*]:gap-3",
        "shadow-lg hover:shadow-xl hover:shadow-primary/10",
        className
      )}
    >
      <div>
        <span className={cn("relative inline-flex items-center justify-center rounded-lg bg-primary/10 p-2", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-lg font-bold", titleClassName)}>{title}</p>
      </div>
      <p className="text-base font-medium text-foreground/80">{description}</p>
      <p className="text-muted-foreground text-sm">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    {
      icon: <Brain className="size-5 text-primary" />,
      title: "302 Neurons",
      description: "Simulating C. elegans brain",
      date: "Neural Network Active",
      className: "[grid-area:stack] hover:-translate-y-10 transition-all duration-300",
    },
    {
      icon: <Zap className="size-5 text-accent" />,
      title: "AI Powered",
      description: "Real-time learning adaptation",
      date: "Adaptive Intelligence",
      iconClassName: "bg-accent/10",
      titleClassName: "text-accent",
      className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 transition-all duration-300",
    },
    {
      icon: <Sparkles className="size-5 text-chart-1" />,
      title: "OpenWorm",
      description: "Open-source neuroscience",
      date: "Community Driven",
      iconClassName: "bg-chart-1/10",
      titleClassName: "text-chart-1",
      className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 transition-all duration-300",
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
