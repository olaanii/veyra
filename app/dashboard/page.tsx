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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero Section - Large CTA for New Request */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-8 md:p-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Transform Your Ideas Into Production Architecture
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Submit a project brief. Get clarifying questions. Build architecture. Generate team prompts. Auto-materialize tasks.
          </p>
          <Link
            href="/dashboard/intake"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Start New Request
          </Link>
        </div>
      </div>

      {/* Progress Section - Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">In Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">{recentRequests?.filter((r: any) => ['analyzing', 'extracting', 'generating'].includes(r.status)).length ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Active workflow executions</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-2">{recentRequests?.filter((r: any) => r.status === 'finalized').length ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Architectures generated</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-2">{activeTasks?.length ?? 0}</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">From materialized tasks</p>
        </div>
      </div>

      {/* Recent Requests - Active Workflows */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Requests</h2>
            <p className="text-sm text-muted-foreground">Your active and completed workflows</p>
          </div>
          <Link href="/dashboard/requests" className="text-sm text-primary hover:underline underline-offset-4">View all</Link>
        </div>
        {recentRequests && recentRequests.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.map((r: any) => (
              <Link
                key={r.id}
                href={`/dashboard/intake?requestId=${r.id}`}
                className="flex items-center justify-between p-4 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-all group"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.brief?.substring(0, 60)}</p>
                </div>
                <div className="text-right">
                  <RequestStatusBadge status={r.status} />
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.updated_at).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-3">No requests yet. Start by creating a new one.</p>
            <Link
              href="/dashboard/intake"
              className="text-sm text-primary hover:underline underline-offset-4 font-medium"
            >
              Create a request
            </Link>
          </div>
        )}
      </div>

      {/* Active Tasks + Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Active Tasks</h2>
          {activeTasks && activeTasks.length > 0 ? (
            <div className="space-y-3">
              {activeTasks.slice(0, 3).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-md bg-secondary/30 border border-border/50">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.description?.substring(0, 40)}</p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/tasks" className="text-sm text-primary hover:underline underline-offset-4">View all tasks</Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active tasks. Complete a request to materialize tasks.</p>
          )}
        </div>

        {/* Quick Workflows */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Next Steps</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/intake"
              className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-foreground">New Request</p>
                <p className="text-xs text-muted-foreground">Start architecture workflow</p>
              </div>
            </Link>
            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-foreground">Refinement</p>
                <p className="text-xs text-muted-foreground">Iterate on architectures</p>
              </div>
            </Link>
            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-foreground">Implementation</p>
                <p className="text-xs text-muted-foreground">Auto-materialized tasks</p>
              </div>
            </Link>
          </div>
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
