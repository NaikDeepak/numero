import { type NextRequest, NextResponse } from "next/server"

/**
 * This route is intercepted by next-firebase-auth-edge middleware.
 * The middleware handles the ID Token to Session Cookie exchange.
 *
 * We keep this file to:
 * 1. Define the endpoint in the App Router.
 * 2. Provide a fallback or additional logic if needed.
 *
 * When the client calls POST /api/auth/login with the ID token in the
 * Authorization header, the middleware will set the session cookies
 * and return a response.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: true })
}
