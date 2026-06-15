import { DataTable } from '@/components/shared/DataTable'
import { ROLE_LABELS } from '@/constants/admin-permissions'
import { MOCK_AUDIT_LOGS } from '@/mocks/system-settings-mock'
import type { AuditLog } from '@/mocks/system-settings-mock'
import type { TableColumn } from '@/types'

const columns: TableColumn<AuditLog>[] = [
  { key: 'createdAt', title: '操作时间' },
  { key: 'operator', title: '操作人' },
  {
    key: 'role', title: '角色',
    render: (r) => ROLE_LABELS[r.role],
  },
  { key: 'module', title: '模块' },
  { key: 'action', title: '动作' },
  { key: 'target', title: '对象' },
  { key: 'detail', title: '详情' },
  { key: 'ip', title: 'IP' },
]

export function SystemAuditLogsPage() {
  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={MOCK_AUDIT_LOGS}
        columns={columns}
        searchPlaceholder="搜索操作人或模块..."
        searchKeys={['operator', 'module', 'action', 'target', 'detail']}
        filterKey="module"
        filterOptions={[
          { label: '场站管理', value: '场站管理' },
          { label: '工单列表', value: '工单列表' },
          { label: '用户管理', value: '用户管理' },
          { label: '计时策略', value: '计时策略' },
          { label: '财务报表', value: '财务报表' },
        ]}
      />
    </div>
  )
}
