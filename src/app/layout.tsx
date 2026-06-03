import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'Heirloom — Secure Digital Inheritance',
  description: "Protect your family's future. Time-locked, zero-knowledge inheritance vault for couples.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-stone-950 text-stone-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
