import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DashboardMetric } from '@/types'

interface MetricCardProps {
  metric: DashboardMetric
  className?: string
  borderless?: boolean
}

export function MetricCard({ metric, className, borderless }: MetricCardProps) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus

  return (
    <Card className={cn('admin-card', borderless && 'admin-card--borderless', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[var(--admin-text-muted)]">{metric.label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {metric.value}
          {metric.unit ? <span className="ml-1 text-sm font-normal text-muted-foreground">{metric.unit}</span> : null}
        </div>
        {metric.changePercent !== undefined ? (
          <div className={cn(
            'mt-1 flex items-center gap-1 text-xs',
            metric.trend === 'up' ? 'text-[var(--admin-success)]' : metric.trend === 'down' ? 'text-[var(--admin-danger)]' : 'text-[var(--admin-text-muted)]',
          )}>
            <TrendIcon className="size-3" />
            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}% 较昨日
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
