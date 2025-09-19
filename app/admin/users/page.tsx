"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { UserModal } from "@/components/admin/UserModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Search, 
  Shield, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  UserCheck,
  UserX,
  Clock
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  last_sign_in_at?: string
  is_admin?: boolean
  business_enabled?: boolean
  moderation_status?: string
  report_count?: number
}

interface UserReport {
  id: string
  reporter_email: string
  reported_user_email: string
  report_type: string
  description: string
  status: string
  priority: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("users")

  const fetchUsers = async () => {
    try {
    setLoading(true)
      
      if (!supabase) {
        toast.error('Database connection not available')
        return
      }
      
      // Fetch users with profile data
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          avatar_url,
          is_admin,
          business_enabled,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        toast.error('Failed to load users')
        return
      }

      // Get auth data for users (if available)
      let authUsers: any = null
      try {
        if (supabase?.auth?.admin) {
          const { data, error: authError } = await supabase.auth.admin.listUsers()
          if (authError) {
            console.error('Error fetching auth users:', authError)
          } else {
            authUsers = data
          }
        }
      } catch (error) {
        console.log('Auth admin API not available:', error)
      }

      // Combine profile and auth data
      const combinedUsers: User[] = (usersData || []).map(profile => {
        const authUser = authUsers?.users?.find((u: any) => u.id === profile.user_id)
        return {
          id: profile.user_id,
          email: authUser?.email || `user-${profile.user_id.slice(0, 8)}@example.com`,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at,
          is_admin: profile.is_admin,
          business_enabled: profile.business_enabled,
          moderation_status: 'active', // Will be enhanced with actual moderation data
          report_count: 0 // Will be enhanced with actual report counts
        }
      })

      setUsers(combinedUsers)
    } catch (error) {
      console.error('Error in fetchUsers:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      if (!supabase) return

      const { data: reportsData, error: reportsError } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (reportsError) {
        console.error('Error fetching reports:', reportsError)
        return
      }

      const mappedReports: UserReport[] = (reportsData || []).map(report => ({
        id: report.id,
        reporter_email: 'Unknown', // Will be enhanced with proper joins
        reported_user_email: 'Unknown', // Will be enhanced with proper joins
        report_type: report.report_type,
        description: report.description,
        status: report.status,
        priority: report.priority,
        created_at: report.created_at
      }))

      setReports(mappedReports)
    } catch (error) {
      console.error('Error in fetchReports:', error)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let updateData: any = {}
      let actionType = ''

      switch (action) {
        case 'suspend':
          actionType = 'user_suspend'
          // Add suspension logic here
          break
        case 'activate':
          actionType = 'user_activate'
          // Add activation logic here
          break
        case 'make_admin':
          updateData = { is_admin: true }
          actionType = 'role_change'
          break
        case 'remove_admin':
          updateData = { is_admin: false }
          actionType = 'role_change'
          break
        case 'enable_business':
          updateData = { business_enabled: true }
          actionType = 'business_enable'
          break
        case 'disable_business':
          updateData = { business_enabled: false }
          actionType = 'business_disable'
          break
      }

      if (Object.keys(updateData).length > 0 && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', userId)

        if (error) {
          console.error('Error updating user:', error)
          toast.error('Failed to update user')
          return
        }
      }

      // Log admin action
      if (supabase) {
        await supabase
          .from('admin_actions')
          .insert({
            action_type: actionType,
            target_user_id: userId,
            target_resource_type: 'user',
            action_details: updateData
          })
      }

      toast.success('User updated successfully')
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error in handleUserAction:', error)
      toast.error('Failed to update user')
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchReports()
  }, [])

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage users, roles, and moderation</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => { fetchUsers(); fetchReports(); }}>
              Refresh
            </Button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Users ({users.length})</span>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {user.first_name && user.last_name 
                                    ? `${user.first_name} ${user.last_name}`
                                    : user.email
                                  }
                                </span>
                                {user.is_admin && <Badge variant="destructive">Admin</Badge>}
                                {user.business_enabled && <Badge variant="secondary">Business</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email} • Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!user.is_admin ? (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'make_admin')}>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'remove_admin')}>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}
                              
                              {!user.business_enabled ? (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'enable_business')}>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Enable Business
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'disable_business')}>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Disable Business
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Reports ({reports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map(report => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={report.priority === 'high' ? 'destructive' : 'secondary'}>
                              {report.priority}
                            </Badge>
                            <Badge variant="outline">{report.report_type}</Badge>
                            <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>
                              {report.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-sm">
                          <strong>{report.reporter_email}</strong> reported <strong>{report.reported_user_email}</strong>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="w-4 h-4 mr-2" />
                            Dismiss
                </Button>
                        </div>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No reports to review
                      </div>
                    )}
              </div>
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="moderation">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Moderation history will appear here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{users.length}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</div>
                      <div className="text-sm text-muted-foreground">Admins</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{users.filter(u => u.business_enabled).length}</div>
                      <div className="text-sm text-muted-foreground">Business Users</div>
          </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  )
}
