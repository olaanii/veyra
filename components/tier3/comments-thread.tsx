'use client'

import { SessionComment } from '@/lib/types'
import { useState } from 'react'

interface CommentsThreadProps {
  sessionId: string
  comments: SessionComment[]
  onCommentAdded?: () => void
}

export function CommentsThread({ sessionId, comments, onCommentAdded }: CommentsThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/tier3/session-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, content: newComment }),
      })
      if (res.ok) {
        setNewComment('')
        onCommentAdded?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-semibold">Comments & Feedback</h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="p-2 bg-background rounded text-xs">
            <p className="text-muted-foreground text-xs mb-1">{comment.created_at.split('T')[0]}</p>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>

      <textarea
        placeholder="Add feedback or suggestions..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full px-3 py-2 bg-background border border-border rounded text-sm min-h-20 resize-none"
      />
      <button
        onClick={handleAddComment}
        disabled={!newComment.trim() || loading}
        className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Add Comment'}
      </button>
    </div>
  )
}
