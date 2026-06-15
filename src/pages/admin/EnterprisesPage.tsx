import { useState } from 'react'
import { Plus } from 'lucide-react'

import { DataTable } from '@/components/shared/DataTable'
import { TextTableAction } from '@/components/shared/TextTableAction'
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
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { MOCK_ENTERPRISE_PACKAGES, MOCK_VEHICLE_OWNERS } from '@/mocks/admin-data'
import type { EnterprisePackage } from '@/types'
import type { TableColumn } from '@/types'

const emptyEnterprise = (): EnterprisePackage => ({
  id: `ep${Date.now()}`,
  companyName: '',
  monthlyFee: 0,
  creditLimit: 0,
  billingCycle: '月结',
  status: 'active',
  discountPercent: 10,
  activeVehicles: 0,
  totalSpent: 0,
})

export function AdminEnterprisesPage() {
  const [enterprises, setEnterprises] = useState(MOCK_ENTERPRISE_PACKAGES)
  const [selected, setSelected] = useState<EnterprisePackage | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<EnterprisePackage | null>(null)

  const columns: TableColumn<EnterprisePackage>[] = [
    { key: 'companyName', title: '企业名称' },
    { key: 'discountPercent', title: '折扣', render: (r) => `${r.discountPercent}%` },
    { key: 'activeVehicles', title: '活跃车辆', render: (r) => `${r.activeVehicles} 辆` },
    { key: 'totalSpent', title: '累计消费', render: (r) => `¥${r.totalSpent.toLocaleString()}` },
    { key: 'monthlyFee', title: '月费', render: (r) => `¥${r.monthlyFee.toLocaleString()}` },
    { key: 'creditLimit', title: '授信额度', render: (r) => `¥${r.creditLimit.toLocaleString()}` },
    { key: 'billingCycle', title: '结算周期' },
    {
      key: 'status', title: '状态',
      render: (r) => <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>{r.status === 'active' ? '生效中' : '已暂停'}</Badge>,
    },
    {
      key: 'id', title: '操作', width: '72px',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <TextTableAction label="编辑" onClick={() => { setForm(r); setEditOpen(true) }} />
        </div>
      ),
    },
  ]

  const save = () => {
    if (!form) return
    setEnterprises((prev) => {
      const exists = prev.some((e) => e.id === form.id)
      return exists ? prev.map((e) => e.id === form.id ? form : e) : [...prev, form]
    })
    if (selected?.id === form.id) setSelected(form)
    setEditOpen(false)
  }

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={enterprises} columns={columns}
        searchPlaceholder="搜索企业..." searchKeys={['companyName']}
        filterKey="status" filterOptions={[
          { label: '生效中', value: 'active' },
          { label: '已暂停', value: 'suspended' },
        ]}
        selectedRowId={selected?.id ?? null} onRowClick={setSelected}
        toolbarExtra={
          <Button onClick={() => { setForm(emptyEnterprise()); setEditOpen(true) }} className="shrink-0">
            <Plus className="size-4" />新增企业
          </Button>
        }
      />

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="admin-sheet-content sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.companyName}</SheetTitle>
                <SheetDescription>企业对公套餐详情</SheetDescription>
              </SheetHeader>
              <dl className="space-y-2 px-4 pb-6 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">折扣</dt><dd>{selected.discountPercent}%</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">活跃车辆</dt><dd>{selected.activeVehicles} 辆</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">累计消费</dt><dd>¥{selected.totalSpent.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">月费</dt><dd>¥{selected.monthlyFee.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">授信额度</dt><dd>¥{selected.creditLimit.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">结算周期</dt><dd>{selected.billingCycle}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">状态</dt><dd>{selected.status === 'active' ? '生效中' : '已暂停'}</dd></div>
              </dl>
              <div className="px-4">
                <p className="mb-2 text-sm font-medium">关联车主</p>
                {MOCK_VEHICLE_OWNERS.filter((o) => o.enterpriseName === selected.companyName).map((o) => (
                  <p key={o.id} className="text-sm text-muted-foreground">{o.displayName} · {o.phone}</p>
                ))}
              </div>
              <div className="px-4 pt-4">
                <Button variant="outline" className="w-full" onClick={() => { setForm(selected); setEditOpen(true) }}>配置企业</Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="admin-dialog-content sm:max-w-md">
          <DialogHeader><DialogTitle>配置企业套餐</DialogTitle></DialogHeader>
          {form ? (
            <div className="grid gap-3 py-2">
              <div className="space-y-2"><Label>企业名称</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>折扣 (%)</Label><Input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>活跃车辆</Label><Input type="number" value={form.activeVehicles} onChange={(e) => setForm({ ...form, activeVehicles: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>累计消费</Label><Input type="number" value={form.totalSpent} onChange={(e) => setForm({ ...form, totalSpent: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>月费 (元)</Label><Input type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })} /></div>
                <div className="space-y-2"><Label>授信额度</Label><Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>结算周期</Label>
                  <Select value={form.billingCycle} onValueChange={(v) => setForm({ ...form, billingCycle: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="月结">月结</SelectItem>
                      <SelectItem value="季结">季结</SelectItem>
                      <SelectItem value="年结">年结</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>状态</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EnterprisePackage['status'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">生效中</SelectItem>
                      <SelectItem value="suspended">已暂停</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={save}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
