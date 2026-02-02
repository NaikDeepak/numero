"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InterpretationCardProps {
  title: string
  summary: string
  fullContent?: string | React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function InterpretationCard({
  title,
  summary,
  fullContent,
  className,
  icon,
}: InterpretationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasMore = Boolean(fullContent)

  return (
    <Card
      className={cn("overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm", className)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle className="text-lg font-bold text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground leading-relaxed">{summary}</div>

        <AnimatePresence initial={false}>
          {isExpanded && fullContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-2 text-sm text-muted-foreground leading-relaxed border-t border-primary/5 mt-2">
                {fullContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 h-8 text-xs font-semibold hover:bg-primary/5 hover:text-primary transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Read Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Read More
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
