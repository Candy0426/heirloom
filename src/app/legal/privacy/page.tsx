export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <nav className="px-4 sm:px-6 py-4 border-b border-stone-800">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold">H</div>
            <span className="text-lg font-semibold text-stone-100">Heirloom</span>
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-6">Privacy Policy</h1>
        <p className="text-stone-500 text-sm mb-8">Last updated: June 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">1. Introduction</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Heirloom ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect, use, 
              store, and protect your information when you use our digital inheritance vault service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">2. Zero-Knowledge Architecture</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">
              Heirloom operates on a <strong className="text-stone-300">zero-knowledge</strong> basis:
            </p>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Your vault data is encrypted in your browser using AES-256-GCM before being stored.</li>
              <li>We <strong className="text-stone-300">cannot decrypt or access your vault contents</strong> under any circumstances.</li>
              <li>We do not store your encryption keys or passwords.</li>
              <li>Only encrypted ciphertext is stored on our servers and IPFS.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">3. Information We Collect</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">
              We collect only the minimum necessary information:
            </p>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Account information: email address (for authentication only).</li>
              <li>Encrypted vault data: ciphertext that we cannot decrypt.</li>
              <li>Inheritance plan metadata: beneficiary email, wait time, and status (not vault contents).</li>
              <li>Usage data: check-in timestamps and plan status changes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">4. How We Use Your Information</h2>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>To provide the inheritance vault service.</li>
              <li>To send check-in reminders and inheritance trigger notifications.</li>
              <li>To maintain account security and prevent fraud.</li>
              <li>We <strong className="text-stone-300">never</strong> sell or share your data with third parties for marketing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">5. Data Storage & Security</h2>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Encrypted data is stored on Supabase and IPFS (distributed storage).</li>
              <li>All data transfers use TLS/SSL encryption.</li>
              <li>Access is controlled via Row Level Security (RLS) policies.</li>
              <li>Regular security audits and backups are performed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">6. Your Rights (GDPR)</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">
              Under GDPR, you have the right to:
            </p>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Access your personal data.</li>
              <li>Delete your account and associated data.</li>
              <li>Export your vault data ( decryption key required ).</li>
              <li>Rectify inaccurate information.</li>
              <li>Object to processing (contact us).</li>
            </ul>
            <p className="text-stone-400 text-sm mt-3">
              To exercise these rights, email us at: <a href="mailto:privacy@ourheirloom.app" className="text-amber-400 hover:text-amber-300">privacy@ourheirloom.app</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">7. Data Retention</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              We retain your data only as long as your account is active. Upon deleting your account, all 
              encrypted vault data and metadata are permanently removed from our servers within 30 days. 
              Note: encrypted data on IPFS may persist on the distributed network but is inaccessible without your keys.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">8. Changes to This Policy</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              We may update this policy. Significant changes will be communicated via email. 
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">9. Contact</h2>
            <p className="text-stone-400 text-sm">
              Questions? Contact us at:{' '}
              <a href="mailto:privacy@ourheirloom.app" className="text-amber-400 hover:text-amber-300">privacy@ourheirloom.app</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800">
          <a href="/" className="text-amber-400 hover:text-amber-300 text-sm">← Back to Heirloom</a>
        </div>
      </main>

      <footer className="border-t border-stone-800 py-6 text-center text-sm text-stone-500 px-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
          <a href="/legal/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</a>
          <span className="hidden sm:inline text-stone-700">·</span>
          <a href="/legal/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</a>
        </div>
        <p className="mt-2">© 2026 Heirloom. Built with 🔒 in Europe.</p>
      </footer>
    </div>
  )
}
