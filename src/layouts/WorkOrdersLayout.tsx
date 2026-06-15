import { Outlet } from 'react-router-dom'

import { WorkOrderProvider } from '@/mocks/work-order-store'

export function WorkOrdersLayout() {
  return (
    <WorkOrderProvider>
      <Outlet />
    </WorkOrderProvider>
  )
}
