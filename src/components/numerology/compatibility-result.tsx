"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompatibilityResultProps {
  analysis: string
  user: { name: string; moolank: number; bhagyank: number }
  partner: { name: string; moolank: number; bhagyank: number }
}

export function CompatibilityResult({ analysis, user, partner }: CompatibilityResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 w-full max-w-4xl"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        {/* User Card */}
        <Card className="flex-1 w-full bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">{user.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold">{user.moolank}</div>
              <div className="text-xs text-muted-foreground uppercase">Moolank</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user.bhagyank}</div>
              <div className="text-xs text-muted-foreground uppercase">Bhagyank</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-pulse" />
        </div>

        {/* Partner Card */}
        <Card className="flex-1 w-full bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-center">{partner.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold">{partner.moolank}</div>
              <div className="text-xs text-muted-foreground uppercase">Moolank</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{partner.bhagyank}</div>
              <div className="text-xs text-muted-foreground uppercase">Bhagyank</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Cosmic Synergy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
