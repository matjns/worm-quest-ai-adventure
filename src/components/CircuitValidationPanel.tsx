import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  validateCircuit,
  getPathwaySuggestions,
  getRecommendedConnections,
  type ValidationResult,
  type PlacedNeuronForValidation,
  type ConnectionForValidation,
} from "@/utils/circuitValidation";
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Trophy,
  Target,
  Brain,
  Zap,
  Sparkles,
  TrendingUp,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CircuitValidationPanelProps {
  neurons: PlacedNeuronForValidation[];
  connections: ConnectionForValidation[];
  onAddConnection?: (from: string, to: string, weight: number) => void;
  className?: string;
}

export function CircuitValidationPanel({
  neurons,
  connections,
  onAddConnection,
  className,
}: CircuitValidationPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Auto-validate on changes
  useEffect(() => {
    if (neurons.length > 0 || connections.length > 0) {
      const timeoutId = setTimeout(() => {
        setIsValidating(true);
        const result = validateCircuit(neurons, connections);
        setValidationResult(result);
        setIsValidating(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setValidationResult(null);
    }
  }, [neurons, connections]);

  const neuronIds = neurons.map(n => n.id);
  const pathwaySuggestions = getPathwaySuggestions(neuronIds);
  const recommendedConnections = getRecommendedConnections(neuronIds, connections);

  const getGradeColor = (grade: ValidationResult["grade"]) => {
    switch (grade) {
      case "A+":
      case "A":
        return "text-green-500";
      case "B":
        return "text-blue-500";
      case "C":
        return "text-yellow-500";
      case "D":
        return "text-orange-500";
      case "F":
        return "text-red-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (neurons.length === 0 && connections.length === 0) {
    return (
      <Card className={cn("border-2 border-dashed", className)}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Add neurons to see validation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          OpenWorm Validation
          {isValidating && (
            <Badge variant="secondary" className="ml-auto text-xs animate-pulse">
              Validating...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {validationResult && (
          <>
            {/* Overall Score */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div
                className={cn(
                  "text-3xl font-black",
                  getGradeColor(validationResult.grade)
                )}
              >
                {validationResult.grade}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Overall Score</span>
                  <span className="text-sm font-bold">{validationResult.overallScore}%</span>
                </div>
                <Progress
                  value={validationResult.overallScore}
                  className={cn("h-2", getScoreColor(validationResult.overallScore))}
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-muted/20 rounded-lg text-center">
                <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">{validationResult.accuracyScore}%</div>
                <div className="text-[10px] text-muted-foreground">Accuracy</div>
              </div>
              <div className="p-2 bg-muted/20 rounded-lg text-center">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">{validationResult.completenessScore}%</div>
                <div className="text-[10px] text-muted-foreground">Complete</div>
              </div>
              <div className="p-2 bg-muted/20 rounded-lg text-center">
                <Brain className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">{validationResult.pathwayScore}%</div>
                <div className="text-[10px] text-muted-foreground">Pathway</div>
              </div>
            </div>

            {/* Badges */}
            {validationResult.badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {validationResult.badges.map((badge, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] gap-1"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Feedback */}
            <div className="space-y-1.5">
              {validationResult.feedback.map((fb, i) => (
                <div
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="leading-tight">{fb}</span>
                </div>
              ))}
            </div>

            {/* Detailed Validation */}
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                  {showDetails ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  Scientific Details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-32 mt-2">
                  <div className="space-y-3 pr-2">
                    {/* Correct Connections */}
                    {validationResult.scientificValidation.correctConnections.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Matches OpenWorm ({validationResult.scientificValidation.correctConnections.length})
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {validationResult.scientificValidation.correctConnections.slice(0, 8).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-green-500/30">
                              {c}
                            </Badge>
                          ))}
                          {validationResult.scientificValidation.correctConnections.length > 8 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{validationResult.scientificValidation.correctConnections.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Missing Connections */}
                    {validationResult.scientificValidation.missingConnections.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-yellow-600 flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          Missing ({validationResult.scientificValidation.missingConnections.length})
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {validationResult.scientificValidation.missingConnections.slice(0, 6).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-yellow-500/30">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra Connections */}
                    {validationResult.scientificValidation.extraConnections.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-red-600 flex items-center gap-1 mb-1">
                          <XCircle className="w-3 h-3" />
                          Non-Reference ({validationResult.scientificValidation.extraConnections.length})
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {validationResult.scientificValidation.extraConnections.slice(0, 6).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-red-500/30">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Recommendations */}
        {(recommendedConnections.length > 0 || pathwaySuggestions.length > 0) && (
          <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                <Lightbulb className="w-3 h-3 text-yellow-500" />
                {showSuggestions ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                Smart Suggestions ({recommendedConnections.length + pathwaySuggestions.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 mt-2">
                {/* Recommended Connections */}
                {recommendedConnections.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      Recommended Connections
                    </h5>
                    <div className="space-y-1">
                      {recommendedConnections.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 bg-muted/20 rounded text-xs"
                        >
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1">
                              {rec.from} → {rec.to}
                            </Badge>
                            <span className="text-muted-foreground">w={rec.weight}</span>
                          </div>
                          {onAddConnection && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1.5 text-[10px]"
                              onClick={() => onAddConnection(rec.from, rec.to, rec.weight)}
                            >
                              Add
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pathway Suggestions */}
                {pathwaySuggestions.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      Complete These Pathways
                    </h5>
                    <div className="space-y-2">
                      {pathwaySuggestions.map((sug, i) => (
                        <div
                          key={i}
                          className="p-2 bg-muted/20 rounded text-xs"
                        >
                          <div className="font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-primary" />
                            {sug.pathwayName}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-[10px]">
                            Add: {sug.missingNeurons.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
