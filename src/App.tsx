import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CelebrationProvider } from "@/contexts/CelebrationContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Play from "./pages/Play";
import Learn from "./pages/Learn";
import LessonView from "./pages/LessonView";
import Leaderboard from "./pages/Leaderboard";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PreKGame from "./pages/games/PreKGame";
import K5Game from "./pages/games/K5Game";
import MiddleSchoolGame from "./pages/games/MiddleSchoolGame";
import HighSchoolGame from "./pages/games/HighSchoolGame";
import NeuroQuest from "./pages/NeuroQuest";
import Auth from "./pages/Auth";
import TeacherDashboard from "./pages/TeacherDashboard";
import JoinClassroomPage from "./pages/JoinClassroom";
import StudentDashboard from "./pages/StudentDashboard";
import Sandbox from "./pages/Sandbox";
import Race from "./pages/Race";
import RaceHistory from "./pages/RaceHistory";
import CollabSandbox from "./pages/CollabSandbox";
import Research from "./pages/Research";
import EducationHub from "./pages/EducationHub";
import ChallengeSubmission from "./pages/ChallengeSubmission";
import SimulationMastery from "./pages/SimulationMastery";
import EnterpriseMOOC from "./pages/EnterpriseMOOC";
import Certifications from "./pages/Certifications";
import OpenPlatform from "./pages/OpenPlatform";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CelebrationProvider>
          <NotificationProvider>
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
                <Route path="/neuroquest" element={<NeuroQuest />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/:lessonId" element={<LessonView />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/community" element={<Community />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/join" element={<JoinClassroomPage />} />
                <Route path="/progress" element={<StudentDashboard />} />
                <Route path="/sandbox" element={<Sandbox />} />
                <Route path="/collab" element={<CollabSandbox />} />
                <Route path="/collab/:roomId" element={<CollabSandbox />} />
                <Route path="/race" element={<Race />} />
                <Route path="/race/:raceId" element={<Race />} />
                <Route path="/race-history" element={<RaceHistory />} />
                <Route path="/research" element={<Research />} />
                <Route path="/education" element={<EducationHub />} />
                <Route path="/challenge" element={<ChallengeSubmission />} />
                <Route path="/simulation" element={<SimulationMastery />} />
                <Route path="/enterprise" element={<EnterpriseMOOC />} />
                <Route path="/certifications" element={<Certifications />} />
                <Route path="/open" element={<OpenPlatform />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </CelebrationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;