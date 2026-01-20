import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APIPlayground } from "@/components/APIPlayground";
import { BatchSimulationUI } from "@/components/BatchSimulationUI";
import { APIOnboardingWizard } from "@/components/APIOnboardingWizard";
import { VisualCircuitDesigner } from "@/components/VisualCircuitDesigner";
import { 
  Github, 
  Code2, 
  Users, 
  Rocket, 
  Zap, 
  Globe, 
  Lock, 
  Server,
  MessageSquare,
  GitFork,
  Star,
  GitPullRequest,
  Package,
  Trophy,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Terminal,
  Brain,
  Cpu,
  Database,
  Shield,
  Clock,
  TrendingUp,
  Flag
} from "lucide-react";
import { toast } from "sonner";

interface APITier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits: {
    requests: string;
    neurons: string;
    support: string;
  };
  cta: string;
  popular?: boolean;
  enterprise?: boolean;
}

interface CommunityExtension {
  name: string;
  author: string;
  description: string;
  downloads: number;
  stars: number;
  category: string;
  verified: boolean;
}

const API_TIERS: APITier[] = [
  {
    name: "Open Source",
    price: "Free",
    period: "forever",
    description: "Full access to core simulation engine",
    features: [
      "Complete connectome data",
      "Basic physics simulation",
      "Community support",
      "GitHub access",
      "Educational use"
    ],
    limits: {
      requests: "1,000/day",
      neurons: "302 (full worm)",
      support: "Community"
    },
    cta: "Clone Repository"
  },
  {
    name: "Pro API",
    price: "$49",
    period: "/month",
    description: "For researchers and small teams",
    features: [
      "Everything in Free",
      "REST & GraphQL APIs",
      "Batch simulations",
      "Priority queue",
      "Webhook integrations",
      "30-day data retention"
    ],
    limits: {
      requests: "50,000/day",
      neurons: "Unlimited custom",
      support: "Email (24h)"
    },
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/month",
    description: "For organizations scaling simulation",
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "Custom model training",
      "SSO/SAML integration",
      "SLA guarantee (99.9%)",
      "Unlimited retention",
      "On-premise option"
    ],
    limits: {
      requests: "Unlimited",
      neurons: "Custom networks",
      support: "Dedicated CSM"
    },
    cta: "Contact Sales",
    enterprise: true
  },
  {
    name: "Government",
    price: "Custom",
    period: "contract",
    description: "FedRAMP-ready, air-gapped capable",
    features: [
      "Everything in Enterprise",
      "FedRAMP compliance",
      "Air-gapped deployment",
      "ITAR/EAR support",
      "Cleared personnel",
      "GSA Schedule pricing"
    ],
    limits: {
      requests: "Unlimited",
      neurons: "Classified networks",
      support: "24/7 Hotline"
    },
    cta: "Request RFP",
    enterprise: true
  }
];

const COMMUNITY_EXTENSIONS: CommunityExtension[] = [
  {
    name: "Chemotaxis Navigator",
    author: "dr_wormley",
    description: "Enhanced gradient-following with multi-source attractants",
    downloads: 2847,
    stars: 156,
    category: "Behavior",
    verified: true
  },
  {
    name: "Muscle Fatigue Model",
    author: "biophysics_lab",
    description: "Realistic muscle exhaustion and recovery dynamics",
    downloads: 1923,
    stars: 89,
    category: "Physics",
    verified: true
  },
  {
    name: "Social Aggregation",
    author: "swarm_intel",
    description: "Multi-worm interaction and collective behavior patterns",
    downloads: 3201,
    stars: 203,
    category: "Multi-Agent",
    verified: true
  },
  {
    name: "Pharma Screen Kit",
    author: "drugdev_corp",
    description: "Drug response simulation with IC50 curves",
    downloads: 892,
    stars: 67,
    category: "Enterprise",
    verified: false
  },
  {
    name: "Neuro Damage Sim",
    author: "neurodegen_research",
    description: "Progressive neural degradation for disease modeling",
    downloads: 1456,
    stars: 134,
    category: "Medical",
    verified: true
  },
  {
    name: "Cyber Threat Mapper",
    author: "infosec_sim",
    description: "Network resilience using worm as attack proxy",
    downloads: 678,
    stars: 45,
    category: "Enterprise",
    verified: false
  }
];

const CONTRIBUTION_STATS = {
  contributors: 847,
  commits: 12453,
  forks: 2341,
  stars: 8923,
  extensions: 156,
  countries: 67
};

export default function OpenPlatform() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [extensionFilter, setExtensionFilter] = useState("all");

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredExtensions = extensionFilter === "all" 
    ? COMMUNITY_EXTENSIONS 
    : COMMUNITY_EXTENSIONS.filter(e => e.category.toLowerCase() === extensionFilter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b-3 border-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 py-16 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 border-primary text-primary">
                <Rocket className="w-3 h-3 mr-1" />
                The SpaceX of Simulation Education
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-black mb-6">
                302 Neurons.
                <br />
                <span className="text-primary">Infinite Possibilities.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A 302-neuron nematode schooling Fortune 500 on complex adaptive systems. 
                Open-source. Crowdsourced. Transformative.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Button size="lg" className="gap-2 font-bold">
                  <Github className="w-5 h-5" />
                  Star on GitHub
                </Button>
                <Button size="lg" variant="outline" className="gap-2 font-bold">
                  <MessageSquare className="w-5 h-5" />
                  Join Slack Community
                </Button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {[
                  { icon: Users, value: CONTRIBUTION_STATS.contributors.toLocaleString(), label: "Contributors" },
                  { icon: GitPullRequest, value: CONTRIBUTION_STATS.commits.toLocaleString(), label: "Commits" },
                  { icon: GitFork, value: CONTRIBUTION_STATS.forks.toLocaleString(), label: "Forks" },
                  { icon: Star, value: CONTRIBUTION_STATS.stars.toLocaleString(), label: "Stars" },
                  { icon: Package, value: CONTRIBUTION_STATS.extensions.toString(), label: "Extensions" },
                  { icon: Globe, value: CONTRIBUTION_STATS.countries.toString(), label: "Countries" }
                ].map((stat, i) => (
                  <Card key={i} className="border-2 border-foreground/20 bg-card/50">
                    <CardContent className="p-3 text-center">
                      <stat.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-black">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Tabs */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="contribute" className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-auto p-1">
              <TabsTrigger value="contribute" className="font-bold py-3">
                <Github className="w-4 h-4 mr-2" />
                Contribute
              </TabsTrigger>
              <TabsTrigger value="api" className="font-bold py-3">
                <Server className="w-4 h-4 mr-2" />
                API Access
              </TabsTrigger>
              <TabsTrigger value="extensions" className="font-bold py-3">
                <Package className="w-4 h-4 mr-2" />
                Extensions
              </TabsTrigger>
              <TabsTrigger value="community" className="font-bold py-3">
                <Users className="w-4 h-4 mr-2" />
                Community
              </TabsTrigger>
            </TabsList>

            {/* Contribute Tab */}
            <TabsContent value="contribute" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-black mb-4">Open Source Everything</h2>
                <p className="text-muted-foreground">
                  Fork it. Extend it. Make it yours. Every line of code, every neuron connection, 
                  every physics constant—all open on GitHub.
                </p>
              </div>

              {/* Quick Start Code Blocks */}
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="border-3 border-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Terminal className="w-5 h-5 text-primary" />
                      Clone & Run
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-foreground/5 rounded-lg p-4 font-mono text-sm relative">
                      <pre className="text-foreground/80 overflow-x-auto">
{`git clone https://github.com/openworm/OpenWorm
cd OpenWorm
npm install
npm run dev`}
                      </pre>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard("git clone https://github.com/openworm/OpenWorm\ncd OpenWorm\nnpm install\nnpm run dev", "clone")}
                      >
                        {copiedCode === "clone" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-3 border-foreground">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Code2 className="w-5 h-5 text-primary" />
                      Quick API Call
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-foreground/5 rounded-lg p-4 font-mono text-sm relative">
                      <pre className="text-foreground/80 overflow-x-auto">
{`fetch('https://api.openworm.org/simulate', {
  method: 'POST',
  body: JSON.stringify({
    neurons: ['ASEL', 'ASER', 'AIY'],
    stimulus: { type: 'chemical', value: 0.8 }
  })
})`}
                      </pre>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard("fetch('https://api.openworm.org/simulate', {...})", "api")}
                      >
                        {copiedCode === "api" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contribution Areas */}
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: Brain,
                    title: "Connectome Data",
                    description: "Refine synaptic weights, add new neuron types, validate against empirical data",
                    issues: 23,
                    difficulty: "Advanced"
                  },
                  {
                    icon: Cpu,
                    title: "Physics Engine",
                    description: "Improve SPH simulation, optimize WebGL rendering, add fluid dynamics",
                    issues: 18,
                    difficulty: "Expert"
                  },
                  {
                    icon: Sparkles,
                    title: "Behaviors",
                    description: "Implement new behaviors: mating, aging, learning, social dynamics",
                    issues: 34,
                    difficulty: "Intermediate"
                  },
                  {
                    icon: Database,
                    title: "Documentation",
                    description: "Write tutorials, translate docs, create video guides",
                    issues: 12,
                    difficulty: "Beginner"
                  },
                  {
                    icon: Shield,
                    title: "Testing",
                    description: "Increase coverage, benchmark performance, validate accuracy",
                    issues: 8,
                    difficulty: "Intermediate"
                  },
                  {
                    icon: Globe,
                    title: "Integrations",
                    description: "Connect to MATLAB, R, Python, create plugins for other tools",
                    issues: 15,
                    difficulty: "Advanced"
                  }
                ].map((area, i) => (
                  <Card key={i} className="border-2 border-foreground/20 hover:border-primary/50 transition-colors group">
                    <CardContent className="p-6">
                      <area.icon className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-bold text-lg mb-2">{area.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{area.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{area.difficulty}</Badge>
                        <span className="text-sm text-muted-foreground">{area.issues} open issues</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* API Access Tab */}
            <TabsContent value="api" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-black mb-4">Premium API Access</h2>
                <p className="text-muted-foreground">
                  Scale your simulations with dedicated infrastructure. 
                  From indie researchers to Fortune 500 R&D departments.
                </p>
              </div>

              {/* Visual Circuit Designer */}
              <div className="max-w-7xl mx-auto mb-12">
                <VisualCircuitDesigner />
              </div>

              {/* API Onboarding Wizard */}
              <div className="max-w-3xl mx-auto mb-12">
                <APIOnboardingWizard />
              </div>

              {/* Interactive API Playground */}
              <div className="max-w-3xl mx-auto mb-12">
                <APIPlayground />
              </div>

              {/* Batch Simulation & Parameter Sweeps */}
              <div className="max-w-4xl mx-auto mb-12">
                <BatchSimulationUI />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {API_TIERS.map((tier, i) => (
                  <Card 
                    key={i} 
                    className={`border-3 relative ${
                      tier.popular 
                        ? "border-primary shadow-[4px_4px_0px_hsl(var(--primary))]" 
                        : "border-foreground"
                    }`}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.period}</span>
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {tier.features.map((feature, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-foreground/10 pt-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requests</span>
                          <span className="font-mono">{tier.limits.requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Neurons</span>
                          <span className="font-mono">{tier.limits.neurons}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Support</span>
                          <span className="font-mono">{tier.limits.support}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full font-bold" 
                        variant={tier.popular ? "default" : "outline"}
                      >
                        {tier.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* API Features */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                {[
                  { icon: Zap, title: "Low Latency", desc: "< 50ms response times globally" },
                  { icon: Lock, title: "Secure", desc: "SOC 2 Type II certified" },
                  { icon: Clock, title: "99.9% Uptime", desc: "Enterprise SLA guaranteed" }
                ].map((feat, i) => (
                  <Card key={i} className="border-2 border-foreground/20 text-center">
                    <CardContent className="p-6">
                      <feat.icon className="w-8 h-8 mx-auto text-primary mb-2" />
                      <h4 className="font-bold">{feat.title}</h4>
                      <p className="text-sm text-muted-foreground">{feat.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Extensions Tab */}
            <TabsContent value="extensions" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-black mb-4">Crowdsourced Extensions</h2>
                <p className="text-muted-foreground">
                  Community-built simulation modules. Install with one click. 
                  Build your own and share with the world.
                </p>
              </div>

              {/* Filter */}
              <div className="flex justify-center gap-2 flex-wrap">
                {["all", "behavior", "physics", "medical", "enterprise", "multi-agent"].map(cat => (
                  <Button 
                    key={cat}
                    variant={extensionFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExtensionFilter(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {filteredExtensions.map((ext, i) => (
                  <Card key={i} className="border-2 border-foreground/20 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{ext.name}</h3>
                            {ext.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">by {ext.author}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{ext.category}</Badge>
                      </div>
                      
                      <p className="text-sm mb-4">{ext.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {ext.downloads.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {ext.stars}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">Install</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Browse All Extensions
                </Button>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-3xl font-black mb-4">Join the Movement</h2>
                <p className="text-muted-foreground">
                  Scientists, engineers, educators, and builders—united by a 1mm worm 
                  that's changing how we understand complex systems.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Slack Card */}
                <Card className="border-3 border-foreground">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#4A154B] flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Slack Community</h3>
                    <p className="text-muted-foreground mb-6">
                      2,400+ members discussing simulations, sharing extensions, 
                      and helping each other debug.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <Badge variant="outline">#general</Badge>
                      <Badge variant="outline">#help</Badge>
                      <Badge variant="outline">#showcase</Badge>
                      <Badge variant="outline">#research</Badge>
                      <Badge variant="outline">#enterprise</Badge>
                    </div>
                    <Button className="w-full font-bold gap-2">
                      Join Slack
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>

                {/* GitHub Card */}
                <Card className="border-3 border-foreground">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-6">
                      <Github className="w-8 h-8 text-background" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">GitHub Organization</h3>
                    <p className="text-muted-foreground mb-6">
                      12 repositories, 847 contributors, and counting. 
                      Every PR makes the worm smarter.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <Badge variant="outline">OpenWorm</Badge>
                      <Badge variant="outline">Sibernetic</Badge>
                      <Badge variant="outline">c302</Badge>
                      <Badge variant="outline">Geppetto</Badge>
                    </div>
                    <Button variant="outline" className="w-full font-bold gap-2">
                      View Repositories
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Top Contributors */}
              <Card className="border-3 border-foreground max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top Contributors This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { name: "Stephen Larson", commits: 47, avatar: "SL" },
                      { name: "Padraig Gleeson", commits: 34, avatar: "PG" },
                      { name: "Matteo Cantarelli", commits: 28, avatar: "MC" },
                      { name: "Giovanni Idili", commits: 21, avatar: "GI" },
                      { name: "Mark Watts", commits: 18, avatar: "MW" }
                    ].map((contrib, i) => (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 font-bold text-primary">
                          {contrib.avatar}
                        </div>
                        <p className="font-bold text-sm truncate">{contrib.name}</p>
                        <p className="text-xs text-muted-foreground">{contrib.commits} commits</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Bold Vision Footer */}
        <section className="border-t-3 border-foreground bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Flag className="w-8 h-8 text-red-500" />
                <span className="text-4xl">🚀</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                Bold. Efficient. Transformative.
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8">
                Like SpaceX made rockets reusable, we're making biological simulation accessible. 
                Start small—pilot a MOOC tomorrow, certify your first cohort by Q2. 
                <strong className="text-foreground"> Make OpenWorm the SpaceX of sim-ed.</strong>
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2 font-bold">
                  <Rocket className="w-5 h-5" />
                  Launch Your First Sim
                </Button>
                <Button size="lg" variant="outline" className="gap-2 font-bold">
                  <TrendingUp className="w-5 h-5" />
                  ROI Calculator
                </Button>
              </div>

              <p className="mt-8 text-sm text-muted-foreground italic">
                "Worm-trained pros slash R&D costs in biotech/defense—America wins."
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
