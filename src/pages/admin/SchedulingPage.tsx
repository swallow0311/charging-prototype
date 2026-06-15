import { Navigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'

/** AI 调度已整合至数据大盘，旧路由重定向 */
export function AdminSchedulingPage() {
  return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
}
