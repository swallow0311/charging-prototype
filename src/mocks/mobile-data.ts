import type {
  InvoiceProfile,
  InvoiceRecord,
  MobileReservation,
  MobileUserProfile,
  StationDetail,
  VehicleChargingInfo,
  VehicleWithStatus,
} from '@/types'
import type { MobileOrder, NearbyStation } from '@/types'

export const MOCK_USER_PROFILE: MobileUserProfile = {
  displayName: '王小明',
  phone: '13812348888',
  email: 'wangxm@example.com',
  gender: 'male',
  city: '深圳',
}

export const MOCK_INVOICE_PROFILE: InvoiceProfile = {
  titleType: 'personal',
  title: '王小明',
  email: 'wangxm@example.com',
  phone: '13812348888',
}

export const APP_BRAND_NAME = '智充云'

export const MOCK_NEARBY_STATIONS: NearbyStation[] = [
  {
    id: 's1', name: '科技园超级充电站', address: '南山区科技园南路88号',
    distanceKm: 0.8, availablePiles: 12, totalPiles: 48, pricePerKwh: 0.85,
    rating: 4.8, tags: ['超充', '24小时', '免费停车'],
  },
  {
    id: 's2', name: '福田中心快充站', address: '福田区福华一路168号',
    distanceKm: 2.3, availablePiles: 8, totalPiles: 32, pricePerKwh: 0.78,
    rating: 4.6, tags: ['快充', '地下停车场'],
  },
  {
    id: 's3', name: '宝安机场枢纽站', address: '宝安区航城大道200号',
    distanceKm: 5.1, availablePiles: 22, totalPiles: 64, pricePerKwh: 0.92,
    rating: 4.9, tags: ['超充', '即插即充'],
  },
  {
    id: 's4', name: '龙华智能制造站', address: '龙华区工业大道56号',
    distanceKm: 6.7, availablePiles: 0, totalPiles: 24, pricePerKwh: 0.72,
    rating: 4.2, tags: ['维护中'],
  },
]

export const MOCK_STATION_DETAILS: StationDetail[] = MOCK_NEARBY_STATIONS.map((s) => ({
  ...s,
  openHours: '00:00 - 24:00',
  phone: '400-888-6666',
  description: `${s.name}，配备多种功率充电桩，支持即插即充与预约锁桩。`,
  piles: Array.from({ length: Math.min(6, s.totalPiles) }, (_, i) => ({
    id: `${s.id}-p${i + 1}`,
    name: `${String.fromCharCode(65 + (i % 3))}区-${String(i + 1).padStart(2, '0')}号桩`,
    powerKw: i % 2 === 0 ? 120 : 60,
    status: i < s.availablePiles ? 'available' as const : i === s.availablePiles ? 'busy' as const : 'offline' as const,
  })),
}))

export const MOCK_VEHICLES_WITH_STATUS: VehicleWithStatus[] = [
  {
    id: 'v1', plateNumber: '粤B·D12345', brand: '比亚迪', model: '汉 EV',
    batteryCapacityKwh: 85.4, isDefault: true, soc: 62, usageStatus: 'charging',
    chargingInfo: {
      sessionId: 'sess-001', stationName: '科技园超级充电站', pileName: 'A区-01号桩',
      powerKw: 98.5, energyKwh: 28.6, cost: 45.8, soc: 62, batteryTemp: 38,
      estimatedMinutes: 25, startedAt: '2026-06-13 14:05:00',
    },
  },
  {
    id: 'v2', plateNumber: '粤B·F67890', brand: '特斯拉', model: 'Model 3',
    batteryCapacityKwh: 60.0, isDefault: false, soc: 48, usageStatus: 'charging',
    chargingInfo: {
      sessionId: 'sess-002', stationName: '福田中心快充站', pileName: 'C区-04号桩',
      powerKw: 72.0, energyKwh: 15.2, cost: 24.3, soc: 48, batteryTemp: 35,
      estimatedMinutes: 38, startedAt: '2026-06-13 14:20:00',
    },
  },
  {
    id: 'v3', plateNumber: '粤B·A88888', brand: '蔚来', model: 'ES6',
    batteryCapacityKwh: 75.0, isDefault: false, soc: 35, usageStatus: 'reserved',
    reservationInfo: {
      reservationId: 'r1', stationId: 's1', stationName: '科技园超级充电站',
      pileName: 'A区-02号桩', reservedUntil: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
    },
  },
]

export const MOCK_MOBILE_ORDERS: MobileOrder[] = [
  { id: 'mo1', stationName: '科技园超级充电站', energyKwh: 42.5, amount: 68.0, status: 'completed', date: '2026-06-13', invoiceStatus: 'none' },
  { id: 'mo2', stationName: '福田中心快充站', energyKwh: 35.0, amount: 56.0, status: 'completed', date: '2026-06-10', invoiceStatus: 'issued' },
  { id: 'mo3', stationName: '宝安机场枢纽站', energyKwh: 58.0, amount: 93.0, status: 'cancelled', date: '2026-06-05', invoiceStatus: 'none' },
]

export const MOCK_INVOICE_RECORDS: InvoiceRecord[] = [
  {
    id: 'inv1', orderId: 'mo2', stationName: '福田中心快充站',
    amount: 56.0, energyKwh: 35.0, date: '2026-06-10',
    status: 'issued', invoiceNo: 'INV20260610001', issuedAt: '2026-06-11 10:30:00',
  },
  {
    id: 'inv2', orderId: 'mo1', stationName: '科技园超级充电站',
    amount: 68.0, energyKwh: 42.5, date: '2026-06-13',
    status: 'pending',
  },
]

const reservationUntil = new Date(Date.now() + 18 * 60 * 1000).toISOString()

export const MOCK_RESERVATIONS: MobileReservation[] = [
  {
    id: 'r1', vehicleId: 'v3', stationId: 's1', stationName: '科技园超级充电站',
    pileName: 'A区-02号桩', reservedUntil: reservationUntil, status: 'active',
  },
  {
    id: 'r2', vehicleId: 'v1', stationId: 's2', stationName: '福田中心快充站',
    pileName: 'C区-01号桩', reservedUntil: '2026-06-10 18:00:00', status: 'used',
  },
]

export function tickChargingInfo(info: VehicleChargingInfo): VehicleChargingInfo {
  const jitter = () => (Math.random() - 0.5) * 3
  return {
    ...info,
    powerKw: Math.max(0, info.powerKw + jitter()),
    energyKwh: info.energyKwh + 0.05,
    batteryTemp: info.batteryTemp + jitter() * 0.2,
    soc: Math.min(100, info.soc + 0.08),
    cost: info.cost + 0.02,
    estimatedMinutes: Math.max(0, info.estimatedMinutes - 0.05),
  }
}
