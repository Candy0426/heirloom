import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getRequestUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan_id } = await request.json()
    if (!plan_id) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // The plan must belong to the caller and still be active
    const { data: plan } = await supabaseAdmin
      .from('inheritance_plans')
      .select('id, status')
      .eq('id', plan_id)
      .eq('user_id', user.id)
      .single()

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }
    if (plan.status !== 'active') {
      return NextResponse.json({ error: 'Plan is no longer active' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .insert({ user_id: user.id, plan_id, checked_at: now })
      .select()

    if (error) throw error

    await supabaseAdmin
      .from('inheritance_plans')
      .update({ last_check_in: now })
      .eq('id', plan_id)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Check-in error:', err)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
