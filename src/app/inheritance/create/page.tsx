'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function CreateInheritancePage() {
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [waitDays, setWaitDays] = useState(30)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vaultId, setVaultId] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Fetch the most recent vault for this user
  useEffect(() => {
    const fetchVault = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('vaults')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setVaultId(data.id)
      }
    }
    fetchVault()
  }, [])

  const handleSetup = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please sign in to create an inheritance plan')
        setLoading(false)
        return
      }

      if (!beneficiaryEmail) {
        setError('Please enter your partner\'s email')
        setLoading(false)
        return
      }

      // Create the inheritance plan
      const { error: dbError } = await supabase
        .from('inheritance_plans')
        .insert({
          user_id: user.id,
          vault_id: vaultId || null,
          beneficiary_email: beneficiaryEmail,
          beneficiary_name: beneficiaryName,
          wait_days: waitDays,
          status: 'active',
          last_check_in: new Date().toISOString()
        })

      if (dbError) {
        throw dbError
      }

      setStep(2)

      // Optionally send welcome email
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome',
            to: beneficiaryEmail,
            data: { name: beneficiaryName || 'Partner' }
          })
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
            <p className="text-stone-400 text-sm">If you don't check in for {waitDays} days, your partner will automatically receive access to your vault.</p>

            <div className="space-y-4">
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

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
              🔐 Using Shamir's Secret Sharing: We hold one part of the key, your partner holds the other. Only together can they unlock your vault.
            </div>

            <button 
              onClick={handleSetup} 
              disabled={loading}
              className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold min-h-[48px] text-base disabled:opacity-50"
            >
              {loading ? 'Activating...' : 'Activate inheritance plan'}
            </button>
            
            {error && (
              <p className="text-rose-500 text-sm text-center">{error}</p>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✅
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-100">Plan activated!</h1>
            <p className="text-stone-400 text-sm sm:text-base">
              Your partner will receive an email with instructions if you don't check in for {waitDays} days.
            </p>
            <p className="text-stone-500 text-sm">
              Reminder: Check in weekly to keep your plan active.
            </p>
            <a href="/dashboard" className="inline-block px-5 sm:px-6 py-3 rounded-lg bg-stone-800 text-stone-300 min-h-[48px] text-base">
              Go to dashboard
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
