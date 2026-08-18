// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { departmentFormSchema } from '../schemas/department.schema'

// Mappers
import { normalizeDepartmentFormDefaults } from '../mappers/department.mapper'

// Types
import type { DepartmentEntity } from '../types/departments.types'
import type { DepartmentFormValues } from '../schemas/department.schema'

// Components
import { Button, FormDialog, Input, Label, Switch, Textarea } from '#/shared/components'

export type DepartmentFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Departamento em edição (modo edição). */
  department?: DepartmentEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit. */
  submitLabel: string
  /** Callback de submit com os valores validados. */
  onSubmit: (values: DepartmentFormValues) => void
}

/**
 * Dialog de formulário de departamento (criação/edição).
 *
 * Campos: nome (obrigatório), vagas de estacionamento (obrigatório, inteiro
 * >= 0), descrição (opcional, máx. 2000) e status (Switch ativo/inativo). Na
 * criação o Switch de status aparece desabilitado com aviso de que o
 * departamento já nasce ativo; na edição ativa/desativa via PATCH
 * (`isActive`).
 */
export function DepartmentFormDialog({
  open,
  onOpenChange,
  mode,
  department,
  isSubmitting,
  submitLabel,
  onSubmit,
}: DepartmentFormDialogProps) {
  const { t } = useTranslation('departments')

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: normalizeDepartmentFormDefaults(department),
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
          <Label htmlFor="department-name">
            {t('form.name.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="department-name"
            {...register('name')}
            aria-invalid={!!errors.name}
            placeholder={t('form.name.placeholder')}
          />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{t(errors.name.message)}</p>
          ) : null}
        </div>

        {/* Vagas */}
        <div className="space-y-2">
          <Label htmlFor="department-parking-space">
            {t('form.parkingSpace.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="department-parking-space"
            type="number"
            min={0}
            step={1}
            {...register('parkingSpace', { valueAsNumber: true })}
            aria-invalid={!!errors.parkingSpace}
            placeholder={t('form.parkingSpace.placeholder')}
          />
          {errors.parkingSpace?.message ? (
            <p className="text-destructive text-xs">{t(errors.parkingSpace.message)}</p>
          ) : null}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="department-description">{t('form.description.label')}</Label>
          <Textarea
            id="department-description"
            {...register('description')}
            aria-invalid={!!errors.description}
            rows={3}
            maxLength={2000}
            placeholder={t('form.description.placeholder')}
          />

          <div className="flex items-center justify-between">
            {errors.description?.message ? (
              <p className="text-destructive text-xs">{t(errors.description.message)}</p>
            ) : null}
            <span className="text-muted-foreground ml-auto text-xs font-medium">
              {descriptionLength}/2000
            </span>
          </div>
        </div>

        {/* Status — Switch (ativo/inativo) */}
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
                  disabled={mode === 'create'}
                  aria-label={t('form.status.label')}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {field.value ? t('status.active') : t('status.inactive')}
                  </div>
                  {mode === 'create' ? (
                    <p className="text-muted-foreground text-xs">{t('form.status.create-hint')}</p>
                  ) : null}
                </div>
              </div>
            )}
          />
        </div>

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
      </form>
    </FormDialog>
  )
}
