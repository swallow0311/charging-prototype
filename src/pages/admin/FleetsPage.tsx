import { Navigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

/** 车队管理已移除，旧路由重定向 */
export function AdminFleetsPage() {
  return <Navigate to={ROUTES.ADMIN.USERS} replace />
}
