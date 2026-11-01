import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getRequestUser } from '@/lib/auth'
import { sealShare } from '@/lib/shareCrypto'

const ALLOWED_WAIT_DAYS = [30, 60, 90]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Create an inheritance plan. The client sends only the platform's share of the
// vault key; the beneficiary's share never reaches the server.
export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vault_id, beneficiary_email, beneficiary_name, wait_days, server_share } = await request.json()

    if (!vault_id || typeof server_share !== 'string' || !server_share) {
      return NextResponse.json({ error: 'Missing vault or key share' }, { status: 400 })
    }
    if (typeof beneficiary_email !== 'string' || !EMAIL_RE.test(beneficiary_email.trim())) {
      return NextResponse.json({ error: 'Invalid beneficiary email' }, { status: 400 })
    }
    if (!ALLOWED_WAIT_DAYS.includes(Number(wait_days))) {
      return NextResponse.json({ error: 'Invalid wait period' }, { status: 400 })
    }
    if (beneficiary_email.trim().toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'The beneficiary must be someone other than you' }, { status: 400 })
    }

    // The vault must belong to the caller
    const { data: vault } = await supabaseAdmin
      .from('vaults')
      .select('id')
      .eq('id', vault_id)
      .eq('user_id', user.id)
      .single()

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    const { data: plan, error } = await supabaseAdmin
      .from('inheritance_plans')
      .insert({
        user_id: user.id,
        vault_id: vault.id,
        beneficiary_email: beneficiary_email.trim(),
        beneficiary_name: typeof beneficiary_name === 'string' ? beneficiary_name.trim().slice(0, 100) : null,
        wait_days: Number(wait_days),
        status: 'active',
        last_check_in: new Date().toISOString(),
        share_part_1: sealShare(server_share),
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, id: plan.id })
  } catch (err) {
    console.error('Create plan error:', err)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
