# 🔐 Security Checklist — Heirloom

## Architecture Review

| Layer | Status | Notes |
|-------|--------|-------|
| Client-side encryption | ✅ | AES-256-GCM, PBKDF2 key derivation |
| Zero-knowledge | ✅ | Server never sees plaintext or decryption key |
| Key storage | ✅ | SessionStorage only (never sent to server) |
| Supabase RLS | ✅ | Row-level security enforced |
| Supabase service role | ✅ | Only in API routes, never exposed client-side |
| HTTPS/TLS | ✅ | Enforced on Vercel |

## Authentication

- [x] Password hashing (Supabase Auth handles this)
- [x] MFA/TOTP available
- [x] Session management via Supabase
- [x] CSRF protection (handled by Next.js + Supabase)

## Data Protection

- [x] Encryption at rest (Supabase)
- [x] Encryption in transit (TLS 1.3)
- [x] No plaintext in database
- [x] No key in database
- [x] No key in logs

## Input Validation

- [x] Email validation on signup/login
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization on vault data
- [ ] File upload validation (type, size)

## API Security

- [x] `/api/access/[plan_id]` — only returns data if plan is triggered
- [x] `/api/cron/*` — should be protected by Vercel cron secret
- [ ] Rate limiting on `/api/analytics`
- [ ] Rate limiting on auth endpoints

## Recommendations

### Immediate (before public launch)

1. **Set Vercel Cron Secret** — add `CRON_SECRET` env var and validate in cron endpoints
2. **Rate limiting** — add `@upstash/ratelimit` or Cloudflare rules
3. **Content Security Policy** — add CSP headers in `next.config.js`
4. **Security headers** — add HSTS, X-Frame-Options, X-Content-Type-Options

### Short-term

5. **File upload scanning** — scan uploads for malware
6. **Dependency audit** — run `npm audit` regularly
7. **Penetration testing** — hire security firm before handling real user data

### Compliance

- GDPR: User data is encrypted, user can delete account (✅ implemented)
- Data residency: Supabase EU region (verify)
- Breach notification: 72h under GDPR

---

Last reviewed: 2026-06-24
