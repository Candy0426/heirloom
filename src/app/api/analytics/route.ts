import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Anonymous analytics API — no PII, no cookies, no fingerprinting
export async function POST(request: NextRequest) {
  try {
    const { event, properties, timestamp } = await request.json()

    // Validate
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Invalid event name' }, { status: 400 })
    }

    // Sanitize — strip any potential PII
    const sanitized = sanitizeProperties(properties || {})

    // Store in Supabase (or drop if not configured)
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      })

      await supabase.from('analytics_events').insert({
        event,
        properties: sanitized,
        timestamp: timestamp || new Date().toISOString(),
        session_id: properties?.session_id || generateSessionId(),
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true }) // Fail silently
  }
}

function sanitizeProperties(props: Record<string, any>): Record<string, any> {
  const allowed = ['url', 'referrer', 'userAgent', 'screenSize', 'path', 'method', 'plan', 'billing', 'success']
  const result: Record<string, any> = {}
  for (const key of allowed) {
    if (props[key] !== undefined) {
      // Truncate long strings
      const val = props[key]
      result[key] = typeof val === 'string' && val.length > 500 ? val.slice(0, 500) : val
    }
  }
  return result
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
