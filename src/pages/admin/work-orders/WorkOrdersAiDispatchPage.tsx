import { useState } from 'react'
import { Bot, RefreshCw, RotateCcw, Save, Zap } from 'lucide-react'

import { MetricCard } from '@/components/shared/MetricCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DEFAULT_AI_DISPATCH_CONFIG, MOCK_DISPATCH_STATS,
  type AiDispatchConfig,
} from '@/mocks/ai-dispatch-mock'
import { MOCK_MAINTENANCE_OPERATORS } from '@/mocks/work-order-mock'
import type { DashboardMetric } from '@/types'

const statsMetrics: DashboardMetric[] = [
  { id: 's1', label: '调度成功率', value: `${MOCK_DISPATCH_STATS.successRate}%`, trend: 'up', changePercent: 2.1 },
  { id: 's2', label: '重试率', value: `${MOCK_DISPATCH_STATS.retryRate}%`, trend: 'down', changePercent: -0.5 },
  { id: 's3', label: '异常率', value: `${MOCK_DISPATCH_STATS.exceptionRate}%`, trend: 'down', changePercent: -0.2 },
  { id: 's4', label: '平均耗时', value: `${MOCK_DISPATCH_STATS.avgDurationMs}ms`, trend: 'flat' },
]

export function WorkOrdersAiDispatchPage() {
  const [config, setConfig] = useState<AiDispatchConfig>(structuredClone(DEFAULT_AI_DISPATCH_CONFIG))
  const [saved, setSaved] = useState(false)

  const updateWeight = (key: keyof AiDispatchConfig['weights'], value: number) => {
    setConfig((prev) => {
      const weights = { ...prev.weights, [key]: value }
      const keys = ['distance', 'load', 'skill', 'performance'] as const
      const total = keys.reduce((s, k) => s + weights[k], 0)
      if (total !== 100) {
        const others = keys.filter((k) => k !== key)
        const remain = 100 - value
        const per = Math.floor(remain / others.length)
        others.forEach((k, i) => { weights[k] = i === others.length - 1 ? remain - per * (others.length - 1) : per })
      }
      return { ...prev, weights }
    })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 p-6 pb-24">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsMetrics.map((m) => <MetricCard key={m.id} metric={m} borderless />)}
      </div>

      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-[var(--admin-primary)]" />
            <CardTitle className="text-base">AI 调度总开关</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Label>灰度降级</Label>
              <Switch checked={config.grayscaleMode} onCheckedChange={(v) => setConfig((p) => ({ ...p, grayscaleMode: v }))} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Label>AI 调度</Label>
              <Switch checked={config.enabled} onCheckedChange={(v) => setConfig((p) => ({ ...p, enabled: v }))} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {config.enabled
            ? (config.grayscaleMode ? '当前为灰度模式：部分工单走 AI 派单，失败自动降级人工。' : 'AI 调度已启用，工单创建后自动匹配最优运维人员。')
            : 'AI 调度已关闭，所有工单走原有人工派单逻辑。'}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">四大调度权重（默认）</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: 'distance' as const, label: '距离权重' },
              { key: 'load' as const, label: '负荷权重' },
              { key: 'skill' as const, label: '技能权重' },
              { key: 'performance' as const, label: '绩效权重' },
            ]).map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{config.weights[key]}%</span>
                </div>
                <input type="range" min={0} max={100} value={config.weights[key]}
                  onChange={(e) => updateWeight(key, Number(e.target.value))}
                  className="w-full accent-[var(--admin-primary)]" />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              综合得分 = 距离×权重 + 负荷×权重 + 技能×权重 + 绩效×权重，取最高分人员派单
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">动态权重自适应</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <WeightRow label="特级工单" weights={config.dynamicWeights.critical} hint="距离优先 70%" />
            <WeightRow label="复杂硬件故障" weights={config.dynamicWeights.complexHardware} hint="技能优先 40%" />
            <WeightRow label="巡检/保养工单" weights={config.dynamicWeights.inspectionMaintenance} hint="负荷均衡优先" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">阈值与容错</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <NumField label="人员最大工单阈值" value={config.maxLoadThreshold}
              onChange={(v) => setConfig((p) => ({ ...p, maxLoadThreshold: v }))} />
            <NumField label="距离最大阈值 (km)" value={config.distanceMaxKm}
              onChange={(v) => setConfig((p) => ({ ...p, distanceMaxKm: v }))} />
            <NumField label="重调度超时 (秒)" value={config.redispatchTimeoutSec}
              onChange={(v) => setConfig((p) => ({ ...p, redispatchTimeoutSec: v }))} />
            <NumField label="最大重试次数" value={config.maxRedispatchTimes}
              onChange={(v) => setConfig((p) => ({ ...p, maxRedispatchTimes: v }))} />
            <NumField label="紧急派单超时 (秒)" value={config.emergencyDispatchTimeoutSec}
              onChange={(v) => setConfig((p) => ({ ...p, emergencyDispatchTimeoutSec: v }))} />
            <NumField label="数据缓存 (秒)" value={config.dataCacheSec}
              onChange={(v) => setConfig((p) => ({ ...p, dataCacheSec: v }))} />
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">核心策略开关</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <SwitchRow label="超负荷阈值 0 分禁用" checked={config.overloadScoreZero}
              onChange={(v) => setConfig((p) => ({ ...p, overloadScoreZero: v }))} />
            <SwitchRow label="跨区溢出调度" checked={config.crossRegionEnabled}
              onChange={(v) => setConfig((p) => ({ ...p, crossRegionEnabled: v }))} />
            <SwitchRow label="跨区预警推送管理员" checked={config.crossRegionAlertAdmin}
              onChange={(v) => setConfig((p) => ({ ...p, crossRegionAlertAdmin: v }))} />
            <SwitchRow label="紧急工单放宽负荷限制" checked={config.emergencyBypassLoad}
              onChange={(v) => setConfig((p) => ({ ...p, emergencyBypassLoad: v }))} />
            <SwitchRow label="拒单自动重调度" checked={config.rejectAutoRedispatch}
              onChange={(v) => setConfig((p) => ({ ...p, rejectAutoRedispatch: v }))} />
            <SwitchRow label="全员饱和排队等待" checked={config.queueWhenAllSaturated}
              onChange={(v) => setConfig((p) => ({ ...p, queueWhenAllSaturated: v }))} />
          </CardContent>
        </Card>
      </div>

      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">运维人员实时状态（缓存 {config.dataCacheSec}s）</CardTitle>
          <Button variant="outline" size="sm" onClick={() => alert('已刷新人员数据（模拟）')}>
            <RefreshCw className="size-4" />刷新
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                  <th className="pb-2 font-medium">姓名</th>
                  <th className="pb-2 font-medium">在岗</th>
                  <th className="pb-2 font-medium">在线</th>
                  <th className="pb-2 font-medium">技能标签</th>
                  <th className="pb-2 font-medium">当日工单</th>
                  <th className="pb-2 font-medium">负荷饱和度</th>
                  <th className="pb-2 font-medium">办结率</th>
                  <th className="pb-2 font-medium">GPS 上报</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_MAINTENANCE_OPERATORS.map((op) => (
                  <tr key={op.id} className="border-b border-[var(--admin-border)] last:border-0">
                    <td className="py-2.5 font-medium">{op.name}</td>
                    <td className="py-2.5">{op.onDuty ? '在岗' : '离岗'}</td>
                    <td className="py-2.5">
                      <Badge variant={op.online ? 'outline' : 'secondary'}>{op.online ? '在线' : '离线'}</Badge>
                    </td>
                    <td className="max-w-[180px] truncate py-2.5" title={op.skillTags.join('、')}>{op.skillTags.join('、')}</td>
                    <td className="py-2.5">{op.currentLoad}/{op.maxLoadThreshold}</td>
                    <td className="py-2.5">
                      <span className={op.loadSaturation! >= 100 ? 'text-[var(--admin-danger)] font-medium' : ''}>
                        {op.loadSaturation}%
                      </span>
                    </td>
                    <td className="py-2.5">{op.completionRate}%</td>
                    <td className="py-2.5 text-xs text-muted-foreground">{op.lastGpsTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--admin-border)] bg-[var(--admin-card)] px-6 py-4 shadow-[0_-4px_16px_rgba(31,41,55,0.08)] md:left-[var(--admin-sidebar-width)]">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => alert('已触发批量重调度（模拟）')}>
            <Zap className="size-4" />手动触发重调度
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfig(structuredClone(DEFAULT_AI_DISPATCH_CONFIG))}>
              <RotateCcw className="size-4" />重置
            </Button>
            <Button onClick={handleSave}>
              <Save className="size-4" />{saved ? '已保存' : '保存配置'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeightRow({ label, weights, hint }: {
  label: string
  weights: { distance: number; load: number; skill: number; performance: number }
  hint: string
}) {
  return (
    <div className="rounded-lg border border-[var(--admin-border)] p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        距离 {weights.distance}% · 负荷 {weights.load}% · 技能 {weights.skill}% · 绩效 {weights.performance}%
      </p>
    </div>
  )
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
