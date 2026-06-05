'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

interface AssetInput {
  type: string
  name: string
  institution: string
  account_number: string
  balance: string
  notes: string
}

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

async function encryptData(data: any, password: string): Promise<{ encrypted: string; salt: string }> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  )
  
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)
  
  return {
    encrypted: btoa(String.fromCharCode(...combined)),
    salt: btoa(String.fromCharCode(...salt))
  }
}

export default function EditVaultPage() {
  const params = useParams()
  const vaultId = params?.id as string
  
  const [vault, setVault] = useState<Vault | null>(null)
  const [assets, setAssets] = useState<AssetInput[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [decryptKey, setDecryptKey] = useState('')
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [saving, setSaving] = useState(false)
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
      if (!vaultId) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', vaultId)
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

    if (user && vaultId) fetchVault()
  }, [supabase, vaultId, user])

  const handleDecrypt = async () => {
    if (!vault || !decryptKey) return
    
    let encryptedData = vault.encrypted_data
    if (typeof encryptedData === 'string') {
      try { encryptedData = JSON.parse(encryptedData) } catch (e) {
        setError('Corrupted data')
        return
      }
    }
    
    if (!encryptedData || !encryptedData.encrypted || !encryptedData.salt) {
      setError('No encrypted data found')
      return
    }
    
    try {
      const data = await decryptData(encryptedData, decryptKey)
      setAssets(data.assets || [])
      setIsDecrypted(true)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt')
    }
  }

  const updateAsset = (i: number, field: string, value: string) => {
    const updated = [...assets]
    updated[i] = { ...updated[i], [field]: value }
    setAssets(updated)
  }

  const addAsset = () => {
    setAssets([...assets, { type: 'bank', name: '', institution: '', account_number: '', balance: '', notes: '' }])
  }

  const removeAsset = (i: number) => {
    setAssets(assets.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    if (!vault || !decryptKey || assets.length === 0) return
    
    setSaving(true)
    setError('')
    
    try {
      const { encrypted, salt } = await encryptData({ assets }, decryptKey)
      
      const { error: dbError } = await supabase
        .from('vaults')
        .update({
          encrypted_data: { encrypted, salt },
          updated_at: new Date().toISOString()
        })
        .eq('id', vault.id)

      if (dbError) throw dbError
      
      alert('✅ Vault saved successfully!')
      window.location.href = `/vault/${vault.id}`
    } catch (err: any) {
      setError(err.message || 'Failed to save vault')
    } finally {
      setSaving(false)
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
        <Link href={`/vault/${vaultId}`} className="text-sm text-stone-400 hover:text-stone-200">← Cancel</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-2">✏️ Edit {vault?.name}</h1>
        <p className="text-stone-500 text-sm mb-6">
          Modify your encrypted assets and save changes.
        </p>

        {!isDecrypted ? (
          <div className="bg-stone-900 rounded-xl p-6 border border-stone-800 space-y-4">
            <p className="text-stone-400 text-sm">
              Enter your encryption key to edit your assets.
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
              disabled={!decryptKey}
              className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔓 Decrypt to Edit
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assets.map((asset, i) => (
              <div key={i} className="bg-stone-900 rounded-xl p-4 sm:p-6 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-300">Asset #{i + 1}</span>
                  <button 
                    onClick={() => removeAsset(i)}
                    className="text-rose-400 hover:text-rose-300 text-sm"
                  >
                    🗑️ Remove
                  </button>
                </div>
                
                <select
                  value={asset.type}
                  onChange={e => updateAsset(i, 'type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base min-h-[44px]"
                >
                  <option value="bank">🏦 Bank Account</option>
                  <option value="crypto">₿ Crypto Wallet</option>
                  <option value="investment">📈 Investment</option>
                  <option value="insurance">🛡️ Insurance</option>
                  <option value="real_estate">🏠 Real Estate</option>
                  <option value="other">📋 Other</option>
                </select>
                
                <input
                  value={asset.name}
                  onChange={e => updateAsset(i, 'name', e.target.value)}
                  placeholder="Asset name (e.g. Main Savings)"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base min-h-[44px]"
                />
                <input
                  value={asset.institution}
                  onChange={e => updateAsset(i, 'institution', e.target.value)}
                  placeholder="Institution / Exchange"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base min-h-[44px]"
                />
                <input
                  value={asset.account_number}
                  onChange={e => updateAsset(i, 'account_number', e.target.value)}
                  placeholder="Account / Wallet address"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base min-h-[44px]"
                />
                <input
                  value={asset.balance}
                  onChange={e => updateAsset(i, 'balance', e.target.value)}
                  placeholder="Approximate balance (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base min-h-[44px]"
                />
                <textarea
                  value={asset.notes}
                  onChange={e => updateAsset(i, 'notes', e.target.value)}
                  placeholder="Notes (e.g. 'Call John for access')"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base"
                />
              </div>
            ))}

            <button onClick={addAsset} className="text-sm text-amber-400 hover:text-amber-300 py-2">+ Add another asset</button>

            {error && (
              <p className="text-rose-400 text-sm">{error}</p>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving || assets.length === 0}
                className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '🔐 Encrypting & Saving...' : '💾 Save Changes'}
              </button>
              
              <Link href={`/vault/${vaultId}`} className="w-full py-3 rounded-lg border border-stone-700 text-stone-400 text-center hover:text-stone-200">
                ← Cancel
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
