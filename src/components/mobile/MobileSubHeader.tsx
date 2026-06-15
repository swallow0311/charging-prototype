import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

interface MobileSubHeaderProps {
  title: string
  backTo?: string
  className?: string
}

export function MobileSubHeader({ title, backTo = '/mobile', className }: MobileSubHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-40 flex items-center gap-3 bg-background/95 px-4 py-3 backdrop-blur-sm', className)}>
      <Link to={backTo} className="flex size-8 items-center justify-center rounded-full hover:bg-muted">
        <ChevronLeft className="size-5" />
      </Link>
      <h1 className="text-base font-semibold">{title}</h1>
    </header>
  )
}
