"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  MessageSquare,
  BarChart3,
  PlusCircle,
  Eye,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  Building2,
} from "lucide-react"
import { BusinessOverviewCards } from "@/components/business/business-overview-cards"
import { FinanceSnapshot } from "@/components/business/finance-snapshot"
import { OrdersInquiriesSection } from "@/components/business/orders-inquiries-section"
import { ProductServiceManager } from "@/components/business/product-service-manager"
import { CompanyProfileSection } from "@/components/business/company-profile-section"
import { BusinessGoalsTracker } from "@/components/business/business-goals-tracker"
import { TeamPermissions } from "@/components/business/team-permissions"
import { useAuth } from "@/hooks/use-auth"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { useOverlay } from "@/components/overlay/overlay-provider"
import Link from "next/link"

interface BusinessMetrics {
  totalRevenue: number
  revenueChange: number
  orders: number
  ordersChange: number
  activeProducts: number
  productsChange: number
  customerRating: number
  ratingChange: number
  visits: number
  visitsChange: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  time: string
  status: string
}

interface DashboardOrder {
  id: string
  type: string
  customerName: string
  customerAvatar: string
  productTitle: string
  amount?: number
  status: string
  orderDate: string
}

export default function BusinessDashboardPage() {
  const { user, profile } = useAuth()
  const { showOverlay, hideOverlay } = useOverlay()
  const [companyProfile, setCompanyProfile] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch business data
  useEffect(() => {
    if (!user?.id) return
    ;(async () => {
      await fetchCompanyProfile()
      await fetchBusinessData()
    })()
  }, [user?.id])

  const fetchBusinessData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      showOverlay()
      setError(null)
      
      const supabase = getSupabaseClient()
      
      // Fetch user's products from the new products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (productsError) {
        console.error('Error fetching products:', productsError)
        // Don't show error toast for products, just log it
        console.log('Products table might not exist yet, continuing with other data...')
      }

      // Fetch orders (if you have an orders table)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch profile visits (if you have analytics)
      const { data: analytics, error: analyticsError } = await supabase
        .from('profile_analytics')
        .select('*')
        .eq('user_id', user.id)

      // Calculate metrics
      const activeProducts = products?.length || 0
      const totalOrders = ordersData?.length || 0
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const profileVisits = analytics?.reduce((sum, visit) => sum + (visit.visit_count || 0), 0) || 0
      
      // Calculate total product value
      const totalProductValue = products?.reduce((sum, product) => {
        const price = product.sales_price || product.actual_price || 0
        return sum + price
      }, 0) || 0
      
      // Calculate changes (mock for now - replace with real calculations)
      const revenueChange = 12.4
      const ordersChange = 5.9
      const productsChange = 7.1
      const ratingChange = 1.3
      const visitsChange = 4.5
      const customerRating = 4.7

      setMetrics({
        totalRevenue,
        revenueChange,
        orders: totalOrders,
        ordersChange,
        activeProducts,
        productsChange,
        customerRating,
        ratingChange,
        visits: profileVisits,
        visitsChange
      })

      // Process recent activity from orders and other sources
      const activity: RecentActivity[] = []
      
      // Add new products as activity
      if (products && products.length > 0) {
        const recentProducts = products.slice(0, 3) // Show last 3 products
        recentProducts.forEach((product) => {
          activity.push({
            id: `product-${product.id}`,
            type: 'product',
            title: 'New product added',
            description: `${product.name} - ${formatCurrency(product.sales_price || product.actual_price)}`,
            time: formatTimeAgo(product.created_at),
            status: product.status === 'active' ? 'positive' : 'pending'
          })
        })
      }
      
      if (ordersData) {
        ordersData.forEach((order, index) => {
          activity.push({
            id: order.id || `order-${index}`,
            type: 'order',
            title: `New order from ${order.customer_name || 'Customer'}`,
            description: `${order.product_title || 'Product'} - ${formatCurrency(order.total_amount || 0)}`,
            time: formatTimeAgo(order.created_at),
            status: order.status || 'pending'
          })
        })
      }

      // Add profile visits as activity if available
      if (analytics && analytics.length > 0) {
        const recentVisits = analytics.slice(0, 2)
        recentVisits.forEach((visit, index) => {
          activity.push({
            id: `visit-${index}`,
            type: 'visit',
            title: 'Profile visit',
            description: `${visit.visit_count || 1} new profile view${visit.visit_count > 1 ? 's' : ''}`,
            time: formatTimeAgo(visit.created_at || new Date().toISOString()),
            status: 'new'
          })
        })
      }

      // Sort activities by time (most recent first)
      activity.sort((a, b) => {
        const timeA = a.time.includes('ago') ? 
          (a.time.includes('minutes') ? parseInt(a.time) : 
           a.time.includes('hours') ? parseInt(a.time) * 60 : 
           a.time.includes('days') ? parseInt(a.time) * 1440 : 0) : 0
        const timeB = b.time.includes('ago') ? 
          (b.time.includes('minutes') ? parseInt(b.time) : 
           b.time.includes('hours') ? parseInt(b.time) * 60 : 
           b.time.includes('days') ? parseInt(b.time) * 1440 : 0) : 0
        return timeA - timeB
      })

      setRecentActivity(activity.slice(0, 4))
      setOrders(ordersData || [])

    } catch (err) {
      console.error('Error fetching business data:', err)
      setError('Failed to fetch business data')
      toast.error('Failed to load business dashboard')
    } finally {
      setLoading(false)
      hideOverlay()
    }
  }

  const fetchCompanyProfile = async () => {
    if (!user?.id) return
    const supabase = getSupabaseClient()
    try {
      showOverlay()
      // Try to get existing company profile by owner_id
      let { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching company:', error)
      }

      // Create a minimal company profile if none exists
      if (!company) {
        const minimal = {
          owner_id: user.id,
          name: profile?.business_name || profile?.first_name || 'Company Name',
          description: '',
          industry: '',
          location: '',
          website: '',
          email: profile?.email || '',
          phone: '',
          team_size: '',
          founded: '',
          logo: null,
          social_links: {},
          featured: false,
          size: '',
        }
        const { data: created, error: createErr } = await supabase
          .from('companies')
          .insert(minimal)
          .select('*')
          .single()
        if (!createErr) company = created
      }

      if (company) {
        // Map DB to UI shape expected by CompanyProfileSection
        setCompanyProfile({
          id: company.id,
          name: company.name,
          description: company.description,
          industry: company.industry,
          location: company.location,
          website: company.website,
          email: company.email,
          phone: company.phone,
          teamSize: company.team_size,
          founded: company.founded,
          logo: company.logo,
          socialLinks: company.social_links || {},
        })
      }
    } finally {
      hideOverlay()
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    showOverlay()
    await fetchBusinessData()
    setRefreshing(false)
    toast.success('Dashboard refreshed')
    hideOverlay()
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "product":
        return <Package className="h-4 w-4" />
      case "inquiry":
        return <MessageSquare className="h-4 w-4" />
      case "review":
        return <Users className="h-4 w-4" />
      case "visit":
        return <Eye className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  // Check if user has business access
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to access the Business Dashboard.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Business Access Required</h2>
            <p className="text-muted-foreground mb-4">
              You need business access to view this dashboard. Please contact support to enable business features.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your business dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchBusinessData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Business Dashboard</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Welcome back, {profile?.first_name || profile?.business_name || 'Business Owner'}! 
                Manage your business operations, track performance, and grow your presence in the diaspora marketplace.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="bg-background/50 backdrop-blur-sm border-white/20 text-white hover:bg-background/70"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && <BusinessOverviewCards metrics={metrics} />}

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest updates from your business</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm text-foreground truncate">{activity.title}</p>
                              <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common business tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Product
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Orders
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                            {/* Performance Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>This Month</CardTitle>
                <CardDescription>Performance summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{metrics ? formatCurrency(metrics.totalRevenue) : '$0'}</span>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orders</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{metrics?.orders || 0}</span>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Customers</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{metrics?.visits || 0}</span>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
              </div>
            </div>

            {/* Goals Tracker */}
            <BusinessGoalsTracker goals={[]} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrdersInquiriesSection orders={[]} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductServiceManager />
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance">
            <FinanceSnapshot />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {companyProfile && (
              <CompanyProfileSection
                profile={companyProfile}
                onSaved={(updated) => setCompanyProfile(updated)}
              />
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamPermissions teamMembers={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
