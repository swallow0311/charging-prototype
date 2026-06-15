import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Battery, Car, FileText, ScanLine, Square, Thermometer, Zap } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useMobileStore } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { VehicleWithStatus } from '@/types'

export function MobileChargingPage() {
  const { chargingVehicles, stopCharging } = useMobileStore()
  const [activeId, setActiveId] = useState<string>(() => chargingVehicles[0]?.id ?? '')
  const [stopConfirm, setStopConfirm] = useState(false)

  useEffect(() => {
    if (chargingVehicles.length === 0) return
    if (!chargingVehicles.some((v) => v.id === activeId)) {
      setActiveId(chargingVehicles[0].id)
    }
  }, [chargingVehicles, activeId])

  const activeVehicle = chargingVehicles.find((v) => v.id === activeId) ?? chargingVehicles[0]
  const info = activeVehicle?.chargingInfo

  if (chargingVehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 pt-20 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted">
          <Zap className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-bold">暂无充电中车辆</h1>
        <p className="text-sm text-muted-foreground">扫码启动充电后，可在此查看实时充电信息</p>
        <Button className="mt-2 rounded-xl" asChild>
          <Link to={ROUTES.MOBILE.SCAN}><ScanLine className="size-4" />去扫码充电</Link>
        </Button>
      </div>
    )
  }

  const handleStop = () => {
    if (activeVehicle) {
      stopCharging(activeVehicle.id)
      setStopConfirm(false)
      const remaining = chargingVehicles.filter((v) => v.id !== activeVehicle.id)
      if (remaining.length > 0) setActiveId(remaining[0].id)
    }
  }

  return (
    <div className="mobile-stack p-4 pb-6">
      <h1 className="text-xl font-bold">充电中</h1>

      {chargingVehicles.length > 1 ? (
        <Tabs value={activeVehicle?.id} onValueChange={setActiveId}>
          <TabsList variant="line" className="mobile-tabs-list grid w-full" style={{ gridTemplateColumns: `repeat(${chargingVehicles.length}, 1fr)` }}>
            {chargingVehicles.map((v) => (
              <TabsTrigger key={v.id} value={v.id} className="mobile-tabs-trigger text-xs">
                {v.plateNumber.slice(-5)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      {activeVehicle && info ? (
        <ChargingVehiclePanel vehicle={activeVehicle} />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="destructive" className="h-12 rounded-xl" onClick={() => setStopConfirm(true)}>
          <Square className="size-4" />停止充电
        </Button>
        <Button variant="outline" className="h-12 rounded-xl" disabled>
          <FileText className="size-4" />充电结束后可开票
        </Button>
      </div>

      <ConfirmDialog
        open={stopConfirm}
        onOpenChange={setStopConfirm}
        title="确认停止充电"
        description={`确定要停止「${activeVehicle?.plateNumber}」的充电吗？停止后将结算当前费用。`}
        confirmLabel="停止充电"
        variant="destructive"
        onConfirm={handleStop}
      />
    </div>
  )
}

interface ChargingVehiclePanelProps {
  vehicle: VehicleWithStatus
}

function ChargingVehiclePanel({ vehicle }: ChargingVehiclePanelProps) {
  const info = vehicle.chargingInfo!
  const soc = Math.round(info.soc)

  return (
    <>
      <Card className="mobile-block overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Car className="size-4 text-primary" />
            <span className="font-medium">{vehicle.plateNumber}</span>
            <Badge variant="secondary" className="text-xs">{vehicle.brand} {vehicle.model}</Badge>
            <Badge className="ml-auto bg-primary/10 text-primary">充电中</Badge>
          </div>
          <div className="relative mx-auto flex size-28 items-center justify-center">
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle
                cx="56" cy="56" r="48" fill="none" stroke="var(--primary)" strokeWidth="7"
                strokeDasharray={`${soc * 3.02} 302`} strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <p className="text-2xl font-bold">{soc}%</p>
              <p className="text-xs text-muted-foreground">SOC</p>
            </div>
          </div>
          <p className="mt-2 text-center font-medium">{info.stationName}</p>
          <p className="text-center text-sm text-muted-foreground">{info.pileName}</p>
        </div>
        <CardContent className="grid grid-cols-2 gap-3 p-4">
          <MetricItem icon={Zap} label="实时功率" value={`${info.powerKw.toFixed(1)} kW`} />
          <MetricItem icon={Thermometer} label="电池温度" value={`${info.batteryTemp.toFixed(0)} °C`} />
          <MetricItem icon={Battery} label="已充电量" value={`${info.energyKwh.toFixed(1)} kWh`} />
          <MetricItem icon={Zap} label="预估剩余" value={`${Math.round(info.estimatedMinutes)} 分钟`} />
        </CardContent>
      </Card>

      <Card className="mobile-block">
        <CardContent className="space-y-3 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">当前费用</span>
            <span className="text-lg font-bold text-primary">¥{info.cost.toFixed(2)}</span>
          </div>
          <Progress value={soc} className="h-2" />
          <p className="text-xs text-muted-foreground">开始时间: {info.startedAt}</p>
        </CardContent>
      </Card>
    </>
  )
}

interface MetricItemProps {
  icon: typeof Zap
  label: string
  value: string
}

function MetricItem({ icon: Icon, label, value }: MetricItemProps) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <Icon className="mx-auto mb-1 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
