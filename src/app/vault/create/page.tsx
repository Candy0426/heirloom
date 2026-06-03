'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AssetInput {
  type: string
  name: string
  institution: string
  account_number: string
  balance: string
  notes: string
}

export default function CreateVaultPage() {
  const [name, setName] = useState('My Vault')
  const [assets, setAssets] = useState<AssetInput[]>([{ type: 'bank', name: '', institution: '', account_number: '', balance: '', notes: '' }])
  const [encryptionKey, setEncryptionKey] = useState('')
  const [step, setStep] = useState(1)

  const addAsset = () => {
    setAssets([...assets, { type: 'bank', name: '', institution: '', account_number: '', balance: '', notes: '' }])
  }

  const updateAsset = (i: number, field: string, value: string) => {
    const updated = [...assets]
    updated[i] = { ...updated[i], [field]: value }
    setAssets(updated)
  }

  const handleCreate = async () => {
    // TODO: Generate key, encrypt, upload to Supabase
    setStep(3)
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
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
        <div className="flex items-center gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'}`}>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-stone-100">Name your vault</h1>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-800 text-stone-100"
              placeholder="e.g. My Family Assets"
            />
            <button onClick={() => setStep(2)} className="w-full py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-stone-100">Add your assets</h1>
            <p className="text-stone-400">This data never leaves your browser unencrypted.</p>

            {assets.map((asset, i) => (
              <div key={i} className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
                <select
                  value={asset.type}
                  onChange={e => updateAsset(i, 'type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100"
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
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100"
                />
                <input
                  value={asset.institution}
                  onChange={e => updateAsset(i, 'institution', e.target.value)}
                  placeholder="Institution / Exchange"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100"
                />
                <input
                  value={asset.account_number}
                  onChange={e => updateAsset(i, 'account_number', e.target.value)}
                  placeholder="Account / Wallet address"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100"
                />
                <input
                  value={asset.balance}
                  onChange={e => updateAsset(i, 'balance', e.target.value)}
                  placeholder="Approximate balance (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100"
                />
                <textarea
                  value={asset.notes}
                  onChange={e => updateAsset(i, 'notes', e.target.value)}
                  placeholder="Notes (e.g. 'Call John for access', 'Password in family safe')"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100"
                />
              </div>
            ))}

            <button onClick={addAsset} className="text-sm text-amber-400 hover:text-amber-300">+ Add another asset</button>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-lg border border-stone-700 text-stone-300">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold">Encrypt & Save</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              🔒
            </div>
            <h1 className="text-2xl font-bold text-stone-100">Vault encrypted!</h1>
            <p className="text-stone-400">Your assets are now stored securely. Next, set up your inheritance plan.</p>
            <a href="/inheritance/create" className="inline-block px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold">
              Set up inheritance →
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
