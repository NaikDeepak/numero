"use client"

import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { getDailyForecast } from "@/app/actions/forecast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Gender } from "@/lib/numerology/types"

interface DailyForecastProps {
  dob: string
  gender: Gender
}

import { ShareButton } from "@/components/social/share-button"

export function DailyForecast({ dob, gender }: DailyForecastProps) {
  const [forecast, setForecast] = useState<string | null>(null)
  const [personalDay, setPersonalDay] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchForecast() {
      try {
        const result = await getDailyForecast(dob, gender)
        if (mounted) {
          if (result.error) {
            setError(result.error)
          } else {
            setForecast(result.forecast || null)
            setPersonalDay(result.personalDay || null)
          }
          setLoading(false)
        }
      } catch (_err) {
        if (mounted) {
          setError("Failed to load forecast")
          setLoading(false)
        }
      }
    }

    fetchForecast()

    return () => {
      mounted = false
    }
  }, [dob, gender])

  if (error) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <Card className="border-primary/20 bg-linear-to-br from-background to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Daily Cosmic Forecast
          </CardTitle>
          <div className="flex items-center gap-2">
            {personalDay && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                Personal Day {personalDay}
              </span>
            )}
            <ShareButton
              title="My Daily Cosmic Forecast"
              text={`My Personal Day is ${personalDay}. Here's my forecast from Numero:`}
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Consulting the stars...</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{forecast || ""}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
