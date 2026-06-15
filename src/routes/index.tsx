import { Navigate, Outlet, useLocation, createHashRouter, RouterProvider } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { AdminLayout } from '@/layouts/AdminLayout'
import { WorkOrdersLayout } from '@/layouts/WorkOrdersLayout'
import { MobileLayout } from '@/layouts/MobileLayout'
import { useAuth } from '@/mocks/hooks'
import { MobileStoreProvider, useMobileStore } from '@/mocks/mobile-store'
import { AdminBillingPage } from '@/pages/admin/BillingPage'
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminDevicesPage } from '@/pages/admin/DevicesPage'
import { AdminFinancePage } from '@/pages/admin/FinancePage'
import { AdminLoginPage } from '@/pages/admin/LoginPage'
import { AdminSchedulingPage } from '@/pages/admin/SchedulingPage'
import { AdminStationsPage } from '@/pages/admin/StationsPage'
import { AdminUsersPage } from '@/pages/admin/UsersPage'
import { AdminFleetsPage } from '@/pages/admin/FleetsPage'
import { AdminEnterprisesPage } from '@/pages/admin/EnterprisesPage'
import { WorkOrdersDashboardPage } from '@/pages/admin/work-orders/WorkOrdersDashboardPage'
import { WorkOrdersListPage } from '@/pages/admin/work-orders/WorkOrdersListPage'
import { WorkOrdersStatsPage } from '@/pages/admin/work-orders/WorkOrdersStatsPage'
import { WorkOrdersRulesPage } from '@/pages/admin/work-orders/WorkOrdersRulesPage'
import { WorkOrdersAiDispatchPage } from '@/pages/admin/work-orders/WorkOrdersAiDispatchPage'
import { WorkOrdersDispatchLogsPage } from '@/pages/admin/work-orders/WorkOrdersDispatchLogsPage'
import { SystemUsersPage } from '@/pages/admin/settings/SystemUsersPage'
import { SystemRolesPage } from '@/pages/admin/settings/SystemRolesPage'
import { SystemLoginLogsPage } from '@/pages/admin/settings/SystemLoginLogsPage'
import { SystemAuditLogsPage } from '@/pages/admin/settings/SystemAuditLogsPage'
import { MobileAuthPage } from '@/pages/mobile/AuthPage'
import { MobileChargingPage } from '@/pages/mobile/ChargingPage'
import { MobileFindPage } from '@/pages/mobile/FindPage'
import { MobileHomePage } from '@/pages/mobile/HomePage'
import { MobileProfilePage } from '@/pages/mobile/ProfilePage'
import { MobileProfileEditPage } from '@/pages/mobile/ProfileEditPage'
import { MobileScanPage } from '@/pages/mobile/ScanPage'
import { MobileStationDetailPage } from '@/pages/mobile/StationDetailPage'
import { MobileVehicleDetailPage } from '@/pages/mobile/VehicleDetailPage'
import { PortalPage } from '@/pages/PortalPage'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to={ROUTES.ADMIN.LOGIN} replace />
  return <>{children}</>
}

function MobileAuthGuard() {
  const { isAuthorized } = useMobileStore()
  const { pathname } = useLocation()

  if (!isAuthorized && pathname !== ROUTES.MOBILE.AUTH) {
    return <Navigate to={ROUTES.MOBILE.AUTH} replace />
  }
  if (isAuthorized && pathname === ROUTES.MOBILE.AUTH) {
    return <Navigate to={ROUTES.MOBILE.HOME} replace />
  }
  return <Outlet />
}

function MobileRoutesWrapper() {
  return (
    <MobileStoreProvider>
      <MobileAuthGuard />
    </MobileStoreProvider>
  )
}

// 关键：替换为 createHashRouter，不需要 basename
export const router = createHashRouter([
  { path: ROUTES.PORTAL, element: <PortalPage /> },
  { path: ROUTES.ADMIN.LOGIN, element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'stations', element: <AdminStationsPage /> },
      { path: 'devices', element: <AdminDevicesPage /> },
      { path: 'scheduling', element: <AdminSchedulingPage /> },
      { path: 'billing', element: <AdminBillingPage /> },
      {
        path: 'work-orders',
        element: <WorkOrdersLayout />,
        children: [
          { index: true, element: <WorkOrdersDashboardPage /> },
          { path: 'list', element: <WorkOrdersListPage /> },
          { path: 'stats', element: <WorkOrdersStatsPage /> },
          { path: 'ai-dispatch', element: <WorkOrdersAiDispatchPage /> },
          { path: 'dispatch-logs', element: <WorkOrdersDispatchLogsPage /> },
          { path: 'rules', element: <WorkOrdersRulesPage /> },
        ],
      },
      { path: 'maintenance-strategy', element: <Navigate to={ROUTES.ADMIN.WORK_ORDERS_RULES} replace /> },
      { path: 'finance', element: <AdminFinancePage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'fleets', element: <AdminFleetsPage /> },
      { path: 'enterprises', element: <AdminEnterprisesPage /> },
      { path: 'settings/users', element: <SystemUsersPage /> },
      { path: 'settings/roles', element: <SystemRolesPage /> },
      { path: 'settings/login-logs', element: <SystemLoginLogsPage /> },
      { path: 'settings/audit-logs', element: <SystemAuditLogsPage /> },
      { path: 'coupons', element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace /> },
    ],
  },
  {
    path: '/mobile',
    element: <MobileRoutesWrapper />,
    children: [
      {
        element: <MobileLayout />,
        children: [
          { path: 'auth', element: <MobileAuthPage /> },
          { index: true, element: <MobileHomePage /> },
          { path: 'scan', element: <MobileScanPage /> },
          { path: 'find', element: <MobileFindPage /> },
          { path: 'charging', element: <MobileChargingPage /> },
          { path: 'profile', element: <MobileProfilePage /> },
          { path: 'profile/edit', element: <MobileProfileEditPage /> },
          { path: 'vehicle/:id', element: <MobileVehicleDetailPage /> },
          { path: 'station/:id', element: <MobileStationDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.PORTAL} replace /> },
])
