"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Shield, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface AdminUser {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  is_admin?: boolean | null
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<AdminUser[]>([])

  const fetchUsers = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, is_admin")
        .order("first_name", { ascending: true })
        .limit(100)
      if (error) throw error
      setUsers(data || [])
    } catch (e) {
      console.error(e)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter((u) => {
    const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase()
    const email = (u.email || "").toLowerCase()
    const q = query.toLowerCase().trim()
    return !q || name.includes(q) || email.includes(q)
  })

  const toggleAdmin = async (id: string, next: boolean) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: next, updated_at: new Date().toISOString() })
        .eq("id", id)
      if (error) throw error
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_admin: next } : u)))
      toast.success(next ? "Granted admin" : "Revoked admin")
    } catch (e) {
      console.error(e)
      toast.error("Update failed")
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Search users and toggle admin access</p>
              </div>
            </div>
            <Badge variant="outline">Total: {users.length}</Badge>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && <p className="text-muted-foreground">Loading users...</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-muted-foreground">No users found.</p>
            )}
            {!loading && filtered.map((u) => (
              <Card key={u.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{`${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unnamed User"}</span>
                    {u.is_admin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Member</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{u.email || "No email"}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Admin</span>
                    <Switch
                      checked={!!u.is_admin}
                      onCheckedChange={(next) => toggleAdmin(u.id, next)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}


