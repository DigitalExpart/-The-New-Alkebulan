import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import getRawBody from 'raw-body'
import { Redis } from '@upstash/redis'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Optional Redis client for idempotency/dedup (gracefully disabled if env missing)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : undefined

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }

  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !webhookSecret) {
    res.status(500).json({ error: 'Stripe not configured' })
    return
  }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

  let event: Stripe.Event
  try {
    const rawBody = await getRawBody(req)
    const sig = req.headers['stripe-signature'] as string
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  // Deduplicate events: skip if we've already processed this event id recently
  try {
    if (redis) {
      const key = `stripe:event:${event.id}`
      const created = await redis.set(key, '1', { nx: true, ex: 60 * 60 * 24 }) // 24h TTL
      if (created !== 'OK') {
        return res.json({ received: true, deduped: true })
      }
    }
  } catch (_) {
    // ignore redis errors; proceed best-effort
  }

  // Persist event to DB (best effort)
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && anon) {
      const supabase = createClient(url, anon)
      await supabase.from('payment_events').insert({
        provider: 'stripe',
        event_id: event.id,
        type: event.type,
        payload: event as any,
      })
    }
  } catch (_) {}

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'payment_intent.succeeded':
        // TODO: update bookings and grant access based on metadata
        break
      default:
        break
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Webhook handling error' })
    return
  }

  res.json({ received: true })
}
