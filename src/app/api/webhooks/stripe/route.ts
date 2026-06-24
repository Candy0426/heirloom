import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Dynamic import — will work when stripe package is installed
// For now, this endpoint returns 503 until stripe is configured
let stripe: any = null

async function initStripe() {
  if (stripe) return stripe
  try {
    const Stripe = (await import(/* webpackIgnore: true */ 'stripe')).default
    stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-05-27.dahlia' })
    return stripe
  } catch {
    return null
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }

    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    let event: any
    try {
      const s = await initStripe()
      if (!s) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
      event = s.webhooks.constructEvent(payload, signature, webhookSecret)
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: session.customer as string,
            status: 'active',
            plan: 'premium', // detect from price ID if needed
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string
        const periodEnd = invoice.lines.data[0]?.period?.end

        if (subscriptionId && periodEnd) {
          await supabase.from('subscriptions')
            .update({ 
              status: 'active',
              current_period_end: new Date(periodEnd * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        const subscription = event.data.object as any
        await supabase.from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
