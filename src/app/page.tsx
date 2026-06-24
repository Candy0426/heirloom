'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, Key, ChevronRight, Lock, Fingerprint, Timer, Mail, ArrowRight, Check, X, Zap, Crown, Building2 } from 'lucide-react'
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, HoverCard, AnimatedGradient, FloatingParticles } from '@/components/animations'

function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="p-2 text-stone-400 hover:text-stone-100">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute top-16 right-4 bg-stone-900 border border-stone-700 rounded-lg p-4 space-y-3 min-w-[160px] shadow-xl z-50">
          <a href="#how" onClick={() => setOpen(false)} className="block text-sm text-stone-400 hover:text-stone-200">How it works</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="block text-sm text-stone-400 hover:text-stone-200">Pricing</a>
          <a href="/auth/login" onClick={() => setOpen(false)} className="block text-sm px-4 py-2 rounded-lg bg-stone-800 text-stone-100 hover:bg-stone-700 text-center">Sign in</a>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [annual, setAnnual] = useState(false)

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thanks for joining the waitlist! Email: ' + email)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Mobile-First Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Heirloom" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-semibold text-stone-100">Heirloom</span>
        </div>
        {/* Mobile: hamburger menu */}
        <div className="sm:hidden">
          <MobileNav />
        </div>
        {/* Desktop: full nav */}
        <div className="hidden sm:flex items-center gap-4">
          <a href="#how" className="text-sm text-stone-400 hover:text-stone-200">How it works</a>
          <a href="#pricing" className="text-sm text-stone-400 hover:text-stone-200">Pricing</a>
          <a href="/auth/login" className="text-sm px-4 py-2 rounded-lg bg-stone-800 text-stone-100 hover:bg-stone-700">Sign in</a>
        </div>
      </nav>

      <div className="relative">
        <AnimatedGradient />
        <FloatingParticles />
        
        <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-8"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 relative">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src="/logo.svg" alt="Heirloom" className="w-full h-full rounded-2xl shadow-2xl shadow-amber-500/20" />
                </motion.div>
                <motion.div
                  className="absolute -inset-2 rounded-2xl bg-amber-500/20 blur-xl"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/80 border border-stone-700/50 text-sm text-stone-400 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Launching 2026
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-100 mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              What if something happens{' '}
              <span className="text-amber-500">to you?</span>
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-stone-400 max-w-2xl mx-auto mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Heirloom is a zero-knowledge vault that protects your family's future. 
              If something happens, your partner gets access — automatically, securely.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <motion.a 
                href="/auth/signup" 
                className="group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 text-center text-lg shadow-lg shadow-amber-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get started — Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a 
                href="#how" 
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn more
                <ChevronRight className="w-5 h-5" />
              </motion.a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-stone-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> AES-256</span>
              <span className="flex items-center gap-1.5"><Fingerprint className="w-4 h-4" /> Zero-knowledge</span>
              <span className="flex items-center gap-1.5"><Timer className="w-4 h-4" /> Time-locked</span>
            </motion.div>
          </div>

        {/* How it works */}
        <section id="how" className="py-12 sm:py-16 border-t border-stone-800">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 text-center mb-8 sm:mb-12">How it works</h2>
          </FadeIn>
          <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                icon: Shield, 
                step: '1', 
                title: 'Create your vault', 
                desc: 'Add your bank accounts, crypto wallets, insurance policies, and any documents. Everything is encrypted in your browser.' 
              },
              { 
                icon: Key, 
                step: '2', 
                title: 'Set up your plan', 
                desc: 'Choose your partner and how long to wait before they get access. We use time-locked cryptography.' 
              },
              { 
                icon: Clock, 
                step: '3', 
                title: 'Check in weekly', 
                desc: "A simple click every week confirms you're OK. If you don't check in, your partner gets the key automatically." 
              },
            ].map(s => (
              <StaggerItem key={s.step}>
                <HoverCard>
                  <div className="bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-800 hover:border-amber-500/30 transition-colors h-full">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-amber-500 mb-2">STEP {s.step}</div>
                    <h3 className="text-lg font-semibold text-stone-100 mb-2">{s.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Security */}
        <section className="py-12 sm:py-16 border-t border-stone-800">
          <div className="bg-stone-900 rounded-xl p-6 sm:p-8 border border-stone-800 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mb-4">Zero-knowledge architecture</h2>
            <p className="text-stone-400 max-w-xl mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
              We literally cannot read your data. Everything is encrypted in your browser 
              with AES-256-GCM before it reaches our servers. Not even a court order can reveal your secrets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center text-sm text-stone-500">
              <span>🔒 AES-256 encryption</span>
              <span>🔑 Shamir's Secret Sharing</span>
              <span>⏰ Time-locked release</span>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-12 sm:py-16 border-t border-stone-800">
          <FadeIn>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-3">Simple, transparent pricing</h2>
              <p className="text-stone-400 max-w-lg mx-auto">Start free. Upgrade when you're ready. No hidden fees.</p>
            </div>
          </FadeIn>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
            <span className="text-sm text-stone-400">Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-amber-500' : 'bg-stone-700'}`}
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-stone-950"
                animate={{ x: annual ? 26 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className="text-sm text-stone-400">Annual</span>
            {annual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full"
              >
                Save 25%
              </motion.span>
            )}
          </div>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <StaggerItem>
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 hover:border-stone-600 transition-colors h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-100">Free</h3>
                    <p className="text-xs text-stone-500">Get started</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-stone-100">€0</span>
                  <span className="text-stone-500 text-sm">/forever</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    '1 secure vault',
                    'Up to 10 assets',
                    '1 beneficiary',
                    '90-day wait time',
                    'AES-256 encryption',
                    'Email reminders',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-400">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {[
                    'File uploads',
                    'Priority support',
                    'Custom branding',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                      <X className="w-4 h-4 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/auth/signup"
                  className="block text-center px-6 py-3 rounded-xl border border-stone-700 text-stone-300 font-semibold hover:bg-stone-800 transition-colors"
                >
                  Start for free
                </a>
              </div>
            </StaggerItem>

            {/* Premium Plan */}
            <StaggerItem>
              <div className="bg-stone-900 rounded-2xl p-6 border-2 border-amber-500/50 relative h-full flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-stone-950 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
                <div className="flex items-center gap-2 mb-4 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-100">Premium</h3>
                    <p className="text-xs text-stone-500">For families</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-stone-100">
                    €{annual ? '2.99' : '3.99'}
                  </span>
                  <span className="text-stone-500 text-sm">/month</span>
                  {annual && (
                    <p className="text-xs text-stone-500 mt-1">billed as €35.88/year</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Unlimited vaults',
                    'Unlimited assets',
                    'File uploads (PDF, images)',
                    '2 beneficiaries',
                    '30 or 60-day wait time',
                    'Priority email support',
                    'Inheritance planning guide',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-300">
                      <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/auth/signup"
                  className="block text-center px-6 py-3 rounded-xl bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Get Premium
                </a>
              </div>
            </StaggerItem>

            {/* Family Plan */}
            <StaggerItem>
              <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 hover:border-stone-600 transition-colors h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-100">Family</h3>
                    <p className="text-xs text-stone-500">Up to 5 members</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-stone-100">
                    €{annual ? '7.99' : '9.99'}
                  </span>
                  <span className="text-stone-500 text-sm">/month</span>
                  {annual && (
                    <p className="text-xs text-stone-500 mt-1">billed as €95.88/year</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Everything in Premium',
                    '5 family members',
                    'Shared family vaults',
                    'Emergency access for all',
                    'Dedicated support',
                    'Custom wait periods',
                    'Account activity log',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-400">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/auth/signup"
                  className="block text-center px-6 py-3 rounded-xl border border-stone-700 text-stone-300 font-semibold hover:bg-stone-800 transition-colors"
                >
                  Get Family
                </a>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Trust note */}
          <div className="text-center mt-8 sm:mt-10">
            <p className="text-sm text-stone-500">
              🔒 All plans include zero-knowledge encryption. We cannot read your data.{' '}
              <a href="/legal/privacy" className="text-amber-500 hover:underline">Learn more</a>
            </p>
          </div>
        </section>

        {/* Waitlist */}
        <section className="py-12 sm:py-16 border-t border-stone-800">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mb-4">Join the waitlist</h2>
            <p className="text-stone-400 mb-6">We're launching soon. Be the first to know.</p>
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto px-4 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 min-w-0"
              />
              <button type="submit" className="px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400">
                Join
              </button>
            </form>
          </div>
        </section>
      </main>
      </div> {/** closes the relative wrapper for hero background */}

      <footer className="border-t border-stone-800 py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-stone-500">
              © 2026 Heirloom. Built with 🔒 in Europe.
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-center">
              <a href="/legal/privacy" className="text-stone-400 hover:text-stone-200">Privacy Policy</a>
              <a href="/legal/terms" className="text-stone-400 hover:text-stone-200">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
