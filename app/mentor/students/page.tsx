"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase"
import { UserAvatar } from "@/components/user-avatar"

interface SessionRow {
  id: string
  title: string | null
  start_time: string
  program_id?: string | null
}

interface BookingRow {
  id: string
  session_id: string
  mentee_user_id: string
  status: string
  created_at?: string
}

export default function MentorStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Record<string, SessionRow>>({})
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [profiles, setProfiles] = useState<Record<string, any>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id
        if (!userId) return

        // 1) Get mentor's sessions
        const { data: sess } = await supabase
          .from('mentor_sessions')
          .select('id,title,start_time,program_id')
          .eq('mentor_user_id', userId)
          .order('start_time', { ascending: true })

        const sessionMap: Record<string, SessionRow> = {}
        const sessionIds: string[] = []
        for (const s of (sess || []) as any[]) {
          sessionMap[s.id] = { id: s.id, title: s.title, start_time: s.start_time, program_id: (s as any).program_id }
          sessionIds.push(s.id)
        }
        if (sessionIds.length === 0) { setSessions({}); setBookings([]); return }
        setSessions(sessionMap)

        // 2) Bookings for those sessions
        const { data: bks } = await supabase
          .from('mentor_bookings')
          .select('id, session_id, mentee_user_id, status, created_at')
          .in('session_id', sessionIds)
          .order('created_at', { ascending: false })
        const bookingRows = (bks || []) as any[]
        setBookings(bookingRows as any)

        // 3) Load mentee profiles
        const menteeIds = Array.from(new Set(bookingRows.map(b => b.mentee_user_id)))
        if (menteeIds.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', menteeIds)
          const profMap: Record<string, any> = {}
          for (const p of (profs || []) as any[]) profMap[p.id] = p
          setProfiles(profMap)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const g: Record<string, BookingRow[]> = {}
    for (const b of bookings) {
      if (!g[b.session_id]) g[b.session_id] = []
      g[b.session_id].push(b)
    }
    return g
  }, [bookings])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            View mentees who have booked your sessions/programs.
          </CardContent>
        </Card>

        {Object.keys(grouped).length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">No students yet. When mentees book your sessions, they will appear here.</CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {Object.entries(grouped).map(([sessionId, list]) => {
            const s = sessions[sessionId]
            return (
              <Card key={sessionId}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {s?.title || 'Session'} · {s ? new Date(s.start_time).toLocaleString() : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {list.map(b => {
                    const p = profiles[b.mentee_user_id]
                    const fullName = [p?.first_name, p?.last_name].filter(Boolean).join(' ') || 'Student'
                    return (
                      <div key={b.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                        <div className="flex items-center gap-3">
                          <UserAvatar imageUrl={p?.avatar_url || undefined} size="sm" fallbackName={fullName} />
                          <div>
                            <div className="font-medium text-sm">{fullName}</div>
                            <div className="text-xs text-muted-foreground">Booked on {b.created_at ? new Date(b.created_at).toLocaleString() : ''}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{b.status}</Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}


