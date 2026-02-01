"use client"

import { motion } from "framer-motion"
import { Heart, Share2, Download, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CompatibilityResultProps {
  analysis: string
  user: { name: string; moolank: number; bhagyank: number }
  partner: { name: string; moolank: number; bhagyank: number }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function CompatibilityResult({ analysis, user, partner }: CompatibilityResultProps) {
  const sharedMoolank = user.moolank === partner.moolank
  const sharedBhagyank = user.bhagyank === partner.bhagyank

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 w-full max-w-4xl"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row gap-6 items-center justify-center">
        {/* User Card */}
        <Card className="flex-1 w-full bg-primary/5 border-primary/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="text-center text-xl">{user.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center pb-8">
            <div className="relative">
              <div className={`text-4xl font-bold transition-colors ${sharedMoolank ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : ""}`}>
                {user.moolank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Moolank</div>
              {sharedMoolank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary/20 text-primary border-primary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
            <div className="relative">
              <div className={`text-4xl font-bold transition-colors ${sharedBhagyank ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : ""}`}>
                {user.bhagyank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Bhagyank</div>
              {sharedBhagyank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary/20 text-primary border-primary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center justify-center z-10"
        >
          <div className="relative">
            <Heart className="w-12 h-12 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]" />
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Sparkles className="w-16 h-16 text-primary/30" />
            </motion.div>
          </div>
        </motion.div>

        {/* Partner Card */}
        <Card className="flex-1 w-full bg-secondary/5 border-secondary/20 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="text-center text-xl">{partner.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-around text-center pb-8">
            <div className="relative">
              <div className={`text-4xl font-bold transition-colors ${sharedMoolank ? "text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)]" : ""}`}>
                {partner.moolank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Moolank</div>
              {sharedMoolank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary/20 text-secondary border-secondary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
            <div className="relative">
              <div className={`text-4xl font-bold transition-colors ${sharedBhagyank ? "text-secondary drop-shadow-[0_0_8px_rgba(var(--secondary),0.5)]" : ""}`}>
                {partner.bhagyank}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Bhagyank</div>
              {sharedBhagyank && (
                <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-secondary/20 text-secondary border-secondary/30 text-[8px] px-1 h-4">
                  MATCH
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="bg-card/40 backdrop-blur-md border-primary/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/40">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/20 hover:bg-background/40">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              Cosmic Synergy Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-p:leading-relaxed prose-headings:text-primary prose-strong:text-foreground dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
