import { motion } from "framer-motion";
import { Globe, Users, Brain, Beaker, Award, Flag } from "lucide-react";
import { useGlobalStats } from "@/hooks/useGlobalStats";
import { cn } from "@/lib/utils";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  delay: number;
}

function StatItem({ icon, value, label, color, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-1"
    >
      <div className={cn("p-2 rounded-full", color)}>
        {icon}
      </div>
      <motion.span
        className="text-xl font-bold tabular-nums"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {value.toLocaleString()}
      </motion.span>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </motion.div>
  );
}

interface GlobalImpactCounterProps {
  className?: string;
  compact?: boolean;
}

export function GlobalImpactCounter({ className, compact = false }: GlobalImpactCounterProps) {
  const { stats, loading } = useGlobalStats();

  if (loading || !stats) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg h-20", className)} />
    );
  }

  const statItems = [
    {
      icon: <Brain className="w-4 h-4" />,
      value: stats.total_circuits_shared,
      label: "Circuits Shared",
      color: "bg-primary/20 text-primary",
    },
    {
      icon: <Beaker className="w-4 h-4" />,
      value: stats.total_simulations_run,
      label: "Simulations Run",
      color: "bg-chart-2/20 text-chart-2",
    },
    {
      icon: <Users className="w-4 h-4" />,
      value: stats.total_active_researchers,
      label: "Active Researchers",
      color: "bg-chart-3/20 text-chart-3",
    },
    {
      icon: <Globe className="w-4 h-4" />,
      value: stats.countries_represented,
      label: "Countries",
      color: "bg-chart-4/20 text-chart-4",
    },
    {
      icon: <Award className="w-4 h-4" />,
      value: stats.openworm_citations,
      label: "Citations",
      color: "bg-chart-5/20 text-chart-5",
    },
  ];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {statItems.slice(0, 3).map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-1.5">
            <div className={cn("p-1 rounded", stat.color)}>
              {stat.icon}
            </div>
            <span className="text-sm font-medium tabular-nums">
              {stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "bg-card border-2 border-foreground rounded-lg p-4",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Flag className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-sm uppercase tracking-wide">
          OpenWorm Global Impact
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          USA-Led Open Science
        </span>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {statItems.map((stat, i) => (
          <StatItem
            key={stat.label}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            color={stat.color}
            delay={i * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
}
