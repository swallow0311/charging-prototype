import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Station } from '@/types'

interface StationMapPanelProps {
  stations: Station[]
  selectedId?: string
  onSelect?: (station: Station) => void
  borderless?: boolean
}

function MapPinMarker({ index, selected }: { index: number; selected: boolean }) {
  return (
    <div className={cn('relative transition-transform', selected && 'scale-110')}>
      <svg viewBox="0 0 28 36" className="h-9 w-7 drop-shadow-md" aria-hidden>
        <path
          d="M14 0C6.82 0 1 5.82 1 13c0 9.75 13 23 13 23s13-13.25 13-23C27 5.82 21.18 0 14 0z"
          fill="#F54242"
        />
        <circle cx="14" cy="13" r="7" fill="#F54242" />
      </svg>
      <span className="absolute top-[7px] left-1/2 -translate-x-1/2 text-[10px] font-bold leading-none text-white">
        {index + 1}
      </span>
    </div>
  )
}

/** GIS 场景分布 — 浅色矢量地图风格 */
export function StationMapPanel({ stations, selectedId, onSelect, borderless }: StationMapPanelProps) {
  const [zoom, setZoom] = useState(1)
  const lats = stations.map((s) => s.lat)
  const lngs = stations.map((s) => s.lng)
  const minLat = Math.min(...lats) - 0.04
  const maxLat = Math.max(...lats) + 0.04
  const minLng = Math.min(...lngs) - 0.04
  const maxLng = Math.max(...lngs) + 0.04

  const toPos = (lat: number, lng: number) => ({
    left: `${((lng - minLng) / (maxLng - minLng)) * 100}%`,
    top: `${((maxLat - lat) / (maxLat - minLat)) * 100}%`,
  })

  return (
    <Card className={cn('admin-card', borderless && 'admin-card--borderless')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">GIS 场景分布</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}><Minus className="size-3.5" /></Button>
          <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon-sm" onClick={() => setZoom((z) => Math.min(2, z + 0.2))}><Plus className="size-3.5" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-56 overflow-hidden rounded-lg bg-[#eef0f3]">
          <div
            className="absolute inset-0 origin-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 224" preserveAspectRatio="xMidYMid slice">
              <rect width="640" height="224" fill="#eef0f3" />
              {/* 水域 */}
              <path d="M0,0 L640,0 L640,52 L480,68 L360,42 L240,58 L120,48 L0,62 Z" fill="#c5e8ec" opacity="0.85" />
              <path d="M520,180 Q580,160 640,175 L640,224 L480,224 Q500,200 520,180 Z" fill="#c5e8ec" opacity="0.7" />
              {/* 绿地 */}
              <ellipse cx="520" cy="155" rx="48" ry="28" fill="#e3f0df" />
              <ellipse cx="100" cy="170" rx="36" ry="22" fill="#e3f0df" />
              {/* 主干道 */}
              <path d="M0,108 L640,108" stroke="#f5c86a" strokeWidth="10" strokeLinecap="round" />
              <path d="M280,0 L280,224" stroke="#f5c86a" strokeWidth="8" strokeLinecap="round" />
              <path d="M0,168 Q200,148 400,162 T640,152" stroke="#f5c86a" strokeWidth="7" strokeLinecap="round" fill="none" />
              {/* 次干道 */}
              <path d="M0,52 L640,52" stroke="#d8dde3" strokeWidth="3" />
              <path d="M0,82 L640,82" stroke="#d8dde3" strokeWidth="2.5" />
              <path d="M140,0 L140,224" stroke="#d8dde3" strokeWidth="2.5" />
              <path d="M420,0 L420,224" stroke="#d8dde3" strokeWidth="2.5" />
              <path d="M560,0 L560,224" stroke="#d8dde3" strokeWidth="2" />
              {/* 支路 */}
              <path d="M0,138 L640,138" stroke="#e2e6ea" strokeWidth="2" />
              <path d="M0,188 L640,188" stroke="#e2e6ea" strokeWidth="2" />
              <path d="M200,0 L200,224" stroke="#e2e6ea" strokeWidth="2" />
              <path d="M360,0 L360,224" stroke="#e2e6ea" strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            {stations.map((station, i) => {
              const pos = toPos(station.lat, station.lng)
              const isSelected = station.id === selectedId
              return (
                <button
                  key={station.id}
                  type="button"
                  className="absolute z-10 -translate-x-1/2 -translate-y-full"
                  style={pos}
                  title={station.name}
                  onClick={() => onSelect?.(station)}
                >
                  <MapPinMarker index={i} selected={isSelected} />
                </button>
              )
            })}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {stations.map((station, i) => (
            <button
              key={station.id}
              type="button"
              className={cn(
                'flex items-center justify-between rounded-md p-3 text-left text-sm transition-colors',
                station.id === selectedId ? 'bg-[var(--admin-selected-bg)]' : 'bg-[var(--admin-hover-bg)] hover:bg-[var(--admin-selected-bg)]/60',
              )}
              onClick={() => onSelect?.(station)}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{i + 1}. {station.name}</p>
                <p className="text-xs text-muted-foreground">{station.onlinePiles} 在线 · {station.availablePiles} 空闲</p>
              </div>
              <Badge variant="secondary">{station.totalPiles} 桩</Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
