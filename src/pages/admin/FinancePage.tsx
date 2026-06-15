import { Download, DollarSign, FileText, Receipt, TrendingUp, Zap } from 'lucide-react'

import { DataTable } from '@/components/shared/DataTable'
import { MetricCard } from '@/components/shared/MetricCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MOCK_FINANCE_SUMMARY, MOCK_ORDERS, MOCK_PROPERTY_RECONCILIATION, MOCK_V2G_REVENUE,
} from '@/mocks/admin-data'
import type { ChargingOrder } from '@/types'
import type { DashboardMetric, TableColumn } from '@/types'

const financeMetrics: DashboardMetric[] = [
  { id: 'f1', label: '总营收', value: `¥${MOCK_FINANCE_SUMMARY.totalRevenue.toLocaleString()}`, trend: 'up', changePercent: 12.3 },
  { id: 'f2', label: '平台分润', value: `¥${MOCK_FINANCE_SUMMARY.platformShare.toLocaleString()}`, trend: 'up', changePercent: 10.1 },
  { id: 'f3', label: '物业分润', value: `¥${MOCK_FINANCE_SUMMARY.propertyShare.toLocaleString()}`, trend: 'up', changePercent: 8.5 },
  { id: 'f4', label: '订单数', value: MOCK_FINANCE_SUMMARY.orderCount.toLocaleString(), trend: 'up', changePercent: 15.2 },
]

const orderColumns: TableColumn<ChargingOrder>[] = [
  { key: 'id', title: '订单号' },
  { key: 'userName', title: '用户' },
  { key: 'stationName', title: '场站' },
  { key: 'deviceName', title: '设备' },
  { key: 'energyKwh', title: '电量', render: (r) => `${r.energyKwh} kWh` },
  { key: 'amount', title: '金额', render: (r) => `¥${r.amount.toFixed(2)}` },
  { key: 'platformFee', title: '平台分润', render: (r) => `¥${r.platformFee.toFixed(2)}` },
  { key: 'propertyFee', title: '物业分润', render: (r) => `¥${r.propertyFee.toFixed(2)}` },
  {
    key: 'status', title: '状态',
    render: (r) => (
      <Badge variant={r.status === 'completed' ? 'default' : r.status === 'charging' ? 'secondary' : 'outline'}>
        {r.status === 'completed' ? '已完成' : r.status === 'charging' ? '充电中' : r.status}
      </Badge>
    ),
  },
  { key: 'startedAt', title: '开始时间' },
]

export function AdminFinancePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financeMetrics.map((m) => <MetricCard key={m.id} metric={m} borderless />)}
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">充电营收明细</TabsTrigger>
          <TabsTrigger value="reconciliation">物业分润对账</TabsTrigger>
          <TabsTrigger value="v2g">V2G 储能收益</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <DataTable
            data={MOCK_ORDERS} columns={orderColumns}
            searchPlaceholder="搜索订单号或用户..." searchKeys={['id', 'userName', 'stationName']}
            filterKey="status" filterOptions={[
              { label: '已完成', value: 'completed' }, { label: '充电中', value: 'charging' },
            ]}
            toolbarExtra={
              <Button variant="outline" className="shrink-0"><Download className="size-4" />导出</Button>
            }
          />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-4 space-y-3">
          {MOCK_PROPERTY_RECONCILIATION.map((item) => (
            <div key={item.stationId} className="admin-card flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{item.stationName}</p>
                <p className="text-sm text-muted-foreground">{item.period} · 总营收 ¥{item.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">物业 ¥{item.propertyShare.toLocaleString()} · 平台 ¥{item.platformShare.toLocaleString()}</p>
                <Badge variant={item.settled ? 'default' : 'secondary'} className="mt-1">
                  {item.settled ? '已对账' : '待对账'}
                </Badge>
              </div>
            </div>
          ))}
          <Button variant="outline"><FileText className="size-4" />生成对账报告</Button>
        </TabsContent>

        <TabsContent value="v2g" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <V2GCard icon={Zap} label="放电量" value={`${MOCK_V2G_REVENUE.dischargeKwh.toLocaleString()} kWh`} />
            <V2GCard icon={DollarSign} label="V2G 收益" value={`¥${MOCK_V2G_REVENUE.revenue.toLocaleString()}`} />
            <V2GCard icon={TrendingUp} label="电网补贴" value={`¥${MOCK_V2G_REVENUE.gridSubsidy.toLocaleString()}`} />
            <V2GCard icon={Receipt} label="参与场站" value={`${MOCK_V2G_REVENUE.participatingStations} 座`} />
          </div>
          <Card className="admin-card mt-4">
            <CardHeader><CardTitle className="text-base">V2G 储能收益说明</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>统计周期：{MOCK_V2G_REVENUE.period}</p>
              <p className="mt-2">通过 V2G 双向充放电，在用电高峰向电网反向送电获得收益及补贴。当前参与场站：科技园超级充电站、宝安机场枢纽站。</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function V2GCard({ icon: Icon, label, value }: { icon: typeof Zap; label: string; value: string }) {
  return (
    <Card className="admin-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div className="text-xl font-bold">{value}</div></CardContent>
    </Card>
  )
}
