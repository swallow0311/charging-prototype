import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  formatRemainingTime,
  getReservationRemainingMs,
} from '@/mocks/mobile-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { MobileReservation } from '@/types'

interface ReservationCardProps {
  reservation: MobileReservation
  onCancel: (id: string) => void
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const [remainingMs, setRemainingMs] = useState(0)
  const [cancelOpen, setCancelOpen] = useState(false)
  const isActive = reservation.status === 'active'

  useEffect(() => {
    if (!isActive) return
    const tick = () => setRemainingMs(getReservationRemainingMs(reservation.reservedUntil))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [reservation.reservedUntil, isActive])

  return (
    <>
      <Card className="mobile-block">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{reservation.stationName}</p>
              <p className="text-xs text-muted-foreground">{reservation.pileName}</p>
              {isActive ? (
                <p className="mt-2 flex items-center gap-1 font-mono text-sm font-bold text-amber-600">
                  <Clock className="size-3.5" />
                  剩余 {formatRemainingTime(remainingMs)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  截止 {reservation.reservedUntil.slice(0, 16).replace('T', ' ')}
                </p>
              )}
            </div>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? '生效中' : reservation.status === 'used' ? '已使用' : reservation.status === 'cancelled' ? '已取消' : reservation.status}
            </Badge>
          </div>
          {isActive ? (
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setCancelOpen(true)}>
              取消预约
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="确认取消预约"
        description="取消后锁定的充电桩将被释放，确定要取消吗？"
        confirmLabel="取消预约"
        variant="destructive"
        onConfirm={() => { onCancel(reservation.id); setCancelOpen(false) }}
      />
    </>
  )
}
