import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bot, ClipboardList, Clock, Plus, Wrench } from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import {
  computeWoDashboardStats, MOCK_OPERATOR_EFFICIENCY, MOCK_STATION_FAULT_TOP10,
  MOCK_WO_TREND_30D, MOCK_WO_TYPE_PIE,
} from '@/mocks/work-order-mock'
import { useWorkOrders, WO_PRIORITY_LABEL } from '@/mocks/work-order-store'
import { cn } from '@/lib/utils'

const AI_METRIC_CONFIG = [
  { key: 'aiDispatched' as const, label: 'AI 派单', icon: Bot, color: 'text-[var(--admin-primary)]' },
  { key: 'aiSuccess' as const, label: 'AI 接单', icon: Bot, color: 'text-green-500' },
  { key: 'dispatchFailed' as const, label: '调度异常', icon: AlertTriangle, color: 'text-[var(--admin-danger)]' },
]

const METRIC_CONFIG = [
  { key: 'total', label: '工单总数', icon: ClipboardList, color: 'text-[var(--admin-primary)]' },
  { key: 'pending', label: '待处理', icon: Clock, color: 'text-orange-500' },
  { key: 'processing', label: '处理中', icon: Wrench, color: 'text-blue-500' },
  { key: 'completed', label: '已完成', icon: ClipboardList, color: 'text-green-500' },
  { key: 'overdue', label: '已逾期', icon: AlertTriangle, color: 'text-[var(--admin-danger)]' },
  { key: 'todayNew', label: '今日新增', icon: Plus, color: 'text-purple-500' },
] as const

export function WorkOrdersDashboardPage() {
  const navigate = useNavigate()
  const { orders } = useWorkOrders()

  const stats = useMemo(() => computeWoDashboardStats(orders), [orders])
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending').slice(0, 5), [orders])
  const overdueOrders = useMemo(() => orders.filter((o) => o.isOverdue || o.status === 'overdue'), [orders])
  const latestActivity = useMemo(() => {
    const items: { orderId: string; title: string; action: string; time: string; operator: string }[] = []
    orders.forEach((o) => {
      o.repairRecords.forEach((r) => {
        items.push({ orderId: o.id, title: o.title, action: r.action, time: r.createdAt, operator: r.operator })
      })
    })
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)
  }, [orders])

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {METRIC_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} className="admin-card admin-card--borderless">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={cn('size-4', color)} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {AI_METRIC_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <Card key={key} className="admin-card admin-card--borderless">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={cn('size-4', color)} />
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <p className="text-2xl font-bold">{stats[key]}</p>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate(ROUTES.ADMIN.WORK_ORDERS_AI_DISPATCH)}>
                AI 调度 <ArrowRight className="size-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="admin-card admin-card--borderless">
          <CardHeader><CardTitle className="text-base">近 30 日工单趋势</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MOCK_WO_TREND_30D}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="created" name="新建" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" name="完成" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="admin-card admin-card--borderless">
          <CardHeader><CardTitle className="text-base">故障类型分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={MOCK_WO_TYPE_PIE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {MOCK_WO_TYPE_PIE.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="admin-card admin-card--borderless">
          <CardHeader><CardTitle className="text-base">场站故障 TOP10</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MOCK_STATION_FAULT_TOP10} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" name="故障数" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="admin-card admin-card--borderless">
          <CardHeader><CardTitle className="text-base">运维人员效率</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MOCK_OPERATOR_EFFICIENCY}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="completed" name="已完成" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="待处理" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">待处理快捷入口</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate(`${ROUTES.ADMIN.WORK_ORDERS_LIST}?status=pending`)}>
              查看全部 <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无待处理工单</p>
            ) : pendingOrders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => navigate(`${ROUTES.ADMIN.WORK_ORDERS_LIST}?id=${o.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--admin-border)] p-3 text-left text-sm hover:bg-[var(--admin-hover-bg)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.stationName}</p>
                </div>
                <Badge variant="outline">{WO_PRIORITY_LABEL[o.priority]}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-[var(--admin-danger)]">
              <AlertTriangle className="size-4" />逾期告警
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无逾期工单</p>
            ) : overdueOrders.map((o) => (
              <div key={o.id} className="rounded-lg border border-[var(--admin-danger)]/30 bg-[#FEF2F2] p-3 text-sm">
                <p className="font-medium">{o.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.id} · 截止 {o.deadline} · {o.assignee ?? '未分派'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">最新动态</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {latestActivity.map((item, i) => (
                <li key={`${item.orderId}-${i}`} className="flex gap-2 text-sm">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[var(--admin-primary)]" />
                  <div className="min-w-0">
                    <p><span className="font-medium">{item.action}</span> · {item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.operator} · {item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
