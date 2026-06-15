import { createContext, useContext, useState, type ReactNode } from 'react'

import { MOCK_WORK_ORDERS as INITIAL_ORDERS } from '@/mocks/work-order-mock'
import type { RepairRecord, WorkOrder, WorkOrderStatus } from '@/types'

interface WorkOrderContextValue {
  orders: WorkOrder[]
  setOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>
  updateOrder: (id: string, patch: Partial<WorkOrder>) => void
  addOrder: (order: WorkOrder) => void
  appendLog: (id: string, record: RepairRecord) => void
}

const WorkOrderContext = createContext<WorkOrderContextValue | null>(null)

export function WorkOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>(INITIAL_ORDERS)

  const updateOrder = (id: string, patch: Partial<WorkOrder>) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...patch } : o))
  }

  const addOrder = (order: WorkOrder) => setOrders((prev) => [order, ...prev])

  const appendLog = (id: string, record: RepairRecord) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, repairRecords: [...o.repairRecords, record] } : o))
  }

  return (
    <WorkOrderContext.Provider value={{ orders, setOrders, updateOrder, addOrder, appendLog }}>
      {children}
    </WorkOrderContext.Provider>
  )
}

export function useWorkOrders() {
  const ctx = useContext(WorkOrderContext)
  if (!ctx) throw new Error('useWorkOrders must be used within WorkOrderProvider')
  return ctx
}

export const WO_STATUS_LABEL: Record<WorkOrderStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  closed: '已关闭',
  overdue: '已逾期',
  awaiting_acceptance: '待验收',
}

export const WO_PRIORITY_LABEL: Record<WorkOrder['priority'], string> = {
  low: '普通', medium: '普通', high: '紧急', critical: '特级',
}

export const DISPATCH_STATUS_LABEL: Record<NonNullable<WorkOrder['dispatchStatus']>, string> = {
  pending: '待调度',
  dispatched: '已派单',
  accepted: '已接单',
  retrying: '重试中',
  failed: '调度失败',
  manual: '转人工',
}

export const WO_ROW_CLASS: Record<WorkOrderStatus, string> = {
  pending: 'bg-[#F3F4F6]',
  processing: 'bg-[#E8F3FF]',
  completed: 'bg-[#F0FDF4]',
  closed: 'bg-[#F0FDF4]',
  overdue: 'bg-[#FEF2F2]',
  awaiting_acceptance: 'bg-[#FFF7ED]',
}
