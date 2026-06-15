import { HelpCircle } from 'lucide-react'

import { AI_DISPATCH_PIPELINE } from '@/mocks/ai-dispatch-mock'
import { cn } from '@/lib/utils'

export function DispatchPipelineHelp({ className }: { className?: string }) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      <button
        type="button"
        className="flex size-5 items-center justify-center rounded-full text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-primary)]"
        aria-label="查看调度执行链路"
      >
        <HelpCircle className="size-4" />
      </button>
      <div
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-[min(520px,calc(100vw-3rem))] opacity-0 shadow-none transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100"
        role="tooltip"
      >
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-lg">
          <p className="mb-3 text-sm font-semibold text-[var(--admin-text-title)]">调度执行链路</p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {AI_DISPATCH_PIPELINE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-md bg-[var(--admin-selected-bg)] px-2.5 py-1 text-[var(--admin-primary)]">
                  {step}
                </span>
                {i < AI_DISPATCH_PIPELINE.length - 1 ? (
                  <span className="text-[var(--admin-text-muted)]">→</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
