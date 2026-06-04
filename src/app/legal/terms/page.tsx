export default function TermsPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-6">Terms of Service</h1>
        <p className="text-stone-500 text-sm mb-8">Last updated: June 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">1. Acceptance of Terms</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              By using Heirloom, you agree to these Terms of Service. If you do not agree, please do not use our service. 
              Heirloom provides a digital inheritance vault service ("Service") that allows users to store encrypted asset 
              information and designate beneficiaries who may access that information under predefined conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">2. Eligibility</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              You must be at least 18 years old and capable of forming a binding contract to use Heirloom. 
              By using the Service, you represent that you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">3. How the Service Works</h2>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Users create encrypted vaults containing asset information (e.g., bank accounts, crypto wallets, insurance details).</li>
              <li>Users define an "inheritance plan" including a beneficiary, wait time (e.g., 30, 60, or 90 days), and check-in schedule.</li>
              <li>If the user fails to check in for the defined period, the Service initiates the inheritance process.</li>
              <li>The beneficiary receives the second share of the encryption key, enabling them to decrypt the vault (in combination with the first share held securely by Heirloom).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">4. User Responsibilities</h2>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Maintain the confidentiality of your account credentials.</li>
              <li>Perform regular check-ins to keep your inheritance plan active.</li>
              <li>Provide accurate and truthful information about your assets.</li>
              <li>Ensure your designated beneficiary's contact information (especially email) is accurate.</li>
              <li>You are solely responsible for the contents of your vault and the consequences of sharing the decryption key.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">5. Zero-Knowledge Disclaimer</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-3">
              Heirloom operates on a zero-knowledge basis:
            </p>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li><strong className="text-stone-300">We cannot decrypt your vault data.</strong> All encryption is performed client-side in your browser.</li>
              <li><strong className="text-stone-300">We cannot recover lost passwords or encryption keys.</strong> If you lose your credentials, your vault data is irretrievable.</li>
              <li><strong className="text-stone-300">We are not responsible for the accuracy or completeness</strong> of the information stored in your vault.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">6. Inheritance Trigger Process</h2>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>The inheritance trigger is initiated automatically after the defined wait time expires without a successful check-in.</li>
              <li>Heirloom will attempt to notify the beneficiary via email with instructions for accessing the vault.</li>
              <li>The Service is not responsible for failed delivery due to incorrect email addresses, spam filters, or technical issues beyond our control.</li>
              <li>Heirloom does not verify the beneficiary's identity. The user is responsible for ensuring the beneficiary email is correct and secure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">7. Limitation of Liability</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              To the extent permitted by law, Heirloom and its operators shall not be liable for:
            </p>
            <ul className="text-stone-400 text-sm space-y-2 ml-4">
              <li>Loss of vault data due to lost credentials, forgotten passwords, or key mismanagement.</li>
              <li>Unauthorized access resulting from user negligence (e.g., sharing passwords, insecure devices).</li>
              <li>Financial losses, missed inheritances, or disputes arising from vault contents.</li>
              <li>Service interruptions, delays, or failures due to technical issues, maintenance, or third-party services (e.g., IPFS, Supabase).</li>
              <li>Any indirect, incidental, or consequential damages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">8. Subscription & Payment</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Heirloom offers both free and premium plans. Premium subscriptions are billed monthly. 
              You may cancel at any time. No refunds are provided for partial months. 
              Prices are subject to change with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">9. Termination</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              You may delete your account at any time. We reserve the right to suspend or terminate accounts 
              that violate these terms or engage in fraudulent activity. Upon termination, your data will be 
              deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">10. Governing Law</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              These terms are governed by the laws of the European Union and Greece. Any disputes shall be 
              resolved in the courts of Athens, Greece.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">11. Changes to Terms</h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              We may update these terms. Significant changes will be communicated via email. 
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-100 mb-3">12. Contact</h2>
            <p className="text-stone-400 text-sm">
              Questions? Contact us at:{' '}
              <a href="mailto:legal@heirloom.app" className="text-amber-400 hover:text-amber-300">legal@heirloom.app</a>
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
