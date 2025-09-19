"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, CheckCircle2, Ban, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface CompanyLite { id: string; name: string | null; verified?: boolean | null; suspended?: boolean | null }

export default function AdminCompaniesPage() {
  const [rows, setRows] = useState<CompanyLite[]>([])
  const [query, setQuery] = useState("")

  const load = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase.from('companies').select('id, name, verified, suspended').order('created_at', { ascending: false }).limit(50)
      setRows((data as any) || [])
    } catch { setRows([]) }
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter(r => !query.trim() || (r.name || '').toLowerCase().includes(query.toLowerCase()))

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Companies Verification</h1>
                <p className="text-muted-foreground">Verify or suspend company profiles</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search companies" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{c.name || 'Company'}</span>
                    <div className="flex items-center gap-2">
                      {c.verified ? <Badge>Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}
                      {c.suspended ? <Badge variant="destructive">Suspended</Badge> : null}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      const { error } = await supabase!.from('companies').update({ verified: true }).eq('id', c.id)
                      if (error) { toast.error('Verify failed') } else { toast.success('Verified'); load() }
                    }}><CheckCircle2 className="w-4 h-4 mr-1" />Verify</Button>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      const { error } = await supabase!.from('companies').update({ suspended: true }).eq('id', c.id)
                      if (error) { toast.error('Suspend failed') } else { toast.success('Suspended'); load() }
                    }}><Ban className="w-4 h-4 mr-1" />Suspend</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground">No companies found.</p>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}


