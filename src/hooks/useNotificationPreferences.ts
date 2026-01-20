import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface NotificationPreferences {
  email_notifications: boolean;
  notify_on_likes: boolean;
  notify_on_comments: boolean;
  notify_on_forks: boolean;
  notify_weekly_digest: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  notify_on_likes: true,
  notify_on_comments: true,
  notify_on_forks: true,
  notify_weekly_digest: false,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email_notifications, notify_on_likes, notify_on_comments, notify_on_forks, notify_weekly_digest")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          notify_on_likes: data.notify_on_likes ?? true,
          notify_on_comments: data.notify_on_comments ?? true,
          notify_on_forks: data.notify_on_forks ?? true,
          notify_weekly_digest: data.notify_weekly_digest ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update a single preference
  const updatePreference = useCallback(
    async <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
      if (!user) {
        toast.error("Please sign in to update preferences");
        return;
      }

      setSaving(true);
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ [key]: value })
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success("Preferences updated");
      } catch (error) {
        console.error("Error updating preference:", error);
        toast.error("Failed to update preference");
        // Revert on error
        setPreferences(preferences);
      } finally {
        setSaving(false);
      }
    },
    [user, preferences]
  );

  // Update all preferences at once
  const updateAllPreferences = useCallback(
    async (newPreferences: NotificationPreferences) => {
      if (!user) {
        toast.error("Please sign in to update preferences");
        return;
      }

      setSaving(true);
      const oldPreferences = preferences;
      setPreferences(newPreferences);

      try {
        const { error } = await supabase
          .from("profiles")
          .update(newPreferences)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success("All preferences updated");
      } catch (error) {
        console.error("Error updating preferences:", error);
        toast.error("Failed to update preferences");
        setPreferences(oldPreferences);
      } finally {
        setSaving(false);
      }
    },
    [user, preferences]
  );

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    updateAllPreferences,
    refresh: fetchPreferences,
  };
}
