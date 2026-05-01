import { createClient } from '@/lib/supabase/server'
import { PromptStudio } from '@/components/dashboard/prompt-studio'

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: templates } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('user_id', user!.id)
    .order('usage_count', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Prompt Studio</h1>
        <p className="text-muted-foreground text-sm mt-1">Write, refine, and save prompts that work</p>
      </div>
      <PromptStudio initialTemplates={templates ?? []} userId={user!.id} />
    </div>
  )
}
