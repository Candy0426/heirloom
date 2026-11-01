import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getRequestUser } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB, matches the client-side limit

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vaultId = formData.get('vaultId') as string

    if (!file || !vaultId) {
      return NextResponse.json({ error: 'Missing file or vaultId' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })
    }

    // The vault must belong to the caller
    const { data: vault } = await supabaseAdmin
      .from('vaults')
      .select('id')
      .eq('id', vaultId)
      .eq('user_id', user.id)
      .single()

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    // Random filename: doesn't leak the original name and can't escape the vault folder
    const filename = `vaults/${vault.id}/${crypto.randomUUID()}.enc`

    // Upload to Supabase Storage (the bucket should be private; no public URL is returned)
    const { error } = await supabaseAdmin.storage
      .from('heirloom-files')
      .upload(filename, file, {
        contentType: 'application/octet-stream',
        upsert: false,
      })

    if (error) throw error

    return NextResponse.json({
      success: true,
      path: filename
    })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
