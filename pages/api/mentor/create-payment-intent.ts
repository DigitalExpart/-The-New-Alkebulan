import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const { mentorSessionId } = req.body as { mentorSessionId?: string }
    if (!mentorSessionId) {
      res.status(400).json({ error: "mentorSessionId is required" })
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: "Supabase not configured" })
      return
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data: sessionRow, error: sErr } = await supabase
      .from("mentor_sessions")
      .select("id, title, start_time, price")
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

    const intent = await stripe.paymentIntents.create({
      amount: Math.max(0, Math.round(Number(sessionRow.price || 0) * 100)),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { mentor_session_id: mentorSessionId },
    })

    res.status(200).json({ clientSecret: intent.client_secret })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" })
  }
}
