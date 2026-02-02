import { Mail, Sparkles } from "lucide-react"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/auth/get-auth-user"
import { NotificationManager } from "@/components/social/notification-manager"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/login?next=/profile")
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">
          Your Profile
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {user.photoURL ? (
                  // biome-ignore lint/performance/noImgElement: External auth provider image
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  (user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium">{user.displayName || "Anonymous User"}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Membership Status</span>
              </div>
              <Badge variant={user.isPremium ? "default" : "secondary"}>
                {user.isPremium ? "Premium" : "Free Tier"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Preferences</CardTitle>
            <CardDescription>Manage how Numero communicates with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Daily Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive your daily forecast and cosmic insights.
                </div>
              </div>
              <NotificationManager />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
