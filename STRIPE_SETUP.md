# 💳 Stripe Setup Guide

## 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account (or use existing)
3. Get API keys from Dashboard → Developers → API keys
4. Add to Vercel environment variables:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 2. Create Products & Prices

In Stripe Dashboard → Products:

**Premium Plan:**
- Name: "Heirloom Premium"
- Recurring: Monthly €3.99
- Recurring: Annual €35.88 (€2.99/mo)
- Price IDs → add to env:
  ```
  STRIPE_PRICE_PREMIUM_MONTHLY=price_...
  STRIPE_PRICE_PREMIUM_ANNUAL=price_...
  ```

**Family Plan:**
- Name: "Heirloom Family"
- Recurring: Monthly €9.99
- Recurring: Annual €95.88 (€7.99/mo)
- Price IDs → add to env:
  ```
  STRIPE_PRICE_FAMILY_MONTHLY=price_...
  STRIPE_PRICE_FAMILY_ANNUAL=price_...
  ```

## 3. Configure Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://www.ourheirloom.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

## 4. Install Stripe SDK

```bash
npm install stripe
# or
npm install --legacy-peer-deps stripe
```

## 5. Apply Database Migration

Run the subscriptions table migration in Supabase:
```sql
-- File: supabase/migrations/20260624_subscriptions.sql
```

## 6. Test Locally

```bash
# Forward Stripe webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 7. Deploy

After adding env vars to Vercel, redeploy:
```bash
git push origin main
```

---

**Note:** Until Stripe is configured, pricing CTAs redirect to `/auth/signup` with a "Payments coming soon" message.
