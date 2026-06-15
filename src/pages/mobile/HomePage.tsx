import { Link } from 'react-router-dom'
import { ScanLine } from 'lucide-react'

import { VehicleStatusPanel } from '@/components/mobile/VehicleStatusPanel'
import { MOCK_NEARBY_STATIONS, APP_BRAND_NAME } from '@/mocks/mobile-data'
import { useMobileStore } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function MobileHomePage() {
  const { user, vehicles } = useMobileStore()

  return (
    <div className="mobile-stack p-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">你好，{user.displayName}</p>
          <h1 className="text-xl font-bold">欢迎使用{APP_BRAND_NAME}</h1>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full bg-primary/5" asChild>
          <Link to={ROUTES.MOBILE.SCAN} aria-label="扫一扫">
            <ScanLine className="size-5" />
          </Link>
        </Button>
      </div>

      <VehicleStatusPanel vehicles={vehicles} />

      <Button className="h-14 w-full rounded-xl text-base" asChild>
        <Link to={ROUTES.MOBILE.SCAN}>
          <ScanLine className="size-5" />
          扫码充电
        </Link>
      </Button>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">附近场站</h2>
          <Link to={ROUTES.MOBILE.FIND} className="text-sm text-primary">查看全部</Link>
        </div>
        <div className="mobile-stack">
          {MOCK_NEARBY_STATIONS.slice(0, 3).map((station) => (
            <Link key={station.id} to={ROUTES.MOBILE.station(station.id)}>
              <Card className="mobile-block">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{station.name}</p>
                      <p className="text-xs text-muted-foreground">{station.distanceKm} km · ¥{station.pricePerKwh}/kWh</p>
                    </div>
                    <Badge variant={station.availablePiles > 0 ? 'default' : 'secondary'}>
                      空 {station.availablePiles}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {station.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
