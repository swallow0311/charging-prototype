import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Router } from 'lucide-react'

import { GridLoadChart } from '@/components/admin/AdminCharts'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { TextTableAction } from '@/components/shared/TextTableAction'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { getGridLoadForStation, MOCK_STATIONS } from '@/mocks/admin-data'
import { getStationPileStats } from '@/utils/station-stats'
import type { Station } from '@/types'
import type { TableColumn } from '@/types'

const defaultGateway = { gatewayId: '', ip: '', firmwareVersion: 'v2.4.0', lastSyncAt: '', status: 'offline' as const }
const defaultScheduling = { mode: 'auto' as const, maxClusterPowerKw: 1000, loadBalanceEnabled: true, peakShavingEnabled: false, v2gEnabled: false }

const emptyStation: Omit<Station, 'id'> = {
  name: '', address: '', city: '深圳', lat: 22.5, lng: 114.0,
  totalPiles: 0, availablePiles: 0, onlinePiles: 0, totalPowerKw: 0, operator: '',
  gridLoadPercent: 0, maxGridCapacityKw: 1000, currentLoadKw: 0, status: 'active',
  propertySharePercent: 25, createdAt: new Date().toISOString().slice(0, 10),
  edgeGateway: defaultGateway, schedulingParams: defaultScheduling, pileGroups: [],
}

export function AdminStationsPage() {
  const [stations, setStations] = useState<Station[]>(MOCK_STATIONS)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Station | null>(null)
  const [form, setForm] = useState(emptyStation)
  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null)
  const [selected, setSelected] = useState<Station | null>(null)

  const gridLoadData = useMemo(() => {
    if (!selected) return []
    return getGridLoadForStation(selected.id, selected.gridLoadPercent, selected.maxGridCapacityKw)
  }, [selected])

  const openRow = (station: Station) => {
    setSelected(station)
    setDrawerOpen(true)
  }

  const openEditDialog = (station: Station) => {
    setEditing(station)
    setForm(station)
    setDialogOpen(true)
  }

  const openEdit = (station: Station, e: React.MouseEvent) => {
    e.stopPropagation()
    openEditDialog(station)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyStation)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (editing) {
      const updated = { ...editing, ...form } as Station
      setStations((prev) => prev.map((s) => s.id === editing.id ? updated : s))
      if (selected?.id === editing.id) setSelected(updated)
    } else {
      const newStation = { ...form, id: `s${Date.now()}`, pileGroups: [], edgeGateway: { ...defaultGateway, gatewayId: `GW-${Date.now()}` } } as Station
      setStations((prev) => [...prev, newStation])
    }
    setDialogOpen(false)
  }

  const columns: TableColumn<Station>[] = [
    { key: 'name', title: '场站名称' },
    { key: 'address', title: '地址' },
    { key: 'operator', title: '运营商' },
    { key: 'maxGridCapacityKw', title: '最大功率', render: (r) => `${r.maxGridCapacityKw} kW`, width: '88px' },
    { key: 'totalPiles', title: '桩数量', width: '72px' },
    {
      key: 'charging', title: '充电中', width: '72px',
      render: (r) => <span className="text-[var(--admin-primary)]">{getStationPileStats(r).charging}</span>,
    },
    {
      key: 'idle', title: '空闲', width: '60px',
      render: (r) => <span className="text-[var(--admin-success)]">{getStationPileStats(r).idle}</span>,
    },
    {
      key: 'fault', title: '故障', width: '60px',
      render: (r) => <span className="text-[var(--admin-danger)]">{getStationPileStats(r).fault}</span>,
    },
    {
      key: 'offline', title: '离线', width: '60px',
      render: (r) => getStationPileStats(r).offline,
    },
    {
      key: 'status', title: '状态', width: '80px',
      render: (r) => {
        const map = { active: '运营中', maintenance: '维护中', offline: '离线' } as const
        const variant = r.status === 'active' ? 'default' : r.status === 'maintenance' ? 'secondary' : 'outline'
        return <Badge variant={variant}>{map[r.status]}</Badge>
      },
    },
    {
      key: 'id', title: '操作', width: '120px',
      render: (row) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <TextTableAction label="编辑" onClick={() => openEditDialog(row)} />
          <TextTableAction label="删除" variant="danger" onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={stations} columns={columns} compact
        searchPlaceholder="搜索场站..." searchKeys={['name', 'address', 'operator']}
        filterKey="status" filterOptions={[
          { label: '运营中', value: 'active' }, { label: '维护中', value: 'maintenance' }, { label: '离线', value: 'offline' },
        ]}
        selectedRowId={selected?.id ?? null} onRowClick={openRow}
        toolbarExtra={
          <Button onClick={openCreate} className="shrink-0"><Plus className="size-4" />新增场站</Button>
        }
      />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="admin-sheet-content w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.operator} · {selected.address}</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-6">
                <section>
                  <h3 className="mb-3 font-medium">桩群状态</h3>
                  <div className="space-y-3">
                    {selected.pileGroups.map((group) => (
                      <div key={group.id} className="rounded-lg bg-[var(--admin-hover-bg)] p-4">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium">{group.name}</span>
                          <span className="text-muted-foreground">共 {group.total} 桩</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div><p className="text-lg font-bold text-[var(--admin-primary)]">{group.charging}</p><p>充电中</p></div>
                          <div><p className="text-lg font-bold text-[var(--admin-success)]">{group.idle}</p><p>空闲</p></div>
                          <div><p className="text-lg font-bold text-[var(--admin-danger)]">{group.fault}</p><p>故障</p></div>
                          <div><p className="text-lg font-bold">{group.offline}</p><p>离线</p></div>
                        </div>
                        <Progress value={((group.charging + group.idle) / group.total) * 100} className="mt-2 h-1.5" />
                      </div>
                    ))}
                  </div>
                </section>
                <GridLoadChart data={gridLoadData} title="电网负载" />
                <section className="rounded-lg bg-[var(--admin-hover-bg)] p-4">
                  <h3 className="mb-3 flex items-center gap-2 font-medium"><Router className="size-4 text-[var(--admin-primary)]" />边缘网关</h3>
                  <dl className="grid gap-2 text-sm">
                    <DetailRow label="网关 ID" value={selected.edgeGateway.gatewayId} />
                    <DetailRow label="IP" value={selected.edgeGateway.ip} />
                    <DetailRow label="固件" value={selected.edgeGateway.firmwareVersion} />
                    <DetailRow label="同步时间" value={selected.edgeGateway.lastSyncAt} />
                    <DetailRow label="状态" value={
                      <Badge variant={selected.edgeGateway.status === 'online' ? 'default' : 'secondary'}>
                        {selected.edgeGateway.status === 'online' ? '在线' : '离线'}
                      </Badge>
                    } />
                  </dl>
                </section>
                <Button variant="outline" className="w-full" onClick={(e) => openEdit(selected, e)}>编辑场站</Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="admin-dialog-content max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? '编辑场站' : '新增场站'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>场站名称</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>地址</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>运营商</Label><Input value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} /></div>
              <div className="space-y-2"><Label>城市</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>总桩数</Label><Input type="number" value={form.totalPiles} onChange={(e) => setForm({ ...form, totalPiles: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>最大功率 (kW)</Label><Input type="number" value={form.maxGridCapacityKw} onChange={(e) => setForm({ ...form, maxGridCapacityKw: Number(e.target.value) })} /></div>
            </div>
            <div className="rounded-lg border border-[var(--admin-border)] p-4">
              <h4 className="mb-3 font-medium">功率调度配置</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>调度模式</Label>
                  <div className="flex gap-2">
                    <Button size="sm" type="button" variant={form.schedulingParams.mode === 'auto' ? 'default' : 'outline'}
                      onClick={() => setForm({ ...form, schedulingParams: { ...form.schedulingParams, mode: 'auto' } })}>AI 自动</Button>
                    <Button size="sm" type="button" variant={form.schedulingParams.mode === 'manual' ? 'default' : 'outline'}
                      onClick={() => setForm({ ...form, schedulingParams: { ...form.schedulingParams, mode: 'manual' } })}>手动</Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>集群最大功率: {form.schedulingParams.maxClusterPowerKw} kW</Label>
                  <input type="range" min={200} max={form.maxGridCapacityKw || 2000} value={form.schedulingParams.maxClusterPowerKw}
                    onChange={(e) => setForm({ ...form, schedulingParams: { ...form.schedulingParams, maxClusterPowerKw: Number(e.target.value) } })}
                    className="w-full accent-primary" />
                </div>
                <SwitchRow label="负载均衡" checked={form.schedulingParams.loadBalanceEnabled}
                  onChange={(v) => setForm({ ...form, schedulingParams: { ...form.schedulingParams, loadBalanceEnabled: v } })} />
                <SwitchRow label="削峰填谷" checked={form.schedulingParams.peakShavingEnabled}
                  onChange={(v) => setForm({ ...form, schedulingParams: { ...form.schedulingParams, peakShavingEnabled: v } })} />
                <SwitchRow label="V2G 双向充放电" checked={form.schedulingParams.v2gEnabled}
                  onChange={(v) => setForm({ ...form, schedulingParams: { ...form.schedulingParams, v2gEnabled: v } })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="确认删除"
        description={`确定删除「${deleteTarget?.name}」？`} confirmLabel="删除" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            setStations((p) => p.filter((s) => s.id !== deleteTarget.id))
            setDeleteTarget(null)
            if (selected?.id === deleteTarget.id) setDrawerOpen(false)
          }
        }} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (<div className="flex justify-between gap-4"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (<div className="flex items-center justify-between"><Label>{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>)
}
