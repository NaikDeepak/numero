"use client"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

interface AnimatedNumberProps {
  value: number
  className?: string
  duration?: number
  delay?: number
}

export function AnimatedNumber({
  value,
  className,
  duration = 1000,
  delay = 0,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { bounce: 0, duration: duration })
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    const timeout = setTimeout(() => {
      spring.set(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, spring, delay])

  return <motion.span className={className}>{display}</motion.span>
}
