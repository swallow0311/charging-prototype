import type { UserRole } from '@/types'
import { ADMIN_NAV, ROLE_LABELS, ROLE_MENU_PERMISSIONS } from '@/constants/admin-permissions'

export interface SystemUser {
  id: string
  username: string
  displayName: string
  role: UserRole
  email: string
  phone: string
  status: 'active' | 'disabled'
  lastLoginAt: string
  createdAt: string
}

export interface LoginLog {
  id: string
  username: string
  displayName: string
  role: UserRole
  ip: string
  device: string
  location: string
  status: 'success' | 'failed'
  failReason?: string
  createdAt: string
}

export interface AuditLog {
  id: string
  operator: string
  role: UserRole
  module: string
  action: string
  target: string
  detail: string
  ip: string
  createdAt: string
}

export const MOCK_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'su1', username: 'admin', displayName: '系统管理员', role: 'admin',
    email: 'admin@zhichong.cloud', phone: '138****8001', status: 'active',
    lastLoginAt: '2026-06-13 09:12:08', createdAt: '2025-01-10',
  },
  {
    id: 'su2', username: 'property', displayName: '物业经理', role: 'property',
    email: 'property@zhichong.cloud', phone: '138****8002', status: 'active',
    lastLoginAt: '2026-06-13 08:45:22', createdAt: '2025-03-15',
  },
  {
    id: 'su3', username: 'operator', displayName: '运维工程师', role: 'operator',
    email: 'ops@zhichong.cloud', phone: '138****8003', status: 'active',
    lastLoginAt: '2026-06-12 18:30:00', createdAt: '2025-05-20',
  },
  {
    id: 'su4', username: 'finance01', displayName: '财务专员', role: 'property',
    email: 'finance@zhichong.cloud', phone: '138****8004', status: 'active',
    lastLoginAt: '2026-06-11 14:20:00', createdAt: '2025-08-01',
  },
  {
    id: 'su5', username: 'ops02', displayName: '夜班运维', role: 'operator',
    email: 'ops02@zhichong.cloud', phone: '138****8005', status: 'disabled',
    lastLoginAt: '2026-05-28 23:10:00', createdAt: '2025-09-12',
  },
]

export const MOCK_LOGIN_LOGS: LoginLog[] = [
  { id: 'll1', username: 'admin', displayName: '系统管理员', role: 'admin', ip: '192.168.1.105', device: 'Chrome / macOS', location: '深圳', status: 'success', createdAt: '2026-06-13 09:12:08' },
  { id: 'll2', username: 'property', displayName: '物业经理', role: 'property', ip: '10.0.0.88', device: 'Safari / iOS', location: '深圳', status: 'success', createdAt: '2026-06-13 08:45:22' },
  { id: 'll3', username: 'unknown', displayName: '—', role: 'admin', ip: '203.0.113.12', device: 'Firefox / Windows', location: '未知', status: 'failed', failReason: '用户名不存在', createdAt: '2026-06-13 07:30:00' },
  { id: 'll4', username: 'operator', displayName: '运维工程师', role: 'operator', ip: '192.168.2.20', device: 'Chrome / Windows', location: '广州', status: 'success', createdAt: '2026-06-12 18:30:00' },
  { id: 'll5', username: 'admin', displayName: '系统管理员', role: 'admin', ip: '192.168.1.105', device: 'Chrome / macOS', location: '深圳', status: 'success', createdAt: '2026-06-12 09:00:15' },
  { id: 'll6', username: 'ops02', displayName: '夜班运维', role: 'operator', ip: '192.168.2.55', device: 'Edge / Windows', location: '东莞', status: 'failed', failReason: '账号已停用', createdAt: '2026-06-11 22:05:00' },
  { id: 'll7', username: 'finance01', displayName: '财务专员', role: 'property', ip: '10.0.0.120', device: 'Chrome / macOS', location: '深圳', status: 'success', createdAt: '2026-06-11 14:20:00' },
  { id: 'll8', username: 'admin', displayName: '系统管理员', role: 'admin', ip: '192.168.1.105', device: 'Chrome / macOS', location: '深圳', status: 'success', createdAt: '2026-06-10 09:05:33' },
]

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', operator: '系统管理员', role: 'admin', module: '场站管理', action: '编辑', target: '科技园超级充电站', detail: '更新运营状态为维护中', ip: '192.168.1.105', createdAt: '2026-06-13 10:22:00' },
  { id: 'al2', operator: '系统管理员', role: 'admin', module: '工单规则', action: '保存配置', target: 'SLA 时限', detail: '紧急工单 SLA 由 2h 调整为 1.5h', ip: '192.168.1.105', createdAt: '2026-06-13 09:45:00' },
  { id: 'al3', operator: '运维工程师', role: 'operator', module: '工单列表', action: '分派', target: 'WO-20260613-003', detail: '指派给张工处理', ip: '192.168.2.20', createdAt: '2026-06-13 09:30:00' },
  { id: 'al4', operator: '物业经理', role: 'property', module: '企业管理', action: '编辑', target: '绿能物流集团', detail: '折扣调整为 85%', ip: '10.0.0.88', createdAt: '2026-06-12 16:10:00' },
  { id: 'al5', operator: '系统管理员', role: 'admin', module: '用户管理', action: '停用', target: 'ops02', detail: '停用夜班运维账号', ip: '192.168.1.105', createdAt: '2026-06-12 11:00:00' },
  { id: 'al6', operator: '运维工程师', role: 'operator', module: '设备列表', action: '远程停机', target: 'DC-003-A', detail: 'BMS 过温保护触发远程停机', ip: '192.168.2.20', createdAt: '2026-06-12 08:15:00' },
  { id: 'al7', operator: '系统管理员', role: 'admin', module: '计时策略', action: '保存', target: '峰谷电价', detail: '更新谷时电价 0.68 元/kWh', ip: '192.168.1.105', createdAt: '2026-06-11 15:30:00' },
  { id: 'al8', operator: '财务专员', role: 'property', module: '财务报表', action: '导出', target: '充电营收明细', detail: '导出 2026-06 月报表', ip: '10.0.0.120', createdAt: '2026-06-11 14:25:00' },
]

export interface RolePermissionRow {
  role: UserRole
  label: string
  description: string
  menuCount: number
  menus: string[]
}

export const ROLE_PERMISSION_ROWS: RolePermissionRow[] = (['admin', 'property', 'operator'] as const).map((role) => {
  const allowed = new Set(ROLE_MENU_PERMISSIONS[role])
  const menus = ADMIN_NAV.flatMap((entry) => {
    if (entry.type === 'link') return allowed.has(entry.href) ? [entry.title] : []
    return entry.items.filter((i) => allowed.has(i.href)).map((i) => `${entry.label} / ${i.title}`)
  })
  return {
    role,
    label: ROLE_LABELS[role],
    description: role === 'admin' ? '拥有全部模块访问与系统设置权限' : role === 'property' ? '场站运营、财务与用户运营相关权限' : '设备监控与运维工单相关权限',
    menuCount: menus.length,
    menus,
  }
})
