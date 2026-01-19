import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { Settings, RotateCcw, Moon, Sun, Volume2, VolumeX, Key, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useGameStore } from "@/stores/gameStore";
import { useState } from "react";

export default function SettingsPage() {
  const { resetProgress, level, totalPoints, completedLessons } = useGameStore();
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([75]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Settings className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
              Settings
            </h1>
            <p className="text-lg text-muted-foreground">
              Customize your WormQuest experience.
            </p>
          </motion.div>

          {/* Account Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold uppercase">Your Progress</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 border-2 border-foreground">
                <p className="text-2xl font-bold">{level}</p>
                <p className="text-xs font-mono text-muted-foreground">LEVEL</p>
              </div>
              <div className="text-center p-3 bg-muted/50 border-2 border-foreground">
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
                <p className="text-xs font-mono text-muted-foreground">POINTS</p>
              </div>
              <div className="text-center p-3 bg-muted/50 border-2 border-foreground">
                <p className="text-2xl font-bold">{completedLessons.length}</p>
                <p className="text-xs font-mono text-muted-foreground">LESSONS</p>
              </div>
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] mb-6"
          >
            <h2 className="text-xl font-bold uppercase mb-6">Display</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-bold">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </div>
          </motion.div>

          {/* Sound Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] mb-6"
          >
            <h2 className="text-xl font-bold uppercase mb-6">Sound</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <div>
                    <p className="font-bold">Sound Effects</p>
                    <p className="text-sm text-muted-foreground">Enable game sounds</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

              {soundEnabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold">Volume</p>
                    <span className="font-mono text-sm">{soundVolume[0]}%</span>
                  </div>
                  <Slider
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* API Settings (placeholder for AI integration) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border-2 border-foreground p-6 shadow-[4px_4px_0px_hsl(var(--foreground))] mb-6"
          >
            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2">
              <Key className="w-5 h-5" />
              AI Integration
            </h2>

            <p className="text-muted-foreground mb-4">
              Connect your API keys to enable AI-powered features like dynamic challenge 
              generation, behavior simulations, and personalized learning.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 border-2 border-foreground">
                <p className="font-bold">Grok API</p>
                <p className="text-sm text-muted-foreground">Not configured</p>
              </div>
              <div className="p-4 bg-muted/50 border-2 border-foreground">
                <p className="font-bold">OpenAI API</p>
                <p className="text-sm text-muted-foreground">Not configured</p>
              </div>
            </div>

            <Button variant="brutal" className="mt-4 w-full" disabled>
              Configure API Keys (Coming Soon)
            </Button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-destructive/10 border-2 border-destructive p-6"
          >
            <h2 className="text-xl font-bold uppercase mb-4 text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h2>

            <p className="text-muted-foreground mb-4">
              Reset all your progress, including levels, points, achievements, and completed lessons.
              This action cannot be undone.
            </p>

            {!showResetConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset All Progress
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    resetProgress();
                    setShowResetConfirm(false);
                  }}
                >
                  Yes, Reset Everything
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}