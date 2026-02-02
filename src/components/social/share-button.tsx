"use client"

import { Check, Share2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  title: string
  text: string
  url?: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = "outline",
  size = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "")

    if (!shareUrl) return

    // Mobile/Native Share
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        })
        return
      } catch (error) {
        // AbortError is common if user cancels
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error)
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("gap-2", className)}
      type="button"
      aria-label="Share"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {size !== "icon" && (copied ? "Copied" : "Share")}
    </Button>
  )
}
