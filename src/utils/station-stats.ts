import type { Station } from '@/types'

export interface StationPileStats {
  charging: number
  idle: number
  fault: number
  offline: number
}

export function getStationPileStats(station: Station): StationPileStats {
  return station.pileGroups.reduce(
    (acc, g) => ({
      charging: acc.charging + g.charging,
      idle: acc.idle + g.idle,
      fault: acc.fault + g.fault,
      offline: acc.offline + g.offline,
    }),
    { charging: 0, idle: 0, fault: 0, offline: 0 },
  )
}
