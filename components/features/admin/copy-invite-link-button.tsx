"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyInviteLinkButtonProps = {
  inviteLink: string;
};

export function CopyInviteLinkButton({ inviteLink }: CopyInviteLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}
