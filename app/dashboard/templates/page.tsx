'use client'

import { TemplateLibrary } from '@/components/tier3/template-library'
import { useState, useEffect } from 'react'
import { PromptTemplate } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TemplateLibraryPage() {
  const [ownTemplates, setOwnTemplates] = useState<PromptTemplate[]>([])
  const [publicTemplates, setPublicTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      // Fetch own templates
      const ownRes = await fetch('/api/tier3/prompt-templates')
      if (ownRes.ok) {
        setOwnTemplates(await ownRes.json())
      }

      // Fetch public templates
      const publicRes = await fetch('/api/tier3/prompt-templates?includePublic=true')
      if (publicRes.ok) {
        const allTemplates = await publicRes.json()
        const publicOnly = allTemplates.filter((t: PromptTemplate) => t.is_public && t.user_id !== localStorage.getItem('userId'))
        setPublicTemplates(publicOnly)
      }
    } catch (error) {
      console.error('[v0] Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (templateId: string, isPublic: boolean) => {
    setPublishing({ ...publishing, [templateId]: true })
    try {
      const res = await fetch(`/api/tier3/prompt-templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isPublic ? 'unpublish' : 'publish' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOwnTemplates(ownTemplates.map((t) => (t.id === templateId ? updated.template : t)))
        console.log('[v0] Template', isPublic ? 'unpublished' : 'published:', templateId)
      }
    } catch (error) {
      console.error('[v0] Error publishing template:', error)
    } finally {
      setPublishing({ ...publishing, [templateId]: false })
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Template Library</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create, organize, and share prompt templates. Publish templates to the community or clone public templates for your own use.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
      ) : (
        <Tabs defaultValue="yours" className="space-y-4">
          <TabsList>
            <TabsTrigger value="yours">Your Templates ({ownTemplates.length})</TabsTrigger>
            <TabsTrigger value="public">Public Library ({publicTemplates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="yours" className="space-y-4">
            {ownTemplates.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-sm mb-4">No templates yet. Create one from your sessions or prompts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ownTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-card border border-border rounded-lg flex items-start justify-between hover:border-primary/50 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{template.title}</h3>
                        {template.is_public && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Published
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.category}</p>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {template.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-1">{template.content}</p>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{template.usage_count || 0} uses</span>
                        {template.source_template_id && <span>Cloned from template</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={template.is_public ? 'outline' : 'default'}
                      onClick={() => handlePublish(template.id, template.is_public || false)}
                      disabled={publishing[template.id]}
                      className="ml-4 shrink-0"
                    >
                      {publishing[template.id] ? 'Publishing...' : template.is_public ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="public" className="space-y-4">
            <TemplateLibrary templates={publicTemplates} showPublicOnly={true} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
