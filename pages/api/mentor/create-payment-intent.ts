import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { requireAuth } from "../../../lib/auth"

const BodySchema = z.object({
  mentorSessionId: z.string().min(1),
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
    const { mentorSessionId } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: "Supabase not configured" })
      return
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: sessionRow, error: sErr } = await supabase
      .from("mentor_sessions")
      .select("id, title, start_time, price, program_id")
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

    // If the session is part of a program, charge the program's total price once
    let amountCents = 0
    if ((sessionRow as any).program_id) {
      const { data: program } = await supabase
        .from('mentor_programs')
        .select('price_total')
        .eq('id', (sessionRow as any).program_id)
        .single()
      amountCents = Math.max(0, Math.round(Number(program?.price_total || 0) * 100))
    } else {
      amountCents = Math.max(0, Math.round(Number((sessionRow as any).price || 0) * 100))
    }

    // If free, skip Stripe – client should auto-confirm booking
    if (!amountCents || amountCents <= 0) {
      res.status(200).json({ free: true })
      return
    }

    // Stripe minimum charge in USD is 50 cents
    const MIN_USD_CENTS = 50
    if (amountCents < MIN_USD_CENTS) {
      res.status(400).json({ error: "MIN_AMOUNT", minAmount: MIN_USD_CENTS / 100 })
      return
    }

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { mentor_session_id: mentorSessionId, user_id: user.id },
    }, {
      idempotencyKey: `pi:${user.id}:${mentorSessionId}`,
    })

    res.status(200).json({ clientSecret: intent.client_secret })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" })
  }
}
