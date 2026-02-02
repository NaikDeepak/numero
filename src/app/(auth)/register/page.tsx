import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-background bg-cosmic">
      <div className="w-full max-w-md space-y-8 bg-card/50 backdrop-blur-xl p-8 rounded-2xl border border-border shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            Join Numero to unlock personalized daily insights
          </p>
        </div>
        <SignupForm />
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
