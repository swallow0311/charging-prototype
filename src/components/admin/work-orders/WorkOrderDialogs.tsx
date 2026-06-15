import { useEffect, useMemo, useState } from 'react'
import {
  Bot, CheckCircle2, Circle, Clock, ImagePlus, MapPin, Star, Upload, User, Wrench,
} from 'lucide-react'

import { WorkOrderPriorityBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { MOCK_DEVICES, MOCK_STATIONS } from '@/mocks/admin-data'
import {
  MOCK_MAINTENANCE_OPERATORS, WO_ORDER_TYPES, WO_RULES_DEFAULT,
} from '@/mocks/work-order-mock'
import { WO_PRIORITY_LABEL, WO_STATUS_LABEL } from '@/mocks/work-order-store'
import { cn } from '@/lib/utils'
import type { FaultType, RepairRecord, SparePartRecord, WorkOrder } from '@/types'

const FAULT_TYPES: FaultType[] = ['通信故障', '过温保护', '枪头异常', '电源模块', '其他']

const SOURCE_LABEL: Record<WorkOrder['source'], string> = {
  ai_alert: 'AI 告警',
  manual: '人工创建',
  user_report: '用户上报',
}

function genOrderId() {
  return `WO-20260613-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`
}

function nowStr() {
  return '2026-06-13 16:30:00'
}

function addHours(base: string, hours: number) {
  const d = new Date(base.replace(' ', 'T'))
  d.setHours(d.getHours() + hours)
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function FormSection({ title, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[var(--admin-text-title)]">{title}</h4>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="col-span-2 text-xs text-[var(--admin-danger)]">{msg}</p>
}

function buildEmptyForm(): Partial<WorkOrder> {
  return {
    title: '',
    orderType: '故障维修',
    stationId: '',
    stationName: '',
    stationAddress: '',
    deviceId: '',
    deviceName: '',
    deviceCode: '',
    faultType: '通信故障',
    priority: 'medium',
    source: 'manual',
    description: '',
    occurredAt: nowStr(),
    slaHours: WO_RULES_DEFAULT.slaHours.medium,
    deadline: addHours(nowStr(), WO_RULES_DEFAULT.slaHours.medium),
    contactName: '',
    contactPhone: '',
    remark: '',
  }
}

// ─── Form Dialog ───────────────────────────────────────────────────────────

interface WorkOrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: WorkOrder | null
  onSave: (order: WorkOrder) => void
}

export function WorkOrderFormDialog({ open, onOpenChange, order, onSave }: WorkOrderFormDialogProps) {
  const [form, setForm] = useState<Partial<WorkOrder>>(buildEmptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(order ? { ...order } : buildEmptyForm())
      setErrors({})
    }
  }, [open, order])

  const stationDevices = useMemo(
    () => (form.stationId ? MOCK_DEVICES.filter((d) => d.stationId === form.stationId) : []),
    [form.stationId],
  )

  const setPriority = (priority: WorkOrder['priority']) => {
    const sla = WO_RULES_DEFAULT.slaHours[priority]
    setForm((f) => ({
      ...f,
      priority,
      slaHours: sla,
      deadline: addHours(f.occurredAt ?? nowStr(), sla),
    }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.title?.trim()) next.title = '请填写工单标题'
    if (!form.stationId) next.stationId = '请选择场站'
    if (!form.deviceId) next.deviceId = '请选择设备'
    if (!form.description?.trim()) next.description = '请填写问题描述'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const station = MOCK_STATIONS.find((s) => s.id === form.stationId)!
    const device = MOCK_DEVICES.find((d) => d.id === form.deviceId)!
    const payload: WorkOrder = {
      id: order?.id ?? genOrderId(),
      title: form.title!.trim(),
      orderType: form.orderType ?? '故障维修',
      deviceId: device.id,
      deviceName: device.name,
      deviceCode: device.deviceCode,
      stationId: station.id,
      stationName: station.name,
      stationAddress: station.address,
      faultType: form.faultType ?? '通信故障',
      priority: form.priority ?? 'medium',
      status: order?.status ?? 'pending',
      source: form.source ?? 'manual',
      description: form.description!.trim(),
      createdAt: order?.createdAt ?? nowStr(),
      occurredAt: form.occurredAt ?? nowStr(),
      deadline: form.deadline ?? addHours(nowStr(), 8),
      slaHours: form.slaHours ?? 8,
      isOverdue: order?.isOverdue ?? false,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      remark: form.remark,
      assignee: order?.assignee,
      repairRecords: order?.repairRecords ?? [
        { id: `rr-${Date.now()}`, operator: '管理员', action: '工单创建', note: '手动创建工单', createdAt: nowStr() },
      ],
      spareParts: order?.spareParts,
      faultCause: order?.faultCause,
      solution: order?.solution,
      costDetail: order?.costDetail,
      rating: order?.rating,
      processingDuration: order?.processingDuration,
    }
    onSave(payload)
    onOpenChange(false)
  }

  const handleReset = () => setForm(order ? { ...order } : buildEmptyForm())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog-content max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{order ? '编辑工单' : '创建工单'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <FormSection title="基础信息">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>工单标题 *</Label>
              <Input value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="简要描述故障" />
            </div>
            <div className="space-y-1.5">
              <Label>工单类型</Label>
              <Select value={form.orderType} onValueChange={(v) => setForm((f) => ({ ...f, orderType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WO_ORDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>来源</Label>
              <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v as WorkOrder['source'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">人工创建</SelectItem>
                  <SelectItem value="ai_alert">AI 告警</SelectItem>
                  <SelectItem value="user_report">用户上报</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>所属场站 *</Label>
              <Select
                value={form.stationId || undefined}
                onValueChange={(v) => {
                  const s = MOCK_STATIONS.find((x) => x.id === v)!
                  setForm((f) => ({ ...f, stationId: v, stationName: s.name, stationAddress: s.address, deviceId: '', deviceName: '', deviceCode: '' }))
                }}
              >
                <SelectTrigger><SelectValue placeholder="选择场站" /></SelectTrigger>
                <SelectContent>
                  {MOCK_STATIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>关联设备 *</Label>
              <Select
                value={form.deviceId || undefined}
                disabled={!form.stationId}
                onValueChange={(v) => {
                  const d = MOCK_DEVICES.find((x) => x.id === v)!
                  setForm((f) => ({ ...f, deviceId: v, deviceName: d.name, deviceCode: d.deviceCode }))
                }}
              >
                <SelectTrigger><SelectValue placeholder="选择设备" /></SelectTrigger>
                <SelectContent>
                  {stationDevices.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.deviceCode})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <FieldError msg={errors.title ?? errors.stationId ?? errors.deviceId} />
          </FormSection>

          <Separator />

          <FormSection title="问题信息">
            <div className="space-y-1.5">
              <Label>故障类型</Label>
              <Select value={form.faultType} onValueChange={(v) => setForm((f) => ({ ...f, faultType: v as FaultType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FAULT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>优先级</Label>
              <Select value={form.priority} onValueChange={(v) => setPriority(v as WorkOrder['priority'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(WO_PRIORITY_LABEL) as WorkOrder['priority'][]).map((p) => (
                    <SelectItem key={p} value={p}>{WO_PRIORITY_LABEL[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>问题描述 *</Label>
              <Textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="详细描述故障现象..." />
              <FieldError msg={errors.description} />
            </div>
          </FormSection>

          <Separator />

          <FormSection title="时限配置">
            <div className="space-y-1.5">
              <Label>发生时间</Label>
              <Input value={form.occurredAt ?? ''} onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>SLA 时限 (小时)</Label>
              <Input type="number" value={form.slaHours ?? 8} onChange={(e) => {
                const h = Number(e.target.value)
                setForm((f) => ({ ...f, slaHours: h, deadline: addHours(f.occurredAt ?? nowStr(), h) }))
              }} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>截止时间</Label>
              <Input value={form.deadline ?? ''} readOnly className="bg-muted/50" />
            </div>
          </FormSection>

          <Separator />

          <FormSection title="辅助信息">
            <div className="space-y-1.5">
              <Label>联系人</Label>
              <Input value={form.contactName ?? ''} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>联系电话</Label>
              <Input value={form.contactPhone ?? ''} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>备注</Label>
              <Textarea rows={2} value={form.remark ?? ''} onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))} />
            </div>
          </FormSection>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <Button onClick={handleSubmit}>{order ? '保存' : '提交'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assign Dialog ─────────────────────────────────────────────────────────

interface WorkOrderAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: WorkOrder | null
  onAssign: (orderId: string, operatorName: string) => void
}

function recommendOperator(order: WorkOrder | null) {
  if (!order) return MOCK_MAINTENANCE_OPERATORS[0]
  const onDuty = MOCK_MAINTENANCE_OPERATORS.filter((o) => o.onDuty)
  return [...onDuty].sort((a, b) => a.pendingCount - b.pendingCount || a.avgHours - b.avgHours)[0]
}

export function WorkOrderAssignDialog({ open, onOpenChange, order, onAssign }: WorkOrderAssignDialogProps) {
  const [tab, setTab] = useState('smart')
  const [selected, setSelected] = useState('')
  const recommended = useMemo(() => recommendOperator(order), [order])

  useEffect(() => {
    if (open) {
      setTab('smart')
      setSelected(recommended?.name ?? '')
    }
  }, [open, recommended])

  const handleConfirm = () => {
    if (!order || !selected) return
    onAssign(order.id, selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog-content sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>分派工单 — {order?.id}</DialogTitle>
        </DialogHeader>
        {order ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] p-3 text-sm">
              <p className="font-medium">{order.title}</p>
              <p className="mt-1 text-muted-foreground">{order.stationName} · {order.faultType}</p>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="smart">智能推荐</TabsTrigger>
                <TabsTrigger value="manual">手动选择</TabsTrigger>
              </TabsList>
              <TabsContent value="smart" className="mt-4 space-y-3">
                {recommended ? (
                  <div className="rounded-lg border border-[var(--admin-primary)]/30 bg-[var(--admin-selected-bg)] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{recommended.name}</p>
                        <p className="text-sm text-muted-foreground">{recommended.region} · 待处理 {recommended.pendingCount} 单</p>
                      </div>
                      <Badge>{recommended.onDuty ? '在岗' : '离岗'}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      推荐理由：待处理量最少，平均处理 {recommended.avgHours}h，已完成 {recommended.completedCount} 单
                    </p>
                  </div>
                ) : null}
              </TabsContent>
              <TabsContent value="manual" className="mt-4 space-y-2">
                {MOCK_MAINTENANCE_OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setSelected(op.name)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors',
                      selected === op.name ? 'border-[var(--admin-primary)] bg-[var(--admin-selected-bg)]' : 'border-[var(--admin-border)] hover:bg-[var(--admin-hover-bg)]',
                    )}
                  >
                    <div>
                      <span className="font-medium">{op.name}</span>
                      <span className="ml-2 text-muted-foreground">{op.region}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">待处理 {op.pendingCount}</span>
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleConfirm} disabled={!selected}>确认分派</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Process Dialog ────────────────────────────────────────────────────────

interface WorkOrderProcessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: WorkOrder | null
  onComplete: (orderId: string, patch: Partial<WorkOrder>, log: RepairRecord) => void
  onProgress: (orderId: string, action: string, log: RepairRecord) => void
}

const PROGRESS_STEPS = ['接单', '出发', '到场', '处理中'] as const

export function WorkOrderProcessDialog({ open, onOpenChange, order, onComplete, onProgress }: WorkOrderProcessDialogProps) {
  const [faultCause, setFaultCause] = useState('')
  const [solution, setSolution] = useState('')
  const [costDetail, setCostDetail] = useState('')
  const [spareName, setSpareName] = useState('')
  const [spareQty, setSpareQty] = useState(1)
  const [spareParts, setSpareParts] = useState<SparePartRecord[]>([])
  const [mockImages, setMockImages] = useState<string[]>([])

  useEffect(() => {
    if (open && order) {
      setFaultCause(order.faultCause ?? '')
      setSolution(order.solution ?? '')
      setCostDetail(order.costDetail ?? '')
      setSpareParts(order.spareParts ?? [])
      setMockImages(order.images ?? [])
      setSpareName('')
      setSpareQty(1)
    }
  }, [open, order])

  const addSpare = () => {
    if (!spareName.trim()) return
    setSpareParts((prev) => [...prev, { id: `sp-${Date.now()}`, partName: spareName.trim(), quantity: spareQty, replacedAt: nowStr() }])
    setSpareName('')
    setSpareQty(1)
  }

  const handleProgress = (action: string) => {
    if (!order) return
    onProgress(order.id, action, {
      id: `rr-${Date.now()}`, operator: order.assignee ?? '运维工程师', action, note: `状态更新：${action}`, createdAt: nowStr(),
    })
  }

  const handleComplete = () => {
    if (!order || !faultCause.trim() || !solution.trim()) return
    onComplete(order.id, { faultCause, solution, costDetail, spareParts, images: mockImages, processingDuration: '3h00m' }, {
      id: `rr-${Date.now()}`, operator: order.assignee ?? '运维工程师', action: '完工提交', note: solution, createdAt: nowStr(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog-content max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>处理工单 — {order?.id}</DialogTitle>
        </DialogHeader>
        {order ? (
          <div className="space-y-5 py-2">
            <div className="rounded-lg border border-[var(--admin-border)] p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <WorkOrderPriorityBadge priority={order.priority} />
                <Badge variant="outline">{order.faultType}</Badge>
                <Badge variant="secondary">{WO_STATUS_LABEL[order.status]}</Badge>
              </div>
              <p className="mt-2 font-medium">{order.title}</p>
              <p className="mt-1 text-muted-foreground">{order.stationName} · {order.deviceName}</p>
              <p className="mt-2">{order.description}</p>
            </div>

            <div>
              <Label className="mb-2 block">处理进度</Label>
              <div className="flex flex-wrap gap-2">
                {PROGRESS_STEPS.map((step) => (
                  <Button key={step} size="sm" variant="outline" onClick={() => handleProgress(step)}>{step}</Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>故障原因 *</Label>
                <Textarea rows={2} value={faultCause} onChange={(e) => setFaultCause(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>处理方案 *</Label>
                <Textarea rows={2} value={solution} onChange={(e) => setSolution(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>费用明细</Label>
                <Input value={costDetail} onChange={(e) => setCostDetail(e.target.value)} placeholder="如：人工 ¥200 + 配件 ¥80" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">备件更换</Label>
              <div className="flex gap-2">
                <Input className="flex-1" value={spareName} onChange={(e) => setSpareName(e.target.value)} placeholder="备件名称" />
                <Input type="number" className="w-20" min={1} value={spareQty} onChange={(e) => setSpareQty(Number(e.target.value))} />
                <Button variant="outline" onClick={addSpare}>添加</Button>
              </div>
              {spareParts.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {spareParts.map((sp) => <li key={sp.id}>{sp.partName} × {sp.quantity}</li>)}
                </ul>
              ) : null}
            </div>

            <div>
              <Label className="mb-2 block">现场照片</Label>
              <button
                type="button"
                onClick={() => setMockImages((prev) => [...prev, `mock-photo-${prev.length + 1}.jpg`])}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--admin-border)] py-8 text-sm text-muted-foreground hover:bg-[var(--admin-hover-bg)]"
              >
                <Upload className="size-8 opacity-50" />
                点击上传（模拟）
              </button>
              {mockImages.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockImages.map((img) => (
                    <div key={img} className="flex items-center gap-1 rounded border px-2 py-1 text-xs">
                      <ImagePlus className="size-3" />{img}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Clock className="size-4 text-[var(--admin-primary)]" />处理日志
              </h4>
              <Timeline records={order.repairRecords} />
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleComplete} disabled={!faultCause.trim() || !solution.trim()}>提交完工</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Acceptance Dialog ───────────────────────────────────────────────────────

interface WorkOrderAcceptanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: WorkOrder | null
  onAccept: (orderId: string, rating: number, log: RepairRecord) => void
  onReject: (orderId: string, reason: string, log: RepairRecord) => void
}

export function WorkOrderAcceptanceDialog({ open, onOpenChange, order, onAccept, onReject }: WorkOrderAcceptanceDialogProps) {
  const [reason, setReason] = useState('')
  const [rating, setRating] = useState(5)

  useEffect(() => {
    if (open) { setReason(''); setRating(5) }
  }, [open])

  const handlePass = () => {
    if (!order) return
    onAccept(order.id, rating, {
      id: `rr-${Date.now()}`, operator: '管理员', action: '验收通过', note: `评分 ${rating} 星`, createdAt: nowStr(),
    })
    onOpenChange(false)
  }

  const handleReject = () => {
    if (!order || !reason.trim()) return
    onReject(order.id, reason, {
      id: `rr-${Date.now()}`, operator: '管理员', action: '验收驳回', note: reason, createdAt: nowStr(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog-content max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>工单验收 — {order?.id}</DialogTitle>
        </DialogHeader>
        {order ? (
          <div className="space-y-4 py-2">
            <Timeline records={order.repairRecords} />
            <Separator />
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">故障原因：</span>{order.faultCause ?? '—'}</p>
              <p><span className="text-muted-foreground">处理方案：</span>{order.solution ?? '—'}</p>
              {order.spareParts?.length ? (
                <p><span className="text-muted-foreground">备件：</span>{order.spareParts.map((s) => `${s.partName}×${s.quantity}`).join('、')}</p>
              ) : null}
              <p><span className="text-muted-foreground">费用：</span>{order.costDetail ?? '—'}</p>
            </div>
            <Separator />
            <div>
              <Label className="mb-2 block">服务评分（可选）</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className="p-1">
                    <Star className={cn('size-5', n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground')} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>驳回原因（驳回时必填）</Label>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="填写驳回原因..." />
            </div>
          </div>
        ) : null}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>驳回</Button>
          <Button onClick={handlePass}>通过验收</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── View Dialog ───────────────────────────────────────────────────────────

interface WorkOrderViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: WorkOrder | null
}

export function WorkOrderViewDialog({ open, onOpenChange, order }: WorkOrderViewDialogProps) {
  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="admin-dialog-content sm:max-w-lg" />
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-dialog-content max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>工单详情</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{order.id}</p>
              <h3 className="font-semibold">{order.title}</h3>
            </div>
            <Badge variant="secondary">{WO_STATUS_LABEL[order.status]}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkOrderPriorityBadge priority={order.priority} />
            <Badge variant="outline" className="gap-1">
              {order.source === 'ai_alert' ? <><Bot className="size-3" />AI 告警</> : SOURCE_LABEL[order.source]}
            </Badge>
            <Badge variant="outline">{order.orderType}</Badge>
            <Badge variant="outline">{order.faultType}</Badge>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <InfoRow icon={MapPin} label="场站" value={order.stationName} />
            <InfoRow icon={Wrench} label="设备" value={`${order.deviceName} (${order.deviceCode})`} />
            <InfoRow icon={User} label="处理人" value={order.assignee ?? '未分派'} />
            <InfoRow icon={Clock} label="截止时间" value={order.deadline} />
            {order.contactName ? <InfoRow label="联系人" value={`${order.contactName} ${order.contactPhone ?? ''}`} /> : null}
          </dl>
          <p className="text-sm text-muted-foreground">{order.description}</p>
          {order.faultCause ? (
            <div className="rounded-lg border border-[var(--admin-border)] p-3 text-sm">
              <p><span className="text-muted-foreground">故障原因：</span>{order.faultCause}</p>
              {order.solution ? <p className="mt-1"><span className="text-muted-foreground">处理方案：</span>{order.solution}</p> : null}
              {order.costDetail ? <p className="mt-1"><span className="text-muted-foreground">费用：</span>{order.costDetail}</p> : null}
            </div>
          ) : null}
          <Timeline records={order.repairRecords} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Shared ────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      {Icon ? <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : null}
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  )
}

function Timeline({ records }: { records: RepairRecord[] }) {
  const sorted = [...records].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return (
    <div className="relative space-y-0">
      {sorted.map((record, index) => {
        const isLast = index === sorted.length - 1
        const isActive = isLast
        return (
          <div key={record.id} className="relative flex gap-3 pb-4">
            {!isLast ? <span className="absolute top-5 left-[9px] h-[calc(100%-8px)] w-px bg-[var(--admin-border)]" /> : null}
            <div className={cn(
              'relative z-10 mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full',
              isActive ? 'bg-[var(--admin-selected-bg)]' : 'bg-[var(--admin-hover-bg)]',
            )}>
              {isActive ? <CheckCircle2 className="size-3.5 text-[var(--admin-primary)]" /> : <Circle className="size-2 fill-muted-foreground text-muted-foreground" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{record.action}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{record.createdAt}</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{record.note}</p>
              <p className="text-xs text-muted-foreground">操作人：{record.operator}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
