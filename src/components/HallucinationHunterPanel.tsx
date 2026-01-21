import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Brain, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  Crosshair, 
  Gauge, 
  Lightbulb, 
  Play, 
  RefreshCw, 
  Shield, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Trophy, 
  Zap 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useHallucinationHunter, CircuitBuild, HallucinationResult } from '@/hooks/useHallucinationHunter';
import { cn } from '@/lib/utils';

interface HallucinationHunterPanelProps {
  circuitBuild?: CircuitBuild;
  onOptimizationApply?: (build: CircuitBuild) => void;
  className?: string;
}

const MASTERY_COLORS = {
  novice: 'bg-muted text-muted-foreground',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  expert: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const MASTERY_ICONS = {
  novice: Brain,
  intermediate: Target,
  advanced: Sparkles,
  expert: Trophy,
};

const SEVERITY_COLORS = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function HallucinationHunterPanel({ 
  circuitBuild, 
  onOptimizationApply,
  className 
}: HallucinationHunterPanelProps) {
  const { 
    analyzeCircuit, 
    applyOptimization, 
    runAutoIteration,
    isAnalyzing, 
    result, 
    iterationHistory,
    reset 
  } = useHallucinationHunter();
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    accuracy: true,
    hallucinations: false,
    optimizations: false,
    mastery: false,
    iterations: false,
  });

  const [isAutoIterating, setIsAutoIterating] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAnalyze = async () => {
    if (!circuitBuild) return;
    await analyzeCircuit(circuitBuild);
  };

  const handleAutoIterate = async () => {
    if (!circuitBuild) return;
    setIsAutoIterating(true);
    try {
      const { finalBuild } = await runAutoIteration(circuitBuild, 3);
      onOptimizationApply?.(finalBuild);
    } finally {
      setIsAutoIterating(false);
    }
  };

  const handleApplyOptimization = (optimization: HallucinationResult['optimizations'][0]) => {
    if (!circuitBuild) return;
    const newBuild = applyOptimization(circuitBuild, optimization);
    onOptimizationApply?.(newBuild);
  };

  const getAccuracyColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-destructive';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  return (
    <Card className={cn("border-border/50 bg-card/95 backdrop-blur", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Crosshair className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Hallucination Hunter</CardTitle>
              <CardDescription>Ensemble validation & auto-iteration</CardDescription>
            </div>
          </div>
          {result && (
            <Badge 
              variant={result.passesValidation ? "default" : "destructive"}
              className="gap-1"
            >
              {result.passesValidation ? (
                <><CheckCircle2 className="w-3 h-3" /> Validated</>
              ) : (
                <><AlertTriangle className="w-3 h-3" /> Issues Found</>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleAnalyze} 
            disabled={!circuitBuild || isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Gauge className="w-4 h-4 mr-2" /> Analyze Circuit</>
            )}
          </Button>
          <Button 
            variant="secondary"
            onClick={handleAutoIterate}
            disabled={!circuitBuild || isAutoIterating || isAnalyzing}
          >
            {isAutoIterating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <><Zap className="w-4 h-4 mr-1" /> Auto-Fix</>
            )}
          </Button>
          {result && (
            <Button variant="ghost" size="icon" onClick={reset}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Overall Accuracy Score */}
              <Collapsible 
                open={expandedSections.accuracy} 
                onOpenChange={() => toggleSection('accuracy')}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-primary" />
                      <span className="font-medium">Ensemble Accuracy</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-2xl font-bold", getAccuracyColor(result.accuracy.overall))}>
                        {result.accuracy.overall}%
                      </span>
                      {expandedSections.accuracy ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 space-y-3 px-1"
                  >
                    {Object.entries(result.accuracy.byDimension).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize text-muted-foreground">{key}</span>
                          <span className={getAccuracyColor(value)}>{value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={cn("h-full rounded-full", getProgressColor(value))}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Confidence: {(result.accuracy.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>

              {/* Hallucination Flags */}
              {result.hallucinations.flags.length > 0 && (
                <Collapsible 
                  open={expandedSections.hallucinations} 
                  onOpenChange={() => toggleSection('hallucinations')}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 hover:bg-destructive/15 cursor-pointer transition-colors border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-medium text-destructive">Hallucination Flags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{result.hallucinations.flags.length}</Badge>
                        {expandedSections.hallucinations ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 space-y-2"
                    >
                      {result.hallucinations.flags.map((flag, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "p-3 rounded-lg border",
                            SEVERITY_COLORS[flag.severity]
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{flag.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {flag.evidence || flag.description}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Optimization Suggestions */}
              {result.optimizations && result.optimizations.length > 0 && (
                <Collapsible 
                  open={expandedSections.optimizations} 
                  onOpenChange={() => toggleSection('optimizations')}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/15 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <span className="font-medium">Optimization Suggestions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{result.optimizations.length}</Badge>
                        {expandedSections.optimizations ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 space-y-2"
                    >
                      {result.optimizations.map((opt, idx) => (
                        <div 
                          key={idx}
                          className="p-3 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {opt.type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Priority: {opt.priority}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{opt.target}</p>
                              <p className="text-xs text-muted-foreground mt-1">{opt.reason}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleApplyOptimization(opt)}
                            >
                              <Play className="w-3 h-3 mr-1" /> Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Iteration Plan */}
              {result.iteration.plan.length > 0 && (
                <Collapsible 
                  open={expandedSections.iterations} 
                  onOpenChange={() => toggleSection('iterations')}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-medium">Iteration Plan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {result.iteration.suggestedIterations} iterations
                        </span>
                        {expandedSections.iterations ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 space-y-2"
                    >
                      {result.iteration.plan.map((step, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{step.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <TrendingUp className="w-3 h-3 text-green-400" />
                              <span className="text-xs text-green-400">
                                +{step.expectedImprovement}% expected
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Mastery Level */}
              <Collapsible 
                open={expandedSections.mastery} 
                onOpenChange={() => toggleSection('mastery')}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = MASTERY_ICONS[result.mastery.currentLevel];
                        return <Icon className="w-4 h-4 text-primary" />;
                      })()}
                      <span className="font-medium">Mastery Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("capitalize", MASTERY_COLORS[result.mastery.currentLevel])}>
                        {result.mastery.currentLevel}
                      </Badge>
                      {expandedSections.mastery ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 space-y-3 px-1"
                  >
                    <div>
                      <span className="text-xs text-muted-foreground">Next Milestone</span>
                      <p className="text-sm font-medium mt-1">{result.mastery.nextMilestone}</p>
                    </div>
                    {result.mastery.skillsToImprove.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Skills to Improve</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.mastery.skillsToImprove.map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>

              {/* AI Insight */}
              {result.insight && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">{result.insight}</p>
                  </div>
                </div>
              )}

              {/* Iteration History */}
              {iterationHistory.length > 1 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-medium">Iteration History</span>
                    <div className="flex items-center gap-2">
                      {iterationHistory.map((hist, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            hist.passesValidation 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-muted text-muted-foreground"
                          )}
                          title={`Iteration ${idx + 1}: ${hist.accuracy.overall}%`}
                        >
                          {hist.accuracy.overall}
                        </div>
                      ))}
                      <TrendingUp className="w-4 h-4 text-muted-foreground ml-1" />
                    </div>
                  </div>
                </>
              )}

              {/* Structural Info */}
              {result.structural.missingNeurons.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Missing neurons: </span>
                  {result.structural.missingNeurons.slice(0, 5).join(', ')}
                  {result.structural.missingNeurons.length > 5 && 
                    ` (+${result.structural.missingNeurons.length - 5} more)`}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!result && !isAnalyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <Crosshair className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Analyze your circuit to detect hallucinations</p>
            <p className="text-xs mt-1">and get AI-powered optimization suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
