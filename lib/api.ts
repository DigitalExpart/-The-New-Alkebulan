export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  return res
}
