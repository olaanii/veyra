import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SessionChat } from '@/components/dashboard/session-chat'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!session) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{session.title}</h1>
          {session.goal && <p className="text-xs text-muted-foreground mt-0.5">{session.goal}</p>}
        </div>
        <a href="/dashboard/sessions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← All sessions
        </a>
      </div>
      <SessionChat session={session} initialMessages={messages ?? []} userId={user!.id} />
    </div>
  )
}
