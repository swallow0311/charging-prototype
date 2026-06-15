/** 设备类型 */
export type DeviceType = 'ac' | 'dc_air' | 'dc_liquid'

/** 故障类型 */
export type FaultType = '通信故障' | '过温保护' | '枪头异常' | '电源模块' | '其他'

/** 用户角色 */
export type UserRole = 'admin' | 'property' | 'operator'

/** 设备在线状态 */
export type DeviceStatus = 'online' | 'fault' | 'offline' | 'charging' | 'idle'

/** 工单状态 */
export type WorkOrderStatus = 'pending' | 'processing' | 'completed' | 'closed' | 'overdue' | 'awaiting_acceptance'

/** 工单优先级：普通 / 紧急 / 特级 */
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical'

/** 工单业务类型 */
export type WorkOrderCategory = 'fault' | 'inspection' | 'maintenance' | 'complaint'

/** AI 调度状态 */
export type DispatchStatus = 'pending' | 'dispatched' | 'accepted' | 'retrying' | 'failed' | 'manual'

export interface DispatchScoreDetail {
  distance: number
  load: number
  skill: number
  performance: number
  total: number
  weights?: { distance: number; load: number; skill: number; performance: number }
}

/** 订单状态 */
export type OrderStatus = 'charging' | 'completed' | 'cancelled' | 'refunded'

/** 预约状态 */
export type ReservationStatus = 'active' | 'expired' | 'used' | 'cancelled'

/** 电价时段类型 */
export type TariffPeriod = 'peak' | 'flat' | 'valley'

/** 热风险等级 */
export type ThermalRiskLevel = 'normal' | 'warning' | 'critical'

export interface User {
  id: string
  username: string
  role: UserRole
  displayName: string
  avatar?: string
}

export interface LoginFormData {
  username: string
  password: string
  role: UserRole
}

export interface EdgeGatewayConfig {
  gatewayId: string
  ip: string
  firmwareVersion: string
  lastSyncAt: string
  status: 'online' | 'offline'
}

export interface PowerSchedulingParams {
  mode: 'auto' | 'manual'
  maxClusterPowerKw: number
  loadBalanceEnabled: boolean
  peakShavingEnabled: boolean
  v2gEnabled: boolean
}

export interface PileGroupStatus {
  id: string
  name: string
  total: number
  charging: number
  idle: number
  fault: number
  offline: number
}

export interface Station {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  totalPiles: number
  availablePiles: number
  onlinePiles: number
  totalPowerKw: number
  operator: string
  gridLoadPercent: number
  maxGridCapacityKw: number
  currentLoadKw: number
  status: 'active' | 'maintenance' | 'offline'
  propertySharePercent: number
  createdAt: string
  edgeGateway: EdgeGatewayConfig
  schedulingParams: PowerSchedulingParams
  pileGroups: PileGroupStatus[]
}

export interface ChargingDevice {
  id: string
  deviceCode: string
  deviceType: DeviceType
  stationId: string
  stationName: string
  name: string
  model: string
  powerKw: number
  status: DeviceStatus
  faultTags: string[]
  currentPowerKw: number
  voltage: number
  current: number
  temperature: number
  totalEnergyKwh: number
  firmwareVersion: string
  lastHeartbeat: string
}

export interface DeviceRealtimeStream {
  deviceId: string
  timestamp: string
  powerKw: number
  voltage: number
  current: number
  temperature: number
  soc?: number
}

export interface DashboardMetric {
  id: string
  label: string
  value: string | number
  unit?: string
  changePercent?: number
  trend: 'up' | 'down' | 'flat'
}

export interface WorkOrder {
  id: string
  title: string
  orderType: string
  deviceId: string
  deviceName: string
  deviceCode: string
  stationId: string
  stationName: string
  stationAddress: string
  faultType: FaultType
  priority: WorkOrderPriority
  status: WorkOrderStatus
  source: 'ai_alert' | 'manual' | 'user_report'
  description: string
  createdAt: string
  occurredAt: string
  deadline: string
  slaHours: number
  processingDuration?: string
  isOverdue: boolean
  assignee?: string
  contactName?: string
  contactPhone?: string
  remark?: string
  images?: string[]
  faultCause?: string
  solution?: string
  costDetail?: string
  rating?: number
  rejectReason?: string
  repairRecords: RepairRecord[]
  spareParts?: SparePartRecord[]
  /** 是否 AI 自动派单 */
  isAiDispatch?: boolean
  /** 调度权重快照 JSON */
  dispatchWeightJson?: string
  /** 调度重试次数 */
  dispatchRetryTimes?: number
  /** 调度状态 */
  dispatchStatus?: DispatchStatus
  /** 调度失败原因 */
  dispatchFailReason?: string
  /** 站点经纬度（GPS 计算） */
  stationLat?: number
  stationLng?: number
  /** 故障标签（技能匹配） */
  faultTags?: string[]
}

export interface MaintenanceOperator {
  id: string
  name: string
  region: string
  pendingCount: number
  completedCount: number
  avgHours: number
  onDuty: boolean
  /** 技能标签 */
  skillTags: string[]
  /** 当前工单负荷 */
  currentLoad: number
  /** 最大负荷阈值 */
  maxLoadThreshold: number
  /** 最后 GPS 上报时间 */
  lastGpsTime: string
  /** 在线状态 */
  online: boolean
  lat?: number
  lng?: number
  /** 历史办结率 0-100 */
  completionRate?: number
  /** 逾期率 0-100 */
  overdueRate?: number
  /** 好评率 0-100 */
  rating?: number
  /** 负荷饱和度 0-100 */
  loadSaturation?: number
}

export interface SparePartRecord {
  id: string
  partName: string
  quantity: number
  replacedAt: string
}

export interface RepairRecord {
  id: string
  operator: string
  action: string
  note: string
  createdAt: string
}

export interface TariffSlot {
  id: string
  period: TariffPeriod
  startHour: number
  endHour: number
  pricePerKwh: number
  label: string
}

export interface PropertyShareConfig {
  stationId: string
  stationName: string
  platformSharePercent: number
  propertySharePercent: number
  operatorSharePercent: number
}

export interface FinanceSummary {
  totalRevenue: number
  platformShare: number
  propertyShare: number
  operatorShare: number
  orderCount: number
  period: string
}

export interface BillingConfig {
  memberDiscountPercent: number
}

export interface FleetPackage {
  id: string
  name: string
  monthlyFee: number
  includedKwh: number
  discountPercent: number
  activeVehicles: number
}

export interface EnterprisePackage {
  id: string
  companyName: string
  monthlyFee: number
  creditLimit: number
  billingCycle: string
  status: 'active' | 'suspended'
  discountPercent: number
  activeVehicles: number
  totalSpent: number
}

export interface DeviceChargingHistory {
  id: string
  deviceId: string
  plateNumber: string
  energyKwh: number
  duration: string
  amount: number
  startedAt: string
  endedAt: string
}

export interface BmsRiskLog {
  id: string
  deviceId: string
  level: ThermalRiskLevel
  message: string
  batteryTemp: number
  soc: number
  createdAt: string
}

export interface DemandForecastPoint {
  hour: string
  predictedKw: number
  actualKw?: number
}

export interface HighRiskChargingRecord {
  id: string
  plateNumber: string
  deviceName: string
  stationName: string
  riskLevel: ThermalRiskLevel
  maxTemp: number
  energyKwh: number
  chargedAt: string
}

export interface VehicleOwner {
  id: string
  displayName: string
  phone: string
  registerAt: string
  memberLevel: '普通' | '银卡' | '金卡' | '钻石'
  points: number
  totalOrders: number
  totalSpent: number
  status: 'active' | 'frozen'
  fleetName?: string
  enterpriseName?: string
}

export interface V2GRevenueStats {
  period: string
  dischargeKwh: number
  revenue: number
  gridSubsidy: number
  participatingStations: number
}

export interface PropertyReconciliation {
  stationId: string
  stationName: string
  totalRevenue: number
  propertyShare: number
  platformShare: number
  settled: boolean
  period: string
}

export interface ChargingOrder {
  id: string
  userId: string
  userName: string
  stationName: string
  deviceName: string
  energyKwh: number
  amount: number
  platformFee: number
  propertyFee: number
  status: OrderStatus
  startedAt: string
  endedAt?: string
  paymentMethod: string
}

export interface ClusterAllocation {
  clusterId: string
  clusterName: string
  totalCapacityKw: number
  allocatedKw: number
  devices: { deviceId: string; allocatedKw: number }[]
}

export interface ThermalRiskAlert {
  id: string
  deviceId: string
  deviceName: string
  stationName: string
  temperature: number
  threshold: number
  level: ThermalRiskLevel
  detectedAt: string
  suggestion: string
}

export interface NearbyStation {
  id: string
  name: string
  address: string
  distanceKm: number
  availablePiles: number
  totalPiles: number
  pricePerKwh: number
  rating: number
  tags: string[]
}

export interface Vehicle {
  id: string
  plateNumber: string
  brand: string
  model: string
  batteryCapacityKwh: number
  isDefault: boolean
}

/** 车主端车辆使用状态 */
export type VehicleUsageStatus = 'charging' | 'reserved' | 'idle'

export interface VehicleChargingInfo {
  sessionId: string
  stationName: string
  pileName: string
  powerKw: number
  energyKwh: number
  cost: number
  soc: number
  batteryTemp: number
  estimatedMinutes: number
  startedAt: string
}

export interface VehicleReservationInfo {
  reservationId: string
  stationId: string
  stationName: string
  pileName: string
  reservedUntil: string
}

export interface VehicleWithStatus extends Vehicle {
  soc: number
  usageStatus: VehicleUsageStatus
  chargingInfo?: VehicleChargingInfo
  reservationInfo?: VehicleReservationInfo
}

export interface MobileUserProfile {
  displayName: string
  phone: string
  email: string
  gender: 'male' | 'female' | 'unknown'
  city: string
}

/** 开票基本信息 */
export interface InvoiceProfile {
  titleType: 'personal' | 'company'
  title: string
  taxNumber?: string
  email: string
  phone: string
  address?: string
  bankName?: string
  bankAccount?: string
}

/** 开票记录状态 */
export type InvoiceRecordStatus = 'pending' | 'issued' | 'processing'

export interface InvoiceRecord {
  id: string
  orderId: string
  stationName: string
  amount: number
  energyKwh: number
  date: string
  status: InvoiceRecordStatus
  invoiceNo?: string
  issuedAt?: string
}

export interface MobileOrder {
  id: string
  stationName: string
  energyKwh: number
  amount: number
  status: OrderStatus
  date: string
  invoiceStatus?: 'none' | 'pending' | 'issued'
}

export interface MobileAuthState {
  locationGranted: boolean
  notificationGranted: boolean
  agreementAccepted: boolean
}

export interface StationPileInfo {
  id: string
  name: string
  powerKw: number
  status: 'available' | 'busy' | 'offline'
}

export interface StationDetail extends NearbyStation {
  openHours: string
  phone: string
  piles: StationPileInfo[]
  description: string
}

export interface MobileReservation {
  id: string
  vehicleId: string
  stationId: string
  stationName: string
  pileName: string
  reservedUntil: string
  status: ReservationStatus
}

export interface ActiveChargingSession {
  sessionId: string
  stationName: string
  pileName: string
  powerKw: number
  energyKwh: number
  batteryTemp: number
  soc: number
  estimatedMinutes: number
  cost: number
  startedAt: string
}
