import { ArchitectBuilder } from '@/components/dashboard/architect-builder'

export default function ArchitectPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Architect</h1>
        <p className="text-muted-foreground text-sm mt-1">Decompose your goal into agent-ready steps</p>
      </div>
      <ArchitectBuilder />
    </div>
  )
}
