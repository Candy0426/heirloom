import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getRequestUser } from '@/lib/auth'
import { sendEmail, welcomeEmail } from '@/lib/email'

// Client-triggered emails only. Recipients are always resolved server-side,
// never taken from the request, so this can't be used as an open relay.
// Reminder and inheritance emails are sent by the cron jobs, not from here.
export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, planId } = await request.json()

    let to: string
    let emailData

    switch (type) {
      case 'welcome':
        to = user.email
        emailData = welcomeEmail('there')
        break
      case 'beneficiary-welcome': {
        const { data: plan } = await supabaseAdmin
          .from('inheritance_plans')
          .select('beneficiary_email, beneficiary_name')
          .eq('id', planId)
          .eq('user_id', user.id)
          .single()
        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }
        to = plan.beneficiary_email
        emailData = welcomeEmail(plan.beneficiary_name || 'Partner')
        break
      }
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const result = await sendEmail({
      to,
      ...emailData,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
