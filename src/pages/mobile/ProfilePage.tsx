import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Car, ChevronRight, FileText, Receipt, Settings } from 'lucide-react'

import { ReservationCard } from '@/components/mobile/ReservationCard'
import { useMobileStore, type MobileNavState } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PROFILE_TABS = [
  { value: 'orders', label: '订单' },
  { value: 'reservations', label: '预约' },
  { value: 'vehicles', label: '车辆' },
  { value: 'invoices', label: '开票' },
] as const

export function MobileProfilePage() {
  const location = useLocation()
  const defaultTab = (location.state as MobileNavState | null)?.tab ?? 'orders'
  const { user, orders, vehicles, reservations, invoiceRecords, cancelReservation, requestInvoice } = useMobileStore()
  const [bindOpen, setBindOpen] = useState(false)
  const [plateNumber, setPlateNumber] = useState('')

  const pendingInvoices = invoiceRecords.filter((r) => r.status === 'pending' || r.status === 'processing')
  const issuedInvoices = invoiceRecords.filter((r) => r.status === 'issued')
  const invoiceableOrders = orders.filter((o) => o.status === 'completed' && o.invoiceStatus !== 'issued' && o.invoiceStatus !== 'pending')

  const navState: MobileNavState = { from: ROUTES.MOBILE.PROFILE }

  return (
    <div className="mobile-stack p-4 pb-6">
      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
          {user.displayName.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-sm text-muted-foreground">{user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 rounded-full" asChild>
          <Link to={ROUTES.MOBILE.PROFILE_EDIT} state={navState}>
            <Settings className="size-5" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList variant="line" className="mobile-tabs-list grid w-full grid-cols-4">
          {PROFILE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="mobile-tabs-trigger">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="orders" className="mobile-stack mt-6">
          {orders.map((order) => (
            <Card key={order.id} className="mobile-block">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.stationName}</p>
                  <p className="text-xs text-muted-foreground">{order.date} · {order.energyKwh} kWh</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">¥{order.amount.toFixed(2)}</p>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                    {order.status === 'completed' ? '已完成' : order.status === 'cancelled' ? '已取消' : order.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reservations" className="mobile-stack mt-6">
          {reservations.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">暂无预约记录</p>
          ) : (
            reservations.map((res) => (
              <ReservationCard key={res.id} reservation={res} onCancel={cancelReservation} />
            ))
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="mobile-stack mt-6">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              to={ROUTES.MOBILE.vehicle(vehicle.id)}
              state={{ from: ROUTES.MOBILE.PROFILE, tab: 'vehicles' }}
            >
              <Card className="mobile-block">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Car className="size-8 text-primary" />
                    <div>
                      <p className="font-medium">{vehicle.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model} · {vehicle.batteryCapacityKwh} kWh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {vehicle.isDefault ? <Badge>默认</Badge> : null}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          <Button variant="outline" className="w-full border-0 bg-primary/5 text-primary hover:bg-primary/10" onClick={() => setBindOpen(true)}>
            <Car className="size-4" />绑定新车辆
          </Button>
        </TabsContent>

        <TabsContent value="invoices" className="mobile-stack mt-6">
          <section className="mobile-stack">
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <Receipt className="size-4 text-primary" />可开票记录
            </h3>
            {invoiceableOrders.length === 0 && pendingInvoices.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">暂无可开票订单</p>
            ) : (
              <div className="mobile-stack">
                {invoiceableOrders.map((order) => (
                  <Card key={order.id} className="mobile-block">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{order.stationName}</p>
                        <p className="text-xs text-muted-foreground">{order.date} · ¥{order.amount.toFixed(2)}</p>
                      </div>
                      <Button size="sm" onClick={() => requestInvoice(order.id)}>申请开票</Button>
                    </CardContent>
                  </Card>
                ))}
                {pendingInvoices.map((inv) => (
                  <Card key={inv.id} className="mobile-block">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{inv.stationName}</p>
                        <p className="text-xs text-muted-foreground">{inv.date} · ¥{inv.amount.toFixed(2)}</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
                        {inv.status === 'processing' ? '开票中' : '待开票'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="mobile-stack">
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <FileText className="size-4 text-muted-foreground" />已开票记录
            </h3>
            {issuedInvoices.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">暂无已开票记录</p>
            ) : (
              <div className="mobile-stack">
                {issuedInvoices.map((inv) => (
                  <Card key={inv.id} className="mobile-block">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{inv.stationName}</p>
                          <p className="text-xs text-muted-foreground">{inv.date} · ¥{inv.amount.toFixed(2)} · {inv.energyKwh} kWh</p>
                        </div>
                        <Badge>已开票</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        发票号: {inv.invoiceNo} · 开票时间: {inv.issuedAt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>

      <Dialog open={bindOpen} onOpenChange={setBindOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>绑定车辆</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>车牌号</Label>
              <Input placeholder="粤B·D12345" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBindOpen(false)}>取消</Button>
            <Button onClick={() => setBindOpen(false)}>确认绑定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
