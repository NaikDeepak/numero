"use client"

import { motion } from "framer-motion"
import { Download, Heart, Loader2, Sparkles, TrendingUp } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { PremiumGate } from "@/components/premium-gate"
import { ShareButton } from "@/components/social/share-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateCompatibilityScore } from "@/lib/numerology/compatibility-logic"
import { getMissingNumbers, getRemediesForNumbers } from "@/lib/numerology/remedies"
import type { Gender, NumerologyResult } from "@/lib/numerology/types"
import { CompatibilityGrid } from "./compatibility-grid"
import { RemedySection } from "./remedy-section"

interface CompatibilityResultProps {
  analysis: string
  user: {
    name: string
    dob: string
    gender: Gender
    moolank: number
    bhagyank: number
    gridNumbers: number[]
  }
  partner: {
    name: string
    dob: string
    gender: Gender
    moolank: number
    bhagyank: number
    gridNumbers: number[]
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function CompatibilityResult({ analysis, user, partner }: CompatibilityResultProps) {
  const [downloading, setDownloading] = useState(false)
  const sharedMoolank = user.moolank === partner.moolank
  const sharedBhagyank = user.bhagyank === partner.bhagyank

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams({
        name1: user.name,
        dob1: user.dob,
        gender1: user.gender,
        name2: partner.name,
        dob2: partner.dob,
        gender2: partner.gender,
      })
      const response = await fetch(`/api/report/compatibility?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to generate PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Compatibility_${user.name}_${partner.name}.pdf`.replace(/[^a-zA-Z0-9]/g, "_")
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download PDF report. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const userResult: NumerologyResult = {
    moolank: user.moolank,
    bhagyank: user.bhagyank,
    kua: "-", // Default if not passed
    gridNumbers: user.gridNumbers,
  }

  const partnerResult: NumerologyResult = {
    moolank: partner.moolank,
    bhagyank: partner.bhagyank,
    kua: "-",
    gridNumbers: partner.gridNumbers,
  }

  const score = calculateCompatibilityScore(userResult, partnerResult)
  const userMissing = getMissingNumbers(user.gridNumbers)
  const userRemedies = getRemediesForNumbers(userMissing)
  const partnerMissing = getMissingNumbers(partner.gridNumbers)
  const partnerRemedies = getRemediesForNumbers(partnerMissing)

  // Determine score color
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-500"
    if (s >= 60) return "text-primary"
    if (s >= 40) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 w-full max-w-4xl"
    >
      {/* Score Header */}
      <motion.div variants={item} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
          <TrendingUp className="w-3.5 h-3.5" />
          Compatibility Score
        </div>
        <div className="relative inline-block">
          <div className={cn("text-8xl font-black tracking-tighter", getScoreColor(score))}>
            {score}%
          </div>
          <div className="absolute -inset-4 bg-primary/5 blur-3xl -z-10 rounded-full" />
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          A deterministic measure of your numerological resonance based on root numbers, destiny
          paths, and grid completion.
        </p>
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-col md:flex-row gap-6 items-center justify-center"
      >
        {/* User Card */}
        <Card className="flex-1 w-full bg-primary/5 border-primary/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="text-center text-xl">{user.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center pb-8">
            <div className="relative">
              <div
                className={`text-4xl font-bold transition-colors ${sharedMoolank ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : ""}`}
              >
                {user.moolank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                Moolank
              </div>
              {sharedMoolank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary/20 text-primary border-primary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
            <div className="relative">
              <div
                className={`text-4xl font-bold transition-colors ${sharedBhagyank ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : ""}`}
              >
                {user.bhagyank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                Bhagyank
              </div>
              {sharedBhagyank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary/20 text-primary border-primary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center z-10"
        >
          <div className="relative">
            <Heart className="w-12 h-12 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]" />
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Sparkles className="w-16 h-16 text-primary/30" />
            </motion.div>
          </div>
        </motion.div>

        {/* Partner Card */}
        <Card className="flex-1 w-full bg-secondary/5 border-secondary/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="text-center text-xl">{partner.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center pb-8">
            <div className="relative">
              <div
                className={`text-4xl font-bold transition-colors ${sharedMoolank ? "text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)]" : ""}`}
              >
                {partner.moolank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                Moolank
              </div>
              {sharedMoolank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary/20 text-secondary border-secondary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
            <div className="relative">
              <div
                className={`text-4xl font-bold transition-colors ${sharedBhagyank ? "text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)]" : ""}`}
              >
                {partner.bhagyank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                Bhagyank
              </div>
              {sharedBhagyank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary/20 text-secondary border-secondary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparison Grids */}
      <motion.div variants={item}>
        <CompatibilityGrid
          user={{ name: user.name, gridNumbers: user.gridNumbers }}
          partner={{ name: partner.name, gridNumbers: partner.gridNumbers }}
        />
      </motion.div>

      {/* Analysis Section */}
      <motion.div variants={item}>
        <Card className="bg-card/40 backdrop-blur-md border-primary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
            <ShareButton
              title="Cosmic Synergy"
              text={`I checked my compatibility with ${partner.name} on Numero. We have a ${score}% Match!`}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/40"
            />
            <PremiumGate fallback={null}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/40"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </PremiumGate>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              Cosmic Synergy Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-p:leading-relaxed prose-headings:text-primary prose-strong:text-foreground dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Remedies Section */}
      <motion.div variants={item} className="grid grid-cols-1 gap-12">
        <RemedySection userName={user.name} remedies={userRemedies} />
        <RemedySection userName={partner.name} remedies={partnerRemedies} />
      </motion.div>
    </motion.div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}
