import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useAdminTicketCount() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [openTicketCount, setOpenTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user?.id]);

  // Fetch open ticket count
  const fetchTicketCount = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { count, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      if (!error && count !== null) {
        setOpenTicketCount(count);
      }
    } catch (e) {
      console.error('Error fetching ticket count:', e);
    }
  }, [isAdmin]);

  // Initial fetch
  useEffect(() => {
    if (isAdmin) {
      fetchTicketCount();
    }
  }, [isAdmin, fetchTicketCount]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-ticket-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
        },
        () => {
          fetchTicketCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, fetchTicketCount]);

  return { isAdmin, openTicketCount, loading };
}
