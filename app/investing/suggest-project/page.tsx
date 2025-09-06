"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function SuggestProjectPage() {
  const [form, setForm] = useState({ name: "", email: "", title: "", category: "", budget: "", description: "" })
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    if (!form.name.trim() || !form.email.trim() || !form.title.trim()) { toast.error('Name, email, and title are required'); return }
    setSubmitting(true)
    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.title.trim(),
        category: form.category.trim() || null,
        budget: form.budget ? Number(form.budget) : null,
        description: form.description.trim() || null,
        status: 'new',
        created_at: new Date().toISOString()
      }
      const { error } = await supabase.from('project_requests').insert(payload)
      if (error) throw error
      toast.success('Submitted! Our support team will contact you.')
      setForm({ name: "", email: "", title: "", category: "", budget: "", description: "" })
    } catch (err: any) {
      toast.error(err?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Suggest a Project (Contact Support)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="budget">Estimated Budget (USD)</Label>
              <Input id="budget" type="number" min="0" step="0.01" value={form.budget} onChange={(e) => setForm(p => ({ ...p, budget: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea id="description" rows={6} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


