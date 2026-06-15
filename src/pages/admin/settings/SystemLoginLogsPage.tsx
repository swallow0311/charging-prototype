import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/constants/admin-permissions'
import { MOCK_LOGIN_LOGS } from '@/mocks/system-settings-mock'
import type { LoginLog } from '@/mocks/system-settings-mock'
import type { TableColumn } from '@/types'

const columns: TableColumn<LoginLog>[] = [
  { key: 'createdAt', title: '登录时间' },
  { key: 'username', title: '用户名' },
  { key: 'displayName', title: '姓名' },
  {
    key: 'role', title: '角色',
    render: (r) => r.displayName === '—' ? '—' : ROLE_LABELS[r.role],
  },
  { key: 'ip', title: 'IP 地址' },
  { key: 'device', title: '设备' },
  { key: 'location', title: '地点' },
  {
    key: 'status', title: '结果', width: '88px',
    render: (r) => (
      <Badge variant={r.status === 'success' ? 'outline' : 'destructive'}>
        {r.status === 'success' ? '成功' : '失败'}
      </Badge>
    ),
  },
  {
    key: 'failReason', title: '失败原因',
    render: (r) => r.failReason ?? '—',
  },
]

export function SystemLoginLogsPage() {
  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={MOCK_LOGIN_LOGS}
        columns={columns}
        searchPlaceholder="搜索用户名或 IP..."
        searchKeys={['username', 'displayName', 'ip', 'location']}
        filterKey="status"
        filterOptions={[
          { label: '成功', value: 'success' },
          { label: '失败', value: 'failed' },
        ]}
      />
    </div>
  )
}
