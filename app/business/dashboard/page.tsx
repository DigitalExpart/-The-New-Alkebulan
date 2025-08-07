"use client"

import { useState } from "react"
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
} from "lucide-react"
import { BusinessOverviewCards } from "@/components/business/business-overview-cards"
import { FinanceSnapshot } from "@/components/business/finance-snapshot"
import { OrdersInquiriesSection } from "@/components/business/orders-inquiries-section"
import { ProductServiceManager } from "@/components/business/product-service-manager"
import { CompanyProfileSection } from "@/components/business/company-profile-section"
import { BusinessGoalsTracker } from "@/components/business/business-goals-tracker"
import { TeamPermissions } from "@/components/business/team-permissions"
import { mockBusinessMetrics, mockBusinessGoals, mockBusinessOrders, mockTeamMembers } from "@/data/business-data"

export default function BusinessDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const recentActivity = [
    {
      id: 1,
      type: "order",
      title: "New order from Sarah Johnson",
      description: "Handwoven basket - $85",
      time: "2 minutes ago",
      status: "pending",
    },
    {
      id: 2,
      type: "inquiry",
      title: "Product inquiry",
      description: "Question about custom jewelry",
      time: "15 minutes ago",
      status: "new",
    },
    {
      id: 3,
      type: "review",
      title: "New 5-star review",
      description: "Amazing quality and fast shipping!",
      time: "1 hour ago",
      status: "positive",
    },
    {
      id: 4,
      type: "payment",
      title: "Payment received",
      description: "$125 from Marcus Williams",
      time: "3 hours ago",
      status: "completed",
    },
  ]

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
      case "inquiry":
        return <MessageSquare className="h-4 w-4" />
      case "review":
        return <Users className="h-4 w-4" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Business Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Manage your business operations, track performance, and grow your presence in the diaspora marketplace.
          </p>
        </div>

        {/* Quick Stats */}
        <BusinessOverviewCards metrics={mockBusinessMetrics} />

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
                        <span className="font-medium">{formatCurrency(mockBusinessMetrics.totalRevenue)}</span>
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Orders</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{mockBusinessMetrics.orders}</span>
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">New Customers</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{mockBusinessMetrics.visits}</span>
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Goals Tracker */}
            <BusinessGoalsTracker goals={mockBusinessGoals} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrdersInquiriesSection orders={mockBusinessOrders} />
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
            <CompanyProfileSection />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <TeamPermissions teamMembers={mockTeamMembers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
