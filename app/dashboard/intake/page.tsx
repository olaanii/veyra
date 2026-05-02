'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RequestIntakeForm } from '@/components/dashboard/request-intake-form'
import { ClarifyingQA } from '@/components/dashboard/clarifying-qa'
import { RequirementsDisplay } from '@/components/dashboard/requirements-display'
import { StackRecommendation } from '@/components/dashboard/stack-recommendation'
import { ExportPreview } from '@/components/dashboard/export-preview'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Request, ClarifyingQuestion, Requirement, StackOption, Export } from '@/lib/types'

type Stage = 'intake' | 'clarifying' | 'requirements' | 'stacks' | 'export'

export default function IntakePage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intake')
  const [request, setRequest] = useState<Request | null>(null)
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [stacks, setStacks] = useState<StackOption[]>([])
  const [exportData, setExportData] = useState<Export | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStack, setSelectedStack] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown')

  const handleIntakeSubmit = async (data: {
    title: string
    description: string
    goal?: string
  }) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/intake/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const { request: newRequest } = await res.json()
      setRequest(newRequest)

      // Start clarification workflow
      const clarifyRes = await fetch('/api/intake/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: newRequest.id }),
      })
      const { questions: clarifyQuestions } = await clarifyRes.json()
      setQuestions(
        clarifyQuestions.map((q: any) => ({
          request_id: newRequest.id,
          user_id: '',
          question: q.question,
          category: q.category,
          answer: null,
        })),
      )
      setStage('clarifying')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClarifySubmit = async (answers: Record<string, string>) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/intake/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request?.id, answers }),
      })
      const { requirements: extractedRequirements } = await res.json()
      setRequirements(extractedRequirements || [])
      setStage('requirements')
    } catch (error) {
      console.error('[v0] Error extracting requirements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecommendStack = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/intake/recommend-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request?.id }),
      })
      const { recommendations } = await res.json()

      // Map from stack_recommendations schema to StackOption type
      const stackOptions: StackOption[] = recommendations.map((r: any) => ({
        id: r.id,
        request_id: r.request_id,
        user_id: r.user_id,
        title: r.stack_name,
        description: r.description,
        pros: r.pros,
        cons: r.cons,
        estimated_effort: r.effort_estimate,
        estimated_cost: 'TBD',
        risk_level: r.risk_level,
        recommendation_reason: r.reasoning,
        rank: 1,
        created_at: r.created_at,
      }))

      setStacks(stackOptions)
      if (stackOptions.length > 0) {
        setSelectedStack(stackOptions[0].id)
      }
      setStage('stacks')
    } catch (error) {
      console.error('[v0] Error generating stack recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/intake/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request?.id, format: exportFormat }),
      })
      const { export: exportRecord } = await res.json()
      setExportData(exportRecord)
      setStage('export')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Project Intake</h1>
          <p className="text-muted-foreground">
            Transform vague ideas into clear requirements and tech recommendations
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {(['intake', 'clarifying', 'requirements', 'stacks', 'export'] as const).map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                stage === s
                  ? 'bg-primary'
                  : ['intake', 'clarifying', 'requirements', 'stacks'].includes(s) &&
                      ['intake', 'clarifying', 'requirements', 'stacks', 'export'].indexOf(s) <
                        ['intake', 'clarifying', 'requirements', 'stacks', 'export'].indexOf(stage)
                    ? 'bg-primary/50'
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <Card className="p-6 border border-border">
          {stage === 'intake' && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Describe Your Project</h2>
              <RequestIntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />
            </div>
          )}

          {stage === 'clarifying' && questions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Answer Clarifying Questions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Help us understand your project better by answering these questions.
              </p>
              <ClarifyingQA
                questions={questions.map((q) => ({
                  category: q.category,
                  question: q.question,
                }))}
                onSubmit={handleClarifySubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {stage === 'requirements' && requirements.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Extracted Requirements</h2>
              <RequirementsDisplay requirements={requirements} />
              <Button onClick={handleRecommendStack} disabled={isLoading} className="w-full mt-6">
                {isLoading ? 'Generating...' : 'Get Stack Recommendations'}
              </Button>
            </div>
          )}

          {stage === 'stacks' && stacks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Recommended Tech Stacks</h2>
              <StackRecommendation
                stacks={stacks}
                selectedId={selectedStack || undefined}
                onSelect={(stack) => setSelectedStack(stack.id)}
                onExport={handleExport}
                isExporting={isLoading}
              />
            </div>
          )}

          {stage === 'export' && exportData && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Export Documentation</h2>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={exportFormat === 'markdown' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('markdown')}
                  >
                    Markdown
                  </Button>
                  <Button
                    variant={exportFormat === 'json' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('json')}
                  >
                    JSON
                  </Button>
                </div>
              </div>
              <ExportPreview content={exportData.content} format={exportFormat} />
              <Button onClick={() => router.push('/dashboard')} className="w-full mt-6">
                Back to Dashboard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
