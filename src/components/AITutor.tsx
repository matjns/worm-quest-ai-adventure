import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Lightbulb, 
  Sparkles, 
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AITutorProps {
  missionContext: string;
  userCircuit: string;
  solutionHint: string;
  ageGroup: "pre-k" | "k5" | "middle" | "high";
  className?: string;
}

export function AITutor({
  missionContext,
  userCircuit,
  solutionHint,
  ageGroup,
  className,
}: AITutorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-challenge", {
        body: {
          type: "get_hint",
          ageGroup,
          context: `Mission: ${missionContext}\nStudent's current circuit: ${userCircuit}\nStudent's question: ${content}\nHint for solution: ${solutionHint}`,
        },
      });

      if (fnError) throw fnError;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result || "I'm here to help! Try connecting your sensory neurons to interneurons first.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI Tutor error:", err);
      setError("Couldn't get a response. Try again!");
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "🤔 I'm having trouble connecting right now. Here's a tip: Make sure your sensory neurons connect to interneurons, which then connect to motor neurons!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getHint = async () => {
    await sendMessage("I'm stuck! Can you give me a hint?");
  };

  return (
    <div className={cn("flex flex-col bg-card border-2 border-foreground rounded-xl shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b-2 border-foreground bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Dr. Wormstein</h3>
          <p className="text-xs text-muted-foreground">AI Neuroscience Tutor</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={getHint}
          disabled={isLoading}
          className="ml-auto rounded-full"
        >
          <Lightbulb className="w-4 h-4 mr-1" />
          Get Hint
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about your circuit!</p>
              <p className="text-xs opacity-70">Or click "Get Hint" if you're stuck</p>
            </div>
          )}
          
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "user" 
                    ? "bg-accent" 
                    : "bg-primary"
                )}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-xl text-sm",
                  message.role === "user"
                    ? "bg-accent text-accent-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted p-3 rounded-xl rounded-bl-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t-2 border-foreground">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 rounded-full"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
