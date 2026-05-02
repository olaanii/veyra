'use client'

import useSWR from 'swr'
import { cn } from '@/lib/utils'

interface WorkflowRun {
  runId: string
  status: string
  startedAt: string | null
  finishedAt: string | null
  workflowName: string | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return '—'
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : Date.now()
  const ms = e - s
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

function parseWorkflowLabel(raw: string | null): string {
  if (!raw) return 'Unknown workflow'
  // Format: "workflow//./workflows/session-coach//sessionCoachWorkflow"
  const parts = raw.split('//')
  const fnName = parts[parts.length - 1]
  if (!fnName) return raw
  // camelCase to words: sessionCoachWorkflow -> Session Coach Workflow
  return fnName.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).replace(/Workflow$/, '').trim()
}

export function WorkflowRunsPanel() {
  const { data, error, isLoading, mutate } = useSWR<{ runs: WorkflowRun[] }>(
    '/api/workflow-runs',
    fetcher,
    { refreshInterval: 4000 },
  )

  const runs = data?.runs ?? []

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
              {runs.filter((r) => r.status === 'running').length} running
            </span>
            <span className="px-2 py-1 rounded-md bg-secondary border border-border">
              {runs.filter((r) => r.status === 'completed').length} completed
            </span>
            <span className="px-2 py-1 rounded-md bg-secondary border border-border">
              {runs.filter((r) => r.status === 'failed').length} failed
            </span>
          </div>
        </div>
        <button
          onClick={() => mutate()}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        Auto-refreshing every 4s
      </div>

      {/* Table */}
      {isLoading && (
        <div className="text-sm text-muted-foreground py-12 text-center">Loading runs...</div>
      )}
      {error && (
        <div className="text-sm text-destructive py-4 text-center">Failed to load runs.</div>
      )}
      {!isLoading && runs.length === 0 && (
        <div className="text-center py-16 space-y-2 border border-dashed border-border rounded-lg">
          <p className="text-sm font-medium text-foreground">No workflow runs yet</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Start a session, analyze a prompt, or decompose a goal to trigger your first durable workflow run.
          </p>
        </div>
      )}

      {runs.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Workflow</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Started</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Run ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((run) => (
                <tr key={run.runId} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {parseWorkflowLabel(run.workflowName)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                      STATUS_COLORS[run.status] ?? STATUS_COLORS.cancelled,
                    )}>
                      {run.status === 'running' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {formatDuration(run.startedAt, run.finishedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {run.startedAt ? new Date(run.startedAt).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground/60">
                    {run.runId.slice(0, 12)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WDK info footer */}
      <p className="text-xs text-muted-foreground/50 text-center">
        Powered by Vercel Workflow Dev Kit — runs are durable and survive restarts
      </p>
    </div>
  )
}
