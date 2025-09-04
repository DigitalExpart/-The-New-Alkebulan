import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

type CreateInvoiceBody =
  | { kind: "mentor"; mentorSessionId: string; menteeUserId?: string }
  | { kind: "checkout"; amount: number; currency?: string; orderId?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY as string | undefined
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "").replace(/^https?:\/\//, "")
    const baseUrl = appUrl ? `https://${appUrl}` : "http://localhost:3000"

    if (!apiKey) {
      res.status(500).json({ error: "NOWPayments not configured" })
      return
    }

    const body = req.body as CreateInvoiceBody

    // Determine amount and description
    let priceAmount = 0
    let priceCurrency = (body as any).currency || "usd"
    let orderId = (body as any).orderId || undefined
    let orderDescription = ""

    if (body.kind === "mentor") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
      if (!supabaseUrl || !supabaseAnonKey) {
        res.status(500).json({ error: "Supabase not configured" })
        return
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data: sessionRow, error: sErr } = await supabase
        .from("mentor_sessions")
        .select("id, title, price, program_id")
        .eq("id", body.mentorSessionId)
        .single()
      if (sErr || !sessionRow) {
        res.status(404).json({ error: "Mentor session not found" })
        return
      }
      if ((sessionRow as any).program_id) {
        const { data: program } = await supabase
          .from("mentor_programs")
          .select("title, price_total")
          .eq("id", (sessionRow as any).program_id)
          .single()
        priceAmount = Math.max(0, Number(program?.price_total || 0))
        orderDescription = `Mentorship program: ${program?.title || sessionRow.title}`
      } else {
        priceAmount = Math.max(0, Number((sessionRow as any).price || 0))
        orderDescription = `Mentorship session: ${sessionRow.title}`
      }
      // Encode identifiers in orderId (include mentee for webhook fulfillment)
      orderId = JSON.stringify({ t: "mentor", sessionId: body.mentorSessionId, menteeUserId: body.menteeUserId || null })
    } else if (body.kind === "checkout") {
      priceAmount = Math.max(0, Number(body.amount || 0))
      priceCurrency = (body.currency || "usd").toLowerCase()
      orderDescription = "Marketplace checkout order"
      if (!orderId) {
        orderId = JSON.stringify({ t: "checkout", ts: Date.now() })
      }
    } else {
      res.status(400).json({ error: "Invalid request body" })
      return
    }

    if (!priceAmount || priceAmount <= 0) {
      res.status(200).json({ free: true })
      return
    }

    // Build invoice request to NOWPayments
    const ipnUrl = `${baseUrl}/api/payments/nowpayments/webhook`
    const successUrl = `${baseUrl}/payments/success`
    const cancelUrl = `${baseUrl}/payments/cancel`

    const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: priceCurrency,
        order_id: orderId,
        order_description: orderDescription,
        ipn_callback_url: ipnUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        is_fee_paid_by_user: true,
      }),
    })

    const data = await resp.json()
    if (!resp.ok) {
      res.status(500).json({ error: data?.message || "NOWPayments error" })
      return
    }

    res.status(200).json({ invoice_url: data?.invoice_url, invoice_id: data?.id })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" })
  }
}


