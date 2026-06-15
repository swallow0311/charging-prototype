import { useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { WO_RULES_DEFAULT } from '@/mocks/work-order-mock'
import { WO_PRIORITY_LABEL } from '@/mocks/work-order-store'

type RulesState = typeof WO_RULES_DEFAULT

export function WorkOrdersRulesPage() {
  const [rules, setRules] = useState<RulesState>(structuredClone(WO_RULES_DEFAULT))
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => setRules(structuredClone(WO_RULES_DEFAULT))

  return (
    <div className="space-y-6 p-6 pb-24">
      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">SLA 时限（按优先级）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(rules.slaHours) as (keyof typeof rules.slaHours)[]).map((p) => (
              <div key={p} className="space-y-1.5">
                <Label>{WO_PRIORITY_LABEL[p]} (小时)</Label>
                <Input
                  type="number"
                  min={1}
                  value={rules.slaHours[p]}
                  onChange={(e) => setRules((prev) => ({
                    ...prev,
                    slaHours: { ...prev.slaHours, [p]: Number(e.target.value) },
                  }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">周期任务</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.periodicTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] p-4">
              <div>
                <p className="font-medium">{task.name}</p>
                <p className="text-sm text-muted-foreground">执行周期：{task.cycle}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={task.enabled ? 'default' : 'secondary'}>{task.enabled ? '已启用' : '已停用'}</Badge>
                <Switch
                  checked={task.enabled}
                  onCheckedChange={(checked) => setRules((prev) => ({
                    ...prev,
                    periodicTasks: prev.periodicTasks.map((t) => t.id === task.id ? { ...t, enabled: checked } : t),
                  }))}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">通知规则</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: 'onCreate' as const, label: '工单创建时通知' },
            { key: 'onAssign' as const, label: '工单分派时通知' },
            { key: 'onOverdue' as const, label: '工单逾期时通知' },
            { key: 'onComplete' as const, label: '工单完成时通知' },
          ]).map(({ key, label }) => (
            <div key={key}>
              <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch
                  checked={rules.notifyRules[key]}
                  onCheckedChange={(checked) => setRules((prev) => ({
                    ...prev,
                    notifyRules: { ...prev.notifyRules, [key]: checked },
                  }))}
                />
              </div>
              {key !== 'onComplete' ? <Separator className="mt-4" /> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--admin-border)] bg-[var(--admin-card)] px-6 py-4 shadow-[0_-4px_16px_rgba(31,41,55,0.08)] md:left-[var(--admin-sidebar-width)]">
        <div className="mx-auto flex max-w-none justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="size-4" />重置
          </Button>
          <Button onClick={handleSave}>
            <Save className="size-4" />{saved ? '已保存' : '保存配置'}
          </Button>
        </div>
      </div>
    </div>
  )
}
