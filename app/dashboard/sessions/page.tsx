import { createClient } from '@/lib/supabase/server'
import { AgentCoachingWorkspace } from '@/components/dashboard/agent-coaching-workspace'

interface Props {
  searchParams: Promise<{ requestId?: string; architectureId?: string }>
}

export default async function AgentCoachingPage({ searchParams }: Props) {
  const params = await searchParams
  const linkedRequestId = params.requestId || null
  const linkedArchitectureId = params.architectureId || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  // If coming from intake, fetch request info for context
  let linkedRequest = null
  if (linkedRequestId) {
    const { data: request } = await supabase
      .from('requests')
      .select('title, brief')
      .eq('id', linkedRequestId)
      .single()
    linkedRequest = request
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Agent Coaching Workspace</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Work with specialized agents to refine prompts, test ideas, and improve your architecture. Outputs can be saved to templates or fed back into your workflow.
        </p>
      </div>

      {linkedRequest && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Creating session from request:</span> {linkedRequest.title}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            This coaching session will be linked to your architecture workflow for context continuity.
          </p>
        </div>
      )}

      <AgentCoachingWorkspace 
        initialSessions={sessions ?? []} 
        userId={user!.id} 
        linkedRequestId={linkedRequestId}
        linkedArchitectureId={linkedArchitectureId}
      />
    </div>
  )
}
