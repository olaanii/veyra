import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: requestCount }, { count: sessionCount }, { count: taskCount }] = await Promise.all([
    supabase.from('requests').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ])

  const { data: recentRequests } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(4)

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
    { label: 'Architecture Requests', value: requestCount ?? 0, href: '/dashboard/requests' },
    { label: 'Sessions', value: sessionCount ?? 0, href: '/dashboard/sessions' },
    { label: 'Active tasks', value: activeTasks?.length ?? 0, href: '/dashboard/tasks' },
    { label: 'Total tasks', value: taskCount ?? 0, href: '/dashboard/tasks' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-powered architecture & workflow design</p>
        </div>
        <Link
          href="/dashboard/intake"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          New Request
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

      {/* Recent Requests + Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Requests</h2>
            <Link href="/dashboard/requests" className="text-xs text-primary hover:underline underline-offset-4">View all</Link>
          </div>
          {recentRequests && recentRequests.length > 0 ? (
            <ul className="space-y-2">
              {recentRequests.map((r: any) => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/intake?requestId=${r.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-secondary transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground truncate group-hover:text-primary transition-colors block">{r.title}</span>
                      <span className="text-xs text-muted-foreground">{r.brief?.substring(0, 40)}</span>
                    </div>
                    <RequestStatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No requests yet" action={{ label: 'Create one', href: '/dashboard/intake' }} />
          )}
        </div>

        {/* Recent Sessions */}
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
      </div>

      {/* Quick links */}
      <div className="border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Quick access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Architecture Intake', desc: 'Start new request workflow', href: '/dashboard/intake' },
            { label: 'View Requests', desc: 'Manage all architecture requests', href: '/dashboard/requests' },
            { label: 'Task Board', desc: 'Kanban for agent tasks', href: '/dashboard/tasks' },
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

function RequestStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    analyzing: 'bg-blue-100 text-blue-700',
    waiting_for_clarification: 'bg-amber-100 text-amber-700',
    extracting: 'bg-purple-100 text-purple-700',
    generating_stacks: 'bg-indigo-100 text-indigo-700',
    generating_architecture: 'bg-cyan-100 text-cyan-700',
    ready: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    resumed: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusMap[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-orange-100 text-orange-700',
    completed: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-zinc-100 text-zinc-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${map[status] ?? 'bg-zinc-100 text-zinc-600'}`}>
      {status}
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
