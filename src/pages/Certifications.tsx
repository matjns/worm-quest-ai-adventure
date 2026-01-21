import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Award, CheckCircle2, Lock, Star, Trophy, Linkedin,
  Shield, Target, Zap, Brain, BookOpen, GraduationCap,
  BadgeCheck, ExternalLink, Clock, Users, DollarSign,
  ChevronRight, Sparkles, TrendingUp, FileText, BarChart3
} from "lucide-react";
import { Header } from "@/components/Header";
import { DashboardCertSystem } from "@/components/DashboardCertSystem";
import { toast } from "sonner";
import { useGameStore } from "@/stores/gameStore";

interface MicroCredential {
  id: string;
  name: string;
  shortName: string;
  level: number;
  category: string;
  description: string;
  competencies: string[];
  prerequisites: string[];
  assessmentType: "sim-challenge" | "proctored" | "portfolio";
  duration: string;
  price: number;
  xpRequired: number;
  endorsedBy: string[];
  linkedinSkills: string[];
  earned: boolean;
  progress: number;
}

interface CertificationPath {
  id: string;
  name: string;
  description: string;
  credentials: string[];
  totalPrice: number;
  bundlePrice: number;
  endorsedBy: string;
  careerOutcomes: string[];
}

const MICRO_CREDENTIALS: MicroCredential[] = [
  // Level 1 - Foundation
  {
    id: "sim-fundamentals",
    name: "Simulation Fundamentals",
    shortName: "SIM-F",
    level: 1,
    category: "Foundation",
    description: "Master the basics of biological simulation, 3D visualization, and network analysis.",
    competencies: ["3D Visualization", "Network Topology", "Data Interpretation", "Biological Modeling Basics"],
    prerequisites: [],
    assessmentType: "sim-challenge",
    duration: "4-6 hours",
    price: 99,
    xpRequired: 500,
    endorsedBy: ["OpenWorm Foundation"],
    linkedinSkills: ["Biological Modeling", "Data Visualization", "Systems Thinking"],
    earned: false,
    progress: 0,
  },
  {
    id: "connectome-analyst",
    name: "Connectome Analyst",
    shortName: "CON-A",
    level: 1,
    category: "Foundation",
    description: "Analyze neural network structures, identify pathways, and map signal flow.",
    competencies: ["Network Analysis", "Graph Theory", "Neural Pathway Mapping", "Connectivity Metrics"],
    prerequisites: [],
    assessmentType: "sim-challenge",
    duration: "5-7 hours",
    price: 99,
    xpRequired: 600,
    endorsedBy: ["OpenWorm Foundation"],
    linkedinSkills: ["Network Analysis", "Neuroscience", "Graph Theory"],
    earned: false,
    progress: 0,
  },
  // Level 2 - Intermediate
  {
    id: "synaptic-engineer",
    name: "Synaptic Engineer",
    shortName: "SYN-E",
    level: 2,
    category: "Manipulation",
    description: "Design and modify synaptic connections to achieve target behaviors.",
    competencies: ["Synaptic Weight Optimization", "Parameter Tuning", "Causal Inference", "Sensitivity Analysis"],
    prerequisites: ["sim-fundamentals", "connectome-analyst"],
    assessmentType: "proctored",
    duration: "8-10 hours",
    price: 199,
    xpRequired: 1200,
    endorsedBy: ["OpenWorm Foundation", "BMES"],
    linkedinSkills: ["Neural Engineering", "Parameter Optimization", "Systems Biology"],
    earned: false,
    progress: 0,
  },
  {
    id: "dynamical-systems",
    name: "Dynamical Systems Modeler",
    shortName: "DYN-M",
    level: 2,
    category: "Analysis",
    description: "Apply dynamical systems theory to predict and analyze emergent behaviors.",
    competencies: ["Bifurcation Analysis", "Stability Analysis", "Phase Space Mapping", "Attractor Identification"],
    prerequisites: ["sim-fundamentals"],
    assessmentType: "proctored",
    duration: "10-12 hours",
    price: 249,
    xpRequired: 1500,
    endorsedBy: ["OpenWorm Foundation", "SIAM"],
    linkedinSkills: ["Dynamical Systems", "Mathematical Modeling", "Nonlinear Analysis"],
    earned: false,
    progress: 0,
  },
  {
    id: "stochastic-modeler",
    name: "Stochastic Modeling Specialist",
    shortName: "STO-S",
    level: 2,
    category: "Analysis",
    description: "Master probabilistic approaches to biological simulation and uncertainty quantification.",
    competencies: ["Stochastic Processes", "Monte Carlo Methods", "Uncertainty Quantification", "Probabilistic Inference"],
    prerequisites: ["sim-fundamentals"],
    assessmentType: "proctored",
    duration: "10-12 hours",
    price: 249,
    xpRequired: 1500,
    endorsedBy: ["OpenWorm Foundation", "ASA"],
    linkedinSkills: ["Stochastic Modeling", "Monte Carlo Simulation", "Statistical Analysis"],
    earned: false,
    progress: 0,
  },
  // Level 3 - Advanced
  {
    id: "outcome-optimizer",
    name: "Outcome Optimization Specialist",
    shortName: "OPT-S",
    level: 3,
    category: "Optimization",
    description: "Design and execute evolutionary algorithms for optimal circuit configurations.",
    competencies: ["Evolutionary Algorithms", "Multi-objective Optimization", "Fitness Landscape Analysis", "Hyperparameter Tuning"],
    prerequisites: ["synaptic-engineer", "dynamical-systems"],
    assessmentType: "proctored",
    duration: "15-20 hours",
    price: 399,
    xpRequired: 2500,
    endorsedBy: ["OpenWorm Foundation", "IEEE", "ACM"],
    linkedinSkills: ["Optimization", "Evolutionary Computation", "Machine Learning"],
    earned: false,
    progress: 0,
  },
  {
    id: "ml-integration",
    name: "ML Integration Architect",
    shortName: "ML-A",
    level: 3,
    category: "AI/ML",
    description: "Integrate reinforcement learning and neural networks with biological simulations.",
    competencies: ["Reinforcement Learning", "Neural Network Design", "Transfer Learning", "Sim-to-Real Transfer"],
    prerequisites: ["outcome-optimizer"],
    assessmentType: "portfolio",
    duration: "20-25 hours",
    price: 499,
    xpRequired: 3500,
    endorsedBy: ["OpenWorm Foundation", "IEEE", "AAAI"],
    linkedinSkills: ["Reinforcement Learning", "Deep Learning", "AI Integration"],
    earned: false,
    progress: 0,
  },
  // Level 4 - Expert
  {
    id: "sim-specialist",
    name: "OpenWorm Simulation Specialist",
    shortName: "OWS-X",
    level: 4,
    category: "Expert",
    description: "Comprehensive mastery of all simulation domains with research-grade capabilities.",
    competencies: ["All Level 1-3 Competencies", "Research Methodology", "Publication Standards", "Peer Review"],
    prerequisites: ["outcome-optimizer", "ml-integration", "stochastic-modeler"],
    assessmentType: "portfolio",
    duration: "40+ hours",
    price: 499,
    xpRequired: 5000,
    endorsedBy: ["OpenWorm Foundation", "IEEE", "BMES", "ABET"],
    linkedinSkills: ["Computational Neuroscience", "Simulation Engineering", "Research"],
    earned: false,
    progress: 0,
  },
];

const CERTIFICATION_PATHS: CertificationPath[] = [
  {
    id: "biotech-analyst",
    name: "Biotech Simulation Analyst",
    description: "Complete pathway for pharmaceutical and biotech R&D professionals",
    credentials: ["sim-fundamentals", "connectome-analyst", "synaptic-engineer", "dynamical-systems"],
    totalPrice: 647,
    bundlePrice: 499,
    endorsedBy: "BMES (Biomedical Engineering Society)",
    careerOutcomes: ["Drug Discovery Scientist", "Computational Biologist", "R&D Analyst"],
  },
  {
    id: "ai-systems",
    name: "AI Systems Engineer",
    description: "Full stack from biological modeling to ML integration",
    credentials: ["sim-fundamentals", "synaptic-engineer", "outcome-optimizer", "ml-integration"],
    totalPrice: 1196,
    bundlePrice: 899,
    endorsedBy: "IEEE Computational Intelligence Society",
    careerOutcomes: ["ML Engineer", "AI Researcher", "Simulation Architect"],
  },
  {
    id: "research-scientist",
    name: "Research Scientist Track",
    description: "Publication-ready skills for academic and industry research",
    credentials: ["sim-fundamentals", "connectome-analyst", "stochastic-modeler", "dynamical-systems", "sim-specialist"],
    totalPrice: 1195,
    bundlePrice: 799,
    endorsedBy: "OpenWorm Scientific Advisory Board",
    careerOutcomes: ["Research Scientist", "Principal Investigator", "Technical Fellow"],
  },
];

const ENDORSING_BODIES = [
  { name: "IEEE", logo: "🔬", description: "Institute of Electrical and Electronics Engineers" },
  { name: "BMES", logo: "🧬", description: "Biomedical Engineering Society" },
  { name: "ACM", logo: "💻", description: "Association for Computing Machinery" },
  { name: "ABET", logo: "🎓", description: "Accreditation Board for Engineering and Technology" },
];

export default function Certifications() {
  const { xp } = useGameStore();
  const [credentials, setCredentials] = useState<MicroCredential[]>(
    MICRO_CREDENTIALS.map(c => ({
      ...c,
      progress: Math.min(100, (xp / c.xpRequired) * 100),
      earned: xp >= c.xpRequired && c.prerequisites.length === 0,
    }))
  );
  const [selectedCredential, setSelectedCredential] = useState<MicroCredential | null>(null);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case 2: return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case 3: return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case 4: return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return "Foundation";
      case 2: return "Intermediate";
      case 3: return "Advanced";
      case 4: return "Expert";
      default: return "Unknown";
    }
  };

  const handleStartAssessment = (credential: MicroCredential) => {
    toast.success(`Starting ${credential.assessmentType} assessment for ${credential.name}`);
  };

  const handleLinkedInShare = (credential: MicroCredential) => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(credential.name)}&organizationName=OpenWorm%20Foundation&issueYear=2025&certUrl=${encodeURIComponent(window.location.origin + '/certifications')}`;
    window.open(linkedInUrl, '_blank');
    toast.success("Opening LinkedIn to add your credential!");
  };

  const earnedCount = credentials.filter(c => c.earned).length;
  const totalCredentials = credentials.length;

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
            <Award className="h-3 w-3 mr-1" />
            Professional Certifications
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Stackable Micro-Credentials
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Industry-recognized certifications validated by proctored simulation challenges. 
            Auto-badge to LinkedIn. Endorsed by IEEE, BMES, and leading professional societies.
          </p>
          
          {/* Endorsing Bodies */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {ENDORSING_BODIES.map((body) => (
              <Badge key={body.name} variant="secondary" className="py-2 px-4">
                <span className="mr-2">{body.logo}</span>
                <span className="font-semibold">{body.name}</span>
                <span className="text-xs text-muted-foreground ml-2 hidden md:inline">
                  {body.description}
                </span>
              </Badge>
            ))}
          </div>

          {/* Progress Overview */}
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Certification Progress</span>
                <span className="text-sm text-muted-foreground">{earnedCount}/{totalCredentials}</span>
              </div>
              <Progress value={(earnedCount / totalCredentials) * 100} className="h-2 mb-2" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-primary" />
                <span>{xp.toLocaleString()} XP earned</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="credentials" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="paths">Career Paths</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="entropy" className="gap-1">
              <BarChart3 className="w-4 h-4" />
              Entropy
            </TabsTrigger>
          </TabsList>

          {/* Micro-Credentials Grid */}
          <TabsContent value="credentials" className="space-y-8">
            {[1, 2, 3, 4].map((level) => {
              const levelCredentials = credentials.filter(c => c.level === level);
              if (levelCredentials.length === 0) return null;
              
              return (
                <div key={level} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getLevelColor(level)}>
                      Level {level}
                    </Badge>
                    <h3 className="text-lg font-semibold">{getLevelName(level)}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({levelCredentials.filter(c => c.earned).length}/{levelCredentials.length} earned)
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelCredentials.map((credential, index) => {
                      const isLocked = credential.prerequisites.some(
                        p => !credentials.find(c => c.id === p)?.earned
                      );
                      
                      return (
                        <motion.div
                          key={credential.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`h-full transition-all hover:shadow-lg ${
                            credential.earned ? 'ring-2 ring-green-500' : 
                            isLocked ? 'opacity-60' : ''
                          }`}>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    {credential.shortName}
                                  </Badge>
                                  <CardTitle className="text-base">{credential.name}</CardTitle>
                                </div>
                                {credential.earned ? (
                                  <BadgeCheck className="h-6 w-6 text-green-500" />
                                ) : isLocked ? (
                                  <Lock className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <div className="text-right">
                                    <div className="text-lg font-bold">${credential.price}</div>
                                  </div>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {credential.description}
                              </p>
                              
                              {/* Progress */}
                              {!credential.earned && !isLocked && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>XP Progress</span>
                                    <span>{Math.round(credential.progress)}%</span>
                                  </div>
                                  <Progress value={credential.progress} className="h-1.5" />
                                </div>
                              )}
                              
                              {/* Competencies */}
                              <div className="flex flex-wrap gap-1">
                                {credential.competencies.slice(0, 2).map((comp) => (
                                  <Badge key={comp} variant="secondary" className="text-xs">
                                    {comp}
                                  </Badge>
                                ))}
                                {credential.competencies.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{credential.competencies.length - 2}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Assessment Info */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {credential.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  {credential.assessmentType}
                                </span>
                              </div>
                              
                              {/* Endorsements */}
                              <div className="text-xs text-muted-foreground">
                                Endorsed by: {credential.endorsedBy.join(", ")}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-2 pt-2">
                                {credential.earned ? (
                                  <>
                                    <Button 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => handleLinkedInShare(credential)}
                                    >
                                      <Linkedin className="h-3 w-3 mr-1" />
                                      Add to LinkedIn
                                    </Button>
                                    <Button size="sm" variant="outline">
                                      <FileText className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : isLocked ? (
                                  <Button size="sm" variant="outline" className="w-full" disabled>
                                    Complete Prerequisites
                                  </Button>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" className="w-full">
                                        Start Assessment
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                      <DialogHeader>
                                        <DialogTitle>{credential.name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <p className="text-muted-foreground">
                                          {credential.description}
                                        </p>
                                        
                                        <div>
                                          <h4 className="font-medium mb-2">Competencies Assessed</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {credential.competencies.map((comp) => (
                                              <Badge key={comp} variant="secondary">
                                                {comp}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <h4 className="font-medium mb-2">LinkedIn Skills Added</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {credential.linkedinSkills.map((skill) => (
                                              <Badge key={skill} variant="outline">
                                                <Linkedin className="h-3 w-3 mr-1" />
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                          <div>
                                            <div className="font-semibold">${credential.price}</div>
                                            <div className="text-xs text-muted-foreground">
                                              {credential.assessmentType === "proctored" && "Includes proctoring fee"}
                                            </div>
                                          </div>
                                          <Button onClick={() => handleStartAssessment(credential)}>
                                            Purchase & Start
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Career Paths */}
          <TabsContent value="paths" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Stackable Career Paths</h2>
              <p className="text-muted-foreground">
                Bundle credentials for maximum career impact and savings
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {CERTIFICATION_PATHS.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">
                        {path.credentials.length} Credentials
                      </Badge>
                      <CardTitle>{path.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{path.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Credential Stack */}
                      <div className="space-y-2">
                        {path.credentials.map((credId, i) => {
                          const cred = credentials.find(c => c.id === credId);
                          if (!cred) return null;
                          return (
                            <div 
                              key={credId}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getLevelColor(cred.level)}`}>
                                {i + 1}
                              </div>
                              <span>{cred.shortName}</span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground truncate">{cred.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Endorsement */}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Endorsed by: </span>
                        <span className="font-medium">{path.endorsedBy}</span>
                      </div>
                      
                      {/* Career Outcomes */}
                      <div>
                        <div className="text-xs font-medium mb-1">Career Outcomes</div>
                        <div className="flex flex-wrap gap-1">
                          {path.careerOutcomes.map((outcome) => (
                            <Badge key={outcome} variant="secondary" className="text-xs">
                              {outcome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Pricing */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div>
                          <div className="text-sm text-muted-foreground line-through">
                            ${path.totalPrice}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            ${path.bundlePrice}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-500">
                            Save ${path.totalPrice - path.bundlePrice}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button className="w-full">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Enroll in Path
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Investment & ROI</h2>
              <p className="text-muted-foreground">
                Worm-trained professionals slash R&D costs in biotech and defense—America wins.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { tier: "Foundation", price: "$99", level: "Level 1", features: ["1 credential", "Self-paced assessment", "Digital badge", "LinkedIn auto-add"] },
                { tier: "Specialist", price: "$199-249", level: "Level 2", features: ["1 credential", "Proctored assessment", "Credly verification", "Skills endorsement"] },
                { tier: "Expert", price: "$399-499", level: "Level 3-4", features: ["1 credential", "Portfolio review", "IEEE endorsement", "Career coaching"] },
                { tier: "Career Path", price: "$499-899", level: "Bundle", features: ["3-5 credentials", "Up to 30% savings", "Priority proctoring", "Mentorship access"], popular: true },
              ].map((tier, index) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full relative ${tier.popular ? 'ring-2 ring-primary' : ''}`}>
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Best Value</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <Badge variant="outline" className="w-fit mx-auto mb-2">
                        {tier.level}
                      </Badge>
                      <CardTitle>{tier.tier}</CardTitle>
                      <div className="text-3xl font-bold">{tier.price}</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* ROI Callout */}
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">40%</div>
                    <div className="text-sm text-muted-foreground">Faster R&D cycles reported by certified biotech teams</div>
                  </div>
                  <div>
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">$50K+</div>
                    <div className="text-sm text-muted-foreground">Avg. salary premium for simulation specialists</div>
                  </div>
                  <div>
                    <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">2,500+</div>
                    <div className="text-sm text-muted-foreground">Certified professionals in biotech & defense</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entropy Tracking Tab */}
          <TabsContent value="entropy" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Knowledge Entropy Tracker</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Track your learning progress and identify knowledge gaps across all certification domains.
                Achieve a low entropy score to unlock the Worm Warrior badge!
              </p>
            </div>
            <DashboardCertSystem className="border-2" />
          </TabsContent>
        </Tabs>

        {/* American ROI Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center py-8 border-t"
        >
          <Badge variant="outline" className="mb-4">
            <Trophy className="h-3 w-3 mr-1" />
            American Workforce Advantage
          </Badge>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            OpenWorm-certified professionals drive innovation in American biotech, defense, and AI. 
            Every certification strengthens our national competitive advantage in computational biology 
            and simulation-driven R&D.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
