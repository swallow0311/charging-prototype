import { useEffect, useMemo, useState } from 'react'

import type { ThermalRiskLevel } from '@/types'

export interface SchedulingLiveMetrics {
  clusterMaxKw: number
  currentLoadKw: number
  loadRatePercent: number
  chargingVehicleCount: number
  costSavingYuan: number
  batteryAlertCount: number
  transformerThresholdKw: number
  isOverloaded: boolean
}

export interface PowerSeriesPoint {
  hour: string
  threshold: number
  actual: number
  predicted: number
}

export interface GunSlotNode {
  id: string
  clusterName: string
  gunName: string
  powerKw: number
  plateNumber?: string
  soc?: number
  status: 'charging' | 'idle' | 'fault'
}

export interface BatteryRiskRow {
  id: string
  plateNumber: string
  stationName: string
  gunName: string
  riskLevel: ThermalRiskLevel
  bmsRiskType: string
  aiAction: string
  detectedAt: string
}

export interface SchedulingEventLog {
  id: string
  time: string
  type: string
  detail: string
  operator: string
}

export interface SchedulingRevenueRow {
  id: string
  date: string
  peakShavingYuan: number
  v2gYuan: number
  totalSavingYuan: number
}

export interface ChargingGunDetail {
  plateNumber: string
  stationName: string
  gunName: string
  powerKw: number
  soc: number
  batteryTemp: number
  startedAt: string
  estimatedRemainMin: number
}

const BASE_METRICS: SchedulingLiveMetrics = {
  clusterMaxKw: 2160,
  currentLoadKw: 1685,
  loadRatePercent: 78,
  chargingVehicleCount: 14,
  costSavingYuan: 2860,
  batteryAlertCount: 3,
  transformerThresholdKw: 2000,
  isOverloaded: false,
}

export const MOCK_GUN_SLOTS: GunSlotNode[] = [
  { id: 'g1', clusterName: 'A区集群', gunName: 'A-01', powerKw: 98, plateNumber: '粤B·D12345', soc: 62, status: 'charging' },
  { id: 'g2', clusterName: 'A区集群', gunName: 'A-02', powerKw: 0, status: 'idle' },
  { id: 'g3', clusterName: 'A区集群', gunName: 'A-03', powerKw: 85, plateNumber: '粤B·A88888', soc: 45, status: 'charging' },
  { id: 'g4', clusterName: 'B区集群', gunName: 'B-01', powerKw: 0, status: 'fault' },
  { id: 'g5', clusterName: 'B区集群', gunName: 'B-02', powerKw: 120, plateNumber: '粤B·K99999', soc: 78, status: 'charging' },
  { id: 'g6', clusterName: 'C区集群', gunName: 'C-01', powerKw: 165, plateNumber: '粤B·F56789', soc: 55, status: 'charging' },
]

export const MOCK_BATTERY_RISKS: BatteryRiskRow[] = [
  { id: 'br1', plateNumber: '粤B·X99999', stationName: '科技园超级充电站', gunName: 'B-01', riskLevel: 'critical', bmsRiskType: '过温保护', aiAction: '已自动降功率 50%', detectedAt: '2026-06-13 14:25:00' },
  { id: 'br2', plateNumber: '粤B·K88888', stationName: '福田中心快充站', gunName: 'C-04', riskLevel: 'warning', bmsRiskType: '单体压差偏大', aiAction: '持续监控中', detectedAt: '2026-06-13 14:20:00' },
  { id: 'br3', plateNumber: '粤B·M77777', stationName: '科技园超级充电站', gunName: 'A-01', riskLevel: 'warning', bmsRiskType: '电流波动', aiAction: '建议限流至 80kW', detectedAt: '2026-06-13 14:15:00' },
]

export const MOCK_SCHEDULING_LOGS: SchedulingEventLog[] = [
  { id: 'sl1', time: '2026-06-13 14:32:05', type: '功率调度', detail: 'A区集群负载 85%，自动均衡至 B区', operator: 'AI 调度引擎' },
  { id: 'sl2', time: '2026-06-13 14:28:12', type: '风险处置', detail: 'B-01 过温，触发降功率保护', operator: 'AI 调度引擎' },
  { id: 'sl3', time: '2026-06-13 14:15:00', type: '模式切换', detail: '切换至全自动 AI 调度模式', operator: '运维工程师' },
  { id: 'sl4', time: '2026-06-13 13:45:00', type: 'V2G 放电', detail: '宝安机场枢纽站反向送电 120kW', operator: 'AI 调度引擎' },
]

export const MOCK_SCHEDULING_REVENUE: SchedulingRevenueRow[] = [
  { id: 'sr1', date: '2026-06-01', peakShavingYuan: 820, v2gYuan: 450, totalSavingYuan: 1270 },
  { id: 'sr2', date: '2026-06-02', peakShavingYuan: 960, v2gYuan: 380, totalSavingYuan: 1340 },
  { id: 'sr3', date: '2026-06-03', peakShavingYuan: 1100, v2gYuan: 520, totalSavingYuan: 1620 },
]

export const MOCK_HEATMAP: number[][] = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => Math.round(30 + Math.sin((hour + day) / 3) * 35 + (hour >= 8 && hour <= 20 ? 25 : 0))),
)

export function buildPowerSeries(): PowerSeriesPoint[] {
  return Array.from({ length: 24 }, (_, i) => {
    const peak = i >= 8 && i <= 20 ? 400 : 0
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      threshold: 2000,
      actual: Math.round(900 + Math.sin(i / 2.5) * 500 + peak + Math.random() * 80),
      predicted: Math.round(880 + Math.sin(i / 2.5) * 480 + peak),
    }
  })
}

export function useSchedulingRealtime(intervalMs = 2500) {
  const [metrics, setMetrics] = useState<SchedulingLiveMetrics>(BASE_METRICS)
  const [series, setSeries] = useState<PowerSeriesPoint[]>(() => buildPowerSeries())
  const [guns, setGuns] = useState<GunSlotNode[]>(MOCK_GUN_SLOTS)

  useEffect(() => {
    const tick = () => {
      setMetrics((prev) => {
        const jitter = () => (Math.random() - 0.5) * 120
        const currentLoadKw = Math.max(800, Math.min(2300, prev.currentLoadKw + jitter()))
        const loadRatePercent = Math.round((currentLoadKw / prev.clusterMaxKw) * 100)
        const isOverloaded = currentLoadKw > prev.transformerThresholdKw
        return {
          ...prev,
          currentLoadKw: Math.round(currentLoadKw),
          loadRatePercent,
          isOverloaded,
          chargingVehicleCount: 12 + Math.floor(Math.random() * 5),
          costSavingYuan: prev.costSavingYuan + Math.round(Math.random() * 20),
          batteryAlertCount: isOverloaded ? prev.batteryAlertCount + 1 : prev.batteryAlertCount,
        }
      })
      setSeries((prev) => {
        const idx = new Date().getHours()
        return prev.map((p, i) => i === idx
          ? { ...p, actual: Math.round(p.actual + (Math.random() - 0.5) * 60) }
          : p)
      })
      setGuns((prev) => prev.map((g) => g.status === 'charging'
        ? { ...g, powerKw: Math.max(20, g.powerKw + (Math.random() - 0.5) * 15), soc: Math.min(100, (g.soc ?? 50) + 0.5) }
        : g))
    }
    const timer = setInterval(tick, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return useMemo(() => ({ metrics, series, guns }), [metrics, series, guns])
}

export function getGunDetail(gun: GunSlotNode): ChargingGunDetail | null {
  if (gun.status !== 'charging' || !gun.plateNumber) return null
  return {
    plateNumber: gun.plateNumber,
    stationName: '科技园超级充电站',
    gunName: gun.gunName,
    powerKw: gun.powerKw,
    soc: gun.soc ?? 0,
    batteryTemp: 38 + Math.random() * 12,
    startedAt: '2026-06-13 13:45:00',
    estimatedRemainMin: Math.round(30 + Math.random() * 40),
  }
}
