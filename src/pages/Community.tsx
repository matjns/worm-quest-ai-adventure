import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Users, Github, MessageCircle, Share2, Heart, ExternalLink, Code, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const communityStats = [
  { value: "15K+", label: "Community Members", icon: Users },
  { value: "1.2K", label: "Shared Simulations", icon: Share2 },
  { value: "300+", label: "Contributors", icon: Code },
  { value: "50+", label: "Research Papers", icon: BookOpen },
];

const featuredCreations = [
  {
    title: "Chemotaxis Navigator",
    author: "NeuronMaster42",
    likes: 342,
    description: "A neural pathway that mimics real C. elegans food-seeking behavior.",
  },
  {
    title: "Touch Response Circuit",
    author: "WormWhisperer",
    likes: 287,
    description: "Complete mechanosensory circuit with backward movement response.",
  },
  {
    title: "Learning Loop",
    author: "AIApprentice",
    likes: 198,
    description: "Reinforcement learning model trained on real worm behavior data.",
  },
];

const resources = [
  {
    title: "OpenWorm Documentation",
    url: "https://docs.openworm.org",
    description: "Complete technical documentation for the OpenWorm project.",
  },
  {
    title: "c302 Repository",
    url: "https://github.com/openworm/c302",
    description: "Framework for generating neural network models of C. elegans.",
  },
  {
    title: "Sibernetic",
    url: "https://github.com/openworm/sibernetic",
    description: "Physics simulation engine for the worm body.",
  },
  {
    title: "CElegansNeuroML",
    url: "https://github.com/openworm/CElegansNeuroML",
    description: "NeuroML models of the C. elegans connectome.",
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Join the <span className="text-primary">Community</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              WormQuest is powered by OpenWorm — a global, open-source community 
              building the world's first digital organism. Share, learn, and contribute.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {communityStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card border-2 border-foreground p-4 shadow-[2px_2px_0px_hsl(var(--foreground))]"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs font-mono text-muted-foreground uppercase">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured Creations */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-primary" />
              Featured Creations
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredCreations.map((creation, i) => (
                <motion.div
                  key={creation.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_hsl(var(--primary))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:border-primary transition-all"
                >
                  <h3 className="font-bold uppercase mb-1">{creation.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">by {creation.author}</p>
                  <p className="text-sm mb-4">{creation.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      {creation.likes}
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Resources */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
              <Github className="w-6 h-6 text-primary" />
              OpenWorm Resources
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((resource, i) => (
                <motion.a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-card border-2 border-foreground p-4 flex items-center gap-4 shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--primary))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:border-primary transition-all"
                >
                  <div className="w-12 h-12 bg-foreground flex items-center justify-center shrink-0">
                    <Code className="w-6 h-6 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold uppercase truncate">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 shrink-0" />
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* Join CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-foreground text-background p-8 text-center"
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-black uppercase mb-4">
              Ready to Contribute?
            </h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-6">
              Whether you're a student, teacher, researcher, or curious explorer — 
              there's a place for you in the OpenWorm community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/openworm" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-background text-background hover:bg-background hover:text-foreground"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
              </a>
              <a href="https://openworm.org/community" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-background text-background hover:bg-background hover:text-foreground"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </a>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}