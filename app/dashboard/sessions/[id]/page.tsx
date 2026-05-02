import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { SessionChat } from '@/components/dashboard/session-chat'
import Link from 'next/link'

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

  // Fetch linked request if exists
  let linkedRequest = null
  if (session.request_id) {
    const { data: request } = await supabase
      .from('requests')
      .select('id, title, status')
      .eq('id', session.request_id)
      .single()
    linkedRequest = request
  }

  const agentMode = (session.metadata as any)?.agent_mode || 'coach'

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{session.title}</h1>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded capitalize">
              {agentMode.replace('_', ' ')}
            </span>
          </div>
          {session.goal && <p className="text-xs text-muted-foreground mt-0.5">{session.goal}</p>}
          {linkedRequest && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Linked to:</span>
              <Link 
                href={`/dashboard/intake?requestId=${linkedRequest.id}`}
                className="text-xs text-primary hover:underline underline-offset-2"
              >
                {linkedRequest.title}
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {linkedRequest && (
            <Link 
              href={`/dashboard/intake?requestId=${linkedRequest.id}`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View Architecture
            </Link>
          )}
          <a href="/dashboard/sessions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← All sessions
          </a>
        </div>
      </div>
      <SessionChat session={session} initialMessages={messages ?? []} userId={user!.id} />
    </div>
  )
}
