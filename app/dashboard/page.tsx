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
import RecentActivities from "@/components/recent-activities"

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Role Switcher */}
          <Card className="lg:col-span-3">
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
          <Card className="lg:col-span-9">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {/* Always available actions */}
                <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/dashboard/daily-planner")}>
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs text-center leading-tight px-1">Daily Planner</span>
                </Button>
                <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/communities")}>
                  <Users className="h-5 w-5" />
                  <span className="text-xs text-center leading-tight px-1">Community</span>
                </Button>
                
                {/* Business role actions - only show when business_enabled is true */}
                {profile?.business_enabled && (
                  <>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/business/dashboard")}>
                      <Building2 className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Business Dashboard</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/marketplace/upload")}>
                      <Store className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Upload Products</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/dashboard/finance")}>
                      <DollarSign className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Sales Analytics</span>
                    </Button>
                  </>
                )}

                {/* Creator role actions - only show when creator_enabled is true */}
                {profile?.creator_enabled && (
                  <>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/creator/dashboard")}>
                      <Palette className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Creator Studio</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/creator/content")}>
                      <PenTool className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Content Manager</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/creator/analytics")}>
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Creator Analytics</span>
                    </Button>
                  </>
                )}

                {/* Investor role actions - only show when investor_enabled is true */}
                {profile?.investor_enabled && (
                  <>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/dashboard/investments")}>
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Investment Portfolio</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/investor/opportunities")}>
                      <Target className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Investment Opportunities</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/investor/analytics")}>
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Investment Analytics</span>
                    </Button>
                  </>
                )}

                {/* Mentor role actions - only show when mentor_enabled is true */}
                {profile?.mentor_enabled && (
                  <>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/mentor/dashboard")}>
                      <GraduationCap className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Mentor Dashboard</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/mentor/sessions")}>
                      <UserCheck className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Mentoring Sessions</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/mentor/students")}>
                      <Users className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">My Students</span>
                    </Button>
                  </>
                )}

                {/* Buyer actions - show when business role is NOT enabled (default buyer mode) */}
                {!profile?.business_enabled && (
                  <>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/marketplace")}>
                      <ShoppingCart className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">Browse Products</span>
                    </Button>
                    <Button variant="outline" className="h-24 w-full flex flex-col gap-2 p-2" onClick={() => router.push("/dashboard/purchases")}>
                      <DollarSign className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight px-1">My Purchases</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Communities */}
          <Card className="lg:col-span-6">
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
          <Card className="lg:col-span-6">
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
          <Card className="lg:col-span-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivities />
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="lg:col-span-6">
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