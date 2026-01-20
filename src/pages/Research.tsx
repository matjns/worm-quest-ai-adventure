import { Header } from '@/components/Header';
import { ResearchContributionBoard } from '@/components/ResearchContributionBoard';

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ResearchContributionBoard />
      </main>
    </div>
  );
}
