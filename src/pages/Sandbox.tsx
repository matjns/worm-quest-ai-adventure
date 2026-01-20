import { useState } from 'react';
import { Header } from '@/components/Header';
import { AutonomousPlayground } from '@/components/AutonomousPlayground';
import { ExperimentLab } from '@/components/ExperimentLab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, FlaskConical } from 'lucide-react';

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState('playground');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="playground" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              Playground
            </TabsTrigger>
            <TabsTrigger value="experiments" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Experiment Lab
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playground">
            <AutonomousPlayground />
          </TabsContent>
          
          <TabsContent value="experiments">
            <ExperimentLab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
