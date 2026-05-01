import { createClient } from '@/lib/supabase/server'
import { type Request } from '@/lib/types'

export async function POST(req: Request) {
  const { title, description, goal, sessionId } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data, error } = await supabase
    .from('requests')
    .insert({
      user_id: user.id,
      session_id: sessionId || null,
      title,
      description,
      goal,
      status: 'intake',
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ request: data })
}
