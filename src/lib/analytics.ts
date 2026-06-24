// Privacy-focused analytics — no 3rd party tracking
// Sends events to our own API endpoint instead of Google/Plausible/etc
// All data is anonymous (no PII collected)

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS !== 'false'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, string | number | boolean | null>
  timestamp?: string
}

export function track(event: string, properties?: Record<string, string | number | boolean | null>): void {
  if (typeof window === 'undefined') return
  if (!ANALYTICS_ENABLED) return

  const payload: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      url: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent.slice(0, 100), // truncated for privacy
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    },
    timestamp: new Date().toISOString(),
  }

  // Send to our API (non-blocking)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(payload))
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently fail — analytics should never break the app
    })
  }
}

// Page view tracking
export function trackPageView(): void {
  track('page_view', { path: window.location.pathname })
}

// Common events
export function trackSignup(method: 'email' | 'google'): void {
  track('signup', { method })
}

export function trackLogin(method: 'email' | 'google'): void {
  track('login', { method })
}

export function trackVaultCreated(): void {
  track('vault_created')
}

export function trackVaultEdited(): void {
  track('vault_edited')
}

export function trackInheritancePlanCreated(): void {
  track('inheritance_plan_created')
}

export function trackCheckIn(): void {
  track('check_in')
}

export function trackPricingClick(plan: 'free' | 'premium' | 'family', billing: 'monthly' | 'annual'): void {
  track('pricing_click', { plan, billing })
}

export function trackBeneficiaryAccess(planId: string, success: boolean): void {
  track('beneficiary_access', { planId: planId.slice(0, 8), success })
}
