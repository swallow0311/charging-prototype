import { useState } from 'react'

import { TariffTimeline } from '@/components/admin/AdminCharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MOCK_BILLING_CONFIG, MOCK_PROPERTY_SHARE, MOCK_TARIFF_SLOTS,
} from '@/mocks/admin-data'
import type { PropertyShareConfig, TariffSlot } from '@/types'

const PERIOD_COLORS: Record<string, string> = {
  peak: '#ef4444', flat: '#3b82f6', valley: '#22c55e',
}

export function AdminBillingPage() {
  const [tariffs, setTariffs] = useState<TariffSlot[]>(MOCK_TARIFF_SLOTS)
  const [shares, setShares] = useState<PropertyShareConfig[]>(MOCK_PROPERTY_SHARE)
  const [memberDiscount, setMemberDiscount] = useState(MOCK_BILLING_CONFIG.memberDiscountPercent)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const timelineSlots = tariffs.map((t) => ({
    label: t.label, startHour: t.startHour, endHour: t.endHour,
    price: t.pricePerKwh, color: PERIOD_COLORS[t.period],
  }))

  const updateTariffPrice = (id: string, price: number) => {
    setTariffs((prev) => prev.map((t) => t.id === id ? { ...t, pricePerKwh: price } : t))
  }

  const updateShare = (stationId: string, field: keyof PropertyShareConfig, value: number) => {
    setShares((prev) => prev.map((s) => {
      if (s.stationId !== stationId) return s
      const updated = { ...s, [field]: value }
      if (field === 'propertySharePercent') updated.platformSharePercent = 100 - value - updated.operatorSharePercent
      return updated
    }))
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">可视化峰谷电价编辑器</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <TariffTimeline slots={timelineSlots} />
          <p className="text-xs text-muted-foreground">拖拽下方时段卡片可调整顺序（原型演示：点击卡片高亮选中时段）</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tariffs.map((slot) => (
              <div
                key={slot.id}
                draggable
                onDragStart={() => setDraggingId(slot.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => setDraggingId(null)}
                className={`cursor-grab rounded-lg border p-4 transition-shadow ${draggingId === slot.id ? 'border-[var(--admin-primary)] shadow-md' : 'border-[var(--admin-border)]'}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: PERIOD_COLORS[slot.period] }} />
                  <span className="font-medium">{slot.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {String(slot.startHour).padStart(2, '0')}:00 - {String(slot.endHour).padStart(2, '0')}:00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">¥/kWh</Label>
                  <Input type="number" step="0.01" value={slot.pricePerKwh}
                    onChange={(e) => updateTariffPrice(slot.id, Number(e.target.value))} className="h-8" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-[var(--admin-hover-bg)] p-4">
            <Label>会员折扣</Label>
            <Input type="number" step="0.5" value={memberDiscount} onChange={(e) => setMemberDiscount(Number(e.target.value))} className="h-8 w-24" />
            <span className="text-sm text-muted-foreground">%（金卡及以上会员享受）</span>
          </div>
        </CardContent>
      </Card>

      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">物业分润比例设置</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {shares.map((share) => (
            <div key={share.stationId} className="rounded-lg bg-[var(--admin-hover-bg)] p-4">
              <p className="mb-4 font-medium">{share.stationName}</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <ShareSlider label="平台分润" value={share.platformSharePercent} onChange={(v) => updateShare(share.stationId, 'platformSharePercent', v)} />
                <ShareSlider label="物业分润" value={share.propertySharePercent} onChange={(v) => updateShare(share.stationId, 'propertySharePercent', v)} />
                <ShareSlider label="运维分润" value={share.operatorSharePercent} onChange={(v) => updateShare(share.stationId, 'operatorSharePercent', v)} />
              </div>
            </div>
          ))}
          <Button>保存配置</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ShareSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}%</span></div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  )
}
