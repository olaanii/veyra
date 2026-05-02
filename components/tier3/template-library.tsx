'use client'

import { PromptTemplate } from '@/lib/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TemplateLibraryProps {
  templates: PromptTemplate[]
  onSelectTemplate?: (template: PromptTemplate) => void
  showPublicOnly?: boolean
}

export function TemplateLibrary({ templates, onSelectTemplate, showPublicOnly = false }: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cloning, setCloning] = useState<string | null>(null)
  const [localTemplates, setLocalTemplates] = useState<PromptTemplate[]>(templates)

  const categories = ['all', ...new Set(localTemplates.map((t) => t.category))]
  
  const filtered = localTemplates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    const matchesPublic = showPublicOnly ? t.is_public : true
    return matchesSearch && matchesCategory && matchesPublic
  })

  const handleClone = async (template: PromptTemplate) => {
    setCloning(template.id)
    try {
      const res = await fetch(`/api/tier3/prompt-templates/${template.id}/clone`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setLocalTemplates([data.template, ...localTemplates])
        onSelectTemplate?.(data.template)
      }
    } catch (error) {
      console.error('[v0] Error cloning template:', error)
    } finally {
      setCloning(null)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {showPublicOnly ? 'Public Template Library' : 'Your Templates'}
        </h3>
        <span className="text-xs text-muted-foreground">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap transition-colors ${
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
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No templates found
          </div>
        ) : (
          filtered.map((template) => (
            <div
              key={template.id}
              className="p-3 bg-background rounded border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{template.title}</h4>
                    {template.is_public && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{template.category}</p>
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {template.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground mb-2">{template.usage_count || 0} uses</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClone(template)}
                    disabled={cloning === template.id}
                    className="text-xs"
                  >
                    {cloning === template.id ? 'Cloning...' : 'Clone'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{template.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

