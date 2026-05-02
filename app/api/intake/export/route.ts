import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { requestId, format } = await req.json()
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: request, error: reqError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .eq('user_id', user.id)
      .single()

    if (reqError || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { data: requirements } = await supabase
      .from('requirements')
      .select('*')
      .eq('request_id', requestId)

    const { data: architecture } = await supabase
      .from('architecture_packages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(1)

    let content = ''

    if (format === 'markdown') {
      content = `# ${request.title}

## Overview
${request.description}

${request.goal ? `### Goal\n${request.goal}\n` : ''}

## Requirements

${
  requirements && requirements.length > 0
    ? `| # | Title | Priority | Type | Description |
|---|-------|----------|------|-------------|
${requirements
  .map(
    (r: any, i: number) =>
      `| ${i + 1} | ${r.title} | \`${r.priority}\` | \`${r.type}\` | ${r.description.substring(0, 60)}${r.description.length > 60 ? '...' : ''} |`,
  )
  .join('\n')}

### Detailed Requirements

${requirements
  .map(
    (r: any) => `#### ${r.title}

- **Priority:** \`${r.priority}\`  
- **Type:** \`${r.type}\`  
- **Status:** \`${r.status || 'active'}\`

${r.description}`,
  )
  .join('\n\n')}`
    : '> No requirements extracted yet.'
}

## Architecture Package
${
  architecture
    ? `
### Selected Stack
**${architecture.selected_stack_name}**

### Requirements Summary
${architecture.requirements_summary || 'No summary available'}

### Architecture Outline

${
  architecture.architecture_outline
    ? Object.entries(architecture.architecture_outline)
        .map(([component, details]: [string, any]) => {
          return `#### ${component.charAt(0).toUpperCase() + component.slice(1)}
${details.description}

**Technologies:** ${details.key_technologies?.join(', ') || 'N/A'}

**Responsibilities:**
${details.responsibilities?.map((r: string) => `- ${r}`).join('\n') || '- N/A'}`
        })
        .join('\n\n')
    : 'No architecture outline'
}

### Agent Tasks & Implementation Plan

${
  architecture.agent_tasks
    ? (architecture.agent_tasks as any[])
        .map(
          (task: any) => `#### ${task.agent.charAt(0).toUpperCase() + task.agent.slice(1)} - ${task.title}
${task.description}

**Subtasks:**
${(task.subtasks || []).map((st: string) => `- ${st}`).join('\n')}

**Estimates:** ${task.estimated_hours} hours, ~${task.estimated_tokens} tokens`,
        )
        .join('\n\n')
    : 'No tasks'
}

### Downstream Prompts

${
  architecture.downstream_prompts
    ? Object.entries(architecture.downstream_prompts)
        .filter(([, prompt]: [string, any]) => prompt && prompt.length > 0)
        .map(
          ([agent, prompt]: [string, any]) =>
            `#### ${agent.charAt(0).toUpperCase() + agent.slice(1)} Engineer Prompt\n\`\`\`\n${prompt}\n\`\`\``,
        )
        .join('\n\n')
    : 'No prompts'
}

### Risk Assessment

> **⚠️ Important:** Review these identified risks and mitigations before implementation begins.

${
  architecture.risk_assessment
    ? `
#### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
${(architecture.risk_assessment as any).risks
  ?.map(
    (r: any) =>
      `| ${r.risk} | ${r.likelihood} | ${r.impact} | See mitigations below |`,
  )
  .join('\n') || '| No risks identified | - | - | - |'}

#### Unknowns & Assumptions

${(architecture.risk_assessment as any).unknowns?.length > 0
  ? (architecture.risk_assessment as any).unknowns
      .map((u: string) => `- ❓ ${u}`)
      .join('\n')
  : '- No major unknowns identified'}

#### Mitigation Strategies

${(architecture.risk_assessment as any).mitigations?.length > 0
  ? (architecture.risk_assessment as any).mitigations
      .map((m: string) => `- ✅ ${m}`)
      .join('\n')
  : '- Standard best practices and monitoring'}
`
    : '> No risk assessment available.'
}

### Estimates & Costs

| Metric | Value |
|--------|-------|
| Total Tokens | ${(architecture.estimates as any)?.total_tokens || 0} |
| Estimated Cost | \$${(architecture.estimates as any)?.estimated_cost || '0'} |

> **Reasoning:** ${(architecture.estimates as any)?.reasoning || 'Based on complexity and model usage'}

### Confidence Scores

${
  architecture.confidence_scores
    ? Object.entries(architecture.confidence_scores)
        .map(([component, score]: [string, any]) => `- ${component}: ${Math.round(score)}%`)
        .join('\n')
    : 'N/A'
}

### Prompt Strategy & Teaching Examples

#### Why Prompt Quality Matters

Effective prompts are crucial to AI success. Below are real examples from your project showing what to avoid and what works well.

#### Bad Approaches to Avoid

${
  architecture.prompt_examples && (architecture.prompt_examples as any).bad_examples && (architecture.prompt_examples as any).bad_examples.length > 0
    ? (architecture.prompt_examples as any).bad_examples
        .map((ex: any) => {
          const prompt = ex.prompt ? `\`\`\`\n${ex.prompt}\n\`\`\`` : ''
          const issues = ex.issues?.length > 0
            ? `\n\n**Issues:**\n${ex.issues.map((i: string) => `- ${i}`).join('\n')}`
            : ''
          const score = ex.score ? `\n\n**Effectiveness:** ${Math.round(ex.score)}%` : ''
          return `##### ❌ Anti-pattern\n${prompt}${issues}${score}`
        })
        .join('\n\n')
    : 'No examples'
}

#### Improved Approaches (Recommended)

${
  architecture.prompt_examples && (architecture.prompt_examples as any).improved_examples && (architecture.prompt_examples as any).improved_examples.length > 0
    ? (architecture.prompt_examples as any).improved_examples
        .map((ex: any) => {
          const prompt = ex.prompt ? `\`\`\`\n${ex.prompt}\n\`\`\`` : ''
          const improvements = ex.improvements?.length > 0
            ? `\n\n**Improvements:**\n${ex.improvements.map((i: string) => `- ${i}`).join('\n')}`
            : ''
          const score = ex.score ? `\n\n**Effectiveness:** ${Math.round(ex.score)}%` : ''
          return `##### ✅ Best Practice\n${prompt}${improvements}${score}`
        })
        .join('\n\n')
    : 'No examples'
}

#### Downstream Prompts by Agent Role

Below are the tailored prompts for each team member implementing your architecture:

${
  architecture.downstream_prompts
    ? Object.entries(architecture.downstream_prompts)
        .filter(([, prompt]: [string, any]) => prompt && prompt.length > 0)
        .map(
          ([agent, prompt]: [string, any]) => `
##### ${agent.charAt(0).toUpperCase() + agent.slice(1)} Engineer

\`\`\`
${prompt}
\`\`\`
`,
        )
        .join('\n')
    : ''
}
`
    : '## No Architecture Package Generated\nPlease complete the architecture generation step.'
}

---

*Generated by Veyra on ${new Date().toISOString()}*
`
    } else {
      content = JSON.stringify(
        {
          request,
          requirements,
          architecture,
        },
        null,
        2,
      )
    }

    const { data, error } = await supabase
      .from('exports')
      .insert({
        request_id: requestId,
        user_id: user.id,
        format,
        content,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Export error:', error)
      return NextResponse.json({ error: 'Failed to create export' }, { status: 500 })
    }

    await supabase
      .from('requests')
      .update({ status: 'finalized' })
      .eq('id', requestId)

    return NextResponse.json({ export: data })
  } catch (error) {
    console.error('[v0] Export endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}
