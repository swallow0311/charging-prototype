import { useMemo, useState } from 'react'

import { DataTable } from '@/components/shared/DataTable'
import { TextTableAction } from '@/components/shared/TextTableAction'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { MOCK_DISPATCH_LOGS, type DispatchLog } from '@/mocks/ai-dispatch-mock'
import type { TableColumn } from '@/types'

const RESULT_VARIANT: Record<DispatchLog['result'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  success: 'outline',
  retry: 'secondary',
  failed: 'destructive',
  manual: 'secondary',
}

export function WorkOrdersDispatchLogsPage() {
  const [detail, setDetail] = useState<DispatchLog | null>(null)

  const columns: TableColumn<DispatchLog>[] = useMemo(() => [
    { key: 'workOrderId', title: '工单编号', width: '140px' },
    { key: 'orderType', title: '工单类型', width: '72px' },
    { key: 'priority', title: '紧急等级', width: '72px' },
    { key: 'operatorName', title: '指派人员', width: '80px' },
    {
      key: 'scores', title: '综合得分', width: '80px',
      render: (r) => <span className="font-medium text-[var(--admin-primary)]">{r.scores.total.toFixed(1)}</span>,
    },
    {
      key: 'resultLabel', title: '调度结果', width: '88px',
      render: (r) => <Badge variant={RESULT_VARIANT[r.result]}>{r.resultLabel}</Badge>,
    },
    {
      key: 'durationMs', title: '耗时', width: '72px',
      render: (r) => r.durationMs >= 1000 ? `${(r.durationMs / 1000).toFixed(1)}s` : `${r.durationMs}ms`,
    },
    { key: 'retryTimes', title: '重试次数', width: '72px' },
    {
      key: 'isCrossRegion', title: '跨区', width: '56px',
      render: (r) => r.isCrossRegion ? '是' : '否',
    },
    { key: 'createdAt', title: '调度时间' },
    {
      key: 'id', title: '操作', width: '64px',
      render: (r) => <TextTableAction label="详情" onClick={() => setDetail(r)} />,
    },
  ], [])

  return (
    <div className="space-y-6 p-6">
      <DataTable
        data={MOCK_DISPATCH_LOGS}
        columns={columns}
        searchPlaceholder="搜索工单号或人员..."
        searchKeys={['workOrderId', 'workOrderTitle', 'operatorName']}
        filterKey="result"
        filterOptions={[
          { label: '派单成功', value: 'success' },
          { label: '超时重调度', value: 'retry' },
          { label: '调度失败', value: 'failed' },
          { label: '转人工', value: 'manual' },
        ]}
        pageSize={10}
      />

      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent className="admin-sheet-content w-full overflow-y-auto sm:max-w-md">
          {detail ? (
            <>
              <SheetHeader>
                <SheetTitle>调度详情</SheetTitle>
                <SheetDescription>{detail.workOrderId} · {detail.workOrderTitle}</SheetDescription>
              </SheetHeader>
              <dl className="space-y-3 px-4 pb-6 text-sm">
                <Row label="工单类型" value={detail.orderType} />
                <Row label="紧急等级" value={detail.priority} />
                <Row label="指派人员" value={detail.operatorName} />
                <Row label="调度结果" value={detail.resultLabel} />
                <Row label="重试次数" value={String(detail.retryTimes)} />
                <Row label="是否跨区" value={detail.isCrossRegion ? '是' : '否'} />
                <Row label="调度耗时" value={detail.durationMs >= 1000 ? `${(detail.durationMs / 1000).toFixed(1)} 秒` : `${detail.durationMs} ms`} />
                <Row label="调度时间" value={detail.createdAt} />
                {detail.errorMessage ? <Row label="异常信息" value={detail.errorMessage} /> : null}
                <SeparatorBlock title="评分明细" />
                <Row label="距离得分" value={String(detail.scores.distance)} />
                <Row label="负荷得分" value={String(detail.scores.load)} />
                <Row label="技能得分" value={String(detail.scores.skill)} />
                <Row label="绩效得分" value={String(detail.scores.performance)} />
                <Row label="综合得分" value={detail.scores.total.toFixed(1)} />
                {detail.scores.weights ? (
                  <Row label="权重快照" value={`距离${detail.scores.weights.distance}% 负荷${detail.scores.weights.load}% 技能${detail.scores.weights.skill}% 绩效${detail.scores.weights.performance}%`} />
                ) : null}
              </dl>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}

function SeparatorBlock({ title }: { title: string }) {
  return <p className="border-t border-[var(--admin-border)] pt-3 text-xs font-medium text-[var(--admin-text-muted)]">{title}</p>
}
