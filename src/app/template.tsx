"use client"

import { motion, useReducedMotion } from "framer-motion"

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      transition={{ ease: "easeInOut", duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}
