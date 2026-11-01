import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// Server-side sealing of the platform's key share (share_part_1).
// The share is encrypted with SHARE_ENCRYPTION_KEY, which lives only in the
// server environment, so a database leak alone never exposes it.

const PREFIX = 'v1:'

function getKey(): Buffer {
  const b64 = process.env.SHARE_ENCRYPTION_KEY || ''
  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) {
    throw new Error('SHARE_ENCRYPTION_KEY must be set to 32 random bytes (base64)')
  }
  return key
}

export function sealShare(share: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(share, 'utf8'), cipher.final()])
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64')
}

// Returns null for legacy plans created before key splitting existed (empty share)
export function openShare(sealed: string | null | undefined): string | null {
  if (!sealed || !sealed.startsWith(PREFIX)) return null
  const data = Buffer.from(sealed.slice(PREFIX.length), 'base64')
  const decipher = createDecipheriv('aes-256-gcm', getKey(), data.subarray(0, 12))
  decipher.setAuthTag(data.subarray(12, 28))
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8')
}
