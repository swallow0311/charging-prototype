import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react'

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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ROLE_LABELS } from '@/constants/admin-permissions'
import { MOCK_SYSTEM_USERS } from '@/mocks/system-settings-mock'
import type { SystemUser } from '@/mocks/system-settings-mock'
import type { UserRole } from '@/types'

const PAGE_SIZE = 10
const ACTION_COL_WIDTH = 220

const emptyUser = (): SystemUser => ({
  id: `su${Date.now()}`,
  username: '',
  displayName: '',
  role: 'operator',
  email: '',
  phone: '',
  status: 'active',
  lastLoginAt: '—',
  createdAt: new Date().toISOString().slice(0, 10),
})

export function SystemUsersPage() {
  const [users, setUsers] = useState(MOCK_SYSTEM_USERS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [editOpen, setEditOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<SystemUser | null>(null)
  const [form, setForm] = useState<SystemUser | null>(null)

  const filtered = useMemo(() => {
    let result = [...users]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((u) =>
        [u.username, u.displayName, u.email].some((v) => v.toLowerCase().includes(q)),
      )
    }
    if (filterRole !== 'all') result = result.filter((u) => u.role === filterRole)
    if (filterStatus !== 'all') result = result.filter((u) => u.status === filterStatus)
    return result
  }, [users, search, filterRole, filterStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleStatus = (id: string, status: SystemUser['status']) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u))
  }

  const save = () => {
    if (!form || !form.username.trim()) return
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === form.id)
      return exists ? prev.map((u) => u.id === form.id ? form : u) : [...prev, form]
    })
    setEditOpen(false)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="admin-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64 shrink-0">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索用户名或姓名..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1) }}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="角色" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              {(['admin', 'property', 'operator'] as const).map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="状态" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">正常</SelectItem>
              <SelectItem value="disabled">停用</SelectItem>
            </SelectContent>
          </Select>
          <Button className="shrink-0" onClick={() => { setForm(emptyUser()); setEditOpen(true) }}>
            <Plus className="size-4" />新增用户
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg border border-[var(--admin-border)]">
        <div className="overflow-x-auto" style={{ paddingRight: ACTION_COL_WIDTH }}>
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">用户名</TableHead>
                <TableHead className="min-w-[88px]">姓名</TableHead>
                <TableHead className="min-w-[72px]">角色</TableHead>
                <TableHead className="min-w-[160px]">邮箱</TableHead>
                <TableHead className="min-w-[100px]">手机号</TableHead>
                <TableHead className="min-w-[72px]">状态</TableHead>
                <TableHead className="min-w-[140px]">最近登录</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">暂无数据</TableCell>
                </TableRow>
              ) : paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-2.5 text-sm font-medium">{row.username}</TableCell>
                  <TableCell className="py-2.5 text-sm">{row.displayName}</TableCell>
                  <TableCell className="py-2.5"><Badge variant="secondary">{ROLE_LABELS[row.role]}</Badge></TableCell>
                  <TableCell className="py-2.5 text-sm">{row.email}</TableCell>
                  <TableCell className="py-2.5 text-sm">{row.phone}</TableCell>
                  <TableCell className="py-2.5">
                    <Badge variant={row.status === 'active' ? 'outline' : 'destructive'}>
                      {row.status === 'active' ? '正常' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm">{row.lastLoginAt}</TableCell>
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
                className="pointer-events-auto flex min-h-[41px] flex-wrap items-center gap-0.5 border-b border-[var(--admin-border)] px-2 py-1"
              >
                <TextTableAction label="编辑" onClick={() => { setForm(row); setEditOpen(true) }} />
                <TextTableAction label="重置密码" onClick={() => setResetTarget(row)} />
                {row.status === 'active' ? (
                  <TextTableAction label="停用" onClick={() => toggleStatus(row.id, 'disabled')} />
                ) : (
                  <TextTableAction label="启用" onClick={() => toggleStatus(row.id, 'active')} />
                )}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="admin-dialog sm:max-w-md">
          <DialogHeader><DialogTitle>{form && users.some((u) => u.id === form.id) ? '编辑用户' : '新增用户'}</DialogTitle></DialogHeader>
          {form ? (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="登录账号" />
              </div>
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['admin', 'property', 'operator'] as const).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>手机号</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
            <Button onClick={save}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent className="admin-dialog sm:max-w-sm">
          <DialogHeader><DialogTitle>重置密码</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            确认为用户「{resetTarget?.displayName}」重置密码？新密码将通过邮件发送（模拟）。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>取消</Button>
            <Button onClick={() => { alert('密码已重置（模拟）'); setResetTarget(null) }}>确认重置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
