import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Requirement } from '@/lib/types'

interface RequirementsDisplayProps {
  requirements: Requirement[]
  onEdit?: (requirement: Requirement) => void
}

export function RequirementsDisplay({ requirements, onEdit }: RequirementsDisplayProps) {
  const grouped = requirements.reduce(
    (acc, req) => {
      if (!acc[req.category]) acc[req.category] = []
      acc[req.category].push(req)
      return acc
    },
    {} as Record<string, Requirement[]>,
  )

  const priorityColor = {
    low: 'bg-blue-500/20 text-blue-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    high: 'bg-orange-500/20 text-orange-300',
    critical: 'bg-red-500/20 text-red-300',
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, reqs]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">{category}</h3>
          <div className="space-y-2">
            {reqs.map((req) => (
              <Card
                key={req.id}
                className="p-3 border border-border hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => onEdit?.(req)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{req.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                  </div>
                  <Badge className={priorityColor[req.priority as keyof typeof priorityColor]}>
                    {req.priority}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
