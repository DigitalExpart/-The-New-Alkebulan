"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

interface ProjectRow {
  id: string
  title: string | null
  description: string | null
  funding_goal: number | null
  current_funding: number | null
  status: string | null
  category?: string | null
  image_url?: string | null
  return_rate_min?: number | null
  return_rate_max?: number | null
}

export default function AdminInvestmentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    funding_goal: "",
    category: "Technology",
    return_min: "12",
    return_max: "18",
    image_url: ""
  })
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from('projects')
        .select('id, title, description, funding_goal, current_funding, status, category, image_url, return_rate_min, return_rate_max')
        .order('created_at', { ascending: false })
        .limit(20)
      setRows(data || [])
    } catch {
      setRows([])
    }
  }

  useEffect(() => { load() }, [])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    if (!user) { toast.error('You must be signed in'); return }
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setLoading(true)
    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        funding_goal: form.funding_goal ? Number(form.funding_goal) : null,
        status: 'active',
        author_id: user.id,
        category: form.category?.trim() || null,
        image_url: form.image_url?.trim() || null,
        return_rate_min: form.return_min ? Number(form.return_min) : null,
        return_rate_max: form.return_max ? Number(form.return_max) : null,
      }
      const { error } = await supabase.from('projects').insert(payload)
      if (error) throw error
      toast.success('Project created')
      setForm({ title: "", description: "", funding_goal: "", category: "Technology", return_min: "12", return_max: "18", image_url: "" })
      await load()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabase || !user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('projects').upload(path, file, {
        cacheControl: '3600', upsert: false
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('projects').getPublicUrl(path)
      const publicUrl = data?.publicUrl
      if (publicUrl) {
        setForm((p) => ({ ...p, image_url: publicUrl }))
        toast.success('Image uploaded')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed. Ensure a storage bucket named "projects" exists and is public.')
    } finally {
      setUploading(false)
      ;(e.target as HTMLInputElement).value = ''
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Investments</h1>
                <p className="text-muted-foreground">Create investable projects</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createProject} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="funding_goal">Funding Goal (USD)</Label>
                  <Input id="funding_goal" type="number" min="0" step="0.01" value={form.funding_goal} onChange={(e) => setForm((p) => ({ ...p, funding_goal: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>Return Rate (%)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min (e.g. 12)" type="number" min="0" step="0.1" value={form.return_min} onChange={(e) => setForm((p) => ({ ...p, return_min: e.target.value }))} />
                    <Input placeholder="Max (e.g. 18)" type="number" min="0" step="0.1" value={form.return_max} onChange={(e) => setForm((p) => ({ ...p, return_max: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="image">Image Upload</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Input id="image" type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                    <Input placeholder="Or paste image URL" value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{r.title || 'Untitled'}</span>
                    <Badge variant="secondary">{r.status || 'active'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {r.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image_url} alt={r.title || 'project'} className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <div className="text-sm text-muted-foreground line-clamp-3">{r.description}</div>
                  <div className="mt-2 text-sm">Category: {r.category || 'N/A'}</div>
                  <div className="mt-1 text-sm">Return: {r.return_rate_min ?? '-'}% – {r.return_rate_max ?? '-'}%</div>
                  <div className="mt-1 text-sm">Goal: ${r.funding_goal ?? 0} · Raised: ${r.current_funding ?? 0}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}


