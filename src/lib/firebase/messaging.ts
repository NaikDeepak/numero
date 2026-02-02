import { getMessaging, type MessagePayload, onMessage } from "firebase/messaging"
import { app } from "@/lib/firebase"

export const onMessageListener = () =>
  new Promise<MessagePayload>((resolve) => {
    if (typeof window === "undefined") return

    const messaging = getMessaging(app)
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
