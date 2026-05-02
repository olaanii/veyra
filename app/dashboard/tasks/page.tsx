import { createClient } from '@/lib/supabase/server'
import { TaskBoard } from '@/components/dashboard/task-board'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      architecture_package:architecture_id (id, request_id, selected_stack_name, created_at)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Get stats
  const { data: allTasks } = await supabase
    .from('tasks')
    .select('status', { count: 'exact' })
    .eq('user_id', user!.id)

  const todoCount = allTasks?.filter(t => t.status === 'todo').length ?? 0
  const inProgressCount = allTasks?.filter(t => t.status === 'in_progress').length ?? 0
  const doneCount = allTasks?.filter(t => t.status === 'completed').length ?? 0

  return (
    <div className="p-8 space-y-6 h-full flex flex-col">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Task Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Agent tasks materialized from architecture packages</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100">
            <span className="text-sm font-medium text-slate-700">To do</span>
            <span className="text-sm font-semibold text-slate-900">{todoCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100">
            <span className="text-sm font-medium text-blue-700">In progress</span>
            <span className="text-sm font-semibold text-blue-900">{inProgressCount}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100">
            <span className="text-sm font-medium text-emerald-700">Done</span>
            <span className="text-sm font-semibold text-emerald-900">{doneCount}</span>
          </div>
        </div>
      </div>

      {/* Info banner about materialized tasks */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Tasks are auto-materialized from architecture packages. Each task includes the downstream prompt and links back to its source architecture for context.
        </p>
      </div>

      <TaskBoard initialTasks={tasks ?? []} userId={user!.id} />
    </div>
  )
}
