// Email service using Resend API
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = 'Heirloom <onboarding@resend.dev>'

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

// Email templates
export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to Heirloom — Your Digital Legacy is Secure',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <h1 style="color: #d97706; margin-bottom: 20px;">Welcome to Heirloom, ${name}!</h1>
        <p>You've taken an important step to protect your digital assets for your loved ones.</p>
        <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0;">
          <strong>Next steps:</strong>
          <ol>
            <li>Create your first vault</li>
            <li>Add important documents and credentials</li>
            <li>Set up an inheritance plan with your partner</li>
            <li>Check in weekly to keep your plan active</li>
          </ol>
        </div>
        <p>Your data is encrypted with AES-256-GCM. Even we can't access it.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is an automated message from Heirloom. Please do not reply.
        </p>
      </div>
    `,
  }
}

export function checkInReminder(name: string, daysUntilTrigger: number): { subject: string; html: string } {
  return {
    subject: `⏰ Heirloom: Check-in reminder (${daysUntilTrigger} days remaining)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <h1 style="color: #d97706;">Hi ${name},</h1>
        <p>This is your weekly reminder to check in to Heirloom.</p>
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
          <strong>⚠️ Important:</strong> If you don't check in for ${daysUntilTrigger} more days, 
          your inheritance plan may be triggered and your partner will receive access to your vault.
        </div>
        <a href="https://heirloom-ochre.vercel.app/dashboard" 
           style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Check in now
        </a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is an automated reminder from Heirloom. Please do not reply.
        </p>
      </div>
    `,
  }
}

export function inheritanceTriggeredEmail(
  beneficiaryName: string,
  deceasedName: string,
  vaultLink: string,
  share2: string
): { subject: string; html: string } {
  return {
    subject: `🔐 Heirloom: ${deceasedName}'s vault access has been granted`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
        <h1 style="color: #d97706;">Dear ${beneficiaryName},</h1>
        <p>We are reaching out with important information regarding <strong>${deceasedName}</strong>'s digital assets.</p>
        <p>As their designated beneficiary, you now have access to their encrypted vault through Heirloom.</p>
        <div style="background: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 24px 0;">
          <strong>How to access the vault:</strong>
          <ol>
            <li>Visit: <a href="${vaultLink}">${vaultLink}</a></li>
            <li>You will need the second share of the decryption key</li>
            <li>Your share is: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${share2}</code></li>
            <li>Combine this with the first share (held by Heirloom) to decrypt the vault</li>
          </ol>
        </div>
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
          <strong>⚠️ Important:</strong> Keep this share secure. Anyone with both shares can access the vault contents.
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          This is an automated message from Heirloom. If you believe this was sent in error, please contact us immediately.
        </p>
      </div>
    `,
  }
}
