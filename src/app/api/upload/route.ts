import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const vaultId = formData.get('vaultId') as string
    
    if (!file || !vaultId) {
      return NextResponse.json({ error: 'Missing file or vaultId' }, { status: 400 })
    }

    // Create admin client for storage operations
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `vaults/${vaultId}/${timestamp}_${file.name}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('heirloom-files')
      .upload(filename, file, {
        contentType: 'application/octet-stream',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('heirloom-files')
      .getPublicUrl(filename)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: filename
    })

  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
