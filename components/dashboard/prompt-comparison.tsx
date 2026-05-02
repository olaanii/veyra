'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

interface Example {
  prompt?: string
  issues?: string[]
  improvements?: string[]
  score?: number
}

interface PromptComparisonProps {
  badExamples?: Example[]
  improvedExamples?: Example[]
  onRegenerate?: () => void
}

export function PromptComparison({
  badExamples = [],
  improvedExamples = [],
  onRegenerate,
}: PromptComparisonProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Prompt Strategy & Teaching Examples</h3>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bad Examples */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold text-foreground">❌ Bad Approaches (to avoid)</h4>
          </div>

          <div className="space-y-3">
            {badExamples.length > 0 ? (
              badExamples.map((example, idx) => (
                <Card key={idx} className="p-4 border-destructive/20 bg-destructive/5">
                  <div className="space-y-2">
                    {example.prompt && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Prompt:</p>
                        <code className="text-xs bg-background p-2 rounded block overflow-auto max-h-24 text-foreground">
                          {example.prompt}
                        </code>
                      </div>
                    )}

                    {example.issues && example.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Issues:</p>
                        <ul className="text-xs space-y-1">
                          {example.issues.map((issue, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-destructive">•</span>
                              <span className="text-foreground">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {example.score && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Effectiveness:</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(example.score)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 text-center text-sm text-muted-foreground bg-muted/20">
                No bad examples available
              </Card>
            )}
          </div>
        </div>

        {/* Improved Examples */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-foreground">✅ Improved Approaches (recommended)</h4>
          </div>

          <div className="space-y-3">
            {improvedExamples.length > 0 ? (
              improvedExamples.map((example, idx) => (
                <Card key={idx} className="p-4 border-emerald-600/20 bg-emerald-50/5">
                  <div className="space-y-2">
                    {example.prompt && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Prompt:</p>
                        <code className="text-xs bg-background p-2 rounded block overflow-auto max-h-24 text-foreground">
                          {example.prompt}
                        </code>
                      </div>
                    )}

                    {example.improvements && example.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Improvements:</p>
                        <ul className="text-xs space-y-1">
                          {example.improvements.map((improvement, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-emerald-600">+</span>
                              <span className="text-foreground">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {example.score && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground">Effectiveness:</span>
                        <Badge className="text-xs bg-emerald-600/20 text-emerald-700">
                          {Math.round(example.score)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 text-center text-sm text-muted-foreground bg-muted/20">
                No improved examples available
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {badExamples.length > 0 && improvedExamples.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-foreground">
            <strong>Teaching Insight:</strong> Compare the approaches above to understand what makes prompts effective. 
            The improved examples follow best practices for clarity, specificity, and structure that lead to better AI outputs.
          </p>
        </Card>
      )}
    </div>
  )
}
