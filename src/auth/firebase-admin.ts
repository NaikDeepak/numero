import { type App, cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { serverConfig } from "./config"

export const getFirebaseAdminApp = (): App => {
  const existingApp = getApps().find((app) => app.name === "[DEFAULT]")

  if (existingApp) {
    return existingApp
  }

  return initializeApp({
    credential: cert(serverConfig.serviceAccount),
  })
}

export const auth = getAuth(getFirebaseAdminApp())
