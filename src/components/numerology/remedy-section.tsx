"use client"

import { AlertCircle, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Remedy } from "@/lib/numerology/remedies"

interface RemedySectionProps {
  userName: string
  remedies: Remedy[]
}

export function RemedySection({ userName, remedies }: RemedySectionProps) {
  if (!remedies || remedies.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Remedial Measures for {userName}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {remedies.map((remedy) => (
          <Card
            key={remedy.number}
            className="bg-card/40 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="h-8 w-8 rounded-full flex items-center justify-center text-lg font-bold border-primary/20 bg-primary/5"
                  >
                    {remedy.number}
                  </Badge>
                  Missing Number
                </CardTitle>
                <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  Impact
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {remedy.impact.map((text) => (
                    <li key={text} className="leading-relaxed">
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-primary/5">
                <p className="text-[10px] uppercase tracking-widest font-bold text-primary">
                  Suggested Remedies
                </p>
                <ul className="space-y-2">
                  {remedy.remedies.map((text) => (
                    <li key={text} className="text-sm flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                      <span className="leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
