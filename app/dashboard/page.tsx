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
  Crown
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

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
              <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground mt-1">
                {user.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                Member
              </Badge>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/dashboard/daily-planner")}>
                  <Calendar className="h-6 w-6" />
                  <span className="text-xs">Daily Planner</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/community")}>
                  <Users className="h-6 w-6" />
                  <span className="text-xs">Community</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/marketplace")}>
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-xs">Marketplace</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/business/dashboard")}>
                  <Building2 className="h-6 w-6" />
                  <span className="text-xs">Business</span>
                </Button>
                {profile?.account_type === 'seller' && (
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/seller/dashboard")}>
                    <Store className="h-6 w-6" />
                    <span className="text-xs">Seller Dashboard</span>
                  </Button>
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
                  {profile?.account_type && (
                    <Badge 
                      variant={profile.account_type === 'seller' ? "default" : "outline"} 
                      className={`text-xs mt-1 capitalize ${
                        profile.account_type === 'seller' 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0' 
                          : ''
                      }`}
                    >
                      {profile.account_type === 'seller' && <Crown className="w-3 h-3 mr-1" />}
                      {profile.account_type} Account
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
                Edit Profile
              </Button>
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