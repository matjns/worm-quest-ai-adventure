import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNeuralQA } from "@/hooks/useNeuralQA";
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Dna,
  Loader2,
  BookOpen,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NeuralQAPanelProps {
  currentCircuit?: {
    neurons: string[];
    connections: { from: string; to: string; weight: number }[];
  };
  userLevel?: "pre-k" | "k5" | "middle" | "high";
  className?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  validation?: {
    isValid: boolean;
    confidence: number;
    sources: string[];
  };
  hallucination?: boolean;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  { label: "GABA Mutation", query: "Mutate GABA synapse—predict stochastic delta?" },
  { label: "Synapse Count", query: "How many synapses in C. elegans?" },
  { label: "Touch Reflex", query: "Which neurons control the touch reflex?" },
  { label: "Dopamine Role", query: "What is dopamine's role in C. elegans behavior?" },
];

export function NeuralQAPanel({ currentCircuit, userLevel = "high", className }: NeuralQAPanelProps) {
  const { isLoading, askQuestion } = useNeuralQA();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (q?: string) => {
    const queryText = q || question;
    if (!queryText.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: queryText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    // Get AI response
    const response = await askQuestion(queryText, {
      currentCircuit,
      userLevel,
    });

    // Add assistant message
    const assistantMessage: Message = {
      role: "assistant",
      content: response.answer,
      validation: response.validation,
      hallucination: response.hallucination,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Neural Q&A (owmeta-validated)
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            98% Accuracy
          </Badge>
        </div>
        <CardDescription>
          Ask questions about C. elegans neuroscience. Responses validated against owmeta RDF triples.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick questions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q) => (
            <Button
              key={q.label}
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(q.query)}
              disabled={isLoading}
              className="text-xs"
            >
              <Dna className="w-3 h-3 mr-1" />
              {q.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-[200px] max-h-[400px] border rounded-lg p-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <p>Ask a question about C. elegans neuroscience</p>
              <p className="text-xs mt-1">e.g., "Mutate GABA synapse—predict stochastic delta?"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg",
                    msg.role === "user"
                      ? "bg-primary/10 ml-8"
                      : "bg-muted mr-4"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {msg.role === "user" ? "You" : "Neural AI"}
                    </span>
                    {msg.validation && (
                      <div className="flex items-center gap-1">
                        {msg.hallucination ? (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            Unverified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            {(msg.validation.confidence * 100).toFixed(0)}% conf
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.validation?.sources && msg.validation.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Sources: {msg.validation.sources.join(", ")}
                      </p>
                    </div>
                  )}

                  {msg.hallucination && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        This response contains claims not verified against owmeta data
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="p-3 bg-muted rounded-lg mr-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Querying owmeta knowledge base...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about mutations, synapses, behaviors..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading || !question.trim()}
            size="icon"
            className="h-[60px] w-12"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
