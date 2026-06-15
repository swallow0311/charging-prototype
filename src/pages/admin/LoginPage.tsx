import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BatteryCharging } from 'lucide-react'

import { useAuth } from '@/mocks/hooks'
import { MOCK_USERS } from '@/mocks/admin-data'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const name = username.trim()
    if (!name) {
      setError('请输入用户名')
      return
    }
    const matched = MOCK_USERS.find((u) => u.username === name)
    const user = matched ?? MOCK_USERS[0]
    login(user.username, user.role, user.displayName)
    navigate(ROUTES.ADMIN.DASHBOARD)
  }

  return (
    <div className="theme-admin flex min-h-dvh items-center justify-center bg-[var(--admin-bg)] p-6">
      <Card className="admin-card w-full max-w-md border shadow-none">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-md bg-[var(--admin-selected-bg)]">
            <BatteryCharging className="size-7 text-[var(--admin-primary)]" />
          </div>
          <CardTitle className="text-xl font-semibold text-[var(--admin-text-title)]">智充云 SaaS</CardTitle>
          <CardDescription className="text-[var(--admin-text-muted)]">智能充电桩运营商管理平台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--admin-text-body)]">用户名</Label>
              <Input
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="border-[var(--admin-border)] bg-[var(--admin-card)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--admin-text-body)]">密码</Label>
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="border-[var(--admin-border)] bg-[var(--admin-card)]"
              />
            </div>
            {error ? <p className="text-sm text-[var(--admin-danger)]">{error}</p> : null}
            <Button
              type="submit"
              className="h-10 w-full bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)] active:bg-[var(--admin-primary-active)]"
            >
              登录
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-[var(--admin-text-muted)]">
            演示账号：admin / property / operator（任意密码）
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
