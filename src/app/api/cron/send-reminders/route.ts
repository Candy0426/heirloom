import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, checkInReminder, inheritanceTriggeredEmail } from '@/lib/email'

export async function POST() {
  try {
    // Find plans where last check-in is approaching trigger
    const { data: plans, error } = await supabaseAdmin
      .from('inheritance_plans')
      .select('*, vaults(name)')
      .eq('status', 'active')
    
    if (error) throw error
    
    const now = new Date()
    let sent = 0
    
    for (const plan of plans || []) {
      const lastCheckIn = new Date(plan.last_check_in)
      const daysSinceCheckIn = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = plan.wait_days - daysSinceCheckIn
      
      // Send reminder at 50% and 75% of wait time
      const reminderDays = [Math.floor(plan.wait_days * 0.5), Math.floor(plan.wait_days * 0.75)]
      
      if (daysRemaining > 0 && reminderDays.includes(daysRemaining)) {
        await sendEmail({
          to: plan.beneficiary_email,
          ...checkInReminder(plan.beneficiary_name || 'Partner', daysRemaining)
        })
        sent++
      }
      
      // Trigger inheritance if expired
      if (daysRemaining <= 0) {
        // Mark plan as triggered
        await supabaseAdmin
          .from('inheritance_plans')
          .update({ status: 'triggered', updated_at: now.toISOString() })
          .eq('id', plan.id)
        
        // Send notification to beneficiary
        try {
          const planName = plan.beneficiary_name || 'Partner'
          const userName = plan.user_id ? 'your loved one' : 'your loved one'
          
          await sendEmail({
            to: plan.beneficiary_email,
            ...inheritanceTriggeredEmail(
              planName,
              userName,
              `https://www.ourheirloom.app/access/${plan.id}`,
              'Use the vault key they shared with you'
            )
          })
        } catch (emailErr) {
          console.error('Failed to send inheritance email:', emailErr)
        }
        
        sent++
      }
    }
    
    return NextResponse.json({ success: true, remindersSent: sent, plansChecked: plans?.length || 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
