'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Status = Task['status']
type Priority = Task['priority']

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-border' },
  { id: 'in_progress', label: 'In Progress', color: 'border-primary/50' },
  { id: 'blocked', label: 'Blocked', color: 'border-red-300' },
  { id: 'done', label: 'Done', color: 'border-emerald-300' },
]

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'text-red-700 bg-red-100',
  medium: 'text-amber-700 bg-amber-100',
  low: 'text-muted-foreground bg-muted',
}

const AGENT_TYPES = ['Code Generation', 'Data Analysis', 'Content Writing', 'Research', 'Testing', 'Deployment', 'Other']

interface Props {
  initialTasks: Task[]
  userId: string
}

export function TaskBoard({ initialTasks, userId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as Priority, agent_type: '' })
  const [creating, setCreating] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        agent_type: form.agent_type || null,
        status: 'todo',
      })
      .select()
      .single()
    if (!error && data) {
      setTasks([data, ...tasks])
      setForm({ title: '', description: '', priority: 'medium', agent_type: '' })
      setShowForm(false)
    }
    setCreating(false)
  }

  async function handleStatusChange(id: string, status: Status) {
    const supabase = createClient()
    await supabase.from('tasks').update({ status }).eq('id', id)
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter((t) => t.id !== id))
  }

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-hidden">
      {/* Header actions */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {showForm ? 'Cancel' : 'Add task'}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-primary/30 rounded-lg p-5 space-y-3 shrink-0">
          <h3 className="text-sm font-semibold text-foreground">New task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground flex-1"
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <select
              value={form.agent_type}
              onChange={(e) => setForm({ ...form, agent_type: e.target.value })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground flex-1"
            >
              <option value="">Agent type (optional)</option>
              {AGENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={creating} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {creating ? 'Adding...' : 'Add task'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-hidden min-h-0">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div key={col.id} className={cn('flex flex-col rounded-lg border bg-card overflow-hidden', col.color)}>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {colTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">Empty</p>
                )}
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task
  onStatusChange: (id: string, s: Status) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-background border border-border rounded-md p-3 space-y-2 group hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-foreground leading-snug">{task.title}</p>
        <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {task.description && <p className="text-xs text-muted-foreground leading-snug">{task.description}</p>}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', PRIORITY_COLORS[task.priority])}>
          {task.priority}
        </span>
        {task.agent_type && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground">{task.agent_type}</span>
        )}
      </div>
      {/* Quick status move */}
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Move →
      </button>
      {open && (
        <div className="flex flex-wrap gap-1">
          {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
            <button
              key={c.id}
              onClick={() => { onStatusChange(task.id, c.id); setOpen(false) }}
              className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
