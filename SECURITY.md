# Security at Diaspora Market Hub (MVP)

This document summarizes our MVP security controls and how to report vulnerabilities.

## Scope (MVP)
- Next.js 15 App/Pages Router
- Supabase (Auth + Postgres)
- Stripe payments

## Key Controls
- Authentication: Supabase Auth; JWT required for all API routes.
- Authorization: Middleware origin checks; RLS policies for mentor tables.
- Input Validation: Zod on API bodies/queries.
- Rate Limiting: Upstash (edge), 60 req/min default.
- Headers: HSTS, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin.
- CSP: Report-Only initially, will enforce after fixing violations.
- Payments: Stripe only; server-calculated amounts; webhook with signature verification and Redis dedup.
- Secrets: Environment variables; no secrets committed.
- Observability: Sentry for FE/BE errors; Supabase logs.

## Production Domain
- App URL: https://thenewalkebulan.com
- Allowed Origins: https://thenewalkebulan.com

Set in environment:
- `NEXT_PUBLIC_APP_URL=https://thenewalkebulan.com`
- `NEXT_PUBLIC_ALLOWED_ORIGINS=https://thenewalkebulan.com`

## Supabase Configuration
- URL: `https://<your-ref>.supabase.co`
- Auth → URL Configuration:
  - Site URL: `https://thenewalkebulan.com`
  - Redirect URLs: include `https://thenewalkebulan.com/*` as needed

## Payments Endpoints (Production)
- Stripe Webhook: `https://thenewalkebulan.com/api/stripe/webhook`
- NOWPayments IPN: `https://thenewalkebulan.com/api/payments/nowpayments/webhook`

Ensure respective secrets are set in environment:
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`

## Data Protection
- TLS for all traffic (HTTPS).
- RLS enabled for mentor tables; owner/role-based access.
- Minimal data collection; no raw card data stored.

## Incident Response (MVP)
- Severity triage: Critical (P0), High (P1), Medium (P2), Low (P3)
- Initial response: acknowledge within 24h; fixes prioritized by severity.

## Reporting Vulnerabilities
Please email security@your-domain.tld with:
- Steps to reproduce
- Impact and affected endpoints
- Proof-of-concept if available

We appreciate responsible disclosure. We do not run a public bug bounty during MVP.
