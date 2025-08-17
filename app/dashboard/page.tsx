"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Calendar, 
  Target, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Building2,
  DollarSign,
  Heart,
  Shield,
  Store,
  Crown,
  MapPin,
  PenTool
} from "lucide-react"
import { RoleSwitcher } from "@/components/role-switcher"

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  // Helper function to get first name from full name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return 'User'
    return fullName.split(' ')[0]
  }

  // Get the best available name for display
  const getDisplayName = () => {
    return getFirstName(profile?.full_name || (user as any)?.user_metadata?.full_name || user.email?.split('@')[0])
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])



  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {getDisplayName()}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {profile?.full_name || (user as any)?.user_metadata?.full_name || user.email}
              </p>
              {profile?.username && (
                <p className="text-sm text-primary font-medium mt-1">
                  Username: @{profile.username}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                Member
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message - Left Hand Corner */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Welcome, {getDisplayName()}! 🎉
                  </h2>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Ready to explore The New Alkebulan? Here's what you can do today.
                  </p>
                  {profile?.username && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2">
                      Your unique username: <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">@{profile.username}</span>
                    </p>
                  )}
                  
                  {/* Email Verification Notice */}
                  {user.email && !user.email_confirmed_at && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          Please verify your email address to unlock all features
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Check your inbox for a verification link from {user.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info - Remove this after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Business Enabled: {profile?.business_enabled ? 'Yes' : 'No'}</p>
            <p>Buyer Enabled: {profile?.buyer_enabled ? 'Yes' : 'No'}</p>
            <p>Account Type: {profile?.account_type}</p>
            <p>Profile ID: {profile?.id}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Role Switcher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Switch Mode
              </CardTitle>
              <CardDescription>
                Toggle between buyer and business activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleSwitcher 
                onRoleChange={async (role) => {
                  // Wait a moment for the database update to complete
                  await new Promise(resolve => setTimeout(resolve, 500))
                  // Force a re-render when role changes
                  window.location.reload()
                }}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with your journey in The New Alkebulan
              </CardDescription>
            </CardHeader>
            <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/dashboard/daily-planner")}>
                   <Calendar className="h-6 w-6" />
                   <span className="text-xs">Daily Planner</span>
                 </Button>
                 <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/community")}>
                   <Users className="h-6 w-6" />
                   <span className="text-xs">Community</span>
                 </Button>
                 
                 {/* Dynamic actions based on current role */}
                 {profile?.business_enabled ? (
                   <>
                     <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/business/dashboard")}>
                       <Building2 className="h-6 w-6" />
                       <span className="text-xs">Business Dashboard</span>
                     </Button>
                     <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/marketplace/upload")}>
                       <Store className="h-6 w-6" />
                       <span className="text-xs">Upload Products</span>
                     </Button>
                     <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/dashboard/finance")}>
                       <DollarSign className="h-6 w-6" />
                       <span className="text-xs">Sales Analytics</span>
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/marketplace")}>
                       <ShoppingCart className="h-6 w-6" />
                       <span className="text-xs">Browse Products</span>
                     </Button>
                     <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/dashboard/finance")}>
                       <DollarSign className="h-6 w-6" />
                       <span className="text-xs">My Purchases</span>
                     </Button>
                     <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/dashboard/investments")}>
                       <TrendingUp className="h-6 w-6" />
                       <span className="text-xs">Investments</span>
                     </Button>
                   </>
                 )}
               </div>
            </CardContent>
          </Card>

          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{user.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                     <div className="flex flex-wrap gap-1 mt-1">
                     {profile?.business_enabled ? (
                       <Badge 
                         variant="default" 
                         className="text-xs capitalize bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                       >
                         <Building2 className="w-3 h-3 mr-1" />
                         Business Mode
                       </Badge>
                     ) : (
                       <Badge 
                         variant="default" 
                         className="text-xs capitalize bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"
                       >
                         <ShoppingCart className="w-3 h-3 mr-1" />
                         Buyer Mode
                       </Badge>
                     )}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {profile?.location || profile?.region || 'Location not set'}, {profile?.country || 'Country not set'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Community Points</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Projects</span>
                <Badge variant="secondary">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connections</span>
                <Badge variant="secondary">0</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Welcome to The New Alkebulan!</p>
                    <p className="text-xs text-muted-foreground">Your account has been created successfully.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No recent activity yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Start exploring to see your activity here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/dashboard/finance")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Finance
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/health")}>
                <Heart className="h-4 w-4 mr-2" />
                Health & Wellness
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/governance")}>
                <Shield className="h-4 w-4 mr-2" />
                Governance
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/join-the-team")}>
                <Users className="h-4 w-4 mr-2" />
                Join The Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 