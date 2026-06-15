import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, MapPin, Phone, Star } from 'lucide-react'

import { MobileSubHeader } from '@/components/mobile/MobileSubHeader'
import { useMobileStore } from '@/mocks/mobile-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

export function MobileStationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getStationDetail, createReservation } = useMobileStore()
  const station = id ? getStationDetail(id) : undefined
  const [reserveOpen, setReserveOpen] = useState(false)
  const [selectedPile, setSelectedPile] = useState<string | null>(null)

  if (!station) {
    return (
      <div className="pb-6">
        <MobileSubHeader title="场站详情" />
        <p className="py-8 text-center text-muted-foreground">场站不存在</p>
      </div>
    )
  }

  const availablePile = station.piles.find((p) => p.status === 'available')

  const handleReserve = () => {
    if (availablePile) {
      createReservation(station.id, station.name, availablePile.name)
    }
    setReserveOpen(false)
  }

  return (
    <div className="pb-6">
      <MobileSubHeader title="场站详情" />

      <div className="mobile-stack p-4">
        <Card className="mobile-block">
          <CardContent className="p-4">
            <h2 className="text-lg font-bold">{station.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />{station.address}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{station.distanceKm} km</Badge>
              <Badge variant="secondary" className="gap-0.5">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />{station.rating}
              </Badge>
              <Badge variant="secondary">¥{station.pricePerKwh}/度</Badge>
              <Badge className="bg-primary/10 text-primary">{station.availablePiles} 空闲</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {station.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-block">
          <CardContent className="space-y-2 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">营业时间</span>
              <span>{station.openHours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">客服电话</span>
              <span className="flex items-center gap-1"><Phone className="size-3" />{station.phone}</span>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">{station.description}</p>
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-3 font-medium">充电桩列表</h3>
          <div className="mobile-stack">
            {station.piles.map((pile) => (
              <div key={pile.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                <div>
                  <p className="text-sm font-medium">{pile.name}</p>
                  <p className="text-xs text-muted-foreground">{pile.powerKw} kW</p>
                </div>
                <Badge variant={pile.status === 'available' ? 'default' : pile.status === 'busy' ? 'secondary' : 'outline'}>
                  {pile.status === 'available' ? '空闲' : pile.status === 'busy' ? '使用中' : '离线'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="h-12 w-full rounded-xl"
          disabled={!availablePile}
          onClick={() => { setSelectedPile(availablePile?.name ?? null); setReserveOpen(true) }}
        >
          <Clock className="size-4" />
          {availablePile ? '预约锁桩' : '暂无空闲桩位'}
        </Button>
      </div>

      <Dialog open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>预约锁桩</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2 text-sm">
            <p>场站：<strong>{station.name}</strong></p>
            <p>桩位：<strong>{selectedPile}</strong></p>
            <p className="text-muted-foreground">预约后 30 分钟内有效，超时自动释放。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReserveOpen(false)}>取消</Button>
            <Button onClick={handleReserve}>确认预约</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
