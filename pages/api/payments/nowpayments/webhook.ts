import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Basic NOWPayments IPN handler.
// Validates HMAC signature (if NOWPayments sends x-nowpayments-sig header) and marks orders as paid.
// For mentor bookings, inserts a confirmed booking; for cart checkout, you can add your own fulfillment logic.

export const config = {
  api: {
    bodyParser: false,
  },
}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (d) => chunks.push(Buffer.from(d)))
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  try {
    const raw = await readRawBody(req)
    const text = raw.toString("utf8")
    const payload = JSON.parse(text)

    // Optional signature verification (NOWPayments docs: x-nowpayments-sig)
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET as string | undefined
    const sigHeader = (req.headers["x-nowpayments-sig"] as string) || ""
    if (ipnSecret && sigHeader) {
      const hmac = crypto.createHmac("sha512", ipnSecret).update(text).digest("hex")
      if (hmac !== sigHeader) {
        res.status(400).json({ error: "Invalid signature" })
        return
      }
    }

    // Payment status mapping per NOWPayments: finished/confirmed/partially_paid etc.
    const status = String(payload.payment_status || payload.payment_status_description || "").toLowerCase()
    const isPaid = ["finished", "confirmed", "paid", "completed"].some((s) => status.includes(s))

    const orderIdRaw = payload.order_id
    if (!orderIdRaw) {
      res.status(200).json({ ok: true })
      return
    }

    // Our order_id is a JSON-encoded object
    let orderMeta: any = null
    try { orderMeta = JSON.parse(orderIdRaw) } catch { orderMeta = { t: "unknown" } }

    if (!isPaid) {
      res.status(200).json({ ok: true })
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(500).json({ error: "Supabase not configured" })
      return
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    if (orderMeta?.t === "mentor" && orderMeta?.sessionId && orderMeta?.menteeUserId) {
      // Auto-confirm mentor booking on successful NOWPayments IPN
      const { data, error } = await supabase
        .from("mentor_bookings")
        .upsert(
          { session_id: orderMeta.sessionId, mentee_user_id: orderMeta.menteeUserId, status: "confirmed" },
          { onConflict: 'session_id,mentee_user_id', ignoreDuplicates: true }
        )
      if (error) {
        // If duplicate, ignore
        if (!String(error.message || "").toLowerCase().includes("duplicate")) {
          console.error("mentor_bookings insert error", error)
        }
      }
      res.status(200).json({ ok: true })
      return
    }

    // For generic checkout, add fulfillment logic here if needed
    res.status(200).json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" })
  }
}


