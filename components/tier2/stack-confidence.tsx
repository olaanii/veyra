'use client'

import { StackOption } from '@/lib/types'

interface StackConfidenceProps {
  stacks: (StackOption & { confidence_score?: number })[]
  reasoning?: Record<string, string>
}

export function StackConfidence({ stacks, reasoning = {} }: StackConfidenceProps) {
  return (
    <div className="space-y-3">
      {stacks.map((stack) => {
        const confidence = stack.confidence_score || 0
        const getConfidenceColor = (score: number) => {
          if (score >= 80) return 'bg-green-500'
          if (score >= 60) return 'bg-blue-500'
          if (score >= 40) return 'bg-yellow-500'
          return 'bg-red-500'
        }

        return (
          <div key={stack.id} className="p-3 bg-card rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm">{stack.title}</h4>
              {confidence > 0 && (
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">{confidence}%</div>
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${getConfidenceColor(confidence)}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-2">{stack.description}</p>

            {reasoning[stack.id] && (
              <p className="text-xs text-foreground mb-2 p-2 bg-background rounded">{reasoning[stack.id]}</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Risk: </span>
                <span
                  className={`font-semibold ${
                    stack.risk_level === 'low'
                      ? 'text-green-600'
                      : stack.risk_level === 'medium'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {stack.risk_level}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Effort: </span>
                <span className="font-semibold">{stack.estimated_effort}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
