import type { MaintenanceOperator, WorkOrder } from '@/types'

export const MOCK_MAINTENANCE_OPERATORS: MaintenanceOperator[] = [
  {
    id: 'op1', name: '张工', region: '福田区', pendingCount: 3, completedCount: 42, avgHours: 2.4,
    onDuty: true, online: true, skillTags: ['通信故障', '过温保护', '电源模块'],
    currentLoad: 3, maxLoadThreshold: 8, lastGpsTime: '2026-06-13 16:28:00',
    lat: 22.541, lng: 114.055, completionRate: 96, overdueRate: 2, rating: 98, loadSaturation: 38,
  },
  {
    id: 'op2', name: '李工', region: '南山区', pendingCount: 2, completedCount: 38, avgHours: 2.1,
    onDuty: true, online: true, skillTags: ['定期保养', '巡检', '枪头异常'],
    currentLoad: 2, maxLoadThreshold: 8, lastGpsTime: '2026-06-13 16:25:00',
    lat: 22.532, lng: 113.934, completionRate: 94, overdueRate: 3, rating: 96, loadSaturation: 25,
  },
  {
    id: 'op3', name: '王工', region: '宝安区', pendingCount: 5, completedCount: 31, avgHours: 3.2,
    onDuty: true, online: true, skillTags: ['枪头异常', '用户投诉', '电源模块'],
    currentLoad: 5, maxLoadThreshold: 8, lastGpsTime: '2026-06-13 16:20:00',
    lat: 22.637, lng: 113.829, completionRate: 91, overdueRate: 5, rating: 93, loadSaturation: 63,
  },
  {
    id: 'op4', name: '赵工', region: '龙岗区', pendingCount: 1, completedCount: 28, avgHours: 2.8,
    onDuty: false, online: false, skillTags: ['通信故障', '巡检'],
    currentLoad: 8, maxLoadThreshold: 8, lastGpsTime: '2026-06-12 22:10:00',
    lat: 22.721, lng: 114.251, completionRate: 88, overdueRate: 8, rating: 90, loadSaturation: 100,
  },
]

export const MOCK_WO_TREND_30D = Array.from({ length: 30 }, (_, i) => ({
  date: `6/${i + 1}`,
  created: Math.round(8 + Math.sin(i / 4) * 5 + (i % 7)),
  completed: Math.round(6 + Math.cos(i / 5) * 4 + (i % 5)),
}))

export const MOCK_WO_TYPE_PIE = [
  { name: '故障', value: 42, fill: '#4096FF' },
  { name: '巡检', value: 22, fill: '#52C41A' },
  { name: '保养', value: 18, fill: '#9254DE' },
  { name: '投诉', value: 12, fill: '#FF7D00' },
  { name: '其他', value: 6, fill: '#9CA3AF' },
]

export const MOCK_STATION_FAULT_TOP10 = [
  { name: '科技园超级充电站', count: 18 },
  { name: '福田中心快充站', count: 15 },
  { name: '宝安机场枢纽站', count: 12 },
  { name: '南山海岸城站', count: 9 },
  { name: '龙岗大运中心站', count: 8 },
  { name: '龙华民治站', count: 7 },
  { name: '罗湖东门站', count: 6 },
  { name: '盐田港站', count: 5 },
  { name: '坪山站', count: 4 },
  { name: '光明科学城站', count: 3 },
]

export const MOCK_OPERATOR_EFFICIENCY = MOCK_MAINTENANCE_OPERATORS.map((o) => ({
  name: o.name,
  completed: o.completedCount,
  avgHours: o.avgHours,
  pending: o.pendingCount,
}))

const base = (partial: Partial<WorkOrder> & Pick<WorkOrder, 'id' | 'title' | 'status'>): WorkOrder => ({
  orderType: '故障',
  deviceId: 'd1',
  deviceName: 'A区-01号桩',
  deviceCode: 'CP-A-001',
  stationId: 's1',
  stationName: '科技园超级充电站',
  stationAddress: '深圳市南山区科技园南路 88 号',
  stationLat: 22.5403,
  stationLng: 114.0579,
  faultType: '通信故障',
  faultTags: ['通信故障'],
  priority: 'medium',
  source: 'manual',
  description: '',
  createdAt: '2026-06-13 10:00:00',
  occurredAt: '2026-06-13 09:55:00',
  deadline: '2026-06-13 18:00:00',
  slaHours: 8,
  isOverdue: false,
  isAiDispatch: false,
  dispatchRetryTimes: 0,
  dispatchStatus: 'manual',
  repairRecords: [],
  ...partial,
})

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  base({
    id: 'WO-20260613-001', title: 'B区-01号桩过温告警', orderType: '故障',
    deviceId: 'd3', deviceName: 'B区-01号桩', deviceCode: 'CP-B-001',
    faultType: '过温保护', faultTags: ['过温保护', '硬件故障'],
    priority: 'critical', status: 'pending', source: 'ai_alert',
    description: '设备温度 68°C 超过阈值 55°C，已自动停机',
    createdAt: '2026-06-13 14:25:00', occurredAt: '2026-06-13 14:20:00',
    deadline: '2026-06-13 16:25:00', slaHours: 2, isOverdue: true,
    isAiDispatch: true, dispatchStatus: 'dispatched', dispatchRetryTimes: 0,
    dispatchWeightJson: '{"distance":70,"load":15,"skill":10,"performance":5}',
    contactName: '场站值班', contactPhone: '138****0001',
    repairRecords: [
      { id: 'rr1', operator: 'AI 调度系统', action: '自动派单', note: '综合得分 89.4 → 张工', createdAt: '2026-06-13 14:25:08' },
      { id: 'rr2', operator: '系统', action: '工单创建', note: '自动生成运维工单', createdAt: '2026-06-13 14:25:05' },
    ],
  }),
  base({
    id: 'WO-20260613-002', title: 'C区-03号桩通信中断', orderType: '故障',
    deviceId: 'd4', deviceName: 'C区-03号桩', deviceCode: 'CP-C-003',
    stationId: 's2', stationName: '福田中心快充站', stationAddress: '深圳市福田区福华一路 168 号',
    stationLat: 22.5333, stationLng: 114.0545,
    faultType: '通信故障', faultTags: ['通信故障'],
    priority: 'high', status: 'processing', source: 'ai_alert',
    description: '设备心跳超时超过 2 小时', assignee: '张工',
    isAiDispatch: true, dispatchStatus: 'accepted', dispatchRetryTimes: 0,
    dispatchWeightJson: '{"distance":40,"load":30,"skill":20,"performance":10}',
    createdAt: '2026-06-13 12:20:00', occurredAt: '2026-06-13 10:20:00',
    deadline: '2026-06-13 20:20:00', slaHours: 8, processingDuration: '2h15m',
    spareParts: [{ id: 'sp1', partName: '4G 通信模块', quantity: 1, replacedAt: '2026-06-13 13:30:00' }],
    repairRecords: [
      { id: 'rr3', operator: 'AI 调度系统', action: '自动派单', note: '综合得分 82.6 → 张工', createdAt: '2026-06-13 12:35:02' },
      { id: 'rr4', operator: '张工', action: '接单', note: '已接单，前往现场', createdAt: '2026-06-13 12:50:00' },
    ],
  }),
  base({
    id: 'WO-20260612-003', title: 'A区-02号桩定期保养', orderType: '保养',
    deviceId: 'd2', deviceName: 'A区-02号桩', deviceCode: 'CP-A-002',
    faultType: '其他', faultTags: ['定期保养'],
    priority: 'low', status: 'completed', source: 'manual',
    description: '季度例行保养', assignee: '李工',
    isAiDispatch: true, dispatchStatus: 'accepted', dispatchRetryTimes: 0,
    createdAt: '2026-06-12 09:00:00', occurredAt: '2026-06-12 09:00:00',
    deadline: '2026-06-12 18:00:00', slaHours: 24, processingDuration: '2h30m',
    faultCause: '例行保养', solution: '枪头清洁、固件升级 v3.2.1',
    spareParts: [{ id: 'sp2', partName: '充电枪头密封圈', quantity: 2, replacedAt: '2026-06-12 11:00:00' }],
    costDetail: '人工 ¥200 + 配件 ¥80', rating: 5,
    repairRecords: [
      { id: 'rr6', operator: 'AI 调度系统', action: '自动派单', note: '负荷优先 → 李工', createdAt: '2026-06-12 09:00:12' },
      { id: 'rr7', operator: '李工', action: '完工提交', note: '保养完成，测试正常', createdAt: '2026-06-12 11:30:00' },
    ],
  }),
  base({
    id: 'WO-20260613-004', title: 'D区-01号桩枪头异常', orderType: '故障',
    deviceId: 'd5', deviceName: 'D区-01号桩', deviceCode: 'CP-D-001',
    stationId: 's3', stationName: '宝安机场枢纽站', stationAddress: '深圳市宝安区航站四路 2001 号',
    stationLat: 22.6393, stationLng: 113.8106,
    faultType: '枪头异常', faultTags: ['枪头异常'],
    priority: 'medium', status: 'awaiting_acceptance', source: 'user_report',
    description: '用户反馈充电枪无法锁止', assignee: '王工',
    isAiDispatch: false, dispatchStatus: 'manual', dispatchRetryTimes: 0,
    createdAt: '2026-06-13 08:00:00', occurredAt: '2026-06-13 07:45:00',
    deadline: '2026-06-13 16:00:00', slaHours: 8, processingDuration: '3h10m',
    faultCause: '枪头锁止机构磨损', solution: '更换锁止弹簧并校准', costDetail: '配件 ¥120',
    repairRecords: [
      { id: 'rr9', operator: '调度中心', action: '人工派单', note: '指派王工', createdAt: '2026-06-13 08:15:00' },
      { id: 'rr10', operator: '王工', action: '完工提交', note: '已修复并测试', createdAt: '2026-06-13 11:10:00' },
    ],
  }),
  base({
    id: 'WO-20260613-005', title: 'E区-02号桩电源模块故障', orderType: '故障',
    deviceId: 'd6', deviceName: 'E区-02号桩', deviceCode: 'CP-E-002',
    stationId: 's2', stationName: '福田中心快充站',
    faultType: '电源模块', faultTags: ['电源模块', '硬件故障'],
    priority: 'high', status: 'pending', source: 'ai_alert',
    description: '输出电压不稳定，多次重启无效',
    isAiDispatch: true, dispatchStatus: 'retrying', dispatchRetryTimes: 1,
    dispatchWeightJson: '{"distance":25,"load":25,"skill":40,"performance":10}',
    createdAt: '2026-06-13 15:10:00', occurredAt: '2026-06-13 15:00:00',
    deadline: '2026-06-13 23:10:00', slaHours: 4,
    repairRecords: [
      { id: 'rr11', operator: 'AI 调度系统', action: '重调度', note: '首次派单超时，重新匹配人员', createdAt: '2026-06-13 15:15:00' },
    ],
  }),
  base({
    id: 'WO-20260611-006', title: 'F区巡检任务', orderType: '巡检',
    deviceId: 'd7', deviceName: 'F区-01号桩', deviceCode: 'CP-F-001',
    faultType: '其他', faultTags: ['巡检'],
    priority: 'low', status: 'closed', source: 'manual',
    description: '周度例行巡检', assignee: '李工', processingDuration: '1h20m',
    isAiDispatch: true, dispatchStatus: 'accepted', dispatchRetryTimes: 0,
    createdAt: '2026-06-11 10:00:00', occurredAt: '2026-06-11 10:00:00',
    deadline: '2026-06-11 18:00:00', slaHours: 24,
    repairRecords: [
      { id: 'rr12', operator: 'AI 调度系统', action: '自动派单', note: '低负荷优先 → 李工', createdAt: '2026-06-11 10:00:12' },
      { id: 'rr13', operator: '李工', action: '关闭', note: '巡检无异常', createdAt: '2026-06-11 11:20:00' },
    ],
  }),
  base({
    id: 'WO-20260610-007', title: 'G区-04号桩通信故障', orderType: '故障',
    deviceId: 'd8', deviceName: 'G区-04号桩', deviceCode: 'CP-G-004',
    stationId: 's3', stationName: '宝安机场枢纽站',
    faultType: '通信故障', faultTags: ['通信故障'],
    priority: 'medium', status: 'overdue', source: 'ai_alert',
    description: '离线超过 24 小时', isOverdue: true, assignee: '赵工',
    isAiDispatch: true, dispatchStatus: 'failed', dispatchRetryTimes: 3,
    dispatchFailReason: '本区域人员均离线或超负荷',
    createdAt: '2026-06-10 09:00:00', occurredAt: '2026-06-09 08:00:00',
    deadline: '2026-06-10 17:00:00', slaHours: 8,
    repairRecords: [
      { id: 'rr14', operator: 'AI 调度系统', action: '调度失败', note: '转人工处理队列', createdAt: '2026-06-10 09:30:00' },
    ],
  }),
  base({
    id: 'WO-20260613-008', title: 'H区用户投诉-充电中断', orderType: '投诉',
    deviceId: 'd9', deviceName: 'H区-01号桩', deviceCode: 'CP-H-001',
    stationId: 's2', stationName: '福田中心快充站',
    faultType: '枪头异常', faultTags: ['用户投诉', '枪头异常'],
    priority: 'high', status: 'pending', source: 'user_report',
    description: '充电中断，屏幕显示错误码 E03，用户要求尽快处理',
    isAiDispatch: true, dispatchStatus: 'manual', dispatchRetryTimes: 3,
    dispatchFailReason: '无技能匹配人员，已达最大重试次数',
    createdAt: '2026-06-13 16:00:00', occurredAt: '2026-06-13 15:50:00',
    deadline: '2026-06-13 20:00:00', slaHours: 4,
    contactName: '车主王先生', contactPhone: '139****5678',
    repairRecords: [
      { id: 'rr16', operator: 'AI 调度系统', action: '转人工', note: '自动调度失败，等待人工分派', createdAt: '2026-06-13 16:05:00' },
    ],
  }),
]

export function computeWoDashboardStats(orders: WorkOrder[]) {
  const today = '2026-06-13'
  const aiDispatched = orders.filter((o) => o.isAiDispatch).length
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    completed: orders.filter((o) => o.status === 'completed' || o.status === 'closed').length,
    overdue: orders.filter((o) => o.isOverdue || o.status === 'overdue').length,
    todayNew: orders.filter((o) => o.createdAt.startsWith(today)).length,
    aiDispatched,
    aiSuccess: orders.filter((o) => o.isAiDispatch && o.dispatchStatus === 'accepted').length,
    dispatchFailed: orders.filter((o) => o.dispatchStatus === 'failed' || o.dispatchStatus === 'manual').length,
  }
}

export const WO_ORDER_TYPES = ['故障', '巡检', '保养', '投诉'] as const

export const WO_RULES_DEFAULT = {
  slaHours: { critical: 2, high: 4, medium: 8, low: 24 },
  periodicTasks: [
    { id: 'pt1', name: '周度巡检', cycle: '每周', enabled: true },
    { id: 'pt2', name: '季度保养', cycle: '每季度', enabled: true },
    { id: 'pt3', name: '月度设备检测', cycle: '每月', enabled: false },
  ],
  notifyRules: {
    onCreate: true, onAssign: true, onOverdue: true, onComplete: true,
  },
}
