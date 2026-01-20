import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Github, MessageCircle, Share2, Heart, ExternalLink, 
  Code, BookOpen, Plus, Sparkles, Copy, Check, LogIn, GitFork, Pencil, User, FolderOpen, Eye
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCommunity, SharedCircuit } from "@/hooks/useCommunity";
import { EditCircuitDialog } from "@/components/EditCircuitDialog";
import { CircuitFilters } from "@/components/CircuitFilters";
import { CircuitDetailModal } from "@/components/CircuitDetailModal";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const communityStats = [
  { value: "15K+", label: "Community Members", icon: Users },
  { value: "1.2K", label: "Shared Simulations", icon: Share2 },
  { value: "300+", label: "Contributors", icon: Code },
  { value: "50+", label: "Research Papers", icon: BookOpen },
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

function CircuitCard({ 
  circuit, 
  isLiked, 
  onLike,
  onGeneratePR,
  onFork,
  onUpdate,
  onDelete,
  onViewDetails,
  isOwnCircuit
}: { 
  circuit: SharedCircuit; 
  isLiked: boolean;
  onLike: () => void;
  onGeneratePR: () => void;
  onFork: () => void;
  onUpdate: (circuitId: string, updates: { title?: string; description?: string; tags?: string[] }) => Promise<{ error: unknown; data: unknown }>;
  onDelete: (circuitId: string) => Promise<{ error: unknown }>;
  onViewDetails: () => void;
  isOwnCircuit: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[6px_6px_0px_hsl(var(--primary))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:border-primary transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold uppercase">{circuit.title}</h3>
          <p className="text-sm text-muted-foreground">
            by {circuit.profiles?.display_name || "Anonymous"}
          </p>
        </div>
        {circuit.is_featured && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 font-arcade">
            ★ FEATURED
          </span>
        )}
      </div>
      
      <p className="text-sm mb-3 line-clamp-2">{circuit.description}</p>
      
      {/* Tags */}
      {circuit.tags && circuit.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {circuit.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="text-xs bg-muted px-2 py-0.5 rounded font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Neurons used */}
      <div className="text-xs text-muted-foreground mb-4">
        <span className="font-mono">Neurons: </span>
        {circuit.neurons_used.slice(0, 4).join(", ")}
        {circuit.neurons_used.length > 4 && ` +${circuit.neurons_used.length - 4} more`}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLike}
          className={isLiked ? "text-primary" : ""}
        >
          <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-primary" : ""}`} />
          {circuit.likes_count}
        </Button>
        
        <div className="flex gap-1">
          {isOwnCircuit && (
            <EditCircuitDialog circuit={circuit} onUpdate={onUpdate} onDelete={onDelete}>
              <Button variant="ghost" size="sm" title="Edit circuit">
                <Pencil className="w-4 h-4" />
              </Button>
            </EditCircuitDialog>
          )}
          {!isOwnCircuit && (
            <Button variant="ghost" size="sm" onClick={onFork} title="Fork this circuit">
              <GitFork className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onGeneratePR(); }} title="Contribute to OpenWorm">
            <Github className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewDetails} title="View details">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function GitHubPRDialog({ circuit, template }: { circuit: SharedCircuit; template: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    toast.success("PR template copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          Contribute to OpenWorm
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share your circuit with the OpenWorm community! Copy this PR template and submit it to the appropriate repository.
        </p>
        
        <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-auto max-h-64">
          <pre className="whitespace-pre-wrap">{template}</pre>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={copyToClipboard} variant="outline" className="flex-1">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Template"}
          </Button>
          <a 
            href="https://github.com/openworm/CElegansNeuroML/pulls" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="default">
              <Github className="w-4 h-4 mr-2" />
              Open GitHub
            </Button>
          </a>
        </div>
      </div>
    </DialogContent>
  );
}

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuth();
  const { 
    circuits, 
    featuredCircuits, 
    loading, 
    userLikes, 
    likeCircuit,
    shareCircuit,
    forkCircuit,
    updateCircuit,
    deleteCircuit,
    fetchComments,
    addComment,
    generateGitHubPRTemplate 
  } = useCommunity();
  
  const [selectedCircuit, setSelectedCircuit] = useState<SharedCircuit | null>(null);
  const [detailCircuit, setDetailCircuit] = useState<SharedCircuit | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [prTemplate, setPrTemplate] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPRDialog, setShowPRDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'featured' | 'my-creations'>('featured');
  const [filteredCircuits, setFilteredCircuits] = useState<SharedCircuit[]>([]);
  const [filteredMyCircuits, setFilteredMyCircuits] = useState<SharedCircuit[]>([]);
  const [shareForm, setShareForm] = useState({
    title: "",
    description: "",
    tags: "",
  });

  // Filter circuits for "My Creations" tab
  const myCircuits = useMemo(() => circuits.filter(c => c.user_id === user?.id), [circuits, user?.id]);

  // Display circuits (filtered or all)
  const displayCircuits = filteredCircuits.length > 0 || circuits.length === 0 
    ? filteredCircuits 
    : (featuredCircuits.length > 0 ? featuredCircuits : circuits.slice(0, 6));
  
  const displayMyCircuits = filteredMyCircuits.length > 0 || myCircuits.length === 0
    ? filteredMyCircuits
    : myCircuits;

  const handleGeneratePR = (circuit: SharedCircuit) => {
    const template = generateGitHubPRTemplate(circuit);
    setPrTemplate(template);
    setSelectedCircuit(circuit);
    setShowPRDialog(true);
  };

  const handleViewDetails = (circuit: SharedCircuit) => {
    setDetailCircuit(circuit);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(250_50%_4%)] relative">
      {/* Arcade pellet background */}
      <div className="fixed inset-0 pellet-bg opacity-20 pointer-events-none" />
      
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
              Join the <span className="text-primary text-neon-pink">Community</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              NeuroQuest is powered by OpenWorm — a global, open-source community 
              building the world's first digital organism. Share circuits, contribute code, and advance neuroscience.
            </p>

            {/* Auth CTA */}
            {!isAuthenticated && (
              <Link to="/auth">
                <Button variant="hero" size="lg" className="glow-neon-pink mb-8">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to Share & Contribute
                </Button>
              </Link>
            )}

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
                  <p className="text-2xl font-arcade text-accent">{stat.value}</p>
                  <p className="text-xs font-mono text-muted-foreground uppercase">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Circuits Section with Tabs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'featured' | 'my-creations')} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-card border-2 border-foreground">
                  <TabsTrigger value="featured" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Sparkles className="w-4 h-4" />
                    Featured
                  </TabsTrigger>
                  {isAuthenticated && (
                    <TabsTrigger value="my-creations" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <User className="w-4 h-4" />
                      My Creations
                      {myCircuits.length > 0 && (
                        <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                          {myCircuits.length}
                        </span>
                      )}
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {isAuthenticated && (
                  <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Share Your Circuit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Your Circuit</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={shareForm.title}
                            onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                            placeholder="Chemotaxis Navigator"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={shareForm.description}
                            onChange={(e) => setShareForm({ ...shareForm, description: e.target.value })}
                            placeholder="A neural pathway that mimics real C. elegans behavior..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Tags (comma separated)</label>
                          <Input
                            value={shareForm.tags}
                            onChange={(e) => setShareForm({ ...shareForm, tags: e.target.value })}
                            placeholder="chemotaxis, sensory, movement"
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={async () => {
                            await shareCircuit({
                              title: shareForm.title,
                              description: shareForm.description,
                              circuit_data: { neurons: [], connections: [] },
                              behavior: "custom",
                              neurons_used: [],
                              tags: shareForm.tags.split(",").map(t => t.trim()).filter(Boolean),
                            });
                            setShowShareDialog(false);
                            setShareForm({ title: "", description: "", tags: "" });
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Circuit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Featured Tab */}
              <TabsContent value="featured">
                {/* Search and Filter */}
                {circuits.length > 0 && (
                  <CircuitFilters
                    circuits={featuredCircuits.length > 0 ? featuredCircuits : circuits.slice(0, 6)}
                    onFilterChange={setFilteredCircuits}
                  />
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="loader mx-auto mb-4" />
                    <p className="text-muted-foreground font-arcade text-xs">Loading circuits...</p>
                  </div>
                ) : circuits.length === 0 ? (
                  <div className="text-center py-12 bg-card border-2 border-dashed border-muted rounded-lg">
                    <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold mb-2">No circuits shared yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share a circuit with the community!</p>
                    {isAuthenticated ? (
                      <Button onClick={() => setShowShareDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Share Your Circuit
                      </Button>
                    ) : (
                      <Link to="/auth">
                        <Button>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In to Share
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : displayCircuits.length === 0 ? (
                  <div className="text-center py-12 bg-card border-2 border-dashed border-muted rounded-lg">
                    <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold mb-2">No circuits match your filters</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {displayCircuits.map((circuit) => (
                      <div key={circuit.id}>
                        <CircuitCard
                          circuit={circuit}
                          isLiked={userLikes.has(circuit.id)}
                          onLike={() => likeCircuit(circuit.id)}
                          onGeneratePR={() => handleGeneratePR(circuit)}
                          onFork={() => forkCircuit(circuit.id)}
                          onUpdate={updateCircuit}
                          onDelete={deleteCircuit}
                          onViewDetails={() => handleViewDetails(circuit)}
                          isOwnCircuit={circuit.user_id === user?.id}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* My Creations Tab */}
              <TabsContent value="my-creations">
                {/* Search and Filter for My Creations */}
                {myCircuits.length > 0 && (
                  <CircuitFilters
                    circuits={myCircuits}
                    onFilterChange={setFilteredMyCircuits}
                  />
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="loader mx-auto mb-4" />
                    <p className="text-muted-foreground font-arcade text-xs">Loading your creations...</p>
                  </div>
                ) : myCircuits.length === 0 ? (
                  <div className="text-center py-12 bg-card border-2 border-dashed border-muted rounded-lg">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold mb-2">No creations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Share a circuit from the Sandbox or fork one from the community!
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setShowShareDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Share Your First Circuit
                      </Button>
                      <Button variant="outline" onClick={() => setActiveTab('featured')}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Browse Featured
                      </Button>
                    </div>
                  </div>
                ) : displayMyCircuits.length === 0 ? (
                  <div className="text-center py-12 bg-card border-2 border-dashed border-muted rounded-lg">
                    <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-bold mb-2">No circuits match your filters</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Showing {displayMyCircuits.length} of {myCircuits.length} creation{myCircuits.length !== 1 ? 's' : ''}</span>
                      <span>
                        Total likes: {myCircuits.reduce((sum, c) => sum + (c.likes_count || 0), 0)}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      {displayMyCircuits.map((circuit) => (
                        <div key={circuit.id}>
                          <CircuitCard
                            circuit={circuit}
                            isLiked={userLikes.has(circuit.id)}
                            onLike={() => likeCircuit(circuit.id)}
                            onGeneratePR={() => handleGeneratePR(circuit)}
                            onFork={() => forkCircuit(circuit.id)}
                            onUpdate={updateCircuit}
                            onDelete={deleteCircuit}
                            onViewDetails={() => handleViewDetails(circuit)}
                            isOwnCircuit={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.section>

          {/* GitHub Contribution Guide */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16 bg-card border-3 border-foreground rounded-lg shadow-[6px_6px_0px_hsl(var(--foreground))] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary via-accent to-primary p-4">
              <h2 className="text-xl font-bold uppercase text-primary-foreground flex items-center gap-2">
                <Github className="w-6 h-6" />
                Contribute to OpenWorm via GitHub
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Your circuits can become part of the official OpenWorm project! Here's how:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Build and test your circuit in NeuroQuest</li>
                <li>Click "Contribute to OpenWorm" to generate a PR template</li>
                <li>Fork the appropriate OpenWorm repository on GitHub</li>
                <li>Submit a Pull Request with your circuit data</li>
                <li>The OpenWorm team will review and potentially merge your contribution</li>
              </ol>
              <div className="flex gap-2 pt-4">
                <a href="https://github.com/openworm" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Github className="w-4 h-4 mr-2" />
                    OpenWorm GitHub
                  </Button>
                </a>
                <a href="https://docs.openworm.org/contributing" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Contribution Guide
                  </Button>
                </a>
              </div>
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
              <Code className="w-6 h-6 text-primary" />
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
            className="bg-foreground text-background p-8 text-center rounded-lg"
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
                  className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-foreground"
                >
                  <Github className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
              </a>
              <a href="https://openworm.org/community" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-foreground"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </a>
            </div>
          </motion.section>
        </div>
      </main>

      {/* PR Dialog */}
      <Dialog open={showPRDialog} onOpenChange={setShowPRDialog}>
        {selectedCircuit && (
          <GitHubPRDialog circuit={selectedCircuit} template={prTemplate} />
        )}
      </Dialog>

      {/* Circuit Detail Modal */}
      <CircuitDetailModal
        circuit={detailCircuit}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        isLiked={detailCircuit ? userLikes.has(detailCircuit.id) : false}
        onLike={() => detailCircuit && likeCircuit(detailCircuit.id)}
        onFork={() => detailCircuit && forkCircuit(detailCircuit.id)}
        onGeneratePR={() => detailCircuit && handleGeneratePR(detailCircuit)}
        fetchComments={fetchComments}
        addComment={addComment}
      />
    </div>
  );
}
