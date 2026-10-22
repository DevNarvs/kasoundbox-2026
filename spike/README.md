# Week-1 spike (throwaway)

Quick probes that settle the week-1 [U] facts on the **test** project (D-28). This folder is deleted after the go/no-go (D-32). Results go in `docs/06-delivery/week1-results.md`.

Plan: `docs/superpowers/plans/2026-10-21-week1-spike.md`.

## Setup (developer machine)

1. Copy `.env.example` to `.env.local` and fill it with the **test** project's values. Never commit it.
2. `npm ci`
3. Deploy: `npx vercel deploy --prod` (the Vercel project's root directory is `spike/`).

## Probes

Every probe prints `PASS <id> <detail>` or `FAIL <id> <detail>` and exits non-zero on any failure.

| Probe | Command | Settles |
|---|---|---|
| Health and region | `SPIKE_BASE_URL=https://<test-app> npx tsx scripts/check-health.ts` | W1-1e, W1-1f |
