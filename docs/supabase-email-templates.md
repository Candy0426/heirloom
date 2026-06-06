<!-- 
  How to use this template:
  1. Go to https://supabase.com/dashboard/project/_/auth/templates
  2. Click "Confirm signup" template
  3. Replace the Subject and Content with the versions below
  4. Save
-->

<!-- SUBJECT -->
Confirm your email — Heirloom 🔐

<!-- HTML CONTENT (paste this into the Body field) -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confirm your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0c0a09;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #1c1917; border-radius: 12px; border: 1px solid #292524;">
          <tr>
            <td style="padding: 40px 32px 24px;">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 28px;">
                <span style="font-size: 28px; font-weight: 700; color: #f59e0b; letter-spacing: -0.02em; font-family: ui-serif, Georgia, Cambria, 'Times New Roman', serif;">Heirloom</span>
              </div>
              
              <h1 style="color: #fafaf9; font-size: 22px; font-weight: 600; margin: 0 0 16px 0; line-height: 1.3;">Welcome to Heirloom, {{ .Data.first_name }}!</h1>
              
              <p style="color: #a8a29e; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">You are one step away from securing your digital legacy for your loved ones. Please confirm your email address to get started.</p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #f59e0b; color: #0c0a09; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; border: none;">Confirm email address</a>
              </div>
              
              <p style="color: #78716c; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">Or copy and paste this link into your browser:<br><span style="color: #f59e0b; word-break: break-all;">{{ .ConfirmationURL }}</span></p>
              
              <!-- Divider -->
              <div style="border-top: 1px solid #292524; margin: 28px 0;"></div>
              
              <!-- Next steps -->
              <div style="background-color: #292524; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
                <p style="color: #d6d3d1; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Next steps:</p>
                <ol style="color: #a8a29e; font-size: 13px; line-height: 1.7; margin: 0; padding-left: 18px;">
                  <li>Confirm your email by clicking the button above</li>
                  <li>Sign in to your Heirloom dashboard</li>
                  <li>Create your first encrypted vault</li>
                  <li>Set up an inheritance plan with your partner</li>
                  <li>Check in weekly to keep your plan active</li>
                </ol>
              </div>
              
              <p style="color: #78716c; font-size: 12px; line-height: 1.5; margin: 0;">Your data is encrypted with AES-256-GCM. Even we can't access it. You are receiving this email because you signed up for Heirloom. If you didn't request this, please ignore it.</p>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin-top: 20px;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="color: #57534e; font-size: 12px; margin: 0;">Heirloom — Secure Digital Inheritance</p>
              <p style="color: #44403c; font-size: 11px; margin: 4px 0 0 0;">© 2025 Heirloom. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>

<!-- 
  OTHER TEMPLATES TO CUSTOMIZE:
  
  1. "Magic Link" template — same HTML, change button text to "Sign in to Heirloom"
  2. "Change Email Address" template — same HTML, change heading to "Confirm email change"
  3. "Reset Password" template — same HTML, change button to "Reset password"
  4. "Invite User" template — if you add team members later
  
  All use {{ .ConfirmationURL }} as the link variable.
-->

<!-- TEXT VERSION (paste into the "Text Body" field if Supabase has one) -->
Welcome to Heirloom!

You are one step away from securing your digital legacy for your loved ones. Please confirm your email address to get started.

Confirm your email: {{ .ConfirmationURL }}

Next steps:
1. Confirm your email by visiting the link above
2. Sign in to your Heirloom dashboard
3. Create your first encrypted vault
4. Set up an inheritance plan with your partner
5. Check in weekly to keep your plan active

Your data is encrypted with AES-256-GCM. Even we can't access it.

You are receiving this email because you signed up for Heirloom. If you didn't request this, please ignore it.

Heirloom — Secure Digital Inheritance
© 2025 Heirloom. All rights reserved.
