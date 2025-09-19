# Incident Response (MVP)

## Roles
- Incident Commander (IC)
- Comms Lead
- Engineering On-Call

## Severity
- P0 Critical: user data at risk; service compromise
- P1 High: major functionality broken
- P2 Medium: degraded experience
- P3 Low: minor issue

## Process
1. Detect: alerts (Sentry, logs) or external report
2. Triage: assign severity and IC
3. Contain: revoke keys, isolate services, block malicious IPs
4. Eradicate: patch vulnerability, rotate secrets
5. Recover: restore service, verify integrity
6. Postmortem: root cause, action items, timeline

## Communications
- Internal: Slack #incidents; update every 30–60 min (P0/P1)
- External: status page or email for material incidents

## Artifacts
- Timeline of events
- Impacted components/users
- Fixes + follow-ups
