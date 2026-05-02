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

    // Check if tasks already exist for this architecture
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('architecture_id', architectureId)
      .eq('user_id', user.id)

    if (existingTasks && existingTasks.length > 0) {
      console.log('[v0] Tasks already materialized for architecture:', architectureId)
      return NextResponse.json({
        success: true,
        taskCount: existingTasks.length,
        tasks: existingTasks,
        message: `Tasks already materialized for this architecture (${existingTasks.length} existing tasks)`,
        alreadyMaterialized: true,
      })
    }

    // Extract and create tasks from agent_tasks
    const agentTasks = architecture.agent_tasks || []
    
    if (!agentTasks.length) {
      return NextResponse.json({
        success: true,
        taskCount: 0,
        tasks: [],
        message: 'No agent tasks found in architecture package',
      })
    }

    const tasksToCreate = agentTasks.map((task: any, index: number) => ({
      user_id: user.id,
      request_id: architecture.request_id,
      architecture_id: architectureId,
      title: task.title || task.agent || 'Unnamed Task',
      description: task.description || `Implementation task for ${task.agent || 'agent'}`,
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
        downstream_prompt: task.downstream_prompt || null,
      },
    }))

    // Bulk insert tasks
    const { data: createdTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToCreate)
      .select()

    if (insertError) {
      console.error('[v0] Error creating tasks:', insertError)
      return NextResponse.json({ error: 'Failed to create tasks', details: insertError.message }, { status: 500 })
    }

    console.log('[v0] Successfully materialized', createdTasks?.length, 'tasks from architecture:', architectureId)

    return NextResponse.json({
      success: true,
      taskCount: createdTasks?.length || 0,
      tasks: createdTasks,
      message: `Materialized ${createdTasks?.length} tasks from architecture package`,
      alreadyMaterialized: false,
    })
  } catch (error) {
    console.error('[v0] Materialize tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to materialize tasks', details: String(error) },
      { status: 500 }
    )
  }
}
