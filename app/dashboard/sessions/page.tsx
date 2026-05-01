import { createClient } from '@/lib/supabase/server'
import { SessionsList } from '@/components/dashboard/sessions-list'

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Sessions</h1>
        <p className="text-muted-foreground text-sm mt-1">Each session is a goal-focused conversation with an agent</p>
      </div>
      <SessionsList initialSessions={sessions ?? []} userId={user!.id} />
    </div>
  )
}
