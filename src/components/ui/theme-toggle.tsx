"use client"

import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="opacity-0" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-full hover:bg-muted transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 1 : 0,
          rotate: theme === "light" ? 0 : 90,
          opacity: theme === "light" ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 0 : -90,
          opacity: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-5 w-5" />
      </motion.div>
    </Button>
  )
}
