import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, checkInReminder, inheritanceTriggeredEmail, ownerTriggeredNotice } from '@/lib/email'

const DAY_MS = 24 * 60 * 60 * 1000
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ourheirloom.app'

// Daily job (vercel.json): remind owners who are close to their deadline,
// and trigger plans whose owner hasn't checked in for the whole wait period.
export async function GET(request: Request) {
  // Vercel cron sends "Authorization: Bearer $CRON_SECRET". Refuse to run without a secret,
  // otherwise "Bearer undefined" would be accepted.
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: plans, error } = await supabaseAdmin
      .from('inheritance_plans')
      .select('id, user_id, beneficiary_email, beneficiary_name, wait_days, last_check_in, created_at')
      .eq('status', 'active')

    if (error) throw error

    const now = Date.now()
    let reminders = 0
    const triggered: string[] = []
    const failures: string[] = []

    for (const plan of plans || []) {
      const lastCheckIn = new Date(plan.last_check_in || plan.created_at).getTime()
      const daysRemaining = plan.wait_days - Math.floor((now - lastCheckIn) / DAY_MS)
      const beneficiaryName = plan.beneficiary_name || plan.beneficiary_email

      const { data: owner } = await supabaseAdmin.auth.admin.getUserById(plan.user_id)
      const ownerEmail = owner?.user?.email
      if (!ownerEmail) {
        failures.push(plan.id)
        continue
      }

      if (daysRemaining > 0) {
        // Remind at the halfway point, then every day during the last week
        if (daysRemaining === Math.floor(plan.wait_days / 2) || daysRemaining <= 7) {
          const res = await sendEmail({ to: ownerEmail, ...checkInReminder(daysRemaining, beneficiaryName) })
          if (res.success) reminders++
          else failures.push(plan.id)
        }
        continue
      }

      // Deadline passed: notify the beneficiary first, so a failed email is retried tomorrow
      // instead of leaving a triggered plan that nobody knows about.
      const res = await sendEmail({
        to: plan.beneficiary_email,
        ...inheritanceTriggeredEmail(beneficiaryName, ownerEmail, plan.wait_days, `${APP_URL}/access/${plan.id}`),
      })
      if (!res.success) {
        failures.push(plan.id)
        continue
      }

      await supabaseAdmin
        .from('inheritance_plans')
        .update({ status: 'triggered' })
        .eq('id', plan.id)
        .eq('status', 'active')

      await sendEmail({ to: ownerEmail, ...ownerTriggeredNotice(beneficiaryName, plan.wait_days) })
      triggered.push(plan.id)
    }

    return NextResponse.json({
      checked: plans?.length || 0,
      reminders,
      triggered: triggered.length,
      failures: failures.length,
    })
  } catch (err) {
    console.error('Inheritance cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
