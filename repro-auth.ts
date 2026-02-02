import crypto from "crypto"
import { getTokens } from "next-firebase-auth-edge"
import { serverConfig } from "./src/auth/config"

// Generate a real RSA key for testing
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
})

function createMockToken(privateKeyPem: string) {
  const header = { alg: "RS256", typ: "JWT", kid: "test-kid" }
  const payload = {
    iss: "https://securetoken.google.com/test-project",
    aud: "test-project",
    auth_time: Math.floor(Date.now() / 1000),
    user_id: "test-user-id",
    sub: "test-user-id",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    email: "test@example.com",
    email_verified: true,
    firebase: {
      identities: {
        email: ["test@example.com"],
      },
      sign_in_provider: "password",
    },
  }

  const sign = crypto.createSign("RSA-SHA256")
  sign.update(
    `${Buffer.from(JSON.stringify(header)).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`,
  )
  const signature = sign.sign(privateKeyPem, "base64url")

  return `${Buffer.from(JSON.stringify(header)).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${signature}`
}

const mockToken = createMockToken(privateKey)

// Mock cookies
const mockCookies = async () => {
  return {
    getAll: () => [{ name: serverConfig.cookieName, value: mockToken }],
    get: (name: string) =>
      name === serverConfig.cookieName ? { name, value: mockToken } : undefined,
    // biome-ignore lint/suspicious/noExplicitAny: Mocking partial interface
  } as any
}

async function run() {
  console.log("Starting repro with generated key...")

  // Test case 1: Pass privateKey as Uint8Array (simulating the bug)
  console.log("\n--- TEST CASE 1: privateKey as Uint8Array ---")
  const mockServiceAccountUint8 = {
    projectId: "test-project",
    clientEmail: "test@test-project.iam.gserviceaccount.com",
    // biome-ignore lint/suspicious/noExplicitAny: Intentional type error for testing
    privateKey: new TextEncoder().encode(privateKey) as any,
  }

  try {
    console.log("Calling getTokens with Uint8Array key...")
    const tokens = await getTokens(await mockCookies(), {
      apiKey: "fake-api-key",
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: ["secret-key-1", "secret-key-2"],
      serviceAccount: mockServiceAccountUint8,
    })
    console.log("Tokens result:", tokens ? "Success (unexpected)" : "null")
  } catch (error) {
    console.error("Caught expected error:")
    console.error(error)
  }

  // Test case 2: Pass privateKey as String (Control)
  console.log("\n--- TEST CASE 2: privateKey as String ---")
  const mockServiceAccountString = {
    projectId: "test-project",
    clientEmail: "test@test-project.iam.gserviceaccount.com",
    privateKey: privateKey,
  }

  try {
    console.log("Calling getTokens with String key...")
    // We expect this to fail verification because the signature verification also needs public keys from Google,
    // which we can't easily mock without network mocking.
    // However, if it gets PAST the "Key must be KeyObject" error, that's success for our repro.
    const tokens = await getTokens(await mockCookies(), {
      apiKey: "fake-api-key",
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: ["secret-key-1", "secret-key-2"],
      serviceAccount: mockServiceAccountString,
    })
    console.log("Tokens result:", tokens ? "Success" : "null")
    // biome-ignore lint/suspicious/noExplicitAny: Catching generic errors
  } catch (error: any) {
    if (
      error.code === "ERR_JWT_CLAIM_VALIDATION_FAILED" ||
      error.message.includes("fetch") ||
      error.message.includes("network")
    ) {
      console.log(
        "Caught expected downstream error (meaning key type check passed):",
        error.message,
      )
    } else {
      console.error("Caught unexpected error:", error)
    }
  }
}

run()
