'use client'

import { useState } from 'react'

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSync = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sync-packages', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('La synchronisation a échoué')
      }

      window.location.reload()
    } catch (err) {
      setError('Une erreur est survenue')
      console.error('Sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={handleSync}
        disabled={loading}
        className="bg-gradient-to-r from-fenua-purple to-fenua-coral text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Synchronisation...' : 'Synchroniser'}
      </button>
    </div>
  )
} 