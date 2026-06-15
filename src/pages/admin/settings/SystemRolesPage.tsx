import { useMemo, useState } from 'react'
import { Copy, Plus, Save, Shield, Trash2 } from 'lucide-react'

import { RoleCheckbox } from '@/components/admin/RoleCheckbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DEFAULT_ROLES, PERMISSION_MODULES, PERMISSION_OP_LABELS,
  type PermissionOp, type RoleDefinition,
} from '@/mocks/role-permissions-mock'
import { cn } from '@/lib/utils'

export function SystemRolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES)
  const [selectedId, setSelectedId] = useState(DEFAULT_ROLES[0].id)
  const [draft, setDraft] = useState<RoleDefinition>(DEFAULT_ROLES[0])
  const [saved, setSaved] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const selectRole = (role: RoleDefinition) => {
    setSelectedId(role.id)
    setDraft(structuredClone(role))
    setSaved(false)
    setAdding(false)
  }

  const toggleSimple = (itemId: string, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [itemId]: checked },
    }))
    setSaved(false)
  }

  const toggleMatrix = (itemId: string, op: PermissionOp, checked: boolean) => {
    setDraft((prev) => {
      const current = prev.permissions[itemId]
      const ops = Array.isArray(current) ? [...current] : []
      const next = checked ? [...new Set([...ops, op])] : ops.filter((o) => o !== op)
      return { ...prev, permissions: { ...prev.permissions, [itemId]: next } }
    })
    setSaved(false)
  }

  const isMatrixChecked = (itemId: string, op: PermissionOp) => {
    const val = draft.permissions[itemId]
    return Array.isArray(val) && val.includes(op)
  }

  const handleSave = () => {
    setRoles((prev) => prev.map((r) => r.id === draft.id ? structuredClone(draft) : r))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddRole = () => {
    const name = newRoleName.trim()
    if (!name) return
    const role: RoleDefinition = {
      id: `role-${Date.now()}`,
      name,
      permissions: Object.fromEntries(
        PERMISSION_MODULES.flatMap((m) => m.items.map((i) => [i.id, i.type === 'simple' ? false : []])),
      ),
    }
    setRoles((prev) => [...prev, role])
    selectRole(role)
    setNewRoleName('')
    setAdding(false)
  }

  const handleCopy = (role: RoleDefinition) => {
    const copy: RoleDefinition = {
      id: `role-${Date.now()}`,
      name: `${role.name} 副本`,
      permissions: structuredClone(role.permissions),
    }
    setRoles((prev) => [...prev, copy])
    selectRole(copy)
  }

  const handleDelete = (id: string) => {
    const role = roles.find((r) => r.id === id)
    if (role?.isDefault) return
    const next = roles.filter((r) => r.id !== id)
    setRoles(next)
    if (selectedId === id) selectRole(next[0])
  }

  const matrixItems = useMemo(
    () => PERMISSION_MODULES.flatMap((m) => m.items.filter((i) => i.type === 'matrix')),
    [],
  )

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      {/* 左侧角色列表 */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-card)]">
        <div className="border-b border-[var(--admin-border)] p-3">
          {adding ? (
            <div className="space-y-2">
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="角色名称"
                className="h-8 text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={handleAddRole}>确定</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setAdding(false)}>取消</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" size="sm" onClick={() => setAdding(true)}>
              <Plus className="size-4" />添加角色
            </Button>
          )}
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {roles.map((role) => (
            <li key={role.id}>
              <button
                type="button"
                onClick={() => selectRole(role)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                  selectedId === role.id
                    ? 'bg-[var(--admin-selected-bg)] text-[var(--admin-primary)] font-medium'
                    : 'text-[var(--admin-text-body)] hover:bg-[var(--admin-hover-bg)]',
                )}
              >
                <span className="truncate">
                  {role.name}
                  {role.isDefault ? <span className="ml-1 text-xs text-[var(--admin-text-muted)]">(默认)</span> : null}
                </span>
                <span className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" className="rounded p-1 hover:bg-[var(--admin-hover-bg)]" title="复制" onClick={(e) => { e.stopPropagation(); handleCopy(role) }}>
                    <Copy className="size-3.5" />
                  </button>
                  {!role.isDefault ? (
                    <button type="button" className="rounded p-1 hover:bg-[var(--admin-hover-bg)]" title="删除" onClick={(e) => { e.stopPropagation(); handleDelete(role.id) }}>
                      <Trash2 className="size-3.5 text-[var(--admin-danger)]" />
                    </button>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 右侧权限配置 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-card)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-[var(--admin-primary)]" />
            <h3 className="text-base font-semibold text-[var(--admin-text-title)]">
              权限配置 - {draft.name}
            </h3>
            {draft.isDefault ? <Badge variant="secondary">系统默认</Badge> : null}
          </div>
          <Button onClick={handleSave}>
            <Save className="size-4" />{saved ? '已保存' : '保存配置'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-8">
            {PERMISSION_MODULES.map((mod) => (
              <section key={mod.id}>
                <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--admin-text-title)]">
                  <span className="h-4 w-1 rounded-full bg-[var(--admin-primary)]" />
                  {mod.label}
                </h4>
                <div className="space-y-4 pl-3">
                  {mod.items.filter((i) => i.type === 'simple').map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <RoleCheckbox
                        checked={Boolean(draft.permissions[item.id])}
                        onCheckedChange={(c) => toggleSimple(item.id, c)}
                      />
                      {item.label}
                    </label>
                  ))}

                  {mod.items.filter((i) => i.type === 'matrix').map((item) => (
                    <div key={item.id} className="space-y-2">
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                        <RoleCheckbox
                          checked={(draft.permissions[item.id] as PermissionOp[] | undefined)?.length === 5}
                          onCheckedChange={(c) => {
                            setDraft((prev) => ({
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [item.id]: c ? (['view', 'add', 'edit', 'delete', 'export'] as PermissionOp[]) : [],
                              },
                            }))
                            setSaved(false)
                          }}
                        />
                        {item.label}
                      </label>
                      <div className="ml-6 overflow-x-auto rounded-lg border border-[var(--admin-border)]">
                        <table className="w-full min-w-[480px] text-sm">
                          <thead>
                            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-hover-bg)]">
                              <th className="px-3 py-2 text-left font-medium text-[var(--admin-text-muted)]">子项</th>
                              {(['view', 'add', 'edit', 'delete', 'export'] as PermissionOp[]).map((op) => (
                                <th key={op} className="px-3 py-2 text-center font-medium text-[var(--admin-text-muted)]">
                                  {PERMISSION_OP_LABELS[op]}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[var(--admin-border)] last:border-0">
                              <td className="px-3 py-2">{item.label}</td>
                              {(['view', 'add', 'edit', 'delete', 'export'] as PermissionOp[]).map((op) => (
                                <td key={op} className="px-3 py-2 text-center">
                                  <RoleCheckbox
                                    checked={isMatrixChecked(item.id, op)}
                                    onCheckedChange={(c) => toggleMatrix(item.id, op, c)}
                                  />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {matrixItems.length > 0 ? (
              <p className="text-xs text-[var(--admin-text-muted)]">
                带矩阵权限的菜单支持细粒度操作授权；保存后将在下次登录时生效（原型演示）。
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
