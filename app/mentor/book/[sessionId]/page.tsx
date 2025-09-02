"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"

export default function BookSessionPage() {
  const params = useParams<{ sessionId: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await getSupabaseClient()
        .from('mentor_sessions')
        .select('*')
        .eq('id', params.sessionId)
        .single()
      if (!error) setSessionInfo(data)
      setLoading(false)
    }
    load()
  }, [params.sessionId])

  const book = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) { toast.error('Please sign in'); return }
      // In a real app you'd redirect to Stripe/PayPal here before inserting booking
      setPaying(true)
      const { error } = await getSupabaseClient()
        .from('mentor_bookings')
        .insert({ session_id: params.sessionId, mentee_user_id: userId, status: 'pending' })
      if (error) throw error
      toast.success('Booking request sent')
      router.push('/mentor/dashboard')
    } catch (e: any) {
      toast.error(e.message || 'Failed to book')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!sessionInfo) return <div className="p-8">Session not found</div>

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Book Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">{new Date(sessionInfo.start_time).toLocaleString()} - {new Date(sessionInfo.end_time).toLocaleString()}</div>
            <div className="text-sm">{sessionInfo.title}</div>
            <div className="text-sm text-muted-foreground">{sessionInfo.description}</div>
            {typeof sessionInfo.price === 'number' && (
              <div className="text-lg font-medium">Price: ${Number(sessionInfo.price).toFixed(2)}</div>
            )}
            <Button onClick={book} disabled={paying}>{paying ? 'Processing...' : 'Pay & Book'}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
