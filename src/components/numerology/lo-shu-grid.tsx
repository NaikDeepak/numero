"use client"

import { type Variants, motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoShuGridProps {
  gridNumbers: number[]
}

// Lo Shu Grid Layout (Fixed positions)
// 4 9 2
// 3 5 7
// 8 1 6
const GRID_POSITIONS = [4, 9, 2, 3, 5, 7, 8, 1, 6]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.4 } },
}

const ELEMENT_COLORS: Record<number, string> = {
  1: "bg-slate-900/10 text-slate-900 border-slate-900/20 dark:bg-slate-100/10 dark:text-slate-100 dark:border-slate-100/20", // Water
  2: "bg-stone-200/50 text-stone-800 border-stone-800/20 dark:bg-stone-800/50 dark:text-stone-200 dark:border-stone-200/20", // Earth
  5: "bg-stone-200/50 text-stone-800 border-stone-800/20 dark:bg-stone-800/50 dark:text-stone-200 dark:border-stone-200/20", // Earth
  8: "bg-stone-200/50 text-stone-800 border-stone-800/20 dark:bg-stone-800/50 dark:text-stone-200 dark:border-stone-200/20", // Earth
  3: "bg-emerald-100/50 text-emerald-900 border-emerald-900/20 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-100/20", // Wood
  4: "bg-emerald-100/50 text-emerald-900 border-emerald-900/20 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-100/20", // Wood
  6: "bg-zinc-100/80 text-zinc-900 border-zinc-900/20 dark:bg-zinc-800/50 dark:text-zinc-100 dark:border-zinc-100/20", // Metal
  7: "bg-zinc-100/80 text-zinc-900 border-zinc-900/20 dark:bg-zinc-800/50 dark:text-zinc-100 dark:border-zinc-100/20", // Metal
  9: "bg-rose-100/50 text-rose-900 border-rose-900/20 dark:bg-rose-900/30 dark:text-rose-100 dark:border-rose-100/20", // Fire
}

export function LoShuGrid({ gridNumbers }: LoShuGridProps) {
  return (
    <Card className="w-full max-w-[400px] border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-center">Lo Shu Grid</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-3 aspect-square mx-auto"
        >
          {GRID_POSITIONS.map((num) => {
            // Count occurrences of this number in the gridNumbers array
            // gridNumbers contains all the single digits derived from DOB
            const count = gridNumbers.filter((n) => n === num).length
            const hasNumber = count > 0
            const colorClass = ELEMENT_COLORS[num]

            return (
              <motion.div
                key={num}
                variants={item}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 transition-colors duration-300",
                  hasNumber
                    ? colorClass
                    : "bg-muted/30 text-muted-foreground/20 border-muted-foreground/10",
                )}
              >
                <span className={cn("text-3xl font-bold", !hasNumber && "opacity-20")}>{num}</span>
                {count > 1 && (
                  <span className="absolute top-1 right-2 text-xs font-bold opacity-70">
                    x{count}
                  </span>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mt-6 text-[10px] uppercase tracking-wider font-semibold opacity-60">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-900/20 dark:bg-slate-100/20" /> Water
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-stone-200 dark:bg-stone-700" /> Earth
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50" /> Wood
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-100 dark:bg-zinc-800" /> Metal
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-100 dark:bg-rose-900/50" /> Fire
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
