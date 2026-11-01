'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { decryptVault, combineVaultKey } from '@/utils/vaultKeys'

interface Vault {
  id: string
  name: string
  encrypted_data: unknown
  created_at: string
}

export default function AccessPage() {
  const params = useParams()
  const planId = params?.plan_id as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notYetGranted, setNotYetGranted] = useState(false)
  
  const [vault, setVault] = useState<Vault | null>(null)
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [serverShare, setServerShare] = useState<string | null>(null)
  
  const [decryptKey, setDecryptKey] = useState('')
  const [decrypting, setDecrypting] = useState(false)
  const [decryptedData, setDecryptedData] = useState<any>(null)
  const [decryptError, setDecryptError] = useState('')

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        setError('Invalid access link')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/access/${planId}`)
        const data = await res.json()

        if (!res.ok) {
          if (res.status === 403) {
            setNotYetGranted(true)
            setLoading(false)
            return
          }
          throw new Error(data.error || 'Failed to load plan')
        }

        setVault(data.vault)
        setBeneficiaryName(data.beneficiary.name)
        setOwnerName(data.owner_email || 'your loved one')
        setServerShare(data.server_share)
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load')
        setLoading(false)
      }
    }

    fetchPlan()
  }, [planId])

  const handleDecrypt = async () => {
    if (!decryptKey.trim() || !vault) return
    
    setDecrypting(true)
    setDecryptError('')
    
    try {
      // New plans: combine our released share with the beneficiary's key card.
      // Legacy plans (no server share): the beneficiary has the full vault key.
      const key = serverShare ? combineVaultKey(serverShare, decryptKey) : decryptKey.trim()
      const decrypted = await decryptVault(vault.encrypted_data, key)
      setDecryptedData(decrypted)
    } catch (err: any) {
      setDecryptError(err.message || 'Decryption failed')
    } finally {
      setDecrypting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-400">Loading vault access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="text-4xl">❌</div>
          <p className="text-stone-300 text-lg">{error}</p>
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Heirloom
          </Link>
        </div>
      </div>
    )
  }

  if (notYetGranted) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-stone-100">Access Not Yet Granted</h1>
          <p className="text-stone-400">
            This inheritance plan has not been triggered yet. 
            Access will only be granted after the waiting period expires 
            without a check-in.
          </p>
          <div className="bg-stone-900 rounded-lg p-4 border border-stone-800">
            <p className="text-stone-500 text-sm">
              If you believe this is an error, please contact the person 
              who shared this link with you.
            </p>
          </div>
          <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm">
            ← Back to Heirloom
          </Link>
        </div>
      </div>
    )
  }

  if (decryptedData) {
    return (
      <div className="min-h-screen bg-stone-950">
        <nav className="px-4 sm:px-6 py-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-semibold text-stone-100">Heirloom</span>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
              🔓
            </div>
            <h1 className="text-2xl font-bold text-stone-100 mb-2">{vault?.name}</h1>
            <p className="text-stone-400">Decrypted successfully. This data never left your browser.</p>
          </div>

          {decryptedData.assets?.map((asset: any, i: number) => (
            <div key={i} className="bg-stone-900 rounded-xl p-4 border border-stone-800 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">
                  {asset.type === 'bank' && '🏦'}
                  {asset.type === 'crypto' && '₿'}
                  {asset.type === 'investment' && '📈'}
                  {asset.type === 'insurance' && '🛡️'}
                  {asset.type === 'real_estate' && '🏠'}
                  {asset.type === 'other' && '📋'}
                </span>
                <div>
                  <h3 className="text-stone-100 font-semibold">{asset.name || 'Unnamed Asset'}</h3>
                  <p className="text-stone-500 text-sm">{asset.institution}</p>
                </div>
              </div>

              <div className="space-y-2">
                {asset.account_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Account #</span>
                    <span className="text-stone-200 font-mono">{asset.account_number}</span>
                  </div>
                )}
                {asset.balance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Balance</span>
                    <span className="text-stone-200">{asset.balance}</span>
                  </div>
                )}
                {asset.notes && (
                  <div className="mt-3 p-3 bg-stone-800 rounded-lg">
                    <p className="text-stone-500 text-xs mb-1">Notes</p>
                    <p className="text-stone-300 text-sm whitespace-pre-wrap">{asset.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400 text-sm text-center">
              ✅ All data was decrypted locally in your browser. 
              No plaintext was transmitted over the network.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="px-4 sm:px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-semibold text-stone-100">Heirloom</span>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-stone-100">Vault Access Granted</h1>
          <p className="text-stone-400">
            {beneficiaryName ? `${beneficiaryName}, you` : 'You'} have been granted access to {ownerName}'s vault.{' '}
            {serverShare
              ? 'Enter the code from the Heirloom key card they gave you.'
              : 'Enter the vault key they shared with you to view the contents.'}
          </p>
        </div>

        <div className="bg-stone-900 rounded-xl p-6 border border-stone-800 space-y-4">
          <div>
            <label className="block text-sm text-stone-300 mb-2">{serverShare ? 'Key card code' : 'Vault key'}</label>
            <textarea
              value={decryptKey}
              onChange={(e) => setDecryptKey(e.target.value)}
              placeholder={serverShare ? 'XXXX-XXXX-XXXX-…' : 'Paste the vault key here...'}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm font-mono min-h-[80px]"
            />
          </div>

          {decryptError && (
            <div className="bg-rose-500/20 border border-rose-500/40 rounded-lg p-3 text-rose-200 text-sm">
              ⚠️ {decryptError}
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <p className="text-amber-200 text-sm">
              ℹ️ The decryption happens entirely in your browser. 
              Your key is never sent to our servers.
            </p>
          </div>

          <button
            onClick={handleDecrypt}
            disabled={!decryptKey.trim() || decrypting}
            className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {decrypting ? 'Decrypting...' : '🔓 Decrypt Vault'}
          </button>
        </div>
      </main>
    </div>
  )
}
