import { Header } from '@/components/Header';
import { ResearchContributionBoard } from '@/components/ResearchContributionBoard';
import { NeuralQAPanel } from '@/components/NeuralQAPanel';
import { ExODashboard } from '@/components/ExODashboard';

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main research board */}
          <div className="lg:col-span-2">
            <ResearchContributionBoard />
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
