'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RequestIntakeForm } from '@/components/dashboard/request-intake-form'
import { ClarifyingQA } from '@/components/dashboard/clarifying-qa'
import { RequirementsDisplay } from '@/components/dashboard/requirements-display'
import { StackRecommendation } from '@/components/dashboard/stack-recommendation'
import { ArchitecturePackage } from '@/components/dashboard/architecture-package'
import { ExportPreview } from '@/components/dashboard/export-preview'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Request, ClarifyingQuestion, Requirement, StackOption, Export, Tables } from '@/lib/types'

type Stage = 'intake' | 'clarifying' | 'requirements' | 'stacks' | 'architecture' | 'export'

export default function IntakePage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intake')
  const [request, setRequest] = useState<Request | null>(null)
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([])
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [stacks, setStacks] = useState<StackOption[]>([])
  const [architecture, setArchitecture] = useState<Tables<'architecture_packages'> | null>(null)
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

  const stages: Record<Stage, { label: string; description: string; stepNumber: number }> = {
    intake: { label: 'Project Brief', description: 'Describe what you want to build', stepNumber: 1 },
    clarifying: { label: 'Clarify', description: 'Answer questions about your project', stepNumber: 2 },
    requirements: { label: 'Requirements', description: 'Review extracted requirements', stepNumber: 3 },
    stacks: { label: 'Tech Stack', description: 'Choose your technology foundation', stepNumber: 4 },
    architecture: { label: 'Architecture', description: 'Review your system design', stepNumber: 5 },
    export: { label: 'Export', description: 'Download complete documentation', stepNumber: 6 },
  }

  const allStages = (['intake', 'clarifying', 'requirements', 'stacks', 'architecture', 'export'] as const)
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

  const handleArchitect = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/intake/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request?.id,
          selectedStackName: stacks.find(s => s.id === selectedStack)?.title,
        }),
      })
      const { architectureId } = await res.json()

      // Fetch the full architecture package
      const archRes = await fetch(`/api/intake/architect?id=${architectureId}`)
      const archData = await archRes.json()
      setArchitecture(archData)
      setStage('architecture')
    } catch (error) {
      console.error('[v0] Error generating architecture:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">Veyra Architecture Workflow</h1>
          <p className="text-sm text-muted-foreground mt-1">Transform your project idea into a complete architecture</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-2 mb-6">
            {allStages.map((s, idx) => {
              const currentIdx = allStages.indexOf(stage)
              const stageData = stages[s]
              const isCompleted = allStages.indexOf(s) < currentIdx
              const isCurrent = s === stage
              
              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full gap-2">
                    {/* Step Circle */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                        isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : isCompleted
                            ? 'bg-primary/20 text-primary'
                            : 'bg-border text-muted-foreground',
                      )}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        stageData.stepNumber
                      )}
                    </div>
                    {/* Connector */}
                    {idx < allStages.length - 1 && (
                      <div
                        className={cn(
                          'flex-1 h-1 transition-all',
                          allStages.indexOf(allStages[idx + 1]) <= currentIdx ? 'bg-primary/30' : 'bg-border',
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-foreground">{stageData.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stageData.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-2">
            <Card className="p-8 border border-border">
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
                onExport={() => {}}
                isExporting={false}
              />
              <Button onClick={handleArchitect} disabled={isLoading || !selectedStack} className="w-full mt-6">
                {isLoading ? 'Generating Architecture...' : 'Generate Architecture Package'}
              </Button>
            </div>
          )}

          {stage === 'architecture' && architecture && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Architecture Package</h2>
              <ArchitecturePackage architecture={architecture} />
              <Button onClick={handleExport} disabled={isLoading} className="w-full mt-6">
                {isLoading ? 'Exporting...' : 'Export Full Documentation'}
              </Button>
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

          {/* Teaching Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Teaching Card */}
              {stage === 'clarifying' && (
                <Card className="p-4 border border-blue-200 bg-blue-50">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Why We Ask Questions</h3>
                  <p className="text-xs text-blue-800">
                    Good clarifying questions help us understand your constraints, priorities, and technical requirements. This leads to better, more tailored architecture recommendations.
                  </p>
                </Card>
              )}

              {stage === 'stacks' && (
                <Card className="p-4 border border-green-200 bg-green-50">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">Stack Selection Tips</h3>
                  <p className="text-xs text-green-800">
                    Each stack comes with pros, cons, and effort estimates. Choose based on your team's expertise and project constraints. You can regenerate stacks if you need different options.
                  </p>
                </Card>
              )}

              {stage === 'architecture' && (
                <Card className="p-4 border border-purple-200 bg-purple-50">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">Architecture Overview</h3>
                  <p className="text-xs text-purple-800">
                    This complete architecture includes component breakdown, implementation tasks for each role, risk assessment, and specialized prompts your team can use immediately.
                  </p>
                </Card>
              )}

              {stage === 'export' && (
                <Card className="p-4 border border-orange-200 bg-orange-50">
                  <h3 className="text-sm font-semibold text-orange-900 mb-2">Exporting Your Work</h3>
                  <p className="text-xs text-orange-800">
                    Export as Markdown for easy sharing, or JSON for integration with other tools. Your tasks have been auto-materialized to the Task Board for your team.
                  </p>
                </Card>
              )}

              {/* Request Info */}
              {request && (
                <Card className="p-4 border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Request Info</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Title</p>
                      <p className="text-foreground font-medium">{request.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="text-foreground font-medium capitalize">{request.status}</p>
                    </div>
                    {architecture && (
                      <div>
                        <p className="text-muted-foreground">Architecture</p>
                        <p className="text-foreground font-medium">{architecture.selected_stack_name}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Quick Help */}
              <Card className="p-4 border border-border bg-card/50">
                <h3 className="text-sm font-semibold text-foreground mb-2">Workflow Stages</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span>Describe your project briefly</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span>Answer AI clarifying questions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span>Review extracted requirements</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <span>Select your tech stack</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">5.</span>
                    <span>Review complete architecture</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">6.</span>
                    <span>Export for your team</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
