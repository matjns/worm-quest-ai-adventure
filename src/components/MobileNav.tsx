import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  BookOpen, 
  Play, 
  Trophy, 
  Users, 
  GraduationCap,
  Beaker,
  Settings,
  HelpCircle,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedWorm } from "@/components/AnimatedWorm";
import { cn } from "@/lib/utils";

const navLinks = [
  { title: "Home", href: "/", icon: Home },
  { title: "Learn", href: "/learn", icon: BookOpen },
  { title: "Play", href: "/play", icon: Play },
  { title: "Race", href: "/race", icon: Trophy },
  { title: "Community", href: "/community", icon: Users },
  { title: "Educators", href: "/teacher", icon: GraduationCap },
  { title: "Research", href: "/research", icon: Beaker },
  { title: "Help", href: "/help", icon: HelpCircle },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button - Fixed position */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 sm:hidden bg-card/80 backdrop-blur-sm border border-border shadow-lg"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-2xl sm:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AnimatedWorm size="sm" animated={false} />
                <span className="font-bold text-lg">WormQuest</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      onClick={closeMenu}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <link.icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{link.title}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <AnimatedWorm size="sm" animated />
                <span>Powered by OpenWorm</span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}