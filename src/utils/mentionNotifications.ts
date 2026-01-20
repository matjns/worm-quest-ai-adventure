import { supabase } from "@/integrations/supabase/client";

// Find user IDs from display names mentioned in text
export async function findMentionedUserIds(
  mentions: string[]
): Promise<{ userId: string; displayName: string }[]> {
  if (mentions.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("display_name", mentions);

    if (error) throw error;

    return (data || []).map((p) => ({
      userId: p.user_id,
      displayName: p.display_name,
    }));
  } catch (error) {
    console.error("Error finding mentioned users:", error);
    return [];
  }
}

// Create notifications for mentioned users
export async function notifyMentionedUsers({
  mentionedUserIds,
  actorId,
  actorName,
  circuitId,
  neuronId,
  annotationPreview,
}: {
  mentionedUserIds: { userId: string; displayName: string }[];
  actorId: string;
  actorName: string;
  circuitId: string;
  neuronId: string;
  annotationPreview: string;
}): Promise<void> {
  if (mentionedUserIds.length === 0) return;

  // Don't notify the author if they mention themselves
  const usersToNotify = mentionedUserIds.filter((u) => u.userId !== actorId);

  if (usersToNotify.length === 0) return;

  const truncatedPreview =
    annotationPreview.length > 50
      ? annotationPreview.slice(0, 50) + "..."
      : annotationPreview;

  const notifications = usersToNotify.map((user) => ({
    user_id: user.userId,
    type: "mention" as const,
    title: `${actorName} mentioned you`,
    message: `In an annotation on neuron ${neuronId}: "${truncatedPreview}"`,
    circuit_id: circuitId,
    actor_id: actorId,
    read: false,
  }));

  try {
    const { error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) throw error;
  } catch (error) {
    console.error("Error creating mention notifications:", error);
  }
}
