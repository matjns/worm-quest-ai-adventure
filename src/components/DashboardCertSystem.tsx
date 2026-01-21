import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Award, Plus, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeGap {
  module: string;
  entropy: number;
}

interface DashboardCertSystemProps {
  className?: string;
}

export function DashboardCertSystem({ className }: DashboardCertSystemProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([
    { module: 'connectome', entropy: 1.2 },
    { module: 'synapses', entropy: 0.8 },
    { module: 'behavior', entropy: 0.4 },
  ]);
  const [newModule, setNewModule] = useState('');
  const [badges, setBadges] = useState<string[]>([]);

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || knowledgeGaps.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 400;
    const height = 200;

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const barWidth = Math.min(40, (width - 20) / knowledgeGaps.length - 10);
    const maxEntropy = Math.max(...knowledgeGaps.map(g => g.entropy), 2);

    // Bars
    svg.selectAll('rect')
      .data(knowledgeGaps)
      .enter()
      .append('rect')
      .attr('x', (_, i) => i * (barWidth + 10) + 10)
      .attr('y', d => height - 30 - (d.entropy / maxEntropy) * 150)
      .attr('width', barWidth)
      .attr('height', d => (d.entropy / maxEntropy) * 150)
      .attr('fill', d => d.entropy < 0.5 ? 'hsl(142, 76%, 36%)' : 'hsl(217, 91%, 60%)')
      .attr('rx', 4);

    // Labels
    svg.selectAll('text.label')
      .data(knowledgeGaps)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', (_, i) => i * (barWidth + 10) + 10 + barWidth / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .attr('font-size', '10px')
      .text(d => d.module.slice(0, 8));

    // Check for badge
    const avgEntropy = knowledgeGaps.reduce((a, b) => a + b.entropy, 0) / knowledgeGaps.length;
    if (avgEntropy < 0.5 && !badges.includes('Worm Warrior')) {
      setBadges(prev => [...prev, 'Worm Warrior']);
      toast.success('🏆 Badge: Worm Warrior - USA entropy tamer!');
    }
  }, [knowledgeGaps, badges]);

  const addGap = () => {
    if (!newModule.trim()) return;
    const entropy = Math.random() * 1.5 + 0.2;
    setKnowledgeGaps(prev => [...prev, { module: newModule, entropy }]);
    setNewModule('');
  };

  const reduceEntropy = (index: number) => {
    setKnowledgeGaps(prev => prev.map((g, i) => 
      i === index ? { ...g, entropy: Math.max(0.1, g.entropy - 0.3) } : g
    ));
  };

  const exportBadge = (level: string) => {
    const badge = { level, desc: 'Reduced knowledge entropy via worm sims.' };
    localStorage.setItem('badge', JSON.stringify(badge));
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(level)}&organizationName=OpenWorm%20Foundation`;
    window.open(url, '_blank');
    toast.success('Opening LinkedIn to add badge!');
  };

  const avgEntropy = knowledgeGaps.length > 0 
    ? (knowledgeGaps.reduce((a, b) => a + b.entropy, 0) / knowledgeGaps.length).toFixed(2) 
    : '0';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Knowledge Entropy Tracker
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Avg: {avgEntropy}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <svg ref={svgRef} className="w-full bg-muted/20 rounded-lg" />

        <div className="flex gap-2">
          <Input
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            placeholder="Add module..."
            onKeyDown={(e) => e.key === 'Enter' && addGap()}
          />
          <Button size="icon" onClick={addGap}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {knowledgeGaps.map((gap, i) => (
            <Badge
              key={i}
              variant={gap.entropy < 0.5 ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => reduceEntropy(i)}
            >
              {gap.module}: {gap.entropy.toFixed(2)}
            </Badge>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="pt-2 border-t flex items-center justify-between">
            <div className="flex gap-2">
              {badges.map(b => (
                <Badge key={b} variant="secondary" className="gap-1">
                  <Award className="w-3 h-3" /> {b}
                </Badge>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => exportBadge(badges[0])}>
              Export to LinkedIn
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
