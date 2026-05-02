import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { jobId, requestId } = await req.json()

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the job
    const { data: job, error: fetchError } = await supabase
      .from('workflow_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check max retries
    if (job.retry_count >= job.max_retries) {
      return NextResponse.json(
        { error: `Max retries (${job.max_retries}) exceeded` },
        { status: 400 }
      )
    }

    // Update job to retrying state
    const { data: updatedJob, error: updateError } = await supabase
      .from('workflow_jobs')
      .update({
        status: 'retrying',
        retry_count: job.retry_count + 1,
        last_attempted_at: new Date().toISOString(),
        error_message: null,
        error_details: null,
      })
      .eq('id', jobId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update job' },
        { status: 500 }
      )
    }

    // Update request status back to appropriate stage for retry
    const statusMap: Record<string, string> = {
      clarify: 'analyzing',
      extract: 'waiting_for_clarification',
      architect: 'generating_architecture',
      regenerate_section: 'generating_architecture',
    }

    const newStatus = statusMap[job.job_type] || 'ready'
    await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    return NextResponse.json({
      job: updatedJob,
      message: `Job retry initiated (${updatedJob.retry_count}/${job.max_retries})`,
    })
  } catch (error) {
    console.error('[v0] Retry endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to retry job' },
      { status: 500 }
    )
  }
}
