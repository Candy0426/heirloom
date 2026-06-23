import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ plan_id: string }> }
) {
  try {
    const { plan_id: planId } = await params

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })
    }

    // Fetch the plan with vault data
    const { data: plan, error: planError } = await supabaseAdmin
      .from('inheritance_plans')
      .select('*, vaults(id, name, encrypted_data, created_at)')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Only return data if plan is triggered
    if (plan.status !== 'triggered') {
      return NextResponse.json(
        { error: 'Access not yet granted. Please wait for the plan to be triggered.' },
        { status: 403 }
      )
    }

    // Return vault data (still encrypted — beneficiary must have the key)
    return NextResponse.json({
      vault: {
        id: plan.vaults.id,
        name: plan.vaults.name,
        encrypted_data: plan.vaults.encrypted_data,
        created_at: plan.vaults.created_at,
      },
      beneficiary: {
        name: plan.beneficiary_name,
        email: plan.beneficiary_email,
      },
      triggered_at: plan.updated_at,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
