"use client"

import { signOut } from "firebase/auth"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"

export function NavMain() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) return null

  return (
    <nav className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium">{user.displayName || "User"}</span>
            {user.isPremium && (
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded-full uppercase font-bold tracking-wider">
                Premium
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" asChild title="Profile">
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      )}
    </nav>
  )
}
