import { createClient } from '@/lib/supabase/server'
import { TaskBoard } from '@/components/dashboard/task-board'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Task Board</h1>
        <p className="text-muted-foreground text-sm mt-1">Track async agent tasks across stages</p>
      </div>
      <TaskBoard initialTasks={tasks ?? []} userId={user!.id} />
    </div>
  )
}
