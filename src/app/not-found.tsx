import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <h1 className="relative text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary/50 to-transparent">
            404
          </h1>
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Cosmic Void Detected
          </h2>
          <p className="text-muted-foreground">
            The numbers don't add up here. This path leads to the unknown. Let's guide you back to
            alignment.
          </p>
        </div>

        <div className="flex justify-center gap-4 relative z-10">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
