import { NextResponse } from 'next/server'
import { sendEmail, welcomeEmail, checkInReminder, inheritanceTriggeredEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { type, to, data } = await request.json()

    let emailData

    switch (type) {
      case 'welcome':
        emailData = welcomeEmail(data.name)
        break
      case 'check-in':
        emailData = checkInReminder(data.name, data.daysUntilTrigger)
        break
      case 'inheritance':
        emailData = inheritanceTriggeredEmail(
          data.beneficiaryName,
          data.deceasedName,
          data.vaultLink,
          data.share2
        )
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const result = await sendEmail({
      to,
      ...emailData,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
