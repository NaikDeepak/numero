"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoShuGrid } from "./lo-shu-grid"
import { analyzeGrid } from "@/lib/numerology/grid-utils"
import gridDefinitions from "../../../api/data/gridAnalysisDefinitions.json"
import type { GridAnalysisResult, GridPatternDefinition } from "@/lib/numerology/types"

interface HeroResultProps {
  moolank: number
  bhagyank: number
  gridNumbers: number[]
}

export function HeroResult({ moolank, bhagyank, gridNumbers }: HeroResultProps) {
  const analysis = analyzeGrid(
    gridNumbers,
    gridDefinitions as GridPatternDefinition[]
  )

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          <Card className="overflow-hidden border-2 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-2">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Moolank
              </span>
              <span className="text-7xl font-bold text-primary">{moolank}</span>
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
          <Card className="overflow-hidden border-2 border-secondary/20 bg-secondary/5">
            <CardContent className="flex flex-col items-center justify-center p-8 space-y-2">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Bhagyank
              </span>
              <span className="text-7xl font-bold text-secondary">{bhagyank}</span>
              <p className="text-xs text-muted-foreground text-center">
                Your Destiny Number reveals your life path and ultimate goals.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center"
      >
        <h3 className="text-2xl font-bold mb-6">Lo Shu Grid</h3>
        <LoShuGrid gridNumbers={gridNumbers} />
      </motion.div>

      {analysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {analysis.map((pattern, idx) => (
            <Card key={pattern.name} className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-primary">
                    {pattern.name}
                  </CardTitle>
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
      )}
    </div>
  )
}
