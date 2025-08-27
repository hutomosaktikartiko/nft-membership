import React, { useState } from "react";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { logger } from "~/lib/utils/logger";

interface CopyButtonProps {
  text: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function CopyButton({
  text,
  variant = "outline",
  size = "sm",
  className,
  children,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("gap-1", className)}
    >
      {copied ? "✅" : "📋"}
      {children || (copied ? "Copied!" : "Copy")}
    </Button>
  );
}

// Specialized copy components
export function CopyAddress({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <code className="text-sm bg-muted px-2 py-1 rounded">
        {formatAddress(address)}
      </code>
      <CopyButton text={address} />
    </div>
  );
}

export function CopyHash({
  hash,
  label = "Hash",
  className,
}: {
  hash: string;
  label?: string;
  className?: string;
}) {
  const formatHash = (h: string) => {
    return `${h.slice(0, 6)}...${h.slice(-6)}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <code className="text-sm bg-muted px-2 py-1 rounded">
        {formatHash(hash)}
      </code>
      <CopyButton text={hash} />
    </div>
  );
}
