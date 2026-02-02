import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware, redirectToLogin } from "next-firebase-auth-edge"
import { clientConfig, serverConfig } from "./auth/config"

const PUBLIC_PATHS = ["/login", "/register", "/"]

export async function middleware(request: NextRequest) {
  return await authMiddleware(request, {
    loginPath: "/api/auth/login",
    logoutPath: "/api/auth/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ decodedToken }, headers) => {
      // Premium gating
      if (request.nextUrl.pathname.startsWith("/reports/premium")) {
        if (!(decodedToken.customClaims as { premium?: boolean })?.premium) {
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
      console.info("[Middleware] ⚠️ Invalid token:", reason)

      if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.next()
      }

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      })
    },
    handleError: async (error) => {
      console.error("[Middleware] ❌ Authentication error:", error)

      return redirectToLogin(request, {
        path: "/login",
        publicPaths: PUBLIC_PATHS,
      })
    },
  })
}

export const config = {
  matcher: ["/api/auth/login", "/api/auth/logout", "/", "/((?!_next|favicon.ico|api|.*\\.).*)"],
}
