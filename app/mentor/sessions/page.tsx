"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"

interface SessionRow {
  id: string
  title: string | null
  description: string | null
  start_time: string
  end_time: string
  capacity: number
  booked_count: number
  mentor_user_id: string
}

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await getSupabaseClient()
        .from('mentor_sessions')
        .select('*')
        .gte('start_time', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
        .order('start_time', { ascending: true })
      setSessions((data as any) || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mentor Sessions</h1>
          <Button asChild>
            <Link href="/mentor/schedule">Create Sessions</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.title || 'Session'}</p>
                  <p className="text-sm text-muted-foreground">{new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleString()}</p>
                  {s.description && <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{s.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{s.booked_count}/{s.capacity}</span>
                  <Button asChild variant="outline">
                    <Link href={`/mentor/book/${s.id}`}>Book</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {sessions.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>No upcoming sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Create sessions to allow mentees to book.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
