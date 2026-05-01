import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { sessionId, sharedWithEmail, permission } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: share, error } = await supabase
      .from('session_shares')
      .insert({
        session_id: sessionId,
        owner_id: user.id,
        shared_with_email: sharedWithEmail,
        permission,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(share)
  } catch (error) {
    console.error('Error sharing session:', error)
    return NextResponse.json({ error: 'Failed to share session' }, { status: 500 })
  }
}
