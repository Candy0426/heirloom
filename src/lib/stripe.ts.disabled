// Stripe server-side integration — lazy loaded to allow build without npm install
// TO ENABLE: npm install stripe
let StripeModule: any = null

async function getStripe(): Promise<any> {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!StripeModule) {
    try {
      // Dynamic import — will fail gracefully if stripe not installed
      StripeModule = await import(/* webpackIgnore: true */ 'stripe')
    } catch {
      console.warn('Stripe SDK not installed. Run: npm install stripe')
      return null
    }
  }
  return new StripeModule.default(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
}

// Price IDs — create these in Stripe Dashboard
export const STRIPE_PRICES = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
  premium_annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || '',
  family_monthly: process.env.STRIPE_PRICE_FAMILY_MONTHLY || '',
  family_annual: process.env.STRIPE_PRICE_FAMILY_ANNUAL || '',
}

// Product configuration
export const PRODUCTS = {
  premium: {
    name: 'Heirloom Premium',
    description: 'Unlimited vaults, file uploads, 2 beneficiaries',
  },
  family: {
    name: 'Heirloom Family',
    description: 'Everything in Premium for up to 5 family members',
  },
}

export async function isStripeConfigured(): Promise<boolean> {
  const stripe = await getStripe()
  return !!stripe && !!STRIPE_PRICES.premium_monthly
}

// Create checkout session
export async function createCheckoutSession(params: {
  customerEmail: string
  priceId: string
  successUrl: string
  cancelUrl: string
  userId: string
}) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  return stripe.checkout.sessions.create({
    customer_email: params.customerEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
      },
    },
  })
}

// Create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// Get subscription status
export async function getSubscription(subscriptionId: string) {
  const stripe = await getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  return stripe.subscriptions.retrieve(subscriptionId)
}
