import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Calculator, TrendingUp, Trophy, Brain, 
  GitBranch, BarChart3, Network, Lightbulb, ArrowRight,
  Building2, Target, Shuffle, Eye
} from "lucide-react";

interface CareerApplication {
  id: string;
  role: string;
  icon: typeof Users;
  color: string;
  bgColor: string;
  challenge: string;
  simulationApproach: string;
  neuralParallel: string;
  skills: string[];
  example: string;
}

const CAREER_APPLICATIONS: CareerApplication[] = [
  {
    id: "hr",
    role: "HR & People Ops",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    challenge: "Visualize hypothetical org structures before restructuring",
    simulationApproach: "Model reporting lines as neural pathways—each employee is a 'neuron' processing and transmitting information. Simulate how removing or adding nodes affects signal flow (communication) across the organization.",
    neuralParallel: "Like sensory neurons detecting input, HR detects organizational needs. Interneurons (managers) integrate signals. Motor neurons (executors) produce outcomes.",
    skills: ["Org Network Mapping", "Change Impact Modeling", "Team Dynamics Simulation"],
    example: "Before a reorg: simulate how removing a middle manager affects information flow to 12 downstream employees—will signals reach them efficiently?",
  },
  {
    id: "finance",
    role: "Financial Modeling",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    challenge: "Move beyond static spreadsheets to dynamic 'what-if' scenarios",
    simulationApproach: "Treat financial variables as interconnected neurons with weighted connections. Revenue, costs, and market conditions form a network where changing one variable propagates effects throughout—just like neural signal cascades.",
    neuralParallel: "Synaptic weights = correlation strengths between financial variables. Activation thresholds = break-even points. Signal propagation = ripple effects through P&L.",
    skills: ["Scenario Modeling", "Sensitivity Analysis", "Monte Carlo Thinking"],
    example: "If raw material costs increase 15% (stimulus), simulate the cascade: production costs → pricing → demand → revenue → cash flow. Each step has weighted connections.",
  },
  {
    id: "accounting",
    role: "Accounting & Audit",
    icon: Calculator,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    challenge: "Run what-if scenarios for compliance and risk assessment",
    simulationApproach: "Map accounting controls as a neural network where each control is a neuron that activates (flags) based on transaction patterns. Simulate how bypassing one control affects downstream detection capabilities.",
    neuralParallel: "Internal controls = inhibitory neurons that prevent errors. Audit trails = signal pathways. Materiality thresholds = activation thresholds.",
    skills: ["Control Flow Mapping", "Risk Propagation Analysis", "Anomaly Detection"],
    example: "Simulate: if segregation of duties control fails (neuron inhibited), which downstream fraud-detection neurons might miss signals?",
  },
  {
    id: "sports",
    role: "Sports & Talent",
    icon: Trophy,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    challenge: "Visualize team dynamics, player chemistry, and strategic matchups",
    simulationApproach: "Players are neurons; passing patterns are synaptic connections. Simulate how adding a playmaker (high-connectivity hub neuron) changes team signal flow. Model opponent defensive 'inhibition' of your offensive pathways.",
    neuralParallel: "Point guards = command interneurons coordinating motor outputs. Team chemistry = well-tuned synaptic weights. Defensive schemes = inhibitory networks blocking signal propagation.",
    skills: ["Team Network Analysis", "Matchup Simulation", "Chemistry Optimization"],
    example: "Trade simulation: if you add a high-assist point guard (hub neuron with 8 strong connections), model how it changes shot distribution across all players.",
  },
  {
    id: "recruiting",
    role: "Recruiting & Talent Acquisition",
    icon: Target,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    challenge: "Predict candidate fit and team integration before hiring",
    simulationApproach: "Model existing team as a neural network with established communication patterns. Simulate inserting a new node (candidate) with estimated connection weights based on skills/personality. Predict integration friction or synergy.",
    neuralParallel: "Cultural fit = compatible activation patterns. Skill gaps = missing synaptic connections. Onboarding = synaptic plasticity (learning new connections).",
    skills: ["Team Fit Simulation", "Integration Prediction", "Network Gap Analysis"],
    example: "Before hiring: simulate how a candidate's communication style (connection weights) meshes with existing team dynamics. Will they strengthen or disrupt signal flow?",
  },
  {
    id: "operations",
    role: "Operations & Supply Chain",
    icon: Network,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    challenge: "Optimize complex systems with many interdependencies",
    simulationApproach: "Supply chain nodes are neurons; logistics connections are synapses. Simulate bottleneck removal (strengthening weak synapses) or supplier diversification (adding redundant pathways). Model cascade failures.",
    neuralParallel: "Suppliers = sensory input neurons. Distribution centers = interneurons processing/routing. Retail endpoints = motor output neurons delivering to customers.",
    skills: ["Bottleneck Simulation", "Redundancy Planning", "Cascade Failure Modeling"],
    example: "Simulate: if a key supplier fails (neuron goes silent), how do signals reroute? Which pathways have backup capacity?",
  },
];

export function SimulationThinkingBridge() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="mb-4" variant="outline">
          <Brain className="h-3 w-3 mr-1" />
          Universal Mental Model
        </Badge>
        <h2 className="text-3xl font-bold mb-4">
          Simulation Thinking for Everyone
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          The neural simulation skills you learn here aren't just for neuroscience—they're 
          a universal framework for visualizing, analyzing, and optimizing any complex system. 
          From org charts to financial models, the same mental models apply.
        </p>
      </motion.div>

      {/* Core Concept */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Visualize</h3>
              <p className="text-sm text-muted-foreground">
                See complex systems as networks of nodes and connections
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Shuffle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Simulate</h3>
              <p className="text-sm text-muted-foreground">
                Run "what-if" scenarios by adjusting connection weights
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Optimize</h3>
              <p className="text-sm text-muted-foreground">
                Find the configuration that produces desired outcomes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The Neural Metaphor */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              The Neural Network Metaphor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-500 font-bold text-sm">N</span>
                </div>
                <div>
                  <div className="font-medium">Neurons = Entities</div>
                  <p className="text-sm text-muted-foreground">
                    People, departments, accounts, suppliers, players—anything that processes and transmits information
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-500 font-bold text-sm">S</span>
                </div>
                <div>
                  <div className="font-medium">Synapses = Relationships</div>
                  <p className="text-sm text-muted-foreground">
                    Reporting lines, financial correlations, supply routes, team chemistry—the connections between entities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-500 font-bold text-sm">W</span>
                </div>
                <div>
                  <div className="font-medium">Weights = Strength/Influence</div>
                  <p className="text-sm text-muted-foreground">
                    How strongly connected are two entities? High weight = strong influence, low weight = weak tie
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-500 font-bold text-sm">A</span>
                </div>
                <div>
                  <div className="font-medium">Activation = Response</div>
                  <p className="text-sm text-muted-foreground">
                    When does an entity "fire"? Thresholds determine when inputs trigger outputs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Why This Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Most professionals make decisions using mental simulations—imagining "what would happen if..." 
              But these mental models are often implicit, incomplete, and biased.
            </p>
            <p className="text-sm text-muted-foreground">
              By learning explicit simulation thinking through neural networks, you develop:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Systems awareness</strong>—seeing how parts connect and influence each other</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Scenario discipline</strong>—running structured what-if analyses instead of gut feels</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Optimization intuition</strong>—knowing which levers to pull for desired outcomes</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span><strong>Cascade prediction</strong>—anticipating second and third-order effects</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Career Applications */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center">Apply to Your Domain</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAREER_APPLICATIONS.map((app, index) => {
            const Icon = app.icon;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${app.bgColor}`}>
                        <Icon className={`h-5 w-5 ${app.color}`} />
                      </div>
                      <CardTitle className="text-base">{app.role}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Challenge</div>
                      <p className="text-sm">{app.challenge}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Simulation Approach</div>
                      <p className="text-xs text-muted-foreground">{app.simulationApproach}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${app.bgColor} border border-${app.color}/20`}>
                      <div className="text-xs font-medium mb-1">Example</div>
                      <p className="text-xs italic">{app.example}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {app.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">
            From Worm Brains to Boardrooms
          </h3>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            The 302-neuron C. elegans teaches us that even the simplest networks produce complex, 
            purposeful behavior. Apply these principles to your organization, and transform how you 
            visualize, analyze, and optimize complex systems.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button>
              <Brain className="h-4 w-4 mr-2" />
              Start Learning
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              See Case Studies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
