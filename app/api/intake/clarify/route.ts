import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const ClarifyingQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('A clarifying question about the project'),
      category: z.enum(['scope', 'users', 'performance', 'security', 'integration', 'timeline']),
      priority: z.number().min(1).max(5).describe('Priority from 1-5, 5 being highest'),
    })
  ),
})

export async function POST(req: NextRequest) {
  try {
    const { requestId } = await req.json()

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the request to understand the project brief
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (requestError || !request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Create a workflow job to track this clarify operation
    const { data: job, error: jobError } = await supabase
      .from('workflow_jobs')
      .insert({
        request_id: requestId,
        user_id: user.id,
        job_type: 'clarify',
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      console.error('[v0] Failed to create job:', jobError)
    }

    try {
      // Generate clarifying questions using Groq
      const { object: result } = await generateObject({
        model: groq('mixtral-8x7b-32768'),
        schema: ClarifyingQuestionsSchema,
        prompt: `Based on this project brief, generate 5-7 clarifying questions that would help better understand the project scope, requirements, and constraints:

"${request.brief}"

Generate questions that cover: scope, users/personas, performance requirements, security, integrations, and timeline.
Make questions specific to the project context, not generic.`,
      })

      // Store the generated questions in the database
      const { data: questions, error: insertError } = await supabase
        .from('clarifying_questions')
        .insert(
          result.questions.map((q) => ({
            request_id: requestId,
            user_id: user.id,
            question: q.question,
            category: q.category,
            priority: q.priority,
          }))
        )
        .select()

      if (insertError) {
        console.error('[v0] Failed to insert clarifying questions:', insertError)
        // Update job to failed
        if (job) {
          await supabase
            .from('workflow_jobs')
            .update({
              status: 'failed',
              error_message: insertError.message,
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id)
        }
        return NextResponse.json(
          { error: 'Failed to store questions' },
          { status: 500 }
        )
      }

      // Update request status to 'waiting_for_clarification'
      await supabase
        .from('requests')
        .update({ status: 'waiting_for_clarification' })
        .eq('id', requestId)

      // Mark job as completed
      if (job) {
        const duration = new Date().getTime() - new Date(job.started_at as string).getTime()
        await supabase
          .from('workflow_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            output_data: { questions_count: questions?.length || 0 },
          })
          .eq('id', job.id)
      }

      return NextResponse.json({
        requestId,
        jobId: job?.id,
        questions: questions || result.questions,
        message: 'Clarifying questions generated successfully',
      })
    } catch (error) {
      console.error('[v0] Error during clarification:', error)
      // Mark job as failed
      if (job) {
        await supabase
          .from('workflow_jobs')
          .update({
            status: 'failed',
            error_message: String(error),
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id)
      }
      throw error
    }
  } catch (error) {
    console.error('[v0] Clarify endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to generate clarifying questions' },
      { status: 500 }
    )
  }
}
