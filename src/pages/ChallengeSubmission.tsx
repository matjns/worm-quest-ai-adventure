import { Header } from "@/components/Header";
import { ChallengeSubmissionReport } from "@/components/ChallengeSubmissionReport";
import { ChallengeShowcase } from "@/components/ChallengeShowcase";
import { motion } from "framer-motion";
import { Award, Flag, Rocket, Brain, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function ChallengeSubmission() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-chart-1/20 text-chart-1 px-4 py-2 rounded-full mb-4">
            <Flag className="w-4 h-4" />
            <span className="font-bold text-sm uppercase">Presidential AI Challenge 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Track III: <span className="text-primary">Innovative Teaching</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            NeuroQuest leverages C. elegans neuroscience and AI to create an unprecedented 
            educational experience — impossible without artificial intelligence.
          </p>
        </motion.div>

        {/* Ironic Tagline */}
        <Card className="border-2 border-accent bg-accent/10 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="text-4xl">🐛</span>
              <p className="text-lg font-medium text-center">
                <span className="text-accent font-bold">302 neurons.</span>{" "}
                <span className="text-muted-foreground">One tiny worm.</span>{" "}
                <span className="text-primary font-bold">Infinite lessons in exponential innovation.</span>
              </p>
              <span className="text-4xl">🧠</span>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2 italic">
              "A nematode schooling humanity in the art of neural networks — 
              who says AI can't have a sense of humor?"
            </p>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link to="/neuroquest">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Rocket className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold">Play Game</h3>
                <p className="text-xs text-muted-foreground">Try the missions</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/education">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Brain className="w-8 h-8 mx-auto mb-2 text-accent" />
                <h3 className="font-bold">Education Hub</h3>
                <p className="text-xs text-muted-foreground">Browse modules</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/teacher">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-chart-2" />
                <h3 className="font-bold">Teacher Tools</h3>
                <p className="text-xs text-muted-foreground">AI classroom</p>
              </CardContent>
            </Card>
          </Link>
          <a href="https://openworm.org" target="_blank" rel="noopener noreferrer">
            <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 text-center">
                <ExternalLink className="w-8 h-8 mx-auto mb-2 text-chart-3" />
                <h3 className="font-bold">OpenWorm</h3>
                <p className="text-xs text-muted-foreground">Our data source</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Criteria Showcase */}
        <div className="mb-8">
          <ChallengeShowcase />
        </div>

        {/* Downloadable Report */}
        <ChallengeSubmissionReport />

        {/* American AI Dominance Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-lg">
            <span className="text-2xl">🇺🇸</span>
            <span className="font-bold">
              Propelling American AI Dominance — One Worm at a Time
            </span>
            <Brain className="w-5 h-5" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
