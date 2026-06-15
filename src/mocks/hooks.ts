import { useCallback, useEffect, useState } from 'react'

import { generateRealtimeStream, MOCK_DEVICES } from '@/mocks/admin-data'
import type { DeviceRealtimeStream } from '@/types'

export function useDeviceRealtimeStream(deviceId: string | null, intervalMs = 2000) {
  const [stream, setStream] = useState<DeviceRealtimeStream | null>(null)

  useEffect(() => {
    if (!deviceId) {
      setStream(null)
      return
    }

    const device = MOCK_DEVICES.find((d) => d.id === deviceId)
    if (!device) return

    const update = () => {
      setStream(generateRealtimeStream(deviceId, device.currentPowerKw, device.temperature))
    }

    update()
    const timer = setInterval(update, intervalMs)
    return () => clearInterval(timer)
  }, [deviceId, intervalMs])

  return stream
}

export interface AdminSessionUser {
  username: string
  role: string
  displayName: string
  loginAt: string
}

export function useAuth() {
  const [user, setUser] = useState<AdminSessionUser | null>(() => {
    const stored = sessionStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((username: string, role: string, displayName: string) => {
    const u: AdminSessionUser = {
      username,
      role,
      displayName,
      loginAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
    sessionStorage.setItem('admin_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_user')
    setUser(null)
  }, [])

  return { user, login, logout, isAuthenticated: !!user }
}
