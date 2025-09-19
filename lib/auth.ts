import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient, type User } from '@supabase/supabase-js'

function getEnv(name: string): string | undefined {
  const v = process.env[name]
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

function extractBearerToken(req: NextApiRequest): string | undefined {
  const auth = req.headers.authorization || req.headers.Authorization as string | undefined
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim()
  }
  const cookieHeader = req.headers.cookie || ''
  // Very light cookie parsing; prefer Authorization header
  const cookies = new Map<string, string>()
  cookieHeader.split(';').forEach((p) => {
    const [k, ...rest] = p.trim().split('=')
    if (k) cookies.set(k, rest.join('='))
  })
  const sb = cookies.get('sb-access-token') || cookies.get('sb:token')
  return sb || undefined
}

export async function getUserFromRequest(req: NextApiRequest): Promise<User | null> {
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnonKey) return null

  const token = extractBearerToken(req)
  if (!token) return null

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null
  return data.user
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse): Promise<User | null> {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}
