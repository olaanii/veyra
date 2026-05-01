import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkflowRunsPanel } from '@/components/dashboard/workflow-runs-panel'

export default async function RunsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border px-8 py-5 shrink-0">
        <h1 className="text-lg font-semibold text-foreground">Workflow Runs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Live observability for all durable workflow executions
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <WorkflowRunsPanel />
      </div>
    </div>
  )
}
