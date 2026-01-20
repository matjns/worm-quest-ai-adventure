import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Library,
  Zap,
  Brain,
  FlaskConical,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Play,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  circuitTemplates,
  templateCategories,
  difficultyLevels,
  CircuitTemplate,
} from "@/data/circuitTemplates";
import { CircuitSimulationPreview } from "@/components/CircuitSimulationPreview";

interface CircuitTemplateLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (template: CircuitTemplate) => void;
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const categoryIcons = {
  sensory: Brain,
  motor: Zap,
  reflex: FlaskConical,
  integration: Sparkles,
};

function TemplateCard({
  template,
  onSelect,
}: {
  template: CircuitTemplate;
  onSelect: () => void;
}) {
  const CategoryIcon = categoryIcons[template.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-foreground p-4 shadow-[3px_3px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--primary))] hover:border-primary transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <CategoryIcon className="w-4 h-4 text-primary" />
          <h4 className="font-bold text-sm uppercase">{template.name}</h4>
        </div>
        <Badge className={`text-xs ${difficultyColors[template.difficulty]}`}>
          {template.difficulty}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Mini visualization */}
      <svg
        className="w-full h-20 rounded border border-border mb-3"
        viewBox="0 0 200 80"
        style={{ background: "hsl(var(--muted) / 0.3)" }}
      >
        {template.connections.map((conn, i) => {
          const from = template.neurons.find((n) => n.id === conn.from);
          const to = template.neurons.find((n) => n.id === conn.to);
          if (!from || !to) return null;

          return (
            <line
              key={i}
              x1={(from.x / 100) * 180 + 10}
              y1={(from.y / 100) * 60 + 10}
              x2={(to.x / 100) * 180 + 10}
              y2={(to.y / 100) * 60 + 10}
              stroke={conn.type === "excitatory" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          );
        })}
        {template.neurons.map((n) => (
          <circle
            key={n.id}
            cx={(n.x / 100) * 180 + 10}
            cy={(n.y / 100) * 60 + 10}
            r="4"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--foreground))"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs gap-1">
            <Zap className="w-3 h-3" />
            {template.neurons.length}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {template.behavior}
          </Badge>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}

function TemplateDetail({
  template,
  onUse,
  onBack,
}: {
  template: CircuitTemplate;
  onUse: () => void;
  onBack: () => void;
}) {
  const CategoryIcon = categoryIcons[template.category];
  const [showSimulation, setShowSimulation] = useState(false);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        ← Back to templates
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CategoryIcon className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold uppercase">{template.name}</h3>
          </div>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
        <Badge className={difficultyColors[template.difficulty]}>
          {template.difficulty}
        </Badge>
      </div>

      {/* Toggle between static view and simulation */}
      <div className="flex gap-2">
        <Button
          variant={showSimulation ? "outline" : "default"}
          size="sm"
          onClick={() => setShowSimulation(false)}
        >
          Static View
        </Button>
        <Button
          variant={showSimulation ? "default" : "outline"}
          size="sm"
          onClick={() => setShowSimulation(true)}
          className="gap-1"
        >
          <Play className="w-4 h-4" />
          Simulation Preview
        </Button>
      </div>

      {/* Circuit Visualization */}
      {showSimulation ? (
        <CircuitSimulationPreview
          circuit={{
            neurons: template.neurons,
            connections: template.connections,
          }}
          height={220}
          autoPlay={true}
        />
      ) : (
      <svg
        className="w-full h-48 rounded-lg border-2 border-foreground"
        viewBox="0 0 400 200"
        style={{ background: "hsl(var(--background))" }}
      >
        <defs>
          <pattern id="template-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.3"
              strokeOpacity="0.3"
            />
          </pattern>
          <marker
            id="arrow-exc"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--primary))" />
          </marker>
          <marker
            id="arrow-inh"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--destructive))" />
          </marker>
        </defs>
        <rect width="400" height="200" fill="url(#template-grid)" />

        {/* Connections */}
        {template.connections.map((conn, i) => {
          const from = template.neurons.find((n) => n.id === conn.from);
          const to = template.neurons.find((n) => n.id === conn.to);
          if (!from || !to) return null;

          const x1 = (from.x / 100) * 360 + 20;
          const y1 = (from.y / 100) * 160 + 20;
          const x2 = (to.x / 100) * 360 + 20;
          const y2 = (to.y / 100) * 160 + 20;

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={conn.type === "excitatory" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeWidth="2"
              strokeOpacity="0.7"
              markerEnd={conn.type === "excitatory" ? "url(#arrow-exc)" : "url(#arrow-inh)"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          );
        })}

        {/* Neurons */}
        {template.neurons.map((neuron, i) => {
          const cx = (neuron.x / 100) * 360 + 20;
          const cy = (neuron.y / 100) * 160 + 20;

          return (
            <motion.g key={neuron.id}>
              <motion.circle
                cx={cx}
                cy={cy}
                r="18"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--foreground))"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--primary-foreground))"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {neuron.id}
              </text>
              {neuron.type && (
                <text
                  x={cx}
                  y={cy + 28}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="8"
                  fontFamily="sans-serif"
                >
                  {neuron.type}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
      )}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-6 h-0.5 bg-primary" />
          <span>Excitatory</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-6 h-0.5 bg-destructive" />
          <span>Inhibitory</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 bg-muted/50 rounded border">
          <p className="text-2xl font-bold">{template.neurons.length}</p>
          <p className="text-xs text-muted-foreground">Neurons</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded border">
          <p className="text-2xl font-bold">{template.connections.length}</p>
          <p className="text-xs text-muted-foreground">Connections</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded border">
          <p className="text-2xl font-bold capitalize">{template.category}</p>
          <p className="text-xs text-muted-foreground">Category</p>
        </div>
      </div>

      {/* Scientific Note */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <GraduationCap className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-xs font-medium text-primary uppercase mb-1">Scientific Note</p>
            <p className="text-sm text-muted-foreground">{template.scientificNote}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {template.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            #{tag}
          </Badge>
        ))}
      </div>

      <Button onClick={onUse} className="w-full">
        <Library className="w-4 h-4 mr-2" />
        Use This Template
      </Button>
    </div>
  );
}

export function CircuitTemplateLibrary({
  open,
  onOpenChange,
  onUseTemplate,
}: CircuitTemplateLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<CircuitTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    return circuitTemplates.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === "all" || t.category === category;
      const matchesDifficulty = difficulty === "all" || t.difficulty === difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, category, difficulty]);

  const handleUseTemplate = (template: CircuitTemplate) => {
    onUseTemplate(template);
    onOpenChange(false);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="w-5 h-5" />
            Circuit Template Library
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] pr-4">
          {selectedTemplate ? (
            <TemplateDetail
              template={selectedTemplate}
              onUse={() => handleUseTemplate(selectedTemplate)}
              onBack={() => setSelectedTemplate(null)}
            />
          ) : (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Category</p>
                  <Tabs value={category} onValueChange={setCategory}>
                    <TabsList className="h-8">
                      {templateCategories.map((cat) => (
                        <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-2 py-1">
                          {cat.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-1">Difficulty</p>
                  <Tabs value={difficulty} onValueChange={setDifficulty}>
                    <TabsList className="h-8">
                      {difficultyLevels.map((level) => (
                        <TabsTrigger key={level.id} value={level.id} className="text-xs px-2 py-1">
                          {level.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Template Grid */}
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No templates match your filters</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => setSelectedTemplate(template)}
                    />
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Templates are based on real C. elegans neural circuits from OpenWorm research.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
