import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AdminUser {
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  user_email: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export function useAdminControls() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activityLog, setActivityLog] = useState<AdminActivityLog[]>([]);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    checkAdmin();
  }, [user?.id]);

  // Fetch all users (admin only)
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.rpc('admin_get_all_users');
      
      if (error) throw error;
      setUsers((data as AdminUser[]) || []);
    } catch (e) {
      console.error("Error fetching users:", e);
      toast.error("Failed to fetch users");
    }
  }, [isAdmin]);

  // Update user display name
  const updateUserDisplayName = useCallback(async (
    targetUserId: string,
    newDisplayName: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('admin_update_user_display_name', {
        target_user_id: targetUserId,
        new_display_name: newDisplayName,
      });

      if (error) throw error;
      
      toast.success("Display name updated successfully");
      await fetchUsers();
      return true;
    } catch (e) {
      console.error("Error updating display name:", e);
      toast.error("Failed to update display name");
      return false;
    }
  }, [fetchUsers]);

  // Set user role
  const setUserRole = useCallback(async (
    targetUserId: string,
    role: 'admin' | 'moderator' | 'user',
    shouldAdd: boolean
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('admin_set_user_role', {
        target_user_id: targetUserId,
        target_role: role,
        should_add: shouldAdd,
      });

      if (error) throw error;
      
      toast.success(shouldAdd ? `${role} role added` : `${role} role removed`);
      await fetchUsers();
      return true;
    } catch (e) {
      console.error("Error setting role:", e);
      toast.error("Failed to update role");
      return false;
    }
  }, [fetchUsers]);

  // Fetch support tickets
  const fetchTickets = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data as SupportTicket[]) || []);
    } catch (e) {
      console.error("Error fetching tickets:", e);
      toast.error("Failed to fetch tickets");
    }
  }, [isAdmin]);

  // Update ticket
  const updateTicket = useCallback(async (
    ticketId: string,
    updates: Partial<SupportTicket>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          ...(updates.status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
        })
        .eq('id', ticketId);

      if (error) throw error;
      
      toast.success("Ticket updated");
      await fetchTickets();
      return true;
    } catch (e) {
      console.error("Error updating ticket:", e);
      toast.error("Failed to update ticket");
      return false;
    }
  }, [fetchTickets]);

  // Create ticket (for users)
  const createTicket = useCallback(async (
    subject: string,
    description: string,
    category: string = 'general',
    priority: string = 'normal'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          user_email: user?.email,
          subject,
          description,
          category,
          priority,
        });

      if (error) throw error;
      
      toast.success("Support ticket created! We'll get back to you soon.");
      return true;
    } catch (e) {
      console.error("Error creating ticket:", e);
      toast.error("Failed to create ticket");
      return false;
    }
  }, [user]);

  // Fetch activity log
  const fetchActivityLog = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivityLog((data as AdminActivityLog[]) || []);
    } catch (e) {
      console.error("Error fetching activity log:", e);
    }
  }, [isAdmin]);

  // Get user's own tickets
  const fetchMyTickets = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as SupportTicket[]) || [];
    } catch (e) {
      console.error("Error fetching my tickets:", e);
      return [];
    }
  }, [user?.id]);

  return {
    isAdmin,
    isLoading,
    users,
    tickets,
    activityLog,
    fetchUsers,
    updateUserDisplayName,
    setUserRole,
    fetchTickets,
    updateTicket,
    createTicket,
    fetchActivityLog,
    fetchMyTickets,
  };
}
