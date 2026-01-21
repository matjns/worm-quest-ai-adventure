import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { SplashIntro, useSplashIntro } from "@/components/SplashIntro";
import { AnimatedWorm, WormDecoration } from "@/components/AnimatedWorm";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSEO } from "@/hooks/useSEO";
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

export default function Index() {
  const { showSplash, setShowSplash } = useSplashIntro();
  const isMobile = useIsMobile();
  
  // Apply homepage SEO
  useSEO();

  return (
    <>
      {/* Splash Intro - Shows once on first visit */}
      <AnimatePresence>
        {showSplash && (
          <SplashIntro onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background dark:bg-[hsl(250_50%_4%)] relative">
        {/* Clean gradient background */}
        <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        
      <section className="relative pt-16 md:pt-24 pb-12 md:pb-20 px-4 overflow-hidden">
        {/* Background canvas */}
        <div className="absolute inset-0 opacity-15">
          <WormCanvas neuronCount={isMobile ? 30 : 80} />
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

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 md:mb-6 leading-tight">
                <span className="block text-foreground">Unlock the</span>
                <span className="block text-primary">Brain's Code</span>
                <span className="block text-accent text-lg sm:text-xl md:text-2xl lg:text-3xl mt-2 font-semibold">World's First In Silico Organism</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg">
                🐛 302 Neurons. 7,000 Synapses. Infinite Futures.
              </p>
              <p className="text-sm md:text-base text-foreground/80 mb-3 max-w-lg leading-relaxed">
                Dive into OpenWorm's digital C. elegans—simulate neuronal processing, 
                emergent behaviors, environmental interactions. Master biology, chemistry, 
                physics, AI, simulations. Pre-K colors to PhD mutagenesis.
              </p>
              <p className="text-xs md:text-sm text-primary font-semibold mb-4">
                Classroom, boardroom, cubicle: Ignite exponential thinking.
              </p>

              {/* MTP Callout - Clean design */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl p-4 mb-6 max-w-lg">
                <p className="text-xs font-semibold text-primary mb-1 tracking-wide flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Massive Transformative Purpose
                </p>
                <p className="text-sm text-foreground font-medium">
                  Simulate organisms to decode biology. Learn from the lowly!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/play">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto glow-neon-pink">
                    <Rocket className="w-5 h-5 mr-2" />
                    Build Your Worm Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/teacher">
                  <Button variant="brutal" size="xl" className="w-full sm:w-auto">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Educator Track
                  </Button>
                </Link>
              </div>

              {/* Stats - Clean cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-center p-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl"
                  >
                    <stat.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-lg md:text-xl font-bold text-accent">{stat.value}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
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

        {/* Floating worm decorations - replacing ghost emojis */}
        {!isMobile && (
          <>
            <WormDecoration className="absolute top-32 right-10 opacity-60" />
            <WormDecoration className="absolute top-48 left-10 opacity-50" />
            <WormDecoration className="absolute bottom-32 right-20 opacity-40" />
            <WormDecoration className="absolute bottom-48 left-20 opacity-50" />
          </>
        )}
      </section>

      {/* Profound Impact Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
              Why This Matters: <span className="text-primary">From Lowly Worm to Human Aspiration</span>
            </h2>
            <p className="text-base md:text-lg text-foreground/80 mb-4 md:mb-6 leading-relaxed">
              Profound irony: A nematode with minimal neurons reveals how thoughts arise—ion channels 
              firing via <strong className="text-primary">Hodgkin-Huxley dynamics</strong>, synapses weighting info flows. 
              Harness this for life's simulations: Optimize supply chains via bifurcation analysis, 
              drug discovery through virtual perturbations.
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
              Amid 12+ stacked Gutenberg moments—exponential tech tsunamis—WormQuest expands minds 
              for abundance, not scarcity. <strong className="text-accent">Self-directed mastery</strong>, no gatekeepers. 
              <strong className="text-chart-1"> Global contributors, American nonprofit:</strong> OpenWorm propels 
              bio-AI leadership through open science.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Flag className="w-4 h-4 text-chart-1" /> American Open-Source</span>
              <span className="flex items-center gap-1"><Brain className="w-4 h-4 text-primary" /> owmeta RDF Validated</span>
              <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-accent" /> ExO Canvas</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Master the <span className="text-primary">Neural Network</span>
            </h3>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Choose Your <span className="text-accent">Level</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              Adaptive learning for every age and skill level.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                  <div className="group bg-card border border-border p-4 md:p-6 rounded-xl hover:shadow-lg hover:border-primary/50 transition-all">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${mode.color} rounded-lg mb-3 md:mb-4 flex items-center justify-center`}>
                      <span className="text-lg md:text-2xl font-bold text-primary-foreground">{i + 1}</span>
                    </div>
                    <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">{mode.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{mode.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Link to="/play">
              <Button variant="hero" size="xl">
                <Play className="w-5 h-5 mr-2" />
                Begin Your Adventure
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Technologies Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Join the <span className="text-primary">Global Community</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Collaborate, compete, and contribute to open-source neuroscience research.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
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
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-chart-1/20 text-chart-1 px-3 md:px-4 py-2 rounded-full mb-4">
              <Flag className="w-4 h-4" />
              <span className="font-semibold text-xs md:text-sm">Track III Optimized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Built for the <span className="text-primary">AI Challenge</span>
            </h2>
            <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Advancing American AI leadership through innovative neuroscience education.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
      <section className="py-12 md:py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Flag className="w-6 h-6 md:w-8 md:h-8 text-chart-1" />
              <AnimatedWorm size={isMobile ? "md" : "lg"} color="hsl(var(--primary))" />
              <Award className="w-6 h-6 md:w-8 md:h-8 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              🇺🇸 American Open-Source Leadership
            </h2>
            <p className="text-base md:text-xl opacity-90 max-w-3xl mx-auto mb-4 font-medium">
              In silico C. elegans: World's first virtual organism, decoding neuronal 
              computation from connectome to cognition.
            </p>
            <p className="text-sm md:text-lg opacity-80 max-w-2xl mx-auto mb-4 leading-relaxed">
              WormQuest is built on <strong>OpenWorm</strong>—a US-led nonprofit fusing owmeta RDF 
              with exponential education. Chairman's dream ignited by the White House AI Challenge: 
              kids demanding sign-up, educators sparking vibecoding frenzy.
            </p>
            <p className="text-xs md:text-sm opacity-60 max-w-xl mx-auto mb-6 md:mb-8">
              Tsunami of Gutenberg stacks? WormQuest equips millions for synaptic sovereignty 
              amid exponential flux. Self-directed mastery. No gatekeepers. Bio-AI dominance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a href="https://openworm.org" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-transparent border-background text-background hover:bg-background hover:text-foreground"
                >
                  Visit OpenWorm
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href="https://github.com/openworm" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-background text-background hover:bg-background hover:text-foreground"
                >
                  GitHub Repository
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AnimatedWorm size="sm" animated={false} />
            <span className="font-bold">WormQuest</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            © 2024 WormQuest. Built with OpenWorm data. Open-source education for all.
          </p>
          <div className="flex gap-4 text-sm font-medium">
            <Link to="/learn" className="hover:text-primary transition-colors">Learn</Link>
            <Link to="/play" className="hover:text-primary transition-colors">Play</Link>
            <Link to="/community" className="hover:text-primary transition-colors">Community</Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}