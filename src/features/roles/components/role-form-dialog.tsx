// React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { GoInfo } from 'react-icons/go'

// Schemas
import { roleFormSchema } from '../schemas/role-form.schema'

// Mappers
import { normalizeRoleFormDefaults } from '../mappers/role.mapper'

// Types
import type { RoleEntity } from '../types/roles.types'
import type { RoleFormValues } from '../schemas/role-form.schema'

// Components
import { Button, FormDialog, Input, Label, Textarea } from '#/shared/components'

export type RoleFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Cargo em edição (modo edição). */
  role?: RoleEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit. */
  submitLabel: string
  /** Callback de submit com os valores validados. */
  onSubmit: (values: RoleFormValues) => void
}

/**
 * Dialog de formulário de cargo (criação/edição).
 *
 * Campos: nome (obrigatório) e descrição (opcional, máx. 500). Sem toggle de
 * status: o backend não aceita reativação via PATCH e cargos novos já nascem
 * ativos. Cargo do sistema (`isAdmin`) abre em modo somente leitura.
 */
export function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  role,
  isSubmitting,
  submitLabel,
  onSubmit,
}: RoleFormDialogProps) {
  const { t } = useTranslation('roles')

  const readOnly = role?.isAdmin ?? false

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: normalizeRoleFormDefaults(role),
  })

  const descriptionLength = watch('description')?.length ?? 0

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('dialog.create.title') : t('dialog.edit.title')}
      description={
        mode === 'create' ? t('dialog.create.description') : t('dialog.edit.description')
      }
      size="lg"
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="role-name">
            {t('form.name.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="role-name"
            {...register('name')}
            aria-invalid={!!errors.name}
            disabled={readOnly}
            placeholder={t('form.name.placeholder')}
          />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{t(errors.name.message)}</p>
          ) : null}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="role-description">{t('form.description.label')}</Label>
          <Textarea
            id="role-description"
            {...register('description')}
            aria-invalid={!!errors.description}
            disabled={readOnly}
            rows={3}
            maxLength={500}
            placeholder={t('form.description.placeholder')}
          />

          <div className="flex items-center justify-between">
            {errors.description?.message ? (
              <p className="text-destructive text-xs">{t(errors.description.message)}</p>
            ) : null}
            <span className="text-muted-foreground ml-auto text-xs font-medium">
              {descriptionLength}/500
            </span>
          </div>
        </div>

        {readOnly ? (
          <p className="text-primary flex items-center gap-1 text-sm">
            <GoInfo />
            {t('form.read-only-hint')}
          </p>
        ) : (
          <div className="border-border flex shrink-0 flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? t('form.submitting') : submitLabel}
            </Button>
          </div>
        )}
      </form>
    </FormDialog>
  )
}
