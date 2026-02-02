"use client"

import { motion } from "framer-motion"
import { Heart, Star, User } from "lucide-react"
import type { NameNumbers } from "@/lib/numerology/types"
import { InterpretationCard } from "./interpretation-card"

interface NameAnalysisProps {
  nameNumbers: NameNumbers
}

export function NameAnalysis({ nameNumbers }: NameAnalysisProps) {
  const interpretations = [
    {
      title: "Destiny Number",
      number: nameNumbers.destinyNumber,
      icon: <Star className="w-5 h-5" />,
      summary: `Your Destiny (Expression) number is ${nameNumbers.destinyNumber}. This number represents your talents, capabilities, and the mission you are meant to fulfill in this lifetime.`,
      fullContent: `The Destiny number, also known as the Expression number, reveals your natural strengths and the path your life is likely to take. A Destiny number of ${nameNumbers.destinyNumber} suggests a life focused on specific themes related to this vibration, influencing your career choices and major life achievements.`,
    },
    {
      title: "Soul Urge Number",
      number: nameNumbers.soulUrgeNumber,
      icon: <Heart className="w-5 h-5" />,
      summary: `Your Soul Urge (Heart's Desire) number is ${nameNumbers.soulUrgeNumber}. This reflects your inner cravings, secret desires, and what truly motivates you from within.`,
      fullContent: `The Soul Urge number reveals what your soul truly desires and what brings you the most inner satisfaction. It often describes the "you" that only those closest to you get to see. With a Soul Urge of ${nameNumbers.soulUrgeNumber}, your inner world is driven by these specific spiritual and emotional needs.`,
    },
    {
      title: "Personality Number",
      number: nameNumbers.personalityNumber,
      icon: <User className="w-5 h-5" />,
      summary: `Your Personality number is ${nameNumbers.personalityNumber}. This represents the "outer you"—how others perceive you when they first meet you.`,
      fullContent: `The Personality number acts as the "front porch" of your character. It determines the initial impression you make on the world and the traits you are most comfortable showing to strangers. A Personality number of ${nameNumbers.personalityNumber} indicates how you project yourself in social and professional settings.`,
    },
  ]

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-2xl font-bold">Name Analysis</h3>
        <p className="text-muted-foreground text-sm">Derived from your full name</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {interpretations.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <InterpretationCard
              title={`${item.title}: ${item.number}`}
              summary={item.summary}
              fullContent={item.fullContent}
              icon={item.icon}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
