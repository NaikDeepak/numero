"use client"

import { useAuth } from "@/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface PremiumGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showInline?: boolean
}

export function PremiumGate({ children, fallback, showInline = false }: PremiumGateProps) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user?.isPremium) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showInline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/20 px-3 py-1.5 rounded-lg border border-border">
        <Lock className="h-3.5 w-3.5" />
        <span>Premium feature</span>
        <Link href="/upgrade" className="text-primary hover:underline font-medium ml-1">
          Upgrade
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-card/30 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Premium Feature</h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Unlock detailed insights and PDF reports with a premium subscription.
        </p>
      </div>
      <Link href="/upgrade">
        <Button size="sm">Upgrade to Premium</Button>
      </Link>
    </div>
  )
}
