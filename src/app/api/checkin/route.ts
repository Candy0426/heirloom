import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { user_id, plan_id } = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('check_ins')
      .insert({ user_id, plan_id, checked_at: new Date().toISOString() })
      .select()

    if (error) throw error

    // Update last_check_in on the plan
    await supabaseAdmin
      .from('inheritance_plans')
      .update({ last_check_in: new Date().toISOString() })
      .eq('id', plan_id)

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
