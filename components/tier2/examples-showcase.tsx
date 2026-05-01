'use client'

import { useState } from 'react'

interface ExamplesShowcaseProps {
  category: 'good' | 'bad'
}

const GOOD_EXAMPLES = [
  {
    title: 'API Request Prompt',
    description: 'Clear specification with constraints and format',
    content: `You are an API documentation generator. Given a function signature, generate OpenAPI spec.

Input format:
- Function name
- Parameters with types
- Return type

Requirements:
- Generate valid OpenAPI 3.0 JSON
- Include descriptions for each field
- Handle optional parameters

Return ONLY valid JSON, no commentary.`,
  },
  {
    title: 'Code Review Prompt',
    description: 'Specific role with detailed criteria',
    content: `You are a senior code reviewer specializing in React performance.

Review the following code for:
1. Unnecessary re-renders
2. Hook violations
3. Memory leaks
4. TypeScript errors

Provide:
- Issue location (line number)
- Severity (critical/warning/info)
- Suggested fix
- Explanation`,
  },
]

const BAD_EXAMPLES = [
  {
    title: 'Vague Query',
    description: 'Lacks context and clear intent',
    content: `Fix this code. It\'s not working.

const Component = () => {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  })
  return <div>{JSON.stringify(data)}</div>
}`,
  },
  {
    title: 'Over-specified',
    description: 'Too many irrelevant constraints',
    content: `Please write me a function that:
1. Takes an input
2. Does something
3. Returns output
4. Must be written on a Tuesday
5. Should be blue colored
6. Can\'t use the letter Q
7. Should make the code team happy`,
  },
]

export function ExamplesShowcase({ category }: ExamplesShowcaseProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const examples = category === 'good' ? GOOD_EXAMPLES : BAD_EXAMPLES

  const current = examples[selectedIndex]

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`px-3 py-1 rounded text-sm ${
              i === selectedIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {ex.title}
          </button>
        ))}
      </div>

      <div className="p-4 bg-card rounded-lg border border-border space-y-3">
        <div>
          <h3 className="font-semibold text-sm">{current.title}</h3>
          <p className="text-xs text-muted-foreground">{current.description}</p>
        </div>

        <pre className="bg-background p-3 rounded text-xs overflow-x-auto border border-border">
          <code>{current.content}</code>
        </pre>

        <div className={`text-xs p-2 rounded ${category === 'good' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
          {category === 'good' ? '✓ This prompt is effective because:' : '✗ This prompt fails because:'}
          <ul className="mt-1 ml-3 list-disc space-y-0.5">
            {category === 'good'
              ? [
                  'Clear input/output format',
                  'Specific constraints listed',
                  'Unambiguous success criteria',
                  'No irrelevant details',
                ]
              : [
                  'Vague problem statement',
                  'No context provided',
                  'Unrelated constraints mixed in',
                  'Ambiguous success criteria',
                ]}
              .map((point, i) => (
                <li key={i}>{point}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
