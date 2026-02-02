import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/auth/auth-provider"
import { getAuthUser } from "@/auth/get-auth-user"
import { ProfileSyncManager } from "@/components/auth/profile-sync-manager"
import { NavMain } from "@/components/nav-main"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Numero - Next Gen Numerology",
  description: "AI-driven numerological insights in a visually stunning experience",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-cosmic`}>
        <AuthProvider initialUser={user}>
          <ProfileSyncManager />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
              <NavMain />
              <ThemeToggle />
            </div>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
