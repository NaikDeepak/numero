import { redirect } from "next/navigation"
import { getAuthUser } from "@/auth/get-auth-user"

export default async function PremiumReportsPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login?next=/reports/premium")
  }

  if (!user.isPremium) {
    redirect("/upgrade")
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full text-amber-600 dark:text-amber-400">
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
          <div>
            <h1 className="text-3xl font-serif text-gray-900 dark:text-gray-100">
              Premium Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Exclusive insights for premium members
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">
            Welcome to the inner circle. As a premium member, you have access to deeper analysis,
            extended compatibility reports, and advanced remedial measures.
          </p>

          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-medium mb-2">Detailed Forecasts</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Your daily predictions now include hour-by-hour guidance and color therapy.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-xl font-medium mb-2">Relationship Synergy</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Unlock full compatibility matrices for up to 5 partners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
