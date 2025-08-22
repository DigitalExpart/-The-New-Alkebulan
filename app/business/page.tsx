"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Target, ArrowRight, Building2, BarChart3, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface BusinessStats {
  totalRevenue: number
  totalOrders: number
  activeProducts: number
  customerRating: number
  profileVisits: number
  totalCustomers: number
}

interface BusinessTool {
  title: string
  description: string
  icon: any
  href: string
  color: string
}

export default function BusinessPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<BusinessStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const businessTools: BusinessTool[] = [
    {
      title: "Business Dashboard",
      description: "Monitor your business performance and analytics",
      icon: BarChart3,
      href: "/business/dashboard",
      color: "bg-primary",
    },
    {
      title: "Long-term Planning",
      description: "Strategic planning tools for business growth",
      icon: Target,
      href: "/business/long-term-planning",
      color: "bg-primary",
    },
    {
      title: "Process Management",
      description: "Streamline your business operations",
      icon: Building2,
      href: "/process-management",
      color: "bg-primary",
    },
    {
      title: "Investment Opportunities",
      description: "Explore funding and investment options",
      icon: TrendingUp,
      href: "/funding",
      color: "bg-primary",
    },
  ]

  // Fetch business statistics
  useEffect(() => {
    if (!user?.id) return

    const fetchBusinessStats = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = getSupabaseClient()
        
        // Fetch user's business statistics
        const { data: products, error: productsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'product')

        if (productsError) {
          console.error('Error fetching products:', productsError)
          toast.error('Failed to fetch product data')
          return
        }

        // Fetch orders (if you have an orders table)
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('seller_id', user.id)

        // Fetch profile visits (if you have analytics)
        const { data: analytics, error: analyticsError } = await supabase
          .from('profile_analytics')
          .select('*')
          .eq('user_id', user.id)

        // Calculate statistics
        const activeProducts = products?.length || 0
        const totalOrders = orders?.length || 0
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
        const profileVisits = analytics?.reduce((sum, visit) => sum + (visit.visit_count || 0), 0) || 0
        
        // Mock some data for now (replace with real calculations)
        const customerRating = 4.7
        const totalCustomers = orders?.length || 0

        setStats({
          totalRevenue,
          totalOrders,
          activeProducts,
          customerRating,
          profileVisits,
          totalCustomers
        })

      } catch (err) {
        console.error('Error fetching business stats:', err)
        setError('Failed to fetch business statistics')
        toast.error('Failed to load business data')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinessStats()
  }, [user?.id])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format number with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Check if user has business access
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to access the Business Hub.</p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile?.business_enabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Business Access Required</h2>
            <p className="text-muted-foreground mb-4">
              You need business access to view this page. Please contact support to enable business features.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Hub</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || profile?.business_name || 'Business Owner'}! 
            Grow your business with our comprehensive suite of tools and resources.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="mb-8">
            <Card className="bg-destructive/10 border-destructive">
              <CardContent className="p-6">
                <p className="text-destructive text-center">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 mx-auto block"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalOrders)}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.activeProducts}</p>
                    <p className="text-sm text-muted-foreground">Active Products</p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.customerRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Customer Rating</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Business Tools */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Business Tools</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh Data
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessTools.map((tool, index) => (
              <Card key={index} className="bg-card border-border hover:border-primary transition-colors group">
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <tool.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-foreground">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{tool.description}</p>
                  <Link href={tool.href}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Access Tool
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sell Product Section */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              Sell Your Products
            </CardTitle>
            <p className="text-muted-foreground">
              Reach customers worldwide by listing your products on our marketplace
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Start Selling Today</h3>
                <p className="text-muted-foreground mb-4">
                  Upload digital goods, physical products, services, and more to reach the diaspora community.
                </p>
                {stats && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Your Current Status:</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        {stats.activeProducts} Active Products
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {stats.totalOrders} Total Orders
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        {formatCurrency(stats.totalRevenue)} Revenue
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Digital Products</Badge>
                  <Badge variant="secondary" className="text-xs">Physical Goods</Badge>
                  <Badge variant="secondary" className="text-xs">Services</Badge>
                  <Badge variant="secondary" className="text-xs">Art & Crafts</Badge>
                  <Badge variant="secondary" className="text-xs">Food & Beverages</Badge>
                </div>
              </div>
              <Link href="/marketplace/upload">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                  <Plus className="mr-3 h-6 w-6" />
                  Sell Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/business/dashboard">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Business Dashboard
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Browse Projects
                </Button>
              </Link>
              <Link href="/learning/mentorship">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                >
                  Find a Mentor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
