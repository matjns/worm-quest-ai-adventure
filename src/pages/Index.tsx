import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import DisplayCards from "@/components/DisplayCards";
import { BentoCard, BentoGrid } from "@/components/BentoGrid";
import { ExpandableTabs } from "@/components/ExpandableTabs";
import { WormCanvas } from "@/components/WormCanvas";
import { AIChallengeBanner } from "@/components/AIChallengeBanner";
import { GlobalImpactCounter } from "@/components/GlobalImpactCounter";
import { WormRaceLobby } from "@/components/WormRaceLobby";
import { ChallengeShowcase } from "@/components/ChallengeShowcase";
import { DopamineBooster } from "@/components/DopamineBooster";
import neuroQuestLogo from "@/assets/neuroquest-logo.png";
import { 
  Brain, 
  Sparkles, 
  Rocket, 
  GraduationCap, 
  Users, 
  Trophy,
  ArrowRight,
  Play,
  BookOpen,
  Zap,
  Target,
  Volume2,
  Flag,
  Award
} from "lucide-react";

const navTabs = [
  { title: "Learn", icon: BookOpen },
  { title: "Play", icon: Play },
  { title: "Compete", icon: Trophy },
  { title: "Community", icon: Users },
];

const features = [
  {
    Icon: Brain,
    name: "302 Neurons, Infinite Possibilities",
    description: "Explore the complete C. elegans connectome — the only fully mapped brain in existence. Build, simulate, and understand neural networks.",
    href: "/learn",
    cta: "Start Learning",
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
    background: (
      <div className="absolute inset-0 opacity-30">
        <WormCanvas neuronCount={30} animated={true} />
      </div>
    ),
  },
  {
    Icon: Sparkles,
    name: "AI-Powered Learning",
    description: "AI adapts to your pace, generates challenges, and validates your simulations in real-time.",
    href: "/play",
    cta: "Experience AI",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
    ),
  },
  {
    Icon: Trophy,
    name: "Gamified Mastery",
    description: "Earn badges, climb leaderboards, and unlock new neural tools as you progress.",
    href: "/leaderboard",
    cta: "View Achievements",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
    ),
  },
  {
    Icon: GraduationCap,
    name: "All Ages Welcome",
    description: "Pre-K to PhD — adaptive content for every learner. Teachers get zero-prep lesson scripts.",
    href: "/play",
    cta: "Choose Your Level",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
    ),
  },
  {
    Icon: Users,
    name: "OpenWorm Community",
    description: "Join the global open-source neuroscience movement. Share simulations, contribute data, inspire discovery.",
    href: "/community",
    cta: "Join Community",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10" />
    ),
  },
];

const stats = [
  { value: "302", label: "Neurons", icon: Brain },
  { value: "7000+", label: "Connections", icon: Zap },
  { value: "100%", label: "Mapped", icon: Target },
  { value: "∞", label: "Possibilities", icon: Rocket },
];

const ghostColors = ["🔴", "🩷", "🩵", "🟠"];

export default function Index() {
  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(250_50%_4%)] relative">
      {/* Arcade pellet background pattern */}
      <div className="fixed inset-0 pellet-bg opacity-30 pointer-events-none" />
      
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background canvas */}
        <div className="absolute inset-0 opacity-20">
          <WormCanvas neuronCount={80} />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Arcade Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-6"
              >
                <img 
                  src={neuroQuestLogo} 
                  alt="NeuroQuest" 
                  className="h-16 md:h-20 w-auto drop-shadow-[0_0_30px_hsl(340_100%_60%/0.5)]"
                />
              </motion.div>

              {/* Menu Bar */}
              <div className="mb-8">
                <ExpandableTabs tabs={navTabs} className="inline-flex" />
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
                <span className="block text-foreground">Digitize</span>
                <span className="block text-primary text-neon-pink">Life</span>
                <span className="block text-accent">Decode Biology</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-4 max-w-lg font-mono">
                🐛 A tiny worm with 302 neurons unlocks the secrets of the brain. 
                Build neural circuits. Train AI. Conquer neuroscience.
              </p>

              {/* MTP Callout */}
              <div className="bg-muted/50 border-2 border-primary/30 rounded-lg p-3 mb-6 max-w-lg">
                <p className="text-xs font-arcade text-primary mb-1">MASSIVE TRANSFORMATIVE PURPOSE</p>
                <p className="text-sm text-muted-foreground italic">
                  "Simulate every organism to decode biology's code and conquer the brain."
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/neuroquest">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto glow-neon-pink">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Quest
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button variant="brutal" size="xl" className="w-full sm:w-auto">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Learn First
                  </Button>
                </Link>
              </div>

              {/* Stats - Arcade style */}
              <div className="grid grid-cols-4 gap-4 mt-12">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center p-3 bg-card/50 border-2 border-foreground rounded-lg"
                  >
                    <stat.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-xl font-arcade text-accent">{stat.value}</p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Display Cards + AI Challenge */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex flex-col gap-6"
            >
              <DisplayCards />
              <AIChallengeBanner 
                ageGroup="middle" 
                topic="neurons and neural circuits"
                onChallengeStart={(challenge) => {
                  console.log("Starting challenge:", challenge);
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Floating ghost decorations */}
        <div className="absolute top-32 right-10 text-3xl animate-bounce opacity-60" style={{ animationDelay: "0s" }}>
          {ghostColors[0]}
        </div>
        <div className="absolute top-48 left-10 text-3xl animate-bounce opacity-60" style={{ animationDelay: "0.3s" }}>
          {ghostColors[1]}
        </div>
        <div className="absolute bottom-32 right-20 text-3xl animate-bounce opacity-60" style={{ animationDelay: "0.6s" }}>
          {ghostColors[2]}
        </div>
        <div className="absolute bottom-48 left-20 text-3xl animate-bounce opacity-60" style={{ animationDelay: "0.9s" }}>
          {ghostColors[3]}
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Master the <span className="text-primary">Neural Network</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From watching worms wiggle to training AI models — there's a journey for everyone.
            </p>
          </motion.div>

          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Game Modes Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Choose Your <span className="text-accent">Level</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Adaptive learning for every age and skill level.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Pre-K", desc: "Watch worms wiggle!", color: "bg-[hsl(45_100%_50%)]" },
              { title: "K-5", desc: "Build simple brains", color: "bg-primary" },
              { title: "Middle", desc: "Tweak neural weights", color: "bg-accent" },
              { title: "High+", desc: "Train AI models", color: "bg-[hsl(280_65%_50%)]" },
            ].map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to="/play">
                  <div className="group bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[8px_8px_0px_hsl(var(--foreground))] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all">
                    <div className={`w-12 h-12 ${mode.color} border-2 border-foreground mb-4 flex items-center justify-center`}>
                      <span className="text-2xl font-black text-primary-foreground">{i + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold uppercase mb-2">{mode.title}</h3>
                    <p className="text-muted-foreground">{mode.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/play">
              <Button variant="hero" size="xl">
                <Play className="w-5 h-5 mr-2" />
                Begin Your Adventure
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Technologies Section - Races & Global Impact */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Join the <span className="text-primary">Global Community</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Collaborate, compete, and contribute to open-source neuroscience research.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Global Impact Counter */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlobalImpactCounter />
            </motion.div>

            {/* Worm Race Lobby */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <WormRaceLobby 
                onJoinRace={(raceId) => window.location.href = `/race/${raceId}`}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Presidential AI Challenge Showcase */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-chart-1/20 text-chart-1 px-4 py-2 rounded-full mb-4">
              <Flag className="w-4 h-4" />
              <span className="font-bold text-sm uppercase">Track III Optimized</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              Built for the <span className="text-primary">AI Challenge</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advancing American AI leadership through innovative neuroscience education.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <ChallengeShowcase />
            </div>
            <div>
              <DopamineBooster />
            </div>
          </div>
        </div>
      </section>

      {/* OpenWorm CTA */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Flag className="w-8 h-8 text-chart-1" />
              <Brain className="w-16 h-16 text-primary" />
              <Award className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
              🇺🇸 Powered by OpenWorm
            </h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-4">
              WormQuest is built on open-source neuroscience data from the OpenWorm project — 
              a <strong>US-led nonprofit</strong> creating the world's first digital organism.
            </p>
            <p className="text-sm opacity-60 max-w-xl mx-auto mb-8">
              Supporting American AI dominance through open science, STEM education, and 
              next-generation workforce development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://openworm.org" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-background text-background hover:bg-background hover:text-foreground"
                >
                  Visit OpenWorm
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href="https://github.com/openworm" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-background text-background hover:bg-background hover:text-foreground"
                >
                  GitHub Repository
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t-2 border-foreground">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold uppercase">WormQuest</span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            © 2024 WormQuest. Built with OpenWorm data. Open-source education for all.
          </p>
          <div className="flex gap-4 text-sm font-bold uppercase">
            <Link to="/learn" className="hover:text-primary transition-colors">Learn</Link>
            <Link to="/play" className="hover:text-primary transition-colors">Play</Link>
            <Link to="/community" className="hover:text-primary transition-colors">Community</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}