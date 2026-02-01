import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Numero - Next Gen Numerology",
  description: "AI-driven numerological insights in a visually stunning experience",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-cosmic`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
