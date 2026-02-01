"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoShuGridProps {
  gridNumbers: number[]
}

interface GridCellProps {
  position: number
  numbers: number[]
  delay: number
}

const ELEMENT_COLORS: Record<number, string> = {
  1: "bg-slate-900/10 text-slate-900 border-slate-900/20", // Water
  2: "bg-stone-200/50 text-stone-800 border-stone-800/20", // Earth
  5: "bg-stone-200/50 text-stone-800 border-stone-800/20", // Earth
  8: "bg-stone-200/50 text-stone-800 border-stone-800/20", // Earth
  3: "bg-emerald-100/50 text-emerald-900 border-emerald-900/20", // Wood
  4: "bg-emerald-100/50 text-emerald-900 border-emerald-900/20", // Wood
  6: "bg-zinc-100/80 text-zinc-900 border-zinc-900/20", // Metal
  7: "bg-zinc-100/80 text-zinc-900 border-zinc-900/20", // Metal
  9: "bg-rose-100/50 text-rose-900 border-rose-900/20", // Fire
}

function GridCell({ position, numbers, delay }: GridCellProps) {
  const count = numbers.filter((n) => n === position).length
  const colorClass = ELEMENT_COLORS[position]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      className={cn(
        "relative flex flex-col items-center justify-center h-20 w-20 sm:h-24 sm:w-24 border rounded-xl shadow-sm transition-all hover:shadow-md",
        count > 0 ? colorClass : "bg-muted/30 text-muted-foreground/30 border-muted",
      )}
    >
      <span className="text-2xl sm:text-3xl font-bold">{count > 0 ? position : ""}</span>
      {count > 1 && (
        <span className="absolute top-1 right-2 text-[10px] sm:text-xs font-medium opacity-70">
          x{count}
        </span>
      )}
    </motion.div>
  )
}

export function LoShuGrid({ gridNumbers }: LoShuGridProps) {
  // Lo Shu Grid Layout:
  // 4 9 2
  // 3 5 7
  // 8 1 6
  const layout = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ]

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="grid grid-cols-3 gap-3 p-4 bg-background border rounded-2xl shadow-inner">
        {layout.flat().map((num, index) => (
          <GridCell key={num} position={num} numbers={gridNumbers} delay={index * 0.1} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-wider font-semibold opacity-60">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-900/20" /> Water
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-stone-200" /> Earth
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-100" /> Wood
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-100" /> Metal
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-100" /> Fire
        </div>
      </div>
    </div>
  )
}
