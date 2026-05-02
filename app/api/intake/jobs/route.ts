import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('id')
    const requestId = searchParams.get('requestId')

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get a single job by ID
    if (jobId) {
      const { data: job, error } = await supabase
        .from('workflow_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      return NextResponse.json({ job })
    }

    // Get all jobs for a request
    if (requestId) {
      const { data: jobs, error } = await supabase
        .from('workflow_jobs')
        .select('*')
        .eq('request_id', requestId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
      }

      return NextResponse.json({ jobs: jobs || [] })
    }

    return NextResponse.json(
      { error: 'jobId or requestId required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[v0] Jobs status endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requestId, jobType, sectionName, inputParams } = await req.json()

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a new workflow job
    const { data: job, error } = await supabase
      .from('workflow_jobs')
      .insert({
        request_id: requestId,
        user_id: user.id,
        job_type: jobType,
        section_name: sectionName,
        status: 'pending',
        input_params: inputParams || {},
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Failed to create job:', error)
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      )
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('[v0] Jobs creation endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
