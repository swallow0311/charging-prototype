export type PermissionOp = 'view' | 'add' | 'edit' | 'delete' | 'export'

export const PERMISSION_OP_LABELS: Record<PermissionOp, string> = {
  view: '查看',
  add: '新增',
  edit: '编辑',
  delete: '删除',
  export: '导出',
}

export interface SimplePermissionItem {
  id: string
  label: string
  type: 'simple'
}

export interface MatrixPermissionItem {
  id: string
  label: string
  type: 'matrix'
}

export type PermissionItem = SimplePermissionItem | MatrixPermissionItem

export interface PermissionModule {
  id: string
  label: string
  items: PermissionItem[]
}

export interface RoleDefinition {
  id: string
  name: string
  isDefault?: boolean
  permissions: Record<string, boolean | PermissionOp[]>
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'overview',
    label: '运营概览模块',
    items: [{ id: 'dashboard', label: '数据大盘', type: 'simple' }],
  },
  {
    id: 'station',
    label: '场站设备模块',
    items: [
      { id: 'stations', label: '场站管理', type: 'matrix' },
      { id: 'devices', label: '设备列表', type: 'matrix' },
    ],
  },
  {
    id: 'billing',
    label: '计费财务模块',
    items: [
      { id: 'billing', label: '计时策略', type: 'simple' },
      { id: 'finance', label: '财务报表', type: 'matrix' },
    ],
  },
  {
    id: 'user-ops',
    label: '用户运营模块',
    items: [
      { id: 'vehicle-users', label: '车主管理', type: 'matrix' },
      { id: 'enterprises', label: '企业管理', type: 'matrix' },
    ],
  },
  {
    id: 'maintenance',
    label: '运维保障模块',
    items: [
      { id: 'wo-dashboard', label: '工单仪表盘', type: 'simple' },
      { id: 'wo-list', label: '工单列表', type: 'matrix' },
      { id: 'wo-stats', label: '工单统计', type: 'simple' },
      { id: 'wo-ai-dispatch', label: 'AI 调度', type: 'matrix' },
      { id: 'wo-dispatch-logs', label: '调度日志', type: 'simple' },
      { id: 'wo-rules', label: '规则配置', type: 'simple' },
    ],
  },
  {
    id: 'system',
    label: '系统设置模块',
    items: [
      { id: 'sys-users', label: '用户管理', type: 'matrix' },
      { id: 'sys-roles', label: '角色权限', type: 'simple' },
      { id: 'sys-login-logs', label: '登录日志', type: 'simple' },
      { id: 'sys-audit-logs', label: '操作日志', type: 'simple' },
    ],
  },
]

const ALL_OPS: PermissionOp[] = ['view', 'add', 'edit', 'delete', 'export']
const VIEW_EXPORT: PermissionOp[] = ['view', 'export']
const VIEW_EDIT: PermissionOp[] = ['view', 'edit']

function buildAdminPermissions(): Record<string, boolean | PermissionOp[]> {
  const p: Record<string, boolean | PermissionOp[]> = {}
  for (const mod of PERMISSION_MODULES) {
    for (const item of mod.items) {
      p[item.id] = item.type === 'simple' ? true : [...ALL_OPS]
    }
  }
  return p
}

function buildPropertyPermissions(): Record<string, boolean | PermissionOp[]> {
  return {
    dashboard: true,
    stations: ['view', 'edit'],
    devices: ['view'],
    billing: true,
    finance: VIEW_EXPORT,
    'vehicle-users': ['view', 'export'],
    enterprises: ALL_OPS,
    'wo-dashboard': false,
    'wo-list': false,
    'wo-stats': false,
    'wo-rules': false,
    'sys-users': false,
    'sys-roles': false,
    'sys-login-logs': false,
    'sys-audit-logs': false,
  }
}

function buildOperatorPermissions(): Record<string, boolean | PermissionOp[]> {
  return {
    dashboard: true,
    stations: ['view'],
    devices: ALL_OPS,
    billing: false,
    finance: false,
    'vehicle-users': false,
    enterprises: false,
    'wo-dashboard': true,
    'wo-list': ALL_OPS,
    'wo-stats': ['view', 'export'],
    'wo-rules': VIEW_EDIT,
    'sys-users': false,
    'sys-roles': false,
    'sys-login-logs': false,
    'sys-audit-logs': false,
  }
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  { id: 'role-admin', name: '管理员', isDefault: true, permissions: buildAdminPermissions() },
  { id: 'role-property', name: '物业经理', isDefault: true, permissions: buildPropertyPermissions() },
  { id: 'role-operator', name: '运维工程师', isDefault: true, permissions: buildOperatorPermissions() },
  { id: 'role-finance', name: '财务专员', isDefault: false, permissions: {
    dashboard: true,
    stations: ['view'],
    devices: ['view'],
    billing: false,
    finance: ALL_OPS,
    'vehicle-users': ['view'],
    enterprises: ['view', 'export'],
    'wo-dashboard': false,
    'wo-list': false,
    'wo-stats': false,
    'wo-rules': false,
    'sys-users': false,
    'sys-roles': false,
    'sys-login-logs': false,
    'sys-audit-logs': false,
  } },
  { id: 'role-custom', name: '调度专员', isDefault: false, permissions: {
    dashboard: true,
    stations: ['view'],
    devices: ['view', 'edit'],
    billing: false,
    finance: false,
    'vehicle-users': false,
    enterprises: false,
    'wo-dashboard': true,
    'wo-list': ['view', 'edit'],
    'wo-stats': ['view'],
    'wo-rules': ['view'],
    'sys-users': false,
    'sys-roles': false,
    'sys-login-logs': false,
    'sys-audit-logs': false,
  } },
]
