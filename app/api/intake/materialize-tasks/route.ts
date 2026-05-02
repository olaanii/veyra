import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { architectureId } = await req.json()

    if (!architectureId) {
      return NextResponse.json({ error: 'architectureId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get architecture package
    const { data: architecture, error: archError } = await supabase
      .from('architecture_packages')
      .select('*')
      .eq('id', architectureId)
      .eq('user_id', user.id)
      .single()

    if (archError || !architecture) {
      return NextResponse.json({ error: 'Architecture not found' }, { status: 404 })
    }

    // Get request for context
    const { data: request } = await supabase
      .from('requests')
      .select('*')
      .eq('id', architecture.request_id)
      .eq('user_id', user.id)
      .single()

    // Extract and create tasks from agent_tasks
    const agentTasks = architecture.agent_tasks || []
    const tasksToCreate = agentTasks.map((task: any, index: number) => ({
      user_id: user.id,
      request_id: architecture.request_id,
      architecture_id: architectureId,
      title: task.title || task.agent,
      description: task.description || '',
      agent: task.agent || 'general',
      priority: task.priority || 'medium',
      status: 'todo',
      estimated_hours: task.estimated_hours || null,
      estimated_tokens: task.estimated_tokens || null,
      order: index,
      subtasks: task.subtasks || [],
      metadata: {
        source: 'architecture_workflow',
        agent_role: task.agent,
        project_context: request?.brief,
      },
    }))

    // Bulk insert tasks
    const { data: createdTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToCreate)
      .select()

    if (insertError) {
      console.error('[v0] Error creating tasks:', insertError)
      return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      taskCount: createdTasks?.length || 0,
      tasks: createdTasks,
      message: `Materialized ${createdTasks?.length} tasks from architecture package`,
    })
  } catch (error) {
    console.error('[v0] Materialize tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to materialize tasks' },
      { status: 500 }
    )
  }
}
