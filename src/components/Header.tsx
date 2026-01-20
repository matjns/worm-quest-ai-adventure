import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, Trophy, BookOpen, Users, Settings, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import neuroQuestLogo from "@/assets/neuroquest-logo.png";

const navItems = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Play", href: "/play", icon: Gamepad2 },
  { label: "NeuroQuest", href: "/neuroquest", icon: Brain },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Community", href: "/community", icon: Users },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b-3 border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={neuroQuestLogo} 
              alt="NeuroQuest" 
              className="h-8 w-auto drop-shadow-[0_0_10px_hsl(340_100%_60%/0.5)] group-hover:drop-shadow-[0_0_20px_hsl(340_100%_60%/0.7)] transition-all"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "font-bold uppercase",
                      isActive && "shadow-[2px_2px_0px_hsl(var(--foreground))]"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-1" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/settings" className="hidden sm:block">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/neuroquest">
              <Button variant="hero" size="sm" className="hidden sm:flex glow-neon-pink">
                <Brain className="w-4 h-4 mr-1" />
                Start Quest
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t-2 border-foreground">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start font-bold uppercase"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Link to="/neuroquest" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full mt-2 glow-neon-pink">
                  <Brain className="w-4 h-4 mr-2" />
                  Start Quest
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}