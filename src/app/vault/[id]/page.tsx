'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

interface Vault {
  id: string
  name: string
  encrypted_data: { encrypted: string; salt: string }
  created_at: string
}

async function decryptData(encryptedData: { encrypted: string; salt: string }, key: string): Promise<any> {
  try {
    const combined = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0))
    const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0))
    
    const iv = combined.slice(16, 28)
    const ciphertext = combined.slice(28)
    
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(key), 'PBKDF2', false, ['deriveBits', 'deriveKey']
    )
    
    const cryptoKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertext
    )
    
    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(decrypted))
  } catch (e) {
    throw new Error('Invalid encryption key or corrupted data')
  }
}

export default function VaultPage({ params }: { params: { id: string } }) {
  const [vault, setVault] = useState<Vault | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [decryptKey, setDecryptKey] = useState('')
  const [decryptedData, setDecryptedData] = useState<any>(null)
  const [decrypting, setDecrypting] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
    }
    checkUser()
  }, [supabase])

  useEffect(() => {
    const fetchVault = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        setError('Vault not found or access denied')
        setLoading(false)
        return
      }

      setVault(data)
      setLoading(false)
    }

    if (user) fetchVault()
  }, [supabase, params.id, user])

  const handleDecrypt = async () => {
    if (!vault || !decryptKey) return
    
    setDecrypting(true)
    setError('')
    
    try {
      const data = await decryptData(vault.encrypted_data, decryptKey)
      setDecryptedData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt vault')
    } finally {
      setDecrypting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-stone-400">Loading...</div>
      </div>
    )
  }

  if (error && !vault) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 mb-4">{error}</p>
          <Link href="/dashboard" className="text-amber-400 hover:text-amber-300">← Back to dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-semibold text-stone-100">Heirloom</span>
        </div>
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-200">← Dashboard</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-2">{vault?.name}</h1>
        <p className="text-stone-500 text-sm mb-6">
          Created {vault?.created_at ? new Date(vault.created_at).toLocaleDateString() : ''}
        </p>

        {!decryptedData ? (
          <div className="bg-stone-900 rounded-xl p-6 border border-stone-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <span className="text-xl">🔐</span>
              <span className="font-semibold">Vault is encrypted</span>
            </div>
            <p className="text-stone-400 text-sm">
              Enter your encryption key to view your assets. We cannot recover this key if lost.
            </p>
            
            <input
              type="password"
              value={decryptKey}
              onChange={e => setDecryptKey(e.target.value)}
              placeholder="Enter your encryption key..."
              className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base"
            />
            
            {error && (
              <p className="text-rose-400 text-sm">{error}</p>
            )}
            
            <button
              onClick={handleDecrypt}
              disabled={decrypting || !decryptKey}
              className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {decrypting ? 'Decrypting...' : '🔓 Decrypt Vault'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <span className="text-xl">🔓</span>
              <span className="font-semibold">Vault decrypted</span>
            </div>
            
            {decryptedData.assets?.map((asset: any, i: number) => (
              <div key={i} className="bg-stone-900 rounded-xl p-4 sm:p-6 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {asset.type === 'bank' && '🏦'}
                    {asset.type === 'crypto' && '₿'}
                    {asset.type === 'investment' && '📈'}
                    {asset.type === 'insurance' && '🛡️'}
                    {asset.type === 'real_estate' && '🏠'}
                    {asset.type === 'other' && '📋'}
                  </span>
                  <h3 className="font-semibold text-stone-100">{asset.name || 'Unnamed Asset'}</h3>
                </div>
                
                {asset.institution && (
                  <p className="text-stone-400 text-sm"><span className="text-stone-500">Institution:</span> {asset.institution}</p>
                )}
                {asset.account_number && (
                  <p className="text-stone-400 text-sm"><span className="text-stone-500">Account:</span> {asset.account_number}</p>
                )}
                {asset.balance && (
                  <p className="text-stone-400 text-sm"><span className="text-stone-500">Balance:</span> {asset.balance}</p>
                )}
                {asset.notes && (
                  <p className="text-stone-400 text-sm"><span className="text-stone-500">Notes:</span> {asset.notes}</p>
                )}
              </div>
            ))}
            
            <button
              onClick={() => { setDecryptedData(null); setDecryptKey(''); setError('') }}
              className="w-full py-3 rounded-lg border border-stone-700 text-stone-400 hover:text-stone-200"
            >
              🔒 Lock Vault
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
