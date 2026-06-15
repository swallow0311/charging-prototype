import {
  AdminBarChart, AdminLineChart, AdminPieChart,
} from '@/components/admin/AdminCharts'
import { AdminSchedulingSection } from '@/components/admin/AdminSchedulingSection'
import { StationMapPanel } from '@/components/admin/StationMapPanel'
import { MetricCard } from '@/components/shared/MetricCard'
import {
  MOCK_CHARGING_TREND, MOCK_DASHBOARD_METRICS, MOCK_FAULT_PIE,
  MOCK_REVENUE_BAR, MOCK_STATIONS,
} from '@/mocks/admin-data'

export function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {MOCK_DASHBOARD_METRICS.map((m) => (
            <MetricCard key={m.id} metric={m} borderless />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminLineChart data={MOCK_CHARGING_TREND} title="充电量趋势" description="近7日各时段充电量 (kWh)" unit=" kWh" borderless />
          <AdminBarChart data={MOCK_REVENUE_BAR} title="营收统计" description="近 7 日营收 (元)" borderless />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <AdminPieChart data={MOCK_FAULT_PIE} title="设备故障类型" description="本月故障分类占比" borderless />
          <div className="lg:col-span-2">
            <StationMapPanel stations={MOCK_STATIONS} borderless />
          </div>
        </div>
      </section>

      <AdminSchedulingSection embedded borderless />
    </div>
  )
}
