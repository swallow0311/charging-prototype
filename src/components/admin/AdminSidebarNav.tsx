import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3, Building, Building2, Bot, ChevronDown, ChevronLeft, ChevronRight,
  ClipboardList, Clock, LayoutDashboard, LogIn, MapPinned, PlugZap, Receipt,
  ScrollText, Settings, Shield, ShieldCheck, UserCircle, UserCog, Users, Wallet,
  Wrench, Zap,
} from 'lucide-react'

import { getNavForRole } from '@/constants/admin-permissions'
import { isNavItemActive } from '@/utils/nav-active'
import { useAuth } from '@/mocks/hooks'
import { cn } from '@/lib/utils'
import type { AdminNavGroup, AdminNavItem } from '@/constants/admin-permissions'
import type { UserRole } from '@/types'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ICON_MAP = {
  LayoutDashboard, Building2, PlugZap, Clock, Wrench, Receipt, Users, Building,
  ClipboardList, BarChart3, Settings, UserCog, Shield, LogIn, ScrollText, Bot,
  MapPinned, UserCircle, Wallet, ShieldCheck, Zap,
} as const

interface AdminSidebarNavProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

function buildDefaultExpanded(nav: ReturnType<typeof getNavForRole>): Record<string, boolean> {
  return Object.fromEntries(
    nav.filter((entry) => entry.type === 'group').map((entry) => [entry.label, true]),
  )
}

export function AdminSidebarNav({ collapsed, onToggleCollapse }: AdminSidebarNavProps) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const role = (user?.role ?? 'admin') as UserRole
  const nav = useMemo(() => getNavForRole(role), [role])

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => buildDefaultExpanded(nav))

  useEffect(() => {
    setExpanded(buildDefaultExpanded(nav))
  }, [role, nav])

  const toggleGroup = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside
      className={cn(
        'admin-sidebar relative z-20 flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--admin-border)] bg-[var(--admin-card)] transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-[var(--admin-sidebar-collapsed)]' : 'w-[var(--admin-sidebar-width)]',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-[var(--admin-border)] px-3">
        <div className={cn('flex items-center gap-2.5 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--admin-selected-bg)]">
            <Zap className="size-4 text-[var(--admin-primary)]" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--admin-text-title)]">智充云 SaaS</p>
              <p className="truncate text-xs text-[var(--admin-text-muted)]">内容运营后台</p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--admin-text-muted)] transition-colors duration-200 hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-primary)]"
            aria-label="收缩侧边栏"
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="mx-auto mt-2 flex size-7 items-center justify-center rounded-md text-[var(--admin-text-muted)] transition-colors duration-200 hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-primary)]"
          aria-label="展开侧边栏"
        >
          <ChevronRight className="size-4" />
        </button>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="space-y-0.5">
          {nav.map((entry) => {
            if (entry.type === 'link') {
              return <NavLinkItem key={entry.href} item={entry} collapsed={collapsed} />
            }
            return (
              <NavGroup
                key={entry.label}
                group={entry}
                collapsed={collapsed}
                expanded={expanded[entry.label] ?? true}
                onToggle={() => toggleGroup(entry.label)}
                pathname={pathname}
              />
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

function NavLinkItem({ item, collapsed }: { item: { title: string; href: string; icon: string }; collapsed: boolean }) {
  const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? LayoutDashboard
  return (
    <li>
      <NavLink
        to={item.href}
        end
        title={collapsed ? item.title : undefined}
        className={({ isActive }) => cn(
          'admin-nav-item group relative',
          isActive && 'admin-nav-item--active',
          collapsed && 'justify-center px-0',
        )}
      >
        {({ isActive }) => (
          <>
            {isActive ? <span className="admin-nav-item__indicator" aria-hidden /> : null}
            <Icon className="size-[18px] shrink-0" />
            {!collapsed ? <span className="flex-1 text-sm">{item.title}</span> : null}
          </>
        )}
      </NavLink>
    </li>
  )
}

interface NavGroupProps {
  group: AdminNavGroup
  collapsed: boolean
  expanded: boolean
  onToggle: () => void
  pathname: string
}

function NavGroup({ group, collapsed, expanded, onToggle, pathname }: NavGroupProps) {
  const Icon = ICON_MAP[group.icon as keyof typeof ICON_MAP] ?? Settings
  const hasActiveChild = group.items.some((i) => isNavItemActive(pathname, i.href, i.exact))

  if (collapsed) {
    return (
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title={group.label}
              className={cn(
                'admin-nav-item w-full',
                hasActiveChild && 'admin-nav-item--active',
                'justify-center px-0',
              )}
            >
              <Icon className="size-[18px] shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="admin-dropdown min-w-40">
            <p className="px-2 py-1.5 text-xs font-medium text-[var(--admin-text-muted)]">{group.label}</p>
            {group.items.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <NavLink
                  to={item.href}
                  end={item.exact}
                  className={({ isActive }) => cn(
                    'block cursor-pointer px-2 py-1.5 text-sm outline-none',
                    isActive ? 'bg-[var(--admin-selected-bg)] text-[var(--admin-primary)]' : 'text-[var(--admin-text-body)]',
                  )}
                >
                  {item.title}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'admin-nav-group-trigger',
          hasActiveChild && 'admin-nav-group-trigger--active',
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        <span className="flex-1 text-left text-sm">{group.label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-[var(--admin-text-muted)] transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>
      {expanded ? (
        <ul className="pb-1">
          {group.items.map((item) => (
            <SubNavLink key={item.href} item={item} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function SubNavLink({ item }: { item: AdminNavItem }) {
  return (
    <li>
      <NavLink
        to={item.href}
        end={item.exact}
        className={({ isActive }) => cn(
          'admin-nav-sub-item group relative',
          isActive && 'admin-nav-sub-item--active',
        )}
      >
        {({ isActive }) => (
          <>
            {isActive ? <span className="admin-nav-sub-item__dot" aria-hidden /> : null}
            <span className="text-sm">{item.title}</span>
          </>
        )}
      </NavLink>
    </li>
  )
}
