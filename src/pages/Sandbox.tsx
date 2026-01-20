import { Header } from '@/components/Header';
import { AutonomousPlayground } from '@/components/AutonomousPlayground';

export default function SandboxPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AutonomousPlayground />
      </main>
    </div>
  );
}
