// Browser-side helpers for vault decryption and the 2-of-2 inheritance key split.
//
// The vault key (base64 of 32 random bytes) is split with a one-time pad:
//   serverShare      = 32 random bytes            → held by Heirloom, released only once the plan triggers
//   beneficiaryShare = vaultKey XOR serverShare   → given to the beneficiary by the owner (key card)
// Either share alone reveals nothing about the key; both together rebuild it.

export interface EncryptedVaultData {
  encrypted: string
  salt: string
}

const KEY_BYTES = 32

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

// Supabase may hand JSONB back as a string
export function parseVaultData(raw: unknown): EncryptedVaultData {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!data || typeof data !== 'object' || !('encrypted' in data) || !('salt' in data)) {
    throw new Error('Vault data is missing or corrupted')
  }
  return data as EncryptedVaultData
}

// Same format as vault/create: salt(16) | iv(12) | ciphertext, key derived with PBKDF2 from the key string
export async function decryptVault(raw: unknown, key: string): Promise<unknown> {
  const { encrypted, salt } = parseVaultData(raw)
  try {
    const combined = base64ToBytes(encrypted)
    const iv = combined.slice(16, 28)
    const ciphertext = combined.slice(28)

    const keyMaterial = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(key), 'PBKDF2', false, ['deriveKey']
    )
    const cryptoKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: base64ToBytes(salt), iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext)
    return JSON.parse(new TextDecoder().decode(decrypted))
  } catch {
    throw new Error('Invalid key. The vault could not be decrypted.')
  }
}

// Key card format: 64 hex chars in groups of 4, easy to print and retype
function formatKeyCard(bytes: Uint8Array): string {
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return hex.match(/.{4}/g)!.join('-').toUpperCase()
}

function parseKeyCard(text: string): Uint8Array {
  const hex = text.replace(/[^0-9a-fA-F]/g, '')
  if (hex.length !== KEY_BYTES * 2) {
    throw new Error('The key card code should have 64 characters (letters A–F and digits).')
  }
  return Uint8Array.from(hex.match(/.{2}/g)!, h => parseInt(h, 16))
}

export function splitVaultKey(vaultKey: string): { serverShare: string; beneficiaryShare: string } {
  const key = base64ToBytes(vaultKey.trim())
  if (key.length !== KEY_BYTES) throw new Error('This does not look like a Heirloom vault key.')

  const pad = crypto.getRandomValues(new Uint8Array(KEY_BYTES))
  const card = key.map((b, i) => b ^ pad[i])
  return { serverShare: bytesToBase64(pad), beneficiaryShare: formatKeyCard(card) }
}

export function combineVaultKey(serverShare: string, beneficiaryShare: string): string {
  const pad = base64ToBytes(serverShare)
  const card = parseKeyCard(beneficiaryShare)
  if (pad.length !== KEY_BYTES) throw new Error('Server share is corrupted')
  return bytesToBase64(card.map((b, i) => b ^ pad[i]))
}
