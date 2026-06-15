import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Battery, Car, Clock, MapPin, QrCode, Square, Zap } from 'lucide-react'

import { MobileSubHeader } from '@/components/mobile/MobileSubHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { getBackPath, useMobileStore, type MobileNavState } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  formatRemainingTime,
  getReservationRemainingMs,
} from '@/mocks/mobile-store'
import { useEffect, useState } from 'react'

export function MobileVehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const backTo = getBackPath(location.state, ROUTES.MOBILE.HOME)
  const backTab = (location.state as MobileNavState | null)?.tab
  const { getVehicle, stopCharging, cancelReservation } = useMobileStore()
  const vehicle = id ? getVehicle(id) : undefined
  const [stopConfirm, setStopConfirm] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)

  useEffect(() => {
    if (!vehicle?.reservationInfo) return
    const tick = () => setRemainingMs(getReservationRemainingMs(vehicle.reservationInfo!.reservedUntil))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [vehicle?.reservationInfo])

  if (!vehicle) {
    return (
      <div className="p-4">
        <MobileSubHeader title="车辆详情" backTo={backTo} />
        <p className="py-8 text-center text-muted-foreground">车辆不存在</p>
      </div>
    )
  }

  const navigateBack = () => {
    navigate(backTo, backTab ? { state: { tab: backTab } } : undefined)
  }

  const handleStop = () => {
    stopCharging(vehicle.id)
    setStopConfirm(false)
    navigateBack()
  }

  const handleCancelReservation = () => {
    if (vehicle.reservationInfo) {
      cancelReservation(vehicle.reservationInfo.reservationId)
    }
    setCancelConfirm(false)
    navigateBack()
  }

  return (
    <div className="pb-6">
      <MobileSubHeader title="车辆详情" backTo={backTo} />

      <div className="mobile-stack p-4">
        <Card className="mobile-block">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                <Car className="size-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{vehicle.plateNumber}</p>
                <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                <p className="text-xs text-muted-foreground">电池容量 {vehicle.batteryCapacityKwh} kWh</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground"><Battery className="size-4" />当前电量</span>
                <span className="font-bold">{Math.round(vehicle.soc)}%</span>
              </div>
              <Progress value={vehicle.soc} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {vehicle.usageStatus === 'charging' && vehicle.chargingInfo ? (
          <>
            <Card className="mobile-block bg-primary/5">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">充电信息</h3>
                  <Badge className="bg-primary/10 text-primary">充电中</Badge>
                </div>
                <InfoRow label="场站" value={vehicle.chargingInfo.stationName} />
                <InfoRow label="充电桩" value={vehicle.chargingInfo.pileName} />
                <InfoRow label="实时功率" value={`${vehicle.chargingInfo.powerKw.toFixed(1)} kW`} icon={Zap} />
                <InfoRow label="已充电量" value={`${vehicle.chargingInfo.energyKwh.toFixed(1)} kWh`} />
                <InfoRow label="当前费用" value={`¥${vehicle.chargingInfo.cost.toFixed(2)}`} />
                <InfoRow label="开始时间" value={vehicle.chargingInfo.startedAt} />
              </CardContent>
            </Card>
            <Button variant="destructive" className="h-12 w-full rounded-xl" onClick={() => setStopConfirm(true)}>
              <Square className="size-4" />停止充电
            </Button>
          </>
        ) : null}

        {vehicle.usageStatus === 'reserved' && vehicle.reservationInfo ? (
          <>
            <Card className="mobile-block bg-amber-500/5">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">预约信息</h3>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600">已预约</Badge>
                </div>
                <InfoRow label="场站" value={vehicle.reservationInfo.stationName} icon={MapPin} />
                <InfoRow label="充电桩" value={vehicle.reservationInfo.pileName} />
                <InfoRow label="剩余有效" value={formatRemainingTime(remainingMs)} icon={Clock} highlight />
              </CardContent>
            </Card>
            <Button variant="outline" className="h-12 w-full rounded-xl" onClick={() => setCancelConfirm(true)}>
              取消预约
            </Button>
          </>
        ) : null}

        {vehicle.usageStatus === 'idle' ? (
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-12 rounded-xl" asChild>
              <Link to={ROUTES.MOBILE.SCAN}><QrCode className="size-4" />扫码充电</Link>
            </Button>
            <Button variant="outline" className="h-12 rounded-xl" asChild>
              <Link to={ROUTES.MOBILE.FIND}><Clock className="size-4" />预约锁桩</Link>
            </Button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={stopConfirm}
        onOpenChange={setStopConfirm}
        title="确认停止充电"
        description="停止后将结束当前充电会话并结算费用，确定要停止吗？"
        confirmLabel="停止充电"
        variant="destructive"
        onConfirm={handleStop}
      />

      <ConfirmDialog
        open={cancelConfirm}
        onOpenChange={setCancelConfirm}
        title="确认取消预约"
        description="取消后锁定的充电桩将被释放，确定要取消预约吗？"
        confirmLabel="取消预约"
        variant="destructive"
        onConfirm={handleCancelReservation}
      />
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string
  icon?: typeof Zap
  highlight?: boolean
}

function InfoRow({ label, value, icon: Icon, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1 text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}{label}
      </span>
      <span className={highlight ? 'font-mono font-bold text-amber-600' : 'font-medium'}>{value}</span>
    </div>
  )
}
