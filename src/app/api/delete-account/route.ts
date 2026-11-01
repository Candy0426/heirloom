import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getRequestUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Only the signed-in user can delete their own account
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    // Delete user's check-ins
    await supabaseAdmin
      .from('check_ins')
      .delete()
      .eq('user_id', userId)

    // Delete user's inheritance plans
    await supabaseAdmin
      .from('inheritance_plans')
      .delete()
      .eq('user_id', userId)

    // Delete user's vaults
    await supabaseAdmin
      .from('vaults')
      .delete()
      .eq('user_id', userId)

    // Delete user auth account
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      throw authError
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
