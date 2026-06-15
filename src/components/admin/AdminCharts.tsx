import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type {
  AdminBarChartProps,
  AdminLineChartProps,
  AdminPieChartProps,
  ClusterChartDataPoint,
  GridLoadDataPoint,
} from '@/types'

export function AdminLineChart({ data, title, description, height = 280, unit = '', borderless }: AdminLineChartProps) {
  return (
    <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} unit={unit} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Line type="monotone" dataKey="value" name="充电量" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AdminBarChart({ data, title, description, height = 280, borderless }: AdminBarChartProps) {
  return (
    <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="value" name="营收(元)" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function AdminPieChart({ data, title, description, height = 280, borderless }: AdminPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  const renderLabel = (props: { name?: string; value?: number }) => {
    const name = props.name ?? ''
    const value = props.value ?? 0
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return `${name} ${value}(${pct}%)`
  }

  return (
    <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={renderLabel} labelLine>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.fill ?? `var(--chart-${(i % 5) + 1})`} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={(value) => {
                const v = Number(value ?? 0)
                const pct = total > 0 ? Math.round((v / total) * 100) : 0
                return [`${v}(${pct}%)`, '数量']
              }}
            />
            <Legend formatter={(value, entry) => {
              const payload = entry.payload as { value?: number } | undefined
              const v = payload?.value ?? 0
              const pct = total > 0 ? Math.round((v / total) * 100) : 0
              return `${value} ${v}(${pct}%)`
            }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface GridLoadChartProps {
  data: GridLoadDataPoint[]
  title?: string
}

export function GridLoadChart({ data, title = '电网负载曲线' }: GridLoadChartProps) {
  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>24 小时负载率变化</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Line type="monotone" dataKey="loadPercent" name="负载率" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface ClusterPowerChartProps {
  data: ClusterChartDataPoint[]
}

export function ClusterPowerChart({ data }: ClusterPowerChartProps) {
  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-base">集群功率分配</CardTitle>
        <CardDescription>各集群容量 vs 已分配功率</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="cluster" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} unit=" kW" />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="capacity" name="总容量" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="allocated" name="已分配" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TariffTimelineProps {
  slots: { label: string; startHour: number; endHour: number; price: number; color: string }[]
}

export function TariffTimeline({ slots }: TariffTimelineProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-10 overflow-hidden rounded-lg">
        {slots.map((slot) => (
          <div
            key={slot.label + slot.startHour}
            className="flex items-center justify-center text-xs font-medium text-white"
            style={{
              width: `${((slot.endHour - slot.startHour) / 24) * 100}%`,
              backgroundColor: slot.color,
            }}
            title={`${slot.label}: ¥${slot.price}/kWh`}
          >
            {slot.endHour - slot.startHour >= 3 ? slot.label : ''}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
      </div>
    </div>
  )
}

interface DemandForecastChartProps {
  data: { hour: string; predictedKw: number; actualKw?: number }[]
  title?: string
}

export function DemandForecastChart({ data, title = '充电需求预测' }: DemandForecastChartProps) {
  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>AI 预测 vs 实际充电需求 (kW)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} unit=" kW" />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="predictedKw" name="AI 预测" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="actualKw" name="实际" stroke="var(--chart-1)" strokeWidth={2} dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
