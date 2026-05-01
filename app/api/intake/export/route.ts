import { createClient } from '@/lib/supabase/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { requestId, format } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: request } = await supabase
    .from('requests')
    .select()
    .eq('id', requestId)
    .single()

  if (!request || request.user_id !== user.id) return new Response('Forbidden', { status: 403 })

  const { data: requirements } = await supabase
    .from('requirements')
    .select()
    .eq('request_id', requestId)

  const { data: stacks } = await supabase
    .from('stack_options')
    .select()
    .eq('request_id', requestId)

  let content = ''

  if (format === 'markdown') {
    content = `# ${request.title}

## Overview
${request.description}

${request.goal ? `### Goal\n${request.goal}\n` : ''}

## Requirements
${requirements?.map((r: any) => `- [${r.priority.toUpperCase()}] ${r.title}: ${r.description}`).join('\n') || 'No requirements'}

## Recommended Technology Stacks
${stacks?.map((s: any) => `### ${s.title}\n${s.description}\n\n**Pros:** ${s.pros.join(', ')}\n\n**Cons:** ${s.cons.join(', ')}`).join('\n\n') || 'No stacks'}
`
  } else {
    content = JSON.stringify(
      { request, requirements, stacks },
      null,
      2,
    )
  }

  const { data, error } = await supabase
    .from('exports')
    .insert({ request_id: requestId, user_id: user.id, format, content })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })

  await supabase
    .from('requests')
    .update({ status: 'finalized' })
    .eq('id', requestId)

  return Response.json({ export: data })
}
