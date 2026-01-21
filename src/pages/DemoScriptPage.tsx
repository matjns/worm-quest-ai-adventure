import { Header } from "@/components/Header";
import { DemoScript } from "@/components/DemoScript";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function DemoScriptPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back button */}
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              White House AI Challenge
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Track III(b) Demo Script 🎬
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete 4-minute presentation guide covering all WormQuest features, 
              with rubric alignment and demo checkpoints.
            </p>
          </motion.div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-3 justify-center mb-8"
          >
            <Button variant="outline" asChild>
              <a href="https://worm-quest-ai-adventure.lovable.app" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Published App
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/play">
                Try Demo Flow
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin">
                View Analytics
              </Link>
            </Button>
          </motion.div>

          {/* Demo Script Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DemoScript />
          </motion.div>

          {/* Additional resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid md:grid-cols-3 gap-4"
          >
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold mb-2">📊 Key Metrics</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 302 neurons, 7,000+ connections</li>
                <li>• 4 age-adaptive game modes</li>
                <li>• 98% AI accuracy target</li>
                <li>• 95% retention goal</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold mb-2">🎯 Rubric Highlights</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• National importance ✓</li>
                <li>• AI integration ✓</li>
                <li>• Accessibility (WCAG) ✓</li>
                <li>• Open source contribution ✓</li>
              </ul>
            </div>
            
            <div className="bg-card rounded-xl border p-4">
              <h3 className="font-semibold mb-2">🔗 Resources</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <a href="https://openworm.org" target="_blank" rel="noopener" className="text-primary hover:underline">
                    OpenWorm Project
                  </a>
                </li>
                <li>
                  <a href="https://github.com/openworm" target="_blank" rel="noopener" className="text-primary hover:underline">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <Link to="/research" className="text-primary hover:underline">
                    Research Portal
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
