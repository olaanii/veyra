'use client'

import { PromptTemplate } from '@/lib/types'
import { useState } from 'react'

interface TemplateLibraryProps {
  templates: PromptTemplate[]
  onSelectTemplate?: (template: PromptTemplate) => void
}

export function TemplateLibrary({ templates, onSelectTemplate }: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', ...new Set(templates.map((t) => t.category))]
  const filtered = templates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <h3 className="text-sm font-semibold">Prompt Template Library</h3>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filtered.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate?.(template)}
            className="p-3 bg-background rounded border border-border hover:border-primary cursor-pointer transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{template.title}</h4>
                <p className="text-xs text-muted-foreground">{template.category}</p>
              </div>
              <span className="text-xs text-muted-foreground ml-2">{template.usage_count} uses</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{template.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
