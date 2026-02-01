"use client"

import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Gender } from "@/lib/numerology/types"

interface ReportButtonProps {
  name: string
  dob: string
  gender: Gender
}

export function ReportButton({ name, dob, gender }: ReportButtonProps) {
  const handleDownload = () => {
    // Trigger download via API route
    const params = new URLSearchParams({ name, dob, gender })
    // Use window.open to open in new tab or specific location to trigger download
    // For attachments, simple navigation works, but window.open is safer for avoiding UI disruptions
    window.location.href = `/api/report?${params.toString()}`
  }

  return (
    <Button onClick={handleDownload} variant="outline" className="gap-2 w-full sm:w-auto">
      <FileText className="w-4 h-4" />
      Download Detailed Report
    </Button>
  )
}
