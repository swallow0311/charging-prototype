export const ROUTES = {
  PORTAL: '/',

  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    STATIONS: '/admin/stations',
    DEVICES: '/admin/devices',
    SCHEDULING: '/admin/scheduling',
    BILLING: '/admin/billing',
    WORK_ORDERS: '/admin/work-orders',
    WORK_ORDERS_LIST: '/admin/work-orders/list',
    WORK_ORDERS_STATS: '/admin/work-orders/stats',
    WORK_ORDERS_RULES: '/admin/work-orders/rules',
    WORK_ORDERS_AI_DISPATCH: '/admin/work-orders/ai-dispatch',
    WORK_ORDERS_DISPATCH_LOGS: '/admin/work-orders/dispatch-logs',
    MAINTENANCE_STRATEGY: '/admin/maintenance-strategy',
    FINANCE: '/admin/finance',
    USERS: '/admin/users',
    FLEETS: '/admin/fleets',
    ENTERPRISES: '/admin/enterprises',
    SETTINGS_USERS: '/admin/settings/users',
    SETTINGS_ROLES: '/admin/settings/roles',
    SETTINGS_LOGIN_LOGS: '/admin/settings/login-logs',
    SETTINGS_AUDIT_LOGS: '/admin/settings/audit-logs',
  },

  MOBILE: {
    AUTH: '/mobile/auth',
    HOME: '/mobile',
    SCAN: '/mobile/scan',
    FIND: '/mobile/find',
    CHARGING: '/mobile/charging',
    PROFILE: '/mobile/profile',
    PROFILE_EDIT: '/mobile/profile/edit',
    vehicle: (id: string) => `/mobile/vehicle/${id}`,
    station: (id: string) => `/mobile/station/${id}`,
  },
} as const

/** 隐藏底部导航栏的子页面路径 */
export const MOBILE_SUB_PAGES = [
  '/mobile/auth',
  '/mobile/scan',
] as const

export function isMobileSubPage(pathname: string): boolean {
  if (MOBILE_SUB_PAGES.some((p) => pathname.startsWith(p))) return true
  if (pathname.startsWith('/mobile/vehicle/')) return true
  if (pathname.startsWith('/mobile/station/')) return true
  if (pathname.startsWith('/mobile/profile/edit')) return true
  return false
}

export const ADMIN_NAV_ITEMS = [
  { title: '数据大盘', href: ROUTES.ADMIN.DASHBOARD, icon: 'LayoutDashboard' },
  { title: '场站管理', href: ROUTES.ADMIN.STATIONS, icon: 'Building2' },
  { title: '设备列表', href: ROUTES.ADMIN.DEVICES, icon: 'PlugZap' },
  { title: '计时策略', href: ROUTES.ADMIN.BILLING, icon: 'Clock' },
  { title: '运维工单', href: ROUTES.ADMIN.WORK_ORDERS, icon: 'Wrench' },
  { title: '财务报表', href: ROUTES.ADMIN.FINANCE, icon: 'Receipt' },
] as const

export const MOBILE_NAV_ITEMS = [
  { title: '首页', href: ROUTES.MOBILE.HOME, icon: 'Home' },
  { title: '找桩', href: ROUTES.MOBILE.FIND, icon: 'MapPin' },
  { title: '充电中', href: ROUTES.MOBILE.CHARGING, icon: 'Zap' },
  { title: '我的', href: ROUTES.MOBILE.PROFILE, icon: 'User' },
] as const
