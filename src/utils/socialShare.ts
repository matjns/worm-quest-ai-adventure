import { toast } from "sonner";

interface ShareData {
  title: string;
  description?: string;
  url: string;
  tags?: string[];
}

/**
 * Generate a shareable URL for a circuit
 */
export function getCircuitShareUrl(circuitId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/community?circuit=${circuitId}`;
}

/**
 * Copy link to clipboard
 */
export async function copyShareLink(circuitId: string, title: string): Promise<void> {
  const url = getCircuitShareUrl(circuitId);
  try {
    await navigator.clipboard.writeText(url);
    toast.success(`Link to "${title}" copied to clipboard!`);
  } catch {
    toast.error("Failed to copy link");
  }
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter({ title, description, url, tags }: ShareData): void {
  const text = description 
    ? `${title} - ${description}` 
    : title;
  
  const hashtags = tags?.slice(0, 3).join(",") || "NeuroQuest,OpenWorm";
  
  const twitterUrl = new URL("https://twitter.com/intent/tweet");
  twitterUrl.searchParams.set("text", `🧠 Check out this neural circuit: ${text}`);
  twitterUrl.searchParams.set("url", url);
  twitterUrl.searchParams.set("hashtags", hashtags);
  
  window.open(twitterUrl.toString(), "_blank", "noopener,noreferrer,width=600,height=400");
}

/**
 * Share to LinkedIn
 */
export function shareToLinkedIn({ title, url }: ShareData): void {
  const linkedInUrl = new URL("https://www.linkedin.com/sharing/share-offsite/");
  linkedInUrl.searchParams.set("url", url);
  
  window.open(linkedInUrl.toString(), "_blank", "noopener,noreferrer,width=600,height=600");
}

/**
 * Use native share API if available
 */
export async function nativeShare({ title, description, url }: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }
  
  try {
    await navigator.share({
      title: `NeuroQuest: ${title}`,
      text: description || `Check out this neural circuit on NeuroQuest!`,
      url,
    });
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== "AbortError") {
      console.error("Share failed:", error);
    }
    return false;
  }
}
