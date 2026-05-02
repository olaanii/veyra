import { createClient } from '@/lib/supabase/server'
import { generateObject } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const RequirementsSchema = z.object({
  requirements: z.array(
    z.object({
      title: z.string().describe('Requirement title'),
      description: z.string().describe('Detailed requirement description'),
      type: z.enum(['functional', 'non-functional', 'constraint']),
      priority: z.enum(['critical', 'high', 'medium', 'low']),
    })
  ),
})

export async function POST(req: NextRequest) {
  try {
    const { requestId, answers } = await req.json()

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

    // Get the request and clarifying questions
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

    // Create a workflow job to track this extract operation
    const { data: job, error: jobError } = await supabase
      .from('workflow_jobs')
      .insert({
        request_id: requestId,
        user_id: user.id,
        job_type: 'extract',
        status: 'running',
        started_at: new Date().toISOString(),
        input_params: { answers },
      })
      .select()
      .single()

    if (jobError) {
      console.error('[v0] Failed to create job:', jobError)
    }

    try {
      // Get all clarifying questions and answers for context
      const { data: clarifyingQs } = await supabase
        .from('clarifying_questions')
        .select('*')
        .eq('request_id', requestId)

      // Build context from questions and answers
      const context = clarifyingQs
        ?.map(q => `Q: ${q.question}\nA: ${answers?.[q.question] || q.answer || 'Not answered'}`)
        .join('\n\n') || ''

      // Generate requirements using Groq
      const { object: result } = await generateObject({
        model: groq('mixtral-8x7b-32768'),
        schema: RequirementsSchema,
        prompt: `Based on the project brief and clarifying answers provided, extract and structure the key requirements:

PROJECT BRIEF:
"${request.brief}"

CLARIFYING Q&A:
${context}

Extract 10-15 concrete, actionable requirements organized by type (functional, non-functional, constraints).
For each requirement, provide a clear title, detailed description, and appropriate priority level.
Ensure requirements are specific to this project and follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound where applicable).`,
      })

      // Save answers to clarifying questions
      if (answers) {
        for (const [questionText, answer] of Object.entries(answers)) {
          const q = clarifyingQs?.find(cq => cq.question === questionText)
          if (q) {
            await supabase
              .from('clarifying_questions')
              .update({ answer: String(answer), answered_at: new Date().toISOString() })
              .eq('id', q.id)
          }
        }
      }

      // Store the extracted requirements
      const { data: requirements, error: insertError } = await supabase
        .from('requirements')
        .insert(
          result.requirements.map((r) => ({
            request_id: requestId,
            user_id: user.id,
            title: r.title,
            description: r.description,
            type: r.type,
            priority: r.priority,
            status: 'active',
          }))
        )
        .select()

      if (insertError) {
        console.error('[v0] Failed to insert requirements:', insertError)
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
          { error: 'Failed to store requirements' },
          { status: 500 }
        )
      }

      // Update request status
      await supabase
        .from('requests')
        .update({ status: 'extracting' })
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
            output_data: { requirements_count: requirements?.length || 0 },
          })
          .eq('id', job.id)
      }

      return NextResponse.json({
        requestId,
        jobId: job?.id,
        requirements: requirements || result.requirements,
        message: 'Requirements extracted successfully',
      })
    } catch (error) {
      console.error('[v0] Error during extraction:', error)
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
    console.error('[v0] Extract endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to extract requirements' },
      { status: 500 }
    )
  }
}
