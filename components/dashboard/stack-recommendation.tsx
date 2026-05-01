import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { StackOption } from '@/lib/types'

interface StackRecommendationProps {
  stacks: StackOption[]
  selectedId?: string
  onSelect?: (stack: StackOption) => void
  onExport?: () => void
  isExporting?: boolean
}

export function StackRecommendation({
  stacks,
  selectedId,
  onSelect,
  onExport,
  isExporting,
}: StackRecommendationProps) {
  const riskColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {stacks.map((stack) => (
          <Card
            key={stack.id}
            className={`p-4 border cursor-pointer transition-all ${
              selectedId === stack.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelect?.(stack)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground">{stack.title}</h3>
              <span className={`text-xs font-medium ${riskColor[stack.risk_level]}`}>
                Risk: {stack.risk_level.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{stack.description}</p>

            {stack.recommendation_reason && (
              <p className="text-xs text-primary mb-3 italic">"{stack.recommendation_reason}"</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <p className="text-muted-foreground">Effort</p>
                <p className="font-medium text-foreground">{stack.estimated_effort}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cost</p>
                <p className="font-medium text-foreground">{stack.estimated_cost}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Pros</p>
                <ul className="space-y-1">
                  {stack.pros?.slice(0, 2).map((pro, i) => (
                    <li key={i} className="text-green-400">
                      + {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Cons</p>
                <ul className="space-y-1">
                  {stack.cons?.slice(0, 2).map((con, i) => (
                    <li key={i} className="text-red-400">
                      - {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedId && onExport && (
        <Button onClick={onExport} disabled={isExporting} className="w-full">
          {isExporting ? 'Exporting...' : 'Export as Documentation'}
        </Button>
      )}
    </div>
  )
}
