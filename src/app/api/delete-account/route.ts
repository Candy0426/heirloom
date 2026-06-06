import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Delete user's vaults
    await supabaseAdmin
      .from('vaults')
      .delete()
      .eq('user_id', userId)

    // Delete user's inheritance plans
    await supabaseAdmin
      .from('inheritance_plans')
      .delete()
      .eq('user_id', userId)

    // Delete user's check-ins
    await supabaseAdmin
      .from('check_ins')
      .delete()
      .eq('user_id', userId)

    // Delete user auth account (this also cascades to user data if configured)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      throw authError
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}
