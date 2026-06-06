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

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Navbar */}
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