"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface HeroResultProps {
  moolank: number
  bhagyank: number
}

export function HeroResult({ moolank, bhagyank }: HeroResultProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-2xl mx-auto py-8">
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
  )
}
