import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Brain, LogIn, UserPlus, Sparkles, ArrowRight } from "lucide-react";
import { z } from "zod";
import neuroQuestLogo from "@/assets/neuroquest-logo.png";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").optional(),
});

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    try {
      const data: Record<string, string> = { email, password };
      if (mode === "signup" && displayName) {
        data.displayName = displayName;
      }
      authSchema.parse(data);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, displayName || undefined);
        if (!error) {
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(250_50%_4%)] relative">
      {/* Arcade background */}
      <div className="fixed inset-0 pellet-bg opacity-20 pointer-events-none" />
      
      <Header />

      <main className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Arcade-style card */}
          <div className="bg-card border-3 border-foreground rounded-lg shadow-[8px_8px_0px_hsl(var(--foreground))] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-accent to-primary p-4">
              <div className="flex items-center justify-center gap-3">
                <img 
                  src={neuroQuestLogo} 
                  alt="NeuroQuest" 
                  className="h-8 w-auto drop-shadow-[0_0_10px_hsl(340_100%_60%/0.5)]"
                />
              </div>
              <p className="text-center text-primary-foreground font-arcade text-xs mt-2 animate-pulse">
                {mode === "login" ? "WELCOME BACK" : "JOIN THE QUEST"}
              </p>
            </div>

            {/* Form */}
            <div className="p-6">
              {/* Mode toggle */}
              <div className="flex gap-2 mb-6">
                <Button
                  type="button"
                  variant={mode === "login" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMode("login")}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  type="button"
                  variant={mode === "signup" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMode("signup")}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="font-mono uppercase text-xs">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="NeuronMaster42"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="border-2 border-foreground"
                    />
                    {errors.displayName && (
                      <p className="text-xs text-destructive">{errors.displayName}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono uppercase text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="worm@openworm.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-2 border-foreground"
                    required
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono uppercase text-xs">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-foreground"
                    required
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full glow-neon-pink"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : mode === "login" ? (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Enter the Lab
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Benefits */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-arcade text-[10px] text-muted-foreground text-center mb-3">
                  MEMBER BENEFITS
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="text-primary">✓</span> Share circuits
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary">✓</span> Save progress
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary">✓</span> Join leaderboards
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary">✓</span> Earn badges
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                🎮 By joining, you become part of the OpenWorm community 🐛
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
