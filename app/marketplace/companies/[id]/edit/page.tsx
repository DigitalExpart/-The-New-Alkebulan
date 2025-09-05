"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"

export default function EditCompanyPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const [form, setForm] = useState<any>({ name: "", description: "", industry: "", location: "", website: "", logo: "", size: "" })
  const isAdmin = Boolean(profile?.is_admin === true || profile?.role === 'admin' || (Array.isArray(profile?.selected_roles) && profile?.selected_roles.includes('admin')))

  useEffect(() => {
    const load = async () => {
      if (!supabase) return
      const { data } = await supabase.from('companies').select('*').eq('id', params.id as string).maybeSingle()
      if (data) setForm({
        name: data.name || "",
        description: data.description || "",
        industry: data.industry || "",
        location: data.location || "",
        website: data.website || "",
        logo: data.logo || "",
        size: data.size || data.team_size || "",
      })
    }
    load()
  }, [params.id])

  const save = async () => {
    if (!isAdmin) { toast.error('Only admins can edit'); return }
    const payload: any = { ...form, updated_at: new Date().toISOString() }
    const { error } = await supabase!.from('companies').update(payload).eq('id', params.id as string)
    if (error) { toast.error(error.message) } else { toast.success('Company updated'); router.push('/marketplace/companies') }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Company</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm">Name</label>
            <Input value={form.name} onChange={(e) => setForm((p:any) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Industry</label>
            <Input value={form.industry} onChange={(e) => setForm((p:any) => ({ ...p, industry: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Location</label>
            <Input value={form.location} onChange={(e) => setForm((p:any) => ({ ...p, location: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Website</label>
            <Input value={form.website} onChange={(e) => setForm((p:any) => ({ ...p, website: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Logo URL</label>
            <Input value={form.logo} onChange={(e) => setForm((p:any) => ({ ...p, logo: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Size</label>
            <Input value={form.size} onChange={(e) => setForm((p:any) => ({ ...p, size: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Description</label>
            <Textarea rows={6} value={form.description} onChange={(e) => setForm((p:any) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


