import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { openShare } from '@/lib/shareCrypto'

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
      .select('id, user_id, status, beneficiary_name, share_part_1, vaults(id, name, encrypted_data, created_at)')
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

    const vault = Array.isArray(plan.vaults) ? plan.vaults[0] : plan.vaults
    if (!vault) {
      return NextResponse.json({ error: 'Vault no longer exists' }, { status: 404 })
    }

    const { data: owner } = await supabaseAdmin.auth.admin.getUserById(plan.user_id)

    // Vault data stays encrypted. The platform's key share is released now; the beneficiary
    // combines it with their key card in the browser. Legacy plans have no share (null).
    return NextResponse.json({
      vault: {
        id: vault.id,
        name: vault.name,
        encrypted_data: vault.encrypted_data,
        created_at: vault.created_at,
      },
      beneficiary: {
        name: plan.beneficiary_name,
      },
      owner_email: owner?.user?.email || null,
      server_share: openShare(plan.share_part_1),
    })
  } catch (err) {
    console.error('Access error:', err)
    return NextResponse.json({ error: 'Failed to load vault' }, { status: 500 })
  }
}
