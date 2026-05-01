'use client'

import { SessionShare } from '@/lib/types'
import { useState } from 'react'

interface ShareSessionProps {
  sessionId: string
  onShare?: () => void
}

export function ShareSession({ sessionId, onShare }: ShareSessionProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/tier3/share-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, sharedWithEmail: email, permission }),
      })
      if (res.ok) {
        setEmail('')
        onShare?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-semibold">Share Session</h3>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
        />
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as any)}
          className="px-3 py-2 bg-background border border-border rounded text-sm"
        >
          <option value="view">View</option>
          <option value="comment">Comment</option>
          <option value="edit">Edit</option>
        </select>
        <button
          onClick={handleShare}
          disabled={!email || loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sharing...' : 'Share'}
        </button>
      </div>
    </div>
  )
}
