import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  NEURONS, 
  SYNAPSES, 
  CONNECTOME_STATS,
  getNeuronsByType,
  getPresynapticPartners,
  getPostsynapticPartners,
  Neuron 
} from "@/data/openworm/connectome";
import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Brain, 
  Zap, 
  Activity, 
  Eye,
  ChevronRight,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ConnectomeExplorerProps {
  className?: string;
  onNeuronSelect?: (neuron: Neuron) => void;
}

const NEURON_TYPE_COLORS = {
  sensory: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  motor: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  interneuron: "bg-purple-500/20 text-purple-400 border-purple-500/50",
};

const NEURON_TYPE_ICONS = {
  sensory: Eye,
  motor: Zap,
  interneuron: Brain,
};

export function ConnectomeExplorer({ className, onNeuronSelect }: ConnectomeExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<Neuron["type"] | "all">("all");
  const [selectedNeuron, setSelectedNeuron] = useState<Neuron | null>(null);

  const filteredNeurons = useMemo(() => {
    let neurons = NEURONS;
    
    if (selectedType !== "all") {
      neurons = getNeuronsByType(selectedType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      neurons = neurons.filter(n => 
        n.id.toLowerCase().includes(query) ||
        n.name.toLowerCase().includes(query) ||
        n.description.toLowerCase().includes(query) ||
        n.class.toLowerCase().includes(query)
      );
    }
    
    return neurons.slice(0, 50); // Limit for performance
  }, [searchQuery, selectedType]);

  const connectionData = useMemo(() => {
    if (!selectedNeuron) return null;
    
    const presynaptic = getPresynapticPartners(selectedNeuron.id);
    const postsynaptic = getPostsynapticPartners(selectedNeuron.id);
    
    return { presynaptic, postsynaptic };
  }, [selectedNeuron]);

  const handleNeuronClick = (neuron: Neuron) => {
    setSelectedNeuron(neuron);
    onNeuronSelect?.(neuron);
  };

  return (
    <div className={cn("grid lg:grid-cols-2 gap-4", className)}>
      {/* Neuron Browser */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Connectome Explorer
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Browse all {CONNECTOME_STATS.totalNeurons} neurons from the C. elegans connectome
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search neurons..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              <Filter className="w-3 h-3 mr-1" />
              All ({NEURONS.length})
            </Button>
            <Button
              variant={selectedType === "sensory" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("sensory")}
              className={selectedType === "sensory" ? "" : "text-cyan-400"}
            >
              <Eye className="w-3 h-3 mr-1" />
              Sensory
            </Button>
            <Button
              variant={selectedType === "interneuron" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("interneuron")}
              className={selectedType === "interneuron" ? "" : "text-purple-400"}
            >
              <Brain className="w-3 h-3 mr-1" />
              Interneuron
            </Button>
            <Button
              variant={selectedType === "motor" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("motor")}
              className={selectedType === "motor" ? "" : "text-amber-400"}
            >
              <Zap className="w-3 h-3 mr-1" />
              Motor
            </Button>
          </div>
          
          {/* Neuron List */}
          <div className="h-[300px] overflow-y-auto space-y-2 pr-2">
            {filteredNeurons.map((neuron) => {
              const Icon = NEURON_TYPE_ICONS[neuron.type];
              const isSelected = selectedNeuron?.id === neuron.id;
              
              return (
                <button
                  key={neuron.id}
                  onClick={() => handleNeuronClick(neuron)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    isSelected 
                      ? "bg-primary/20 border-primary" 
                      : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn(
                        "w-4 h-4",
                        neuron.type === "sensory" && "text-cyan-400",
                        neuron.type === "motor" && "text-amber-400",
                        neuron.type === "interneuron" && "text-purple-400"
                      )} />
                      <span className="font-mono font-bold">{neuron.id}</span>
                      <Badge variant="outline" className={cn("text-xs", NEURON_TYPE_COLORS[neuron.type])}>
                        {neuron.class}
                      </Badge>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      isSelected && "rotate-90"
                    )} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {neuron.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Neuron Details */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Neuron Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedNeuron ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  selectedNeuron.type === "sensory" && "bg-cyan-500/20",
                  selectedNeuron.type === "motor" && "bg-amber-500/20",
                  selectedNeuron.type === "interneuron" && "bg-purple-500/20"
                )}>
                  {(() => {
                    const Icon = NEURON_TYPE_ICONS[selectedNeuron.type];
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono">{selectedNeuron.id}</h3>
                  <Badge className={NEURON_TYPE_COLORS[selectedNeuron.type]}>
                    {selectedNeuron.type}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground">
                {selectedNeuron.description}
              </p>

              {/* Properties */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded bg-secondary/30">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="ml-2 font-mono">{selectedNeuron.class}</span>
                </div>
                {selectedNeuron.neurotransmitter && (
                  <div className="p-2 rounded bg-secondary/30">
                    <span className="text-muted-foreground">NT:</span>
                    <span className="ml-2">{selectedNeuron.neurotransmitter}</span>
                  </div>
                )}
              </div>

              {/* Connections */}
              {connectionData && (
                <div className="space-y-3 pt-3 border-t border-border/50">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Connections
                  </h4>
                  
                  {/* Inputs */}
                  <div>
                    <span className="text-xs text-muted-foreground">Receives from ({connectionData.presynaptic.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {connectionData.presynaptic.slice(0, 8).map(({ neuron, synapse }) => (
                        <Badge 
                          key={`pre-${neuron.id}`}
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-secondary"
                          onClick={() => handleNeuronClick(neuron)}
                        >
                          {neuron.id} ({synapse.weight})
                        </Badge>
                      ))}
                      {connectionData.presynaptic.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{connectionData.presynaptic.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Outputs */}
                  <div>
                    <span className="text-xs text-muted-foreground">Sends to ({connectionData.postsynaptic.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {connectionData.postsynaptic.slice(0, 8).map(({ neuron, synapse }) => (
                        <Badge 
                          key={`post-${neuron.id}`}
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-secondary"
                          onClick={() => handleNeuronClick(neuron)}
                        >
                          {neuron.id} ({synapse.weight})
                        </Badge>
                      ))}
                      {connectionData.postsynaptic.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{connectionData.postsynaptic.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a neuron to view details</p>
                <p className="text-xs mt-1">Click any neuron from the list</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
