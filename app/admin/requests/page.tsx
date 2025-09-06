"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Mail, User, Calendar, Search, Trash2, CheckCircle2 } from "lucide-react"

type RequestRow = {
  id: string
  name: string
  email: string
  title: string
  category: string | null
  budget: number | null
  description: string | null
  status: string | null
  created_at: string
}

export default function AdminProjectRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")

  const load = async () => {
    if (!supabase) return
    setLoading(true)
    try {
      let q = supabase.from('project_requests').select('*').order('created_at', { ascending: false })
      const { data, error } = await q
      if (error) throw error
      setRows((data as any) || [])
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load requests')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter(r => {
    const q = query.toLowerCase().trim()
    const matchQ = !q || [r.name, r.email, r.title, r.category || '', r.description || ''].some(v => (v || '').toLowerCase().includes(q))
    const matchS = status === 'all' || (r.status || 'new') === status
    return matchQ && matchS
  })

  const setRequestStatus = async (id: string, next: string) => {
    try {
      const { error } = await supabase.from('project_requests').update({ status: next }).eq('id', id)
      if (error) throw error
      toast.success(`Marked as ${next}`)
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'Update failed')
    }
  }

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase.from('project_requests').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted request')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed')
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Project Requests</h1>
                <p className="text-muted-foreground">Submissions from users who want to create a project</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-6 flex flex-col md:flex-row gap-3">
              <div className="relative md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name, email, title, category" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && <p className="text-muted-foreground">Loading...</p>}
            {!loading && filtered.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="truncate">{r.title}</span>
                    <Badge variant="secondary">{r.status || 'new'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" />{r.name}</div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{r.email}</div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(r.created_at).toLocaleString()}</div>
                  {r.category && <div>Category: {r.category}</div>}
                  {r.budget != null && <div>Budget: ${r.budget}</div>}
                  {r.description && <p className="text-muted-foreground line-clamp-3">{r.description}</p>}
                  <div className="pt-2 flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setRequestStatus(r.id, 'in_review')}>In Review</Button>
                    <Button size="sm" variant="outline" onClick={() => setRequestStatus(r.id, 'contacted')}>Contacted</Button>
                    <Button size="sm" variant="outline" onClick={() => setRequestStatus(r.id, 'approved')}><CheckCircle2 className="w-4 h-4 mr-1" />Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setRequestStatus(r.id, 'rejected')}>Reject</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteRequest(r.id)}><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
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


