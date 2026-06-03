import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: plans, error } = await supabaseAdmin
      .from('inheritance_plans')
      .select('*, vaults(encrypted_data, user_id)')
      .eq('status', 'active')

    if (error) throw error

    const triggered: string[] = []
    const now = new Date()

    for (const plan of plans || []) {
      const lastCheckIn = new Date(plan.last_check_in || plan.created_at)
      const waitMs = plan.wait_days * 24 * 60 * 60 * 1000
      
      if (now.getTime() - lastCheckIn.getTime() > waitMs) {
        triggered.push(plan.id)
      }
    }

    return NextResponse.json({ 
      checked: plans?.length || 0, 
      triggered: triggered.length,
      ids: triggered 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
