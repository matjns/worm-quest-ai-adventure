import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X, Trophy, BookOpen, Users, Settings, Gamepad2, LogIn, User, GraduationCap, BarChart3, FlaskConical, Award, Code2, Play, Puzzle, FileText, GitBranch, Zap, ChevronDown, Activity, Shield, Presentation, HelpCircle, Ticket, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import neuroQuestLogo from "@/assets/neuroquest-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useAdminTicketCount } from "@/hooks/useAdminTicketCount";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const navItems = [
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Modules", href: "/education", icon: GraduationCap },
  { label: "Play", href: "/play", icon: Gamepad2 },
  { label: "NeuroQuest", href: "/neuroquest", icon: Brain },
  { label: "Chaos Lab", href: "/chaos", icon: Activity },
  { label: "Research", href: "/research", icon: FlaskConical },
  { label: "Community", href: "/community", icon: Users },
];

const apiMenuItems = [
  { 
    label: "API Playground", 
    href: "/open#api-access", 
    icon: Play, 
    description: "Test neural simulations with live API calls" 
  },
  { 
    label: "Extensions", 
    href: "/open#extensions", 
    icon: Puzzle, 
    description: "Community-built modules and integrations" 
  },
  { 
    label: "Documentation", 
    href: "/open#contribute", 
    icon: FileText, 
    description: "Guides, tutorials, and API reference" 
  },
  { 
    label: "GitHub", 
    href: "https://github.com/openworm", 
    icon: GitBranch, 
    description: "Open source repositories and contributions",
    external: true 
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, profile, signOut, loading } = useAuth();
  const { isAdmin, openTicketCount } = useAdminTicketCount();

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
            
            {/* API Mega Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className={cn(
                      "font-bold uppercase h-9 px-3 text-sm bg-transparent hover:bg-accent hover:text-accent-foreground",
                      location.pathname === "/open" && "bg-primary text-primary-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]"
                    )}
                  >
                    <Code2 className="w-4 h-4 mr-1" />
                    API
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4 bg-popover border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">OpenWorm API</h4>
                          <p className="text-xs text-muted-foreground">Neural simulation & connectome data</p>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {apiMenuItems.map((item) => (
                          item.external ? (
                            <a
                              key={item.label}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-muted group-hover:bg-primary/10 transition-colors">
                                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{item.label}</div>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </a>
                          ) : (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="flex items-start gap-3 p-2 rounded-md hover:bg-accent transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-muted group-hover:bg-primary/10 transition-colors">
                                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{item.label}</div>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </Link>
                          )
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <Link 
                          to="/open" 
                          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-primary text-primary-foreground rounded-md font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                          <Code2 className="w-4 h-4" />
                          Open Platform Overview
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <AccessibilityToggle />
            <DarkModeToggle />
            <NotificationCenter />
            
            {!loading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="hidden sm:inline text-xs font-mono">
                          {profile?.display_name || "User"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/progress" className="w-full">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          My Progress
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/community" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          My Circuits
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full flex items-center justify-between">
                            <span className="flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              Admin Analytics
                            </span>
                            {openTicketCount > 0 && (
                              <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center text-xs">
                                {openTicketCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/demo-script" className="w-full">
                          <Presentation className="w-4 h-4 mr-2" />
                          Demo Script
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/help" className="w-full">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Help & Support
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/parent" className="w-full">
                          <Heart className="w-4 h-4 mr-2" />
                          Parent Portal
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth" className="hidden sm:block">
                    <Button variant="outline" size="sm">
                      <LogIn className="w-4 h-4 mr-1" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
            
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
              
              {/* API Section for mobile */}
              <div className="border-t border-border pt-2 mt-1">
                <p className="text-xs text-muted-foreground px-3 py-1 uppercase font-bold">API & Platform</p>
                {apiMenuItems.map((item) => (
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </a>
                  ) : (
                    <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                ))}
              </div>
              
              {/* Auth section for mobile */}
              {isAuthenticated ? (
                <>
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Link to="/help" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
              
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