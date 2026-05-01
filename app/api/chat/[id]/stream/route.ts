import { createUIMessageStreamResponse } from 'ai'
import { getRun } from 'workflow/api'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const startIndexParam = searchParams.get('startIndex')
  const startIndex = startIndexParam ? parseInt(startIndexParam, 10) : undefined

  const run = getRun(id)
  const readable = run.getReadable({ startIndex })

  return createUIMessageStreamResponse({
    stream: readable,
    headers: {
      'x-workflow-run-id': id,
      'x-workflow-stream-tail-index': String(readable.getTailIndex()),
    },
  })
}
