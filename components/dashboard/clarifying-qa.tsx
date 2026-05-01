import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ClarifyingQAProps {
  questions: Array<{ category: string; question: string }>
  onSubmit: (answers: Record<string, string>) => void
  isLoading?: boolean
}

export function ClarifyingQA({ questions, onSubmit, isLoading }: ClarifyingQAProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleAnswer = (question: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [question]: answer }))
  }

  const handleSubmit = () => {
    if (Object.keys(answers).length === questions.length) {
      onSubmit(answers)
    }
  }

  const answeredCount = Object.keys(answers).length

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <Card key={idx} className="p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-foreground">{q.question}</h3>
            <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded">
              {q.category}
            </span>
          </div>
          <textarea
            value={answers[q.question] || ''}
            onChange={(e) => handleAnswer(q.question, e.target.value)}
            placeholder="Your answer..."
            rows={2}
            className="w-full px-3 py-2 border border-border rounded bg-input text-foreground text-sm"
          />
        </Card>
      ))}

      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-muted-foreground">
          {answeredCount} of {questions.length} answered
        </span>
        <Button
          onClick={handleSubmit}
          disabled={answeredCount !== questions.length || isLoading}
        >
          {isLoading ? 'Extracting...' : 'Extract Requirements'}
        </Button>
      </div>
    </div>
  )
}
