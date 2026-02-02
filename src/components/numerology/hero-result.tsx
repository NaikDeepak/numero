"use client"

import { motion } from "framer-motion"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { MoolankMeaning } from "@/lib/numerology/data-loader"
import { analyzeGrid } from "@/lib/numerology/grid-utils"
import type { GridPatternDefinition, NameNumbers } from "@/lib/numerology/types"
import gridDefinitions from "../../../api/data/gridAnalysisDefinitions.json"
import moolankMeaningsRaw from "../../../api/data/moolankMeanings.json"
import { InterpretationCard } from "./interpretation-card"
import { LoShuGrid } from "./lo-shu-grid"
import { NameAnalysis } from "./name-analysis"

const moolankMeanings = moolankMeaningsRaw as Record<string, MoolankMeaning>

interface HeroResultProps {
  moolank: number
  bhagyank: number
  gridNumbers: number[]
  nameNumbers?: NameNumbers | null
}

export function HeroResult({ moolank, bhagyank, gridNumbers, nameNumbers }: HeroResultProps) {
  const analysis = analyzeGrid(gridNumbers, gridDefinitions as GridPatternDefinition[])
  const moolankInfo = moolankMeanings[moolank.toString()]
  const bhagyankInfo = moolankMeanings[bhagyank.toString()]

  return (
    <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto py-8">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <Card className="h-full overflow-hidden border-2 border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-2">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Moolank
                </span>
                <span className="text-7xl font-bold text-primary">
                  <AnimatedNumber value={moolank} delay={200} />
                </span>
                <p className="text-xs text-muted-foreground text-center">
                  Your Root Number represents your basic character and personality.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="w-full"
          >
            <Card className="h-full overflow-hidden border-2 border-secondary/20 bg-secondary/5">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-2">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Bhagyank
                </span>
                <span className="text-7xl font-bold text-primary">
                  <AnimatedNumber value={bhagyank} delay={400} />
                </span>
                <p className="text-xs text-muted-foreground text-center">
                  Your Destiny Number reveals your life path and ultimate goals.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moolankInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <InterpretationCard
                title={`Moolank ${moolank} Analysis`}
                summary={`${moolankInfo.analysis.substring(0, 150)}...`}
                fullContent={
                  <div className="space-y-4">
                    <p>{moolankInfo.analysis}</p>
                    <div>
                      <h4 className="font-bold text-primary mb-1">Key Traits:</h4>
                      <ul className="list-disc list-inside grid grid-cols-2 gap-x-4">
                        {moolankInfo.keywords.map((kw: string) => (
                          <li key={kw}>{kw}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
              />
            </motion.div>
          )}

          {bhagyankInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <InterpretationCard
                title={`Bhagyank ${bhagyank} Insights`}
                summary={`Your Bhagyank (Destiny Number) of ${bhagyank} shapes your life's path and long-term achievements.`}
                fullContent={
                  <div className="space-y-4">
                    <p>{bhagyankInfo.analysis}</p>
                    <div>
                      <h4 className="font-bold text-secondary mb-1">Suggestions:</h4>
                      <ul className="list-disc list-inside">
                        {bhagyankInfo.suggestions.map((s: string) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
              />
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-col items-center"
      >
        <h3 className="text-2xl font-bold mb-6">Lo Shu Grid</h3>
        <LoShuGrid gridNumbers={gridNumbers} />
      </motion.div>

      {analysis.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold">Grid Patterns</h3>
            <p className="text-muted-foreground text-sm">
              Significant numerical alignments in your birth chart
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {analysis.map((pattern) => (
              <Card key={pattern.name} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-primary">{pattern.name}</CardTitle>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                      {pattern.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pattern.interpretation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      )}

      {nameNumbers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <NameAnalysis nameNumbers={nameNumbers} />
        </motion.div>
      )}

      <footer className="mt-8 pt-8 border-t border-primary/5 text-center text-xs text-muted-foreground">
        <p>© 2026 Numero - Modern Numerology for a Next-Gen World</p>
        <p className="mt-1 italic">
          Interpretations are based on traditional numerological principles and are for guidance
          purposes only.
        </p>
      </footer>
    </div>
  )
}
