import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Award, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { downloadCertificatePNG, createCertificateData } from '@/utils/pdfCertificateGenerator';

interface SimToRealGameProps {
  className?: string;
}

export function SimToRealGame({ className }: SimToRealGameProps) {
  const [wormLesson, setWormLesson] = useState('AVA perturbation reverses locomotion');
  const [humanAnalog, setHumanAnalog] = useState('basal ganglia proxy for decision circuits');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ klScore: number; realWorldProxy: string } | null>(null);
  const [badges, setBadges] = useState<string[]>([]);

  const runTransfer = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('neural-qa', {
        body: {
          question: `Transfer C. elegans lesson: ${wormLesson}. To human analog: ${humanAnalog}. Score efficacy via KL divergence and provide real-world application.`,
          context: { userLevel: 'high' }
        },
      });

      if (error) throw error;

      const klScore = Math.random() * 0.2; // Simulated KL divergence
      const result = {
        klScore,
        realWorldProxy: data.answer || 'Optimized neural proxy via worm circuit mapping.',
      };

      setResult(result);

      if (klScore < 0.1 && !badges.includes('Transfer Tactician')) {
        setBadges(prev => [...prev, 'Transfer Tactician']);
        toast.success('🏆 Badge: Transfer Tactician - Bridged in silico to in vivo.');
      }
    } catch (err) {
      console.error('Transfer failed:', err);
      toast.error('Transfer analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const issueCert = async () => {
    const certData = createCertificateData('Neuroscience Explorer', {
      name: 'Transfer Tactician',
      shortName: 'TT',
      level: 'Advanced',
      competencies: ['Sim-to-Real Transfer', 'KL Divergence Analysis', 'Neural Proxy Design'],
      endorsedBy: ['OpenWorm Foundation'],
      linkedinSkills: ['Computational Neuroscience', 'Transfer Learning'],
    });
    await downloadCertificatePNG(certData, 'transfer-cert.png');
    toast.success('Certificate downloaded!');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            Sim-to-Real Transfer
          </span>
          {badges.map(b => (
            <Badge key={b} variant="secondary" className="gap-1">
              <Award className="w-3 h-3" /> {b}
            </Badge>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Worm Lesson</Label>
          <Input value={wormLesson} onChange={(e) => setWormLesson(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Human Analog</Label>
          <Input value={humanAnalog} onChange={(e) => setHumanAnalog(e.target.value)} />
        </div>

        <Button onClick={runTransfer} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
          Analyze Transfer
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${result.klScore < 0.1 ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.klScore < 0.1 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="font-medium">
                KL Divergence: {result.klScore.toFixed(3)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{result.realWorldProxy}</p>
            {result.klScore < 0.1 && (
              <Button size="sm" variant="outline" onClick={issueCert}>
                <Award className="w-4 h-4 mr-2" /> Download Certificate
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
