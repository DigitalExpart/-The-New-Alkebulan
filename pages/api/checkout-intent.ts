import type { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const secret = process.env.STRIPE_SECRET_KEY as string | undefined
  if (!secret) {
    res.status(500).json({ error: "Stripe not configured" })
    return
  }

  try {
    const { items } = req.body as { items: { id: string; name: string; price: number; quantity: number }[] }
    const amountCents = Math.max(
      0,
      Math.round(
        (items || []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0) * 100
      )
    )

    if (amountCents === 0) {
      res.status(200).json({ free: true })
      return
    }

    const MIN_USD_CENTS = 50
    if (amountCents < MIN_USD_CENTS) {
      res.status(400).json({ error: "MIN_AMOUNT", minAmount: MIN_USD_CENTS / 100 })
      return
    }

    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: { source: "embedded_checkout" },
    })

    res.status(200).json({ clientSecret: intent.client_secret })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Stripe error" })
  }
}


