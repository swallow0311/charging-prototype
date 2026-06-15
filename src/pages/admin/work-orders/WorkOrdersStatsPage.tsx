import { useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useWorkOrders, WO_STATUS_LABEL } from '@/mocks/work-order-store'
import type { TableColumn, WorkOrder } from '@/types'

type TimeRange = 'day' | 'week' | 'month' | 'custom'

function filterByRange(orders: WorkOrder[], range: TimeRange, from: string, to: string) {
  const cutoff: Record<TimeRange, string> = {
    day: '2026-06-13',
    week: '2026-06-07',
    month: '2026-05-14',
    custom: from || '2020-01-01',
  }
  const start = range === 'custom' ? (from || '2020-01-01') : cutoff[range]
  const end = range === 'custom' ? (to ? `${to} 23:59:59` : '2099-12-31') : '2099-12-31'
  return orders.filter((o) => o.createdAt >= start && o.createdAt <= end)
}

export function WorkOrdersStatsPage() {
  const { orders } = useWorkOrders()
  const [range, setRange] = useState<TimeRange>('week')
  const [customFrom, setCustomFrom] = useState('2026-06-01')
  const [customTo, setCustomTo] = useState('2026-06-13')

  const filtered = useMemo(
    () => filterByRange(orders, range, customFrom, customTo),
    [orders, range, customFrom, customTo],
  )

  const stats = useMemo(() => {
    const completed = filtered.filter((o) => o.status === 'completed' || o.status === 'closed').length
    const avgHours = filtered.length > 0
      ? (filtered.reduce((s, o) => s + o.slaHours, 0) / filtered.length).toFixed(1)
      : '0'
    const overdueRate = filtered.length > 0
      ? Math.round((filtered.filter((o) => o.isOverdue).length / filtered.length) * 100)
      : 0
    return {
      total: filtered.length,
      completed,
      completionRate: filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0,
      avgSla: avgHours,
      overdueRate,
    }
  }, [filtered])

  const typePie = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((o) => map.set(o.orderType, (map.get(o.orderType) ?? 0) + 1))
    const colors = ['#4096FF', '#52C41A', '#FF7D00', '#9254DE']
    return [...map.entries()].map(([name, value], i) => ({ name, value, fill: colors[i % colors.length] }))
  }, [filtered])

  const stationBar = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((o) => map.set(o.stationName, (map.get(o.stationName) ?? 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))
  }, [filtered])

  const trendData = useMemo(() => {
    const days = range === 'day' ? 1 : range === 'week' ? 7 : 30
    return Array.from({ length: days }, (_, i) => {
      const day = String(13 - (days - 1 - i)).padStart(2, '0')
      const prefix = `2026-06-${day}`
      const dayOrders = filtered.filter((o) => o.createdAt.startsWith(prefix))
      return { date: `6/${Number(day)}`, created: dayOrders.length, completed: dayOrders.filter((o) => ['completed', 'closed'].includes(o.status)).length }
    })
  }, [filtered, range])

  const exportRows = useMemo(() => {
    const byType = new Map<string, { total: number; completed: number; overdue: number }>()
    filtered.forEach((o) => {
      const cur = byType.get(o.orderType) ?? { total: 0, completed: 0, overdue: 0 }
      cur.total += 1
      if (['completed', 'closed'].includes(o.status)) cur.completed += 1
      if (o.isOverdue) cur.overdue += 1
      byType.set(o.orderType, cur)
    })
    return [...byType.entries()].map(([type, v]) => ({
      id: type,
      type,
      total: v.total,
      completed: v.completed,
      overdue: v.overdue,
      rate: v.total > 0 ? `${Math.round((v.completed / v.total) * 100)}%` : '0%',
    }))
  }, [filtered])

  const summary = useMemo(() => ({
    total: exportRows.reduce((s, r) => s + r.total, 0),
    completed: exportRows.reduce((s, r) => s + r.completed, 0),
    overdue: exportRows.reduce((s, r) => s + r.overdue, 0),
  }), [exportRows])

  const detailColumns: TableColumn<WorkOrder>[] = [
    { key: 'id', title: '工单号' },
    { key: 'orderType', title: '类型' },
    { key: 'stationName', title: '场站' },
    {
      key: 'status', title: '状态',
      render: (r) => <Badge variant="secondary">{WO_STATUS_LABEL[r.status]}</Badge>,
    },
    { key: 'slaHours', title: 'SLA(h)' },
    { key: 'createdAt', title: '创建时间' },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <TabsList>
            <TabsTrigger value="day">今日</TabsTrigger>
            <TabsTrigger value="week">本周</TabsTrigger>
            <TabsTrigger value="month">本月</TabsTrigger>
            <TabsTrigger value="custom">自定义</TabsTrigger>
          </TabsList>
        </Tabs>
        {range === 'custom' ? (
          <div className="flex items-center gap-2">
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 w-36" />
            <span className="text-sm text-muted-foreground">至</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 w-36" />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: '工单总量', value: stats.total },
          { label: '已完成', value: stats.completed },
          { label: '完成率', value: `${stats.completionRate}%` },
          { label: '平均 SLA', value: `${stats.avgSla}h` },
          { label: '逾期率', value: `${stats.overdueRate}%` },
        ].map((m) => (
          <Card key={m.label} className="admin-card admin-card--borderless">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{m.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="admin-card admin-card--borderless xl:col-span-2">
          <CardHeader><CardTitle className="text-base">工单趋势</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="created" name="新建" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="完成" stroke="var(--chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="admin-card admin-card--borderless">
          <CardHeader><CardTitle className="text-base">类型占比</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={typePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {typePie.map((e) => <Cell key={e.name} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="admin-card admin-card--borderless xl:col-span-3">
          <CardHeader><CardTitle className="text-base">场站工单量</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stationBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" name="工单数" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">分类汇总表</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>工单类型</TableHead>
                <TableHead>总量</TableHead>
                <TableHead>已完成</TableHead>
                <TableHead>逾期</TableHead>
                <TableHead>完成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.completed}</TableCell>
                  <TableCell>{row.overdue}</TableCell>
                  <TableCell>{row.rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-medium">
                <TableCell>合计</TableCell>
                <TableCell>{summary.total}</TableCell>
                <TableCell>{summary.completed}</TableCell>
                <TableCell>{summary.overdue}</TableCell>
                <TableCell>{summary.total > 0 ? `${Math.round((summary.completed / summary.total) * 100)}%` : '0%'}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">工单明细</CardTitle></CardHeader>
        <CardContent>
          <DataTable data={filtered} columns={detailColumns} hideToolbar pageSize={8} compact />
        </CardContent>
      </Card>
    </div>
  )
}
