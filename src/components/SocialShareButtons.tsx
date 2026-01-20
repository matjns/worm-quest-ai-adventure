import { useState } from "react";
import { Twitter, Linkedin, Link2, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  copyShareLink,
  shareToTwitter,
  shareToLinkedIn,
  getCircuitShareUrl,
  nativeShare,
} from "@/utils/socialShare";

interface SocialShareButtonsProps {
  circuitId: string;
  title: string;
  description?: string;
  tags?: string[];
  variant?: "dropdown" | "inline";
  size?: "sm" | "default";
}

export function SocialShareButtons({
  circuitId,
  title,
  description,
  tags,
  variant = "dropdown",
  size = "sm",
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = getCircuitShareUrl(circuitId);
  const shareData = { title, description, url, tags };

  const handleCopyLink = async () => {
    await copyShareLink(circuitId, title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const shared = await nativeShare(shareData);
    if (!shared) {
      // Fallback to copy link if native share is not available
      handleCopyLink();
    }
  };

  if (variant === "inline") {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size={size}
          onClick={() => shareToTwitter(shareData)}
          title="Share on Twitter/X"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size={size}
          onClick={() => shareToLinkedIn(shareData)}
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size={size}
          onClick={handleCopyLink}
          title="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} title="Share circuit">
          <Share2 className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => shareToTwitter(shareData)}>
          <Twitter className="w-4 h-4 mr-2" />
          Share on Twitter/X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => shareToLinkedIn(shareData)}>
          <Linkedin className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-primary" />
          ) : (
            <Link2 className="w-4 h-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        {typeof navigator !== "undefined" && navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 mr-2" />
            More options...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
