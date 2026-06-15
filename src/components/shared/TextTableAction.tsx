import { cn } from '@/lib/utils'

interface TextTableActionProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export function TextTableAction({ label, onClick, variant: _variant = 'default', disabled }: TextTableActionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'admin-table-action inline-flex items-center rounded px-1.5 py-0.5 text-xs transition-colors duration-150',
        'text-[var(--admin-primary)] hover:text-[var(--admin-primary-hover)]',
        'hover:bg-[var(--admin-selected-bg)] hover:underline underline-offset-2',
        'disabled:pointer-events-none disabled:opacity-40',
      )}
    >
      {label}
    </button>
  )
}
