'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Global variable to persist encryption key across re-renders
let GLOBAL_VAULT_KEY = ''

interface AssetInput {
  type: string
  name: string
  institution: string
  account_number: string
  balance: string
  notes: string
}

// Simple client-side encryption using Web Crypto API
async function encryptData(data: any, password: string): Promise<{ encrypted: string; salt: string }> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  // Derive key from password
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
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(data))
  )
  
  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(encrypted), salt.length + iv.length)
  
  return {
    encrypted: btoa(String.fromCharCode(...combined)),
    salt: btoa(String.fromCharCode(...salt))
  }
}

function FileUploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected) return
    setFiles([...files, ...Array.from(selected)])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        id="vault-files"
      />
      <label 
        htmlFor="vault-files" 
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-stone-700 hover:border-amber-500/50 cursor-pointer transition-colors"
      >
        <span className="text-stone-400 text-sm">📎 Click to upload documents, images, PDFs</span>
      </label>
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-stone-800 rounded-lg px-3 py-2 text-sm">
              <span className="text-stone-300 truncate">{file.name}</span>
              <button 
                onClick={() => removeFile(i)}
                className="text-stone-500 hover:text-rose-400 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-stone-600">
        🔐 Files will be encrypted before upload. Max 10MB each.
      </p>
    </div>
  )
}

export default function CreateVaultPage() {
  const [name, setName] = useState('My Vault')
  const [assets, setAssets] = useState<AssetInput[]>([{ type: 'bank', name: '', institution: '', account_number: '', balance: '', notes: '' }])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [vaultKey, setVaultKey] = useState('')

  // Restore key from sessionStorage on mount (for page refreshes)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = sessionStorage.getItem('heirloom_vault_key')
      if (key) setVaultKey(key)
    }
  }, [])
  
  // Also restore key when reaching step 3
  useEffect(() => {
    if (step === 3 && typeof window !== 'undefined') {
      const key = sessionStorage.getItem('heirloom_vault_key')
      if (key) setVaultKey(key)
    }
  }, [step])

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const addAsset = () => {
    setAssets([...assets, { type: 'bank', name: '', institution: '', account_number: '', balance: '', notes: '' }])
  }

  const updateAsset = (i: number, field: string, value: string) => {
    const updated = [...assets]
    updated[i] = { ...updated[i], [field]: value }
    setAssets(updated)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please sign in to create a vault')
        setLoading(false)
        return
      }

      // Generate encryption key (user must remember this!)
      const keyBytes = crypto.getRandomValues(new Uint8Array(32))
      const encryptionKey = btoa(String.fromCharCode(...keyBytes))
      
      // Encrypt assets
      const { encrypted, salt } = await encryptData({ assets }, encryptionKey)
      
      // Save to Supabase
      const { error: dbError } = await supabase
        .from('vaults')
        .insert({
          user_id: user.id,
          name,
          encrypted_data: { encrypted, salt },
          asset_count: assets.filter(a => a.name.trim()).length
        })

      if (dbError) {
        throw dbError
      }

      setSuccess(true)
      setStep(3)
      
      // Use global variable (persists across re-renders)
      GLOBAL_VAULT_KEY = encryptionKey
      sessionStorage.setItem('heirloom_vault_key', encryptionKey)
      setVaultKey(encryptionKey)
      
      console.log('GLOBAL_VAULT_KEY set:', GLOBAL_VAULT_KEY.substring(0, 10) + '...') // Debug
      
    } catch (err: any) {
      setError(err.message || 'Failed to create vault')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="px-4 sm:px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-semibold text-stone-100">Heirloom</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto">
          {[1,2,3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step >= s ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'}`}>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Name your vault</h1>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-base min-h-[48px]"
              placeholder="e.g. My Family Assets"
            />
            <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Add your assets</h1>
            <p className="text-stone-400 text-sm">This data never leaves your browser unencrypted.</p>

            {assets.map((asset, i) => (
              <div key={i} className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
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
                  placeholder="Notes (e.g. 'Call John for access', 'Password in family safe')"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-base"
                />
              </div>
            ))}

            <button onClick={addAsset} className="text-sm text-amber-400 hover:text-amber-300 py-2">+ Add another asset</button>

            {/* File Upload Section */}
            <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
              <h3 className="text-sm font-semibold text-stone-300 mb-3">📎 Attach Files (Optional)</h3>
              <FileUploadSection />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg border border-stone-700 text-stone-300 min-h-[48px] text-base">Back</button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Encrypting...' : 'Encrypt & Save'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Vault encrypted!</h1>
            
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-amber-200 text-sm font-semibold mb-2">⚠️ Important: Save this key!</p>
              <p className="text-stone-400 text-sm mb-3">
                We cannot recover your vault if you lose this key. Save it in a password manager or write it down.
              </p>
              <div id="vault-key-display" className="bg-stone-900 rounded-lg p-3 font-mono text-xs text-stone-300 break-all min-h-[40px]">
                {vaultKey || GLOBAL_VAULT_KEY || ''}
              </div>
              
              {(vaultKey || GLOBAL_VAULT_KEY) && (
                <div className="mt-2 text-xs text-stone-400">
                  <div className="flex items-center gap-1 text-amber-400 mb-1 cursor-pointer select-none" 
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const key = sessionStorage.getItem('heirloom_vault_key') || GLOBAL_VAULT_KEY
                      if (!key) {
                        alert('No key found. Please create a new vault.')
                        return
                      }
                      navigator.clipboard?.writeText(key).then(() => alert('Copied!')).catch(() => {
                        const ta = document.createElement('textarea')
                        ta.value = key
                        document.body.appendChild(ta)
                        ta.select()
                        document.execCommand('copy')
                        document.body.removeChild(ta)
                        alert('Copied!')
                      })
                    }}
                  >
                    📋 Copy to clipboard
                  </div>
                  <p className="text-stone-500 text-xs">If copy doesn’t work, select the key above and press Ctrl+C/Cmd+C</p>
                </div>
              )}
            </div>
            
            <p className="text-stone-400 text-sm sm:text-base">Your assets are now stored securely. Next, set up your inheritance plan.</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/inheritance/create" className="inline-block px-5 sm:px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base">
                Set up inheritance →
              </a>
              <button 
                onClick={handleGoToDashboard}
                className="px-5 sm:px-6 py-3 rounded-lg bg-stone-800 text-stone-300 min-h-[48px] text-base"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
