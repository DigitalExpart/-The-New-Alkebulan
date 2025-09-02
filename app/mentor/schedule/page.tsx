"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Session {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  capacity: number
}

export default function MentorSchedulePage() {
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [capacity, setCapacity] = useState("1")
  const [sessions, setSessions] = useState<Session[]>([])

  const load = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) return
      const { data, error } = await getSupabaseClient()
        .from('mentor_sessions')
        .select('*')
        .eq('mentor_user_id', userId)
        .order('start_time', { ascending: true })
      if (!error && data) setSessions(data as any)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createSession = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) { toast.error('Please sign in'); return }
      if (!start || !end) { toast.error('Select start and end time'); return }
      const payload = {
        mentor_user_id: userId,
        title,
        description,
        start_time: start,
        end_time: end,
        capacity: Number(capacity) || 1
      }
      const { error } = await getSupabaseClient()
        .from('mentor_sessions')
        .insert(payload)
      if (error) throw error
      toast.success('Session created')
      setTitle(""); setDescription(""); setStart(""); setEnd(""); setCapacity("1")
      load()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create')
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
              <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <Input placeholder="Capacity" type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} />
            <Button onClick={createSession}>Create Session</Button>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-3">
          {sessions.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.title || 'Session'}</p>
                  <p className="text-sm text-muted-foreground">{new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleString()}</p>
                </div>
                <div className="text-sm text-muted-foreground">Capacity: {s.capacity}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
