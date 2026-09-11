// React
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// React Hook Form
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { Eye, EyeOff, Info } from 'lucide-react'

// Schemas
import {
  buildUserEditFormSchema,
  userCreateFormSchema,
  userLinkFormSchema,
} from '../schemas/user.schema'

// Hooks
import { useEmailStatus } from '../hooks/use-email-status'

// Types
import type { UserFormValues } from '../schemas/user.schema'
import type { UserFormProps, UserTypeValue } from '../types/users.types'

// Components
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '#/shared/components'

/** Valor sentinela da opção "Sem cargo" no Select de cargo. */
const NO_ROLE = '__none__'

/**
 * Resolvers pré-construídos por schema (modo). O submit seleciona o schema
 * correto conforme o modo e o estado de vínculo (ref) — sem recriar o
 * resolver a cada render (o de edição depende do tipo atual do vínculo).
 */
const createResolver = zodResolver(userCreateFormSchema) as unknown as Resolver<UserFormValues>
const linkResolver = zodResolver(userLinkFormSchema) as unknown as Resolver<UserFormValues>

/**
 * Formulário de usuário (criação/vínculo/edição).
 *
 * Seções empilhadas: **Geral** (nome, e-mail, senha, tipo, dados opcionais e
 * status) e **Cargo** (Select único — 1 cargo por empresa). Na criação, o
 * `email-status` alterna para o modo **vincular** quando o e-mail já existe
 * (esconde dados pessoais/senha; botão "Vincular"). Na edição há a troca de
 * senha sob demanda e o cargo pode ficar vazio ("Sem cargo").
 */
export function UserForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  readOnly = false,
  mode,
  roleOptions,
  canManageAdmin,
}: UserFormProps) {
  const { t } = useTranslation('users')

  const isEdit = mode === 'edit'

  // O modo vincular (email-status) é assíncrono; o resolver lê o ref no
  // momento do submit.
  const isLinkRef = useRef(false)

  // Na edição as regras dependem do tipo atual do vínculo (promoção
  // Visitante → Colaborador exige e-mail, cargo e senha — ADR 0013).
  const editResolver = useMemo(
    () =>
      zodResolver(
        buildUserEditFormSchema(defaultValues.type),
      ) as unknown as Resolver<UserFormValues>,
    [defaultValues.type],
  )

  const userResolver: Resolver<UserFormValues> = useCallback(
    (values, context, options) => {
      const resolver = isEdit ? editResolver : isLinkRef.current ? linkResolver : createResolver
      return resolver(values, context, options)
    },
    [isEdit, editResolver],
  )

  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserFormValues>({
    resolver: userResolver,
    defaultValues,
  })

  // --- Email-status → modo vincular (apenas criação) ---
  const email = useWatch({ control, name: 'email' })
  const { exists, isChecking } = useEmailStatus(email ?? '', !isEdit && !readOnly)
  const isLink = !isEdit && exists
  isLinkRef.current = isLink

  // Campos escondidos no modo vincular não podem bloquear o submit.
  useEffect(() => {
    if (isLink) {
      clearErrors(['name', 'password', 'phone', 'document'])
    }
  }, [isLink, clearErrors])

  const roleId = watch('roleId')
  const selectedRole = roleOptions.find((role) => role.id === roleId)

  // Visitante não acessa o sistema: sem senha e sem cargo (ADR 0013).
  const type = useWatch({ control, name: 'type' }) ?? defaultValues.type
  const isVisitor = type === 'VISITOR'

  // --- Estado visual ---
  const [showPassword, setShowPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)

  /**
   * Ajusta o formulário ao trocar o tipo do vínculo (ADR 0013).
   *
   * - Visitante: limpa senha/cargo (campos escondidos — não se aplicam);
   * - Visitante → Colaborador (promoção): revela a troca de senha, que passa
   *   a ser obrigatória no aceite da promoção.
   *
   * @param next Novo tipo selecionado.
   */
  const handleTypeChange = (next: UserTypeValue) => {
    if (next === 'VISITOR') {
      setValue('password', '')
      setValue('roleId', '')
      clearErrors(['password', 'roleId'])
      return
    }

    if (isEdit && defaultValues.type === 'VISITOR') {
      setShowResetPassword(true)
    }
  }

  const effectiveSubmitLabel = isLink ? t('form.link-action') : submitLabel

  const errorText = (key?: string) =>
    key ? <p className="text-destructive text-xs">{t(key)}</p> : null

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit((values) => onSubmit(values, isLinkRef.current))}
      noValidate
    >
      {/* ---------------- Seção Geral ---------------- */}
      <section className="space-y-4">
        <div>
          <h3 className="text-foreground text-sm font-semibold">
            {t('form.sections.general.title')}
          </h3>
          <p className="text-muted-foreground text-xs">{t('form.sections.general.description')}</p>
        </div>

        <div className="space-y-4">
          {/* Nome — escondido no modo vincular */}
          {!isLink && (
            <div className="space-y-2">
              <Label htmlFor="user-name">
                {t('form.name.label')}
                <span className="text-destructive"> *</span>
              </Label>
              <Input
                id="user-name"
                {...register('name')}
                aria-invalid={!!errors.name}
                disabled={readOnly}
                placeholder={t('form.name.placeholder')}
              />
              {errorText(errors.name?.message)}
            </div>
          )}

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="user-email">
              {t('form.email.label')}
              {isVisitor && !isLink ? null : <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id="user-email"
              type="email"
              {...register('email')}
              aria-invalid={!!errors.email}
              disabled={readOnly}
              placeholder={t('form.email.placeholder')}
            />
            {isChecking ? (
              <p className="text-muted-foreground text-xs">{t('form.email.checking')}</p>
            ) : null}
            {isLink ? (
              <p className="text-xs text-amber-600">{t('form.email.already-registered')}</p>
            ) : null}
            {isVisitor && !isLink ? (
              <p className="text-muted-foreground text-xs">{t('form.email.optional-hint')}</p>
            ) : null}
            {errorText(errors.email?.message)}
          </div>

          {/* Senha — escondida no modo vincular e para Visitante */}
          {!isLink && !isVisitor && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="user-password">
                  {t('form.password.label')}
                  {!isEdit ? <span className="text-destructive"> *</span> : null}
                </Label>
                {isEdit && !showResetPassword ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetPassword(true)}
                    disabled={readOnly}
                  >
                    {t('form.reset-password.label')}
                  </Button>
                ) : null}
              </div>

              {!isEdit || showResetPassword ? (
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    aria-invalid={!!errors.password}
                    disabled={readOnly}
                    className="pr-10"
                    placeholder={
                      isEdit ? t('form.password.resetPlaceholder') : t('form.password.placeholder')
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                    aria-label={
                      showPassword
                        ? t('form.password.hidePassword')
                        : t('form.password.showPassword')
                    }
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              ) : null}

              {errorText(errors.password?.message)}
              {!isEdit ? (
                <p className="text-muted-foreground text-xs">{t('form.password.create-hint')}</p>
              ) : null}
            </div>
          )}

          {/* Tipo */}
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('form.type.label')}</Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleTypeChange(value as UserTypeValue)
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.type}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">{t('types.EMPLOYEE')}</SelectItem>
                    <SelectItem value="VISITOR">{t('types.VISITOR')}</SelectItem>
                  </SelectContent>
                </Select>
                {isVisitor ? (
                  <p className="text-muted-foreground text-xs">{t('form.visitor-hint')}</p>
                ) : null}
                {errorText(errors.type?.message)}
              </div>
            )}
          />

          {/* Dados opcionais — escondidos no modo vincular */}
          {!isLink && (
            <>
              <div className="space-y-2">
                <Label htmlFor="user-phone">{t('form.phone.label')}</Label>
                <Input
                  id="user-phone"
                  {...register('phone')}
                  aria-invalid={!!errors.phone}
                  disabled={readOnly}
                  placeholder={t('form.phone.placeholder')}
                />
                {errorText(errors.phone?.message)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-document">{t('form.document.label')}</Label>
                <Input
                  id="user-document"
                  {...register('document')}
                  aria-invalid={!!errors.document}
                  disabled={readOnly}
                  placeholder={t('form.document.placeholder')}
                />
                {errorText(errors.document?.message)}
              </div>
            </>
          )}

          {/* Status — Switch (ativo/inativo); oculto no modo vincular */}
          {!isLink && (
            <div className="space-y-2">
              <Label>{t('form.status.label')}</Label>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={readOnly || !isEdit}
                      aria-label={t('form.status.label')}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {field.value ? t('form.status.active') : t('form.status.inactive')}
                      </div>
                      {!isEdit ? (
                        <p className="text-muted-foreground text-xs">
                          {t('form.status.create-hint')}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Seção Cargo ---------------- */}
      {!isVisitor ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {t('form.sections.role.title')}
            </h3>
            <p className="text-muted-foreground text-xs">{t('form.sections.role.description')}</p>
          </div>

          <div className="space-y-2">
            <Controller
              control={control}
              name="roleId"
              render={({ field }) => {
                const value = field.value || NO_ROLE

                return (
                  <div className="space-y-2">
                    <Label>
                      {t('form.role.label')}
                      <span className="text-destructive"> *</span>
                    </Label>
                    <Select
                      value={value}
                      onValueChange={(next) => field.onChange(next === NO_ROLE ? '' : next)}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="w-full" aria-invalid={!!errors.roleId}>
                        <SelectValue placeholder={t('form.role.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {isEdit ? (
                          <SelectItem value={NO_ROLE}>{t('form.role.no-role')}</SelectItem>
                        ) : null}
                        {roleOptions.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errorText(errors.roleId?.message)}
                  </div>
                )
              }}
            />

            {selectedRole?.isAdmin ? (
              <p className="text-xs text-amber-600">{t('form.role.admin-hint')}</p>
            ) : null}

            {canManageAdmin ? (
              <p className="text-muted-foreground text-xs">{t('form.role.select-hint')}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {readOnly ? (
        <p className="text-primary flex items-center gap-1 text-sm">
          <Info />
          {t('form.read-only-hint')}
        </p>
      ) : (
        <div className="border-border flex shrink-0 flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {t('form.cancel')}
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? t('form.submitting') : effectiveSubmitLabel}
          </Button>
        </div>
      )}
    </form>
  )
}
