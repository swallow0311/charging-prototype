import { Link } from 'react-router-dom'
import { Battery, Car, ChevronRight, Clock, Zap } from 'lucide-react'

import { ROUTES } from '@/constants/routes'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { VehicleUsageStatus, VehicleWithStatus } from '@/types'

const STATUS_CONFIG: Record<VehicleUsageStatus, { label: string; className: string }> = {
  charging: { label: '充电中', className: 'bg-primary/10 text-primary' },
  reserved: { label: '已预约', className: 'bg-amber-500/10 text-amber-600' },
  idle: { label: '待充电', className: 'bg-muted text-muted-foreground' },
}

interface VehicleStatusPanelProps {
  vehicles: VehicleWithStatus[]
}

export function VehicleStatusPanel({ vehicles }: VehicleStatusPanelProps) {
  return (
    <div className="mobile-stack">
      <h2 className="text-sm font-medium text-muted-foreground">我的车辆</h2>
      <div className="mobile-stack">
        {vehicles.map((vehicle) => (
          <VehicleStatusCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  )
}

interface VehicleStatusCardProps {
  vehicle: VehicleWithStatus
}

function VehicleStatusCard({ vehicle }: VehicleStatusCardProps) {
  const status = STATUS_CONFIG[vehicle.usageStatus]

  return (
    <Link to={ROUTES.MOBILE.vehicle(vehicle.id)}>
      <Card className="mobile-block">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Car className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{vehicle.plateNumber}</p>
                <Badge variant="outline" className={status.className}>{status.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Battery className="size-3" />电量
              </span>
              <span className="font-medium">{Math.round(vehicle.soc)}%</span>
            </div>
            <Progress value={vehicle.soc} className="h-1.5" />
          </div>

          {vehicle.usageStatus === 'charging' && vehicle.chargingInfo ? (
            <div className="mt-3 flex items-center gap-4 rounded-lg bg-primary/5 px-3 py-2 text-xs">
              <span className="flex items-center gap-1 text-primary">
                <Zap className="size-3" />{vehicle.chargingInfo.powerKw.toFixed(1)} kW
              </span>
              <span className="text-muted-foreground">{vehicle.chargingInfo.stationName}</span>
            </div>
          ) : null}

          {vehicle.usageStatus === 'reserved' && vehicle.reservationInfo ? (
            <div className="mt-3 flex items-center gap-1 rounded-lg bg-amber-500/5 px-3 py-2 text-xs text-amber-700">
              <Clock className="size-3" />
              {vehicle.reservationInfo.pileName} · {vehicle.reservationInfo.stationName}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
