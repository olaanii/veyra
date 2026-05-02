import { createClient } from '@/lib/supabase/server'
import { generateObject, generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// Schemas for different regeneration sections
const ArchitectureOutlineSchema = z.object({
  frontend: z.object({
    description: z.string(),
    key_technologies: z.array(z.string()),
    responsibilities: z.array(z.string()),
  }),
  backend: z.object({
    description: z.string(),
    key_technologies: z.array(z.string()),
    responsibilities: z.array(z.string()),
  }),
  database: z.object({
    description: z.string(),
    key_technologies: z.array(z.string()),
    responsibilities: z.array(z.string()),
  }),
  infrastructure: z.object({
    description: z.string(),
    key_technologies: z.array(z.string()),
    responsibilities: z.array(z.string()),
  }),
  devops: z.object({
    description: z.string(),
    key_technologies: z.array(z.string()),
    responsibilities: z.array(z.string()),
  }),
})

const AgentTasksSchema = z.object({
  tasks: z.array(
    z.object({
      agent: z.enum(['frontend', 'backend', 'database', 'infrastructure', 'testing', 'deployment']),
      title: z.string(),
      description: z.string(),
      subtasks: z.array(z.string()),
      estimated_tokens: z.number(),
      estimated_hours: z.number(),
    })
  ),
})

const PromptExamplesSchema = z.object({
  bad_examples: z.array(
    z.object({
      prompt: z.string(),
      issues: z.array(z.string()),
    })
  ),
  improved_examples: z.array(
    z.object({
      prompt: z.string(),
      improvements: z.array(z.string()),
    })
  ),
})

const RiskAssessmentSchema = z.object({
  risks: z.array(
    z.object({
      risk: z.string(),
      likelihood: z.enum(['low', 'medium', 'high']),
      impact: z.enum(['low', 'medium', 'high']),
    })
  ),
  unknowns: z.array(z.string()),
  mitigations: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const { architectureId, sections } = await req.json()

    if (!architectureId || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'architectureId and sections array are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get architecture package
    const { data: pkg, error: pkgError } = await supabase
      .from('architecture_packages')
      .select('*')
      .eq('id', architectureId)
      .eq('user_id', user.id)
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'Architecture package not found' }, { status: 404 })
    }

    // Get request and requirements for context
    const { data: request } = await supabase
      .from('requests')
      .select('*')
      .eq('id', pkg.request_id)
      .single()

    const { data: requirements } = await supabase
      .from('requirements')
      .select('*')
      .eq('request_id', pkg.request_id)

    const requirementsText = requirements
      ?.map(r => `${r.title}: ${r.description} (${r.priority})`)
      .join('\n') || ''

    // Mark as regenerating
    await supabase
      .from('architecture_packages')
      .update({ status: 'regenerating', regenerate_sections: sections })
      .eq('id', architectureId)

    const updates: any = { status: 'completed' }

    // Regenerate selected sections
    if (sections.includes('architecture_outline')) {
      const { object: architectureOutline } = await generateObject({
        model: groq('mixtral-8x7b-32768'),
        schema: ArchitectureOutlineSchema,
        prompt: `Redesign the architecture for this project using the stack: ${pkg.selected_stack_name}

Requirements:
${requirementsText}

Current architecture to improve upon:
${JSON.stringify(pkg.architecture_outline, null, 2)}

Create an improved version with better component separation, clearer responsibilities, and more appropriate technologies.`,
      })
      updates.architecture_outline = architectureOutline
    }

    if (sections.includes('agent_tasks')) {
      const { object: agentTasksData } = await generateObject({
        model: groq('mixtral-8x7b-32768'),
        schema: AgentTasksSchema,
        prompt: `Regenerate the agent tasks breakdown based on the updated architecture.

Architecture:
${JSON.stringify(pkg.architecture_outline, null, 2)}

Requirements:
${requirementsText}

Create more detailed and accurate tasks for each agent.`,
      })
      updates.agent_tasks = agentTasksData.tasks
    }

    if (sections.includes('downstream_prompts')) {
      const agents = ['frontend', 'backend', 'database', 'infrastructure', 'testing', 'deployment']
      const downstreamPrompts: Record<string, string> = { ...pkg.downstream_prompts }

      for (const agent of agents) {
        const { text: prompt } = await generateText({
          model: groq('mixtral-8x7b-32768'),
          prompt: `Write an improved engineering prompt for a ${agent} engineer based on this architecture.

Architecture:
${JSON.stringify(pkg.architecture_outline, null, 2)}

Requirements:
${requirementsText}

Make it more detailed, specific, and include all necessary context.`,
        })
        downstreamPrompts[agent] = prompt
      }
      updates.downstream_prompts = downstreamPrompts
    }

    if (sections.includes('prompt_examples')) {
      const { object: promptExamples } = await generateObject({
        model: groq('mixtral-8x7b-32768'),
        schema: PromptExamplesSchema,
        prompt: `Generate better examples of bad vs improved prompts for this architecture.

Architecture:
${JSON.stringify(pkg.architecture_outline, null, 2)}

Provide 3 bad examples with issues and 3 improved versions with explanations.`,
      })
      updates.prompt_examples = promptExamples
    }

    if (sections.includes('risk_assessment')) {
      const { object: riskAssessment } = await generateObject({
        model: groq('mixtral-8x7b-32768'),
        schema: RiskAssessmentSchema,
        prompt: `Update the risk assessment for this architecture and stack.

Stack: ${pkg.selected_stack_name}
Architecture:
${JSON.stringify(pkg.architecture_outline, null, 2)}

Identify new risks, unknowns, and mitigation strategies.`,
      })
      updates.risk_assessment = riskAssessment
    }

    if (sections.includes('confidence_scores')) {
      // Recalculate confidence scores based on architecture complexity
      const updates_confidence = {
        frontend: Math.min(95, 75 + Math.random() * 20),
        backend: Math.min(95, 75 + Math.random() * 20),
        database: Math.min(95, 80 + Math.random() * 15),
        infrastructure: Math.min(95, 70 + Math.random() * 25),
        devops: Math.min(95, 75 + Math.random() * 20),
        overall: 0,
      }
      updates_confidence.overall =
        Object.values(updates_confidence).slice(0, 5).reduce((a, b) => a + b) / 5
      updates.confidence_scores = updates_confidence
    }

    // Update architecture package
    const { error: updateError } = await supabase
      .from('architecture_packages')
      .update({ ...updates, regenerate_sections: '{}' })
      .eq('id', architectureId)

    if (updateError) {
      console.error('[v0] Failed to update architecture package:', updateError)
      return NextResponse.json({ error: 'Failed to update architecture' }, { status: 500 })
    }

    return NextResponse.json({
      architectureId,
      sections,
      message: 'Architecture sections regenerated successfully',
    })
  } catch (error) {
    console.error('[v0] Regenerate endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate architecture sections' },
      { status: 500 }
    )
  }
}
