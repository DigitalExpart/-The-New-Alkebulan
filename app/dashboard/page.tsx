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
  PenTool,
  Palette,
  BarChart3,
  GraduationCap,
  UserCheck
} from "lucide-react"
import { RoleSwitcher } from "@/components/role-switcher"
import MyCommunities from "@/components/my-communities"

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
    if (!user) return 'User'
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
                Ready to explore The New Alkebulan? Here's what you can do today.
              </p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Always available actions */}
                <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/dashboard/daily-planner")}>
                  <Calendar className="h-6 w-6" />
                  <span className="text-xs">Daily Planner</span>
                </Button>
                <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/communities")}>
                  <Users className="h-6 w-6" />
                  <span className="text-xs">Community</span>
                </Button>
                
                {/* Business role actions - only show when business_enabled is true */}
                {profile?.business_enabled && (
                  <>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/business/dashboard")}>
                      <Building2 className="h-6 w-6" />
                      <span className="text-xs">Business Dashboard</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/marketplace/upload")}>
                      <Store className="h-6 w-6" />
                      <span className="text-xs">Upload Products</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/dashboard/finance")}>
                      <DollarSign className="h-6 w-6" />
                      <span className="text-xs">Sales Analytics</span>
                    </Button>
                  </>
                )}

                {/* Creator role actions - only show when creator_enabled is true */}
                {profile?.creator_enabled && (
                  <>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/creator/dashboard")}>
                      <Palette className="h-6 w-6" />
                      <span className="text-xs">Creator Studio</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/creator/content")}>
                      <PenTool className="h-6 w-6" />
                      <span className="text-xs">Content Manager</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/creator/analytics")}>
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-xs">Creator Analytics</span>
                    </Button>
                  </>
                )}

                {/* Investor role actions - only show when investor_enabled is true */}
                {profile?.investor_enabled && (
                  <>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/dashboard/investments")}>
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-xs">Investment Portfolio</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/investor/opportunities")}>
                      <Target className="h-6 w-6" />
                      <span className="text-xs">Investment Opportunities</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/investor/analytics")}>
                      <BarChart3 className="h-6 w-6" />
                      <span className="text-xs">Investment Analytics</span>
                    </Button>
                  </>
                )}

                {/* Mentor role actions - only show when mentor_enabled is true */}
                {profile?.mentor_enabled && (
                  <>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/mentor/dashboard")}>
                      <GraduationCap className="h-6 w-6" />
                      <span className="text-xs">Mentor Dashboard</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/mentor/sessions")}>
                      <UserCheck className="h-6 w-6" />
                      <span className="text-xs">Mentoring Sessions</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/mentor/students")}>
                      <Users className="h-6 w-6" />
                      <span className="text-xs">My Students</span>
                    </Button>
                  </>
                )}

                {/* Buyer actions - show when business role is NOT enabled (default buyer mode) */}
                {!profile?.business_enabled && (
                  <>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/marketplace")}>
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-xs">Browse Products</span>
                    </Button>
                    <Button variant="outline" className="h-20 w-36 flex flex-col gap-2" onClick={() => router.push("/dashboard/purchases")}>
                      <DollarSign className="h-6 w-6" />
                      <span className="text-xs">My Purchases</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Communities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Communities
              </CardTitle>
              <CardDescription>
                Communities you've created and manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyCommunities />
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