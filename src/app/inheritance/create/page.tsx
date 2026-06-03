'use client'

import { useState } from 'react'

export default function CreateInheritancePage() {
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [waitDays, setWaitDays] = useState(30)
  const [step, setStep] = useState(1)

  const handleSetup = async () => {
    // TODO: Generate shares, encrypt, save to DB
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold">H</div>
          <span className="text-lg font-semibold text-stone-100">Heirloom</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {step === 1 ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-stone-100">Set up inheritance</h1>
            <p className="text-stone-400">If you don't check in for {waitDays} days, your partner will automatically receive access to your vault.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-stone-300 mb-1">Partner's name</label>
                <input
                  value={beneficiaryName}
                  onChange={e => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Maria Papadopoulou"
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-300 mb-1">Partner's email</label>
                <input
                  type="email"
                  value={beneficiaryEmail}
                  onChange={e => setBeneficiaryEmail(e.target.value)}
                  placeholder="maria@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-300 mb-1">Wait time before access</label>
                <select
                  value={waitDays}
                  onChange={e => setWaitDays(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100"
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

            <button onClick={handleSetup} className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold">
              Activate inheritance plan
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              ✅
            </div>
            <h1 className="text-2xl font-bold text-stone-100">Plan activated!</h1>
            <p className="text-stone-400">
              Your partner will receive an email with instructions if you don't check in for {waitDays} days.
            </p>
            <p className="text-stone-500 text-sm">
              Reminder: Check in weekly to keep your plan active.
            </p>
            <a href="/dashboard" className="inline-block px-6 py-3 rounded-lg bg-stone-800 text-stone-300">
              Go to dashboard
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
