# Phase 7 — Stripe Payments & Billing

## What Was Built
- Stripe checkout session creation API
- Stripe webhook handler for subscription lifecycle
- Premium billing page with Free/Pro plan comparison
- Plan enforcement structure (limits defined in `stripe.ts`)

## Files

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe singleton + PLANS config |
| `src/app/api/stripe/checkout/route.ts` | Create checkout session |
| `src/app/api/webhooks/stripe/route.ts` | Handle subscription events |
| `src/app/(dashboard)/[orgSlug]/billing/page.tsx` | Billing server page |
| `src/app/(dashboard)/[orgSlug]/billing/BillingClient.tsx` | Billing UI |

## Stripe Integration Architecture

### Why Stripe Checkout (not Stripe Elements)?
Stripe Checkout is a Stripe-hosted payment page that:
- Is already PCI-compliant (no card data touches your servers)
- Handles 3D Secure, Apple Pay, Google Pay automatically
- Updates for new payment methods without code changes
- Takes ~10 lines of code vs. hundreds for custom Elements UI

### Checkout Flow
```
User clicks "Upgrade to Pro"
  → POST /api/stripe/checkout { orgId }
  → Server validates admin role
  → stripe.checkout.sessions.create({ ... })
  → Returns { url: "https://checkout.stripe.com/..." }
  → Client: window.location.href = url
  → User completes payment on Stripe's page
  → Stripe redirects to success_url
  → Stripe POSTs to webhook → subscription activated
```

### Webhook Security
Stripe webhooks are verified using a **webhook secret** and `stripe.webhooks.constructEvent()`. This prevents anyone from faking a successful payment event to upgrade for free.

## Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set org `plan = "PRO"`, store `stripeCustomerId` and `stripeSubscriptionId` |
| `customer.subscription.deleted` | Set org `plan = "FREE"`, clear subscription ID |

## Billing Page UI

Plan comparison cards with:
- Clear pricing (Free: $0, Pro: $12/seat/month)
- Feature list with checkmarks
- "Recommended" badge on Pro plan
- Gradient highlight on Pro card
- Disabled button state for current plan
- Admin-only action (viewers and members see informational message)

## Environment Variables Required
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing Webhooks Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Checkpoints Passed
- ✅ Stripe singleton lib
- ✅ Checkout session creation API
- ✅ Webhook handler (subscription activated + cancelled)
- ✅ Billing page with plan comparison
- ✅ Role-gated billing action (admin only)
