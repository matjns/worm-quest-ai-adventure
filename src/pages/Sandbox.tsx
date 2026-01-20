import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { AutonomousPlayground } from '@/components/AutonomousPlayground';
import { ExperimentLab } from '@/components/ExperimentLab';
import { NeuralQAPanel } from '@/components/NeuralQAPanel';
import { ExODashboard } from '@/components/ExODashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Gamepad2, FlaskConical, Users, Brain } from 'lucide-react';

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState('playground');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Collaborative mode banner */}
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Build Together!</p>
              <p className="text-sm text-muted-foreground">
                Create neural circuits with friends in real-time
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/collab')} className="gap-2">
            <Users className="w-4 h-4" />
            Start Collab Session
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="playground" className="gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Playground
                </TabsTrigger>
                <TabsTrigger value="experiments" className="gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Experiment Lab
                </TabsTrigger>
                <TabsTrigger value="qa" className="gap-2">
                  <Brain className="w-4 h-4" />
                  Neural Q&A
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="playground">
                <AutonomousPlayground />
              </TabsContent>
              
              <TabsContent value="experiments">
                <ExperimentLab />
              </TabsContent>

              <TabsContent value="qa">
                <NeuralQAPanel userLevel="high" className="min-h-[500px]" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with ExO Dashboard */}
          <div className="space-y-6">
            <ExODashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
