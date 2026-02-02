import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware } from "next-firebase-auth-edge"
import { clientConfig, serverConfig } from "./auth/config"

const PUBLIC_PATHS = ["/login", "/register", "/"]

// Ensure we have at least one signature key in development
if (serverConfig.cookieSignatureKeys.length === 0 && process.env.NODE_ENV !== "production") {
  console.warn("⚠️ No AUTH_COOKIE_SIGNATURE_KEY found. Using default dev key. Do not use in production.")
  serverConfig.cookieSignatureKeys = ["dev-secret-key-change-me-in-prod-1234567890"]
}

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/auth/login",
    logoutPath: "/api/auth/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      // Premium gating
      if (request.nextUrl.pathname.startsWith("/reports/premium")) {
        if (!decodedToken.customClaims.premium) {
          return NextResponse.redirect(new URL("/upgrade", request.url))
        }
      }

      return NextResponse.next({
        request: {
          headers,
        },
      })
    },
    handleInvalidToken: async (reason) => {
      console.info("Missing or invalid token", { reason })

      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.next()
      }

      return NextResponse.redirect(new URL("/login", request.url))
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error })

      return NextResponse.redirect(new URL("/login", request.url))
    },
  })
}

export const config = {
  matcher: ["/api/auth/login", "/api/auth/logout", "/", "/((?!_next|favicon.ico|api|.*\\.).*)"],
}
