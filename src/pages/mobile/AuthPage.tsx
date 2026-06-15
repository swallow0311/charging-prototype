import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BatteryCharging, MapPin, ShieldCheck } from 'lucide-react'

import { APP_BRAND_NAME } from '@/mocks/mobile-data'
import { useMobileStore } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import type { MobileAuthState } from '@/types'

export function MobileAuthPage() {
  const navigate = useNavigate()
  const { authorize } = useMobileStore()
  const [auth, setAuth] = useState<MobileAuthState>({
    locationGranted: false,
    notificationGranted: false,
    agreementAccepted: false,
  })

  const canProceed = auth.locationGranted && auth.notificationGranted && auth.agreementAccepted

  const handleConfirm = () => {
    authorize()
    navigate(ROUTES.MOBILE.HOME, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col p-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
          <BatteryCharging className="size-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">欢迎使用{APP_BRAND_NAME}</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          首次使用需授权以下权限，以便为您提供附近场站、充电提醒等服务
        </p>

        <Card className="mobile-block mt-8 w-full">
          <CardContent className="space-y-5 p-4">
            <AuthItem
              icon={MapPin}
              title="位置信息"
              description="用于查找附近充电场站"
              checked={auth.locationGranted}
              onCheckedChange={(v) => setAuth((a) => ({ ...a, locationGranted: v }))}
            />
            <AuthItem
              icon={Bell}
              title="消息通知"
              description="充电完成、预约到期等提醒"
              checked={auth.notificationGranted}
              onCheckedChange={(v) => setAuth((a) => ({ ...a, notificationGranted: v }))}
            />
            <AuthItem
              icon={ShieldCheck}
              title="用户协议"
              description="我已阅读并同意《用户服务协议》和《隐私政策》"
              checked={auth.agreementAccepted}
              onCheckedChange={(v) => setAuth((a) => ({ ...a, agreementAccepted: v }))}
            />
          </CardContent>
        </Card>
      </div>

      <Button className="h-12 w-full rounded-xl" disabled={!canProceed} onClick={handleConfirm}>
        同意并进入
      </Button>
    </div>
  )
}

interface AuthItemProps {
  icon: typeof MapPin
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function AuthItem({ icon: Icon, title, description, checked, onCheckedChange }: AuthItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
