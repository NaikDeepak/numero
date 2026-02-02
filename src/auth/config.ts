const isPlaceholder = (val: string) =>
  !val || val.includes("your_") || val.includes("change-me") || val === "your_api_key_here"

const sanitizeEnv = (val: string | undefined) => {
  if (!val) return ""
  return val
    .replace(/^['"]|['"]$/g, "")
    .replace(/,$/, "")
    .trim()
}

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "")
  .replace(/\\n/g, "\n")
  .replace(/^"|"$/g, "")
  .replace(/,$/, "")
  .trim()

console.log("[Auth Config] 🚀 Loading configuration...")

if (process.env.NODE_ENV !== "production") {
  const diagnostics = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    publicProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    serviceProjectId: sanitizeEnv(process.env.FIREBASE_PROJECT_ID),
    clientEmail: sanitizeEnv(process.env.FIREBASE_CLIENT_EMAIL),
  }

  console.log(
    `[Auth Config] 🎯 Project IDs - Client: ${diagnostics.publicProjectId}, Server: ${diagnostics.serviceProjectId}`,
  )
  console.log(`[Auth Config] 📧 Service Account Email: ${diagnostics.clientEmail}`)

  Object.entries(diagnostics).forEach(([key, val]) => {
    if (!val || (typeof val === "string" && isPlaceholder(val))) {
      console.warn(`[Auth Config] ⚠️ ${key} is missing or appears to be a placeholder.`)
    }
  })

  if (
    diagnostics.serviceProjectId &&
    diagnostics.publicProjectId &&
    diagnostics.serviceProjectId !== diagnostics.publicProjectId
  ) {
    console.error(
      `[Auth Config] ❌ Project ID mismatch! Server: ${diagnostics.serviceProjectId}, Client: ${diagnostics.publicProjectId}. This will cause INVALID_CUSTOM_TOKEN errors.`,
    )
  }

  if (privateKey && !privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("[Auth Config] ❌ FIREBASE_PRIVATE_KEY does not appear to be a valid PEM format.")
  }
}

// Robustly filter cookie signature keys
const rawKeys = [process.env.AUTH_COOKIE_SIGNATURE_KEY_1, process.env.AUTH_COOKIE_SIGNATURE_KEY_2]

const validKeys = rawKeys.filter(
  (key): key is string => typeof key === "string" && key.trim().length > 0,
)

const cookieSignatureKeys =
  validKeys.length > 0
    ? validKeys
    : process.env.NODE_ENV !== "production"
      ? ["dev-secret-key-change-me-in-prod-1234567890"]
      : []

export const serverConfig = {
  cookieName: process.env.AUTH_COOKIE_NAME ?? "__session",
  cookieSignatureKeys,
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // 12 days
  },
  serviceAccount: {
    projectId: sanitizeEnv(process.env.FIREBASE_PROJECT_ID),
    clientEmail: sanitizeEnv(process.env.FIREBASE_CLIENT_EMAIL),
    privateKey,
  },
}

export const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
}
