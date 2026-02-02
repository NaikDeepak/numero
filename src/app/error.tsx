"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to our centralized logger
    logger.error("Application Error caught by global boundary", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-card/30 backdrop-blur-md p-8 rounded-2xl border border-destructive/20">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Cosmic Alignment Error</h2>
          <p className="text-muted-foreground text-sm">
            Something disturbed the flow. Our numerologists are investigating the vibrations.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <div className="p-4 bg-black/50 rounded text-xs font-mono text-left overflow-auto max-h-32 text-red-300">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => reset()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
