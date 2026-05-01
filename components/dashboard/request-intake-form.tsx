import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RequestIntakeFormProps {
  onSubmit: (data: { title: string; description: string; goal?: string }) => void
  isLoading?: boolean
}

export function RequestIntakeForm({ onSubmit, isLoading }: RequestIntakeFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && description) {
      onSubmit({ title, description, goal: goal || undefined })
      setTitle('')
      setDescription('')
      setGoal('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Project Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., AI-powered content recommendation engine"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Project Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project in detail..."
          required
          rows={5}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Primary Goal (optional)
        </label>
        <Input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Increase user engagement by 40%"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Start Intake Process'}
      </Button>
    </form>
  )
}
