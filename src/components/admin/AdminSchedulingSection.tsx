import { useMemo, useState } from 'react'
import {
  AlertTriangle, Download,
} from 'lucide-react'
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { TextTableAction } from '@/components/shared/TextTableAction'
import { ThermalRiskBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MOCK_BATTERY_RISKS, MOCK_HEATMAP, MOCK_SCHEDULING_LOGS,
  MOCK_SCHEDULING_REVENUE, useSchedulingRealtime,
} from '@/mocks/scheduling-mock'
import { cn } from '@/lib/utils'
import type { TableColumn } from '@/types'

const LOG_TYPE_OPTIONS = ['功率调度', '风险处置', '模式切换', 'V2G 放电'] as const

interface AdminSchedulingSectionProps {
  embedded?: boolean
  borderless?: boolean
}

export function AdminSchedulingSection({ embedded = false, borderless = false }: AdminSchedulingSectionProps) {
  const { metrics, series } = useSchedulingRealtime()
  const [stopTarget, setStopTarget] = useState<string | null>(null)
  const [logType, setLogType] = useState('all')
  const [logSearch, setLogSearch] = useState('')
  const [revenueDate, setRevenueDate] = useState('')

  const riskColumns: TableColumn<(typeof MOCK_BATTERY_RISKS)[0]>[] = [
    { key: 'plateNumber', title: '车牌' },
    { key: 'stationName', title: '场站' },
    { key: 'gunName', title: '枪位' },
    {
      key: 'riskLevel', title: '风险等级',
      render: (r) => <ThermalRiskBadge level={r.riskLevel} />,
    },
    { key: 'bmsRiskType', title: 'BMS 风险类型' },
    { key: 'aiAction', title: 'AI 自动处置' },
    {
      key: 'id', title: '操作', width: '72px',
      render: (r) => (
        <TextTableAction label="停机" variant="danger" onClick={() => setStopTarget(r.plateNumber)} />
      ),
    },
  ]

  const logColumns: TableColumn<(typeof MOCK_SCHEDULING_LOGS)[0]>[] = [
    { key: 'time', title: '时间' },
    { key: 'type', title: '类型' },
    { key: 'detail', title: '详情' },
    { key: 'operator', title: '操作方' },
  ]

  const revenueColumns: TableColumn<(typeof MOCK_SCHEDULING_REVENUE)[0]>[] = [
    { key: 'date', title: '日期' },
    { key: 'peakShavingYuan', title: '削峰收益', render: (r) => `¥${r.peakShavingYuan}` },
    { key: 'v2gYuan', title: 'V2G 收益', render: (r) => `¥${r.v2gYuan}` },
    { key: 'totalSavingYuan', title: '合计节省', render: (r) => `¥${r.totalSavingYuan}` },
  ]

  const filteredLogs = useMemo(() => {
    return MOCK_SCHEDULING_LOGS.filter((l) => {
      if (logType !== 'all' && l.type !== logType) return false
      if (logSearch && !l.detail.toLowerCase().includes(logSearch.toLowerCase())) return false
      return true
    })
  }, [logType, logSearch])

  const filteredRevenue = useMemo(() => {
    if (!revenueDate) return MOCK_SCHEDULING_REVENUE
    return MOCK_SCHEDULING_REVENUE.filter((r) => r.date === revenueDate)
  }, [revenueDate])

  const metricCards = [
    { label: '集群最大功率', value: `${metrics.clusterMaxKw} kW`, alert: false },
    { label: '当前负载功率', value: `${metrics.currentLoadKw} kW`, alert: metrics.isOverloaded },
    { label: '负载率', value: `${metrics.loadRatePercent}%`, alert: metrics.loadRatePercent > 90 },
    { label: '充电车辆数', value: `${metrics.chargingVehicleCount} 辆`, alert: false },
    { label: '电费节省', value: `¥${metrics.costSavingYuan}`, alert: false },
    { label: '电池预警', value: `${metrics.batteryAlertCount} 条`, alert: metrics.batteryAlertCount > 2 },
  ]

  return (
    <div className={embedded ? 'space-y-6' : 'space-y-6 p-6'}>
      {!embedded ? (
        <div>
          <h1 className="text-2xl font-bold">AI 智能调度</h1>
          <p className="text-sm text-muted-foreground">实时功率调度 · Mock 数据流</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-[var(--admin-text-title)]">AI 智能调度</h2>
          <p className="text-sm text-[var(--admin-text-muted)]">实时负载监控与风险预警</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map((m) => (
          <Card key={m.label} className={cn('admin-card admin-card--borderless', m.alert && 'admin-flash-alert border-[var(--admin-danger)]')}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={cn('mt-1 text-xl font-bold', m.alert && 'text-[var(--admin-danger)]')}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
          <CardHeader><CardTitle className="text-base">24 小时功率时序曲线</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                <YAxis unit=" kW" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="threshold" name="变压器阈值" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="actual" name="实时功率" stroke="#4096FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted" name="AI 预测" stroke="#52C41A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
          <CardHeader><CardTitle className="text-base">24 小时负荷热力图</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="mb-1 grid grid-cols-[40px_repeat(24,1fr)] gap-0.5 text-[10px] text-muted-foreground">
                  <span />
                  {Array.from({ length: 24 }, (_, i) => (
                    <span key={i} className="text-center">{i}</span>
                  ))}
                </div>
                {MOCK_HEATMAP.map((row, day) => (
                  <div key={day} className="mb-0.5 grid grid-cols-[40px_repeat(24,1fr)] gap-0.5">
                    <span className="text-[10px] text-muted-foreground">D{day + 1}</span>
                    {row.map((val, hour) => (
                      <div
                        key={hour}
                        className="aspect-square rounded-sm"
                        title={`${val}%`}
                        style={{ backgroundColor: `rgba(64,150,255,${val / 100})` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="size-4 text-[var(--admin-warning)]" />
          <CardTitle className="text-base">AI 电池风险预警</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={MOCK_BATTERY_RISKS} columns={riskColumns} searchPlaceholder="搜索车牌或场站..." searchKeys={['plateNumber', 'stationName']} pageSize={5} />
        </CardContent>
      </Card>

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">AI 调度事件日志</TabsTrigger>
          <TabsTrigger value="revenue">月度调度收益</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="类型" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {LOG_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="搜索详情"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-64 shrink-0"
            />
            <Button variant="outline"><Download className="size-4" />导出</Button>
          </div>
          <DataTable data={filteredLogs} columns={logColumns} pageSize={5} hideToolbar />
        </TabsContent>
        <TabsContent value="revenue" className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={revenueDate}
              onChange={(e) => setRevenueDate(e.target.value)}
              className="max-w-[180px]"
            />
            <Button variant="outline"><Download className="size-4" />导出</Button>
          </div>
          <DataTable data={filteredRevenue} columns={revenueColumns} pageSize={5} hideToolbar />
        </TabsContent>
      </Tabs>

      <ConfirmDialog open={!!stopTarget} onOpenChange={() => setStopTarget(null)} title="确认远程停机"
        description={`确定对「${stopTarget}」执行远程停机？此操作将中断充电。`} confirmLabel="确认停机" variant="destructive"
        onConfirm={() => setStopTarget(null)} />
    </div>
  )
}
