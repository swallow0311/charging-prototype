import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  MOCK_INVOICE_PROFILE,
  MOCK_INVOICE_RECORDS,
  MOCK_MOBILE_ORDERS,
  MOCK_RESERVATIONS,
  MOCK_STATION_DETAILS,
  MOCK_USER_PROFILE,
  MOCK_VEHICLES_WITH_STATUS,
  tickChargingInfo,
} from '@/mocks/mobile-data'
import type {
  InvoiceProfile,
  InvoiceRecord,
  MobileOrder,
  MobileReservation,
  MobileUserProfile,
  StationDetail,
  VehicleWithStatus,
} from '@/types'

const AUTH_KEY = 'mobile_authorized'
const RESERVATIONS_KEY = 'mobile_reservations'
const VEHICLES_KEY = 'mobile_vehicles'
const USER_KEY = 'mobile_user'
const INVOICE_PROFILE_KEY = 'mobile_invoice_profile'
const INVOICE_RECORDS_KEY = 'mobile_invoice_records'
const ORDERS_KEY = 'mobile_orders'

interface MobileStoreContextValue {
  isAuthorized: boolean
  authorize: () => void
  resetAuth: () => void
  user: MobileUserProfile
  invoiceProfile: InvoiceProfile
  invoiceRecords: InvoiceRecord[]
  vehicles: VehicleWithStatus[]
  chargingVehicles: VehicleWithStatus[]
  reservations: MobileReservation[]
  orders: MobileOrder[]
  getStationDetail: (id: string) => StationDetail | undefined
  getVehicle: (id: string) => VehicleWithStatus | undefined
  stopCharging: (vehicleId: string) => void
  cancelReservation: (reservationId: string) => void
  createReservation: (stationId: string, stationName: string, pileName: string, vehicleId?: string) => void
  updateUserProfile: (profile: MobileUserProfile) => void
  updateInvoiceProfile: (profile: InvoiceProfile) => void
  requestInvoice: (orderId: string) => void
}

const MobileStoreContext = createContext<MobileStoreContextValue | null>(null)

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function MobileStoreProvider({ children }: { children: ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')
  const [user, setUser] = useState<MobileUserProfile>(() => loadJson(USER_KEY, MOCK_USER_PROFILE))
  const [invoiceProfile, setInvoiceProfile] = useState<InvoiceProfile>(() => loadJson(INVOICE_PROFILE_KEY, MOCK_INVOICE_PROFILE))
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>(() => loadJson(INVOICE_RECORDS_KEY, MOCK_INVOICE_RECORDS))
  const [orders, setOrders] = useState<MobileOrder[]>(() => loadJson(ORDERS_KEY, MOCK_MOBILE_ORDERS))
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>(() => loadJson(VEHICLES_KEY, MOCK_VEHICLES_WITH_STATUS))
  const [reservations, setReservations] = useState<MobileReservation[]>(() => loadJson(RESERVATIONS_KEY, MOCK_RESERVATIONS))

  const chargingVehicles = useMemo(
    () => vehicles.filter((v) => v.usageStatus === 'charging' && v.chargingInfo),
    [vehicles],
  )

  useEffect(() => {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles))
  }, [vehicles])

  useEffect(() => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations))
  }, [reservations])

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem(INVOICE_PROFILE_KEY, JSON.stringify(invoiceProfile))
  }, [invoiceProfile])

  useEffect(() => {
    localStorage.setItem(INVOICE_RECORDS_KEY, JSON.stringify(invoiceRecords))
  }, [invoiceRecords])

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  }, [orders])

  // 充电中车辆 Mock 实时数据刷新
  useEffect(() => {
    if (chargingVehicles.length === 0) return
    const timer = setInterval(() => {
      setVehicles((prev) => prev.map((v) => {
        if (v.usageStatus !== 'charging' || !v.chargingInfo) return v
        const next = tickChargingInfo(v.chargingInfo)
        return { ...v, soc: next.soc, chargingInfo: next }
      }))
    }, 2000)
    return () => clearInterval(timer)
  }, [chargingVehicles.length])

  const authorize = useCallback(() => {
    localStorage.setItem(AUTH_KEY, 'true')
    setIsAuthorized(true)
  }, [])

  const resetAuth = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthorized(false)
  }, [])

  const getStationDetail = useCallback((id: string) => MOCK_STATION_DETAILS.find((s) => s.id === id), [])

  const getVehicle = useCallback((id: string) => vehicles.find((v) => v.id === id), [vehicles])

  const stopCharging = useCallback((vehicleId: string) => {
    setVehicles((prev) => prev.map((v) => {
      if (v.id !== vehicleId || v.usageStatus !== 'charging') return v
      return { ...v, usageStatus: 'idle' as const, chargingInfo: undefined, soc: Math.min(100, v.soc + 5) }
    }))
  }, [])

  const cancelReservation = useCallback((reservationId: string) => {
    setReservations((prev) => prev.map((r) =>
      r.id === reservationId ? { ...r, status: 'cancelled' as const } : r,
    ))
    setVehicles((prev) => prev.map((v) => {
      if (v.reservationInfo?.reservationId !== reservationId) return v
      return { ...v, usageStatus: 'idle' as const, reservationInfo: undefined }
    }))
  }, [])

  const createReservation = useCallback((stationId: string, stationName: string, pileName: string, vehicleId?: string) => {
    const until = new Date(Date.now() + 30 * 60 * 1000)
    const reservationId = `r-${Date.now()}`
    const targetVehicleId = vehicleId ?? vehicles.find((v) => v.usageStatus === 'idle')?.id ?? vehicles[0]?.id

    const newReservation: MobileReservation = {
      id: reservationId,
      vehicleId: targetVehicleId,
      stationId,
      stationName,
      pileName,
      reservedUntil: until.toISOString(),
      status: 'active',
    }

    setReservations((prev) => [newReservation, ...prev])
    setVehicles((prev) => prev.map((v) => {
      if (v.id !== targetVehicleId) return v
      return {
        ...v,
        usageStatus: 'reserved' as const,
        reservationInfo: {
          reservationId,
          stationId,
          stationName,
          pileName,
          reservedUntil: until.toISOString(),
        },
      }
    }))
  }, [vehicles])

  const updateUserProfile = useCallback((profile: MobileUserProfile) => {
    setUser(profile)
  }, [])

  const updateInvoiceProfile = useCallback((profile: InvoiceProfile) => {
    setInvoiceProfile(profile)
  }, [])

  const requestInvoice = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const newRecord: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      orderId,
      stationName: order.stationName,
      amount: order.amount,
      energyKwh: order.energyKwh,
      date: order.date,
      status: 'processing',
    }

    setInvoiceRecords((prev) => [newRecord, ...prev])
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, invoiceStatus: 'pending' as const } : o,
    ))
  }, [orders])

  const value = useMemo<MobileStoreContextValue>(() => ({
    isAuthorized,
    authorize,
    resetAuth,
    user,
    invoiceProfile,
    invoiceRecords,
    vehicles,
    chargingVehicles,
    reservations,
    orders,
    getStationDetail,
    getVehicle,
    stopCharging,
    cancelReservation,
    createReservation,
    updateUserProfile,
    updateInvoiceProfile,
    requestInvoice,
  }), [
    isAuthorized, authorize, resetAuth, user, invoiceProfile, invoiceRecords,
    vehicles, chargingVehicles, reservations, orders,
    getStationDetail, getVehicle, stopCharging, cancelReservation, createReservation,
    updateUserProfile, updateInvoiceProfile, requestInvoice,
  ])

  return (
    <MobileStoreContext.Provider value={value}>
      {children}
    </MobileStoreContext.Provider>
  )
}

export function useMobileStore() {
  const ctx = useContext(MobileStoreContext)
  if (!ctx) throw new Error('useMobileStore must be used within MobileStoreProvider')
  return ctx
}

/** 计算预约剩余有效时间 */
export function getReservationRemainingMs(reservedUntil: string): number {
  return Math.max(0, new Date(reservedUntil).getTime() - Date.now())
}

export function formatRemainingTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function findNearbyStation(id: string) {
  return MOCK_STATION_DETAILS.find((s) => s.id === id)
}

/** 路由 state：记录返回来源页 */
export interface MobileNavState {
  from?: string
  tab?: string
}

export function getBackPath(state: unknown, fallback: string): string {
  const nav = state as MobileNavState | null
  return nav?.from ?? fallback
}
