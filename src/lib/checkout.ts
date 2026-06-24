// Stripe checkout handler for pricing page
// Uses our own API endpoint — no Stripe client library needed in browser

import { useState } from 'react'

interface UseCheckoutOptions {
  userId: string
  email: string
}

export function useCheckout({ userId, email }: UseCheckoutOptions) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function checkout(plan: 'premium' | 'family', billing: 'monthly' | 'annual') {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing, userId, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If Stripe not configured, redirect to signup with message
        if (response.status === 503) {
          window.location.href = '/auth/signup?message=payments_soon'
          return
        }
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return { checkout, loading, error }
}
