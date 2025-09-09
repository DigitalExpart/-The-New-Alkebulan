import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  try {
    // Browsers send 'application/csp-report' or 'application/json'
    const report = req.body || {}
    // eslint-disable-next-line no-console
    console.warn('CSP Report:', JSON.stringify(report))
  } catch (_) {
    // ignore
  }
  res.status(204).end()
}
