import type { NextApiRequest, NextApiResponse } from "next"

// Lightweight Stripe redirect handler. Requires STRIPE_SECRET_KEY and NEXT_PUBLIC_APP_URL
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) {
    res.status(500).json({ error: "Stripe not configured" })
    return
  }

  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(secret, { apiVersion: "2024-06-20" })
    const { items } = req.body as { items: { id: string; name: string; price: number; quantity: number }[] }

    const line_items = (items || []).map((i) => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.name },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.quantity,
    }))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.origin || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${appUrl}/marketplace?success=true`,
      cancel_url: `${appUrl}/checkout?canceled=true`,
    })

    res.status(200).json({ url: session.url })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Stripe error" })
  }
}


