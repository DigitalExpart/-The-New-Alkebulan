"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase"

type MentorSession = {
  id: string
  title: string | null
  start_time: string
  end_time: string
}

type MentorBooking = {
  id: string
  session_id: string
  mentee_user_id: string
  status: "pending" | "confirmed" | "cancelled"
  notes: string | null
  created_at: string
}

type BookingWithSession = MentorBooking & {
  session: MentorSession | undefined
}

export default function MentorBookingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<BookingWithSession[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        setBookings([])
        setLoading(false)
        return
      }

      const { data: sessions, error: sesErr } = await supabase
        .from("mentor_sessions")
        .select("id,title,start_time,end_time")
        .eq("mentor_user_id", userId)
        .order("start_time")

      if (sesErr) throw sesErr
      const sessionIdList = (sessions || []).map(s => s.id)

      if (sessionIdList.length === 0) {
        setBookings([])
        setLoading(false)
        return
      }

      const { data: bookingRows, error: bookErr } = await supabase
        .from("mentor_bookings")
        .select("id,session_id,mentee_user_id,status,notes,created_at")
        .in("session_id", sessionIdList)
        .order("created_at", { ascending: false })

      if (bookErr) throw bookErr

      const sessionMap: Record<string, MentorSession> = {}
      for (const s of sessions || []) sessionMap[s.id] = s

      const combined: BookingWithSession[] = (bookingRows || []).map(b => ({
        ...b,
        session: sessionMap[b.session_id]
      }))

      setBookings(combined)
    } catch (err: any) {
      toast({ title: "Failed to load bookings", description: String(err?.message || err), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateStatus = useCallback(async (bookingId: string, next: MentorBooking["status"]) => {
    try {
      setProcessingId(bookingId)
      // Optimistic UI update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: next } : b))
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from("mentor_bookings")
        .update({ status: next })
        .eq("id", bookingId)

      if (error) throw error
      toast({ title: "Booking updated", description: `Status set to ${next}` })
      await loadData()
    } catch (err: any) {
      toast({ title: "Update failed", description: String(err?.message || err), variant: "destructive" })
      // Revert optimistic change on failure
      await loadData()
    }
  }, [toast, loadData])

  const pending = useMemo(() => bookings.filter(b => b.status === "pending"), [bookings])
  const others = useMemo(() => bookings.filter(b => b.status !== "pending"), [bookings])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mentor Bookings</h1>
            <p className="text-muted-foreground">Confirm or cancel session bookings.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/mentor/schedule">Create Sessions</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!loading && pending.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending bookings</p>
              )}
              {pending.map(b => (
                <div key={b.id} className="flex items-start justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{b.session?.title || "Untitled session"}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.session ? new Date(b.session.start_time).toLocaleString() : ""}
                    </div>
                    <div className="text-xs mt-1">Mentee: <span className="font-mono">{b.mentee_user_id}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(b.id, "confirmed")} disabled={processingId === b.id}>
                      {processingId === b.id ? (<><Loader2 className="w-3 h-3 mr-2 animate-spin" />Confirming</>) : 'Confirm'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "cancelled")} disabled={processingId === b.id}>
                      {processingId === b.id ? (<><Loader2 className="w-3 h-3 mr-2 animate-spin" />Cancelling</>) : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
              {!loading && others.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent updates</p>
              )}
              {others.map(b => (
                <div key={b.id} className="flex items-start justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{b.session?.title || "Untitled session"}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.session ? new Date(b.session.start_time).toLocaleString() : ""}
                    </div>
                    <div className="text-xs mt-1">Mentee: <span className="font-mono">{b.mentee_user_id}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === "confirmed" ? "default" : b.status === "pending" ? "secondary" : "destructive"}>{b.status}</Badge>
                    {b.status !== "cancelled" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "cancelled")} disabled={processingId === b.id}>
                        {processingId === b.id ? (<><Loader2 className="w-3 h-3 mr-2 animate-spin" />Cancelling</>) : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


