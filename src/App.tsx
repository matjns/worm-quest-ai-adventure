import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Play from "./pages/Play";
import Learn from "./pages/Learn";
import Leaderboard from "./pages/Leaderboard";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PreKGame from "./pages/games/PreKGame";
import K5Game from "./pages/games/K5Game";
import MiddleSchoolGame from "./pages/games/MiddleSchoolGame";
import HighSchoolGame from "./pages/games/HighSchoolGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/pre-k" element={<PreKGame />} />
          <Route path="/play/k5" element={<K5Game />} />
          <Route path="/play/middle" element={<MiddleSchoolGame />} />
          <Route path="/play/high" element={<HighSchoolGame />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;