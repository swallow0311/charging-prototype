import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MapPin, Star } from 'lucide-react'

import { MOCK_NEARBY_STATIONS } from '@/mocks/mobile-data'
import { useMobileStore } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { NearbyStation } from '@/types'

type SortKey = 'distance' | 'price' | 'rating'

export function MobileFindPage() {
  const { createReservation } = useMobileStore()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('distance')
  const [reserveTarget, setReserveTarget] = useState<NearbyStation | null>(null)

  const stations = useMemo(() => {
    let list = [...MOCK_NEARBY_STATIONS]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm
      if (sortBy === 'price') return a.pricePerKwh - b.pricePerKwh
      return b.rating - a.rating
    })
    return list
  }, [search, sortBy])

  const handleReserve = () => {
    if (reserveTarget) {
      createReservation(reserveTarget.id, reserveTarget.name, '自动分配桩位')
    }
    setReserveTarget(null)
  }

  return (
    <div className="mobile-stack p-4 pb-6">
      <h1 className="text-xl font-bold">找桩充电</h1>

      <Input placeholder="搜索场站名称或地址..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="flex gap-2">
        {([
          { key: 'distance' as SortKey, label: '距离最近' },
          { key: 'price' as SortKey, label: '价格最低' },
          { key: 'rating' as SortKey, label: '评分最高' },
        ]).map((opt) => (
          <Button key={opt.key} variant={sortBy === opt.key ? 'default' : 'outline'} size="sm" onClick={() => setSortBy(opt.key)}>
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="mobile-stack">
        {stations.map((station) => (
          <Card key={station.id} className="mobile-block">
            <CardContent className="p-4">
              <Link to={ROUTES.MOBILE.station(station.id)} className="block">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{station.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />{station.address}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="font-medium text-primary">{station.distanceKm} km</span>
                      <span className="flex items-center gap-0.5"><Star className="size-3 fill-yellow-400 text-yellow-400" />{station.rating}</span>
                      <span>¥{station.pricePerKwh}/度</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${station.availablePiles > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {station.availablePiles}
                    </p>
                    <p className="text-xs text-muted-foreground">/{station.totalPiles} 空闲</p>
                  </div>
                </div>
              </Link>
              <Button
                className="mt-3 w-full"
                variant={station.availablePiles > 0 ? 'default' : 'secondary'}
                disabled={station.availablePiles === 0}
                onClick={() => setReserveTarget(station)}
              >
                <Clock className="size-4" />
                {station.availablePiles > 0 ? '预约锁桩' : '暂无空闲'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!reserveTarget} onOpenChange={() => setReserveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>预约锁桩</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p>场站：<strong>{reserveTarget?.name}</strong></p>
            <p className="text-muted-foreground">预约后 30 分钟内有效，超时自动释放。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReserveTarget(null)}>取消</Button>
            <Button onClick={handleReserve}>确认预约</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
