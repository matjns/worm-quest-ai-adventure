import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Copy, 
  Check, 
  Zap, 
  Brain, 
  Activity,
  Clock,
  Code2,
  Terminal,
  RotateCcw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Neuron {
  id: string;
  name: string;
  type: "sensory" | "motor" | "interneuron";
}

interface APIEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST";
  path: string;
  description: string;
}

const AVAILABLE_NEURONS: Neuron[] = [
  { id: "ASEL", name: "ASEL (Left Amphid)", type: "sensory" },
  { id: "ASER", name: "ASER (Right Amphid)", type: "sensory" },
  { id: "AWC", name: "AWC (Olfactory)", type: "sensory" },
  { id: "ASH", name: "ASH (Nociceptor)", type: "sensory" },
  { id: "AIY", name: "AIY (Interneuron)", type: "interneuron" },
  { id: "AIZ", name: "AIZ (Interneuron)", type: "interneuron" },
  { id: "RIA", name: "RIA (Interneuron)", type: "interneuron" },
  { id: "AVA", name: "AVA (Command)", type: "interneuron" },
  { id: "AVB", name: "AVB (Command)", type: "interneuron" },
  { id: "DA01", name: "DA01 (Dorsal Motor)", type: "motor" },
  { id: "DB01", name: "DB01 (Dorsal Motor)", type: "motor" },
  { id: "VB01", name: "VB01 (Ventral Motor)", type: "motor" },
];

const API_ENDPOINTS: APIEndpoint[] = [
  { id: "simulate", name: "Run Simulation", method: "POST", path: "/simulate", description: "Execute a neural circuit simulation" },
  { id: "connectome", name: "Get Connectome", method: "GET", path: "/connectome", description: "Retrieve full connectome data" },
  { id: "neuron", name: "Neuron Details", method: "GET", path: "/neuron/{id}", description: "Get detailed neuron information" },
  { id: "behavior", name: "Predict Behavior", method: "POST", path: "/behavior/predict", description: "Predict worm behavior from circuit" },
  { id: "optimize", name: "Optimize Circuit", method: "POST", path: "/circuit/optimize", description: "AI-powered circuit optimization" },
];

export function APIPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("simulate");
  const [selectedNeurons, setSelectedNeurons] = useState<string[]>(["ASEL", "AIY"]);
  const [stimulusType, setStimulusType] = useState<string>("chemical");
  const [stimulusValue, setStimulusValue] = useState<number>(0.7);
  const [duration, setDuration] = useState<number>(1000);
  const [includePhysics, setIncludePhysics] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<object | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const endpoint = API_ENDPOINTS.find(e => e.id === selectedEndpoint);

  const toggleNeuron = (neuronId: string) => {
    if (selectedNeurons.includes(neuronId)) {
      setSelectedNeurons(selectedNeurons.filter(n => n !== neuronId));
    } else if (selectedNeurons.length < 6) {
      setSelectedNeurons([...selectedNeurons, neuronId]);
    } else {
      toast.error("Maximum 6 neurons for playground demo");
    }
  };

  const generateRequestBody = () => {
    if (selectedEndpoint === "simulate") {
      return {
        neurons: selectedNeurons,
        stimulus: {
          type: stimulusType,
          value: stimulusValue
        },
        duration_ms: duration,
        include_physics: includePhysics,
        output_format: "detailed"
      };
    } else if (selectedEndpoint === "behavior") {
      return {
        circuit: selectedNeurons,
        environment: {
          attractant_gradient: stimulusValue,
          temperature: 20
        }
      };
    } else if (selectedEndpoint === "optimize") {
      return {
        target_behavior: "chemotaxis",
        base_circuit: selectedNeurons,
        constraints: {
          max_neurons: 10,
          preserve_core: true
        }
      };
    }
    return {};
  };

  const generateCodeSnippet = () => {
    const body = generateRequestBody();
    const isPost = endpoint?.method === "POST";
    
    return `fetch('https://api.openworm.org${endpoint?.path}', {
  method: '${endpoint?.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${isPost ? `,
  body: JSON.stringify(${JSON.stringify(body, null, 4).split('\n').join('\n  ')})` : ''}
})
.then(res => res.json())
.then(data => console.log(data));`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generateCodeSnippet());
    setCopiedCode(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const runSimulation = async () => {
    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    // Simulate API call with mock response
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const mockResponse = generateMockResponse();
    setResponse(mockResponse);
    setResponseTime(Date.now() - startTime);
    setIsLoading(false);
    toast.success("Simulation complete!");
  };

  const generateMockResponse = () => {
    if (selectedEndpoint === "simulate") {
      return {
        success: true,
        simulation_id: `sim_${Math.random().toString(36).substr(2, 9)}`,
        neurons_activated: selectedNeurons.length,
        timesteps: Math.floor(duration / 10),
        results: {
          neural_activity: selectedNeurons.map(n => ({
            neuron_id: n,
            peak_activation: (0.5 + Math.random() * 0.5).toFixed(3),
            firing_events: Math.floor(Math.random() * 20 + 5),
            avg_membrane_potential: (-70 + Math.random() * 40).toFixed(1) + "mV"
          })),
          behavior_prediction: stimulusValue > 0.5 ? "approach" : "avoid",
          confidence: (0.7 + Math.random() * 0.25).toFixed(2),
          physics: includePhysics ? {
            body_curvature: (Math.random() * 0.3).toFixed(3),
            velocity: (Math.random() * 0.5).toFixed(3) + " mm/s",
            energy_expenditure: (Math.random() * 100).toFixed(1) + " aJ"
          } : null
        },
        compute_time_ms: Math.floor(Math.random() * 50 + 20)
      };
    } else if (selectedEndpoint === "behavior") {
      return {
        success: true,
        prediction: {
          behavior: "chemotaxis_positive",
          trajectory: "spiral_approach",
          estimated_time_to_target: (Math.random() * 30 + 10).toFixed(1) + "s",
          turning_frequency: (Math.random() * 2).toFixed(2) + " Hz"
        },
        confidence: 0.87,
        model_version: "v2.4.1"
      };
    } else if (selectedEndpoint === "optimize") {
      return {
        success: true,
        optimized_circuit: [...selectedNeurons, "RIB", "AVE"],
        improvements: {
          efficiency: "+23%",
          response_time: "-15ms",
          robustness: "+18%"
        },
        suggestions: [
          "Add RIB for better gradient sensing",
          "Consider AVE for faster reversals"
        ]
      };
    } else if (selectedEndpoint === "connectome") {
      return {
        success: true,
        total_neurons: 302,
        total_synapses: 7000,
        neuron_types: { sensory: 82, motor: 113, interneuron: 107 },
        version: "WormAtlas 2024.1"
      };
    } else if (selectedEndpoint === "neuron") {
      return {
        success: true,
        neuron: {
          id: selectedNeurons[0] || "ASEL",
          type: "sensory",
          connections: { incoming: 12, outgoing: 8, gap_junctions: 3 },
          function: "Chemosensory - salt detection",
          position: { x: 0.12, y: 0.03, z: 0.01 }
        }
      };
    }
    return { success: true };
  };

  const resetPlayground = () => {
    setSelectedNeurons(["ASEL", "AIY"]);
    setStimulusType("chemical");
    setStimulusValue(0.7);
    setDuration(1000);
    setIncludePhysics(true);
    setResponse(null);
    setResponseTime(null);
  };

  return (
    <Card className="border-3 border-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              API Playground
            </CardTitle>
            <CardDescription>
              Test live API calls against the OpenWorm simulation engine
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={resetPlayground}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Endpoint Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-bold">API Endpoint</Label>
          <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
            <SelectTrigger className="border-2 border-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {API_ENDPOINTS.map(ep => (
                <SelectItem key={ep.id} value={ep.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant={ep.method === "POST" ? "default" : "secondary"} className="text-xs font-mono">
                      {ep.method}
                    </Badge>
                    <span>{ep.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{endpoint?.description}</p>
        </div>

        <Tabs defaultValue="params" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="params">Parameters</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="params" className="space-y-4">
            {/* Neuron Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Select Neurons ({selectedNeurons.length}/6)
              </Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_NEURONS.map(neuron => (
                  <Button
                    key={neuron.id}
                    variant={selectedNeurons.includes(neuron.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleNeuron(neuron.id)}
                    className="text-xs"
                  >
                    <span className={`w-2 h-2 rounded-full mr-1 ${
                      neuron.type === "sensory" ? "bg-green-500" :
                      neuron.type === "motor" ? "bg-red-500" : "bg-blue-500"
                    }`} />
                    {neuron.id}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Sensory</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Interneuron</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Motor</span>
              </div>
            </div>

            {/* Stimulus Configuration */}
            {(selectedEndpoint === "simulate" || selectedEndpoint === "behavior") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Stimulus Type</Label>
                  <Select value={stimulusType} onValueChange={setStimulusType}>
                    <SelectTrigger className="border-2 border-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chemical">Chemical (NaCl)</SelectItem>
                      <SelectItem value="mechanical">Mechanical Touch</SelectItem>
                      <SelectItem value="thermal">Temperature</SelectItem>
                      <SelectItem value="light">Light/UV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Stimulus Intensity: {stimulusValue.toFixed(1)}</Label>
                  <Slider
                    value={[stimulusValue]}
                    onValueChange={([v]) => setStimulusValue(v)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Duration & Physics */}
            {selectedEndpoint === "simulate" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Duration: {duration}ms</Label>
                  <Slider
                    value={[duration]}
                    onValueChange={([v]) => setDuration(v)}
                    min={100}
                    max={5000}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border-2 border-foreground/20 rounded-lg">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Include Physics
                  </Label>
                  <Switch checked={includePhysics} onCheckedChange={setIncludePhysics} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="relative">
              <ScrollArea className="h-64 rounded-lg bg-foreground/5 p-4 font-mono text-sm">
                <pre className="text-foreground/80 whitespace-pre-wrap">{generateCodeSnippet()}</pre>
              </ScrollArea>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={copyCode}
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Run Button */}
        <Button 
          className="w-full font-bold gap-2" 
          size="lg"
          onClick={runSimulation}
          disabled={isLoading || selectedNeurons.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Simulation...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run API Call
            </>
          )}
        </Button>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                Response
              </Label>
              {responseTime && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {responseTime}ms
                </Badge>
              )}
            </div>
            <ScrollArea className="h-64 rounded-lg bg-foreground/5 p-4 font-mono text-sm">
              <pre className="text-foreground/80 whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-foreground/10">
          <div className="text-center">
            <Zap className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-xs font-bold">Avg Latency</p>
            <p className="text-sm text-muted-foreground">~45ms</p>
          </div>
          <div className="text-center">
            <Activity className="w-4 h-4 mx-auto text-green-500 mb-1" />
            <p className="text-xs font-bold">Uptime</p>
            <p className="text-sm text-muted-foreground">99.9%</p>
          </div>
          <div className="text-center">
            <Brain className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-xs font-bold">Max Neurons</p>
            <p className="text-sm text-muted-foreground">302</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
