import { useState } from 'react'

import { DataTable } from '@/components/shared/DataTable'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { MOCK_VEHICLE_OWNERS } from '@/mocks/admin-data'
import type { VehicleOwner } from '@/types'
import type { TableColumn } from '@/types'

const dash = (v?: string) => v ?? '-'

const ownerColumns: TableColumn<VehicleOwner>[] = [
  { key: 'displayName', title: '姓名' },
  { key: 'phone', title: '手机号' },
  {
    key: 'enterpriseName', title: '所属企业',
    render: (r) => dash(r.enterpriseName),
  },
  {
    key: 'memberLevel', title: '会员等级',
    render: (r) => <Badge variant={r.memberLevel === '钻石' ? 'default' : 'secondary'}>{r.memberLevel}</Badge>,
  },
  { key: 'points', title: '积分' },
  { key: 'totalOrders', title: '订单数' },
  { key: 'totalSpent', title: '累计消费', render: (r) => `¥${r.totalSpent.toLocaleString()}` },
  {
    key: 'status', title: '状态',
    render: (r) => <Badge variant={r.status === 'active' ? 'outline' : 'destructive'}>{r.status === 'active' ? '正常' : '冻结'}</Badge>,
  },
]

export function AdminUsersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [ownerDetail, setOwnerDetail] = useState<VehicleOwner | null>(null)

  const openOwner = (row: VehicleOwner) => {
    setOwnerDetail(row)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={MOCK_VEHICLE_OWNERS}
        columns={ownerColumns}
        searchPlaceholder="搜索姓名或手机号..."
        searchKeys={['displayName', 'phone', 'enterpriseName']}
        selectedRowId={ownerDetail?.id ?? null}
        onRowClick={openOwner}
      />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="admin-sheet-content w-full overflow-y-auto sm:max-w-md">
          {ownerDetail ? (
            <>
              <SheetHeader>
                <SheetTitle>{ownerDetail.displayName}</SheetTitle>
                <SheetDescription>{ownerDetail.phone}</SheetDescription>
              </SheetHeader>
              <dl className="space-y-3 px-4 pb-6 text-sm">
                <Row label="会员等级" value={ownerDetail.memberLevel} />
                <Row label="所属企业" value={dash(ownerDetail.enterpriseName)} />
                <Row label="积分" value={String(ownerDetail.points)} />
                <Row label="订单数" value={String(ownerDetail.totalOrders)} />
                <Row label="累计消费" value={`¥${ownerDetail.totalSpent.toLocaleString()}`} />
                <Row label="注册时间" value={ownerDetail.registerAt} />
                <Row label="状态" value={ownerDetail.status === 'active' ? '正常' : '冻结'} />
              </dl>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (<div className="flex justify-between"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>)
}
