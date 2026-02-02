import { type NextRequest, NextResponse } from "next/server";

/**
 * This route is intercepted by next-firebase-auth-edge middleware.
 * The middleware handles clearing the session cookies.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}
