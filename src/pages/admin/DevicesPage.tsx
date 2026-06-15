import { useState } from 'react'
import {
  Activity, Cpu, MapPin, Power, RotateCcw,
  Square, Thermometer, Upload, Zap,
} from 'lucide-react'

import { DeviceStatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { ThermalRiskBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDeviceRealtimeStream } from '@/mocks/hooks'
import {
  DEVICE_TYPE_LABEL, getBmsLogs, getDeviceHistory, MOCK_DEVICES,
} from '@/mocks/admin-data'
import type { ChargingDevice } from '@/types'
import type { TableColumn } from '@/types'

export function AdminDevicesPage() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_DEVICES[0]?.id ?? '')
  const [stopTarget, setStopTarget] = useState<ChargingDevice | null>(null)
  const [otaTarget, setOtaTarget] = useState<ChargingDevice | null>(null)
  const stream = useDeviceRealtimeStream(selectedId || null)
  const selected = MOCK_DEVICES.find((d) => d.id === selectedId)
  const history = selected ? getDeviceHistory(selected.id) : []
  const bmsLogs = selected ? getBmsLogs(selected.id) : []

  const columns: TableColumn<ChargingDevice>[] = [
    { key: 'deviceCode', title: '设备编号' },
    {
      key: 'deviceType', title: '类型', width: '88px',
      render: (r) => DEVICE_TYPE_LABEL[r.deviceType],
    },
    { key: 'powerKw', title: '功率', render: (r) => `${r.powerKw} kW`, width: '72px' },
    {
      key: 'status', title: '在线状态', width: '88px',
      render: (r) => <DeviceStatusBadge status={r.status} />,
    },
    {
      key: 'faultTags', title: '故障标签',
      render: (r) => r.faultTags.length > 0
        ? r.faultTags.map((t) => <Badge key={t} variant="destructive" className="mr-1 text-xs">{t}</Badge>)
        : <span className="text-xs text-muted-foreground">—</span>,
    },
    { key: 'stationName', title: '所属场站' },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <DataTable
            data={MOCK_DEVICES} columns={columns}
            searchPlaceholder="搜索设备编号或场站..." searchKeys={['deviceCode', 'name', 'stationName']}
            filterKey="status" filterOptions={[
              { label: '在线', value: 'online' }, { label: '充电中', value: 'charging' },
              { label: '故障', value: 'fault' }, { label: '离线', value: 'offline' },
            ]}
            selectedRowId={selectedId} onRowClick={(row) => setSelectedId(row.id)}
          />
        </div>

        <Card className="admin-card">
          <CardHeader className="border-b border-[var(--admin-border)] pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="size-4 text-primary" />单桩详情
            </CardTitle>
            <p className="text-sm text-muted-foreground">{selected?.deviceCode ?? '请选择设备'}</p>
          </CardHeader>
          <CardContent className="pt-4">
            {selected ? (
              <Tabs defaultValue="realtime">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="realtime" className="text-xs">实时</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">历史</TabsTrigger>
                  <TabsTrigger value="control" className="text-xs">控制</TabsTrigger>
                  <TabsTrigger value="bms" className="text-xs">BMS</TabsTrigger>
                </TabsList>

                <TabsContent value="realtime" className="mt-4">
                  <div className="admin-card mb-3 space-y-1 p-3 text-sm">
                    <p className="font-medium">{selected.name}</p>
                    <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-3" />{selected.stationName}</p>
                    <div className="flex gap-2 pt-1">
                      <DeviceStatusBadge status={selected.status} />
                      <Badge variant="outline">{DEVICE_TYPE_LABEL[selected.deviceType]}</Badge>
                    </div>
                  </div>
                  {stream ? (
                    <ScrollArea className="h-[320px]">
                      <div className="space-y-2">
                        <Metric icon={Zap} label="实时功率" value={`${stream.powerKw.toFixed(1)} kW`} />
                        <Metric icon={Power} label="电压" value={`${stream.voltage.toFixed(0)} V`} />
                        <Metric icon={Activity} label="电流" value={`${stream.current.toFixed(1)} A`} />
                        <Metric icon={Thermometer} label="电池温度" value={`${stream.temperature.toFixed(1)} °C`} />
                        {stream.soc !== undefined ? <Metric icon={Zap} label="SOC" value={`${stream.soc.toFixed(1)}%`} /> : null}
                        <p className="animate-pulse pt-2 text-xs text-primary">● 实时推送中 · {new Date(stream.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </ScrollArea>
                  ) : null}
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <ScrollArea className="h-[360px]">
                    {history.length > 0 ? history.map((h) => (
                      <div key={h.id} className="mb-2 rounded-md bg-[var(--admin-hover-bg)] p-3 text-sm">
                        <div className="flex justify-between"><span className="font-medium">{h.plateNumber}</span><span>{h.energyKwh} kWh</span></div>
                        <p className="text-xs text-muted-foreground">{h.startedAt} · {h.duration} · ¥{h.amount}</p>
                      </div>
                    )) : <p className="py-8 text-center text-sm text-muted-foreground">暂无充电记录</p>}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="control" className="mt-4 space-y-2">
                  <ControlBtn icon={Square} label="远程停机" variant="destructive" disabled={selected.status !== 'charging'} onClick={() => setStopTarget(selected)} />
                  <ControlBtn icon={RotateCcw} label="远程重启" onClick={() => {}} />
                  <ControlBtn icon={Upload} label="OTA 升级" onClick={() => setOtaTarget(selected)} />
                  <p className="pt-2 text-xs text-muted-foreground">固件: {selected.firmwareVersion} · 累计 {selected.totalEnergyKwh.toLocaleString()} kWh</p>
                </TabsContent>

                <TabsContent value="bms" className="mt-4">
                  <ScrollArea className="h-[360px]">
                    {bmsLogs.length > 0 ? bmsLogs.map((log) => (
                      <div key={log.id} className="mb-2 rounded-md bg-[var(--admin-hover-bg)] p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <ThermalRiskBadge level={log.level} />
                          <span className="text-xs text-muted-foreground">{log.createdAt}</span>
                        </div>
                        <p className="mt-1">{log.message}</p>
                        <p className="text-xs text-muted-foreground">温度 {log.batteryTemp}°C · SOC {log.soc}%</p>
                      </div>
                    )) : <p className="py-8 text-center text-sm text-muted-foreground">暂无 BMS 日志</p>}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">点击左侧列表选择设备</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog open={!!stopTarget} onOpenChange={() => setStopTarget(null)} title="确认停机"
        description={`确定远程停止「${stopTarget?.name}」？`} confirmLabel="确认停机" variant="destructive" onConfirm={() => setStopTarget(null)} />

      <ConfirmDialog open={!!otaTarget} onOpenChange={() => setOtaTarget(null)} title="OTA 固件升级"
        description={`将为「${otaTarget?.name}」推送最新固件 v3.3.1，升级期间设备将暂停服务约 5 分钟。`} confirmLabel="开始升级" onConfirm={() => setOtaTarget(null)} />
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-[var(--admin-hover-bg)] p-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="size-4" />{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  )
}

function ControlBtn({ icon: Icon, label, variant, disabled, onClick }: {
  icon: typeof Zap; label: string; variant?: 'destructive'; disabled?: boolean; onClick: () => void
}) {
  return (
    <Button variant={variant === 'destructive' ? 'destructive' : 'outline'} className="w-full justify-start" disabled={disabled} onClick={onClick}>
      <Icon className="size-4" />{label}
    </Button>
  )
}
