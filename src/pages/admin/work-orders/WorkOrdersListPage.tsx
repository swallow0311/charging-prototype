import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react'

import {
  WorkOrderAcceptanceDialog, WorkOrderAssignDialog, WorkOrderFormDialog,
  WorkOrderProcessDialog, WorkOrderViewDialog,
} from '@/components/admin/work-orders/WorkOrderDialogs'
import { WorkOrderPriorityBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TextTableAction } from '@/components/shared/TextTableAction'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { MOCK_MAINTENANCE_OPERATORS, WO_ORDER_TYPES } from '@/mocks/work-order-mock'
import {
  useWorkOrders, DISPATCH_STATUS_LABEL, WO_PRIORITY_LABEL, WO_ROW_CLASS, WO_STATUS_LABEL,
} from '@/mocks/work-order-store'
import { cn } from '@/lib/utils'
import type { RepairRecord, WorkOrder } from '@/types'

type DialogMode = 'form' | 'assign' | 'process' | 'accept' | 'log' | null

const PAGE_SIZE = 10
const ACTION_COL_WIDTH = 280

export function WorkOrdersListPage() {
  const { orders, addOrder, updateOrder, appendLog } = useWorkOrders()
  const [filterId, setFilterId] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStation, setFilterStation] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [page, setPage] = useState(1)

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [activeOrder, setActiveOrder] = useState<WorkOrder | null>(null)
  const [closeTarget, setCloseTarget] = useState<WorkOrder | null>(null)
  const [urgeTarget, setUrgeTarget] = useState<WorkOrder | null>(null)

  const stations = useMemo(() => [...new Set(orders.map((o) => o.stationName))], [orders])

  const filtered = useMemo(() => {
    let result = [...orders]
    if (filterId) result = result.filter((o) => o.id.toLowerCase().includes(filterId.toLowerCase()))
    if (filterType !== 'all') result = result.filter((o) => o.orderType === filterType)
    if (filterStatus !== 'all') result = result.filter((o) => o.status === filterStatus)
    if (filterStation !== 'all') result = result.filter((o) => o.stationName === filterStation)
    if (filterAssignee !== 'all') result = result.filter((o) => (o.assignee ?? '未分派') === filterAssignee)
    if (filterPriority !== 'all') result = result.filter((o) => o.priority === filterPriority)
    if (filterDateFrom) result = result.filter((o) => o.createdAt >= filterDateFrom)
    if (filterDateTo) result = result.filter((o) => o.createdAt <= `${filterDateTo} 23:59:59`)
    return result
  }, [orders, filterId, filterType, filterStatus, filterStation, filterAssignee, filterPriority, filterDateFrom, filterDateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openDialog = (mode: DialogMode, order: WorkOrder) => {
    setActiveOrder(order)
    setDialogMode(mode)
  }

  const handleSave = (order: WorkOrder) => {
    if (orders.some((o) => o.id === order.id)) updateOrder(order.id, order)
    else addOrder(order)
  }

  const handleAssign = (orderId: string, operatorName: string) => {
    updateOrder(orderId, { assignee: operatorName, status: 'processing' })
    appendLog(orderId, { id: `rr-${Date.now()}`, operator: '调度中心', action: '派单', note: `指派 ${operatorName}`, createdAt: '2026-06-13 16:30:00' })
  }

  const handleProgress = (_orderId: string, _action: string, log: RepairRecord) => {
    if (!activeOrder) return
    appendLog(activeOrder.id, log)
    if (activeOrder.status === 'pending') updateOrder(activeOrder.id, { status: 'processing' })
  }

  const handleComplete = (orderId: string, patch: Partial<WorkOrder>, log: RepairRecord) => {
    updateOrder(orderId, { ...patch, status: 'awaiting_acceptance' })
    appendLog(orderId, log)
  }

  const handleAccept = (orderId: string, rating: number, log: RepairRecord) => {
    updateOrder(orderId, { status: 'completed', rating })
    appendLog(orderId, log)
  }

  const handleReject = (orderId: string, reason: string, log: RepairRecord) => {
    updateOrder(orderId, { status: 'processing', rejectReason: reason })
    appendLog(orderId, log)
  }

  const handleClose = () => {
    if (!closeTarget) return
    updateOrder(closeTarget.id, { status: 'closed' })
    appendLog(closeTarget.id, { id: `rr-${Date.now()}`, operator: '管理员', action: '关闭', note: '手动关闭工单', createdAt: '2026-06-13 16:30:00' })
    setCloseTarget(null)
  }

  const handleUrge = () => {
    if (!urgeTarget) return
    appendLog(urgeTarget.id, { id: `rr-${Date.now()}`, operator: '调度中心', action: '催办', note: '已发送催办通知', createdAt: '2026-06-13 16:30:00' })
    setUrgeTarget(null)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="admin-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <FilterInput label="工单号" value={filterId} onChange={(v) => { setFilterId(v); setPage(1) }} placeholder="WO-..." />
            <FilterSelect label="类型" value={filterType} onChange={(v) => { setFilterType(v); setPage(1) }} options={[{ v: 'all', l: '全部' }, ...WO_ORDER_TYPES.map((t) => ({ v: t, l: t }))]} />
            <FilterSelect label="状态" value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1) }} options={[{ v: 'all', l: '全部' }, ...Object.entries(WO_STATUS_LABEL).map(([v, l]) => ({ v, l }))]} />
            <FilterSelect label="场站" value={filterStation} onChange={(v) => { setFilterStation(v); setPage(1) }} options={[{ v: 'all', l: '全部' }, ...stations.map((s) => ({ v: s, l: s }))]} />
            <FilterSelect label="处理人" value={filterAssignee} onChange={(v) => { setFilterAssignee(v); setPage(1) }} options={[{ v: 'all', l: '全部' }, { v: '未分派', l: '未分派' }, ...MOCK_MAINTENANCE_OPERATORS.map((o) => ({ v: o.name, l: o.name }))]} />
            <FilterInput label="开始日期" value={filterDateFrom} onChange={(v) => { setFilterDateFrom(v); setPage(1) }} type="date" />
            <FilterInput label="结束日期" value={filterDateTo} onChange={(v) => { setFilterDateTo(v); setPage(1) }} type="date" />
            <FilterSelect label="优先级" value={filterPriority} onChange={(v) => { setFilterPriority(v); setPage(1) }} options={[{ v: 'all', l: '全部' }, ...Object.entries(WO_PRIORITY_LABEL).map(([v, l]) => ({ v, l }))]} />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button onClick={() => { setActiveOrder(null); setDialogMode('form') }}>
              <Plus className="size-4" />新增
            </Button>
            <Button variant="outline" onClick={() => alert('已导出（模拟）')}>
              <Download className="size-4" />导出
            </Button>
          </div>
        </div>
      </div>

      <div className="relative rounded-lg border border-[var(--admin-border)]">
        <div className="overflow-x-auto" style={{ paddingRight: ACTION_COL_WIDTH }}>
          <Table className="min-w-[1280px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">工单编号</TableHead>
                <TableHead className="min-w-[72px]">工单类型</TableHead>
                <TableHead className="min-w-[100px]">设备编号</TableHead>
                <TableHead className="min-w-[160px]">站点地址</TableHead>
                <TableHead className="min-w-[72px]">紧急等级</TableHead>
                <TableHead className="min-w-[72px]">调度方式</TableHead>
                <TableHead className="min-w-[80px]">调度状态</TableHead>
                <TableHead className="min-w-[56px]">重试</TableHead>
                <TableHead className="min-w-[130px]">创建时间</TableHead>
                <TableHead className="min-w-[80px]">当前状态</TableHead>
                <TableHead className="min-w-[72px]">处理人员</TableHead>
                <TableHead className="min-w-[72px]">处理时长</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : paginated.map((row) => (
                <TableRow key={row.id} className={cn(WO_ROW_CLASS[row.status])}>
                  <TableCell className="py-2.5 text-sm font-medium">{row.id}</TableCell>
                  <TableCell className="py-2.5 text-sm">{row.orderType}</TableCell>
                  <TableCell className="py-2.5 text-sm">{row.deviceCode}</TableCell>
                  <TableCell className="max-w-[180px] truncate py-2.5 text-sm" title={row.stationAddress}>{row.stationAddress}</TableCell>
                  <TableCell className="py-2.5"><WorkOrderPriorityBadge priority={row.priority} /></TableCell>
                  <TableCell className="py-2.5 text-sm">{row.isAiDispatch ? 'AI 派单' : '人工'}</TableCell>
                  <TableCell className="py-2.5 text-sm">
                    {row.dispatchStatus ? DISPATCH_STATUS_LABEL[row.dispatchStatus] : '—'}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm">{row.dispatchRetryTimes ?? 0}</TableCell>
                  <TableCell className="py-2.5 text-sm">{row.createdAt}</TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant="secondary" className={cn(row.isOverdue && 'border-[var(--admin-danger)] text-[var(--admin-danger)]')}>
                      {WO_STATUS_LABEL[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm">{row.assignee ?? '—'}</TableCell>
                  <TableCell className="py-2.5 text-sm">{row.processingDuration ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-20 flex flex-col border-l border-[var(--admin-border)] bg-[var(--admin-card)] shadow-[-6px_0_16px_rgba(31,41,55,0.06)]"
          style={{ width: ACTION_COL_WIDTH }}
        >
          <div className="flex h-10 shrink-0 items-center border-b border-[var(--admin-border)] bg-[var(--admin-hover-bg)] px-3 text-xs font-medium text-[var(--admin-text-muted)]">
            操作
          </div>
          <div className="flex-1 overflow-hidden">
            {paginated.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">—</div>
            ) : paginated.map((row) => (
              <div
                key={row.id}
                className={cn(
                  'pointer-events-auto flex min-h-[41px] flex-wrap items-center gap-0.5 border-b border-[var(--admin-border)] px-1 py-1',
                  WO_ROW_CLASS[row.status],
                )}
              >
                {row.status === 'pending' ? <TextTableAction label="分派" onClick={() => openDialog('assign', row)} /> : null}
                {['pending', 'processing', 'overdue'].includes(row.status) ? (
                  <TextTableAction label="催办" onClick={() => setUrgeTarget(row)} />
                ) : null}
                {row.status === 'pending' ? <TextTableAction label="编辑" onClick={() => openDialog('form', row)} /> : null}
                {row.status === 'processing' || row.status === 'overdue' ? (
                  <TextTableAction label="处理" onClick={() => openDialog('process', row)} />
                ) : null}
                {row.status === 'awaiting_acceptance' ? (
                  <TextTableAction label="验收" onClick={() => openDialog('accept', row)} />
                ) : null}
                <TextTableAction label="日志" onClick={() => openDialog('log', row)} />
                {!['closed', 'completed'].includes(row.status) ? (
                  <TextTableAction label="关闭" variant="danger" onClick={() => setCloseTarget(row)} />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground" style={{ paddingRight: ACTION_COL_WIDTH }}>
        <span>共 {filtered.length} 条，第 {page}/{totalPages} 页</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <WorkOrderFormDialog open={dialogMode === 'form'} onOpenChange={(o) => !o && setDialogMode(null)} order={activeOrder} onSave={handleSave} />
      <WorkOrderAssignDialog open={dialogMode === 'assign'} onOpenChange={(o) => !o && setDialogMode(null)} order={activeOrder} onAssign={handleAssign} />
      <WorkOrderProcessDialog open={dialogMode === 'process'} onOpenChange={(o) => !o && setDialogMode(null)} order={activeOrder} onComplete={handleComplete} onProgress={handleProgress} />
      <WorkOrderAcceptanceDialog open={dialogMode === 'accept'} onOpenChange={(o) => !o && setDialogMode(null)} order={activeOrder} onAccept={handleAccept} onReject={handleReject} />
      <WorkOrderViewDialog open={dialogMode === 'log'} onOpenChange={(o) => !o && setDialogMode(null)} order={activeOrder} />

      <ConfirmDialog open={!!closeTarget} onOpenChange={() => setCloseTarget(null)} title="关闭工单" description={`确认关闭工单 ${closeTarget?.id}？`} confirmLabel="确认关闭" variant="destructive" onConfirm={handleClose} />
      <ConfirmDialog open={!!urgeTarget} onOpenChange={() => setUrgeTarget(null)} title="催办工单" description={`向 ${urgeTarget?.assignee ?? '处理人'} 发送催办通知？`} confirmLabel="发送催办" onConfirm={handleUrge} />
    </div>
  )
}

function FilterInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  )
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { v: string; l: string }[]
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
