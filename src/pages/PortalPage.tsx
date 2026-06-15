import { Link } from 'react-router-dom'
import { BatteryCharging, Monitor, Smartphone } from 'lucide-react'

import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PortalPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">
      <div className="mb-8 text-center">
        <BatteryCharging className="mx-auto mb-4 size-12 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">智充云 SaaS</h1>
        <p className="mt-2 text-slate-400">智能充电桩产品前端原型</p>
      </div>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        <Card className="border-blue-800/50 bg-slate-900/80 text-white backdrop-blur">
          <CardHeader>
            <Monitor className="mb-2 size-8 text-blue-400" />
            <CardTitle>运营商后台</CardTitle>
            <CardDescription className="text-slate-400">
              PC 管理端 · 浅色 SaaS 控制台风格
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link to={ROUTES.ADMIN.LOGIN}>进入管理后台</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-800/30 bg-white/95 backdrop-blur">
          <CardHeader>
            <Smartphone className="mb-2 size-8 text-green-600" />
            <CardTitle>车主 H5</CardTitle>
            <CardDescription>
              移动端 · 浅色新能源简约风
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
              <Link to={ROUTES.MOBILE.HOME}>进入车主端</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-xs text-slate-500">前端可视化原型 · Mock 数据驱动 · 无需后端</p>
    </div>
  )
}
