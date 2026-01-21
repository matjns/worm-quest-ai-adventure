import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminControls } from '@/hooks/useAdminControls';
import { toast } from 'sonner';

export function useTicketNotifications() {
  const { isAdmin, fetchTickets } = useAdminControls();

  const handleNewTicket = useCallback((payload: any) => {
    const ticket = payload.new;
    
    toast.info(
      `New Support Ticket: ${ticket.subject}`,
      {
        description: `Category: ${ticket.category} | Priority: ${ticket.priority}`,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to admin tickets or trigger refetch
            fetchTickets();
          },
        },
        duration: 10000,
      }
    );
  }, [fetchTickets]);

  const handleTicketUpdate = useCallback((payload: any) => {
    const ticket = payload.new;
    const oldTicket = payload.old;
    
    // Only notify on status changes
    if (ticket.status !== oldTicket.status) {
      toast.info(
        `Ticket Status Updated`,
        {
          description: `"${ticket.subject}" is now ${ticket.status.replace('_', ' ')}`,
          duration: 5000,
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new tickets
    const channel = supabase
      .channel('admin-ticket-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_tickets',
        },
        handleNewTicket
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
        },
        handleTicketUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, handleNewTicket, handleTicketUpdate]);

  return { isAdmin };
}
