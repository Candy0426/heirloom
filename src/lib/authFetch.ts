import type { SupabaseClient } from '@supabase/supabase-js'

// fetch() that attaches the current Supabase access token, for our authenticated API routes
export async function authFetch(supabase: SupabaseClient, url: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(init.headers)
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(url, { ...init, headers })
}
