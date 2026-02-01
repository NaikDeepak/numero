"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, HeartHandshake, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getCompatibility } from "@/app/actions/compatibility"
import { CompatibilityResult } from "@/components/numerology/compatibility-result"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GenderSchema, type NumerologyResult } from "@/lib/numerology/types"
import { useHydratedProfile } from "@/store/use-profile-store"

const PartnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  gender: GenderSchema,
})

type PartnerFormValues = z.infer<typeof PartnerSchema>

interface CompatibilityData {
  analysis: string
  userNums: NumerologyResult
  partnerNums: NumerologyResult
}

export default function CompatibilityPage() {
  const { profile, isHydrated } = useHydratedProfile()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompatibilityData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(PartnerSchema),
    defaultValues: {
      name: "",
      dob: "",
      gender: "Female", // Default guess
    },
  })

  useEffect(() => {
    if (isHydrated && !profile) {
      router.push("/")
    }
  }, [isHydrated, profile, router])

  async function onSubmit(data: PartnerFormValues) {
    if (!profile) return
    setLoading(true)
    setError(null)

    try {
      const res = await getCompatibility(profile, data)
      if (res.error) {
        setError(res.error)
      } else {
        setResult(res as CompatibilityData)
      }
    } catch (_err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isHydrated || !profile) return null

  return (
    <main className="min-h-screen bg-background bg-cosmic p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HeartHandshake className="text-primary" /> Compatibility
        </h1>
      </div>

      {!result ? (
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader>
            <CardTitle>Check Compatibility</CardTitle>
            <CardDescription>
              Enter your partner's details to analyze your cosmic synergy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner's DOB</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner's Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    "Analyze Compatibility"
                  )}
                </Button>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full flex flex-col items-center gap-6">
          <CompatibilityResult
            analysis={result.analysis}
            user={{
              name: profile.name,
              moolank: result.userNums.moolank,
              bhagyank: result.userNums.bhagyank,
            }}
            partner={{
              name: form.getValues().name,
              moolank: result.partnerNums.moolank,
              bhagyank: result.partnerNums.bhagyank,
            }}
          />
          <Button variant="outline" onClick={() => setResult(null)}>
            Check Another
          </Button>
        </div>
      )}
    </main>
  )
}
