'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { authFetch } from '@/lib/authFetch'
import { decryptVault, splitVaultKey } from '@/utils/vaultKeys'

interface VaultOption {
  id: string
  name: string
}

export default function CreateInheritancePage() {
  const [vaults, setVaults] = useState<VaultOption[]>([])
  const [vaultId, setVaultId] = useState('')
  const [vaultKey, setVaultKey] = useState('')
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [waitDays, setWaitDays] = useState(30)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyCard, setKeyCard] = useState('')
  const [handedOver, setHandedOver] = useState(false)

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }, [])

  // Load the user's vaults; preselect the newest one
  useEffect(() => {
    const fetchVaults = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('vaults')
        .select('id, name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setVaults(data as VaultOption[])
        setVaultId((data[0] as VaultOption).id)
      }
    }
    fetchVaults()

    // Key from a vault created in this browser session, if any
    const savedKey = sessionStorage.getItem('heirloom_vault_key')
    if (savedKey) setVaultKey(savedKey)
  }, [supabase])

  const handleSetup = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please sign in to create an inheritance plan')
        return
      }
      if (!vaultId) {
        setError('Create a vault first')
        return
      }
      if (!beneficiaryEmail) {
        setError('Please enter your partner\'s email')
        return
      }

      // Make sure the key really opens this vault before splitting it
      const { data: vault } = await supabase
        .from('vaults')
        .select('encrypted_data')
        .eq('id', vaultId)
        .single()
      if (!vault) throw new Error('Vault not found')
      await decryptVault(vault.encrypted_data, vaultKey.trim())

      // Split the key: one share goes to the server, the other becomes the beneficiary's key card
      const { serverShare, beneficiaryShare } = splitVaultKey(vaultKey)

      const res = await authFetch(supabase, '/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_id: vaultId,
          beneficiary_email: beneficiaryEmail,
          beneficiary_name: beneficiaryName,
          wait_days: waitDays,
          server_share: serverShare,
        })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to create plan')

      setKeyCard(beneficiaryShare)
      setStep(2)

      // Let the beneficiary know they've been named
      try {
        await authFetch(supabase, '/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'beneficiary-welcome', planId: result.id })
        })
      } catch (e) {
        console.log('Email send failed (expected in dev):', e)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to create plan')
    } finally {
      setLoading(false)
    }
  }

  const copyKeyCard = () => {
    navigator.clipboard?.writeText(keyCard).then(() => alert('Copied!')).catch(() => {
      alert('Copy failed. Please select the code and copy it manually.')
    })
  }

  const printKeyCard = () => {
    const w = window.open('', '_blank', 'width=600,height=500')
    if (!w) return
    const card = keyCard.replace(/[^0-9A-F-]/g, '')
    w.document.write(`<!doctype html><html><head><title>Heirloom key card</title></head>
      <body style="font-family:Arial,sans-serif;padding:32px">
        <div style="border:2px solid #d97706;border-radius:12px;padding:24px;max-width:480px">
          <h2 style="margin:0 0 8px;color:#b45309">Heirloom key card</h2>
          <p style="margin:0 0 16px;color:#444">Keep this safe. You will need it to open the vault if you ever receive an access email from Heirloom.</p>
          <p style="font-family:monospace;font-size:18px;letter-spacing:1px;line-height:1.6;word-break:break-all">${card}</p>
          <p style="margin:16px 0 0;font-size:12px;color:#666">www.ourheirloom.app</p>
        </div>
        <script>window.print()</script>
      </body></html>`)
    w.document.close()
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
        {step === 1 ? (
          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Set up inheritance</h1>
            <p className="text-stone-400 text-sm">If you don't check in for {waitDays} days, your partner will automatically receive access to your vault. We'll email you reminders before that happens.</p>

            {vaults.length === 0 ? (
              <div className="bg-stone-900 rounded-xl p-5 border border-stone-800">
                <p className="text-stone-400 mb-4">You need a vault before you can set up inheritance.</p>
                <a href="/vault/create" className="text-amber-400 hover:text-amber-300 font-semibold text-sm">Create a vault →</a>
              </div>
            ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone-300 mb-1">Vault</label>
                <select
                  value={vaultId}
                  onChange={e => setVaultId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-base min-h-[48px]"
                >
                  {vaults.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone-300 mb-1">Vault key</label>
                <input
                  value={vaultKey}
                  onChange={e => setVaultKey(e.target.value)}
                  placeholder="The key you saved when you created the vault"
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-sm font-mono min-h-[48px]"
                />
                <p className="text-xs text-stone-500 mt-1">Used only in your browser to create the key card. It is never sent to us.</p>
              </div>

              <div>
                <label className="block text-sm text-stone-300 mb-1">Partner's name</label>
                <input
                  value={beneficiaryName}
                  onChange={e => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Maria Papadopoulou"
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-300 mb-1">Partner's email</label>
                <input
                  type="email"
                  value={beneficiaryEmail}
                  onChange={e => setBeneficiaryEmail(e.target.value)}
                  placeholder="maria@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-base min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-300 mb-1">Wait time before access</label>
                <select
                  value={waitDays}
                  onChange={e => setWaitDays(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 text-base min-h-[48px]"
                >
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
            </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
              🔐 Your vault key is split in two. We keep one half and release it only if the plan is triggered. Your partner keeps the other half on a key card that you give them. Neither half can open the vault on its own.
            </div>

            <button
              onClick={handleSetup}
              disabled={loading || vaults.length === 0 || !vaultKey.trim()}
              className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base disabled:opacity-50"
            >
              {loading ? 'Activating...' : 'Activate inheritance plan'}
            </button>

            {error && (
              <p className="text-rose-500 text-sm text-center">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                ✅
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Plan activated!</h1>
              <p className="text-stone-400 text-sm sm:text-base">
                One last step: give this key card to {beneficiaryName || beneficiaryEmail}.
              </p>
            </div>

            <div className="bg-stone-900 rounded-xl p-5 border-2 border-amber-500/50 space-y-3">
              <p className="text-amber-300 text-sm font-semibold">Key card for {beneficiaryName || beneficiaryEmail}</p>
              <p className="font-mono text-base sm:text-lg text-stone-100 tracking-wide break-all leading-relaxed">{keyCard}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={printKeyCard} className="flex-1 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base">🖨️ Print key card</button>
                <button onClick={copyKeyCard} className="flex-1 py-3 rounded-lg bg-stone-800 text-stone-300 min-h-[48px] text-base">📋 Copy code</button>
              </div>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 text-sm text-rose-200 space-y-2">
              <p><strong>We don't keep a copy of this card.</strong> Without it your partner cannot open the vault.</p>
              <p>Hand it over in person, or put the printout somewhere they will find it (e.g. with your important papers). If it gets lost, delete this plan and create a new one.</p>
            </div>

            <label className="flex items-start gap-3 text-sm text-stone-300 cursor-pointer">
              <input type="checkbox" checked={handedOver} onChange={e => setHandedOver(e.target.checked)} className="mt-1 w-4 h-4" />
              <span>I have printed or saved the key card and will give it to {beneficiaryName || beneficiaryEmail}.</span>
            </label>

            <a
              href={handedOver ? '/dashboard' : undefined}
              aria-disabled={!handedOver}
              className={`block text-center px-5 sm:px-6 py-3 rounded-lg min-h-[48px] text-base ${handedOver ? 'bg-stone-800 text-stone-200' : 'bg-stone-900 text-stone-600 cursor-not-allowed'}`}
            >
              Go to dashboard
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
