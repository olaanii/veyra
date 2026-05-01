import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExportPreviewProps {
  content: string
  format: 'markdown' | 'json'
  onDownload?: (filename: string) => void
  isDownloading?: boolean
}

export function ExportPreview({ content, format, onDownload, isDownloading }: ExportPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const filename = `project-spec.${format === 'markdown' ? 'md' : 'json'}`
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      `data:text/${format === 'markdown' ? 'markdown' : 'json'};charset=utf-8,${encodeURIComponent(content)}`,
    )
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    onDownload?.(filename)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 border border-border bg-card max-h-96 overflow-y-auto">
        <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
          {content}
        </pre>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCopy} className="flex-1">
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} className="flex-1">
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </div>
  )
}
