"use client"

import { AnimatePresence, motion } from "framer-motion"
import { RefreshCcw } from "lucide-react"
import Link from "next/link"
import { DailyForecast } from "@/components/numerology/daily-forecast"
import { HeroResult } from "@/components/numerology/hero-result"
import { NumerologyInputForm } from "@/components/numerology/input-form"
import { ReportButton } from "@/components/numerology/report-button"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { calculateNameNumbers, calculateNumerologyData } from "@/lib/numerology/engine"
import { useHydratedProfile, useProfileStore } from "@/store/use-profile-store"

export default function Home() {
  const { profile, isHydrated } = useHydratedProfile()
  const clearProfile = useProfileStore((state) => state.clearProfile)

  if (!isHydrated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background">
        <div className="text-center animate-pulse">
          <h1 className="text-4xl font-bold mb-4">Numero</h1>
          <p className="text-lg text-muted-foreground">Loading your cosmic alignment...</p>
        </div>
      </main>
    )
  }

  const results = profile ? calculateNumerologyData(profile.dob, profile.gender) : null
  const nameNumbers = profile ? calculateNameNumbers(profile.name) : null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background bg-cosmic overflow-hidden transition-colors duration-500">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            Numero
          </h1>
          <p className="text-xl text-muted-foreground">
            {profile ? `Welcome, ${profile.name}` : "Discover your numbers, define your destiny."}
          </p>
        </header>

        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <ThemeToggle />
        </div>

        <AnimatePresence mode="wait">
          {!profile ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <NumerologyInputForm />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center space-y-8"
            >
              {results && (
                <HeroResult
                  moolank={results.moolank}
                  bhagyank={results.bhagyank}
                  gridNumbers={results.gridNumbers}
                  nameNumbers={nameNumbers}
                />
              )}

              {results && profile && <DailyForecast dob={profile.dob} gender={profile.gender} />}

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                {profile && (
                  <ReportButton name={profile.name} dob={profile.dob} gender={profile.gender} />
                )}
                <Button
                  variant="ghost"
                  onClick={clearProfile}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reset Profile
                </Button>
              </div>
              <div className="mt-4">
                <Link href="/compatibility">
                  <Button variant="link" className="text-muted-foreground hover:text-primary">
                    Check Relationship Compatibility →
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
