'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [deleteStep, setDeleteStep] = useState(0)
  const [deleteText, setDeleteText] = useState('')
  const [error, setError] = useState('')
  
  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaQrUri, setMfaQrUri] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaError, setMfaError] = useState('')

  const supabase = useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser(user)
      
      // Check MFA factors
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (factors && factors.totp && factors.totp.length > 0) {
        const factor = factors.totp[0]
        if (factor.status === 'verified') {
          setMfaEnabled(true)
        }
      }
    }
    checkUser()
  }, [supabase])

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      await supabase.auth.signOut()
      setLoading(false)
      window.location.href = '/'

    } catch (err: any) {
      setError(err.message || 'Failed to delete account')
      setLoading(false)
    }
  }

  const handleSetupMFA = async () => {
    // Toggle off if already showing
    if (showMfaSetup) {
      setShowMfaSetup(false)
      return
    }
    
    setMfaLoading(true)
    setMfaError('')
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })
      if (error) {
        // If factor already exists but not verified, show setup panel
        if (error.message?.includes('already exists')) {
          setShowMfaSetup(true)
          setMfaLoading(false)
          return
        }
        throw error
      }
      if (data && data.totp) {
        setMfaSecret(data.totp.secret)
        setMfaQrUri(data.totp.uri)
        setShowMfaSetup(true)
      }
    } catch (err: any) {
      setMfaError(err.message || 'Failed to setup MFA')
    }
    setMfaLoading(false)
  }

  const handleCancelMFA = async () => {
    setMfaLoading(true)
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (factors && factors.totp && factors.totp.length > 0) {
        const unverified = factors.totp.find((f: any) => f.status !== 'verified')
        if (unverified) {
          await supabase.auth.mfa.unenroll({ factorId: unverified.id })
        }
      }
    } catch (err: any) {
      // Ignore errors
    }
    setShowMfaSetup(false)
    setMfaSecret('')
    setMfaQrUri('')
    setMfaCode('')
    setMfaError('')
    setMfaLoading(false)
  }

  const handleVerifyMFA = async () => {
    setMfaLoading(true)
    setMfaError('')
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (!factors || !factors.totp || factors.totp.length === 0) {
        throw new Error('No MFA factors found')
      }
      const totpFactor = factors.totp[0]
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      })
      if (challengeError) throw challengeError
      if (!challengeData) throw new Error('Failed to create challenge')

      // TOTP initial verify during setup - challengeId not needed for first enrollment
      // @ts-ignore - Supabase types require challengeId but TOTP setup verify doesn't need it
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        code: mfaCode
      })
      if (verifyError) throw verifyError

      setMfaEnabled(true)
      setShowMfaSetup(false)
      setMfaSecret('')
      setMfaQrUri('')
      setMfaCode('')
    } catch (err: any) {
      setMfaError(err.message || 'Invalid verification code')
    }
    setMfaLoading(false)
  }

  const handleDisableMFA = async () => {
    setMfaLoading(true)
    setMfaError('')
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      if (!factors || !factors.totp || factors.totp.length === 0) {
        throw new Error('No MFA factors found')
      }
      const factorIdToRemove = factors.totp[0].id
      
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factorIdToRemove })
      if (error) throw error

      setMfaEnabled(false)
    } catch (err: any) {
      setMfaError(err.message || 'Failed to disable MFA')
    }
    setMfaLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="px-4 sm:px-6 py-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-semibold text-stone-100">Heirloom</span>
        </div>
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-200 transition-colors">
          ← Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-100 mb-8">Settings</h1>

        {/* Account Info */}
        <section className="space-y-6 mb-12">
          <h2 className="text-lg font-semibold text-stone-200">Account Information</h2>
          <div className="bg-stone-900 rounded-lg border border-stone-800 p-4 sm:p-6 space-y-4">
            <div>
              <label className="text-sm text-stone-500 block mb-1">Email</label>
              <p className="text-stone-200">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-stone-500 block mb-1">User ID</label>
              <p className="text-stone-400 text-xs font-mono">{user.id}</p>
            </div>
          </div>
        </section>

        {/* Security / MFA */}
        <section className="space-y-6 mb-12">
          <h2 className="text-lg font-semibold text-stone-200">Security</h2>
          <div className="bg-stone-900 rounded-lg border border-stone-800 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-200 font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-stone-500 text-sm mt-1">
                  {mfaEnabled 
                    ? '✅ Your account is protected with an authenticator app (Authy, Google Authenticator, etc.)'
                    : '🔓 Add an extra layer of security to your account'}
                </p>
              </div>
              <button
                onClick={mfaEnabled ? handleDisableMFA : handleSetupMFA}
                disabled={mfaLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ml-4 ${
                  mfaEnabled 
                    ? 'border border-rose-500 text-rose-400 hover:bg-rose-950/30' 
                    : showMfaSetup
                      ? 'border border-stone-500 text-stone-400 hover:bg-stone-800'
                      : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                } disabled:opacity-50`}
              >
                {mfaLoading 
                  ? '...' 
                  : mfaEnabled 
                    ? 'Disable 2FA' 
                    : showMfaSetup
                      ? 'Hide Setup'
                      : 'Enable 2FA'
                }
              </button>
            </div>
            
            {mfaError && (
              <p className="text-rose-400 text-sm">{mfaError}</p>
            )}
            
            {showMfaSetup && !mfaEnabled && (
              <div className="mt-6 space-y-4 border-t border-stone-800 pt-6">
                <p className="text-stone-300 text-sm font-medium">Step 1: Scan QR Code</p>
                <p className="text-stone-500 text-sm">Open Authy, Google Authenticator, or any TOTP app and scan this code:</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaQrUri)}`}
                    alt="MFA QR Code"
                    className="w-48 h-48"
                  />
                </div>
                
                <p className="text-stone-500 text-sm">Or enter this secret manually:</p>
                <code className="bg-stone-800 px-3 py-2 rounded text-sm font-mono text-stone-300 select-all block w-fit">
                  {mfaSecret}
                </code>
                
                <div className="mt-6">
                  <p className="text-stone-300 text-sm font-medium">Step 2: Verify Code</p>
                  <div className="flex gap-3 mt-2">
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="flex-1 px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-base focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <button
                      onClick={handleVerifyMFA}
                      disabled={mfaLoading || mfaCode.length !== 6}
                      className="px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
                    >
                      {mfaLoading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCancelMFA}
                    disabled={mfaLoading}
                    className="flex-1 py-2 rounded-lg border border-stone-600 text-stone-400 hover:bg-stone-800 text-sm transition-colors disabled:opacity-50"
                  >
                    {mfaLoading ? '...' : 'Cancel Setup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Legal */}
        <section className="space-y-6 mb-12">
          <h2 className="text-lg font-semibold text-stone-200">Legal</h2>
          <div className="bg-stone-900 rounded-lg border border-stone-800 p-4 sm:p-6 space-y-3">
            <Link href="/legal/privacy" className="flex items-center justify-between text-stone-300 hover:text-amber-400 transition-colors py-2">
              <span>Privacy Policy</span>
              <span className="text-stone-500">→</span>
            </Link>
            <div className="border-t border-stone-800" />
            <Link href="/legal/terms" className="flex items-center justify-between text-stone-300 hover:text-amber-400 transition-colors py-2">
              <span>Terms of Service</span>
              <span className="text-stone-500">→</span>
            </Link>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-rose-400">Danger Zone</h2>
          <div className="bg-rose-950/20 rounded-lg border border-rose-500/30 p-4 sm:p-6 space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 text-lg shrink-0">⚠️</span>
                <div>
                  <p className="text-amber-200 text-sm font-medium mb-1">Important — shares already sent cannot be recalled</p>
                  <p className="text-stone-400 text-sm">
                    If you have already sent inheritance key shares via email to your beneficiaries, 
                    those emails <strong className="text-stone-300">cannot be revoked or deleted</strong> from their inboxes. 
                    Even after your account is deleted, any shares they have already received will remain with them.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-stone-400 text-sm">
              Deleting your account will permanently remove:
            </p>
            <ul className="text-stone-400 text-sm list-disc list-inside space-y-1">
              <li>All your vaults and encrypted data</li>
              <li>All inheritance plans</li>
              <li>Your account and authentication</li>
            </ul>
            <p className="text-rose-400 text-sm font-medium">
              ⚠️ This action cannot be undone!
            </p>

            {deleteStep === 0 ? (
              <button
                onClick={() => setDeleteStep(1)}
                className="w-full py-3 rounded-lg border border-rose-500 text-rose-400 hover:bg-rose-950/50 font-medium transition-colors"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-stone-300 text-sm font-medium">
                  Type <code className="bg-stone-800 px-1.5 py-0.5 rounded text-rose-400 font-mono">DELETE</code> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-base focus:outline-none focus:border-rose-500 transition-colors"
                />
                {error && (
                  <p className="text-rose-400 text-sm">{error}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteStep(0)
                      setDeleteText('')
                      setError('')
                    }}
                    className="flex-1 py-3 rounded-lg border border-stone-700 text-stone-400 hover:bg-stone-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteText !== 'DELETE'}
                    className="flex-1 py-3 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Deleting...' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}