import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createCheckoutSession, STRIPE_PRICES, isStripeConfigured } from '@/lib/stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Payments not yet available' }, { status: 503 })
    }

    const { plan, billing, userId, email } = await request.json()

    // Validate plan
    if (!['premium', 'family'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    if (!['monthly', 'annual'].includes(billing)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    const priceKey = `${plan}_${billing}` as keyof typeof STRIPE_PRICES
    const priceId = STRIPE_PRICES[priceKey]

    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }

    const session = await createCheckoutSession({
      customerEmail: email,
      priceId,
      successUrl: `${request.headers.get('origin') || 'https://www.ourheirloom.app'}/dashboard?success=true`,
      cancelUrl: `${request.headers.get('origin') || 'https://www.ourheirloom.app'}/?canceled=true`,
      userId,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
