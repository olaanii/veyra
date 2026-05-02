import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { requestId, jobId } = await req.json()

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the job to get details
    const { data: job, error: jobError } = await supabase
      .from('workflow_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Move request to 'resumed' state
    const { data: request, error: reqError } = await supabase
      .from('requests')
      .update({
        status: 'resumed',
      })
      .eq('id', requestId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (reqError) {
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      request,
      message: 'Request marked as resumed. Ready to continue workflow.',
    })
  } catch (error) {
    console.error('[v0] Resume endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to resume request' },
      { status: 500 }
    )
  }
}
