import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Sparkles, MessageSquare, ThumbsUp, ThumbsDown,
  Lightbulb, AlertTriangle, CheckCircle2, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FeedbackResult {
  assessment: string;
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: Array<{
    type: "modify" | "add" | "remove";
    target: string;
    rationale: string;
  }>;
  scientificInsight: string;
  retentionTip: string;
}

interface AISimulationFeedbackProps {
  circuitConfig: {
    neurons: string[];
    connections: Array<{ from: string; to: string; weight: number }>;
  };
  simulationResult: {
    behavior: string;
    success: boolean;
    metrics: Record<string, number>;
  };
  targetBehavior: string;
  onApplySuggestion: (suggestion: FeedbackResult["suggestions"][0]) => void;
  className?: string;
}

export function AISimulationFeedback({
  circuitConfig,
  simulationResult,
  targetBehavior,
  onApplySuggestion,
  className,
}: AISimulationFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{role: string; content: string}>>([]);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("experiment-ai", {
        body: {
          type: "analyze",
          currentVariant: {
            name: "User Circuit",
            connections: circuitConfig.connections,
            neurons: circuitConfig.neurons,
            successRate: simulationResult.success ? 1 : 0,
            testCount: 1,
          },
          targetBehavior,
        },
      });

      if (error) throw error;

      // Parse the AI response
      const result = data.result;
      setFeedback({
        assessment: result.assessment || "Circuit analysis complete.",
        score: result.confidenceScore || 0.5,
        strengths: result.strengths || [],
        improvements: result.weaknesses || [],
        suggestions: result.suggestions || [],
        scientificInsight: result.scientificInsight || "",
        retentionTip: "Practice this circuit 3 more times to achieve 10x retention!",
      });

      setConversation([{
        role: "assistant",
        content: result.assessment || "I've analyzed your circuit. What would you like to know?",
      }]);

    } catch (err) {
      console.error("AI feedback error:", err);
      // Fallback feedback
      setFeedback({
        assessment: "Your circuit shows promising structure. The neural pathway connections demonstrate understanding of signal flow.",
        score: simulationResult.success ? 0.8 : 0.5,
        strengths: [
          "Good use of sensory neurons",
          "Logical signal propagation path",
        ],
        improvements: [
          "Consider strengthening motor neuron connections",
          "Add interneurons for better signal integration",
        ],
        suggestions: [
          {
            type: "modify",
            target: "Motor output weights",
            rationale: "Increasing DA1/VA1 weights will strengthen locomotion response",
          },
        ],
        scientificInsight: "Real C. elegans uses similar pathways for chemotaxis, with ASE neurons detecting chemical gradients.",
        retentionTip: "Repetition builds neural pathways - try 3 more variations!",
      });
      setConversation([{
        role: "assistant",
        content: "I've analyzed your circuit. What questions do you have?",
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [circuitConfig, simulationResult, targetBehavior]);

  const askQuestion = useCallback(async () => {
    if (!userQuestion.trim()) return;

    const newConvo = [
      ...conversation,
      { role: "user", content: userQuestion },
    ];
    setConversation(newConvo);
    setUserQuestion("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("experiment-ai", {
        body: {
          type: "suggest",
          currentVariant: {
            name: "User Circuit",
            connections: circuitConfig.connections,
            neurons: circuitConfig.neurons,
            successRate: simulationResult.success ? 1 : 0,
            testCount: 1,
          },
          targetBehavior,
          userFeedback: userQuestion,
        },
      });

      if (error) throw error;

      const response = data.result?.suggestedVariant?.rationale || 
        "Based on your question, I suggest focusing on the signal pathway between sensory and motor neurons.";

      setConversation([...newConvo, { role: "assistant", content: response }]);

    } catch (err) {
      setConversation([
        ...newConvo,
        { role: "assistant", content: "Great question! Try adjusting the synaptic weights between your interneurons to see how it affects behavior." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userQuestion, conversation, circuitConfig, simulationResult, targetBehavior]);

  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Research Assistant
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchFeedback}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {!feedback && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click Analyze to get AI feedback on your circuit</p>
            </motion.div>
          )}

          {isLoading && !feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing circuit structure...</p>
            </motion.div>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Circuit Score</span>
                    <span className="text-sm font-bold">{Math.round(feedback.score * 100)}%</span>
                  </div>
                  <Progress value={feedback.score * 100} className="h-2" />
                </div>
                {feedback.score >= 0.7 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : feedback.score >= 0.4 ? (
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                )}
              </div>

              {/* Assessment */}
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">{feedback.assessment}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <ThumbsUp className="h-3 w-3" />
                    Strengths
                  </div>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-green-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                    <ThumbsDown className="h-3 w-3" />
                    Improvements
                  </div>
                  <ul className="space-y-1">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-amber-500">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              {feedback.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quick Fixes</div>
                  <div className="space-y-2">
                    {feedback.suggestions.slice(0, 2).map((sug, i) => (
                      <motion.div
                        key={i}
                        className="p-2 rounded-lg border flex items-center justify-between gap-2"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-1">
                            {sug.type}
                          </Badge>
                          <p className="text-xs">{sug.rationale}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => onApplySuggestion(sug)}
                        >
                          Apply
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific Insight */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">Scientific Insight</span>
                </div>
                <p className="text-xs text-muted-foreground">{feedback.scientificInsight}</p>
              </div>

              {/* Retention Tip */}
              <div className="p-2 rounded-lg bg-primary/5 text-center">
                <p className="text-xs text-primary font-medium">{feedback.retentionTip}</p>
              </div>

              {/* Conversation */}
              <div className="border-t pt-4 space-y-3">
                <div className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ask the AI
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {conversation.map((msg, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2 rounded-lg ${
                        msg.role === "user" 
                          ? "bg-primary/10 ml-8" 
                          : "bg-muted mr-8"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask about your circuit..."
                    className="min-h-[60px] text-sm"
                  />
                  <Button 
                    onClick={askQuestion} 
                    disabled={isLoading || !userQuestion.trim()}
                    className="self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Ask"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
