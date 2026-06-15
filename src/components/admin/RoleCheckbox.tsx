import { cn } from '@/lib/utils'

interface RoleCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function RoleCheckbox({ checked, onCheckedChange, className }: RoleCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={cn(
        'size-4 rounded border border-[var(--admin-border)] accent-[var(--admin-primary)]',
        'cursor-pointer transition-shadow hover:ring-2 hover:ring-[var(--admin-selected-bg)]',
        className,
      )}
    />
  )
}
