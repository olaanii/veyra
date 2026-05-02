'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import type { Request } from '@/lib/types'

interface RequestProgressProps {
  request: Request
  stage: 'intake' | 'clarifying' | 'extracting' | 'recommending' | 'completed'
}

export function RequestProgress({ request, stage }: RequestProgressProps) {
  const [statusText, setStatusText] = useState('')
  const [color, setColor] = useState('bg-blue-100 text-blue-900')

  useEffect(() => {
    const statusMap = {
      intake: { text: 'Intake Phase', color: 'bg-blue-100 text-blue-900' },
      clarifying: { text: 'Clarifying Questions', color: 'bg-amber-100 text-amber-900' },
      extracting: { text: 'Extracting Requirements', color: 'bg-purple-100 text-purple-900' },
      recommending: { text: 'Recommending Stacks', color: 'bg-indigo-100 text-indigo-900' },
      completed: { text: 'Completed', color: 'bg-emerald-100 text-emerald-900' },
    }

    const currentStatus = request.status || stage
    const status = statusMap[currentStatus as keyof typeof statusMap] || statusMap.intake
    setStatusText(status.text)
    setColor(status.color)
  }, [request.status, stage])

  const stages = [
    { id: 'intake', label: 'Intake', status: request.status },
    { id: 'clarifying', label: 'Clarify', status: request.status },
    { id: 'extracting', label: 'Extract', status: request.status },
    { id: 'recommending', label: 'Recommend', status: request.status },
    { id: 'completed', label: 'Complete', status: request.status },
  ]

  const getStageIcon = (stageId: string) => {
    const stageOrder = ['intake', 'clarifying', 'extracting', 'recommending', 'completed']
    const currentIndex = stageOrder.indexOf(request.status || stage)
    const stageIndex = stageOrder.indexOf(stageId)

    if (stageIndex < currentIndex) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    } else if (stageIndex === currentIndex) {
      return <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
    } else {
      return <Circle className="w-5 h-5 text-zinc-300" />
    }
  }

  return (
    <Card className="p-4 border border-border">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Request Status</h3>
            <p className="text-xs text-muted-foreground mt-1">Request ID: {request.id.slice(0, 8)}...</p>
          </div>
          <Badge className={`${color}`}>{statusText}</Badge>
        </div>

        {/* Progress Timeline */}
        <div className="space-y-3">
          {stages.map((s, idx) => (
            <div key={s.id}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStageIcon(s.id)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.id === 'intake' && 'Collect project brief and goals'}
                    {s.id === 'clarifying' && 'Generate clarifying questions based on brief'}
                    {s.id === 'extracting' && 'Extract requirements from answers'}
                    {s.id === 'recommending' && 'Recommend technology stacks'}
                    {s.id === 'completed' && 'Export final documentation'}
                  </div>
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div className="ml-2.5 h-4 border-l border-border ml-1"></div>
              )}
            </div>
          ))}
        </div>

        {/* Workflow Info */}
        {request.workflow_run_id && (
          <div className="border-t border-border pt-3 mt-3">
            <div className="text-xs">
              <div className="text-muted-foreground mb-1">Workflow Run ID:</div>
              <div className="font-mono text-[11px] break-all bg-muted p-2 rounded text-foreground">
                {request.workflow_run_id}
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t border-border pt-3 mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Created</div>
            <div className="text-foreground">
              {new Date(request.created_at).toLocaleDateString()}
            </div>
          </div>
          {request.updated_at && (
            <div>
              <div className="text-muted-foreground">Updated</div>
              <div className="text-foreground">
                {new Date(request.updated_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
