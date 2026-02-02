"use client"

import { Bell, BellOff } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from "@/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { useFcmToken } from "@/hooks/use-fcm-token"

export function NotificationManager() {
  const { user } = useAuth()
  const { permission, requestPermission } = useFcmToken(user)

  // Register service worker with config params
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSw = async () => {
        try {
          // Construct the URL with query params from our env vars
          // This passes the config to the static service worker file
          const params = new URLSearchParams({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
          })

          await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`)
          console.log("Service Worker registered with config")
        } catch (err) {
          console.error("Service Worker registration failed:", err)
        }
      }
      registerSw()
    }
  }, [])

  if (!user) return null

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Bell className="h-4 w-4" />
        <span>Notifications active</span>
      </div>
    )
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4" />
        <span>Notifications denied</span>
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={requestPermission} className="gap-2">
      <Bell className="h-4 w-4" />
      Enable Notifications
    </Button>
  )
}
