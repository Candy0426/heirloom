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

  const handleCheckIn = async (planId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, plan_id: planId })
      })
      
      if (res.ok) {
        alert('✅ Checked in successfully!')
        // Refresh plans
        const { data } = await supabase
          .from('inheritance_plans')
          .select('id, beneficiary_email, beneficiary_name, wait_days, status, last_check_in')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setPlans(data || [])
      } else {
        alert('❌ Check-in failed')
      }
    } catch (e) {
      alert('❌ Check-in failed')
    }
  }

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
          <Link href="/settings" className="text-stone-400 hover:text-amber-400 transition-colors p-1" title="Settings">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
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
                  <button 
                    onClick={() => handleCheckIn(p.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-semibold whitespace-nowrap hover:bg-emerald-500/30"
                  >
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