'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

interface VaultSummary {
  id: string
  name: string
  created_at: string
}

interface PlanSummary {
  id: string
  beneficiary_email: string
  wait_days: number
  status: string
  last_check_in?: string
}

export default function DashboardPage() {
  const [vaults, setVaults] = useState<VaultSummary[]>([])
  const [plans, setPlans] = useState<PlanSummary[]>([])
  const [user, setUser] = useState<any>(null)

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

  // Fetch vaults
  useEffect(() => {
    const fetchVaults = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('vaults')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vaults:', error)
        return
      }

      setVaults(data || [])
    }

    fetchVaults()
  }, [supabase])

  // Fetch inheritance plans
  useEffect(() => {
    const fetchPlans = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('inheritance_plans')
        .select('id, beneficiary_email, beneficiary_name, wait_days, status, last_check_in')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching plans:', error)
        return
      }

      setPlans(data || [])
    }

    fetchPlans()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
          <span className="text-lg font-semibold text-stone-100">Heirloom</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-stone-400 truncate max-w-[120px] sm:max-w-[200px]">{user?.email}</span>
          <button onClick={handleLogout} className="text-xs sm:text-sm text-stone-400 hover:text-stone-200 px-2 py-1 rounded hover:bg-stone-800">Log out</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-6 sm:mb-8">Your vaults</h1>

        {vaults.length === 0 ? (
          <div className="bg-stone-900 rounded-xl p-6 sm:p-8 border border-stone-800 text-center">
            <p className="text-stone-400 mb-4">You haven't created a vault yet.</p>
            <Link href="/vault/create" className="inline-block px-5 sm:px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 text-sm sm:text-base">
              Create your first vault
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {vaults.map(v => (
              <div key={v.id} className="bg-stone-900 rounded-xl p-4 sm:p-6 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-stone-100 truncate">{v.name}</h3>
                  <p className="text-sm text-stone-500">Created {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <Link href={`/vault/${v.id}`} className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 text-sm whitespace-nowrap">Open</Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mb-4">Inheritance plans</h2>
          {plans.length === 0 ? (
            <div className="bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-800">
              <p className="text-stone-400 mb-4">Protect your vault with a time-locked inheritance plan.</p>
              <Link href="/inheritance/create" className="text-amber-400 hover:text-amber-300 font-semibold text-sm">Set up plan →</Link>
            </div>
          ) : (
            plans.map(p => (
              <div key={p.id} className="bg-stone-900 rounded-xl p-4 sm:p-6 border border-stone-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-100 text-sm">Beneficiary: {p.beneficiary_email}</p>
                    <p className="text-sm text-stone-500">Wait: {p.wait_days} days · Status: <span className="text-emerald-500">{p.status}</span></p>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-semibold whitespace-nowrap">
                    Check in now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}