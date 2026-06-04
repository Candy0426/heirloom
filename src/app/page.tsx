'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, Key, ChevronRight, Lock, Fingerprint, Timer, Mail, ArrowRight } from 'lucide-react'
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
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 text-center mb-8 sm:mb-12">Simple pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-lg mx-auto">
            <div className="bg-stone-900 rounded-xl p-5 sm:p-6 border border-stone-800">
              <h3 className="text-xl font-bold text-stone-100 mb-2">Free</h3>
              <p className="text-3xl font-bold text-amber-500 mb-4">€0</p>
              <ul className="text-stone-400 space-y-2 text-sm">
                <li>✓ 1 vault</li>
                <li>✓ Up to 10 assets</li>
                <li>✓ 1 beneficiary</li>
                <li>✓ 90-day wait time</li>
              </ul>
            </div>
            <div className="bg-stone-900 rounded-xl p-5 sm:p-6 border border-amber-500/50">
              <div className="text-xs font-semibold text-amber-400 uppercase mb-2">Recommended</div>
              <h3 className="text-xl font-bold text-stone-100 mb-2">Premium</h3>
              <p className="text-3xl font-bold text-amber-500 mb-4">€3.99/mo</p>
              <ul className="text-stone-400 space-y-2 text-sm">
                <li>✓ Unlimited assets</li>
                <li>✓ File uploads (documents, IDs)</li>
                <li>✓ 2 beneficiaries</li>
                <li>✓ 30 or 60-day wait</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
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
