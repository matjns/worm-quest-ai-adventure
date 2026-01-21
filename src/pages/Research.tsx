import { Header } from '@/components/Header';
import { ResearchContributionBoard } from '@/components/ResearchContributionBoard';
import { ResearchJamActivity } from '@/components/ResearchJamActivity';
import { NeuralQAPanel } from '@/components/NeuralQAPanel';
import { ExODashboard } from '@/components/ExODashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, Users } from 'lucide-react';

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main research board */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="contributions" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="contributions" className="gap-2">
                  <FlaskConical className="w-4 h-4" />
                  Contributions
                </TabsTrigger>
                <TabsTrigger value="jam" className="gap-2">
                  <Users className="w-4 h-4" />
                  Research Jam
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="contributions">
                <ResearchContributionBoard />
              </TabsContent>
              
              <TabsContent value="jam">
                <ResearchJamActivity />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with Q&A and ExO metrics */}
          <div className="space-y-6">
            <NeuralQAPanel 
              userLevel="high" 
              className="sticky top-24"
            />
            <ExODashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
