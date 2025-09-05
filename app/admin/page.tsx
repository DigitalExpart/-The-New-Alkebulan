"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Store, Settings, BarChart3, Package, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [counts, setCounts] = useState({ users: 0, communities: 0, posts: 0, items: 0, orders: 0, companies: 0 })

  // Determine admin access based on available profile fields
  const isAdmin = Boolean(
    profile?.is_admin === true ||
    profile?.role === "admin" ||
    (Array.isArray(profile?.selected_roles) && profile.selected_roles.includes("admin"))
  )

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login")
      } else if (!isAdmin) {
        router.push("/dashboard")
      }
    }
  }, [loading, user, isAdmin, router])

  useEffect(() => {
    const loadCounts = async () => {
      if (!supabase) return
      try {
        const [{ count: users }, { count: communities }] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('communities').select('*', { count: 'exact', head: true })
        ])
        let posts = 0
        try {
          const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true })
          posts = count || 0
        } catch {}
        let items = 0
        try {
          const { count } = await supabase.from('marketplace_items').select('*', { count: 'exact', head: true })
          items = count || 0
        } catch {}
        let products = 0
        try {
          const { count } = await supabase.from('products').select('*', { count: 'exact', head: true })
          products = count || 0
        } catch {}
        const itemsTotal = items || products
        let orders = 0
        try {
          const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
          orders = count || 0
        } catch {}
        let companies = 0
        try {
          const { count } = await supabase.from('companies').select('*', { count: 'exact', head: true })
          companies = count || 0
        } catch {}
        setCounts({ users: users || 0, communities: communities || 0, posts, items: itemsTotal, orders, companies })
      } catch {}
    }
    loadCounts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Console</h1>
              <p className="text-muted-foreground">Manage platform users, content, and commerce</p>
            </div>
          </div>
          <Badge variant="secondary">Admin Access</Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="commerce">Commerce</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> User Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Approve, suspend, or elevate user roles.</p>
                  <div className="text-xs text-muted-foreground">Total users: {counts.users}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/users">Open</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/profile/role-management">Role Settings</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" /> Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Moderate listings, disputes, and payouts.</p>
                  <div className="text-xs text-muted-foreground">Items: {counts.items}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/marketplace">Open</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/dashboard/finance">Finance</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Community & Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Moderate communities, posts, and reports.</p>
                  <div className="text-xs text-muted-foreground">Communities: {counts.communities} · Posts: {counts.posts}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/content">Open</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/communities">Communities</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Traffic, sales, and engagement insights.</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/analytics">View</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/dashboard">User Dashboard</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" /> Products & Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Manage items and order issues.</p>
                  <div className="text-xs text-muted-foreground">Products: {counts.items} · Orders: {counts.orders}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/orders">Open</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/marketplace">Marketplace</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Investments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Create investable projects and track funding.</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/investments">Open</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/investing/more-projects">Explore</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" /> Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Browse and manage registered companies.</p>
                  <div className="text-xs text-muted-foreground">Total: {counts.companies}</div>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/marketplace/companies">Open</Link></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Platform Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Feature flags, policies, and appearance.</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm"><Link href="/admin/settings">Open</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/settings">User Settings</Link></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Build user moderation tools here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commerce">
            <Card>
              <CardHeader>
                <CardTitle>Commerce Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Link business dashboards and add admin-only controls.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Integrate community and posts moderation queues.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Add feature flags and configuration forms.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


