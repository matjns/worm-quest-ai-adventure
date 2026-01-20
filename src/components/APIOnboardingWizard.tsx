import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Play, 
  Copy, 
  Check,
  Zap,
  Brain,
  Code2,
  Sparkles,
  PartyPopper,
  Terminal,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

export function APIOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const runFirstSimulation = async () => {
    setIsRunning(true);
    setApiResponse(null);

    try {
      const { data, error } = await supabase.functions.invoke('openworm-simulate', {
        body: {
          neurons: ["ASEL", "AIY", "AVA"],
          stimulus: { type: "chemical", value: 0.8 },
          duration_ms: 500,
          include_physics: true,
          endpoint: "simulate"
        }
      });

      if (error) throw new Error(error.message);

      setApiResponse(data);
      if (!completed.includes(2)) {
        setCompleted([...completed, 2]);
      }
      toast.success("🎉 Your first simulation!", {
        description: "You just ran a real neural simulation!"
      });
    } catch (error) {
      toast.error("Simulation failed", {
        description: error instanceof Error ? error.message : "Try again"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const markStepComplete = (stepId: number) => {
    if (!completed.includes(stepId)) {
      setCompleted([...completed, stepId]);
    }
  };

  const progress = (completed.length / 4) * 100;

  const codeExample = `// Your first OpenWorm API call
const response = await fetch(
  'https://api.openworm.org/simulate',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      neurons: ['ASEL', 'AIY', 'AVA'],
      stimulus: {
        type: 'chemical',
        value: 0.8
      },
      duration_ms: 500,
      include_physics: true
    })
  }
);

const data = await response.json();
console.log(data);`;

  const steps: Step[] = [
    {
      id: 0,
      title: "Welcome to OpenWorm API",
      description: "Let's get you running your first neural simulation",
      content: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-2">302 Neurons Await</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You're about to simulate the complete nervous system of C. elegans - 
              the most thoroughly mapped brain in existence.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Zap, label: "Real Physics", desc: "SPH-based simulation" },
              { icon: Brain, label: "Full Connectome", desc: "7,000+ synapses" },
              { icon: Sparkles, label: "AI-Powered", desc: "Behavior prediction" }
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                <item.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-bold text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Understanding the Circuit",
      description: "Learn the neurons we'll simulate",
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            We'll create a simple sensory-to-motor circuit that detects salt and drives movement:
          </p>
          
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2 border-2 border-green-500">
                <span className="font-bold text-green-500">ASEL</span>
              </div>
              <div className="text-xs text-muted-foreground">Sensory<br/>Salt Detection</div>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 border-2 border-blue-500">
                <span className="font-bold text-blue-500">AIY</span>
              </div>
              <div className="text-xs text-muted-foreground">Interneuron<br/>Processing</div>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-2 border-2 border-red-500">
                <span className="font-bold text-red-500">AVA</span>
              </div>
              <div className="text-xs text-muted-foreground">Command<br/>Movement</div>
            </div>
          </div>

          <Card className="bg-muted/30 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Why these neurons?</div>
                  <p className="text-xs text-muted-foreground">
                    This pathway is the worm's "salt-seeking" circuit. When ASEL detects NaCl, 
                    it signals through AIY (a key decision-making interneuron) to AVA (which controls 
                    backward movement and turning).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 2,
      title: "Run Your First Simulation",
      description: "Execute a live API call",
      content: (
        <div className="space-y-6">
          <div className="relative">
            <ScrollArea className="h-48 rounded-lg bg-foreground/5 p-4 font-mono text-xs">
              <pre className="text-foreground/80 whitespace-pre-wrap">{codeExample}</pre>
            </ScrollArea>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyCode(codeExample)}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <Button 
            className="w-full font-bold gap-2" 
            size="lg"
            onClick={runFirstSimulation}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Live Simulation
              </>
            )}
          </Button>

          {apiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="border-2 border-green-500/50 bg-green-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-bold text-green-500">Success!</span>
                    <Badge variant="outline" className="ml-auto">
                      {apiResponse.compute_time_ms || 45}ms
                    </Badge>
                  </div>
                  <ScrollArea className="h-32 rounded bg-background/50 p-2 font-mono text-xs">
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <div className="text-xl font-black">
                    {apiResponse.results?.neural_activity?.reduce((sum: number, n: any) => sum + (n.firing_events || 0), 0) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Spikes</div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <div className="text-xl font-black capitalize">
                    {apiResponse.results?.behavior_prediction || "active"}
                  </div>
                  <div className="text-xs text-muted-foreground">Behavior</div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <div className="text-xl font-black">
                    {((apiResponse.results?.confidence || 0.85) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )
    },
    {
      id: 3,
      title: "You're Ready!",
      description: "Explore the full API",
      content: (
        <div className="space-y-6 text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <PartyPopper className="w-12 h-12 text-primary-foreground" />
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-black">Congratulations! 🎉</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You've just simulated real neural activity from the world's 
            most completely mapped nervous system.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
            <Card className="border-2 border-foreground/20 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Terminal className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-bold text-sm">API Playground</div>
                <p className="text-xs text-muted-foreground">Try more endpoints</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-foreground/20 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <Code2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-bold text-sm">Documentation</div>
                <p className="text-xs text-muted-foreground">Full API reference</p>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Full Documentation
            </Button>
          </div>
        </div>
      )
    }
  ];

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // Mark current step as seen
      if (currentStep < stepIndex && !completed.includes(currentStep)) {
        markStepComplete(currentStep);
      }
      setCurrentStep(stepIndex);
    }
  };

  return (
    <Card className="border-3 border-foreground overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="mb-2 gap-1">
              <Rocket className="w-3 h-3" />
              Getting Started
            </Badge>
            <CardTitle className="text-xl">API Onboarding</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((step, i) => (
            <button
              key={step.id}
              onClick={() => goToStep(i)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                i === currentStep
                  ? "bg-primary text-primary-foreground"
                  : completed.includes(i)
                  ? "bg-green-500/20 text-green-500"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {completed.includes(i) ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              {i + 1}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-foreground/10">
          <Button
            variant="ghost"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => goToStep(currentStep + 1)}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep(0);
                setCompleted([]);
                setApiResponse(null);
              }}
              className="gap-2"
            >
              Start Over
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
