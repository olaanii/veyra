import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: sessionCount }, { count: taskCount }, { count: templateCount }] = await Promise.all([
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('prompt_templates').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ])

  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(4)

  const { data: activeTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user!.id)
    .in('status', ['todo', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(4)

  const stats = [
    { label: 'Sessions', value: sessionCount ?? 0, href: '/dashboard/sessions' },
    { label: 'Active tasks', value: activeTasks?.length ?? 0, href: '/dashboard/tasks' },
    { label: 'Saved templates', value: templateCount ?? 0, href: '/dashboard/prompts' },
    { label: 'Total tasks', value: taskCount ?? 0, href: '/dashboard/tasks' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Your agent communication workspace</p>
        </div>
        <Link
          href="/dashboard/sessions"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          New session
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors"
          >
            <p className="text-3xl font-semibold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent sessions + active tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sessions */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Sessions</h2>
            <Link href="/dashboard/sessions" className="text-xs text-primary hover:underline underline-offset-4">View all</Link>
          </div>
          {recentSessions && recentSessions.length > 0 ? (
            <ul className="space-y-2">
              {recentSessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/sessions/${s.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary transition-colors group"
                  >
                    <span className="text-sm text-foreground truncate group-hover:text-primary transition-colors">{s.title}</span>
                    <StatusBadge status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No sessions yet" action={{ label: 'Start one', href: '/dashboard/sessions' }} />
          )}
        </div>

        {/* Active tasks */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Active Tasks</h2>
            <Link href="/dashboard/tasks" className="text-xs text-primary hover:underline underline-offset-4">View board</Link>
          </div>
          {activeTasks && activeTasks.length > 0 ? (
            <ul className="space-y-2">
              {activeTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  <span className="text-sm text-foreground truncate">{t.title}</span>
                  <PriorityBadge priority={t.priority} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No active tasks" action={{ label: 'Create task', href: '/dashboard/tasks' }} />
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Quick access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Prompt Studio', desc: 'Refine and save prompts', href: '/dashboard/prompts' },
            { label: 'Task Board', desc: 'Kanban for agent tasks', href: '/dashboard/tasks' },
            { label: 'Architect', desc: 'Decompose goals into steps', href: '/dashboard/architect' },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex flex-col px-4 py-3 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium text-foreground">{q.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{q.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-primary/20 text-primary',
    completed: 'bg-green-500/20 text-green-400',
    archived: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-muted text-muted-foreground',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${map[priority] ?? 'bg-muted text-muted-foreground'}`}>
      {priority}
    </span>
  )
}

function EmptyState({ label, action }: { label: string; action: { label: string; href: string } }) {
  return (
    <div className="text-center py-6 space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link href={action.href} className="text-xs text-primary hover:underline underline-offset-4">{action.label}</Link>
    </div>
  )
}
