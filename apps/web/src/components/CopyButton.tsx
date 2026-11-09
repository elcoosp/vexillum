import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Clipboard write with a legacy fallback; shared by CopyButton and the
 * login page's copy-the-callback-URL hint. */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = "Copy",
  variant = "outline",
  size = "sm",
  className,
  title,
}: {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
  /** Optional native tooltip — e.g. the full URL a share button will copy. */
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      title={title}
      aria-label={`${label}${copied ? " (copied)" : ""}`}
      onClick={async () => {
        const ok = await writeClipboard(text);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }}
    >
      {copied ? (
        <Check className="vx-pop h-3.5 w-3.5 text-success" aria-hidden key="check" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden key="copy" />
      )}
      {size !== "icon" && (copied ? "Copied" : label)}
    </Button>
  );
}
