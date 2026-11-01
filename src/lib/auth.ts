import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'

// Resolve the signed-in user from the "Authorization: Bearer <access_token>" header.
// Never trust a user id sent in the request body.
export async function getRequestUser(request: Request): Promise<User | null> {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
