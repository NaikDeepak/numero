"use client"

import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { getMessaging, getToken } from "firebase/messaging"
import { useEffect, useState } from "react"
import type { AuthUser } from "@/auth/auth-provider"
import { app, db } from "@/lib/firebase"

export function useFcmToken(user: AuthUser | null) {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default",
  )

  useEffect(() => {
    if (typeof window === "undefined" || !user) return

    const retrieveToken = async () => {
      try {
        if (typeof Notification !== "undefined" && permission === "granted") {
          const messaging = getMessaging(app)
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          })

          if (currentToken) {
            setToken(currentToken)
            // Save token to Firestore
            const tokenRef = doc(db, "users", user.uid, "devices", currentToken)
            await setDoc(
              tokenRef,
              {
                token: currentToken,
                lastSeen: serverTimestamp(),
                userAgent: navigator.userAgent,
              },
              { merge: true },
            )
          } else {
            console.log("No registration token available. Request permission to generate one.")
          }
        }
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error)
      }
    }

    retrieveToken()
  }, [user, permission])

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === "granted") {
        // The effect will trigger and fetch the token
      }
    } catch (error) {
      console.error("Error requesting notification permission", error)
    }
  }

  return { token, permission, requestPermission }
}
