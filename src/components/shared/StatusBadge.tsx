import { Badge } from '@/components/ui/badge'
import type { DeviceStatus } from '@/types'

const STATUS_CONFIG: Record<DeviceStatus, { label: string; className: string }> = {
  online: { label: '在线', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  charging: { label: '充电中', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  idle: { label: '空闲', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  fault: { label: '故障', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  offline: { label: '离线', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
}

interface DeviceStatusBadgeProps {
  status: DeviceStatus
}

export function DeviceStatusBadge({ status }: DeviceStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={config.className}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {config.label}
    </Badge>
  )
}

interface WorkOrderPriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical'
}

const PRIORITY_CONFIG = {
  low: { label: '低', className: 'bg-gray-500/15 text-gray-400' },
  medium: { label: '中', className: 'bg-yellow-500/15 text-yellow-400' },
  high: { label: '高', className: 'bg-orange-500/15 text-orange-400' },
  critical: { label: '紧急', className: 'bg-red-500/15 text-red-400' },
}

export function WorkOrderPriorityBadge({ priority }: WorkOrderPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

interface ThermalRiskBadgeProps {
  level: 'normal' | 'warning' | 'critical'
}

const RISK_CONFIG = {
  normal: { label: '正常', className: 'bg-green-500/15 text-green-400' },
  warning: { label: '预警', className: 'bg-yellow-500/15 text-yellow-400' },
  critical: { label: '高危', className: 'bg-red-500/15 text-red-400' },
}

export function ThermalRiskBadge({ level }: ThermalRiskBadgeProps) {
  const config = RISK_CONFIG[level]
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}
