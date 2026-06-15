import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { MobileSubHeader } from '@/components/mobile/MobileSubHeader'
import { getBackPath, useMobileStore, type MobileNavState } from '@/mocks/mobile-store'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { InvoiceProfile, MobileUserProfile } from '@/types'

export function MobileProfileEditPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const backTo = getBackPath(location.state, ROUTES.MOBILE.PROFILE)
  const { user, invoiceProfile, updateUserProfile, updateInvoiceProfile } = useMobileStore()

  const [profile, setProfile] = useState<MobileUserProfile>(user)
  const [invoice, setInvoice] = useState<InvoiceProfile>(invoiceProfile)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateUserProfile(profile)
    updateInvoiceProfile(invoice)
    setSaved(true)
    setTimeout(() => {
      navigate(backTo, { state: { tab: (location.state as MobileNavState)?.tab } })
    }, 600)
  }

  return (
    <div className="pb-6">
      <MobileSubHeader title="个人信息" backTo={backTo} />

      <div className="p-4">
        <Tabs defaultValue="personal">
          <TabsList variant="line" className="mobile-tabs-list grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="mobile-tabs-trigger">基本信息</TabsTrigger>
            <TabsTrigger value="invoice" className="mobile-tabs-trigger">开票信息</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mobile-stack mt-6">
            <Card className="mobile-block">
              <CardContent className="space-y-4 p-4">
                <Field label="姓名" value={profile.displayName} onChange={(v) => setProfile({ ...profile, displayName: v })} />
                <Field label="手机号" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <Field label="邮箱" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                <Field label="所在城市" value={profile.city} onChange={(v) => setProfile({ ...profile, city: v })} />
                <div className="space-y-2">
                  <Label>性别</Label>
                  <Select value={profile.gender} onValueChange={(v) => setProfile({ ...profile, gender: v as MobileUserProfile['gender'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">男</SelectItem>
                      <SelectItem value="female">女</SelectItem>
                      <SelectItem value="unknown">不愿透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoice" className="mobile-stack mt-6">
            <Card className="mobile-block">
              <CardContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label>抬头类型</Label>
                  <Select value={invoice.titleType} onValueChange={(v) => setInvoice({ ...invoice, titleType: v as InvoiceProfile['titleType'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">个人</SelectItem>
                      <SelectItem value="company">企业</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="发票抬头" value={invoice.title} onChange={(v) => setInvoice({ ...invoice, title: v })} />
                {invoice.titleType === 'company' ? (
                  <>
                    <Field label="税号" value={invoice.taxNumber ?? ''} onChange={(v) => setInvoice({ ...invoice, taxNumber: v })} />
                    <Field label="注册地址" value={invoice.address ?? ''} onChange={(v) => setInvoice({ ...invoice, address: v })} />
                    <Field label="开户银行" value={invoice.bankName ?? ''} onChange={(v) => setInvoice({ ...invoice, bankName: v })} />
                    <Field label="银行账号" value={invoice.bankAccount ?? ''} onChange={(v) => setInvoice({ ...invoice, bankAccount: v })} />
                  </>
                ) : null}
                <Field label="收票邮箱" value={invoice.email} onChange={(v) => setInvoice({ ...invoice, email: v })} />
                <Field label="收票手机" value={invoice.phone} onChange={(v) => setInvoice({ ...invoice, phone: v })} />
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">开票信息将用于充电订单的电子发票开具，请确保信息准确。</p>
          </TabsContent>
        </Tabs>

        <Button className="mt-6 h-12 w-full rounded-xl" onClick={handleSave}>
          {saved ? '已保存' : '保存修改'}
        </Button>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function Field({ label, value, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
