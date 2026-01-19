import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, Trophy, BookOpen, Users, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Play", href: "/play", icon: Brain },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Community", href: "/community", icon: Users },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_hsl(var(--foreground))] group-hover:shadow-[4px_4px_0px_hsl(var(--foreground))] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold uppercase tracking-tight hidden sm:block">WormQuest</span>
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
            <Link to="/play">
              <Button variant="hero" size="sm" className="hidden sm:flex">
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
              <Link to="/play" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full mt-2">
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