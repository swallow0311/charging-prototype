import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ScanLine } from 'lucide-react'

import { MobileSubHeader } from '@/components/mobile/MobileSubHeader'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

type ScanPhase = 'scanning' | 'success'

export function MobileScanPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<ScanPhase>('scanning')

  useEffect(() => {
    const timer = setTimeout(() => setPhase('success'), 2800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      <MobileSubHeader title="扫一扫" backTo={ROUTES.MOBILE.HOME} className="border-white/10 bg-black/80 text-white" />

      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        <div className="relative size-64 overflow-hidden rounded-2xl border-2 border-white/30">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          {/* 四角扫描框 */}
          <div className="absolute top-3 left-3 size-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute top-3 right-3 size-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 size-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 size-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

          {phase === 'scanning' ? (
            <>
              <div className="absolute inset-x-4 h-0.5 animate-[scan_2s_ease-in-out_infinite] bg-primary shadow-[0_0_12px_var(--primary)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanLine className="size-12 text-white/20" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <CheckCircle2 className="size-16 text-primary" />
              <p className="mt-3 font-medium">识别成功</p>
              <p className="mt-1 text-sm text-white/70">A区-01号桩 · 科技园超级充电站</p>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-white/70">
          {phase === 'scanning' ? '将二维码放入框内，即可自动扫描' : '充电桩已识别，可以开始充电'}
        </p>

        {phase === 'success' ? (
          <Button
            className="mt-6 h-12 w-full max-w-xs rounded-xl"
            onClick={() => navigate(ROUTES.MOBILE.CHARGING)}
          >
            开始充电
          </Button>
        ) : (
          <Button
            variant="outline"
            className="mt-6 border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={() => setPhase('success')}
          >
            模拟扫描成功
          </Button>
        )}
      </div>
    </div>
  )
}
