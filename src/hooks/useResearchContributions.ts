import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ResearchContribution {
  id: string;
  title: string;
  behavior: string;
  neuronsUsed: string[];
  likesCount: number;
  creatorName: string;
  creatorId: string;
  createdAt: string;
  isFeatured: boolean;
  researchScore: number;
}

interface ResearchStats {
  totalContributions: number;
  verifiedCircuits: number;
  topBehaviors: { behavior: string; count: number }[];
  topContributors: { name: string; count: number; userId: string }[];
}

// Behaviors that align with real OpenWorm research
const RESEARCH_BEHAVIORS = [
  'chemotaxis',
  'thermotaxis',
  'mechanosensation',
  'avoidance',
  'foraging',
  'locomotion',
  'touch-response',
  'nose-touch',
];

export function useResearchContributions() {
  const { data: contributions, isLoading: contributionsLoading } = useQuery({
    queryKey: ['research-contributions'],
    queryFn: async () => {
      const { data: circuits, error } = await supabase
        .from('shared_circuits')
        .select(`
          id,
          title,
          behavior,
          neurons_used,
          likes_count,
          user_id,
          created_at,
          is_featured
        `)
        .order('likes_count', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get creator names
      const userIds = [...new Set(circuits?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      // Calculate research scores based on alignment with real behaviors
      return circuits?.map(c => {
        const behaviorLower = c.behavior.toLowerCase();
        const isResearchAligned = RESEARCH_BEHAVIORS.some(b => behaviorLower.includes(b));
        const neuronCount = c.neurons_used?.length || 0;
        
        // Score based on: research alignment, complexity, community validation
        const researchScore = 
          (isResearchAligned ? 50 : 0) +
          Math.min(neuronCount * 5, 30) +
          Math.min(c.likes_count * 2, 20);

        return {
          id: c.id,
          title: c.title,
          behavior: c.behavior,
          neuronsUsed: c.neurons_used || [],
          likesCount: c.likes_count || 0,
          creatorName: profileMap.get(c.user_id) || 'Anonymous Researcher',
          creatorId: c.user_id,
          createdAt: c.created_at,
          isFeatured: c.is_featured || false,
          researchScore,
        } as ResearchContribution;
      }).sort((a, b) => b.researchScore - a.researchScore) || [];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['research-stats'],
    queryFn: async () => {
      const { data: circuits } = await supabase
        .from('shared_circuits')
        .select('behavior, user_id');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, circuits_shared')
        .order('circuits_shared', { ascending: false })
        .limit(10);

      // Count behaviors
      const behaviorCounts = new Map<string, number>();
      circuits?.forEach(c => {
        const count = behaviorCounts.get(c.behavior) || 0;
        behaviorCounts.set(c.behavior, count + 1);
      });

      // Count contributions per user
      const userCounts = new Map<string, number>();
      circuits?.forEach(c => {
        const count = userCounts.get(c.user_id) || 0;
        userCounts.set(c.user_id, count + 1);
      });

      const topBehaviors = Array.from(behaviorCounts.entries())
        .map(([behavior, count]) => ({ behavior, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const verifiedCount = circuits?.filter(c => 
        RESEARCH_BEHAVIORS.some(b => c.behavior.toLowerCase().includes(b))
      ).length || 0;

      return {
        totalContributions: circuits?.length || 0,
        verifiedCircuits: verifiedCount,
        topBehaviors,
        topContributors: profiles?.map(p => ({
          name: p.display_name,
          count: p.circuits_shared || 0,
          userId: p.user_id,
        })) || [],
      } as ResearchStats;
    },
  });

  const { data: globalStats } = useQuery({
    queryKey: ['global-research-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('global_stats')
        .select('*')
        .eq('id', 'global')
        .single();
      return data;
    },
  });

  return {
    contributions: contributions || [],
    stats,
    globalStats,
    isLoading: contributionsLoading || statsLoading,
  };
}
