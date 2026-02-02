"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { togglePremiumStatus } from "@/app/actions/admin"
import { useAuth } from "@/auth/auth-provider"

export default function UpgradePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?next=/upgrade")
      return
    }

    setIsProcessing(true)
    try {
      // In a real app, this would redirect to Stripe checkout
      // For this demo, we just toggle the status via server action
      const result = await togglePremiumStatus()
      if (result.success) {
        // Force a hard refresh to ensure all server components pick up the new claim
        window.location.href = "/reports/premium"
      }
    } catch (error) {
      console.error("Upgrade failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Premium Icon"
            >
              <title>Premium Icon</title>
              <path d="M6 3h12l4 6-10 13L2 9z" />
              <path d="M11 3v6" />
              <path d="M13 3v6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Upgrade to Premium</h1>
          <p className="text-amber-100">Unlock your full numerological potential</p>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-8">
            <FeatureRow text="Detailed Life Path Analysis" />
            <FeatureRow text="Unlimited Compatibility Reports" />
            <FeatureRow text="Advanced Remedial Measures" />
            <FeatureRow text="Personalized Daily Guidance" />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Dev Mode: This button will instantly toggle your premium status without payment.
            </p>
          </div>

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={isProcessing}
            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : user?.isPremium ? (
              "Cancel Premium (Dev)"
            ) : (
              "Upgrade Now"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Checkmark"
        >
          <title>Checkmark</title>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-gray-700 dark:text-gray-300">{text}</span>
    </div>
  )
}
