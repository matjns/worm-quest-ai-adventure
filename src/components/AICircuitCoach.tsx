import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Sparkles,
  Brain,
  MessageCircle,
  Lightbulb,
  BookOpen,
  Send,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Neuron {
  id: string;
  type: string;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
}

interface AICircuitCoachProps {
  neurons: Neuron[];
  connections: Connection[];
  className?: string;
}

type CoachMode = "explain" | "suggest" | "chat";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/circuit-coach`;

export function AICircuitCoach({
  neurons,
  connections,
  className,
}: AICircuitCoachProps) {
  const [mode, setMode] = useState<CoachMode>("explain");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const streamResponse = useCallback(async (selectedMode: CoachMode, query?: string) => {
    setIsLoading(true);
    setResponse("");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          neurons,
          connections,
          mode: selectedMode,
          query,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (resp.status === 402) {
          toast.error("AI credits exhausted. Please add credits to your workspace.");
        } else {
          toast.error(errorData.error || "Failed to get AI response");
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Handle remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch { /* ignore */ }
        }
      }

      if (selectedMode === "chat" && query && fullResponse) {
        setChatHistory(prev => [
          ...prev,
          { role: "user", content: query },
          { role: "assistant", content: fullResponse },
        ]);
      }
    } catch (error) {
      console.error("AI Coach error:", error);
      toast.error("Failed to connect to AI assistant");
    } finally {
      setIsLoading(false);
    }
  }, [neurons, connections]);

  const handleExplain = () => {
    setMode("explain");
    streamResponse("explain");
  };

  const handleSuggest = () => {
    setMode("suggest");
    streamResponse("suggest");
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const query = chatInput;
    setChatInput("");
    setMode("chat");
    streamResponse("chat", query);
  };

  const isEmpty = neurons.length === 0 && connections.length === 0;

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          AI Circuit Coach
          <Badge variant="secondary" className="ml-auto text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by OpenWorm
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {isEmpty ? (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Add neurons to get AI insights</p>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExplain}
                disabled={isLoading}
                className="gap-1.5 h-9"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Explain Circuit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggest}
                disabled={isLoading}
                className="gap-1.5 h-9"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Get Suggestions
              </Button>
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your circuit..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                disabled={isLoading}
                className="text-sm h-9"
              />
              <Button
                size="sm"
                onClick={handleChat}
                disabled={isLoading || !chatInput.trim()}
                className="h-9 px-3"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Response Area */}
            {(response || isLoading) && (
              <Card className="border border-border/50 bg-muted/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {mode === "explain" && <BookOpen className="w-3 h-3" />}
                      {mode === "suggest" && <Lightbulb className="w-3 h-3" />}
                      {mode === "chat" && <MessageCircle className="w-3 h-3" />}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Badge>
                    {isLoading && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </span>
                    )}
                  </div>
                  <ScrollArea className="max-h-[250px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {response || (isLoading && "Analyzing your circuit...")}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Chat History */}
            {chatHistory.length > 0 && !isLoading && mode !== "chat" && (
              <details className="text-xs">
                <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                  Previous Q&A ({chatHistory.length / 2})
                </summary>
                <ScrollArea className="max-h-[150px] mt-2">
                  <div className="space-y-2">
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2 rounded text-xs",
                          msg.role === "user"
                            ? "bg-primary/10 ml-4"
                            : "bg-muted mr-4"
                        )}
                      >
                        <span className="font-medium text-[10px] text-muted-foreground uppercase">
                          {msg.role === "user" ? "You" : "Coach"}:
                        </span>
                        <p className="mt-0.5 line-clamp-3">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </details>
            )}

            {/* Circuit Context */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>
                {neurons.length} neurons, {connections.length} synapses
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1"
                onClick={() => {
                  setResponse("");
                  setChatHistory([]);
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Clear
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
