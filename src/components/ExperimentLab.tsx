import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, 
  Plus, 
  Play, 
  BarChart3, 
  Lightbulb, 
  CheckCircle2, 
  Copy, 
  Trash2,
  ChevronRight,
  Beaker,
  Brain,
  Target,
  Sparkles,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExperimentation, SimulationVariant } from "@/hooks/useExperimentation";
import { cn } from "@/lib/utils";

interface ExperimentLabProps {
  className?: string;
  onRunSimulation?: (variant: SimulationVariant) => void;
}

export function ExperimentLab({ className, onRunSimulation }: ExperimentLabProps) {
  const {
    variants,
    isAnalyzing,
    currentAnalysis,
    currentSuggestion,
    currentComparison,
    currentValidation,
    createVariant,
    analyzeVariant,
    getSuggestion,
    compareVariants,
    validateExperiment,
    deleteVariant,
    duplicateVariant,
  } = useExperimentation();

  const [activeTab, setActiveTab] = useState("variants");
  const [newVariantName, setNewVariantName] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<SimulationVariant | null>(null);
  const [targetBehavior, setTargetBehavior] = useState("Forward locomotion");
  const [userFeedback, setUserFeedback] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateVariant = () => {
    if (!newVariantName.trim()) return;
    
    // Default starting configuration
    const defaultConnections = [
      { from: "ASEL", to: "AIYL", weight: 0.8 },
      { from: "AIYL", to: "SMBD", weight: 0.7 },
    ];
    const defaultNeurons = ["ASEL", "AIYL", "SMBD"];
    
    const variant = createVariant(newVariantName, defaultConnections, defaultNeurons);
    setSelectedVariant(variant);
    setNewVariantName("");
    setShowCreateForm(false);
  };

  const handleAnalyze = async () => {
    if (!selectedVariant) return;
    await analyzeVariant(selectedVariant, targetBehavior);
  };

  const handleGetSuggestion = async () => {
    if (!selectedVariant) return;
    await getSuggestion(selectedVariant, targetBehavior, userFeedback);
  };

  const handleCompare = async () => {
    if (variants.length < 2) return;
    await compareVariants(variants, targetBehavior);
  };

  const handleValidate = async () => {
    if (!selectedVariant) return;
    await validateExperiment(selectedVariant, targetBehavior, userFeedback);
  };

  const handleApplySuggestion = () => {
    if (!currentSuggestion?.suggestedVariant) return;
    
    const suggested = currentSuggestion.suggestedVariant;
    const variant = createVariant(
      suggested.name,
      suggested.connections,
      suggested.connections.flatMap(c => [c.from, c.to]).filter((v, i, a) => a.indexOf(v) === i)
    );
    setSelectedVariant(variant);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Experiment Lab</h2>
            <p className="text-muted-foreground">Test variants, get AI insights, iterate</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Variant
        </Button>
      </div>

      {/* Target Behavior */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Target className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm font-medium">Target Behavior</label>
              <Input
                value={targetBehavior}
                onChange={(e) => setTargetBehavior(e.target.value)}
                placeholder="e.g., Forward locomotion, Chemotaxis toward salt..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="variants" className="gap-2">
            <Beaker className="w-4 h-4" />
            Variants ({variants.length})
          </TabsTrigger>
          <TabsTrigger value="analyze" className="gap-2">
            <Brain className="w-4 h-4" />
            Analyze
          </TabsTrigger>
          <TabsTrigger value="suggest" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggest
          </TabsTrigger>
          <TabsTrigger value="validate" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Validate
          </TabsTrigger>
        </TabsList>

        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-4">
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-primary">
                  <CardContent className="pt-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Variant name (e.g., 'High-weight AIYL')"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateVariant()}
                      />
                      <Button onClick={handleCreateVariant}>Create</Button>
                      <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {variants.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No variants yet</h3>
                <p className="text-muted-foreground mb-4">Create your first experiment variant to start testing</p>
                <Button onClick={() => setShowCreateForm(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Variant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {variants.map((variant) => (
                <motion.div key={variant.id} layout>
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary",
                      selectedVariant?.id === variant.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Beaker className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{variant.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {variant.neurons.length} neurons • {variant.connections.length} connections
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {(variant.successRate * 100).toFixed(0)}%
                              </span>
                              <Progress value={variant.successRate * 100} className="w-20 h-2" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {variant.testCount} tests
                            </p>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRunSimulation?.(variant);
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateVariant(variant.id, `${variant.name} (copy)`);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteVariant(variant.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {variants.length >= 2 && (
            <Button variant="outline" onClick={handleCompare} disabled={isAnalyzing} className="w-full gap-2">
              <BarChart3 className="w-4 h-4" />
              Compare All Variants
            </Button>
          )}

          {currentComparison && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <BarChart3 className="w-5 h-5" />
                  Comparison Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentComparison.bestVariant && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">Best</Badge>
                    <span className="font-semibold">{currentComparison.bestVariant}</span>
                  </div>
                )}
                
                {currentComparison.patterns && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-400 mb-2">Success Factors</h5>
                      <ul className="space-y-1">
                        {currentComparison.patterns.successFactors?.map((factor, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-400 mb-2">Failure Factors</h5>
                      <ul className="space-y-1">
                        {currentComparison.patterns.failureFactors?.map((factor, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {currentComparison.nextSteps && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Recommended Next Steps</h5>
                    <ul className="space-y-1">
                      {currentComparison.nextSteps.map((step, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-4">
          {!selectedVariant ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a variant from the Variants tab to analyze</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Beaker className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{selectedVariant.name}</span>
                    </div>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {currentAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-purple-500/50 bg-purple-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        AI Analysis
                        {currentAnalysis.confidenceScore && (
                          <Badge variant="outline" className="ml-auto">
                            {(currentAnalysis.confidenceScore * 100).toFixed(0)}% confidence
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentAnalysis.assessment && (
                        <p className="text-sm">{currentAnalysis.assessment}</p>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {currentAnalysis.strengths && (
                          <div>
                            <h5 className="text-sm font-medium text-green-400 mb-2">Strengths</h5>
                            <ul className="space-y-1">
                              {currentAnalysis.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {currentAnalysis.weaknesses && (
                          <div>
                            <h5 className="text-sm font-medium text-red-400 mb-2">Weaknesses</h5>
                            <ul className="space-y-1">
                              {currentAnalysis.weaknesses.map((w, i) => (
                                <li key={i} className="text-sm text-muted-foreground">• {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {currentAnalysis.suggestions && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Suggestions</h5>
                          <div className="space-y-2">
                            {currentAnalysis.suggestions.map((s, i) => (
                              <div key={i} className="p-3 rounded-lg bg-background border">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{s.type}</Badge>
                                </div>
                                <p className="text-sm">{s.details}</p>
                                <p className="text-xs text-muted-foreground mt-1">{s.rationale}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentAnalysis.scientificInsight && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <h5 className="text-sm font-medium text-blue-400 mb-1">Scientific Insight</h5>
                          <p className="text-sm">{currentAnalysis.scientificInsight}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </TabsContent>

        {/* Suggest Tab */}
        <TabsContent value="suggest" className="space-y-4">
          {!selectedVariant ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a variant to get AI suggestions for improvements</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Beaker className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Improving: {selectedVariant.name}</span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Your Observations (optional)</label>
                    <Textarea
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      placeholder="Describe what you've noticed, what's working or not working..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={handleGetSuggestion} disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? "Getting Suggestions..." : "Get AI Suggestions"}
                  </Button>
                </CardContent>
              </Card>

              {currentSuggestion?.suggestedVariant && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        Suggested Next Variant
                        {currentSuggestion.estimatedImprovement && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "ml-auto",
                              currentSuggestion.estimatedImprovement === "high" && "text-green-400 border-green-400",
                              currentSuggestion.estimatedImprovement === "medium" && "text-amber-400 border-amber-400",
                              currentSuggestion.estimatedImprovement === "low" && "text-muted-foreground"
                            )}
                          >
                            {currentSuggestion.estimatedImprovement} improvement
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-lg">{currentSuggestion.suggestedVariant.name}</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentSuggestion.suggestedVariant.hypothesis}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Changes from current</h5>
                        <ul className="space-y-1">
                          {currentSuggestion.suggestedVariant.changes.map((change, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <p className="text-sm italic text-muted-foreground">
                        {currentSuggestion.suggestedVariant.rationale}
                      </p>
                      
                      <Button onClick={handleApplySuggestion} className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        Create This Variant
                      </Button>
                    </CardContent>
                  </Card>

                  {currentSuggestion.alternativeVariants && currentSuggestion.alternativeVariants.length > 0 && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-sm">Alternative Ideas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentSuggestion.alternativeVariants.map((alt, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <h6 className="font-medium">{alt.name}</h6>
                            <p className="text-xs text-muted-foreground mt-1">{alt.rationale}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </>
          )}
        </TabsContent>

        {/* Validate Tab */}
        <TabsContent value="validate" className="space-y-4">
          {!selectedVariant ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a variant to validate for challenge submission</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Beaker className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Validating: {selectedVariant.name}</span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Your Observations</label>
                    <Textarea
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      placeholder="Describe the experiment results, what behavior you observed..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={handleValidate} disabled={isAnalyzing} className="w-full">
                    {isAnalyzing ? "Validating..." : "Validate for Submission"}
                  </Button>
                </CardContent>
              </Card>

              {currentValidation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={cn(
                    "border-2",
                    currentValidation.readyForSubmission 
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-amber-500/50 bg-amber-500/5"
                  )}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {currentValidation.readyForSubmission ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                        Validation Results
                        {currentValidation.validationScore !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "ml-auto",
                              currentValidation.validationScore >= 0.8 && "text-green-400 border-green-400",
                              currentValidation.validationScore >= 0.5 && currentValidation.validationScore < 0.8 && "text-amber-400 border-amber-400",
                              currentValidation.validationScore < 0.5 && "text-red-400 border-red-400"
                            )}
                          >
                            {(currentValidation.validationScore * 100).toFixed(0)}% valid
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentValidation.alignmentWithBiology && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <h5 className="text-sm font-medium text-blue-400 mb-1">Biological Alignment</h5>
                          <p className="text-sm">{currentValidation.alignmentWithBiology}</p>
                        </div>
                      )}
                      
                      {currentValidation.concerns && currentValidation.concerns.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-amber-400 mb-2">Concerns</h5>
                          <ul className="space-y-1">
                            {currentValidation.concerns.map((c, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {currentValidation.suggestions && currentValidation.suggestions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Suggestions for Improvement</h5>
                          <ul className="space-y-1">
                            {currentValidation.suggestions.map((s, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {currentValidation.submissionNotes && (
                        <div className={cn(
                          "p-3 rounded-lg border",
                          currentValidation.readyForSubmission 
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-amber-500/10 border-amber-500/20"
                        )}>
                          <h5 className="text-sm font-medium mb-1">Submission Notes</h5>
                          <p className="text-sm">{currentValidation.submissionNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
