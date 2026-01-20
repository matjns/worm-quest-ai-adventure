import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  GraduationCap, Building2, Shield, FlaskConical, Briefcase,
  CheckCircle2, Star, Users, Trophy, BookOpen, Globe,
  Award, Target, Zap, Brain, Lock, FileText, DollarSign,
  ArrowRight, Sparkles, Network, Dna, Heart
} from "lucide-react";
import { Header } from "@/components/Header";
import { toast } from "sonner";

interface PricingTier {
  name: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface EnterpriseTrack {
  id: string;
  name: string;
  icon: typeof Building2;
  color: string;
  bgColor: string;
  tagline: string;
  description: string;
  useCases: string[];
  accreditation: string[];
  fidelityScore: number;
}

const MOOC_PARTNERS = [
  { name: "edX", logo: "📚", courses: 3 },
  { name: "Coursera", logo: "🎓", courses: 2 },
  { name: "Udacity", logo: "🚀", courses: 1 },
  { name: "LinkedIn Learning", logo: "💼", courses: 2 },
];

const ENTERPRISE_TRACKS: EnterpriseTrack[] = [
  {
    id: "cyber",
    name: "Cyber Resilience",
    icon: Shield,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    tagline: "NSA/DoD Network Simulation",
    description: "Use C. elegans neural networks as a proxy model for cyber threat propagation. Simulate attack vectors, cascading failures, and defensive interventions in a safe, biological framework.",
    useCases: [
      "Network vulnerability mapping",
      "Cascade failure prediction",
      "Incident response training",
      "Zero-trust architecture modeling",
    ],
    accreditation: ["NSA CAE-CD", "NIST CSF", "CompTIA Security+"],
    fidelityScore: 94,
  },
  {
    id: "pharma",
    name: "Drug Discovery",
    icon: FlaskConical,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    tagline: "Pharma & Biotech R&D",
    description: "Tweak virtual C. elegans mutants to model drug targets, neurotoxicity pathways, and therapeutic interventions. Accelerate lead discovery with in silico screening before wet lab validation.",
    useCases: [
      "Neurotoxicity screening",
      "Target identification",
      "Mechanism of action modeling",
      "Phenotypic drug discovery",
    ],
    accreditation: ["FDA ICH Guidelines", "OECD TG", "GLP Compliant"],
    fidelityScore: 91,
  },
  {
    id: "devoworm",
    name: "Developmental Biology",
    icon: Dna,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    tagline: "DevoWorm Embryogenesis",
    description: "Integrate DevoWorm simulations for complete developmental biology—from cell lineage to neural circuit formation. Train the next generation of systems biologists.",
    useCases: [
      "Cell lineage tracking",
      "Morphogenesis modeling",
      "Gene regulatory networks",
      "Developmental disorders research",
    ],
    accreditation: ["ASCB", "ISDB", "ABET Bio"],
    fidelityScore: 96,
  },
  {
    id: "enterprise",
    name: "Organizational Dynamics",
    icon: Building2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tagline: "Fortune 500 & Consulting",
    description: "Apply neural network principles to organizational design, change management, and strategic decision-making. Train executives to think in systems.",
    useCases: [
      "Org restructuring simulations",
      "M&A integration modeling",
      "Change cascade prediction",
      "Leadership network analysis",
    ],
    accreditation: ["SHRM", "PMI", "McKinsey certified"],
    fidelityScore: 88,
  },
  {
    id: "sports",
    name: "Sports Analytics",
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    tagline: "Teams & Talent Optimization",
    description: "Model team dynamics, player chemistry, and strategic matchups using neural network principles. From draft picks to championship runs.",
    useCases: [
      "Team chemistry optimization",
      "Trade impact simulation",
      "Play design and analysis",
      "Injury cascade modeling",
    ],
    accreditation: ["MIT Sloan Sports", "SABR", "ESPN Analytics"],
    fidelityScore: 85,
  },
  {
    id: "finance",
    name: "Financial Modeling",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    tagline: "Risk & Scenario Analysis",
    description: "Transform spreadsheet thinking into dynamic simulation. Model interconnected financial variables, stress test portfolios, and predict cascade effects.",
    useCases: [
      "Systemic risk modeling",
      "Portfolio stress testing",
      "M&A synergy simulation",
      "Regulatory scenario analysis",
    ],
    accreditation: ["CFA Institute", "FRM", "SOX Compliant"],
    fidelityScore: 89,
  },
];

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Academic",
    price: "Free",
    priceNote: "for .edu domains",
    description: "Full access for accredited educational institutions",
    features: [
      "Unlimited student seats",
      "LMS integration (Canvas, Blackboard)",
      "Basic analytics dashboard",
      "Community support",
      "ABET-aligned curriculum",
    ],
    cta: "Apply for Academic Access",
  },
  {
    name: "Professional",
    price: "$500",
    priceNote: "per cohort (up to 30 learners)",
    description: "Self-paced learning for corporate training teams",
    features: [
      "30 learner seats",
      "Custom branding",
      "Progress tracking & reporting",
      "Certificate of completion",
      "Email support (48h SLA)",
      "API access for LMS integration",
    ],
    cta: "Start Professional Trial",
  },
  {
    name: "Enterprise",
    price: "$2,500",
    priceNote: "per cohort (up to 100 learners)",
    description: "Customized simulations for specific industry needs",
    features: [
      "100 learner seats",
      "Custom scenario development",
      "Industry-specific modules",
      "Dedicated success manager",
      "SSO/SAML integration",
      "Priority support (4h SLA)",
      "Quarterly business reviews",
    ],
    cta: "Contact Enterprise Sales",
    popular: true,
  },
  {
    name: "Government",
    price: "$5,000",
    priceNote: "per cohort + grant eligibility",
    description: "Classified-ready deployments for DoD, NSA, DoE",
    features: [
      "Unlimited seats",
      "Air-gapped deployment option",
      "FedRAMP-ready architecture",
      "Custom classification levels",
      "DoE/NSF grant assistance",
      "Dedicated gov liaison",
      "IL4/IL5 compliant",
      "ITAR-compatible workflows",
    ],
    cta: "Schedule Gov Briefing",
  },
];

const GRANT_PROGRAMS = [
  { agency: "NSF", program: "IUSE: EHR", focus: "STEM Education Innovation", amount: "$300K-$3M" },
  { agency: "DoE", program: "ARPA-E", focus: "Advanced Research", amount: "$500K-$10M" },
  { agency: "NIH", program: "R25", focus: "Education & Training", amount: "$250K-$1M" },
  { agency: "DoD", program: "STEM Ed", focus: "Workforce Development", amount: "$100K-$500K" },
];

export default function EnterpriseMOOC() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", org: "", message: "" });

  const handleContactSubmit = () => {
    toast.success("Thank you! Our team will contact you within 24 hours.");
    setContactForm({ name: "", email: "", org: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="outline">
            <Globe className="h-3 w-3 mr-1" />
            Enterprise & Academic Partnerships
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simulation-Based Learning
            <span className="text-primary"> at Scale</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            From MOOCs to classified government training—customized neural simulation 
            experiences for every sector. Fidelity trumps all for skill transfer.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {MOOC_PARTNERS.map((partner) => (
              <Badge key={partner.name} variant="secondary" className="text-sm py-2 px-4">
                <span className="mr-2">{partner.logo}</span>
                {partner.name}
                <span className="ml-2 text-muted-foreground">({partner.courses} courses)</span>
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Value Props */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Target, label: "94%", desc: "Avg. Fidelity Score" },
            { icon: Users, label: "50K+", desc: "Learners Trained" },
            { icon: Building2, label: "120+", desc: "Enterprise Clients" },
            { icon: Award, label: "ABET", desc: "Accreditation Ready" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.desc}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="tracks" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
            <TabsTrigger value="tracks">Industry Tracks</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Industry Tracks */}
          <TabsContent value="tracks" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Customized Simulation Tracks</h2>
              <p className="text-muted-foreground">
                Co-designed with accreditation bodies for maximum skill transfer fidelity
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ENTERPRISE_TRACKS.map((track, index) => {
                const Icon = track.icon;
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                        selectedTrack === track.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTrack(track.id === selectedTrack ? null : track.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${track.bgColor}`}>
                              <Icon className={`h-5 w-5 ${track.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-base">{track.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{track.tagline}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{track.fidelityScore}%</div>
                            <div className="text-xs text-muted-foreground">Fidelity</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {track.description}
                        </p>
                        
                        <div>
                          <div className="text-xs font-medium mb-1">Use Cases</div>
                          <ul className="space-y-1">
                            {track.useCases.slice(0, 3).map((uc, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {uc}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {track.accreditation.map((acc) => (
                            <Badge key={acc} variant="outline" className="text-xs">
                              {acc}
                            </Badge>
                          ))}
                        </div>

                        <Button className="w-full" variant="outline" size="sm">
                          Learn More <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Fidelity Callout */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Fidelity Trumps All</h3>
                    <p className="text-muted-foreground mb-4">
                      Our simulations are co-designed with accreditation bodies (ABET, ASCB, NSA CAE) 
                      to ensure maximum skill transfer. Every scenario is validated against real-world 
                      outcomes, ensuring learners develop actionable expertise—not just theoretical knowledge.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Industry-validated scenarios</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Measurable skill outcomes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Accreditation-ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Transparent Pricing</h2>
              <p className="text-muted-foreground">
                From free academic access to classified government deployments
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRICING_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full relative ${tier.popular ? 'ring-2 ring-primary' : ''}`}>
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <div>
                        <span className="text-3xl font-bold">{tier.price}</span>
                        <p className="text-xs text-muted-foreground">{tier.priceNote}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        {tier.description}
                      </p>
                      <ul className="space-y-2">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                        {tier.cta}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Grants */}
          <TabsContent value="grants" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Federal Grant Eligibility</h2>
              <p className="text-muted-foreground">
                Patriotic AI/STEM push—leverage government funding for workforce development
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {GRANT_PROGRAMS.map((grant, index) => (
                <motion.div
                  key={grant.program}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">{grant.agency}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{grant.program}</h3>
                            <p className="text-sm text-muted-foreground">{grant.focus}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500">{grant.amount}</div>
                          <div className="text-xs text-muted-foreground">Typical Award</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Grant Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <h3 className="text-xl font-bold mb-2">Grant Writing Assistance</h3>
                <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                  Our government liaison team provides end-to-end support for DoE, NSF, and DoD 
                  grant applications. We help you articulate alignment with national AI/STEM 
                  priorities and American workforce development goals.
                </p>
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Schedule Grant Consultation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                <p className="text-muted-foreground mb-6">
                  Ready to bring simulation-based learning to your organization? 
                  Our team will design a customized program for your specific needs.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Users, text: "Dedicated success manager" },
                    { icon: Brain, text: "Custom scenario development" },
                    { icon: Award, text: "Accreditation alignment" },
                    { icon: Lock, text: "Enterprise security & compliance" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Enterprise Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                  <Input 
                    placeholder="Work Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                  <Input 
                    placeholder="Organization"
                    value={contactForm.org}
                    onChange={(e) => setContactForm({ ...contactForm, org: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Tell us about your training needs..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                  <Button className="w-full" onClick={handleContactSubmit}>
                    Submit Inquiry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* American Innovation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center py-8 border-t"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="text-lg font-semibold">Proudly American</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            OpenWorm is a US-led nonprofit advancing open-source neuroscience for global benefit. 
            Our enterprise programs directly fund American STEM education and workforce development, 
            contributing to national AI leadership goals.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
