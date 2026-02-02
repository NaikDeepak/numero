"use client"

import { onIdTokenChanged } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { auth as firebaseAuth } from "@/lib/firebase"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  isPremium: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  initialUser: AuthUser | null
  children: React.ReactNode
}

export const AuthProvider = ({ initialUser, children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult()
        const isPremium = !!idTokenResult.claims.premium

        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          isPremium,
        }

        setUser(authUser)

        // Sync with session cookie if needed
        // The next-firebase-auth-edge library usually handles this if we call the login endpoint
        // but we ensure the client state is fresh here
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
