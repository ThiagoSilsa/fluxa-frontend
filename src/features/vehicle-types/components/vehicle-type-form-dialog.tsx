// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { vehicleTypeFormSchema } from '../schemas/vehicle-type.schema'

// Mappers
import { normalizeVehicleTypeFormDefaults } from '../mappers/vehicle-type.mapper'

// Types
import type { VehicleTypeEntity } from '../types/vehicle-types.types'
import type { VehicleTypeFormValues } from '../schemas/vehicle-type.schema'

// Components
import { Button, FormDialog, Input, Label, Switch, Textarea } from '#/shared/components'

export type VehicleTypeFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Tipo em edição (modo edição). */
  vehicleType?: VehicleTypeEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit. */
  submitLabel: string
  /** Callback de submit com os valores validados. */
  onSubmit: (values: VehicleTypeFormValues) => void
}

/**
 * Dialog de formulário de tipo de veículo (criação/edição).
 *
 * Campos: código (obrigatório, normalizado), nome (obrigatório), descrição
 * (opcional, máx. 2000), classificação de frota (Switch) e status (Switch
 * ativo/inativo). Na criação o Switch de status aparece desabilitado com aviso
 * de que o tipo já nasce ativo; na edição ativa/desativa via PATCH
 * (`isActive`).
 */
export function VehicleTypeFormDialog({
  open,
  onOpenChange,
  mode,
  vehicleType,
  isSubmitting,
  submitLabel,
  onSubmit,
}: VehicleTypeFormDialogProps) {
  const { t } = useTranslation('vehicleTypes')

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<VehicleTypeFormValues>({
    resolver: zodResolver(vehicleTypeFormSchema),
    defaultValues: normalizeVehicleTypeFormDefaults(vehicleType),
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
        {/* Código */}
        <div className="space-y-2">
          <Label htmlFor="vehicle-type-code">
            {t('form.code.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="vehicle-type-code"
            {...register('code')}
            aria-invalid={!!errors.code}
            placeholder={t('form.code.placeholder')}
            className="uppercase"
          />
          {errors.code?.message ? (
            <p className="text-destructive text-xs">{t(errors.code.message)}</p>
          ) : null}
        </div>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="vehicle-type-name">
            {t('form.name.label')}
            <span className="text-destructive"> *</span>
          </Label>
          <Input
            id="vehicle-type-name"
            {...register('name')}
            aria-invalid={!!errors.name}
            placeholder={t('form.name.placeholder')}
          />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{t(errors.name.message)}</p>
          ) : null}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="vehicle-type-description">{t('form.description.label')}</Label>
          <Textarea
            id="vehicle-type-description"
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

        {/* Classificação de frota — Switch */}
        <div className="space-y-2">
          <Label>{t('form.isFleet.label')}</Label>
          <Controller
            control={control}
            name="isFleet"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label={t('form.isFleet.label')}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {field.value ? t('fleet.true') : t('fleet.false')}
                  </div>
                  <p className="text-muted-foreground text-xs">{t('form.isFleet.description')}</p>
                </div>
              </div>
            )}
          />
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
