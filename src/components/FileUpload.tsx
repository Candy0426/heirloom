'use client'

import { useState, useCallback } from 'react'
import { encryptFile } from '@/utils/crypto'

interface FileUploadProps {
  vaultId: string
  encryptionKey: string
  onUploadComplete?: (urls: string[]) => void
}

export default function FileUpload({ vaultId, encryptionKey, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError('')

    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Max size: 10MB`)
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        
        // Encrypt file with AES-256-GCM
        const encrypted = await encryptFile(arrayBuffer, encryptionKey)
        
        // Create encrypted blob
        const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' })
        
        // Upload to Supabase Storage via API route
        const formData = new FormData()
        formData.append('file', encryptedBlob, `${file.name}.encrypted`)
        formData.append('vaultId', vaultId)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`Upload failed for ${file.name}`)
        
        const { url } = await response.json()
        uploadedUrls.push(url)
        
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      onUploadComplete?.(uploadedUrls)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [vaultId, encryptionKey, onUploadComplete])

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-stone-700 rounded-xl p-6 text-center hover:border-amber-500/50 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="text-4xl mb-2">📎</div>
          <p className="text-stone-300 font-medium">
            {uploading ? 'Uploading...' : 'Click to upload files'}
          </p>
          <p className="text-stone-500 text-sm mt-1">
            Images, PDFs, documents (max 10MB each)
          </p>
        </label>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-400">Encrypting &amp; uploading...</span>
            <span className="text-amber-400">{progress}%</span>
          </div>
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-rose-500 text-sm">{error}</p>
      )}

      <p className="text-xs text-stone-600">
        🔐 Files are encrypted in your browser before upload. Only you hold the key.
      </p>
    </div>
  )
}