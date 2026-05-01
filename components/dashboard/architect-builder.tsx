'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type StepStatus = 'pending' | 'active' | 'done'

interface Step {
  id: string
  title: string
  description: string
  agent: string
  status: StepStatus
  inputs: string[]
  outputs: string[]
}

const AGENT_OPTIONS = [
  'Code Agent',
  'Research Agent',
  'Writer Agent',
  'Analyst Agent',
  'Tester Agent',
  'Orchestrator',
]

const EXAMPLE_GOALS = [
  'Build a REST API with authentication',
  'Analyze customer feedback and generate a report',
  'Refactor a legacy codebase to TypeScript',
  'Create an automated testing suite',
]

export function ArchitectBuilder() {
  const [goal, setGoal] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [generating, setGenerating] = useState(false)
  const [activeStep, setActiveStep] = useState<string | null>(null)

  async function handleDecompose() {
    if (!goal.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      })
      const { steps: newSteps } = await res.json()
      setSteps(newSteps)
      setActiveStep(newSteps[0]?.id ?? null)
    } catch {
      // fallback example
      setSteps(getFallbackSteps(goal))
      setActiveStep('step-1')
    }
    setGenerating(false)
  }

  function updateStep(id: string, updates: Partial<Step>) {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  function addStep() {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      title: 'New step',
      description: '',
      agent: 'Code Agent',
      status: 'pending',
      inputs: [],
      outputs: [],
    }
    setSteps([...steps, newStep])
    setActiveStep(newStep.id)
  }

  function removeStep(id: string) {
    setSteps(steps.filter((s) => s.id !== id))
    if (activeStep === id) setActiveStep(steps[0]?.id ?? null)
  }

  const active = steps.find((s) => s.id === activeStep)

  return (
    <div className="space-y-6">
      {/* Goal input */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Define your goal</h3>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Describe what you want to build or achieve..."
          rows={3}
          className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_GOALS.map((eg) => (
            <button
              key={eg}
              onClick={() => setGoal(eg)}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {eg}
            </button>
          ))}
        </div>
        <Button
          onClick={handleDecompose}
          disabled={generating || !goal.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {generating ? 'Decomposing...' : 'Decompose into steps'}
        </Button>
      </div>

      {steps.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Step pipeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">Pipeline</span>
              <button onClick={addStep} className="text-xs text-primary hover:underline underline-offset-4">+ Add step</button>
            </div>
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-2 group">
                {/* Connector */}
                <div className="flex flex-col items-center shrink-0 mt-1">
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                    step.status === 'done' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                    step.status === 'active' ? 'bg-primary/20 border-primary text-primary' :
                    'bg-muted border-border text-muted-foreground',
                  )}>
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-px h-4 bg-border mt-1" />
                  )}
                </div>
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    'flex-1 text-left px-3 py-2 rounded-md text-xs transition-colors',
                    activeStep === step.id ? 'bg-accent border border-primary/30 text-foreground' : 'hover:bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  <p className="font-medium">{step.title}</p>
                  <p className="text-muted-foreground">{step.agent}</p>
                </button>
              </div>
            ))}
          </div>

          {/* Step editor */}
          {active && (
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Step {steps.findIndex(s => s.id === active.id) + 1}</h3>
                <button onClick={() => removeStep(active.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Remove step
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Step name</label>
                  <input
                    value={active.title}
                    onChange={(e) => updateStep(active.id, { title: e.target.value })}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agent type</label>
                  <select
                    value={active.agent}
                    onChange={(e) => updateStep(active.id, { agent: e.target.value })}
                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground"
                  >
                    {AGENT_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description / Prompt</label>
                <textarea
                  value={active.description}
                  onChange={(e) => updateStep(active.id, { description: e.target.value })}
                  rows={4}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="What should this agent do? Be specific about inputs, process, and expected output."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inputs</label>
                  <InputList
                    items={active.inputs}
                    onChange={(inputs) => updateStep(active.id, { inputs })}
                    placeholder="Add input..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outputs</label>
                  <InputList
                    items={active.outputs}
                    onChange={(outputs) => updateStep(active.id, { outputs })}
                    placeholder="Add output..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                <div className="flex gap-2">
                  {(['pending', 'active', 'done'] as StepStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStep(active.id, { status: s })}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full border transition-colors capitalize',
                        active.status === s ? 'bg-primary/20 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InputList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [val, setVal] = useState('')

  function add() {
    if (!val.trim()) return
    onChange([...items, val.trim()])
    setVal('')
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1 bg-secondary rounded text-xs text-foreground">
          <span className="flex-1 truncate">{item}</span>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">×</button>
        </div>
      ))}
      <div className="flex gap-1">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 bg-input border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button onClick={add} className="text-xs px-2 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">+</button>
      </div>
    </div>
  )
}

function getFallbackSteps(goal: string): Step[] {
  return [
    { id: 'step-1', title: 'Understand & Plan', description: `Analyze the goal: "${goal}". Break it down into requirements and create a plan.`, agent: 'Orchestrator', status: 'active', inputs: ['Goal description'], outputs: ['Requirements doc', 'Task list'] },
    { id: 'step-2', title: 'Implement', description: 'Write the core implementation following the plan.', agent: 'Code Agent', status: 'pending', inputs: ['Requirements doc'], outputs: ['Source code'] },
    { id: 'step-3', title: 'Test & Validate', description: 'Write tests and validate the implementation meets requirements.', agent: 'Tester Agent', status: 'pending', inputs: ['Source code', 'Requirements doc'], outputs: ['Test results', 'Coverage report'] },
    { id: 'step-4', title: 'Document & Deliver', description: 'Write documentation and prepare the final deliverable.', agent: 'Writer Agent', status: 'pending', inputs: ['Source code', 'Test results'], outputs: ['Documentation', 'Final deliverable'] },
  ]
}
