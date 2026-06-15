import { useState } from 'react'
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Mail, Shield, Sun, User } from 'lucide-react'

import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav'
import { DispatchPipelineHelp } from '@/components/admin/DispatchPipelineHelp'
import { ROLE_LABELS, ROLE_MENU_PERMISSIONS, ROUTE_TITLES } from '@/constants/admin-permissions'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/mocks/hooks'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { UserRole } from '@/types'

function AdminHeader({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const pageTitle = ROUTE_TITLES[pathname] ?? '管理后台'
  const role = (user?.role ?? 'admin') as UserRole

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-card)] px-6">
      <div className="flex items-center gap-1.5">
        <h2 className="text-base font-semibold text-[var(--admin-text-title)]">{pageTitle}</h2>
        {pathname === ROUTES.ADMIN.WORK_ORDERS_AI_DISPATCH ? <DispatchPipelineHelp /> : null}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-primary)]"
        >
          <Bell className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-primary)]"
        >
          <Sun className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex h-9 items-center gap-2 rounded-md px-2 transition-colors hover:bg-[var(--admin-hover-bg)]"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-[var(--admin-selected-bg)] text-xs font-semibold text-[var(--admin-primary)]">
                {user?.displayName?.slice(0, 1) ?? 'U'}
              </div>
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm text-[var(--admin-text-body)]">当前登录账号</p>
                <p className="truncate text-xs text-[var(--admin-text-muted)]">@{user?.username ?? '—'}</p>
              </div>
              <ChevronDown className="hidden size-4 shrink-0 text-[var(--admin-text-muted)] sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="admin-dropdown w-72 p-0" sideOffset={8}>
            <div className="border-b border-[var(--admin-border)] px-4 py-3">
              <p className="text-sm font-medium text-[var(--admin-text-title)]">智充云 SaaS 运营平台</p>
            </div>
            <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-4 py-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--admin-hover-bg)] text-base font-semibold text-[var(--admin-text-muted)]">
                {user?.displayName?.slice(0, 1) ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--admin-text-title)]">{user?.displayName}</p>
                <p className="truncate text-xs text-[var(--admin-text-muted)]">账号：{user?.username ?? '—'}</p>
              </div>
            </div>
            <div className="space-y-2.5 px-4 py-3 text-sm">
              <InfoRow icon={Shield} label="角色" value={ROLE_LABELS[role]} />
              <InfoRow icon={Mail} label="邮箱" value={`${user?.username ?? 'user'}@zhichong.cloud`} />
              <InfoRow icon={User} label="本次登录" value={user?.loginAt ?? '—'} />
            </div>
            <div className="border-t border-[var(--admin-border)] p-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--admin-text-body)] transition-colors hover:bg-[var(--admin-hover-bg)]"
                onClick={onLogout}
              >
                <LogOut className="size-4 text-[var(--admin-text-muted)]" />
                退出登录
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[var(--admin-text-muted)]">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="truncate font-medium text-[var(--admin-text-body)]">{value}</span>
    </div>
  )
}

function AdminPermissionGuard() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const role = (user?.role ?? 'admin') as UserRole
  const allowed = ROLE_MENU_PERMISSIONS[role] as readonly string[]

  if (!allowed.includes(pathname)) {
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
  }
  return <Outlet />
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.ADMIN.LOGIN)
  }

  return (
    <div className="theme-admin flex h-dvh overflow-hidden">
      <TooltipProvider>
        <AdminSidebarNav
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--admin-bg)]">
          <AdminHeader onLogout={handleLogout} />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <AdminPermissionGuard />
          </main>
        </div>
      </TooltipProvider>
    </div>
  )
}
