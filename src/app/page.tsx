"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Numero</h1>
          <p className="text-lg text-muted-foreground">Next Gen Numerology</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Numero</h1>
          <p className="text-lg text-muted-foreground">Next Gen Numerology - Foundation Ready</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setTheme("light")}
            className={theme === "light" ? "border-primary" : ""}
          >
            Light
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("dark")}
            className={theme === "dark" ? "border-primary" : ""}
          >
            Dark
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("system")}
            className={theme === "system" ? "border-primary" : ""}
          >
            System
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">Current theme: {theme}</div>
      </div>
    </main>
  )
}
