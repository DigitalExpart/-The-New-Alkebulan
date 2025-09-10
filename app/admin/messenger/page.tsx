"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flag, Shield, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ConversationReport { id: string; conversation_id: string; message_id?: string | null; reason?: string | null; status: string }

export default function AdminMessengerPage() {
  const [rows, setRows] = useState<ConversationReport[]>([])

  const load = async () => {
    if (!supabase) return
    try {
      const { data } = await supabase.from('conversation_reports').select('*').order('created_at', { ascending: false }).limit(50)
      setRows((data as any) || [])
    } catch { setRows([]) }
  }

  useEffect(() => { load() }, [])

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
                <h1 className="text-2xl font-bold">Messenger Reports</h1>
                <p className="text-muted-foreground">Review reported conversations for abuse. Private chats remain private; only flagged conversations appear here.</p>
              </div>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map(r => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2"><Flag className="w-4 h-4" /> Conversation {r.conversation_id.slice(0, 8)}...</span>
                    <Badge variant="secondary">{r.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {r.message_id && <div>Message: {r.message_id.slice(0, 8)}...</div>}
                  <div>Reason: {r.reason || 'N/A'}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={async () => {
                      const { error } = await supabase.from('conversation_reports').update({ status: 'reviewed' }).eq('id', r.id)
                      if (error) { toast.error('Update failed') } else { toast.success('Marked reviewed'); load() }
                    }}>Mark Reviewed</Button>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      const { error } = await supabase.from('conversation_reports').delete().eq('id', r.id)
                      if (error) { toast.error('Delete failed') } else { toast.success('Deleted'); load() }
                    }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {rows.length === 0 && (<p className="text-muted-foreground">No reports yet.</p>)}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}


