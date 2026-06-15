import type { UserRole } from '@/types'
import { ROUTES } from '@/constants/routes'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理员',
  property: '物业',
  operator: '运维',
}

export interface AdminNavItem {
  title: string
  href: string
  icon: string
  /** 仅精确匹配路径时高亮（用于 /admin/work-orders 等存在子路由的入口） */
  exact?: boolean
}

export interface AdminNavLink {
  type: 'link'
  title: string
  href: string
  icon: string
}

export interface AdminNavGroup {
  type: 'group'
  label: string
  icon: string
  items: AdminNavItem[]
}

export type AdminNavEntry = AdminNavLink | AdminNavGroup

export const ADMIN_NAV: AdminNavEntry[] = [
  { type: 'link', title: '数据大盘', href: ROUTES.ADMIN.DASHBOARD, icon: 'LayoutDashboard' },
  {
    type: 'group',
    label: '场站设备',
    icon: 'Building2',
    items: [
      { title: '场站管理', href: ROUTES.ADMIN.STATIONS, icon: 'MapPinned' },
      { title: '设备列表', href: ROUTES.ADMIN.DEVICES, icon: 'PlugZap' },
    ],
  },
  {
    type: 'group',
    label: '计费财务',
    icon: 'Wallet',
    items: [
      { title: '计时策略', href: ROUTES.ADMIN.BILLING, icon: 'Clock' },
      { title: '财务报表', href: ROUTES.ADMIN.FINANCE, icon: 'Receipt' },
    ],
  },
  {
    type: 'group',
    label: '用户运营',
    icon: 'Users',
    items: [
      { title: '车主管理', href: ROUTES.ADMIN.USERS, icon: 'UserCircle' },
      { title: '企业管理', href: ROUTES.ADMIN.ENTERPRISES, icon: 'Building' },
    ],
  },
  {
    type: 'group',
    label: '运维保障',
    icon: 'ShieldCheck',
    items: [
      { title: '工单仪表盘', href: ROUTES.ADMIN.WORK_ORDERS, icon: 'LayoutDashboard', exact: true },
      { title: '工单列表', href: ROUTES.ADMIN.WORK_ORDERS_LIST, icon: 'Wrench' },
      { title: '工单统计', href: ROUTES.ADMIN.WORK_ORDERS_STATS, icon: 'BarChart3' },
      { title: 'AI 调度', href: ROUTES.ADMIN.WORK_ORDERS_AI_DISPATCH, icon: 'Bot' },
      { title: '调度日志', href: ROUTES.ADMIN.WORK_ORDERS_DISPATCH_LOGS, icon: 'ScrollText' },
      { title: '规则配置', href: ROUTES.ADMIN.WORK_ORDERS_RULES, icon: 'ClipboardList' },
    ],
  },
  {
    type: 'group',
    label: '系统设置',
    icon: 'Settings',
    items: [
      { title: '用户管理', href: ROUTES.ADMIN.SETTINGS_USERS, icon: 'UserCog' },
      { title: '角色权限', href: ROUTES.ADMIN.SETTINGS_ROLES, icon: 'Shield' },
      { title: '登录日志', href: ROUTES.ADMIN.SETTINGS_LOGIN_LOGS, icon: 'LogIn' },
      { title: '操作日志', href: ROUTES.ADMIN.SETTINGS_AUDIT_LOGS, icon: 'ScrollText' },
    ],
  },
]

const ALL_HREFS = ADMIN_NAV.flatMap((entry) =>
  entry.type === 'link' ? [entry.href] : entry.items.map((i) => i.href),
)

export const ROLE_MENU_PERMISSIONS: Record<UserRole, readonly string[]> = {
  admin: ALL_HREFS,
  property: [
    ROUTES.ADMIN.DASHBOARD,
    ROUTES.ADMIN.STATIONS,
    ROUTES.ADMIN.BILLING,
    ROUTES.ADMIN.FINANCE,
    ROUTES.ADMIN.USERS,
    ROUTES.ADMIN.ENTERPRISES,
  ],
  operator: [
    ROUTES.ADMIN.DASHBOARD,
    ROUTES.ADMIN.DEVICES,
    ROUTES.ADMIN.WORK_ORDERS,
    ROUTES.ADMIN.WORK_ORDERS_LIST,
    ROUTES.ADMIN.WORK_ORDERS_STATS,
    ROUTES.ADMIN.WORK_ORDERS_AI_DISPATCH,
    ROUTES.ADMIN.WORK_ORDERS_DISPATCH_LOGS,
    ROUTES.ADMIN.WORK_ORDERS_RULES,
  ],
}

export function getNavForRole(role: UserRole): AdminNavEntry[] {
  const allowed = new Set(ROLE_MENU_PERMISSIONS[role])
  return ADMIN_NAV
    .map((entry) => {
      if (entry.type === 'link') {
        return allowed.has(entry.href) ? entry : null
      }
      const items = entry.items.filter((item) => allowed.has(item.href))
      if (items.length === 0) return null
      return { ...entry, items }
    })
    .filter((entry): entry is AdminNavEntry => entry !== null)
}

export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN.DASHBOARD]: '数据大盘',
  [ROUTES.ADMIN.STATIONS]: '场站管理',
  [ROUTES.ADMIN.DEVICES]: '设备列表',
  [ROUTES.ADMIN.BILLING]: '计时策略',
  [ROUTES.ADMIN.WORK_ORDERS]: '工单仪表盘',
  [ROUTES.ADMIN.WORK_ORDERS_LIST]: '工单列表',
  [ROUTES.ADMIN.WORK_ORDERS_STATS]: '工单统计',
  [ROUTES.ADMIN.WORK_ORDERS_AI_DISPATCH]: 'AI 调度',
  [ROUTES.ADMIN.WORK_ORDERS_DISPATCH_LOGS]: '调度日志',
  [ROUTES.ADMIN.WORK_ORDERS_RULES]: '规则配置',
  [ROUTES.ADMIN.FINANCE]: '财务报表',
  [ROUTES.ADMIN.USERS]: '车主管理',
  [ROUTES.ADMIN.ENTERPRISES]: '企业管理',
  [ROUTES.ADMIN.SETTINGS_USERS]: '用户管理',
  [ROUTES.ADMIN.SETTINGS_ROLES]: '角色权限',
  [ROUTES.ADMIN.SETTINGS_LOGIN_LOGS]: '登录日志',
  [ROUTES.ADMIN.SETTINGS_AUDIT_LOGS]: '操作日志',
}

/** @deprecated use getNavForRole */
export function getNavGroupsForRole(role: UserRole) {
  return getNavForRole(role)
}
