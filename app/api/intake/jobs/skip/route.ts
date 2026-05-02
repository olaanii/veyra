import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { requestId, skipJobId } = await req.json()

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark the failed job as skipped by marking it completed
    if (skipJobId) {
      await supabase
        .from('workflow_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', skipJobId)
        .eq('user_id', user.id)
    }

    // Move request to ready state
    const { data: request, error } = await supabase
      .from('requests')
      .update({ status: 'ready' })
      .eq('id', requestId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      request,
      message: 'Request moved to ready state. Failed step was skipped.',
    })
  } catch (error) {
    console.error('[v0] Skip endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to skip job' },
      { status: 500 }
    )
  }
}
