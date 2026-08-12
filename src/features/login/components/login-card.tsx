// React
import { useState } from 'react'

// Forms
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { GoEye, GoEyeClosed } from 'react-icons/go'

// UI
import { Button } from '#/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/shared/components/ui/card'
import { Input } from '#/shared/components/ui/input'
import { Label } from '#/shared/components/ui/label'

// Feature
import { CompanyChoiceCard } from './company-choice-card'
import { useLoginHandlers } from '../hooks/use-login-handlers'
import { loginSchema } from '../schemas/auth.schema'

// Types
import type { LoginSchema } from '../schemas/auth.schema'

/**
 * Formulário de login.
 *
 * Valida no cliente com zod (mensagens como chaves i18n), mostra erro por
 * campo e alterna entre o formulário e a escolha de empresa (multi-empresa).
 */
export function LoginCard() {
  const { t } = useTranslation('login')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const {
    handleSubmit: onLogin,
    isSubmitting,
    authError,
    companies,
    chooseCompany,
    cancelCompanyChoice,
  } = useLoginHandlers()

  // Multi-empresa: o formulário some enquanto há empresas a escolher.
  if (companies) {
    return (
      <CompanyChoiceCard
        companies={companies}
        onChoose={(companyId) => void chooseCompany(companyId)}
        onBack={cancelCompanyChoice}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('page.title')}</CardTitle>
        <CardDescription>{t('page.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onLogin)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('form.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('form.emailPlaceholder')}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email?.message && (
              <p className="text-sm text-red-500">{t(errors.email.message)}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('form.passwordLabel')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('form.passwordPlaceholder')}
                className="pr-10"
                {...register('password')}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground absolute top-1/2 right-1 -translate-y-1/2"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? t('form.hidePassword') : t('form.showPassword')}
              >
                {showPassword ? <GoEyeClosed /> : <GoEye />}
              </Button>
            </div>
            {errors.password?.message && (
              <p className="text-sm text-red-500">{t(errors.password.message)}</p>
            )}
          </div>

          {authError && <p className="text-sm text-red-500">{authError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('form.submitting') : t('form.submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
