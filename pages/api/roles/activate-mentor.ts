import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// POST { userId: string }
// Requires header: x-service-key: <SUPABASE_SERVICE_ROLE_KEY>
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const serviceKeyHeader = req.headers['x-service-key'] as string | undefined
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!expected || serviceKeyHeader !== expected) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { userId } = req.body || {}
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !expected) {
    res.status(500).json({ error: 'Supabase not configured' })
    return
  }

  try {
    const admin = createClient(url, expected)
    // Store roles in a dedicated table or in user metadata; here we use auth schema
    const { data, error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'mentor' },
    })
    if (error) throw error
    res.status(200).json({ ok: true, user: data.user })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' })
  }
}
