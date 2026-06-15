import type {
  BmsRiskLog,
  BillingConfig,
  ChargingDevice,
  ChargingOrder,
  ClusterAllocation,
  DashboardMetric,
  DemandForecastPoint,
  DeviceChargingHistory,
  DeviceType,
  EnterprisePackage,
  FinanceSummary,
  FleetPackage,
  HighRiskChargingRecord,
  PropertyReconciliation,
  PropertyShareConfig,
  Station,
  TariffSlot,
  ThermalRiskAlert,
  User,
  V2GRevenueStats,
  VehicleOwner,
} from '@/types'
import type {
  BarChartDataPoint,
  GridLoadDataPoint,
  LineChartDataPoint,
  PieChartDataPoint,
} from '@/types/charts'

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', role: 'admin', displayName: '系统管理员' },
  { id: 'u2', username: 'property', role: 'property', displayName: '物业经理' },
  { id: 'u3', username: 'operator', role: 'operator', displayName: '运维工程师' },
]

export const MOCK_DASHBOARD_METRICS: DashboardMetric[] = [
  { id: 'm1', label: '总设备数量', value: 368, unit: '台', changePercent: 2.1, trend: 'up' },
  { id: 'm2', label: '在线率', value: '93.0', unit: '%', changePercent: -0.8, trend: 'down' },
  { id: 'm3', label: '今日充电量', value: 12846, unit: 'kWh', changePercent: 12.5, trend: 'up' },
  { id: 'm4', label: '总营收', value: '¥576,800', changePercent: 8.3, trend: 'up' },
  { id: 'm5', label: '故障设备', value: 8, unit: '台', changePercent: -20, trend: 'down' },
]

export const MOCK_CHARGING_TREND: LineChartDataPoint[] = [
  { time: '00:00', value: 120 },
  { time: '04:00', value: 85 },
  { time: '08:00', value: 320 },
  { time: '12:00', value: 580 },
  { time: '16:00', value: 720 },
  { time: '20:00', value: 490 },
  { time: '23:59', value: 210 },
]

export const MOCK_REVENUE_BAR: BarChartDataPoint[] = [
  { name: '周一', value: 62000 },
  { name: '周二', value: 71000 },
  { name: '周三', value: 68000 },
  { name: '周四', value: 82000 },
  { name: '周五', value: 91000 },
  { name: '周六', value: 105000 },
  { name: '周日', value: 98000 },
]

export const MOCK_FAULT_PIE: PieChartDataPoint[] = [
  { name: '通信故障', value: 35, fill: '#ef4444' },
  { name: '过温保护', value: 25, fill: '#f97316' },
  { name: '枪头异常', value: 20, fill: '#eab308' },
  { name: '电源模块', value: 12, fill: '#3b82f6' },
  { name: '其他', value: 8, fill: '#6b7280' },
]

export const MOCK_STATIONS: Station[] = [
  {
    id: 's1', name: '科技园超级充电站', address: '南山区科技园南路88号', city: '深圳',
    lat: 22.54, lng: 113.95, totalPiles: 48, availablePiles: 12, onlinePiles: 44,
    totalPowerKw: 5760, operator: '深圳智充科技',
    gridLoadPercent: 78, maxGridCapacityKw: 2000, currentLoadKw: 1560,
    status: 'active', propertySharePercent: 25, createdAt: '2024-03-15',
    edgeGateway: { gatewayId: 'GW-S1', ip: '10.0.1.1', firmwareVersion: 'v2.4.0', lastSyncAt: '2026-06-13 14:30:00', status: 'online' },
    schedulingParams: { mode: 'auto', maxClusterPowerKw: 1800, loadBalanceEnabled: true, peakShavingEnabled: true, v2gEnabled: true },
    pileGroups: [
      { id: 'pg1', name: 'A区桩群', total: 24, charging: 8, idle: 12, fault: 1, offline: 3 },
      { id: 'pg2', name: 'B区桩群', total: 24, charging: 6, idle: 10, fault: 2, offline: 6 },
    ],
  },
  {
    id: 's2', name: '福田中心快充站', address: '福田区福华一路168号', city: '深圳',
    lat: 22.53, lng: 114.06, totalPiles: 32, availablePiles: 8, onlinePiles: 28,
    totalPowerKw: 3840, operator: '福田能源运营',
    gridLoadPercent: 62, maxGridCapacityKw: 1500, currentLoadKw: 930,
    status: 'active', propertySharePercent: 30, createdAt: '2024-06-20',
    edgeGateway: { gatewayId: 'GW-S2', ip: '10.0.2.1', firmwareVersion: 'v2.3.8', lastSyncAt: '2026-06-13 14:28:00', status: 'online' },
    schedulingParams: { mode: 'auto', maxClusterPowerKw: 1400, loadBalanceEnabled: true, peakShavingEnabled: false, v2gEnabled: false },
    pileGroups: [
      { id: 'pg3', name: 'C区桩群', total: 32, charging: 5, idle: 8, fault: 0, offline: 4 },
    ],
  },
  {
    id: 's3', name: '宝安机场枢纽站', address: '宝安区航城大道200号', city: '深圳',
    lat: 22.63, lng: 113.82, totalPiles: 64, availablePiles: 22, onlinePiles: 60,
    totalPowerKw: 9600, operator: '空港新能源',
    gridLoadPercent: 45, maxGridCapacityKw: 3200, currentLoadKw: 1440,
    status: 'active', propertySharePercent: 20, createdAt: '2024-01-10',
    edgeGateway: { gatewayId: 'GW-S3', ip: '10.0.3.1', firmwareVersion: 'v2.4.1', lastSyncAt: '2026-06-13 14:31:00', status: 'online' },
    schedulingParams: { mode: 'manual', maxClusterPowerKw: 3000, loadBalanceEnabled: true, peakShavingEnabled: true, v2gEnabled: true },
    pileGroups: [
      { id: 'pg4', name: 'D区桩群', total: 32, charging: 10, idle: 18, fault: 1, offline: 3 },
      { id: 'pg5', name: 'E区桩群', total: 32, charging: 8, idle: 20, fault: 0, offline: 4 },
    ],
  },
  {
    id: 's4', name: '龙华智能制造站', address: '龙华区工业大道56号', city: '深圳',
    lat: 22.72, lng: 114.03, totalPiles: 24, availablePiles: 0, onlinePiles: 0,
    totalPowerKw: 2880, operator: '龙华工业园物业',
    gridLoadPercent: 95, maxGridCapacityKw: 800, currentLoadKw: 760,
    status: 'maintenance', propertySharePercent: 28, createdAt: '2025-02-01',
    edgeGateway: { gatewayId: 'GW-S4', ip: '10.0.4.1', firmwareVersion: 'v2.2.0', lastSyncAt: '2026-06-12 08:00:00', status: 'offline' },
    schedulingParams: { mode: 'manual', maxClusterPowerKw: 800, loadBalanceEnabled: false, peakShavingEnabled: false, v2gEnabled: false },
    pileGroups: [
      { id: 'pg6', name: 'F区桩群', total: 24, charging: 0, idle: 0, fault: 4, offline: 20 },
    ],
  },
]

export const MOCK_DEVICES: ChargingDevice[] = [
  {
    id: 'd1', deviceCode: 'SZ-KJ-A01', deviceType: 'dc_air', stationId: 's1', stationName: '科技园超级充电站', name: 'A区-01号桩',
    model: 'DC-120kW', powerKw: 120, status: 'charging', faultTags: [],
    currentPowerKw: 98.5, voltage: 750, current: 131, temperature: 42, totalEnergyKwh: 125680,
    firmwareVersion: 'v3.2.1', lastHeartbeat: '2026-06-13 14:32:05',
  },
  {
    id: 'd2', deviceCode: 'SZ-KJ-A02', deviceType: 'dc_air', stationId: 's1', stationName: '科技园超级充电站', name: 'A区-02号桩',
    model: 'DC-120kW', powerKw: 120, status: 'online', faultTags: [],
    currentPowerKw: 0, voltage: 0, current: 0, temperature: 28, totalEnergyKwh: 98420,
    firmwareVersion: 'v3.2.1', lastHeartbeat: '2026-06-13 14:32:03',
  },
  {
    id: 'd3', deviceCode: 'SZ-KJ-B01', deviceType: 'dc_air', stationId: 's1', stationName: '科技园超级充电站', name: 'B区-01号桩',
    model: 'DC-60kW', powerKw: 60, status: 'fault', faultTags: ['过温保护', '自动停机'],
    currentPowerKw: 0, voltage: 0, current: 0, temperature: 68, totalEnergyKwh: 45200,
    firmwareVersion: 'v3.1.8', lastHeartbeat: '2026-06-13 14:28:12',
  },
  {
    id: 'd4', deviceCode: 'SZ-FT-C03', deviceType: 'dc_liquid', stationId: 's2', stationName: '福田中心快充站', name: 'C区-03号桩',
    model: 'DC-180kW', powerKw: 180, status: 'offline', faultTags: ['通信中断'],
    currentPowerKw: 0, voltage: 0, current: 0, temperature: 25, totalEnergyKwh: 210300,
    firmwareVersion: 'v3.2.1', lastHeartbeat: '2026-06-13 12:15:00',
  },
  {
    id: 'd5', deviceCode: 'SZ-FT-C04', deviceType: 'dc_liquid', stationId: 's2', stationName: '福田中心快充站', name: 'C区-04号桩',
    model: 'DC-180kW', powerKw: 180, status: 'charging', faultTags: [],
    currentPowerKw: 165, voltage: 800, current: 206, temperature: 45, totalEnergyKwh: 178900,
    firmwareVersion: 'v3.2.1', lastHeartbeat: '2026-06-13 14:32:06',
  },
  {
    id: 'd6', deviceCode: 'SZ-BA-D01', deviceType: 'dc_liquid', stationId: 's3', stationName: '宝安机场枢纽站', name: 'D区-01号桩',
    model: 'DC-240kW', powerKw: 240, status: 'idle', faultTags: [],
    currentPowerKw: 0, voltage: 0, current: 0, temperature: 30, totalEnergyKwh: 320500,
    firmwareVersion: 'v3.3.0', lastHeartbeat: '2026-06-13 14:31:58',
  },
  {
    id: 'd7', deviceCode: 'SZ-KJ-A03', deviceType: 'ac', stationId: 's1', stationName: '科技园超级充电站', name: 'A区-03号桩',
    model: 'AC-7kW', powerKw: 7, status: 'online', faultTags: [],
    currentPowerKw: 0, voltage: 0, current: 0, temperature: 26, totalEnergyKwh: 12400,
    firmwareVersion: 'v2.1.0', lastHeartbeat: '2026-06-13 14:32:00',
  },
]

export const MOCK_CLUSTER_ALLOCATIONS: ClusterAllocation[] = [
  {
    clusterId: 'c1', clusterName: 'A区集群', totalCapacityKw: 960, allocatedKw: 720,
    devices: [
      { deviceId: 'd1', allocatedKw: 98.5 },
      { deviceId: 'd2', allocatedKw: 0 },
    ],
  },
  {
    clusterId: 'c2', clusterName: 'B区集群', totalCapacityKw: 480, allocatedKw: 0,
    devices: [{ deviceId: 'd3', allocatedKw: 0 }],
  },
  {
    clusterId: 'c3', clusterName: 'C区集群', totalCapacityKw: 720, allocatedKw: 165,
    devices: [
      { deviceId: 'd4', allocatedKw: 0 },
      { deviceId: 'd5', allocatedKw: 165 },
    ],
  },
]

export const MOCK_THERMAL_ALERTS: ThermalRiskAlert[] = [
  {
    id: 'ta1', deviceId: 'd3', deviceName: 'B区-01号桩', stationName: '科技园超级充电站',
    temperature: 68, threshold: 55, level: 'critical', detectedAt: '2026-06-13 14:25:00',
    suggestion: '建议立即降功率并派遣运维检查散热模块',
  },
  {
    id: 'ta2', deviceId: 'd5', deviceName: 'C区-04号桩', stationName: '福田中心快充站',
    temperature: 45, threshold: 50, level: 'warning', detectedAt: '2026-06-13 14:20:00',
    suggestion: '持续监控，考虑调整集群功率分配',
  },
  {
    id: 'ta3', deviceId: 'd1', deviceName: 'A区-01号桩', stationName: '科技园超级充电站',
    temperature: 42, threshold: 50, level: 'normal', detectedAt: '2026-06-13 14:30:00',
    suggestion: '温度正常，无需干预',
  },
]

export const MOCK_TARIFF_SLOTS: TariffSlot[] = [
  { id: 't1', period: 'valley', startHour: 0, endHour: 8, pricePerKwh: 0.35, label: '谷时' },
  { id: 't2', period: 'flat', startHour: 8, endHour: 12, pricePerKwh: 0.65, label: '平时' },
  { id: 't3', period: 'peak', startHour: 12, endHour: 14, pricePerKwh: 1.20, label: '峰时' },
  { id: 't4', period: 'flat', startHour: 14, endHour: 18, pricePerKwh: 0.65, label: '平时' },
  { id: 't5', period: 'peak', startHour: 18, endHour: 22, pricePerKwh: 1.20, label: '峰时' },
  { id: 't6', period: 'valley', startHour: 22, endHour: 24, pricePerKwh: 0.35, label: '谷时' },
]

export const MOCK_PROPERTY_SHARE: PropertyShareConfig[] = MOCK_STATIONS.map((s) => ({
  stationId: s.id,
  stationName: s.name,
  platformSharePercent: 100 - s.propertySharePercent - 15,
  propertySharePercent: s.propertySharePercent,
  operatorSharePercent: 15,
}))

export { MOCK_WORK_ORDERS } from '@/mocks/work-order-mock'

export const MOCK_FINANCE_SUMMARY: FinanceSummary = {
  totalRevenue: 576800,
  platformShare: 288400,
  propertyShare: 144200,
  operatorShare: 86520,
  orderCount: 3842,
  period: '2026年6月',
}

export const MOCK_ORDERS: ChargingOrder[] = [
  {
    id: 'o1', userId: 'mu1', userName: '车主***1234', stationName: '科技园超级充电站',
    deviceName: 'A区-01号桩', energyKwh: 42.5, amount: 68.0, platformFee: 34.0,
    propertyFee: 17.0, status: 'completed', startedAt: '2026-06-13 09:12:00',
    endedAt: '2026-06-13 10:10:00', paymentMethod: '微信支付',
  },
  {
    id: 'o2', userId: 'mu2', userName: '车主***5678', stationName: '福田中心快充站',
    deviceName: 'C区-04号桩', energyKwh: 58.2, amount: 93.1, platformFee: 46.6,
    propertyFee: 23.3, status: 'charging', startedAt: '2026-06-13 13:45:00',
    paymentMethod: '支付宝',
  },
  {
    id: 'o3', userId: 'mu3', userName: '车主***9012', stationName: '宝安机场枢纽站',
    deviceName: 'D区-01号桩', energyKwh: 35.0, amount: 56.0, platformFee: 28.0,
    propertyFee: 14.0, status: 'completed', startedAt: '2026-06-12 18:30:00',
    endedAt: '2026-06-12 19:45:00', paymentMethod: '微信支付',
  },
]

export const MOCK_GRID_LOAD: GridLoadDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  loadPercent: Math.round(30 + Math.sin(i / 3) * 25 + Math.random() * 15),
  capacityKw: 2000,
}))

/** 按场站生成差异化电网负载曲线 */
export function getGridLoadForStation(stationId: string, baseLoadPercent: number, maxCapacityKw: number): GridLoadDataPoint[] {
  const seed = stationId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin((i + seed % 5) / 3) * 18
    const peak = i >= 8 && i <= 20 ? 12 : -5
    const loadPercent = Math.min(100, Math.max(5, Math.round(baseLoadPercent * 0.6 + wave + peak + (seed % 10))))
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      loadPercent,
      capacityKw: maxCapacityKw,
    }
  })
}

export function generateRealtimeStream(deviceId: string, basePower: number, baseTemp: number) {
  const jitter = () => (Math.random() - 0.5) * 4
  return {
    deviceId,
    timestamp: new Date().toISOString(),
    powerKw: Math.max(0, basePower + jitter()),
    voltage: basePower > 0 ? 750 + jitter() * 10 : 0,
    current: basePower > 0 ? (basePower * 1000) / 750 + jitter() : 0,
    temperature: baseTemp + jitter() * 0.5,
    soc: basePower > 0 ? Math.min(100, 45 + Math.random() * 30) : undefined,
  }
}

export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  ac: '交流',
  dc_air: '风冷直流',
  dc_liquid: '液冷超充',
}

export const MOCK_BILLING_CONFIG: BillingConfig = { memberDiscountPercent: 8.5 }

export const MOCK_FLEET_PACKAGES: FleetPackage[] = [
  { id: 'fp1', name: '物流车队基础版', monthlyFee: 2999, includedKwh: 3000, discountPercent: 12, activeVehicles: 48 },
  { id: 'fp2', name: '网约车尊享版', monthlyFee: 4999, includedKwh: 6000, discountPercent: 18, activeVehicles: 126 },
  { id: 'fp3', name: '企业通勤包', monthlyFee: 8999, includedKwh: 12000, discountPercent: 22, activeVehicles: 35 },
]

export const MOCK_ENTERPRISE_PACKAGES: EnterprisePackage[] = [
  { id: 'ep1', companyName: '腾讯科技', monthlyFee: 50000, creditLimit: 200000, billingCycle: '月结', status: 'active', discountPercent: 15, activeVehicles: 248, totalSpent: 1285000 },
  { id: 'ep2', companyName: '比亚迪汽车', monthlyFee: 80000, creditLimit: 500000, billingCycle: '季结', status: 'active', discountPercent: 20, activeVehicles: 412, totalSpent: 3560000 },
  { id: 'ep3', companyName: '顺丰速运', monthlyFee: 35000, creditLimit: 150000, billingCycle: '月结', status: 'suspended', discountPercent: 12, activeVehicles: 86, totalSpent: 420000 },
]

export const MOCK_DEVICE_HISTORY: DeviceChargingHistory[] = [
  { id: 'dh1', deviceId: 'd1', plateNumber: '粤B·D12345', energyKwh: 42.5, duration: '58分钟', amount: 68.0, startedAt: '2026-06-13 09:12:00', endedAt: '2026-06-13 10:10:00' },
  { id: 'dh2', deviceId: 'd1', plateNumber: '粤B·A88888', energyKwh: 35.2, duration: '45分钟', amount: 56.3, startedAt: '2026-06-12 18:30:00', endedAt: '2026-06-12 19:15:00' },
  { id: 'dh3', deviceId: 'd5', plateNumber: '粤B·F56789', energyKwh: 58.2, duration: '72分钟', amount: 93.1, startedAt: '2026-06-13 13:45:00', endedAt: '2026-06-13 14:57:00' },
]

export const MOCK_BMS_LOGS: BmsRiskLog[] = [
  { id: 'bl1', deviceId: 'd3', level: 'critical', message: '电池包温度超过安全阈值', batteryTemp: 68, soc: 72, createdAt: '2026-06-13 14:25:00' },
  { id: 'bl2', deviceId: 'd3', level: 'warning', message: '单体电压差偏大', batteryTemp: 55, soc: 68, createdAt: '2026-06-13 14:20:00' },
  { id: 'bl3', deviceId: 'd5', level: 'warning', message: '充电电流波动异常', batteryTemp: 45, soc: 55, createdAt: '2026-06-13 14:15:00' },
  { id: 'bl4', deviceId: 'd1', level: 'normal', message: 'BMS 自检通过', batteryTemp: 38, soc: 62, createdAt: '2026-06-13 14:30:00' },
]

export const MOCK_DEMAND_FORECAST: DemandForecastPoint[] = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  predictedKw: Math.round(400 + Math.sin(i / 2.5) * 300 + (i >= 8 && i <= 20 ? 200 : 0)),
  actualKw: i <= 14 ? Math.round(380 + Math.sin(i / 2.5) * 280 + (i >= 8 ? 180 : 0)) : undefined,
}))

export const MOCK_HIGH_RISK_RECORDS: HighRiskChargingRecord[] = [
  { id: 'hr1', plateNumber: '粤B·X99999', deviceName: 'B区-01号桩', stationName: '科技园超级充电站', riskLevel: 'critical', maxTemp: 68, energyKwh: 38.5, chargedAt: '2026-06-13 14:10:00' },
  { id: 'hr2', plateNumber: '粤B·K88888', deviceName: 'C区-04号桩', stationName: '福田中心快充站', riskLevel: 'warning', maxTemp: 52, energyKwh: 45.0, chargedAt: '2026-06-13 13:30:00' },
  { id: 'hr3', plateNumber: '粤B·M77777', deviceName: 'A区-01号桩', stationName: '科技园超级充电站', riskLevel: 'warning', maxTemp: 48, energyKwh: 52.3, chargedAt: '2026-06-12 20:15:00' },
]

export const MOCK_VEHICLE_OWNERS: VehicleOwner[] = [
  { id: 'vo1', displayName: '张先生', phone: '138****1234', registerAt: '2025-03-12', memberLevel: '金卡', points: 3680, totalOrders: 86, totalSpent: 12450, status: 'active', fleetName: '网约车尊享版', enterpriseName: '腾讯科技' },
  { id: 'vo2', displayName: '李女士', phone: '139****5678', registerAt: '2024-11-05', memberLevel: '钻石', points: 8920, totalOrders: 215, totalSpent: 38600, status: 'active', enterpriseName: '比亚迪汽车' },
  { id: 'vo3', displayName: '王师傅', phone: '137****9012', registerAt: '2025-01-20', memberLevel: '银卡', points: 1250, totalOrders: 42, totalSpent: 5680, status: 'active', fleetName: '物流车队基础版' },
  { id: 'vo4', displayName: '赵同学', phone: '136****3456', registerAt: '2026-02-18', memberLevel: '普通', points: 320, totalOrders: 8, totalSpent: 890, status: 'active' },
  { id: 'vo5', displayName: '陈先生', phone: '135****7890', registerAt: '2024-08-30', memberLevel: '金卡', points: 2100, totalOrders: 56, totalSpent: 9800, status: 'frozen', fleetName: '企业通勤包' },
]

export const MOCK_V2G_REVENUE: V2GRevenueStats = {
  period: '2026年6月',
  dischargeKwh: 12580,
  revenue: 45600,
  gridSubsidy: 12800,
  participatingStations: 2,
}

export const MOCK_PROPERTY_RECONCILIATION: PropertyReconciliation[] = MOCK_STATIONS.map((s) => ({
  stationId: s.id,
  stationName: s.name,
  totalRevenue: Math.round(576800 * (s.totalPiles / 168)),
  propertyShare: Math.round(576800 * (s.totalPiles / 168) * s.propertySharePercent / 100),
  platformShare: Math.round(576800 * (s.totalPiles / 168) * (100 - s.propertySharePercent - 15) / 100),
  settled: s.status === 'active',
  period: '2026年6月',
}))

export function getDeviceHistory(deviceId: string): DeviceChargingHistory[] {
  return MOCK_DEVICE_HISTORY.filter((h) => h.deviceId === deviceId)
}

export function getBmsLogs(deviceId: string): BmsRiskLog[] {
  return MOCK_BMS_LOGS.filter((l) => l.deviceId === deviceId)
}
