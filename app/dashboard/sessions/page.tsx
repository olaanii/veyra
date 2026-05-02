import { createClient } from '@/lib/supabase/server'
import { AgentCoachingWorkspace } from '@/components/dashboard/agent-coaching-workspace'

export default async function AgentCoachingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Agent Coaching Workspace</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Work with specialized agents to refine prompts, test ideas, and improve your architecture. Outputs can be saved to templates or fed back into your workflow.
        </p>
      </div>
      <AgentCoachingWorkspace initialSessions={sessions ?? []} userId={user!.id} />
    </div>
  )
}
