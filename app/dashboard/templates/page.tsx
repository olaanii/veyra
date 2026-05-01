'use client'

import { TemplateLibrary } from '@/components/tier3/template-library'
import { useState, useEffect } from 'react'
import { PromptTemplate } from '@/lib/types'

export default function TemplateLibraryPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/tier3/prompt-templates')
        if (res.ok) {
          setTemplates(await res.json())
        }
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Template Library</h1>
        <p className="text-muted-foreground">Browse and reuse community prompts</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
      ) : (
        <TemplateLibrary templates={templates} />
      )}
    </div>
  )
}
