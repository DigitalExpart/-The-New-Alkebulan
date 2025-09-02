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
  const [paypalReady, setPaypalReady] = useState(false)

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

  const initPayPal = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      if (!clientId) {
        toast.error('PayPal not configured')
        return
      }
      if (!(window as any).paypal) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('PayPal SDK failed to load'))
          document.body.appendChild(script)
        })
      }
      setPaypalReady(true)
      // Render button into container
      const paypal = (window as any).paypal
      paypal.Buttons({
        createOrder: (_: any, actions: any) => {
          const amount = Number(sessionInfo?.price || 0).toFixed(2)
          return actions.order.create({ purchase_units: [{ amount: { value: amount } }] })
        },
        onApprove: async (_: any, actions: any) => {
          await actions.order.capture()
          // After capture, create the booking
          const { data: { session } } = await getSupabaseClient().auth.getSession()
          const userId = session?.user?.id
          if (!userId) { toast.error('Please sign in'); return }
          const { error } = await getSupabaseClient()
            .from('mentor_bookings')
            .insert({ session_id: params.sessionId, mentee_user_id: userId, status: 'pending' })
          if (error) throw error
          toast.success('Payment successful via PayPal. Booking request sent')
          window.location.href = '/mentor/dashboard'
        },
        onError: (err: any) => {
          console.error(err)
          toast.error('PayPal payment failed')
        }
      }).render('#paypal-button-container')
    } catch (e: any) {
      toast.error(e?.message || 'Unable to initialize PayPal')
    }
  }

  const payWithStripe = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) { toast.error('Please sign in'); return }
      setPaying(true)
      const res = await fetch('/api/mentor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorSessionId: params.sessionId, customerEmail: session.user.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout')
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error('No Stripe URL returned')
    } catch (e: any) {
      toast.error(e.message || 'Failed to book')
    } finally {
      setPaying(false)
    }
  }

  // After returning from Stripe success, create booking
  useEffect(() => {
    const url = new URL(window.location.href)
    const payment = url.searchParams.get('payment')
    if (payment === 'success') {
      ;(async () => {
        try {
          const { data: { session } } = await getSupabaseClient().auth.getSession()
          const userId = session?.user?.id
          if (!userId) return
          const { error } = await getSupabaseClient()
            .from('mentor_bookings')
            .insert({ session_id: params.sessionId, mentee_user_id: userId, status: 'pending' })
          if (error) throw error
          toast.success('Payment successful. Booking request sent')
          router.replace('/mentor/dashboard')
        } catch (err: any) {
          toast.error(err?.message || 'Failed to finalize booking after payment')
        }
      })()
    }
  }, [params.sessionId, router])

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
            <div className="flex gap-2">
              <Button onClick={payWithStripe} disabled={paying}>{paying ? 'Processing...' : 'Pay with Card & Book'}</Button>
              <Button variant="outline" onClick={() => initPayPal()} disabled={paying}>Pay with PayPal</Button>
            </div>
            <div id="paypal-button-container" className="mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
