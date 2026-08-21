// React
import { useEffect } from 'react'

// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Schemas
import { vehicleFormSchema } from '../schemas/vehicle.schema'

// Mappers
import { normalizeVehicleFormDefaults } from '../mappers/vehicle.mapper'

// Hooks
import { useVehicleDetailQuery } from '../hooks/use-vehicle-detail-query'

// Types
import type { VehicleEntity, VehicleParameterOption } from '../types/vehicles.types'
import type { VehicleFormValues } from '../schemas/vehicle.schema'

// Components
import {
  Button,
  FormDialog,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '#/shared/components'

export type VehicleFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Veículo em edição (modo edição). */
  vehicle?: VehicleEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit. */
  submitLabel: string
  /** Tipos de veículo ativos (do `parameters` da listagem). */
  typeOptions: VehicleParameterOption[]
  /** Departamentos ativos (do `parameters` da listagem). */
  departmentOptions: VehicleParameterOption[]
  /** Se o ator pode conceder livre acesso (GRANT_FREE_PASS ou admin). */
  canGrantFreePass: boolean
  /** Reporta o departamento atual do veículo (carregado no modo edição). */
  onCurrentDepartmentChange?: (departmentId: string) => void
  /** Callback de submit com os valores validados. */
  onSubmit: (values: VehicleFormValues) => void
}

/**
 * Dialog de formulário de veículo (criação/edição).
 *
 * Campos: placa (obrigatória, formato BR validado), tipo (obrigatório),
 * departamento padrão (opcional), modelo, cor, observação, livre acesso
 * (Switch — desabilitado sem `GRANT_FREE_PASS`) e status (Switch
 * ativo/inativo, desabilitado na criação).
 */
export function VehicleFormDialog({
  open,
  onOpenChange,
  mode,
  vehicle,
  isSubmitting,
  submitLabel,
  typeOptions,
  departmentOptions,
  canGrantFreePass,
  onCurrentDepartmentChange,
  onSubmit,
}: VehicleFormDialogProps) {
  const { t } = useTranslation('vehicles')

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: normalizeVehicleFormDefaults(vehicle),
  })

  const observationLength = watch('observation')?.length ?? 0

  // No modo edição, carrega o departamento atual para pré-selecionar o Select
  // e reportar ao handler (diff do vínculo no submit).
  const detailQuery = useVehicleDetailQuery(mode === 'edit' && vehicle ? vehicle.id : null)

  useEffect(() => {
    if (mode === 'edit' && detailQuery.data) {
      const departmentId = detailQuery.data.department?.id ?? ''
      setValue('departmentId', departmentId, { shouldDirty: false })
      onCurrentDepartmentChange?.(departmentId)
    }
  }, [mode, detailQuery.data, onCurrentDepartmentChange, setValue])

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('dialog.create.title') : t('dialog.edit.title')}
      description={
        mode === 'create' ? t('dialog.create.description') : t('dialog.edit.description')
      }
      size="xl"
      fixedHeight
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Placa */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-plate">
              {t('form.plate.label')}
              <span className="text-destructive"> *</span>
            </Label>
            <Input
              id="vehicle-plate"
              {...register('plate')}
              aria-invalid={!!errors.plate}
              placeholder={t('form.plate.placeholder')}
              className="uppercase"
            />
            {errors.plate?.message ? (
              <p className="text-destructive text-xs">{t(errors.plate.message)}</p>
            ) : null}
          </div>

          {/* Modelo */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-model">{t('form.model.label')}</Label>
            <Input
              id="vehicle-model"
              {...register('model')}
              aria-invalid={!!errors.model}
              placeholder={t('form.model.placeholder')}
            />
            {errors.model?.message ? (
              <p className="text-destructive text-xs">{t(errors.model.message)}</p>
            ) : null}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-type">
              {t('form.type.label')}
              <span className="text-destructive"> *</span>
            </Label>
            <Controller
              control={control}
              name="vehicleTypeId"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value)
                    setValue('vehicleTypeId', value, { shouldDirty: true })
                  }}
                >
                  <SelectTrigger
                    id="vehicle-type"
                    aria-invalid={!!errors.vehicleTypeId}
                    className="w-full"
                  >
                    <SelectValue placeholder={t('form.type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {typeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicleTypeId?.message ? (
              <p className="text-destructive text-xs">{t(errors.vehicleTypeId.message)}</p>
            ) : null}
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-color">{t('form.color.label')}</Label>
            <Input
              id="vehicle-color"
              {...register('color')}
              aria-invalid={!!errors.color}
              placeholder={t('form.color.placeholder')}
            />
            {errors.color?.message ? (
              <p className="text-destructive text-xs">{t(errors.color.message)}</p>
            ) : null}
          </div>
        </div>

        {/* Departamento padrão */}
        <div className="space-y-2">
          <Label htmlFor="vehicle-department">{t('form.department.label')}</Label>
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => field.onChange(value ?? '')}
              >
                <SelectTrigger id="vehicle-department" className="w-full">
                  <SelectValue placeholder={t('form.department.placeholder')} />
                </SelectTrigger>
                <SelectContent position="popper">
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-muted-foreground text-xs">{t('form.department.hint')}</p>
        </div>

        {/* Observação */}
        <div className="space-y-2">
          <Label htmlFor="vehicle-observation">{t('form.observation.label')}</Label>
          <Textarea
            id="vehicle-observation"
            {...register('observation')}
            aria-invalid={!!errors.observation}
            rows={3}
            maxLength={2000}
            placeholder={t('form.observation.placeholder')}
          />
          <div className="flex items-center justify-between">
            {errors.observation?.message ? (
              <p className="text-destructive text-xs">{t(errors.observation.message)}</p>
            ) : null}
            <span className="text-muted-foreground ml-auto text-xs font-medium">
              {observationLength}/2000
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Livre acesso — Switch */}
          <div className="space-y-2">
            <Label>{t('form.freePass.label')}</Label>
            <Controller
              control={control}
              name="freePass"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={!canGrantFreePass}
                    aria-label={t('form.freePass.label')}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {field.value ? t('freePass.yes') : t('freePass.no')}
                    </div>
                    {!canGrantFreePass ? (
                      <p className="text-muted-foreground text-xs">
                        {t('form.freePass.no-permission')}
                      </p>
                    ) : null}
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
                      <p className="text-muted-foreground text-xs">
                        {t('form.status.create-hint')}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            />
          </div>
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
