// Email service using Resend API
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
// IMPORTANT: To send from custom domain, verify it in Resend dashboard first
// Requires DNS records in GoDaddy: _dmarc, resend._domainkey, resend._bounces
const FROM_EMAIL = process.env.FROM_EMAIL || 'Heirloom <onboarding@ourheirloom.app>'

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailData): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return { success: true }
  } catch (err: any) {
    console.error('Email send failed:', err)
    return { success: false, error: err.message }
  }
}

// Escape user-provided values before putting them in email HTML
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ourheirloom.app'

const wrap = (body: string, footer: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        ${body}
        <p style="margin-top: 30px; font-size: 12px; color: #666;">${footer}</p>
      </div>
    `

// Email templates
export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to Heirloom — Your Digital Legacy is Secure',
    html: wrap(`
        <h1 style="color: #d97706; margin-bottom: 20px;">Welcome to Heirloom, ${esc(name)}!</h1>
        <p>You've taken an important step to protect your digital assets for your loved ones.</p>
        <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0;">
          <strong>Next steps:</strong>
          <ol>
            <li>Create your first vault</li>
            <li>Add important documents and credentials</li>
            <li>Set up an inheritance plan with your partner</li>
            <li>Check in regularly to keep your plan active</li>
          </ol>
        </div>
        <p>Your data is encrypted with AES-256-GCM. Even we can't access it.</p>`,
      'This is an automated message from Heirloom. Please do not reply.'),
  }
}

// Sent to the beneficiary when a plan naming them is created
export function beneficiaryInviteEmail(beneficiaryName: string, ownerEmail: string): { subject: string; html: string } {
  return {
    subject: `${ownerEmail} named you as their Heirloom beneficiary`,
    html: wrap(`
        <h1 style="color: #d97706;">Hi ${esc(beneficiaryName)},</h1>
        <p><strong>${esc(ownerEmail)}</strong> has set up an Heirloom inheritance plan and named you as the person
        who should receive their important information if something ever happens to them.</p>
        <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0;">
          <strong>What you need to do:</strong>
          <ol>
            <li>${esc(ownerEmail)} will give you a <strong>Heirloom key card</strong> — a printed or written code.</li>
            <li>Keep it somewhere safe. You will need it to open the vault.</li>
            <li>That's it. There is nothing else to do now.</li>
          </ol>
        </div>
        <p>Only if they stop checking in for the waiting period will we email you a link. The vault can only be
        opened with your key card together with the part we hold — neither of us can open it alone.</p>`,
      'This is an automated message from Heirloom. If you don\'t know this person, you can ignore this email.'),
  }
}

// Sent to the owner as the deadline approaches
export function checkInReminder(daysUntilTrigger: number, beneficiaryName: string): { subject: string; html: string } {
  return {
    subject: `⏰ Heirloom: please check in (${daysUntilTrigger} day${daysUntilTrigger === 1 ? '' : 's'} left)`,
    html: wrap(`
        <h1 style="color: #d97706;">Time to check in</h1>
        <p>You haven't checked in to Heirloom for a while.</p>
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
          <strong>⚠️ Important:</strong> If you don't check in within <strong>${daysUntilTrigger}
          day${daysUntilTrigger === 1 ? '' : 's'}</strong>, your inheritance plan will be triggered and
          ${esc(beneficiaryName)} will receive access to your vault.
        </div>
        <a href="${APP_URL}/dashboard"
           style="display: inline-block; background: #d97706; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Check in now
        </a>`,
      'This is an automated reminder from Heirloom. Please do not reply.'),
  }
}

// Sent to the beneficiary when the plan triggers
export function inheritanceTriggeredEmail(
  beneficiaryName: string,
  ownerEmail: string,
  waitDays: number,
  accessLink: string
): { subject: string; html: string } {
  return {
    subject: `🔐 Heirloom: you now have access to ${ownerEmail}'s vault`,
    html: wrap(`
        <h1 style="color: #d97706;">Dear ${esc(beneficiaryName)},</h1>
        <p><strong>${esc(ownerEmail)}</strong> named you as their beneficiary on Heirloom. They have not checked in
        for ${waitDays} days, so, as they asked, their vault is now available to you.</p>
        <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0;">
          <strong>How to open the vault:</strong>
          <ol>
            <li>Find the <strong>Heirloom key card</strong> ${esc(ownerEmail)} gave you.</li>
            <li>Open: <a href="${accessLink}">${accessLink}</a></li>
            <li>Type the code from the key card. The vault is decrypted in your browser only.</li>
          </ol>
        </div>
        <p>We do not hold the full key and cannot open the vault without your key card.</p>`,
      'This is an automated message from Heirloom. If you believe this was sent in error, please contact us immediately.'),
  }
}

// Sent to the owner when their plan triggers, in case it was a mistake
export function ownerTriggeredNotice(beneficiaryName: string, waitDays: number): { subject: string; html: string } {
  return {
    subject: '🔐 Heirloom: your inheritance plan was triggered',
    html: wrap(`
        <h1 style="color: #d97706;">Your inheritance plan was triggered</h1>
        <p>You did not check in for ${waitDays} days, so ${esc(beneficiaryName)} has been sent access to your vault,
        as you requested.</p>
        <p>If this was a mistake, please contact us right away and consider changing the information in your vault.</p>`,
      'This is an automated message from Heirloom.'),
  }
}
