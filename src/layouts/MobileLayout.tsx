import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, MapPin, User, Zap } from 'lucide-react'

import { isMobileSubPage, MOBILE_NAV_ITEMS } from '@/constants/routes'
import { cn } from '@/lib/utils'

const ICON_MAP = { Home, MapPin, Zap, User } as const

export function MobileLayout() {
  const { pathname } = useLocation()
  const hideNav = isMobileSubPage(pathname)

  return (
    <div className="theme-mobile mx-auto flex min-h-dvh max-w-lg flex-col bg-background">
      <main className={cn('flex-1 overflow-auto', !hideNav && 'pb-16')}>
        <Outlet />
      </main>
      {!hideNav ? (
        <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-around py-2">
            {MOBILE_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP]
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/mobile'}
                  className={({ isActive }) => cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
                    isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  <span>{item.title}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
