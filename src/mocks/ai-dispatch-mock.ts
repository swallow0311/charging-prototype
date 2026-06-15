import type { DispatchScoreDetail, MaintenanceOperator } from '@/types'

export interface AiDispatchConfig {
  enabled: boolean
  grayscaleMode: boolean
  weights: { distance: number; load: number; skill: number; performance: number }
  maxLoadThreshold: number
  distanceMaxKm: number
  overloadScoreZero: boolean
  crossRegionEnabled: boolean
  crossRegionAlertAdmin: boolean
  emergencyBypassLoad: boolean
  emergencyDispatchTimeoutSec: number
  redispatchTimeoutSec: number
  maxRedispatchTimes: number
  rejectAutoRedispatch: boolean
  queueWhenAllSaturated: boolean
  dataCacheSec: number
  dynamicWeights: {
    critical: { distance: number; load: number; skill: number; performance: number }
    complexHardware: { distance: number; load: number; skill: number; performance: number }
    inspectionMaintenance: { distance: number; load: number; skill: number; performance: number }
  }
  emergencyStrategy: {
    urgentNotifyLevels: number
    escalateAfterSec: number
  }
}

export interface DispatchLog {
  id: string
  workOrderId: string
  workOrderTitle: string
  orderType: string
  priority: string
  operatorId: string
  operatorName: string
  scores: DispatchScoreDetail
  result: 'success' | 'retry' | 'failed' | 'manual'
  resultLabel: string
  durationMs: number
  retryTimes: number
  errorMessage?: string
  isCrossRegion: boolean
  createdAt: string
}

export interface DispatchStats {
  successRate: number
  retryRate: number
  exceptionRate: number
  avgDurationMs: number
  todayDispatched: number
  todayManual: number
}

export const DEFAULT_AI_DISPATCH_CONFIG: AiDispatchConfig = {
  enabled: true,
  grayscaleMode: false,
  weights: { distance: 40, load: 30, skill: 20, performance: 10 },
  maxLoadThreshold: 8,
  distanceMaxKm: 50,
  overloadScoreZero: true,
  crossRegionEnabled: true,
  crossRegionAlertAdmin: true,
  emergencyBypassLoad: true,
  emergencyDispatchTimeoutSec: 30,
  redispatchTimeoutSec: 300,
  maxRedispatchTimes: 3,
  rejectAutoRedispatch: true,
  queueWhenAllSaturated: true,
  dataCacheSec: 30,
  dynamicWeights: {
    critical: { distance: 70, load: 15, skill: 10, performance: 5 },
    complexHardware: { distance: 25, load: 25, skill: 40, performance: 10 },
    inspectionMaintenance: { distance: 25, load: 40, skill: 20, performance: 15 },
  },
  emergencyStrategy: {
    urgentNotifyLevels: 3,
    escalateAfterSec: 60,
  },
}

export const MOCK_DISPATCH_STATS: DispatchStats = {
  successRate: 94.2,
  retryRate: 4.8,
  exceptionRate: 1.0,
  avgDurationMs: 1280,
  todayDispatched: 47,
  todayManual: 3,
}

export const MOCK_DISPATCH_LOGS: DispatchLog[] = [
  {
    id: 'dl1', workOrderId: 'WO-20260613-001', workOrderTitle: 'B区-01号桩过温告警',
    orderType: '故障', priority: '特级', operatorId: 'op1', operatorName: '张工',
    scores: { distance: 92, load: 78, skill: 100, performance: 88, total: 89.4,
      weights: { distance: 70, load: 15, skill: 10, performance: 5 } },
    result: 'success', resultLabel: '派单成功', durationMs: 980, retryTimes: 0,
    isCrossRegion: false, createdAt: '2026-06-13 14:25:08',
  },
  {
    id: 'dl2', workOrderId: 'WO-20260613-002', workOrderTitle: 'C区-03号桩通信中断',
    orderType: '故障', priority: '紧急', operatorId: 'op1', operatorName: '张工',
    scores: { distance: 85, load: 72, skill: 100, performance: 88, total: 82.6,
      weights: { distance: 40, load: 30, skill: 20, performance: 10 } },
    result: 'success', resultLabel: '派单成功', durationMs: 1120, retryTimes: 0,
    isCrossRegion: false, createdAt: '2026-06-13 12:35:02',
  },
  {
    id: 'dl3', workOrderId: 'WO-20260613-005', workOrderTitle: 'E区-02号桩电源模块故障',
    orderType: '故障', priority: '紧急', operatorId: 'op2', operatorName: '李工',
    scores: { distance: 68, load: 90, skill: 60, performance: 85, total: 74.5,
      weights: { distance: 25, load: 25, skill: 40, performance: 10 } },
    result: 'retry', resultLabel: '超时重调度', durationMs: 305000, retryTimes: 1,
    errorMessage: '首次指派人员 300s 未接单，自动撤销并重试', isCrossRegion: false,
    createdAt: '2026-06-13 15:10:15',
  },
  {
    id: 'dl4', workOrderId: 'WO-20260611-006', workOrderTitle: 'F区巡检任务',
    orderType: '巡检', priority: '普通', operatorId: 'op2', operatorName: '李工',
    scores: { distance: 78, load: 95, skill: 80, performance: 90, total: 86.8,
      weights: { distance: 25, load: 40, skill: 20, performance: 15 } },
    result: 'success', resultLabel: '派单成功', durationMs: 1450, retryTimes: 0,
    isCrossRegion: false, createdAt: '2026-06-11 10:00:12',
  },
  {
    id: 'dl5', workOrderId: 'WO-20260610-007', workOrderTitle: 'G区-04号桩通信故障',
    orderType: '故障', priority: '普通', operatorId: 'op4', operatorName: '赵工',
    scores: { distance: 45, load: 0, skill: 0, performance: 0, total: 0,
      weights: { distance: 40, load: 30, skill: 20, performance: 10 } },
    result: 'failed', resultLabel: '调度失败', durationMs: 2100, retryTimes: 3,
    errorMessage: '本区域人员均离线或超负荷，跨区调度未启用', isCrossRegion: false,
    createdAt: '2026-06-10 09:30:00',
  },
  {
    id: 'dl6', workOrderId: 'WO-20260613-008', workOrderTitle: 'H区用户投诉处理',
    orderType: '投诉', priority: '紧急', operatorId: 'op3', operatorName: '王工',
    scores: { distance: 55, load: 65, skill: 50, performance: 82, total: 61.2,
      weights: { distance: 40, load: 30, skill: 20, performance: 10 } },
    result: 'manual', resultLabel: '转人工处理', durationMs: 1800, retryTimes: 3,
    errorMessage: '达最大重试次数，无可用技能匹配人员', isCrossRegion: true,
    createdAt: '2026-06-13 16:05:00',
  },
]

/** 调度算法说明（原型展示） */
export const AI_DISPATCH_PIPELINE = [
  '工单创建',
  '判断 AI 调度开关',
  '拉取工单 / 人员实时数据（缓存 30s）',
  '归一化打分 + 动态权重加权',
  '匹配最优人员并自动派单',
  '推送通知 & 监听接单状态',
  '超时重调度 / 成功落日志',
] as const

export function enrichOperators(operators: MaintenanceOperator[]): MaintenanceOperator[] {
  return operators.map((o) => ({
    ...o,
    loadSaturation: Math.round((o.currentLoad / o.maxLoadThreshold) * 100),
  }))
}
