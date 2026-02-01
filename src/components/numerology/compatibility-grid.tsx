"use client"

import { motion } from "framer-motion"
import { LoShuGrid } from "./lo-shu-grid"

interface CompatibilityGridProps {
  user: {
    name: string
    gridNumbers: number[]
  }
  partner: {
    name: string
    gridNumbers: number[]
  }
}

export function CompatibilityGrid({ user, partner }: CompatibilityGridProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-center w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 w-full space-y-4"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-primary">{user.name}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Lo Shu Grid</p>
        </div>
        <LoShuGrid gridNumbers={user.gridNumbers} />
      </motion.div>

      <div className="hidden md:flex items-center justify-center pt-24 text-primary/20">
        <div className="h-32 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 w-full space-y-4"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-secondary">{partner.name}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Lo Shu Grid</p>
        </div>
        <LoShuGrid gridNumbers={partner.gridNumbers} />
      </motion.div>
    </div>
  )
}
