'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  initialSessions: Session[]
  userId: string
}

export function SessionsList({ initialSessions, userId }: Props) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newGoal, setNewGoal] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sessions')
      .insert({ title: newTitle.trim(), goal: newGoal.trim() || null, user_id: userId })
      .select()
      .single()
    if (!error && data) {
      setSessions([data, ...sessions])
      setNewTitle('')
      setNewGoal('')
      setShowForm(false)
      router.push(`/dashboard/sessions/${data.id}`)
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('sessions').delete().eq('id', id)
    setSessions(sessions.filter((s) => s.id !== id))
  }

  const statusColor: Record<string, string> = {
    active: 'text-primary bg-primary/15',
    completed: 'text-green-400 bg-green-500/15',
    archived: 'text-muted-foreground bg-muted',
  }

  return (
    <div className="space-y-4">
      {/* New session button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? 'Cancel' : 'New session'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-primary/30 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">New session</h3>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Session title</label>
            <Input
              placeholder="e.g. Build a REST API endpoint"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goal <span className="text-muted-foreground/60">(optional)</span></label>
            <Input
              placeholder="What do you want to achieve in this session?"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={creating} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {creating ? 'Creating...' : 'Create session'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">No sessions yet. Create your first one.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="bg-card border border-border rounded-lg px-5 py-4 flex items-center justify-between hover:border-primary/30 transition-colors group"
            >
              <a href={`/dashboard/sessions/${s.id}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{s.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColor[s.status]}`}>{s.status}</span>
                </div>
                {s.goal && <p className="text-xs text-muted-foreground mt-1 truncate">{s.goal}</p>}
                <p className="text-xs text-muted-foreground/60 mt-1">{new Date(s.updated_at).toISOString().split('T')[0]}</p>
              </a>
              <button
                onClick={() => handleDelete(s.id)}
                className="ml-4 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                title="Delete session"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
