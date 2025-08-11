"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Plus,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function UnifiedDashboardPage() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

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
          <p className="text-muted-foreground">Loading unified dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check if user has both roles
  const hasBothRoles = profile?.buyer_enabled && profile?.seller_enabled
  const hasBuyerRole = profile?.buyer_enabled
  const hasSellerRole = profile?.seller_enabled

  if (!hasBothRoles) {
    // Redirect to main dashboard if not both roles
    router.push("/dashboard")
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Unified Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage both your buyer and seller activities
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-sm">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buyer
                </Badge>
                <Badge variant="default" className="text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Crown className="w-4 h-4 mr-1" />
                  Seller
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Main Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="buyer">Buyer Activities</TabsTrigger>
            <TabsTrigger value="seller">Seller Activities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Buyer Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Buyer Stats</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </CardContent>
              </Card>

              {/* Seller Stats */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Seller Stats</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </CardContent>
              </Card>

              {/* Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </CardContent>
              </Card>

              {/* Products */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Listed Products</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Access your buyer and seller tools quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/marketplace")}>
                    <ShoppingCart className="h-6 w-6" />
                    <span className="text-xs">Browse Products</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/marketplace/upload")}>
                    <Plus className="h-6 w-6" />
                    <span className="text-xs">List Product</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/seller/dashboard")}>
                    <Store className="h-6 w-6" />
                    <span className="text-xs">Seller Dashboard</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/dashboard/orders")}>
                    <Package className="h-6 w-6" />
                    <span className="text-xs">My Orders</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buyer Activities Tab */}
          <TabsContent value="buyer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Buyer Activities
                </CardTitle>
                <CardDescription>
                  Manage your purchases, orders, and buyer preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => router.push("/marketplace")}>
                    <Eye className="h-5 w-5" />
                    <span className="text-sm">Browse Marketplace</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => router.push("/dashboard/orders")}>
                    <Package className="h-5 w-5" />
                    <span className="text-sm">My Orders</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => router.push("/dashboard/wishlist")}>
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">Wishlist</span>
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Recent Buyer Activity</h4>
                  <p className="text-sm text-muted-foreground">No recent buyer activity yet. Start shopping to see your history here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seller Activities Tab */}
          <TabsContent value="seller" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Seller Activities
                </CardTitle>
                <CardDescription>
                  Manage your store, products, and sales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => router.push("/seller/dashboard")}>
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Seller Dashboard</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => router.push("/marketplace/upload")}>
                    <Plus className="h-5 w-5" />
                    <span className="text-sm">Add Product</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col gap-2" onClick={() => router.push("/seller/orders")}>
                    <Package className="h-5 w-5" />
                    <span className="text-sm">Manage Orders</span>
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Recent Seller Activity</h4>
                  <p className="text-sm text-muted-foreground">No recent seller activity yet. Start listing products to see your sales here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Combined Analytics
                </CardTitle>
                <CardDescription>
                  View insights across both your buyer and seller activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Buyer Analytics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Spent</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Orders Placed</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Favorite Categories</span>
                        <span className="font-medium">None yet</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Seller Analytics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Earnings</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Products Listed</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Orders Received</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t mt-6 pt-4">
                  <h4 className="font-medium mb-2">Combined Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    As you use both buyer and seller features, you'll see combined insights here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
