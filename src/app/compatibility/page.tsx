"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ArrowLeft, HeartHandshake, Loader2, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getCompatibility } from "@/app/actions/compatibility"
import { CompatibilityResult } from "@/components/numerology/compatibility-result"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
      gender: "Female",
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

  const resetForm = () => {
    setResult(null)
    setError(null)
  }

  if (!isHydrated || !profile) return null

  return (
    <main className="min-h-screen bg-background bg-cosmic p-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mb-8 flex items-center justify-between"
      >
        <Link href="/">
          <Button variant="ghost" className="gap-2 hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-rose-400">
          <HeartHandshake className="text-primary" /> Compatibility
        </h1>
      </motion.div>

      <div className="w-full flex justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <Card className="border-primary/20 backdrop-blur-sm bg-card/50">
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
                              <Input
                                placeholder="Enter name"
                                {...field}
                                className="bg-background/50"
                              />
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
                              <Input type="date" {...field} className="bg-background/50" />
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
                                <SelectTrigger className="bg-background/50">
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

                      <Button
                        type="submit"
                        className="w-full relative overflow-hidden group"
                        disabled={loading}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative flex items-center justify-center">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Cosmic
                              Bonds...
                            </>
                          ) : (
                            "Analyze Compatibility"
                          )}
                        </span>
                      </Button>

                      {error && (
                        <Alert
                          variant="destructive"
                          className="bg-destructive/10 border-destructive/20 mt-4"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Analysis Failed</AlertTitle>
                          <AlertDescription className="flex flex-col gap-2">
                            {error}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={form.handleSubmit(onSubmit)}
                              className="mt-2 w-fit bg-transparent border-destructive/30 hover:bg-destructive/10"
                            >
                              <RefreshCcw className="mr-2 h-3 w-3" /> Retry Analysis
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center gap-8"
            >
              <CompatibilityResult
                analysis={result.analysis}
                user={{
                  name: profile.name,
                  dob: profile.dob,
                  gender: profile.gender,
                  moolank: result.userNums.moolank,
                  bhagyank: result.userNums.bhagyank,
                  gridNumbers: result.userNums.gridNumbers,
                }}
                partner={{
                  name: form.getValues().name,
                  dob: form.getValues().dob,
                  gender: form.getValues().gender,
                  moolank: result.partnerNums.moolank,
                  bhagyank: result.partnerNums.bhagyank,
                  gridNumbers: result.partnerNums.gridNumbers,
                }}
              />
              <Button
                variant="outline"
                onClick={resetForm}
                className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 px-8"
              >
                <RefreshCcw className="w-4 h-4" /> Check Another Synergy
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
