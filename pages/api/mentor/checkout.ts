import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { requireAuth } from "../../../lib/auth"

// Creates a Stripe Checkout session for a single mentor session
// Expects: { mentorSessionId: string, customerEmail?: string }
// Redirects client to Stripe-hosted payment page and returns { url }

const BodySchema = z.object({
  mentorSessionId: z.string().min(1),
  customerEmail: z.string().email().optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const user = await requireAuth(req, res)
  if (!user) return

  try {
    const parsed = BodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" })
      return
    }
    const { mentorSessionId, customerEmail } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: "Supabase not configured" })
      return
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Load session data (publicly readable table)
    const { data: sessionRow, error: sErr } = await supabase
      .from("mentor_sessions")
      .select("id,title,start_time,price")
      .eq("id", mentorSessionId)
      .single()

    if (sErr || !sessionRow) {
      res.status(404).json({ error: "Mentor session not found" })
      return
    }

    const secret = process.env.STRIPE_SECRET_KEY as string | undefined
    if (!secret) {
      res.status(500).json({ error: "Stripe not configured" })
      return
    }
    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (req.headers.origin as string) || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: sessionRow.title || "Mentor Session",
              description: new Date(sessionRow.start_time).toLocaleString(),
            },
            unit_amount: Math.max(0, Math.round(Number(sessionRow.price || 0) * 100)),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/mentor/book/${mentorSessionId}?payment=success&cs_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/mentor/book/${mentorSessionId}?payment=cancelled`,
      metadata: {
        mentor_session_id: mentorSessionId,
        user_id: user.id,
      },
    }, {
      idempotencyKey: `cs:${user.id}:${mentorSessionId}`,
    })

    res.status(200).json({ url: session.url })
  } catch (e: any) {
    console.error("mentor/checkout error:", e)
    res.status(500).json({ error: e?.message || "Server error" })
  }
}


