"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function CardCheckout({ sessionId, onSuccess }: { sessionId: string, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return
    setSubmitting(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required'
      })
      if (error) throw error
      onSuccess()
    } catch (e: any) {
      toast.error(e?.message || 'Payment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <PaymentElement />
      <Button className="w-full" onClick={handlePay} disabled={submitting || !stripe}>Pay now</Button>
    </div>
  )
}

export default function BookSessionPage() {
  const params = useParams<{ sessionId: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [programInfo, setProgramInfo] = useState<any>(null)
  const [programSessions, setProgramSessions] = useState<any[]>([])
  const [paying, setPaying] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select('*, mentor_programs!mentor_sessions_program_id_fkey(id,title,description,price_total)')
        .eq('id', params.sessionId)
        .single()
      if (!error) {
        setSessionInfo(data)
        // when joined via foreign select
        if ((data as any).mentor_programs) setProgramInfo((data as any).mentor_programs)
        // or fetch separately if needed
        const progId = (data as any).program_id
        if (!programInfo && progId) {
          const { data: p } = await supabase.from('mentor_programs').select('*').eq('id', progId).single()
          if (p) setProgramInfo(p)
          // load all sessions of this program to display all days
          const { data: allSess } = await supabase
            .from('mentor_sessions')
            .select('id,title,start_time,end_time')
            .eq('program_id', progId)
            .order('start_time', { ascending: true })
          setProgramSessions(allSess || [])
        }
      }
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
      const paypal = (window as any).paypal
      paypal.Buttons({
        createOrder: (_: any, actions: any) => {
          const amount = Number((programInfo?.price_total ?? sessionInfo?.price ?? 0)).toFixed(2)
          return actions.order.create({ purchase_units: [{ amount: { value: amount } }] })
        },
        onApprove: async (_: any, actions: any) => {
          await actions.order.capture()
          const { data: { session } } = await getSupabaseClient().auth.getSession()
          const userId = session?.user?.id
          if (!userId) { toast.error('Please sign in'); return }
          const { error } = await getSupabaseClient()
            .from('mentor_bookings')
            .insert({ session_id: params.sessionId, mentee_user_id: userId, status: 'confirmed', program_id: sessionInfo?.program_id || programInfo?.id || null })
          if (error) throw error
          toast.success('Payment successful via PayPal. You have been added to this session')
          router.replace('/mentor/dashboard')
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

  const startCardCheckout = async () => {
    try {
      setPaying(true)
      const res = await fetch('/api/mentor/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorSessionId: params.sessionId })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error === 'MIN_AMOUNT') {
          throw new Error(`Amount below Stripe minimum. Increase price to at least $${data.minAmount}`)
        }
        throw new Error(data.error || 'Failed to start checkout')
      }
      if (data?.free) {
        // No payment required; finalize booking immediately
        await onCardPaid()
        return ''
      }
      return data.clientSecret as string
    } finally {
      setPaying(false)
    }
  }

  const onCardPaid = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) return
      const { error } = await getSupabaseClient()
        .from('mentor_bookings')
        .upsert(
          { session_id: params.sessionId, mentee_user_id: userId, status: 'confirmed', program_id: sessionInfo?.program_id || programInfo?.id || null },
          { onConflict: 'session_id,mentee_user_id', ignoreDuplicates: true }
        )
      if (error) throw error
      toast.success('Payment successful. You have been added to this session')
      router.replace('/mentor/dashboard')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to finalize booking')
    }
  }

  const payWithCrypto = async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const userId = session?.user?.id
      if (!userId) { toast.error('Please sign in'); return }
      const res = await fetch('/api/payments/nowpayments/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'mentor', mentorSessionId: params.sessionId, menteeUserId: userId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create crypto invoice')
      if (data?.free) {
        await onCardPaid()
        return
      }
      if (data?.invoice_url) {
        window.location.href = data.invoice_url as string
      } else {
        throw new Error('Missing invoice URL')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Crypto payment failed')
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
            {programInfo ? (
              <div className="text-lg font-medium">Program Price: ${Number(programInfo.price_total || 0).toFixed(2)}</div>
            ) : (
              typeof sessionInfo.price === 'number' && (
                <div className="text-lg font-medium">Price: ${Number(sessionInfo.price).toFixed(2)}</div>
              )
            )}
            {programSessions.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium">Included Days</div>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  {programSessions.map(s => (
                    <div key={s.id}>{new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleString()}</div>
                  ))}
                </div>
              </div>
            )}
            <Dialog open={checkoutOpen} onOpenChange={async (open) => {
              setCheckoutOpen(open)
              if (open && !clientSecret) {
                try {
                  const secret = await startCardCheckout()
                  setClientSecret(secret)
                } catch (e: any) {
                  toast.error(e?.message || 'Failed to initialize checkout')
                }
              }
            }}>
              <DialogTrigger asChild>
                <Button>Pay & Book</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Checkout</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  {stripePromise && clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CardCheckout sessionId={params.sessionId} onSuccess={onCardPaid} />
                    </Elements>
                  ) : (
                    <div className="text-sm text-red-500">Stripe not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</div>
                  )}
                  <div className="border-t pt-3">
                    <div id="paypal-button-container" />
                    <Button className="w-full mt-2" variant="outline" onClick={() => initPayPal()}>Pay with PayPal</Button>
                    <Button className="w-full mt-2" variant="secondary" onClick={() => payWithCrypto()}>Pay with Crypto (NOWPayments)</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

